# =============================================================
# FILE: backend/core/predictor.py
# PURPOSE: Runs AI inference on uploaded crop image
#          Calculates health score, urgency, gets advice
# =============================================================

import io
import numpy as np
from PIL import Image
from core.model_loader import get_model, get_class_names

# ── EfficientNetB3 INPUT SIZE ─────────────────────────────────
# Your Kaggle model was trained with 300x300 images
# DO NOT CHANGE unless your Kaggle notebook used a different size
# Common sizes: 224 (EfficientNetB0), 260 (B2), 300 (B3), 380 (B4)
INPUT_SIZE = (300, 300)


# ══════════════════════════════════════════════════════════════
# PLANTVILLAGE 38-CLASS → 4 DISPLAY CATEGORY MAPPING
#
# Your AI model outputs one of 38 PlantVillage class names.
# We group those 38 classes into 4 simple display categories
# that are shown on the results dashboard.
#
# If your Kaggle model was trained on a CUSTOM subset of classes
# and has a class name NOT listed below, it will automatically
# go to "Leaf Spot" (see _fallback_category function at bottom)
# ══════════════════════════════════════════════════════════════
CATEGORY_MAP = {
    # ── LATE BLIGHT ───────────────────────────────────────────
    "Tomato___Late_blight":   "Late Blight",
    "Potato___Late_blight":   "Late Blight",

    # ── EARLY BLIGHT ──────────────────────────────────────────
    "Tomato___Early_blight":  "Early Blight",
    "Potato___Early_blight":  "Early Blight",

    # ── HEALTHY (all 14 healthy classes) ──────────────────────
    "Tomato___healthy":                       "Healthy",
    "Potato___healthy":                       "Healthy",
    "Apple___healthy":                        "Healthy",
    "Blueberry___healthy":                    "Healthy",
    "Cherry_(including_sour)___healthy":      "Healthy",
    "Corn_(maize)___healthy":                 "Healthy",
    "Grape___healthy":                        "Healthy",
    "Peach___healthy":                        "Healthy",
    "Pepper,_bell___healthy":                 "Healthy",
    "Raspberry___healthy":                    "Healthy",
    "Soybean___healthy":                      "Healthy",
    "Strawberry___healthy":                   "Healthy",

    # ── LEAF SPOT / BACTERIAL / VIRAL / FUNGAL ────────────────
    "Tomato___Leaf_Mold":                                 "Leaf Spot",
    "Tomato___Septoria_leaf_spot":                        "Leaf Spot",
    "Tomato___Spider_mites Two-spotted_spider_mite":      "Leaf Spot",
    "Tomato___Target_Spot":                               "Leaf Spot",
    "Tomato___Bacterial_spot":                            "Leaf Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus":             "Leaf Spot",
    "Tomato___Tomato_mosaic_virus":                       "Leaf Spot",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Leaf Spot",
    "Corn_(maize)___Common_rust_":                        "Leaf Spot",
    "Corn_(maize)___Northern_Leaf_Blight":                "Leaf Spot",
    "Apple___Apple_scab":                                 "Leaf Spot",
    "Apple___Black_rot":                                  "Leaf Spot",
    "Apple___Cedar_apple_rust":                           "Leaf Spot",
    "Cherry_(including_sour)___Powdery_mildew":           "Leaf Spot",
    "Grape___Black_rot":                                  "Leaf Spot",
    "Grape___Esca_(Black_Measles)":                       "Leaf Spot",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)":         "Leaf Spot",
    "Orange___Haunglongbing_(Citrus_greening)":            "Leaf Spot",
    "Peach___Bacterial_spot":                             "Leaf Spot",
    "Pepper,_bell___Bacterial_spot":                      "Leaf Spot",
    "Squash___Powdery_mildew":                            "Leaf Spot",
    "Strawberry___Leaf_scorch":                           "Leaf Spot",
}


