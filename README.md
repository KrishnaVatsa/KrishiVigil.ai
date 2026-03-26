# 🌾 KrishiVigil.ai — Smart Crop Protection
---

<p align="center">
  <img src="https://img.shields.io/badge/AI-YOLOv8-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Frontend-React-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Flask-black?style=for-the-badge">
  <img src="https://img.shields.io/badge/Accuracy-96%25-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge">
  <img src="https://img.shields.io/badge/Platform-Web_App-purple?style=for-the-badge">
  <img src="https://img.shields.io/badge/Made%20For-Farmers-brightgreen?style=for-the-badge">
</p>

<p align="center">
  <b>AI-powered crop disease detection & farm advisory system for Indian farmers</b><br>
  Upload a crop image → Get diagnosis, treatment & economic insights in seconds 🚀
</p>

---

## 📄 License

© Belongs to @KrishnaVatsa & @Anand1-here  
Research & Analysis: Kaustuv Baidya & Divyansh Kumar

---

## ⚠️ Note:

- `plant_model_yolo.pt` is **not included** in this repository (too large for GitHub)

---

## 📌 What It Does

KrishiVigil.ai lets farmers upload an image of any infected part of their crop — leaf, fruit, stem, or plant surface — and instantly receive:

- 🤖 **AI disease detection** with confidence score (52 disease classes across 14 crop types)
- 📊 **Crop health score** (1–10) based on AI confidence + weather + yield loss
- ⏱ **Treatment urgency timeline** — act within X hours
- 🧪 **Fungicide recommendations** — Indian brand names, doses, and timing
- 🌦 **Live weather risk analysis** — disease spread risk from real GPS-based weather
- 💰 **Economic loss in ₹** — calculated using government MSP rates and ICAR yield data
- 🏛 **Government scheme matching**
- 📄 **Downloadable crop health report**
- 🕒 **Scan history**
- 🌐 **Multilingual UI**

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | ^19.2.0 |
| Frontend Build | Vite | ^7.3.1 |
| Backend | Flask (Python) | 3.0.2 |
| Cross-Origin | Flask-CORS | 4.0.0 |
| AI Model | YOLOv8x-cls | ultralytics>=8.2.0 |
| Image Processing | Pillow | 10.2.0 |
| Math | NumPy | 1.26.4 |
| Weather API | OpenWeatherMap | Free tier |
| HTTP Client | Requests | 2.31.0 |
| Storage | JSON-based | — |

---

## 🏗 System Architecture

```mermaid
flowchart TD

A[Farmer or User] --> B[React Frontend]
B --> C[Image Upload]
C --> D[REST API]

D --> E[Flask Backend]

E --> F[YOLOv8 Model]
E --> G[Weather API]

F --> H[Disease Detection]
G --> I[Weather Risk Score]

H --> J[Economic Engine]
I --> J

J --> K[JSON Response]
K --> L[React Dashboard]
```

---

## 🤖 AI Model

| Property | Details |
|---|---|
| Architecture | YOLOv8x-cls (Ultralytics) |
| Framework | PyTorch |
| Dataset | PlantVillage (87k+ images) + custom Rice & Wheat |
| Classes | 52 |
| Accuracy | 96–98% |
| Model file | `plant_model_yolo.pt` |

---

## Project Structure (Visual)

```mermaid
flowchart TD

A[krishivigil]

A --> B[frontend]
A --> C[backend]

%% Frontend
B --> B1[src]
B1 --> B11[App.jsx]
B1 --> B12[main.jsx]

B1 --> B2[components]
B2 --> B21[LoginPage.jsx]
B2 --> B22[CropPopup.jsx]
B2 --> B23[TourBubble.jsx]
B2 --> B24[UIComponents.jsx]
B2 --> B25[UIHelpers.jsx]

B1 --> B3[config/api.js]

B1 --> B4[constants]
B4 --> B41[appData.js]
B4 --> B42[msp.js]
B4 --> B43[schemes.js]

B1 --> B5[icons.jsx]
B1 --> B6[theme.js]

%% Backend
C --> C1[app.py]
C --> C2[plant_model_yolo.pt]

C --> C3[core]
C3 --> C31[model_loader.py]
C3 --> C32[predictor.py]

C --> C4[routes]
C4 --> C41[auth_routes.py]
C4 --> C42[predict_routes.py]
C4 --> C43[weather_routes.py]
C4 --> C44[scan_routes.py]
C4 --> C45[download_routes.py]

C --> C5[services/weather_service.py]
C --> C6[engines/economic_engine.py]
```

---

## 🔄 How It Works — Full Request Flow

1. Farmer opens app  
2. Uploads crop image  
3. Backend fetches weather  
4. AI model predicts disease  
5. Economic loss calculated  
6. JSON response returned  
7. Dashboard shows insights  

---

## 🧮 Key Calculations

**Health Score (1–10)**
```
score = 10 - [(confidence/100 × 3.5) + (loss_pct × 4.0) + (weather_risk/100 × 2.5)]
```

**Economic Loss (₹)**
```
effective_loss = (confidence/100) × yield_loss_pct × (1 + weather_risk/100)
```

---

## 🖥 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

- `POST /predict` → Disease detection  
- `GET /weather` → Weather data  
- `POST /auth/login` → Login  
- `POST /auth/register` → Register  

---

## 💾 Persistent Storage

- JSON-based storage  
- No database required  
- Data persists across restarts  

---

## 🌍 Impact

- ⏱ Diagnosis time: **3–7 days → 3 seconds**  
- 💸 Reduces crop loss  
- 🌱 Improves farmer decisions  

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

<p align="center">
  Built with ❤️ for Farmers
</p>
