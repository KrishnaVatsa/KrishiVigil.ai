## KrishiVigil.ai
"SMART CROP PROTECTION"

## Description:-                                                                                                      
KrishiVigil.ai is an AI-powered agriculture platform that helps farmers detect crop diseases early using computer vision. 
Farmers can upload images of any infected part of a crop (leaf, fruit, stem, or plant surface). The system analyzes the image using a deep learning model and generates a complete crop health report including disease prediction, confidence score, yield loss estimation, treatment suggestions, weather risk analysis, and government scheme recommendations.

## Features:-
- 🌿 AI-based crop disease detection from leaf, fruit, stem, or any infected plant area 
- 📊 Crop health score and disease severity analysis
- ⏱ Treatment urgency timeline
- 🧪 Smart treatment and fungicide recommendations
- 🌦 Weather risk intelligence for disease spread
- 💰 Crop loss and financial impact estimation
- 🏛 Government scheme recommendations for farmers
- 📄 Downloadable crop health report 
  
## AI Model:-
- Dataset: PlantVillage Dataset (Kaggle)
- Framework: TensorFlow / Keras
- Architecture: EfficientNetB3 (Transfer Learning)
- Training Platform: Kaggle Notebook
- Validation Accuracy: ~99%
The trained model is exported as a `.h5` file and integrated with the Flask backend for real-time disease prediction.

 ## Tech Stack:-
 - Frontend: React + Vite
- Backend: Flask (Python 3.11)
- AI Model: EfficientNetB3 trained on PlantVillage dataset (Kaggle)
  99.6% accuracy, 38 classes, exported as plant_model.h5
- Weather: OpenWeatherMap free API (key: c8d59e65197776ffdefe8cdcf61e726e)

## FOLDER STRUCTURE:-
C:\Users\wtcaa\krishivigil\
├── frontend\
│   └── src\
│       └── App.jsx         (single file React app — all UI here)
└── backend\
    ├── app.py              (Flask entry point)
    ├── plant_model.h5      (Kaggle EfficientNetB3 model)
    ├── requirements.txt
    ├── users.json                 ← user accounts (auto-created)
    ├── scans.json                 ← persistent scan history (auto-created)
    ├── downloads.json             ← persistent download records (auto-created)
    ├── core/
    │   ├── model_loader.py        ← loads .pt once at startup
    │   └── predictor.py          ← inference, crop filter, health score, ADVICE_DB
    ├── routes/
    │   ├── auth_routes.py         ← POST /auth/register, POST /auth/login
    │   ├── predict_routes.py      ← POST /predict
    │   ├── weather_routes.py      ← GET  /weather
    │   ├── scan_routes.py         ← POST /scans/save, GET /scans/history
    │   └── download_routes.py     ← POST /downloads/save, GET /downloads/list
    ├── services/
    │   └── weather_service.py     ← OpenWeatherMap API + disease risk scoring
    └── engines/
        └── economic_engine.py     ← ₹ loss calculator using MSP + yield tables
```

---

## 🔄 How It Works — Full Request Flow

1. Farmer opens app → browser requests GPS location
2. App calls `GET /weather?lat=X&lon=Y` → live weather data loads on home screen
3. Farmer fills crop name + land size popup, then uploads a crop image
4. App calls `POST /predict` with `FormData`: `image`, `crop`, `land`, `lat`, `lon`
5. Flask pipeline runs:
   - `get_weather_by_coords(lat, lon)` → risk score (0–100)
   - `run_inference(image_bytes, crop_name, weather_risk)` → YOLOv8 predicts
   - `_apply_crop_boost()` → boosts scores for user's selected crop class
   - `_apply_crop_filter()` → overrides wrong-crop result with correct crop's best match
   - `calculate_loss(...)` → economic loss in ₹
6. JSON response returned to React
7. Frontend renders: health score, urgency timeline, disease name + confidence bars, action checklist, fungicide table, weather risk card, economic loss, government schemes
8. Analysis saved permanently to `scans.json` via `POST /scans/save`
9. If user downloads report → saved permanently to `downloads.json` via `POST /downloads/save`

---

## 🧮 Key Calculations

**Health Score (1–10)**
```
score = 10 - [(confidence/100 × 3.5) + (loss_pct × 4.0) + (weather_risk/100 × 2.5)]
```

**Urgency Hours**
```
Starts at 72h for low confidence predictions
Shrinks to 6h at 90%+ confidence + high-severity disease + high weather risk
Emergency diseases (Late Blight, Yellow Rust, Blast, Viral) get additional -6h penalty
```

**Economic Loss (₹)**
```
effective_loss = (confidence/100) × yield_loss_pct × (1 + weather_risk/100)
projected_loss = land_acres × yield_per_acre × MSP_per_quintal × effective_loss
```

**Weather Risk Score (0–100)**
```
Calculated from: temperature range, humidity (>80% = high risk),
rain probability, wind speed — thresholds vary per crop
```

---

## 🖥 Running Locally

### Backend

```bash
cd backend

# Install dependencies
pip install flask==3.0.2 flask-cors==4.0.0 Pillow==10.2.0 numpy==1.26.4 requests==2.31.0

# Install YOLOv8 (auto-installs torch + torchvision)
pip install ultralytics

# Place your trained model at backend/plant_model_yolo.pt

# Start server
py -3.11 app.py

```

### Frontend

```bash
cd frontend
npm install
npm run dev

