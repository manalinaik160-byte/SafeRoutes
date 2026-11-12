"""
SafeRoute - REST API Route Handlers (routes.py)
-----------------------------------------------
Purpose:
  Defines REST API endpoints for SafeRoute:
    - GET  /api/health
    - GET  /api/metadata
    - GET  /api/incidents
    - GET  /api/hotspots
    - GET  /api/ml/evaluation
    - GET  /api/presets
    - POST /api/routes/compare

Why Required:
  Exposes backend geospatial intelligence, K-Means clustering,
  Random Forest evaluation, and route comparison services to the
  React frontend and external evaluation clients.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, List

from database import get_dataset_metadata, get_all_incidents
from data_processor import (
    associate_incidents_with_route,
    compute_route_data_coverage,
    parse_departure_time_window,
    is_coordinate_in_study_area,
    STUDY_AREA_METADATA
)
from routing_service import get_candidate_routes
from risk_engine import compute_route_risk, rank_and_categorize_routes

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Global reference variables populated by app.py on startup
hotspot_clusterer = None
random_forest_model = None


def init_ml_context(clusterer_instance, rf_instance):
    """Binds initialized machine learning instances to API route handlers."""
    global hotspot_clusterer, random_forest_model
    hotspot_clusterer = clusterer_instance
    random_forest_model = rf_instance


@api_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify backend operational readiness.
    """
    return jsonify({
        "status": "healthy",
        "app": "SafeRoute - Explainable & Time-Aware Route Recommendation System",
        "version": "1.0.0",
        "ml_status": {
            "kmeans_clusters_loaded": len(hotspot_clusterer.clusters) if hotspot_clusterer else 0,
            "random_forest_trained": random_forest_model.is_trained if random_forest_model else False
        },
        "study_area": STUDY_AREA_METADATA["coverage_area"]
    }), 200


@api_bp.route("/metadata", methods=["GET"])
def get_metadata():
    """
    Returns dataset provenance, coverage boundaries, and documented limitations.
    Requirement from plan.md Section 18.
    """
    meta = get_dataset_metadata() or STUDY_AREA_METADATA
    return jsonify({
        "success": True,
        "dataset": meta
    }), 200


@api_bp.route("/incidents", methods=["GET"])
def list_incidents():
    """
    Retrieves permitted historical incident records for map visualization.
    Supports 'limit' and 'time_of_day' query parameters.
    """
    limit = request.args.get("limit", default=400, type=int)
    limit = max(10, min(2000, limit))
    time_of_day = request.args.get("time_of_day", default=None, type=str)

    incidents = get_all_incidents(limit=limit, time_of_day=time_of_day)
    return jsonify({
        "success": True,
        "count": len(incidents),
        "incidents": incidents
    }), 200


@api_bp.route("/hotspots", methods=["GET"])
def get_hotspots():
    """
    Returns K-Means geographical crime incident clusters for Leaflet map overlay.
    """
    clusters = hotspot_clusterer.clusters if hotspot_clusterer else []
    return jsonify({
        "success": True,
        "count": len(clusters),
        "clusters": clusters,
        "evaluation_metrics": hotspot_clusterer.evaluation_metrics if hotspot_clusterer else {}
    }), 200


@api_bp.route("/ml/evaluation", methods=["GET"])
def get_ml_evaluation():
    """
    Returns Random Forest evaluation metrics, precision/recall per class,
    confusion matrix, and feature importances to demonstrate academic rigor.
    """
    if not random_forest_model or not random_forest_model.is_trained:
        return jsonify({
            "success": False,
            "message": "Random Forest model is not yet trained or unavailable."
        }), 503

    return jsonify({
        "success": True,
        "model_name": "RandomForestClassifier (Ensemble 50 Trees)",
        "metrics": random_forest_model.metrics
    }), 200


@api_bp.route("/presets", methods=["GET"])
def get_presets():
    """
    Returns recommended origin-destination presets within the documented study area
    for rapid, one-click demonstration and evaluation.
    """
    presets = [
        {
            "id": "preset_1",
            "name": "Covent Garden to Bank Financial District",
            "description": "Cross-city transit traversing West End entertainment and City financial hub.",
            "origin": {"lat": 51.5118, "lon": -0.1235, "name": "Covent Garden Station"},
            "destination": {"lat": 51.5133, "lon": -0.0886, "name": "Bank Station / Financial Hub"}
        },
        {
            "id": "preset_2",
            "name": "St Paul's Cathedral to Shoreditch High St",
            "description": "Historic center towards northeastern nightlife corridor.",
            "origin": {"lat": 51.5138, "lon": -0.0984, "name": "St Paul's Cathedral"},
            "destination": {"lat": 51.5235, "lon": -0.0775, "name": "Shoreditch High Street"}
        },
        {
            "id": "preset_3",
            "name": "Waterloo Station to Holborn Viaduct",
            "description": "South bank pedestrian Thames crossing to central legal quarter.",
            "origin": {"lat": 51.5032, "lon": -0.1123, "name": "Waterloo Station"},
            "destination": {"lat": 51.5175, "lon": -0.1030, "name": "Holborn Viaduct"}
        }
    ]
    return jsonify({"success": True, "presets": presets}), 200


