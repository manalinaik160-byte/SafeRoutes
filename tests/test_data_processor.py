"""
Unit Tests for Geospatial Data Processor and Database (test_data_processor.py)
"""

import sys
import os
import pytest

# Add backend to Python search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from data_processor import (
    haversine_distance,
    point_to_segment_distance,
    classify_time_of_day,
    parse_departure_time_window,
    is_coordinate_in_study_area,
    associate_incidents_with_route,
    compute_route_data_coverage,
    STUDY_AREA_METADATA
)
from database import (
    init_db,
    seed_database_if_empty,
    get_dataset_metadata,
    get_all_incidents,
    get_incidents_in_bbox
)


def test_haversine_distance():
    # Distance between St Paul's (51.5138, -0.0984) and Bank (51.5133, -0.0886) is approx 680m
    dist = haversine_distance(51.5138, -0.0984, 51.5133, -0.0886)
    assert 600 < dist < 750
    # Zero distance test
    assert haversine_distance(51.5, -0.1, 51.5, -0.1) == 0.0


def test_point_to_segment_distance():
    # Segment from (51.510, -0.100) to (51.510, -0.090) along latitude line
    # Point at (51.510, -0.095) should have 0m distance (directly on segment)
    dist_on = point_to_segment_distance(51.510, -0.095, 51.510, -0.100, 51.510, -0.090)
    assert dist_on < 1.0

    # Point displaced north by ~111m (approx 0.001 deg lat)
    dist_off = point_to_segment_distance(51.511, -0.095, 51.510, -0.100, 51.510, -0.090)
    assert 100 < dist_off < 125


def test_time_of_day_classification():
    assert classify_time_of_day(3) == "night"
    assert classify_time_of_day(8) == "morning"
    assert classify_time_of_day(14) == "afternoon"
    assert classify_time_of_day(19) == "evening"
    assert classify_time_of_day(23) == "night"

    assert parse_departure_time_window("18:30") == "evening"
    assert parse_departure_time_window("02:15") == "night"
    assert parse_departure_time_window(None) is None


def test_coordinate_study_area_bounds():
    # Coordinates inside Central London corridor
    assert is_coordinate_in_study_area(51.510, -0.100) is True
    # Coordinates in Tokyo or New York
    assert is_coordinate_in_study_area(40.7128, -74.0060) is False
    assert is_coordinate_in_study_area(35.6762, 139.6503) is False


def test_route_data_coverage():
    # Route entirely inside study area
    inside_route = [[51.510, -0.100], [51.512, -0.095], [51.515, -0.090]]
    cov_high = compute_route_data_coverage(inside_route)
    assert cov_high["coverage_percent"] == 100.0
    assert cov_high["confidence_tier"] == "high"
    assert cov_high["in_study_area"] is True
    assert cov_high["warning"] is None

    # Route completely outside
    outside_route = [[12.9716, 77.5946], [12.9720, 77.5950]]
    cov_none = compute_route_data_coverage(outside_route)
    assert cov_none["coverage_percent"] == 0.0
    assert cov_none["confidence_tier"] == "insufficient_data"
    assert cov_none["warning"] is not None


def test_associate_incidents_with_route():
    seed_database_if_empty()
    all_incidents = get_all_incidents(limit=1000)

    # Route through Holborn / Covent Garden where incidents exist
    route_coords = [
        [51.5120, -0.1250],
        [51.5130, -0.1200],
        [51.5140, -0.1150]
    ]

    result = associate_incidents_with_route(route_coords, all_incidents, buffer_meters=100.0)
    assert "matched_incidents" in result
    assert "total_incidents" in result
    assert "severity_breakdown" in result
    assert "segment_stats" in result
    assert len(result["segment_stats"]) == 2  # 3 coords -> 2 segments


def test_database_metadata_and_query():
    seed_database_if_empty()
    meta = get_dataset_metadata()
    assert meta is not None
    assert "City of London" in meta["dataset_name"]
    assert len(meta["limitations"]) > 0

    incidents = get_incidents_in_bbox(51.50, 51.52, -0.12, -0.08)
    assert len(incidents) > 0
    assert "category" in incidents[0]
    assert "severity" in incidents[0]


if __name__ == "__main__":
    pytest.main(["-v", __file__])