# ── YIELD LOSS PER DISEASE ────────────────────────────────────
# pct is used in economic calculation
# label is shown on the results dashboard
# Source: ICAR research data for Indian conditions
YIELD_LOSS = {
    "Late Blight":  {"label": "50-80%", "pct": 0.65},
    "Early Blight": {"label": "20-40%", "pct": 0.30},
    "Leaf Spot":    {"label": "10-25%", "pct": 0.18},
    "Healthy":      {"label": "0%",     "pct": 0.00},
}

SEVERITY = {
    "Late Blight":  "High",
    "Early Blight": "Medium",
    "Leaf Spot":    "Low",
    "Healthy":      "None",
}


# ── CROP NAME BOOST ───────────────────────────────────────────
# When farmer types crop name (e.g. "Tomato") in the popup,
# matching AI classes get multiplied by 1.25
# This combines user knowledge with AI for better accuracy
# ─────────────────────────────────────────────────────────────
CROP_BOOST = {
    "tomato":       ["Tomato___"],
    "tamatar":      ["Tomato___"],          # Hindi for tomato
    "potato":       ["Potato___"],
    "aloo":         ["Potato___"],          # Hindi for potato
    "apple":        ["Apple___"],
    "corn":         ["Corn_(maize)___"],
    "maize":        ["Corn_(maize)___"],
    "makka":        ["Corn_(maize)___"],    # Hindi for corn
    "grape":        ["Grape___"],
    "angoor":       ["Grape___"],           # Hindi for grape
    "pepper":       ["Pepper,_bell___"],
    "shimla mirch": ["Pepper,_bell___"],    # Hindi for bell pepper
    "strawberry":   ["Strawberry___"],
    "peach":        ["Peach___"],
    "cherry":       ["Cherry_(including_sour)___"],
    "soybean":      ["Soybean___"],
    "squash":       ["Squash___"],
    "orange":       ["Orange___"],
    "raspberry":    ["Raspberry___"],
    "blueberry":    ["Blueberry___"],
}
BOOST_FACTOR = 1.25   # 25% boost for matching crop classes


