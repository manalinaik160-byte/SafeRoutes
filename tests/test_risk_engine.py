"""
Unit Tests for Machine Learning Models and Risk Engine (test_risk_engine.py)
"""

import sys
import os
import pytest
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from database import seed_database_if_empty, get_all_incidents
from ml_model import HotspotClusterer, SegmentRiskRandomForest
from risk_engine import (
    compute_segment_risk,
    compute_route_risk,
    rank_and_categorize_routes,
    DEFAULT_WEIGHTS,
    BALANCED_WEIGHTS
)
from data_processor import associate_incidents_with_route, compute_route_data_coverage


@pytest.fixture(scope="module")
def setup_data():
    seed_database_if_empty()
    incidents = get_all_incidents(limit=1000)
    clusterer = HotspotClusterer(default_k=5)
    clusters = clusterer.fit(incidents)
    return incidents, clusterer, clusters


def test_kmeans_clustering(setup_data):
    incidents, clusterer, clusters = setup_data
    assert len(clusters) == 5
    for c in clusters:
        assert "centroid" in c
        assert 51.49 <= c["centroid"]["lat"] <= 51.54
        assert -0.15 <= c["centroid"]["lon"] <= -0.06
        assert c["incident_count"] > 0
        assert 100 <= c["radius_meters"] <= 650
        assert "mean_severity" in c
        assert "top_category" in c

    # Test distance to nearest hotspot
    dist_km, nearest = clusterer.get_distance_to_nearest_hotspot(51.5118, -0.1235)
    assert dist_km < 0.5  # Near Covent Garden epicenter
    assert nearest is not None


def test_random_forest_training_and_evaluation(setup_data):
    incidents, clusterer, _ = setup_data
    rf = SegmentRiskRandomForest(n_estimators=30, max_depth=4)
    metrics = rf.train_and_evaluate(incidents, clusterer)

    assert rf.is_trained is True
    assert "accuracy" in metrics
    assert "macro_f1" in metrics
    assert metrics["accuracy"] > 0.60
    assert len(metrics["feature_importances"]) == 5
    assert len(metrics["confusion_matrix"]) == 3

    # Prediction test
    pred = rf.predict_segment_risk({
        "incident_count": 8,
        "severity_sum": 18.0,
        "nearest_hotspot_km": 0.1,
        "night_ratio": 0.6,
        "segment_length_km": 0.2
    })
    assert pred["predicted_category"] in ["low_risk", "moderate_risk", "higher_risk"]
    assert 0.0 <= pred["confidence"] <= 1.0


def test_segment_risk_formula():
    # Empty segment (0 incidents)
    low_seg = compute_segment_risk(
        incident_count=0,
        severity_sum=0.0,
        length_meters=200.0,
        time_of_day_incident_count=0,
        total_time_incidents=0
    )
    assert low_seg["score"] < 15.0

    # High crime segment (10 incidents, high severity)
    high_seg = compute_segment_risk(
        incident_count=10,
        severity_sum=25.0,
        length_meters=200.0,
        time_of_day_incident_count=5,
        total_time_incidents=10
    )
    assert high_seg["score"] > 60.0
    assert high_seg["score"] > low_seg["score"]


def test_route_risk_computation(setup_data):
    incidents, clusterer, _ = setup_data
    coords = [
        [51.5120, -0.1250],
        [51.5130, -0.1200],
        [51.5140, -0.1150]
    ]
    matched = associate_incidents_with_route(coords, incidents, buffer_meters=80.0)
    cov = compute_route_data_coverage(coords)

    evaluated = compute_route_risk(
        route_geometry=coords,
        matched_data=matched,
        coverage_info=cov,
        hotspot_clusterer=clusterer,
        departure_time_window="evening"
    )

    assert "risk_score" in evaluated
    assert 0.0 <= evaluated["risk_score"] <= 100.0
    assert evaluated["risk_level"] in ["lower_estimated_risk", "moderate_estimated_risk", "higher_estimated_risk"]
    assert len(evaluated["risk_factors"]) > 0
    assert "score_components" in evaluated


def test_route_ranking_multi_objective():
    # Construct 3 simulated routes:
    # Route 1: Shortest distance, but higher risk
    r1 = {
        "route_id": "r1",
        "distance_km": 2.0,
        "duration_min": 25.0,
        "risk_score": 75.0,
        "data_coverage": {"confidence_tier": "high"}
    }
    # Route 2: Longer distance, but lower risk
    r2 = {
        "route_id": "r2",
        "distance_km": 3.2,
        "duration_min": 38.0,
        "risk_score": 25.0,
        "data_coverage": {"confidence_tier": "high"}
    }
    # Route 3: Balanced distance and moderate risk
    r3 = {
        "route_id": "r3",
        "distance_km": 2.2,
        "duration_min": 27.0,
        "risk_score": 35.0,
        "data_coverage": {"confidence_tier": "high"}
    }

    ranked = rank_and_categorize_routes([r1, r2, r3])
    types = [r["recommendation_type"] for r in ranked]
    assert "shortest" in types
    assert "lower_risk" in types
    assert "balanced" in types


if __name__ == "__main__":
    pytest.main(["-v", __file__])
