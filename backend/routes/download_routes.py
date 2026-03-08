# =============================================================
# FILE: backend/routes/download_routes.py
# =============================================================

import json, os, secrets, datetime
from flask import Blueprint, request, jsonify
from .auth_routes import _load_users

download_bp = Blueprint("downloads", __name__)

DOWNLOADS_FILE = os.path.join(os.path.dirname(__file__), "..", "downloads.json")

def _get_user_from_token(token):
    users = _load_users()
    return next((u for u in users if u.get("token") == token), None)

def _load_downloads():
    if not os.path.exists(DOWNLOADS_FILE):
        return []
    try:
        with open(DOWNLOADS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def _save_downloads(downloads):
    with open(DOWNLOADS_FILE, "w") as f:
        json.dump(downloads, f, indent=2)

def _auth(req):
    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    return _get_user_from_token(header[7:])


@download_bp.route("/downloads/save", methods=["POST", "OPTIONS"])
def save_download():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data      = request.get_json() or {}
    downloads = _load_downloads()
    new_dl = {
        "id":           secrets.token_hex(8),
        "user_id":      user["id"],
        "saved_at":     datetime.datetime.utcnow().isoformat(),
        "title":        data.get("title", ""),
        "crop":         data.get("crop", ""),
        "land":         data.get("land", 0),
        "disease":      data.get("disease", ""),
        "confidence":   data.get("confidence", 0),
        "severity":     data.get("severity", ""),
        "health_score": data.get("health_score", 0),
        "image":        data.get("image_base64", ""),
    }
    downloads.insert(0, new_dl)
    downloads = downloads[:100]
    _save_downloads(downloads)
    return jsonify({"success": True, "id": new_dl["id"]}), 201


@download_bp.route("/downloads/list", methods=["GET", "OPTIONS"])
def list_downloads():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    downloads      = _load_downloads()
    user_downloads = [d for d in downloads if d.get("user_id") == user["id"]]
    return jsonify({"downloads": user_downloads}), 200


@download_bp.route("/downloads/all", methods=["DELETE", "OPTIONS"])
def delete_all_downloads():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    downloads = [d for d in _load_downloads() if d.get("user_id") != user["id"]]
    _save_downloads(downloads)
    return jsonify({"success": True}), 200


@download_bp.route("/downloads/<dl_id>", methods=["DELETE", "OPTIONS"])
def delete_download(dl_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200
    user = _auth(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    downloads = [d for d in _load_downloads() if not (d["id"] == dl_id and d.get("user_id") == user["id"])]
    _save_downloads(downloads)
    return jsonify({"success": True}), 200