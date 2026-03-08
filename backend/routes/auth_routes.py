# =============================================================
# FILE: backend/routes/auth_routes.py
# PURPOSE: Handles /auth/register and /auth/login
# STORAGE: Simple JSON file (users.json) — no database needed
# =============================================================

import json, os, hashlib, secrets
from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

# ── Simple file-based user storage (until you add a real DB) ─
USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "users.json")

def _load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def _save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def _hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def _make_token(user_id):
    return hashlib.sha256(f"{user_id}{secrets.token_hex(16)}".encode()).hexdigest()


# ── REGISTER ──────────────────────────────────────────────────
@auth_bp.route("/auth/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    name            = data.get("name", "").strip()
    mobile_or_email = data.get("mobile_or_email", "").strip().lower()
    password        = data.get("password", "")

    if not name or not mobile_or_email or not password:
        return jsonify({"error": "All fields are required"}), 400

    users = _load_users()

    # Check if already exists
    if any(u["mobile_or_email"] == mobile_or_email for u in users):
        return jsonify({"error": "Account already exists. Please sign in."}), 400

    # Create new user
    user_id = secrets.token_hex(8)
    token   = _make_token(user_id)
    new_user = {
        "id":               user_id,
        "name":             name,
        "mobile_or_email":  mobile_or_email,
        "password_hash":    _hash_password(password),
        "token":            token,
    }
    users.append(new_user)
    _save_users(users)

    return jsonify({
        "token": token,
        "user":  {"id": user_id, "name": name, "mobile_or_email": mobile_or_email}
    }), 201


# ── LOGIN ─────────────────────────────────────────────────────
@auth_bp.route("/auth/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json() or {}
    mobile_or_email = data.get("mobile_or_email", "").strip().lower()
    password        = data.get("password", "")

    users = _load_users()
    user  = next((u for u in users if u["mobile_or_email"] == mobile_or_email), None)

    if not user or user["password_hash"] != _hash_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Refresh token on each login
    new_token = _make_token(user["id"])
    user["token"] = new_token
    _save_users(users)

    return jsonify({
        "token": new_token,
        "user":  {"id": user["id"], "name": user["name"], "mobile_or_email": user["mobile_or_email"]}
    }), 200