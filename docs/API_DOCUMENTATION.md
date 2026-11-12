# SafeRoute REST API Documentation

This document describes all REST API endpoints exposed by the SafeRoute Flask backend (`backend/app.py` & `backend/routes.py`).

**Base URL**: `http://127.0.0.1:5000/api` (proxied to `/api` by Vite development server)

---

## 1. System Health Check

### `GET /api/health`
Verifies server uptime, database connectivity, and machine learning model readiness.

#### Response (`200 OK`)
```json
{
  "app": "SafeRoute - Explainable & Time-Aware Route Recommendation System",
  "ml_status": {
    "kmeans_clusters_loaded": 5,
    "random_forest_trained": true
  },
  "status": "healthy",
  "study_area": "Central London / City of London Metropolitan Corridor (UK)",
  "version": "1.0.0"
}
```

---

## 2. Dataset Metadata & Provenance

### `GET /api/metadata`
Returns data source provenance, geographical study bounds, reporting period, and documented ethical limitations as required by `plan.md` Section 17 & 23.

#### Response (`200 OK`)
```json
{
  "dataset": {
    "bounding_box": {
      "max_lat": 51.532,
      "max_lon": -0.065,
      "min_lat": 51.498,
      "min_lon": -0.145
    },
    "coverage_area": "Central London / City of London Metropolitan Corridor (UK)",
    "dataset_name": "City of London & Urban Metro Open Safety Benchmark 2024",
    "end_date": "2024-09-30",
    "last_verified": "2024-10-15",
    "limitations": [
      "Historical records represent reported crimes only; under-reporting may exist.",
      "Incident locations are snapped to nearby road midpoints to protect victim privacy.",
      "Does not capture real-time temporary hazards, active police patrols, or instantaneous danger.",
      "Missing data in a region must not be interpreted as evidence of complete safety.",
      "Intended strictly as an explainable decision-support tool, not a personal safety guarantee."
    ],
    "source_url": "https://data.police.uk / Open Government Licence v3.0",
    "start_date": "2023-10-01",
    "total_records": 1250
  },
  "success": true
}
```

---

## 3. Historical Incident Records

### `GET /api/incidents`
Retrieves geocoded historical incident records for map visualization.

#### Query Parameters:
- `limit` *(optional, integer, default: 400, max: 2000)*: Maximum records to return.
- `time_of_day` *(optional, string)*: Filter by temporal window (`morning`, `afternoon`, `evening`, `night`).

#### Response (`200 OK`)
```json
{
  "count": 50,
  "incidents": [
    {
      "category": "Petty Theft / Pickpocketing",
      "id": "CR-2024-00001",
      "incident_date": "2023-12-26 16:28:29",
      "is_synthetic": 0,
      "latitude": 51.511152,
      "longitude": -0.124278,
      "severity": 1,
      "source": "City of London Police Open Data Portal (OGL v3.0)",
      "time_of_day": "afternoon"
    }
  ],
  "success": true
}
```

---

## 4. K-Means Crime Hotspots

### `GET /api/hotspots`
Returns K-Means spatial cluster centroids, cluster radiuses (in meters), incident counts, and dominant offense categories.

#### Response (`200 OK`)
```json
{
  "clusters": [
    {
      "cluster_id": 0,
      "centroid": { "lat": 51.5121, "lon": -0.1228 },
      "incident_count": 372,
      "label": "Historical Incident Cluster #1 (372 incidents)",
      "mean_severity": 1.45,
      "radius_meters": 420.5,
      "top_category": "Petty Theft / Pickpocketing"
    }
  ],
  "count": 5,
  "success": true
}
```

---

## 5. Machine Learning Diagnostics

### `GET /api/ml/evaluation`
Returns cross-validated performance metrics for the Random Forest classifier and K-Means clustering.

#### Response (`200 OK`)
```json
{
  "metrics": {
    "accuracy": 0.812,
    "macro_f1": 0.805,
    "weighted_f1": 0.814,
    "feature_importances": {
      "severity_sum": 0.385,
      "incident_count": 0.282,
      "nearest_hotspot_km": 0.165,
      "night_ratio": 0.098,
      "segment_length_km": 0.070
    },
    "confusion_matrix": [[32, 4, 0], [5, 28, 3], [0, 2, 6]],
    "test_samples": 80,
    "train_samples": 320
  },
  "model_name": "RandomForestClassifier (Ensemble 50 Trees)",
  "success": true
}
```

---

## 6. Study Area Presets

### `GET /api/presets`
Returns preset origin and destination pairs located inside the verified study corridor for one-click testing.

#### Response (`200 OK`)
```json
{
  "presets": [
    {
      "description": "Cross-city transit traversing West End entertainment and City financial hub.",
      "destination": { "lat": 51.5133, "lon": -0.0886, "name": "Bank Station / Financial Hub" },
      "id": "preset_1",
      "name": "Covent Garden to Bank Financial District",
      "origin": { "lat": 51.5118, "lon": -0.1235, "name": "Covent Garden Station" }
    }
  ],
  "success": true
}
```

---

## 7. Compare Safety-Aware Routes

### `POST /api/routes/compare`
Core algorithmic endpoint. Generates candidate paths, associates historical crime incidents within an 80-meter spatial buffer, computes length-weighted risk scores, evaluates data coverage, and ranks routes using multi-objective optimization.

#### Request Body:
```json
{
  "origin": { "lat": 51.5118, "lon": -0.1235 },
  "destination": { "lat": 51.5133, "lon": -0.0886 },
  "travel_mode": "walking",
  "departure_time": "19:00",
  "weights": {
    "alpha": 0.35,
    "beta": 0.25,
    "gamma": 0.40
  }
}
```

#### Response (`200 OK`):
```json
{
  "departure_time": "19:00",
  "time_of_day_window": "evening",
  "total_alternatives": 3,
  "travel_mode": "walking",
  "routes": [
    {
      "route_id": "osrm_route_1",
      "recommendation_type": "balanced",
      "recommendation_title": "Balanced Route",
      "distance_km": 2.75,
      "duration_min": 36.6,
      "risk_score": 38.4,
      "risk_level": "moderate_estimated_risk",
      "risk_label": "Moderate Historical Risk",
      "data_coverage": {
        "coverage_percent": 100.0,
        "confidence_tier": "high",
        "in_study_area": true,
        "warning": null
      },
      "risk_factors": [
        "Moderate recorded incident frequency: 18 incidents along corridor (6.5 per km).",
        "Historical incidents consist predominantly of minor theft or pickpocketing (severity rating 1).",
        "Maintains 0.32 km clearance from nearest historical crime cluster.",
        "Departure time (evening): 6 of 18 recorded incidents occurred during this time window."
      ],
      "score_components": {
        "incident_frequency_contribution": 16.5,
        "severity_contribution": 12.2,
        "temporal_contribution": 9.7,
        "weights_applied": { "w_frequency": 0.45, "w_severity": 0.35, "w_time": 0.20 }
      },
      "coordinates": [[51.5118, -0.1235], [51.5122, -0.1205]],
      "notice": "Relative historical score. Does not guarantee safety or predict active hazards."
    }
  ],
  "success": true
}
```

#### Error Responses:
- `400 Bad Request`: Missing JSON body, invalid coordinate numbers, out of bounds coordinates, or identical origin and destination.
- `502 Bad Gateway`: Routing engine fails to discover viable paths.

