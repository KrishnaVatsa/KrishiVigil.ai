# =============================================================
# FILE: backend/core/model_loader.py
# PURPOSE: Loads your Kaggle EfficientNetB3 .h5 model ONCE
#          at startup and keeps it in memory for fast inference
# =============================================================

import os

# ── These hold model in memory across all requests ────────────
_model       = None   # TensorFlow model object
_class_names = None   # List of class name strings
_num_classes = None   # Number of output classes (int)


# ══════════════════════════════════════════════════════════════
# STEP 1 — MODEL FILE LOCATION
#
# After downloading your model from Kaggle:
#   1. Go to your Kaggle notebook → Output tab
#   2. Download the .h5 file (e.g. plant_disease_model.h5)
#   3. Rename it to:  plant_model.h5
#   4. Place it at:   backend/plant_model.h5
#
# Full path example on Windows:
#   C:\Users\wtcaa\krishivigil\backend\plant_model.h5
# ══════════════════════════════════════════════════════════════
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "plant_model.h5")


# ── STANDARD PLANTVILLAGE 38-CLASS ORDER ─────────────────────
# These class names are in the EXACT alphabetical order that
# Kaggle's ImageDataGenerator assigns integer labels (0 to 37)
# when it reads the PlantVillage dataset folders.
#
# Class 0  = Apple___Apple_scab
# Class 1  = Apple___Black_rot
# ... and so on
#
# DO NOT CHANGE THE ORDER — it must match your training
# ─────────────────────────────────────────────────────────────
PLANTVILLAGE_38 = [
    "Apple___Apple_scab",                                       # class 0
    "Apple___Black_rot",                                        # class 1
    "Apple___Cedar_apple_rust",                                 # class 2
    "Apple___healthy",                                          # class 3
    "Blueberry___healthy",                                      # class 4
    "Cherry_(including_sour)___Powdery_mildew",                 # class 5
    "Cherry_(including_sour)___healthy",                        # class 6
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",       # class 7
    "Corn_(maize)___Common_rust_",                              # class 8
    "Corn_(maize)___Northern_Leaf_Blight",                      # class 9
    "Corn_(maize)___healthy",                                   # class 10
    "Grape___Black_rot",                                        # class 11
    "Grape___Esca_(Black_Measles)",                             # class 12
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",               # class 13
    "Grape___healthy",                                          # class 14
    "Orange___Haunglongbing_(Citrus_greening)",                  # class 15
    "Peach___Bacterial_spot",                                   # class 16
    "Peach___healthy",                                          # class 17
    "Pepper,_bell___Bacterial_spot",                            # class 18
    "Pepper,_bell___healthy",                                   # class 19
    "Potato___Early_blight",                                    # class 20
    "Potato___Late_blight",                                     # class 21
    "Potato___healthy",                                         # class 22
    "Raspberry___healthy",                                      # class 23
    "Soybean___healthy",                                        # class 24
    "Squash___Powdery_mildew",                                  # class 25
    "Strawberry___Leaf_scorch",                                 # class 26
    "Strawberry___healthy",                                     # class 27
    "Tomato___Bacterial_spot",                                  # class 28
    "Tomato___Early_blight",                                    # class 29
    "Tomato___Late_blight",                                     # class 30
    "Tomato___Leaf_Mold",                                       # class 31
    "Tomato___Septoria_leaf_spot",                              # class 32
    "Tomato___Spider_mites Two-spotted_spider_mite",            # class 33
    "Tomato___Target_Spot",                                     # class 34
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",                   # class 35
    "Tomato___Tomato_mosaic_virus",                             # class 36
    "Tomato___healthy",                                         # class 37
]


def load_model_once():
    """
    Called ONCE when Flask starts in app.py.
    Loads the .h5 file and auto-detects output class count.
    """
    global _model, _class_names, _num_classes

    # Already loaded — skip
    if _model is not None:
        return _model

    # ── CHECK IF MODEL FILE EXISTS ────────────────────────────
    # If plant_model.h5 is NOT in backend/ folder:
    #   → Prints warning message in terminal
    #   → App runs in Demo Mode (fake results shown)
    #   → No crash
    # ─────────────────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        print(f"  WARNING: plant_model.h5 NOT found at:")
        print(f"  {os.path.abspath(MODEL_PATH)}")
        print("  Running in DEMO MODE — place model file to enable AI\n")
        _model       = None
        _class_names = []
        _num_classes = 0
        return None

    # ── LOAD THE MODEL ────────────────────────────────────────
    print(f"  Loading AI model from: {os.path.abspath(MODEL_PATH)}")
    try:
        # ══════════════════════════════════════════════════════
        # TensorFlow loads your Kaggle-trained EfficientNetB3
        # This may take 10-30 seconds on first load
        # ══════════════════════════════════════════════════════
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)

        # ── AUTO-DETECT CLASS COUNT ───────────────────────────
        # Reads the final Dense layer output shape
        # e.g. (None, 38) → 38 classes
        # e.g. (None, 12) → 12 classes (custom subset)
        # No hardcoding needed — works with any PlantVillage model
        # ─────────────────────────────────────────────────────
        output_shape = _model.output_shape
        _num_classes = output_shape[-1]
        print(f"  Model loaded — {_num_classes} output classes detected")

        # ── ASSIGN CLASS NAMES ────────────────────────────────
        if _num_classes == 38:
            # Standard full PlantVillage dataset
            _class_names = PLANTVILLAGE_38
            print("  Using: Full 38-class PlantVillage labels")

        elif _num_classes <= 38:
            # Custom subset — pick first N classes alphabetically
            # This matches how Kaggle ImageDataGenerator orders them
            _class_names = sorted(PLANTVILLAGE_38)[:_num_classes]
            print(f"  Using: Auto-detected {_num_classes}-class subset")

        else:
            # ══════════════════════════════════════════════════
            # IF YOUR MODEL HAS MORE THAN 38 CLASSES:
            # Your Kaggle notebook might use a different dataset.
            # In that case, open your Kaggle notebook and find
            # the class_names list printed by your code, then
            # paste it here manually:
            #
            # _class_names = [
            #     "your_class_0",
            #     "your_class_1",
            #     ...
            # ]
            # ══════════════════════════════════════════════════
            _class_names = [f"class_{i}" for i in range(_num_classes)]
            print(f"  WARNING: {_num_classes} classes detected (more than 38)")
            print("  Manually set class names in model_loader.py if needed")

        return _model

    except Exception as e:
        print(f"  ERROR loading model: {e}")
        print("  Check that tensorflow is installed: pip install tensorflow==2.15.0")
        _model       = None
        _class_names = []
        _num_classes = 0
        return None


def get_model():
    """Returns the loaded TensorFlow model, or None in demo mode."""
    return _model


def get_class_names():
    """Returns list of class name strings matching model output."""
    return _class_names or []


def get_num_classes():
    """Returns integer count of output classes."""
    return _num_classes or 0