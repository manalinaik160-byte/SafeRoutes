"""
SafeRoute - Database Management Module (database.py)
----------------------------------------------------
Purpose:
  Manages SQLite database initialization, table creation, indexing,
  and query transactions for historical crime incident records and
  dataset provenance metadata.

Why Required:
  Persistent and indexed storage is necessary to rapidly query incident
  records within geographical bounding boxes and associate them with
  candidate route segments without re-parsing raw files on every API request.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "saferoute.db")


def get_db_connection() -> sqlite3.Connection:
    """
    Establishes and returns a SQLite database connection with row dictionary access.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """
    Initializes database schema if tables do not exist.
    Creates indexes on geospatial coordinates and incident timestamps
    for rapid spatial and temporal filtering.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Incidents Table: Stores geocoded historical incidents with severity & temporal tags
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        category TEXT NOT NULL,
        severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 3),
        incident_date TEXT NOT NULL,
        time_of_day TEXT NOT NULL,
        source TEXT NOT NULL,
        is_synthetic INTEGER DEFAULT 0
    );
    """)

    # Geospatial and temporal indexes for query performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_lat_lon ON incidents (latitude, longitude);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_time ON incidents (time_of_day);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents (incident_date);")

    # 2. Dataset Metadata Table: Stores provenance, coverage, and ethical limitations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dataset_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_name TEXT NOT NULL,
        source_url TEXT NOT NULL,
        coverage_area TEXT NOT NULL,
        bounding_box TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_records INTEGER NOT NULL,
        last_verified TEXT NOT NULL,
        limitations TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()


def insert_incidents(incidents: List[Dict[str, Any]]) -> int:
    """
    Inserts a batch of crime incident records into SQLite using transaction batching.
    Ignores duplicate record IDs.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT OR IGNORE INTO incidents 
    (id, latitude, longitude, category, severity, incident_date, time_of_day, source, is_synthetic)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    records = [
        (
            item["id"],
            float(item["latitude"]),
            float(item["longitude"]),
            item["category"],
            int(item["severity"]),
            item["incident_date"],
            item.get("time_of_day", "day"),
            item.get("source", "Open Data Portal"),
            int(item.get("is_synthetic", 0))
        )
        for item in incidents
    ]

    cursor.executemany(query, records)
    inserted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return inserted_count


def get_all_incidents(limit: int = 2000, time_of_day: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves incident records for spatial visualization and clustering.
    Optionally filters by time_of_day.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if time_of_day and time_of_day != "all":
        cursor.execute(
            "SELECT * FROM incidents WHERE time_of_day = ? LIMIT ?",
            (time_of_day, limit)
        )
    else:
        cursor.execute("SELECT * FROM incidents LIMIT ?", (limit,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_incidents_in_bbox(min_lat: float, max_lat: float, min_lon: float, max_lon: float) -> List[Dict[str, Any]]:
    """
    Retrieves incidents within a rectangular coordinate bounding box.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM incidents 
        WHERE latitude BETWEEN ? AND ? 
          AND longitude BETWEEN ? AND ?
    """, (min_lat, max_lat, min_lon, max_lon))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def set_dataset_metadata(meta: Dict[str, Any]) -> None:
    """
    Stores or updates dataset provenance metadata and documentation limitations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM dataset_metadata")
    cursor.execute("""
        INSERT INTO dataset_metadata
        (dataset_name, source_url, coverage_area, bounding_box, start_date, end_date, total_records, last_verified, limitations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        meta["dataset_name"],
        meta["source_url"],
        meta["coverage_area"],
        json.dumps(meta["bounding_box"]) if isinstance(meta["bounding_box"], (list, dict)) else meta["bounding_box"],
        meta["start_date"],
        meta["end_date"],
        int(meta["total_records"]),
        meta["last_verified"],
        json.dumps(meta["limitations"]) if isinstance(meta["limitations"], list) else meta["limitations"]
    ))
    conn.commit()
    conn.close()


def get_dataset_metadata() -> Optional[Dict[str, Any]]:
    """
    Returns the latest dataset provenance metadata and documented limitations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dataset_metadata ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    data = dict(row)
    try:
        data["bounding_box"] = json.loads(data["bounding_box"])
    except (json.JSONDecodeError, TypeError):
        pass

    try:
        data["limitations"] = json.loads(data["limitations"])
    except (json.JSONDecodeError, TypeError):
        pass

    return data


def seed_database_if_empty() -> None:
    """
    Checks if database is initialized and contains incident records.
    If empty, seeds the documented study area dataset and provenance metadata.
    """
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS cnt FROM incidents")
    count = cursor.fetchone()["cnt"]
    conn.close()

    if count == 0:
        # Import lazily to avoid circular dependency
        from data_processor import generate_study_dataset, STUDY_AREA_METADATA
        print("[SafeRoute Database] Initializing and seeding study area dataset...")
        dataset = generate_study_dataset(1250)
        insert_incidents(dataset)
        set_dataset_metadata(STUDY_AREA_METADATA)
        print(f"[SafeRoute Database] Successfully seeded {len(dataset)} incidents and dataset metadata.")
    else:
        print(f"[SafeRoute Database] Found {count} existing incident records.")

