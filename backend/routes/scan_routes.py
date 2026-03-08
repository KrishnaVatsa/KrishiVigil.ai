# =============================================================
# FILE: backend/routes/scan_routes.py
# =============================================================

import json, os
from flask import Blueprint, request, jsonify
from .auth_routes import _load_users

scan_bp = Blueprint("scans", __name__)

SCANS_FILE = os.path.join(os.path.dirname(__file__), "..", "scans.json")

def _get_user_from_token(token):
    users = _load_users()
    return next((u for u in users if u.get("token") == token), None)

def _load_scans():
    if not os.path.exists(SCANS_FILE):
        return []
    try:
        with open(SCANS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def _save_scans(scans):
    with open(SCANS_FILE, "w") as f:
        json.dump(scans, f, indent=2)

def _auth(req):
    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return _get_user_from_token(header[7:])


@scan_bp.route("/scans/save", methods=["POST", "OPTIONS"])
def save_scan():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data   = request.get_json() or {}
    scans  = _load_scans()
    import secrets, datetime
    new_scan = {
        "id":          secrets.token_hex(8),
        "user_id":     user["id"],
        "scanned_at":  datetime.datetime.utcnow().isoformat(),
        "crop":        data.get("crop", ""),
        "land":        data.get("land", 0),
        "result":      data.get("result", {}),
        "location":    data.get("weather", {}).get("location", ""),
        "temperature": data.get("weather", {}).get("temperature", ""),
        "image":       data.get("image_base64", ""),
    }
    scans.insert(0, new_scan)
    scans = scans[:200]  # keep last 200
    _save_scans(scans)
    return jsonify({"success": True, "id": new_scan["id"]}), 201


@scan_bp.route("/scans/history", methods=["GET", "OPTIONS"])
def get_history():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    scans      = _load_scans()
    user_scans = [s for s in scans if s.get("user_id") == user["id"]]
    return jsonify({"scans": user_scans}), 200


@scan_bp.route("/scans/all", methods=["DELETE", "OPTIONS"])
def delete_all_scans():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    scans = [s for s in _load_scans() if s.get("user_id") != user["id"]]
    _save_scans(scans)
    return jsonify({"success": True}), 200


@scan_bp.route("/scans/<scan_id>", methods=["DELETE", "OPTIONS"])
def delete_scan(scan_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    scans = [s for s in _load_scans() if not (s["id"] == scan_id and s.get("user_id") == user["id"])]
    _save_scans(scans)
    return jsonify({"success": True}), 200