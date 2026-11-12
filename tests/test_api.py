"""
Integration and REST API Test Suite (test_api.py)
-------------------------------------------------
Validates all SafeRoute REST endpoints, input validation, edge cases,
and error handling contracts.
"""

import sys
import os
import pytest
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import create_app


@pytest.fixture(scope="module")
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert "SafeRoute" in data["app"]
    assert data["ml_status"]["kmeans_clusters_loaded"] == 5
    assert data["ml_status"]["random_forest_trained"] is True


def test_metadata_endpoint(client):
    res = client.get("/api/metadata")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "dataset" in data
    assert "limitations" in data["dataset"]
    assert len(data["dataset"]["limitations"]) > 0


def test_incidents_endpoint(client):
    res = client.get("/api/incidents?limit=50&time_of_day=night")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["count"] <= 50
    if data["count"] > 0:
        inc = data["incidents"][0]
        assert "latitude" in inc
        assert "longitude" in inc
        assert "severity" in inc
        assert inc["time_of_day"] == "night"


def test_hotspots_endpoint(client):
    res = client.get("/api/hotspots")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["count"] == 5
    first_cluster = data["clusters"][0]
    assert "centroid" in first_cluster
    assert "radius_meters" in first_cluster
    assert "incident_count" in first_cluster


def test_ml_evaluation_endpoint(client):
    res = client.get("/api/ml/evaluation")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "metrics" in data
    assert data["metrics"]["accuracy"] > 0.60
    assert "feature_importances" in data["metrics"]


def test_presets_endpoint(client):
    res = client.get("/api/presets")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["presets"]) >= 3


def test_routes_compare_valid_payload(client):
    payload = {
        "origin": {"lat": 51.5118, "lon": -0.1235},
        "destination": {"lat": 51.5133, "lon": -0.0886},
        "travel_mode": "walking",
        "departure_time": "19:30"
    }
    res = client.post("/api/routes/compare", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["travel_mode"] == "walking"
    assert data["time_of_day_window"] == "evening"
    assert len(data["routes"]) >= 1

    first_route = data["routes"][0]
    assert "distance_km" in first_route
    assert "duration_min" in first_route
    assert "risk_score" in first_route
    assert "risk_level" in first_route
    assert "data_coverage" in first_route
    assert len(first_route["risk_factors"]) > 0
    assert "score_components" in first_route


def test_routes_compare_validation_errors(client):
    # 1. Missing body
    res = client.post("/api/routes/compare", data="")
    assert res.status_code == 400

    # 2. Missing destination
    res = client.post("/api/routes/compare", json={"origin": {"lat": 51.5, "lon": -0.1}})
    assert res.status_code == 400
    assert "destination" in res.get_json()["error"]

    # 3. Invalid coordinate format
    res = client.post("/api/routes/compare", json={
        "origin": {"lat": "invalid", "lon": -0.1},
        "destination": {"lat": 51.5, "lon": -0.1}
    })
    assert res.status_code == 400

    # 4. Same origin and destination
    res = client.post("/api/routes/compare", json={
        "origin": {"lat": 51.5118, "lon": -0.1235},
        "destination": {"lat": 51.5118, "lon": -0.1235}
    })
    assert res.status_code == 400
    assert "distinct" in res.get_json()["error"]

    # 5. Out of bounds coordinates
    res = client.post("/api/routes/compare", json={
        "origin": {"lat": 95.0, "lon": -0.1},
        "destination": {"lat": 51.5, "lon": -0.1}
    })
    assert res.status_code == 400

