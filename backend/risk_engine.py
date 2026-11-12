"""
SafeRoute - Risk Assessment & Explainability Engine (risk_engine.py)
-------------------------------------------------------------------
Purpose:
  1. Computes segment-level and length-weighted route-level relative historical risk scores.
  2. Implements the multi-objective optimization function J to identify Balanced routes.
  3. Provides factor-by-factor explainability (frequency, severity, temporal, hotspot proximity).
  4. Manages route comparison between Shortest, Lower-Estimated-Risk, and Balanced alternatives.

Mathematical Foundations (plan.md Section 10):
  Segment Score:
    R_i = 100 * (w_c * C_i + w_s * S_i + w_t * T_i)
    - C_i: Normalized incident density (incidents per km)
    - S_i: Normalized mean severity indicator (severity / 3.0)
    - T_i: Time-of-day temporal alignment factor
    - w_c = 0.45, w_s = 0.35, w_t = 0.20 (sum = 1.0)

  Route Score:
    R_route = sum(d_i * R_i) / sum(d_i)

  Balanced Objective Function:
    J = alpha * (D / D_ref) + beta * (T / T_ref) + gamma * (R / 100)
    - alpha = 0.35 (distance weight)
    - beta  = 0.25 (travel time weight)
    - gamma = 0.40 (relative risk weight)
"""

from typing import List, Dict, Any, Optional
import math


# Documented default scoring weights
DEFAULT_WEIGHTS = {
    "w_frequency": 0.45,
    "w_severity": 0.35,
    "w_time": 0.20
}

# Documented multi-objective trade-off weights
BALANCED_WEIGHTS = {
    "alpha": 0.35,  # Distance trade-off weight
    "beta": 0.25,   # Travel time trade-off weight
    "gamma": 0.40   # Risk score trade-off weight
}


