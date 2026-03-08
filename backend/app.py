# =============================================================
# FILE: backend/app.py
# PURPOSE: Main entry point for Flask backend
# HOW TO RUN: Open terminal → cd backend → py -3.11 app.py
# SERVER STARTS AT: http://localhost:5000
# =============================================================

from flask import Flask
from flask_cors import CORS

from core.model_loader import load_model_once
from routes.predict_routes  import predict_bp
from routes.weather_routes  import weather_bp
from routes.auth_routes     import auth_bp
from routes.scan_routes     import scan_bp
from routes.download_routes import download_bp

# Create Flask app
app = Flask(__name__)

# ── CORS CONFIGURATION ────────────────────────────────────────
# This allows your React frontend (localhost:5173) to call
# this Flask backend (localhost:5000) without browser blocking
# DO NOT CHANGE THIS unless you deploy to a real server
# ─────────────────────────────────────────────────────────────
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        }
    },
)

# ── REGISTER ROUTES ───────────────────────────────────────────
# predict_bp  handles:  POST /predict
# weather_bp  handles:  GET  /weather
# auth_bp     handles:  POST /auth/register
#                       POST /auth/login
# scan_bp     handles:  POST /scans/save
#                       GET  /scans/history
#                       DELETE /scans/<id>
#                       DELETE /scans/all
# download_bp handles:  POST /downloads/save
#                       GET  /downloads/list
#                       DELETE /downloads/<id>
#                       DELETE /downloads/all
# ─────────────────────────────────────────────────────────────
app.register_blueprint(predict_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(scan_bp)
app.register_blueprint(download_bp)


# ── HEALTH CHECK ENDPOINT ─────────────────────────────────────
# Open http://localhost:5000 in browser to confirm server is up
# ─────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return {
        "status": "KrishiVigil.ai backend running",
        "version": "2.0.0",
        "endpoints": {
            "predict":      "POST /predict",
            "weather":      "GET  /weather?lat=X&lon=Y",
            "register":     "POST /auth/register",
            "login":        "POST /auth/login",
            "scan_save":    "POST /scans/save",
            "scan_history": "GET  /scans/history",
            "scan_delete":  "DELETE /scans/<id>",
            "scan_clear":   "DELETE /scans/all",
            "dl_save":      "POST /downloads/save",
            "dl_list":      "GET  /downloads/list",
            "dl_delete":    "DELETE /downloads/<id>",
            "dl_clear":     "DELETE /downloads/all",
        },
    }


# ── STARTUP ───────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  KrishiVigil.ai Backend Starting...")
    print("-" * 45)

    # ══════════════════════════════════════════════════════════
    # AI MODEL LOADS HERE ON STARTUP
    # It looks for:  backend/plant_model_yolo.pt
    #
    # BEFORE you have the model:
    #   → App runs in Demo Mode (shows fake 87.4% data)
    #   → No crash, everything still works
    #
    # AFTER you place plant_model_yolo.pt in backend/ folder:
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