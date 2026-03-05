# =============================================================
# FILE: backend/app.py
# PURPOSE: Main entry point for Flask backend
# HOW TO RUN: Open terminal → cd backend → py -3.11 app.py
# SERVER STARTS AT: http://localhost:5000
# =============================================================

from flask import Flask
from flask_cors import CORS

from core.model_loader import load_model_once
from routes.predict_routes import predict_bp
from routes.weather_routes import weather_bp

# Create Flask app
app = Flask(__name__)

# ── CORS CONFIGURATION ────────────────────────────────────────
# This allows your React frontend (localhost:5173) to call
# this Flask backend (localhost:5000) without browser blocking
# DO NOT CHANGE THIS unless you deploy to a real server
# ─────────────────────────────────────────────────────────────
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]}})

# ── REGISTER ROUTES ───────────────────────────────────────────
# predict_bp handles:  POST /predict   (AI image analysis)
# weather_bp handles:  GET  /weather   (live weather data)
# ─────────────────────────────────────────────────────────────
app.register_blueprint(predict_bp)
app.register_blueprint(weather_bp)


# ── HEALTH CHECK ENDPOINT ─────────────────────────────────────
# Open http://localhost:5000 in browser to confirm server is up
# ─────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return {
        "status":  "KrishiVigil.ai backend running",
        "version": "2.0.0",
        "endpoints": {
            "predict": "POST /predict",
            "weather": "GET  /weather?lat=X&lon=Y",
        }
    }


# ── STARTUP ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  KrishiVigil.ai Backend Starting...")
    print("-" * 45)

    # ══════════════════════════════════════════════════════════
    # AI MODEL LOADS HERE ON STARTUP
    # It looks for:  backend/plant_model.h5
    #
    # BEFORE you have the model:
    #   → App runs in Demo Mode (shows fake 87.4% data)
    #   → No crash, everything still works
    #
    # AFTER you place plant_model.h5 in backend/ folder:
    #   → Real AI inference runs on every image upload
    #   → All result dashboard values become real
    # ══════════════════════════════════════════════════════════
    load_model_once()

    print("-" * 45)
    print("  Server running at http://localhost:5000")
    print("  Frontend at      http://localhost:5173")
    print("-" * 45 + "\n")

    # ── SERVER SETTINGS ───────────────────────────────────────
    # host="0.0.0.0"  → accessible from any device on same WiFi
    # port=5000       → must match API_BASE in App.jsx
    # debug=False     → set True only during development
    # ─────────────────────────────────────────────────────────
    app.run(host="0.0.0.0", port=5000, debug=False)