```

> ⚠️ Start the backend **before** opening the frontend, otherwise Demo Mode activates.

---

## 🔌 API Endpoints

### `POST /predict`

Runs AI disease detection on an uploaded image.

**Request** — `multipart/form-data`:

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | file | ✅ | Crop photo (JPEG/PNG) |
| `crop` | string | optional | Crop name (English or Hindi/regional) |
| `land` | float | optional | Land size in acres |
| `lat` | float | optional | GPS latitude (defaults to Ludhiana) |
| `lon` | float | optional | GPS longitude (defaults to Ludhiana) |

**Response** — JSON:
```json
{
  "disease": "Maize Common Rust",
  "raw_class": "Corn_(maize)___Common_rust_",
  "confidence": 94.3,
  "severity": "Medium",
  "yield_loss": "15-40%",
  "loss_pct": 0.28,
  "health_score": 4,
  "urgency": { "hours": 24, "label": "Act within 24 hours", "critical": true },
  "all_scores": { "Maize Common Rust": 94.3, "Maize Healthy": 3.1 },
  "checklist": [...],
  "fungicides": [...],
  "weather_tip": { "high_risk_temp": "...", "warning": "..." },
  "economics": { "projected_loss": 47880, "treatment_cost": 4200 },
  "weather": { "temperature": 28, "humidity": 82, "risk_score": 76 },
  "demo": false
}
```

### `POST /auth/register`
Creates a new user account. Body: `{ name, mobile_or_email, password }`

### `POST /auth/login`
Signs in existing user. Body: `{ mobile_or_email, password }`. Returns `token`.

### `POST /scans/save`
Saves an analysis to the user's permanent history. Requires `Authorization: Bearer <token>`.

### `GET /scans/history`
Returns all past scans for the logged-in user. Requires `Authorization: Bearer <token>`.

### `POST /downloads/save`
Saves a downloaded report record permanently. Requires `Authorization: Bearer <token>`.

### `GET /downloads/list`
Returns all saved download records for the logged-in user. Requires `Authorization: Bearer <token>`.

### `GET /weather?lat=X&lon=Y`
Returns live weather data and disease risk score for given GPS coordinates.

### `GET /`
Health check — lists all registered endpoints.

---

## 💾 Persistent Storage

User data survives backend restarts via JSON file storage:

| File | Contents |
|---|---|
| `backend/users.json` | User accounts (name, mobile/email, hashed password, token) |
| `backend/scans.json` | All scan history across all users (filtered by user_id on read) |
| `backend/downloads.json` | All downloaded report records (filtered by user_id on read) |

All three files are auto-created on first run. Back them up to preserve user data permanently.

---

## 🏛 Government Schemes

Government scheme matching is computed **entirely in the frontend** (`App.jsx`). The `SCHEMES` array in `constants/schemes.js` contains 15+ central and state government schemes. Eligibility is checked dynamically using the farmer's detected crop, economic loss amount, and GPS-detected state. No backend API call is made for schemes.

Schemes covered include:
- **Central:** PM-FASAL BIMA YOJANA, PM-KISAN, RKVY, PMKSY, Kisan Credit Card
- **State-level:** Punjab/Haryana, UP/Bihar, Maharashtra/Gujarat, Rajasthan/MP, AP/Telangana/Karnataka

---


---

## 📦 Dependencies

### Backend (`backend/requirements.txt`)
```
flask==3.0.2
flask-cors==4.0.0
Pillow==10.2.0
numpy==1.26.4
requests==2.31.0
ultralytics>=8.2.0
```

### Frontend (`frontend/package.json`)
```
react: ^19.2.0
react-dom: ^19.2.0
vite: ^7.3.1
```

---

## ⚠️ Important Notes

- `plant_model_yolo.pt` is **not included** in this repository (too large for GitHub). Train it on Kaggle using the New Plant Diseases Dataset extended with Rice and Wheat classes, or download from the Releases section.
- The OpenWeatherMap API key in `weather_service.py` is a free-tier key. If it expires, create a new account at [openweathermap.org](https://openweathermap.org) and replace it.
- Flask backend must be running **before** opening the React frontend, otherwise Demo Mode activates.
- The crop filter system ensures the AI never returns a wrong-crop disease even when model confidence is very high for an incorrect class.
- Scan history and downloads are stored in `scans.json` and `downloads.json` — these files persist across all restarts and should be backed up.



## 📸 Application Screenshots

### Home Screen
<p>
  <img src="screenshots/home.png" width="300">
  <img src="screenshots/home2.png" width="300">
</p>

### Profile
<img src="screenshots/profilewindow.png" width="300">

### Language Change
<img src="screenshots/languagechange.png" width="300">

### Image Upload
<img src="screenshots/upload.png" width="300">

### Farm Details Input
<img src="screenshots/farmdetailsinput.png" width="300">

### Result Dashboard
<img src="screenshots/resultdashboard.png" width="300">

### Disease Detection Result
<img src="screenshots/result.png" width="300">

### Treatment Recommendations & Action Plan
<img src="screenshots/treatment.png" width="300">

### Weather Risk Analysis
<p>
  <img src="screenshots/weather.png" width="300">
  <img src="screenshots/weather2.png" width="300">
</p>

### Financial Loss Estimation & Government Scheme Suggestions
<img src="screenshots/loss.png" width="300">

### Explore Government Schemes
<img src="screenshots/govtschemes.png" width="300">

### Scan History & Downloads
<img src="screenshots/report.png" width="300">