# ══════════════════════════════════════════════════════════════
# DISEASE ADVICE DATABASE
# Source: ICAR guidelines + PlantVillage research + Indian agri
#
# Structure:
#   ADVICE_DB["Disease Name"]["crop name"] = {checklist, fungicides}
#   ADVICE_DB["Disease Name"]["default"]   = fallback for unknown crops
#
# Each checklist item has:
#   tier  → time urgency label
#   color → red=urgent, yellow=soon, green=this week, blue=future
#   items → list of specific actions
# ══════════════════════════════════════════════════════════════
ADVICE_DB = {

    "Late Blight": {
        "default": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Apply Metalaxyl + Mancozeb (Ridomil Gold) spray immediately",
                    "Remove and burn all visibly infected leaves and stems",
                    "Stop all overhead irrigation immediately",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Switch to drip irrigation to reduce leaf wetness",
                    "Apply foliar potassium (K2SO4) spray to boost immunity",
                    "Inspect neighbouring plants and isolate infected area",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Prune plant canopy to improve air circulation",
                    "Apply copper-based fungicide (Blitox 50) as protective cover",
                    "Get soil sample tested for nutrient deficiency",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use certified blight-resistant seed varieties",
                    "Follow 3-year crop rotation - avoid Solanaceae family",
                    "Apply pre-season soil treatment with Trichoderma viride",
                ]},
            ],
            "fungicides": [
                {"name": "Ridomil Gold (Metalaxyl+Mancozeb)", "dose": "2g/L water",   "timing": "Morning spray only",     "type": "Systemic"},
                {"name": "Dithane M-45 (Mancozeb 75WP)",      "dose": "2.5g/L water", "timing": "Every 7 days",           "type": "Contact"},
                {"name": "Blitox 50 (Copper Oxychloride)",    "dose": "3g/L water",   "timing": "Preventive use",         "type": "Contact"},
            ],
        },
        "tomato": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Spray Cymoxanil + Mancozeb (Curzate M8) - best for tomato Late Blight",
                    "Remove all black/brown lesion leaves immediately and burn them",
                    "Do NOT water today - rain expected, excess moisture worsens spread",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Switch to drip irrigation - Late Blight spreads 10x faster with wet leaves",
                    "Apply foliar spray of 0.5% K2SO4 to strengthen tomato cell walls",
                    "Check fruits for dark water-soaked spots - remove infected fruits",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Stake and prune tomato plants to reduce canopy humidity",
                    "Apply Trichoderma harzianum to soil around root zone",
                    "Send soil sample to nearest KVK for nutrient analysis",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use blight-resistant tomato varieties: Arka Rakshak, Pusa Hybrid-4",
                    "Maintain 60cm plant spacing for better airflow",
                    "Pre-treat seeds with Thiram 75WS at 3g/kg before sowing",
                ]},
            ],
            "fungicides": [
                {"name": "Curzate M8 (Cymoxanil+Mancozeb)", "dose": "2g/L water",   "timing": "Morning, every 5-7 days", "type": "Systemic"},
                {"name": "Ridomil Gold MZ (Metalaxyl)",      "dose": "2.5g/L water", "timing": "Morning spray only",      "type": "Systemic"},
                {"name": "Dithane M-45 (Mancozeb 75WP)",     "dose": "2.5g/L water", "timing": "Alternate with systemic", "type": "Contact"},
            ],
        },
        "potato": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Apply Metalaxyl 8% + Mancozeb 64% WP spray on all plants",
                    "Remove infected haulm (stems/leaves) - do not compost, burn them",
                    "Check tubers in storage - remove any showing rot symptoms",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Earth up potato beds to protect tubers from spore wash-in",
                    "Apply Cymoxanil spray - highly effective for potato Late Blight",
                    "Mark infected rows and monitor spread daily",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Consider early harvest if more than 30% plant area infected",
                    "Dry harvested tubers before storage - never store wet",
                    "Apply Bordeaux mixture (1%) as protective spray on healthy plants",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use certified disease-free seed potatoes only",
                    "Plant resistant varieties: Kufri Jyoti, Kufri Bahar",
                    "Avoid planting in fields with history of Late Blight",
                ]},
            ],
            "fungicides": [
                {"name": "Infinito (Fluopicolide+Propamocarb)", "dose": "1.5mL/L water", "timing": "Every 7 days",     "type": "Systemic"},
                {"name": "Ridomil Gold (Metalaxyl+Mancozeb)",   "dose": "2g/L water",    "timing": "Morning only",     "type": "Systemic"},
                {"name": "Bordeaux Mixture 1%",                  "dose": "10L/acre",       "timing": "Preventive spray", "type": "Contact"},
            ],
        },
    },

    "Early Blight": {
        "default": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Apply Mancozeb or Chlorothalonil fungicide spray",
                    "Remove lower leaves showing dark concentric ring spots",
                    "Avoid watering in the evening - water only in the morning",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply second spray of Iprodione or Difenoconazole",
                    "Clear plant debris and fallen leaves from the field",
                    "Apply balanced NPK fertiliser to boost plant immunity",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Mulch around plant base to prevent soil splash",
                    "Improve spacing between plants for better ventilation",
                    "Monitor daily and mark spread boundary",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use certified disease-free seeds",
                    "Rotate crops - avoid same family 2 years in a row",
                    "Apply Trichoderma viride in soil before planting",
                ]},
            ],
            "fungicides": [
                {"name": "Dithane M-45 (Mancozeb 75WP)",  "dose": "2.5g/L water", "timing": "Every 7-10 days", "type": "Contact"},
                {"name": "Score 250EC (Difenoconazole)",   "dose": "1mL/L water",  "timing": "Every 14 days",   "type": "Systemic"},
                {"name": "Kavach (Chlorothalonil 75WP)",   "dose": "2g/L water",   "timing": "Preventive use",  "type": "Contact"},
            ],
        },
        "tomato": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Remove all lower leaves with dark bullseye ring spots",
                    "Apply Mancozeb 75WP (Indofil M-45) spray at 2.5g per litre",
                    "Avoid wetting leaves while watering - use base irrigation only",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply Score 250EC (Difenoconazole) for systemic control",
                    "Remove fallen diseased leaves from soil surface",
                    "Top-dress with calcium nitrate to strengthen cell walls",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Apply straw mulch to prevent soil splash onto leaves",
                    "Stake plants to keep foliage off the ground",
                    "Check for Septoria leaf spot - often occurs alongside Early Blight",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use resistant varieties: Pusa Ruby, Arka Vikas",
                    "Seed treatment with Thiram or Captan before sowing",
                    "Maintain 2-year rotation with non-Solanaceae crops",
                ]},
            ],
            "fungicides": [
                {"name": "Indofil M-45 (Mancozeb 75WP)", "dose": "2.5g/L water", "timing": "Every 7 days",  "type": "Contact"},
                {"name": "Score 250EC (Difenoconazole)", "dose": "1mL/L water",  "timing": "Every 14 days", "type": "Systemic"},
                {"name": "Amistar (Azoxystrobin 23SC)",  "dose": "1mL/L water",  "timing": "At first sign", "type": "Systemic"},
            ],
        },
        "potato": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Spray Mancozeb 75WP at 2.5g/L on all potato plants",
                    "Remove and destroy infected lower leaves immediately",
                    "Reduce irrigation frequency if soil moisture is already high",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply Difenoconazole for deeper systemic action",
                    "Earth up potato ridges to reduce humidity at plant base",
                    "Apply micronutrient booster spray (zinc and boron)",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Survey 10 plants per row to assess spread rate",
                    "Apply Bordeaux mixture as protective spray on healthy rows",
                    "Plan early harvest if disease covers more than 25% of canopy",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use certified seed tubers from disease-free stock",
                    "Plant resistant varieties: Kufri Sindhuri, Kufri Chandramukhi",
                    "Deep plough after harvest to bury infected crop debris",
                ]},
            ],
            "fungicides": [
                {"name": "Indofil M-45 (Mancozeb 75WP)", "dose": "2.5g/L water", "timing": "Every 7-10 days",  "type": "Contact"},
                {"name": "Tilt 25EC (Propiconazole)",     "dose": "1mL/L water",  "timing": "At first symptom", "type": "Systemic"},
                {"name": "Kavach (Chlorothalonil 75WP)",  "dose": "2g/L water",   "timing": "Preventive spray", "type": "Contact"},
            ],
        },
    },

    "Leaf Spot": {
        "default": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Remove and destroy all visibly spotted leaves",
                    "Apply copper-based fungicide (Blitox 50) spray immediately",
                    "Reduce irrigation - waterlogged soil worsens spread",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply Carbendazim 50WP (Bavistin) for systemic control",
                    "Clear all plant debris from around plant base",
                    "Spray Neem oil solution (5mL/L) as organic supplement",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Improve drainage in field if waterlogging is present",
                    "Apply NPK fertiliser - deficient plants are more susceptible",
                    "Monitor spread rate - increase spray if over 20% leaves affected",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use disease-free certified seeds",
                    "Practice crop rotation with non-host crops",
                    "Pre-season Trichoderma viride soil treatment",
                ]},
            ],
            "fungicides": [
                {"name": "Bavistin (Carbendazim 50WP)",    "dose": "1g/L water",  "timing": "Every 10-14 days", "type": "Systemic"},
                {"name": "Blitox 50 (Copper Oxychloride)", "dose": "3g/L water",  "timing": "Preventive use",   "type": "Contact"},
                {"name": "Neem Oil 1500ppm",                "dose": "5mL/L water", "timing": "Weekly organic",   "type": "Bio"},
            ],
        },
        "tomato": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Identify spot type - small dark spots = Septoria, yellow halo = Bacterial",
                    "Remove all infected leaves below the 1st fruit cluster",
                    "Apply Carbendazim + Mancozeb combination spray",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply copper hydroxide (Kocide 3000) for bacterial spot",
                    "Avoid working in field when plants are wet - spreads bacteria",
                    "Spray Azoxystrobin for fungal leaf mold and target spot",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Stake plants and tie up drooping branches off the ground",
                    "Remove suckers from lower 30cm of stem for better airflow",
                    "Apply calcium spray to strengthen leaves",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use resistant hybrids: Arka Samrat, Namdhari NS-585",
                    "Strict field sanitation - remove all residue after harvest",
                    "Seed treatment with Streptomycin sulfate for bacterial spot",
                ]},
            ],
            "fungicides": [
                {"name": "Amistar Top (Azoxystrobin+Difenoconazole)", "dose": "1mL/L water",  "timing": "Every 10 days",      "type": "Systemic"},
                {"name": "Kocide 3000 (Copper Hydroxide)",            "dose": "1.5g/L water", "timing": "For bacterial spot", "type": "Contact"},
                {"name": "Bavistin (Carbendazim 50WP)",               "dose": "1g/L water",   "timing": "Every 14 days",      "type": "Systemic"},
            ],
        },
        "corn": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Spray Propiconazole (Tilt 25EC) for Gray Leaf Spot and Cercospora",
                    "Remove severely infected lower leaves from plant base",
                    "Check for orange rust pustules - act immediately if found",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply second fungicide if rust covers more than 5% leaf area",
                    "Apply potassium-rich fertiliser to boost disease resistance",
                    "Document infection percentage per row for insurance claim",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Monitor tassel and ear leaves - protect these at all cost",
                    "Apply foliar zinc spray - deficiency increases rust risk",
                    "Survey each row and record infection spread",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Use rust-resistant hybrid maize: DKC 9144, Pioneer 30V92",
                    "Early sowing to escape peak rust season",
                    "Seed treatment with Thiram + Carbendazim",
                ]},
            ],
            "fungicides": [
                {"name": "Tilt 25EC (Propiconazole)",             "dose": "1mL/L water",  "timing": "At first rust sign", "type": "Systemic"},
                {"name": "Nativo (Tebuconazole+Trifloxystrobin)", "dose": "0.5g/L water", "timing": "Every 14 days",      "type": "Systemic"},
                {"name": "Dithane M-45 (Mancozeb 75WP)",          "dose": "2.5g/L water", "timing": "Preventive use",     "type": "Contact"},
            ],
        },
        "grape": {
            "checklist": [
                {"tier": "Do TODAY", "color": "red", "items": [
                    "Spray Mancozeb 75WP for black rot and leaf blight on grapes",
                    "Remove and destroy all mummified fruits - primary infection source",
                    "Prune dead wood and canes showing dark canker lesions",
                ]},
                {"tier": "Within 3 Days", "color": "yellow", "items": [
                    "Apply Myclobutanil (Rally 40WP) for systemic black rot control",
                    "Train vines to improve canopy aeration and sunlight penetration",
                    "Apply lime sulfur spray during dormant period if available",
                ]},
                {"tier": "This Week", "color": "green", "items": [
                    "Thin fruit clusters in heavily infected vines",
                    "Apply potassium silicate foliar spray for resistance",
                    "Install bird netting to reduce wound entry points",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Pre-bud-break copper spray - key preventive step each year",
                    "Remove all infected debris before new season growth starts",
                    "Plant disease-tolerant rootstocks where possible",
                ]},
            ],
            "fungicides": [
                {"name": "Dithane M-45 (Mancozeb 75WP)", "dose": "2.5g/L water", "timing": "Every 10 days",       "type": "Contact"},
                {"name": "Rally 40WP (Myclobutanil)",     "dose": "0.4g/L water", "timing": "Every 14 days",       "type": "Systemic"},
                {"name": "Copper Oxychloride 50WP",       "dose": "3g/L water",   "timing": "Pre-bud protective",  "type": "Contact"},
            ],
        },
    },

    "Healthy": {
        "default": {
            "checklist": [
                {"tier": "Keep it Up!", "color": "green", "items": [
                    "Your crop looks healthy - continue your current practices",
                    "Maintain regular inspection every 3-4 days",
                    "Keep field clean - remove weeds and debris regularly",
                ]},
                {"tier": "Preventive Care", "color": "blue", "items": [
                    "Apply preventive Mancozeb spray before monsoon season",
                    "Ensure balanced NPK nutrition to maintain plant immunity",
                    "Check weather forecast before high humidity period",
                ]},
                {"tier": "This Season", "color": "green", "items": [
                    "Document your field practices for replication next season",
                    "Consider Soil Health Card test to optimise fertiliser use",
                    "Register for PM Fasal Bima Yojana as early precaution",
                ]},
                {"tier": "Next Season", "color": "blue", "items": [
                    "Continue certified seed usage",
                    "Maintain crop rotation schedule",
                    "Pre-season Trichoderma soil inoculation",
                ]},
            ],
            "fungicides": [
                {"name": "Dithane M-45 (Mancozeb 75WP)", "dose": "2g/L water",  "timing": "Preventive pre-monsoon", "type": "Contact"},
                {"name": "Trichoderma viride 1% WP",      "dose": "5g/L water",  "timing": "Soil drench",            "type": "Bio"},
                {"name": "Neem Oil 1500ppm",               "dose": "5mL/L water", "timing": "Weekly preventive",      "type": "Bio"},
            ],
        },
    },
}


