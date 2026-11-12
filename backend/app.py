"""
SafeRoute - Main Flask Application Server (app.py)
--------------------------------------------------
Purpose:
  Flask backend entry point for SafeRoute.
  Initializes SQLite database, fits K-Means spatial clustering,
  trains the Random Forest segment risk classifier, configures CORS,
  and registers the REST API blueprint.

Usage:
  python app.py
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

from database import seed_database_if_empty, get_all_incidents
from ml_model import HotspotClusterer, SegmentRiskRandomForest
from routes import api_bp, init_ml_context


def create_app() -> Flask:
    """Application factory for SafeRoute backend."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # 1. Initialize & Seed Database if empty
    seed_database_if_empty()

    # 2. Train and fit ML Models in memory
    print("[SafeRoute ML] Fitting K-Means spatial clustering on incident dataset...")
    all_incidents = get_all_incidents(limit=1500)
    clusterer = HotspotClusterer(default_k=5)
    clusters = clusterer.fit(all_incidents, auto_tune_k=False)
    print(f"[SafeRoute ML] Identified {len(clusters)} geographical hotspots.")

    print("[SafeRoute ML] Training Random Forest segment risk classifier...")
    rf_model = SegmentRiskRandomForest(n_estimators=50, max_depth=4)
    metrics = rf_model.train_and_evaluate(all_incidents, clusterer)
    print(f"[SafeRoute ML] Random Forest trained. Test accuracy: {metrics['accuracy']}, Macro F1: {metrics['macro_f1']}.")

    # 3. Inject ML instances into API routes
    init_ml_context(clusterer, rf_model)

    # 4. Register REST Blueprint
    app.register_blueprint(api_bp)

    # Global error handlers
    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def handle_internal_error(e):
        return jsonify({"success": False, "error": "Internal server error occurred", "details": str(e)}), 500

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[SafeRoute] Starting SafeRoute API server on http://127.0.0.1:{port}")
    app = create_app()
    app.run(host="127.0.0.1", port=port, debug=False)