def compute_segment_risk(
    incident_count: int,
    severity_sum: float,
    length_meters: float,
    time_of_day_incident_count: int,
    total_time_incidents: int,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Computes explainable relative historical risk for a single road segment i.
    """
    w = weights or DEFAULT_WEIGHTS
    w_c = w["w_frequency"]
    w_s = w["w_severity"]
    w_t = w["w_time"]

    length_km = max(0.02, length_meters / 1000.0)

    # 1. Normalized Frequency C_i:
    # Scale: 10 incidents per km is calibrated as full saturation (1.0)
    density = incident_count / length_km
    c_norm = min(1.0, density / 10.0)

    # 2. Normalized Severity S_i:
    # Range is 1 to 3; normalized to [0, 1]
    if incident_count > 0:
        mean_sev = severity_sum / incident_count
        s_norm = min(1.0, max(0.0, (mean_sev - 1.0) / 2.0))
    else:
        mean_sev = 1.0
        s_norm = 0.0

    # 3. Time-of-day Factor T_i:
    # If incidents matching selected time window are concentrated here, elevate temporal factor
    if incident_count > 0 and total_time_incidents > 0:
        temporal_ratio = time_of_day_incident_count / incident_count
        t_norm = min(1.0, temporal_ratio * 1.25)
    else:
        t_norm = 0.2  # Nominal baseline weight

    # Composite segment score R_i in [0, 100]
    segment_score = 100.0 * (w_c * c_norm + w_s * s_norm + w_t * t_norm)
    segment_score = round(max(0.0, min(100.0, segment_score)), 1)

    return {
        "score": segment_score,
        "incident_count": incident_count,
        "density_per_km": round(density, 2),
        "mean_severity": round(mean_sev, 2),
        "c_norm": round(c_norm, 3),
        "s_norm": round(s_norm, 3),
        "t_norm": round(t_norm, 3)
    }


def compute_route_risk(
    route_geometry: List[List[float]],
    matched_data: Dict[str, Any],
    coverage_info: Dict[str, Any],
    hotspot_clusterer: Any,
    departure_time_window: Optional[str] = None,
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Computes overall route score using length-weighted segment aggregation,
    determines risk tier, and generates detailed factor-by-factor explanations.
    """
    w = weights or DEFAULT_WEIGHTS
    segment_stats = matched_data.get("segment_stats", [])
    matched_incidents = matched_data.get("matched_incidents", [])

    total_route_length_m = 0.0
    weighted_score_sum = 0.0
    segment_evaluations = []

    time_window = departure_time_window or "day"
    total_time_incidents = sum(
        1 for inc in matched_incidents if inc.get("time_of_day") == time_window
    )

    for seg in segment_stats:
        seg_len = seg.get("length_meters", 50.0)
        inc_count = seg.get("incident_count", 0)
        sev_sum = seg.get("severity_sum", 0.0)

        # Count incidents in segment matching current time window
        time_count = 0
        if inc_count > 0:
            # Approximation from overall temporal proportion
            prop = total_time_incidents / max(1, len(matched_incidents))
            time_count = int(round(inc_count * prop))

        seg_eval = compute_segment_risk(
            inc_count, sev_sum, seg_len, time_count, total_time_incidents, w
        )
        seg_eval["start"] = seg["start"]
        seg_eval["end"] = seg["end"]
        seg_eval["length_meters"] = seg_len
        segment_evaluations.append(seg_eval)

        total_route_length_m += seg_len
        weighted_score_sum += (seg_len * seg_eval["score"])

    # Aggregate route-level score
    if total_route_length_m > 0:
        route_score = round(weighted_score_sum / total_route_length_m, 1)
    else:
        route_score = 30.0

    # Categorize risk level
    if route_score < 35.0:
        risk_level = "lower_estimated_risk"
        risk_label = "Lower Historical Risk"
        badge_color = "emerald"
    elif route_score < 65.0:
        risk_level = "moderate_estimated_risk"
        risk_label = "Moderate Historical Risk"
        badge_color = "amber"
    else:
        risk_level = "higher_estimated_risk"
        risk_label = "Higher Historical Risk"
        badge_color = "rose"

    # Nearest hotspot calculation
    mid_idx = len(route_geometry) // 2 if route_geometry else 0
    mid_point = route_geometry[mid_idx] if route_geometry else [51.51, -0.10]
    min_hotspot_km, nearest_hotspot = hotspot_clusterer.get_distance_to_nearest_hotspot(
        mid_point[0], mid_point[1]
    )

    # Generate explainable risk factors
    total_inc = len(matched_incidents)
    sev_counts = matched_data.get("severity_breakdown", {})
    route_len_km = max(0.1, total_route_length_m / 1000.0)
    density_per_km = round(total_inc / route_len_km, 1)

    factors = []
    # Frequency factor
    if total_inc == 0:
        factors.append(f"No recorded incidents along road corridor within 80m buffer ({density_per_km} incidents/km).")
    elif density_per_km < 3.0:
        factors.append(f"Low recorded incident frequency: {total_inc} incidents along corridor ({density_per_km} per km).")
    elif density_per_km < 7.0:
        factors.append(f"Moderate recorded incident frequency: {total_inc} incidents along corridor ({density_per_km} per km).")
    else:
        factors.append(f"Elevated historical incident concentration: {total_inc} incidents along corridor ({density_per_km} per km).")

    # Severity factor
    sev_3_count = sev_counts.get(3, 0)
    sev_1_count = sev_counts.get(1, 0)
    if sev_3_count > 0:
        factors.append(f"Includes {sev_3_count} higher-severity recorded incident(s) (dispute/assault/robbery).")
    elif sev_1_count > 0:
        factors.append(f"Historical incidents consist predominantly of minor theft or pickpocketing (severity rating 1).")
    else:
        factors.append("No high-severity incidents recorded along this alignment.")

    # Hotspot proximity factor
    if nearest_hotspot:
        hotspot_name = nearest_hotspot["top_category"]
        if min_hotspot_km < 0.25:
            factors.append(f"Passes within {int(min_hotspot_km * 1000)}m of {nearest_hotspot['label']}.")
        else:
            factors.append(f"Maintains {min_hotspot_km} km clearance from nearest historical crime cluster.")

    # Time-of-day factor
    if departure_time_window:
        tod_count = matched_data.get("temporal_breakdown", {}).get(departure_time_window, 0)
        factors.append(f"Departure time ({departure_time_window}): {tod_count} of {total_inc} recorded incidents occurred during this time window.")

    # Uncertainty / Coverage notice
    if coverage_info["confidence_tier"] != "high":
        factors.append(f"Data Coverage Caution: {coverage_info['warning']}")

    # Component contributions for radar / breakdown visualization
    avg_c = sum(s["c_norm"] for s in segment_evaluations) / max(1, len(segment_evaluations))
    avg_s = sum(s["s_norm"] for s in segment_evaluations) / max(1, len(segment_evaluations))
    avg_t = sum(s["t_norm"] for s in segment_evaluations) / max(1, len(segment_evaluations))

    score_components = {
        "incident_frequency_contribution": round(w["w_frequency"] * avg_c * 100, 1),
        "severity_contribution": round(w["w_severity"] * avg_s * 100, 1),
        "temporal_contribution": round(w["w_time"] * avg_t * 100, 1),
        "weights_applied": w
    }

    return {
        "risk_score": route_score,
        "risk_level": risk_level,
        "risk_label": risk_label,
        "badge_color": badge_color,
        "total_incidents": total_inc,
        "incident_density_per_km": density_per_km,
        "nearest_hotspot_dist_km": min_hotspot_km,
        "risk_factors": factors,
        "score_components": score_components,
        "data_coverage": coverage_info,
        "segment_evaluations": segment_evaluations,
        "notice": "Relative historical score. Does not guarantee safety or predict active hazards."
    }


def rank_and_categorize_routes(
    evaluated_routes: List[Dict[str, Any]],
    trade_off_weights: Optional[Dict[str, float]] = None
) -> List[Dict[str, Any]]:
    """
    Ranks candidate routes and assigns distinct recommendation roles:
      1. Shortest Route (minimizes distance)
      2. Lower Estimated Risk Route (minimizes historical risk score)
      3. Balanced Route (minimizes multi-objective function J)
    """
    if not evaluated_routes:
        return []

    # If only one route is available from routing engine
    if len(evaluated_routes) == 1:
        single = evaluated_routes[0]
        single["recommendation_type"] = "only_available"
        single["recommendation_title"] = "Available Route"
        single["objective_score"] = 1.0
        single["selection_reason"] = "Only single path returned by routing network for this corridor."
        return [single]

    # Reference values for normalization
    d_ref = min(r["distance_km"] for r in evaluated_routes)
    t_ref = min(r["duration_min"] for r in evaluated_routes)

    tw = trade_off_weights or BALANCED_WEIGHTS
    alpha = tw["alpha"]
    beta = tw["beta"]
    gamma = tw["gamma"]

    # Calculate objective score J for each route
    for r in evaluated_routes:
        d_norm = r["distance_km"] / max(0.01, d_ref)
        t_norm = r["duration_min"] / max(0.01, t_ref)
        r_norm = r["risk_score"] / 100.0

        j_score = alpha * d_norm + beta * t_norm + gamma * r_norm
        r["objective_score"] = round(j_score, 3)

    # Assign distinct primary roles to candidate routes
    # 1. Shortest distance route
    shortest_candidate = min(evaluated_routes, key=lambda r: r["distance_km"])

    # 2. Lower risk route (eligible with high/medium coverage)
    eligible_low_risk = [
        r for r in evaluated_routes
        if r["data_coverage"]["confidence_tier"] in ["high", "medium"]
    ] or evaluated_routes
    lowest_risk_candidate = min(eligible_low_risk, key=lambda r: r["risk_score"])

    # 3. Balanced route (trade-off objective J)
    best_balanced_candidate = min(evaluated_routes, key=lambda r: r["objective_score"])

    assigned_ids = set()

    # Step 1: Assign Shortest
    shortest_candidate["recommendation_type"] = "shortest"
    shortest_candidate["recommendation_title"] = "Shortest Route"
    shortest_candidate["selection_reason"] = f"Fastest path ({shortest_candidate['distance_km']} km, {shortest_candidate['duration_min']} min)."
    assigned_ids.add(shortest_candidate["route_id"])

    # Step 2: Assign Lower Risk (distinct from Shortest if possible)
    low_risk_pool = [r for r in eligible_low_risk if r["route_id"] not in assigned_ids]
    if low_risk_pool:
        actual_lower_risk = min(low_risk_pool, key=lambda r: r["risk_score"])
    else:
        actual_lower_risk = lowest_risk_candidate

    actual_lower_risk["recommendation_type"] = "lower_risk"
    actual_lower_risk["recommendation_title"] = "Lower-Estimated-Risk Route"
    actual_lower_risk["selection_reason"] = f"Lowest historical risk score ({actual_lower_risk['risk_score']}/100) along verified streets."
    assigned_ids.add(actual_lower_risk["route_id"])

    # Step 3: Assign Balanced (distinct from others if possible)
    balanced_pool = [r for r in evaluated_routes if r["route_id"] not in assigned_ids]
    if balanced_pool:
        actual_balanced = min(balanced_pool, key=lambda r: r["objective_score"])
    else:
        actual_balanced = best_balanced_candidate

    actual_balanced["recommendation_type"] = "balanced"
    actual_balanced["recommendation_title"] = "Balanced Route"
    actual_balanced["selection_reason"] = f"Optimal compromise between distance ({actual_balanced['distance_km']} km) and risk ({actual_balanced['risk_score']}/100)."
    assigned_ids.add(actual_balanced["route_id"])

    # Remaining routes
    for r in evaluated_routes:
        if r["route_id"] not in assigned_ids:
            r["recommendation_type"] = "alternative"
            r["recommendation_title"] = "Alternative Route"
            r["selection_reason"] = "Candidate path generated by routing service."

    # Sort output: Balanced first, then Lower Risk, then Shortest
    order_map = {"balanced": 1, "lower_risk": 2, "shortest": 3, "alternative": 4}
    return sorted(evaluated_routes, key=lambda r: order_map.get(r["recommendation_type"], 5))