# ══════════════════════════════════════════════════════════════
# HEALTH SCORE CALCULATION
#
# Formula uses all three data sources:
#   1. AI confidence  → how sure the model is about the disease
#   2. yield_loss_pct → how much crop damage this disease causes
#   3. weather_risk   → how bad current weather conditions are
#
# Penalty breakdown (max total = 10 points deducted):
#   confidence_penalty = (confidence/100) * 3.5   → max 3.5
#   loss_penalty       = loss_pct * 4.0            → max 4.0
#   weather_penalty    = (weather_risk/100) * 2.5  → max 2.5
#   health_score       = 10 - total_penalty
# ══════════════════════════════════════════════════════════════
def calculate_health_score(confidence, loss_pct, weather_risk, disease):
    if disease == "Healthy":
        base = 9.0 - (weather_risk / 100) * 2.0
        return max(7, min(10, round(base)))

    confidence_penalty = (confidence / 100) * 3.5
    loss_penalty       = loss_pct * 4.0
    weather_penalty    = (weather_risk / 100) * 2.5
    score = 10.0 - (confidence_penalty + loss_penalty + weather_penalty)
    return max(1, min(9, round(score)))


# ══════════════════════════════════════════════════════════════
# URGENCY TIMELINE CALCULATION
#
# Based on AI confidence %:
#   90%+ → 12 hours (very urgent)
#   80%+ → 24 hours
#   70%+ → 36 hours
#   60%+ → 48 hours
#   <60% → 72 hours
#
# Weather risk reduces the window further:
#   risk >= 75 → subtract 12 more hours
#   risk >= 55 → subtract 6 more hours
#
# Late Blight always gets 6 extra hours removed
# (fastest spreading disease)
# ══════════════════════════════════════════════════════════════
def calculate_urgency(confidence, disease, weather_risk):
    if disease == "Healthy":
        return {
            "hours": None, "label": "No Urgent Action",
            "description": "Crop is healthy. Maintain regular monitoring every 3-4 days.",
            "critical": False,
        }

    if   confidence >= 90: base_hours = 12
    elif confidence >= 80: base_hours = 24
    elif confidence >= 70: base_hours = 36
    elif confidence >= 60: base_hours = 48
    else:                  base_hours = 72

    if weather_risk >= 75: base_hours = max(6,  base_hours - 12)
    elif weather_risk >= 55: base_hours = max(12, base_hours - 6)

    if disease == "Late Blight":
        base_hours = max(6, base_hours - 6)

    if base_hours <= 12:
        desc = f"EMERGENCY: {disease} spreading rapidly. Spray window closing fast."
    elif base_hours <= 24:
        desc = f"URGENT: AI is {confidence:.0f}% confident of {disease}. Spray before next rainfall."
    elif base_hours <= 36:
        desc = f"HIGH PRIORITY: {confidence:.0f}% confidence. Act before weather worsens."
    else:
        desc = f"MODERATE: {confidence:.0f}% confidence. Begin treatment within {base_hours}h."

    return {
        "hours": base_hours,
        "label": f"Act within {base_hours} hours",
        "description": desc,
        "critical": base_hours <= 24,
    }


