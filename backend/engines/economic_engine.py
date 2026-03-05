# =============================================================
# FILE: backend/engines/economic_engine.py
# PURPOSE: Calculates crop economic loss in Indian Rupees
#
# FORMULA USED:
#   effective_loss% = (confidence/100) * yield_loss * (1 + weather_risk/100)
#   projected_loss  = land * yield_per_acre * msp_per_kg * effective_loss%
#
# ALL INPUTS COME FROM:
#   confidence    → AI model output (predictor.py)
#   yield_loss    → AI model output based on detected disease
#   weather_risk  → Live weather API (weather_service.py)
#   crop_name     → Farmer's input from crop popup
#   land_acres    → Farmer's input from crop popup
# =============================================================


# ── MSP DATABASE ──────────────────────────────────────────────
# MSP = Minimum Support Price (Indian Government official rate)
# Unit: Rs per quintal (1 quintal = 100 kg)
# Source: Government of India MSP 2023-24 announcement
#
# TO ADD A NEW CROP:
#   1. Find its official MSP at: https://agricoop.nic.in
#   2. Add a new line: "crop_name": MSP_value,
#   3. Also add it to YIELD_PER_ACRE below
# ─────────────────────────────────────────────────────────────
MSP_PER_QUINTAL = {
    # Vegetables
    "tomato":       1200,
    "potato":       600,
    "onion":        800,
    "brinjal":      700,
    "eggplant":     700,
    "cabbage":      500,
    "cauliflower":  600,
    "spinach":      500,
    "chilli":       9000,
    "pepper":       1500,
    "shimla mirch": 1500,

    # Cereals
    "wheat":        2275,
    "rice":         2183,
    "paddy":        2183,
    "maize":        1962,
    "corn":         1962,
    "jowar":        3180,
    "bajra":        2500,
    "ragi":         3846,

    # Pulses
    "chickpea":     5440,
    "gram":         5440,
    "lentil":       6000,
    "moong":        8558,
    "tur":          7000,
    "urad":         6950,
    "peas":         1350,

    # Oilseeds
    "soybean":      4600,
    "soya":         4600,
    "mustard":      5650,
    "rapeseed":     5650,
    "sunflower":    6760,
    "groundnut":    6377,
    "peanut":       6377,

    # Cash crops
    "cotton":       6620,
    "sugarcane":    315,

    # Fruits
    "banana":       900,
    "mango":        1500,
    "pomegranate":  5000,
    "guava":        800,
    "papaya":       500,
    "watermelon":   400,
    "apple":        3000,
    "grape":        3500,
    "strawberry":   8000,
}


# ── YIELD PER ACRE ────────────────────────────────────────────
# Average yield in KG per acre for Indian farming conditions
# Source: ICAR crop production statistics
#
# TO ADD A NEW CROP: add same key as in MSP_PER_QUINTAL above
# ─────────────────────────────────────────────────────────────
YIELD_PER_ACRE = {
    "tomato":       20000,
    "potato":       12000,
    "onion":        15000,
    "brinjal":      14000,
    "eggplant":     14000,
    "cabbage":      18000,
    "cauliflower":  12000,
    "spinach":      8000,
    "chilli":       1500,
    "pepper":       3000,
    "shimla mirch": 3000,
    "wheat":        3200,
    "rice":         2500,
    "paddy":        2500,
    "maize":        5500,
    "corn":         5500,
    "jowar":        1000,
    "bajra":        900,
    "ragi":         800,
    "chickpea":     900,
    "gram":         900,
    "lentil":       800,
    "peas":         3000,
    "soybean":      1200,
    "soya":         1200,
    "mustard":      1300,
    "rapeseed":     1300,
    "sunflower":    1000,
    "groundnut":    1800,
    "peanut":       1800,
    "cotton":       600,
    "sugarcane":    80000,
    "banana":       12000,
    "mango":        5000,
    "papaya":       15000,
    "watermelon":   20000,
    "apple":        8000,
    "grape":        8000,
    "strawberry":   4000,
}

DEFAULT_MSP   = 1200    # Rs/quintal fallback for unknown crops
DEFAULT_YIELD = 8000    # kg/acre fallback for unknown crops


def _lookup(database, crop_name, default):
    """Finds crop in database with partial name matching."""
    key = crop_name.lower().strip()
    if key in database:
        return database[key]
    # Try partial match (e.g. "red tomato" matches "tomato")
    for k in database:
        if k in key or key in k:
            return database[k]
    return default


def calculate_loss(crop_name, land_acres, loss_pct,
                   confidence=100.0, weather_risk=50):
    """
    Calculates projected economic loss in Indian Rupees.

    Parameters:
        crop_name    → from farmer's crop popup (e.g. "Tomato")
        land_acres   → from farmer's crop popup (e.g. 3.5)
        loss_pct     → yield loss 0.0-1.0 from AI model
                       (0.65 = 65% for Late Blight)
        confidence   → AI model confidence 0-100
        weather_risk → live weather risk score 0-100

    Economic Formula:
        effective_loss = (confidence/100) * loss_pct * (1 + weather_risk/100)
        projected_loss = total_crop_value * effective_loss
    """
    # Look up MSP and yield for this crop
    msp_quintal  = _lookup(MSP_PER_QUINTAL, crop_name, DEFAULT_MSP)
    msp_per_kg   = msp_quintal / 100           # Convert Rs/quintal to Rs/kg
    yield_per_ac = _lookup(YIELD_PER_ACRE,  crop_name, DEFAULT_YIELD)

    # Total crop value if harvested perfectly
    total_yield_kg = land_acres * yield_per_ac
    total_value    = round(total_yield_kg * msp_per_kg)

    # ── CORE LOSS FORMULA ─────────────────────────────────────
    # confidence/100 → scale by how sure AI is (e.g. 0.874)
    # loss_pct       → base disease damage (e.g. 0.65 for Late Blight)
    # (1 + weather_risk/100) → weather multiplier (e.g. 1.43 at risk=43)
    # ─────────────────────────────────────────────────────────
    effective_loss_pct = (confidence / 100) * loss_pct * (1 + weather_risk / 100)
    effective_loss_pct = min(effective_loss_pct, 1.0)   # Cap at 100% loss

    projected_loss  = round(total_value * effective_loss_pct)
    treatment_cost  = round(land_acres * 1200)           # ~Rs 1200/acre for treatment
    net_saving      = max(projected_loss - treatment_cost, 0)

    # PM Fasal Bima Yojana maximum coverage is Rs 2,00,000
    insurance_cover = min(projected_loss, 200000)

    # Risk classification for dashboard badge
    if projected_loss > 100000:
        risk_label = "SEVERE"
    elif projected_loss > 50000:
        risk_label = "HIGH"
    else:
        risk_label = "MODERATE"

    return {
        "crop":               crop_name,
        "land_acres":         land_acres,
        "msp_per_kg":         round(msp_per_kg, 2),
        "yield_per_acre_kg":  yield_per_ac,
        "total_value":        total_value,
        "effective_loss_pct": round(effective_loss_pct * 100, 1),
        "projected_loss":     projected_loss,
        "treatment_cost":     treatment_cost,
        "net_saving":         net_saving,
        "insurance_cover":    insurance_cover,
        "risk_label":         risk_label,
        "currency":           "INR",
    }