@api_bp.route("/routes/compare", methods=["POST"])
def compare_routes():
    """
    Core Route Comparison Endpoint (plan.md Section 18).
    
    Accepts:
      {
        "origin": {"lat": float, "lon": float},
        "destination": {"lat": float, "lon": float},
        "travel_mode": "walking" | "driving",
        "departure_time": "HH:MM" (optional),
        "weights": {"alpha": float, "beta": float, "gamma": float} (optional)
      }

    Returns:
      Comparative analysis of Shortest, Lower-Estimated-Risk, and Balanced routes.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid request. JSON body is required."}), 400

    origin = data.get("origin")
    destination = data.get("destination")

    # 1. Input Validation
    if not origin or not isinstance(origin, dict) or "lat" not in origin or "lon" not in origin:
        return jsonify({"success": False, "error": "Valid origin coordinate object {'lat', 'lon'} is required."}), 400

    if not destination or not isinstance(destination, dict) or "lat" not in destination or "lon" not in destination:
        return jsonify({"success": False, "error": "Valid destination coordinate object {'lat', 'lon'} is required."}), 400

    try:
        orig_lat, orig_lon = float(origin["lat"]), float(origin["lon"])
        dest_lat, dest_lon = float(destination["lat"]), float(destination["lon"])
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Coordinates must be valid numeric floating-point numbers."}), 400

    # Ensure latitude and longitude bounds [-90, 90], [-180, 180]
    if not (-90.0 <= orig_lat <= 90.0 and -180.0 <= orig_lon <= 180.0):
        return jsonify({"success": False, "error": "Origin coordinates exceed planetary bounds."}), 400
    if not (-90.0 <= dest_lat <= 90.0 and -180.0 <= dest_lon <= 180.0):
        return jsonify({"success": False, "error": "Destination coordinates exceed planetary bounds."}), 400

    # Edge Case: Origin identical to Destination
    if round(orig_lat, 5) == round(dest_lat, 5) and round(orig_lon, 5) == round(dest_lon, 5):
        return jsonify({"success": False, "error": "Origin and destination coordinates must be distinct."}), 400

    travel_mode = data.get("travel_mode", "walking")
    departure_time = data.get("departure_time")
    time_window = parse_departure_time_window(departure_time)
    trade_off_weights = data.get("weights")

    # 2. Candidate Route Generation via OSRM / Fallback
    origin_dict = {"lat": orig_lat, "lon": orig_lon}
    dest_dict = {"lat": dest_lat, "lon": dest_lon}
    candidate_paths = get_candidate_routes(origin_dict, dest_dict, travel_mode=travel_mode)

    if not candidate_paths:
        return jsonify({
            "success": False,
            "error": "Routing service failed to discover any viable path between the specified coordinates."
        }), 502

    # 3. Retrieve Historical Incidents from Database
    all_incidents = get_all_incidents(limit=1500)

    # 4. Process Geospatial Association & Risk Scoring for Each Candidate
    evaluated_candidates = []
    for candidate in candidate_paths:
        coords = candidate["coordinates"]
        
        # Calculate coverage and confidence
        coverage = compute_route_data_coverage(coords)

        # Spatially associate crime incidents within 80m buffer
        matched = associate_incidents_with_route(
            coordinates=coords,
            incidents=all_incidents,
            buffer_meters=80.0,
            time_of_day_filter=time_window
        )

        # Calculate explainable risk score
        risk_evaluation = compute_route_risk(
            route_geometry=coords,
            matched_data=matched,
            coverage_info=coverage,
            hotspot_clusterer=hotspot_clusterer,
            departure_time_window=time_window
        )

        # Combine routing and risk outputs
        combined = {
            "route_id": candidate["route_id"],
            "name": candidate["name"],
            "distance_km": candidate["distance_km"],
            "duration_min": candidate["duration_min"],
            "provider": candidate["provider"],
            "is_simulated": candidate["is_simulated"],
            "coordinates": coords,
            "risk_score": risk_evaluation["risk_score"],
            "risk_level": risk_evaluation["risk_level"],
            "risk_label": risk_evaluation["risk_label"],
            "badge_color": risk_evaluation["badge_color"],
            "total_incidents": risk_evaluation["total_incidents"],
            "incident_density_per_km": risk_evaluation["incident_density_per_km"],
            "nearest_hotspot_dist_km": risk_evaluation["nearest_hotspot_dist_km"],
            "risk_factors": risk_evaluation["risk_factors"],
            "score_components": risk_evaluation["score_components"],
            "data_coverage": risk_evaluation["data_coverage"],
            "segment_evaluations": risk_evaluation["segment_evaluations"],
            "notice": risk_evaluation["notice"]
        }
        evaluated_candidates.append(combined)

    # 5. Multi-Objective Ranking (Shortest vs Lower-Risk vs Balanced)
    ranked_routes = rank_and_categorize_routes(evaluated_candidates, trade_off_weights)

    # Retrieve dataset metadata for response transparency
    meta = get_dataset_metadata() or STUDY_AREA_METADATA

    return jsonify({
        "success": True,
        "travel_mode": travel_mode,
        "departure_time": departure_time,
        "time_of_day_window": time_window,
        "total_alternatives": len(ranked_routes),
        "routes": ranked_routes,
        "dataset": {
            "source": meta["dataset_name"],
            "source_url": meta["source_url"],
            "coverage_area": meta["coverage_area"],
            "reporting_period": f"{meta['start_date']} to {meta['end_date']}",
            "limitations": meta["limitations"]
        }
    }), 200