def get_advice(disease, crop_name):
    """Returns checklist + fungicides specific to disease + crop."""
    disease_data = ADVICE_DB.get(disease, ADVICE_DB["Leaf Spot"])
    crop_key = crop_name.lower().strip() if crop_name else ""

    # Try exact match first
    if crop_key and crop_key in disease_data:
        return disease_data[crop_key]

    # Try Hindi aliases
    alias_map = {
        "tamatar": "tomato", "aloo": "potato",
        "makka": "corn",  "makki": "corn",
        "angoor": "grape", "mirch": "pepper",
    }
    mapped = alias_map.get(crop_key, crop_key)
    if mapped in disease_data:
        return disease_data[mapped]

    return disease_data.get("default", ADVICE_DB["Leaf Spot"]["default"])


# ══════════════════════════════════════════════════════════════
# IMAGE PREPROCESSING
#
# Converts uploaded image → tensor for EfficientNetB3
#
# IMPORTANT — NORMALISATION OPTIONS:
#
# Option A (default, uncommented):
#   arr = arr / 255.0
#   Use this if your Kaggle notebook did NOT use
#   EfficientNet's preprocess_input function
#
# Option B (commented out):
#   from tensorflow.keras.applications.efficientnet import preprocess_input
#   arr = preprocess_input(arr)
#   Uncomment this if your Kaggle notebook code had:
#     from tensorflow.keras.applications.efficientnet import preprocess_input
#   AND you called preprocess_input() on training images
#
# HOW TO CHECK WHICH ONE TO USE:
#   Open your Kaggle notebook
#   Search for "preprocess_input"
#   If it's there and used → use Option B
#   If not → use Option A (default)
# ══════════════════════════════════════════════════════════════
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(INPUT_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)

    # ── OPTION A: Simple normalisation (DEFAULT - use this first) ─
    arr = arr / 255.0

    # ── OPTION B: EfficientNet preprocess_input ───────────────────
    # Uncomment these 2 lines AND comment out the line above
    # if your Kaggle notebook used preprocess_input during training:
    # from tensorflow.keras.applications.efficientnet import preprocess_input
    # arr = preprocess_input(arr)   # NOTE: pass raw 0-255 pixel values

    return np.expand_dims(arr, axis=0)   # shape: (1, 300, 300, 3)


