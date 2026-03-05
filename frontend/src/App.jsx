import React, { useState, useEffect, useRef } from "react";
import { T, CSS } from "./utils/theme";
import { API_BASE, TOUR_STEPS } from "./utils/constants";

import { LoginPage } from "./components/features/auth/LoginPage";
import { HomeScreen } from "./components/features/home/HomeScreen";
import { ResultsScreen } from "./components/features/results/ResultsScreen";
import { SchemesScreen } from "./components/features/schemes/SchemesScreen";
import { CropPopup } from "./components/features/results/CropPopup";
import { TourBubble } from "./components/layout/TourBubble";
import { TopNav } from "./components/layout/TopNav";
import { BottomNav } from "./components/layout/BottomNav";
import { ProfilePopup } from "./components/layout/ProfilePopup";
import { LanguagePopup } from "./components/layout/LanguagePopup";
import { ComingSoonPopup } from "./components/layout/ComingSoonPopup";
import { G } from "./components/icons/Icons";

export default function App() {
  const [page, setPage] = useState("login");
  const [screen, setScreen] = useState("home");
  const [showLang, setShowLang] = useState(false);
  const [showProf, setShowProf] = useState(false);
  const [csLabel, setCSLabel] = useState(null);
  const [drag, setDrag] = useState(false);
  const [filter, setFilter] = useState("All");
  const [analyzing, setAnalyzing] = useState(false);
  const [showCropPopup, setShowCropPopup] = useState(false);
  const [farmData, setFarmData] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("detecting"); // detecting | live | denied | error

  const [userLat, setUserLat] = useState(30.901);
  const [userLon, setUserLon] = useState(75.8573);

  const fileInputRef = useRef(null);
  const [tourStep, setTourStep] = useState(0);
  const [tourActive, setTourActive] = useState(true);
  const [tourDone, setTourDone] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (page !== "main") return;
    if (!navigator.geolocation) {
      setGpsStatus("error");
      fetchWeather(userLat, userLon);
      return;
    }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setGpsStatus("live");
        fetchWeather(lat, lon);
      },
      (err) => {
        console.warn("GPS denied:", err.message);
        setGpsStatus("denied");
        fetchWeather(userLat, userLon);
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }, [page]);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.warn("Weather fetch failed:", err);
    }
  };

  const cs = (l) => setCSLabel(l);
  const go = (s) => {
    setScreen(s);
    setShowProf(false);
  };

  const handleUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("lat", userLat.toString());
      formData.append("lon", userLon.toString());

      if (farmData) {
        formData.append("crop", farmData.crop);
        formData.append("land", farmData.land.toString());
      }

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setApiResult(data);
        if (data.weather) {
          setWeatherData(data.weather);
        }
      } else {
        setApiResult(null);
      }
    } catch (err) {
      console.warn("Backend not running — using demo mode:", err);
      setApiResult(null);
    }
    setAnalyzing(false);
    setShowCropPopup(true);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setApiResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropSubmit = async (data) => {
    setFarmData(data);
    setShowCropPopup(false);

    if (selectedFile) {
      setAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("crop", data.crop);
        formData.append("land", data.land.toString());
        formData.append("lat", userLat.toString());
        formData.append("lon", userLon.toString());

        const res = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          setApiResult(result);
          if (result.weather) setWeatherData(result.weather);
        }
      } catch (err) {
        console.warn("Re-predict failed:", err);
      }
      setAnalyzing(false);
    }
    go("results");
  };

  const R = apiResult || {
    disease: "Late Blight",
    confidence: 87.4,
    severity: "High",
    yield_loss: "50-80%",
    loss_pct: 0.65,
    health_score: 3,
    urgency: {
      hours: 18,
      label: "Act within 18 hours",
      description:
        "Demo mode — backend offline. Deploy Flask server to see real AI results.",
      critical: true,
    },
    all_scores: {
      "Late Blight": 87.4,
      "Early Blight": 7.2,
      "Leaf Spot": 3.8,
      Healthy: 1.6,
    },
    checklist: [
      {
        tier: "Do TODAY",
        color: "red",
        items: [
          "Apply Metalaxyl+Mancozeb spray immediately",
          "Remove infected leaves and burn them",
          "Stop overhead irrigation",
        ],
      },
      {
        tier: "Within 3 Days",
        color: "yellow",
        items: ["Switch to drip irrigation", "Apply foliar potassium spray"],
      },
      {
        tier: "This Week",
        color: "green",
        items: ["Prune canopy for better airflow", "Get soil test done"],
      },
      {
        tier: "Next Season",
        color: "blue",
        items: ["Use blight-resistant varieties", "3-year crop rotation"],
      },
    ],
    fungicides: [
      {
        name: "Ridomil Gold (Metalaxyl+Mancozeb)",
        dose: "2g/L water",
        timing: "Morning only",
        type: "Systemic",
      },
      {
        name: "Dithane M-45 (Mancozeb 75WP)",
        dose: "2.5g/L water",
        timing: "Every 7 days",
        type: "Contact",
      },
      {
        name: "Blitox 50 (Copper Oxychloride)",
        dose: "3g/L water",
        timing: "Preventive",
        type: "Contact",
      },
    ],
    economics: farmData
      ? {
        projected_loss: Math.round(farmData.land * 8000 * 12 * 0.65),
        treatment_cost: Math.round(farmData.land * 1200),
        net_saving:
          Math.round(farmData.land * 8000 * 12 * 0.65) -
          Math.round(farmData.land * 1200),
        insurance_cover: Math.min(
          Math.round(farmData.land * 8000 * 12 * 0.65),
          200000,
        ),
        risk_label: "SEVERE",
        msp_per_kg: 12,
      }
      : null,
    demo: true,
  };

  const W = weatherData || {
    location:
      gpsStatus === "detecting" ? "Detecting location..." : "Ludhiana, Punjab",
    temperature: "--",
    humidity: "--",
    rain_prob: "--",
    wind_kph: "--",
    risk_score: 0,
    risk_label: "...",
    warnings: [],
    forecast: [],
    live: false,
  };

  const econ = R.economics;
  const lossAmt = econ?.projected_loss || 0;
  const treatCost = econ?.treatment_cost || 0;
  const netSaving = econ?.net_saving || 0;
  const riskLabel = econ?.risk_label || "MODERATE";
  const riskColor =
    riskLabel === "SEVERE" ? T.red : riskLabel === "HIGH" ? T.yel : T.green;

  const CONF_BARS = Object.entries(R.all_scores || {}).map(([name, val]) => ({
    name,
    val,
    color:
      name === "Late Blight"
        ? T.red
        : name === "Early Blight"
          ? "#f97316"
          : name === "Leaf Spot"
            ? T.blu
            : T.green,
  }));

  const advanceTour = () => {
    const step = TOUR_STEPS[tourStep];
    if (step.action === "login") {
      setTourActive(false);
      setTourStep((s) => s + 1);
      return;
    }
    if (step.action === "home") {
      setPage("main");
      setScreen("home");
      setTourStep((s) => s + 1);
      return;
    }
    if (step.action === "upload") {
      setTourActive(false);
      setScreen("home");
      handleUpload();
      setTourStep((s) => s + 1);
      return;
    }
    if (step.action === "results") {
      if (!farmData) setFarmData({ crop: "Tomato", land: 3.5 });
      setScreen("results");
      setTourStep((s) => s + 1);
      setTourActive(true);
      return;
    }
    if (step.action === "schemes") {
      setScreen("schemes");
      setTourStep((s) => s + 1);
      return;
    }
    setTourActive(false);
    setTourDone(true);
  };
  useEffect(() => {
    if (tourStep === 3 && screen === "results" && farmData) setTourActive(true);
  }, [screen, farmData]);

  if (page === "login")
    return (
      <div
        style={{
          fontFamily: "'Inter','Segoe UI',sans-serif",
          background: T.bg,
          height: "100vh",
          maxWidth: 430,
          margin: "0 auto",
          position: "relative",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <LoginPage onLogin={() => setPage("main")} />
        {tourActive && tourStep <= 1 && (
          <TourBubble
            step={TOUR_STEPS[tourStep]}
            onNext={advanceTour}
            onSkip={() => {
              setTourActive(false);
              setTourDone(true);
              setPage("main");
            }}
          />
        )}
        <style>{CSS}</style>
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        background: T.bg,
        height: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav setShowProf={setShowProf} cs={cs} setShowLang={setShowLang} pulse={pulse} />

      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {showProf && (
          <ProfilePopup
            setShowProf={setShowProf}
            gpsStatus={gpsStatus}
            userLat={userLat}
            userLon={userLon}
            W={W}
          />
        )}

        {screen === "home" && (
          <HomeScreen
            gpsStatus={gpsStatus}
            W={W}
            userLat={userLat}
            userLon={userLon}
            fileInputRef={fileInputRef}
            handleFileSelected={handleFileSelected}
            drag={drag}
            setDrag={setDrag}
            setSelectedFile={setSelectedFile}
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
            analyzing={analyzing}
            handleRemoveImage={handleRemoveImage}
            handleUpload={handleUpload}
            handleAnalyze={handleAnalyze}
          />
        )}

        {screen === "results" && (
          <ResultsScreen
            go={go}
            selectedImage={selectedImage}
            R={R}
            farmData={farmData}
            setShowCropPopup={setShowCropPopup}
            CONF_BARS={CONF_BARS}
            W={W}
            econ={econ}
            lossAmt={lossAmt}
            riskColor={riskColor}
            riskLabel={riskLabel}
            treatCost={treatCost}
            netSaving={netSaving}
            cs={cs}
          />
        )}

        {screen === "schemes" && (
          <SchemesScreen
            go={go}
            filter={filter}
            setFilter={setFilter}
            cs={cs}
          />
        )}

        {showCropPopup && <CropPopup onSubmit={handleCropSubmit} />}

        <ComingSoonPopup csLabel={csLabel} setCSLabel={setCSLabel} />

        {showLang && <LanguagePopup setShowLang={setShowLang} cs={cs} />}
      </div>

      {(screen === "results" || screen === "schemes") && (
        <div
          style={{
            padding: "0 14px 6px",
            background: T.bg,
            borderTop: `1px solid ${T.border2}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => cs("Download Full Report as PDF")}
            style={{
              width: "100%",
              background: `linear-gradient(135deg,${T.deep},${T.green})`,
              color: "#fff",
              border: "none",
              borderRadius: 16,
              padding: "13px",
              fontWeight: 700,
              fontSize: "0.87rem",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              boxShadow: "0 4px 24px rgba(22,163,74,0.4)",
              marginTop: 6,
            }}
          >
            <G n="download" s={16} c="#fff" w={2} /> Download Full Report
          </button>
        </div>
      )}

      <BottomNav screen={screen} cs={cs} go={go} />

      {tourActive && !tourDone && page === "main" && (
        <TourBubble
          step={TOUR_STEPS[tourStep]}
          onNext={advanceTour}
          onSkip={() => {
            setTourActive(false);
            setTourDone(true);
          }}
        />
      )}

      <style>{CSS}</style>
    </div>
  );
}