# ══════════════════════════════════════════════════════════════
# MAIN INFERENCE FUNCTION
# Called by routes/predict_routes.py for every image upload
# ══════════════════════════════════════════════════════════════
def run_inference(image_bytes, crop_name="", weather_risk=50):
    model       = get_model()
    class_names = get_class_names()

    # No model loaded → return demo data
    if model is None or not class_names:
        return _demo_result(crop_name, weather_risk)

    try:
        # Step 1: Resize and normalize image
        tensor = preprocess_image(image_bytes)

        # Step 2: Run EfficientNetB3 inference
        # ── YOUR KAGGLE MODEL RUNS HERE ──────────────────────
        # model is loaded from backend/plant_model.h5
        # tensor shape: (1, 300, 300, 3)
        # raw_preds shape: (num_classes,) e.g. (38,) or (12,)
        # ─────────────────────────────────────────────────────
        raw_preds = model.predict(tensor, verbose=0)[0]

        # Step 3: Apply crop name boost (user input + AI combined)
        preds = _apply_crop_boost(raw_preds, class_names, crop_name)

        # Step 4: Get top predicted class
        top_idx   = int(np.argmax(preds))
        top_class = class_names[top_idx]
        top_conf  = float(preds[top_idx]) * 100

        # Step 5: Map to display category
        display_category = CATEGORY_MAP.get(top_class, _fallback_category(top_class))

        # Step 6: Aggregate all class scores into 4 display buckets
        all_scores = _aggregate_scores(preds, class_names)

        # Step 7: Get yield loss data
        yl  = YIELD_LOSS.get(display_category, YIELD_LOSS["Leaf Spot"])
        sev = SEVERITY.get(display_category, "Medium")

        # Step 8: Calculate health score from AI + weather + yield
        health_score = calculate_health_score(top_conf, yl["pct"], weather_risk, display_category)

        # Step 9: Calculate urgency from AI confidence + weather
        urgency = calculate_urgency(top_conf, display_category, weather_risk)

        # Step 10: Get per-disease per-crop advice
        advice = get_advice(display_category, crop_name)

        return {
            "disease":      display_category,
            "raw_class":    top_class,        # Full PlantVillage class name
            "confidence":   round(top_conf, 1),
            "severity":     sev,
            "yield_loss":   yl["label"],
            "loss_pct":     yl["pct"],
            "all_scores":   all_scores,
            "health_score": health_score,
            "urgency":      urgency,
            "checklist":    advice["checklist"],
            "fungicides":   advice["fungicides"],
            "demo":         False,
        }

    except Exception as e:
        print(f"Inference error: {e}")
        return _demo_result(crop_name, weather_risk)


# ── Internal helpers ─────────────────────────────────────────

def _apply_crop_boost(preds, class_names, crop_name):
    if not crop_name:
        return preds
    boosted  = preds.copy()
    key      = crop_name.lower().strip()
    prefixes = CROP_BOOST.get(key, [])
    if not prefixes:
        alias = {"tamatar":"tomato","aloo":"potato","makka":"corn","angoor":"grape"}
        prefixes = CROP_BOOST.get(alias.get(key, ""), [])
    for i, cls in enumerate(class_names):
        if any(cls.startswith(p) for p in prefixes):
            boosted[i] = min(boosted[i] * BOOST_FACTOR, 1.0)
    total = boosted.sum()
    if total > 0:
        boosted = boosted / total
    return boosted


def _aggregate_scores(preds, class_names):
    buckets = {"Late Blight":0.0,"Early Blight":0.0,"Leaf Spot":0.0,"Healthy":0.0}
    for i, cls in enumerate(class_names):
        bucket = CATEGORY_MAP.get(cls, _fallback_category(cls))
        if bucket in buckets:
            buckets[bucket] += float(preds[i])
    total = sum(buckets.values()) or 1.0
    return {k: round((v/total)*100, 1) for k, v in buckets.items()}


def _fallback_category(class_name):
    return "Healthy" if "healthy" in class_name.lower() else "Leaf Spot"


def _demo_result(crop_name="", weather_risk=50):
    """Shown when plant_model.h5 is not yet placed in backend/"""
    print("Demo mode - plant_model.h5 not found")
    confidence = 87.4
    loss_pct   = 0.65
    disease    = "Late Blight"
    health     = calculate_health_score(confidence, loss_pct, weather_risk, disease)
    urgency    = calculate_urgency(confidence, disease, weather_risk)
    advice     = get_advice(disease, crop_name or "tomato")
    return {
        "disease":      disease,
        "raw_class":    "Tomato___Late_blight",
        "confidence":   confidence,
        "severity":     "High",
        "yield_loss":   "50-80%",
        "loss_pct":     loss_pct,
        "all_scores":   {"Late Blight":87.4,"Early Blight":7.2,"Leaf Spot":3.8,"Healthy":1.6},
        "health_score": health,
        "urgency":      urgency,
        "checklist":    advice["checklist"],
        "fungicides":   advice["fungicides"],
        "demo":         True,
    }