import React, { useState, useEffect, useRef } from "react";
import { T, CSS, shM } from "./utils/theme";
import { API_BASE, LANGS, TOUR_STEPS } from "./utils/constants";
import { getMSP, tierStyle, fungicideColor } from "./utils/helpers";
import { KVLogo, G, WeatherIcon } from "./components/icons/Icons";
import { PrimaryBtn } from "./components/ui/PrimaryBtn";
import { ITile } from "./components/ui/ITile";

import { LoginPage } from "./components/features/auth/LoginPage";
import { HomeScreen } from "./components/features/home/HomeScreen";
import { ResultsScreen } from "./components/features/results/ResultsScreen";
import { SchemesScreen } from "./components/features/schemes/SchemesScreen";
import { CropPopup } from "./components/features/results/CropPopup";
import { TourBubble } from "./components/layout/TourBubble";

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
      {/* TOP NAV */}
      <div
        style={{
          background: T.nav,
          borderBottom: `1px solid ${T.border}`,
          padding: "11px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setShowProf((p) => !p)}
          style={{
            background: `linear-gradient(135deg,${T.deep},${T.green})`,
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(22,163,74,0.35)",
          }}
        >
          <G n="user" s={18} c="#fff" w={2} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <KVLogo size={28} />
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: T.deep,
                letterSpacing: "-0.4px",
              }}
            >
              KrishiVigil<span style={{ color: T.green }}>.ai</span>
            </span>
          </div>
          <div
            style={{
              fontSize: "0.53rem",
              color: T.muted,
              letterSpacing: "1px",
              marginTop: 1,
            }}
          >
            SMART CROP PROTECTION
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => cs("Alert Notifications")}
            style={{
              background: T.border2,
              border: `1px solid ${T.border}`,
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <G n="bell" s={16} c={T.green} w={2} />
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: T.red,
                borderRadius: "50%",
                width: 7,
                height: 7,
                border: "1.5px solid #fff",
                boxShadow: pulse ? "0 0 0 3px rgba(220,38,38,0.2)" : "none",
                transition: "box-shadow 0.4s",
              }}
            />
          </button>
          <button
            onClick={() => setShowLang(true)}
            style={{
              background: T.border2,
              border: `1.5px solid ${T.green}`,
              borderRadius: 22,
              padding: "5px 11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "inherit",
            }}
          >
            <G n="globe" s={13} c={T.deep} w={2} />
            <span
              style={{ fontWeight: 700, fontSize: "0.7rem", color: T.deep }}
            >
              हि/ਪੰ
            </span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {/* PROFILE POPUP */}
        {showProf && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 14,
              background: T.card,
              borderRadius: 18,
              padding: 18,
              boxShadow: shM,
              zIndex: 100,
              width: 236,
              border: `1px solid ${T.border}`,
              animation: "fadeSlideIn 0.18s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                paddingBottom: 12,
                borderBottom: `1px solid ${T.border2}`,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg,${T.deep},${T.green})`,
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <G n="user" s={20} c="#fff" w={1.8} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: T.text,
                  }}
                >
                  Krishna Singh
                </div>
                <div
                  style={{
                    fontSize: "0.66rem",
                    color: T.muted,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <G n="gps" s={10} c={T.muted} w={2} />
                  {gpsStatus === "live"
                    ? `GPS Live (${userLat.toFixed(2)}, ${userLon.toFixed(2)})`
                    : W.location}
                </div>
              </div>
            </div>
            {[
              ["map", "Location", W.location],
              [
                "drop",
                "Weather",
                W.temperature !== "--"
                  ? `${W.temperature}°C, ${W.humidity}% humidity`
                  : "Loading...",
              ],
              ["scan", "Total Scans", "12 crops scanned"],
            ].map(([icon, label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 0",
                  borderBottom: `1px solid #f1fdf4`,
                  fontSize: "0.74rem",
                }}
              >
                <span
                  style={{
                    color: T.muted,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <G n={icon} s={12} c={T.muted} w={2} />
                  {label}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: T.text,
                    fontSize: "0.68rem",
                    textAlign: "right",
                    maxWidth: 120,
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 10,
                fontSize: "0.66rem",
                color: T.muted,
                background: T.border2,
                borderRadius: 9,
                padding: "8px 10px",
                lineHeight: 1.5,
              }}
            >
              {gpsStatus === "live"
                ? "GPS active — weather is live from your exact field location"
                : "GPS not available — using default location"}
            </div>
            <button
              onClick={() => setShowProf(false)}
              style={{
                marginTop: 8,
                width: "100%",
                background: "none",
                border: "none",
                color: T.muted,
                cursor: "pointer",
                fontSize: "0.68rem",
                fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
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

        {csLabel && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(5,46,22,0.5)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
            onClick={() => setCSLabel(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: T.card,
                borderRadius: 22,
                padding: 28,
                textAlign: "center",
                maxWidth: 300,
                width: "100%",
                boxShadow: shM,
                animation: "popIn 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  background: "#f0fdf4",
                  borderRadius: "50%",
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <G n="star" s={28} c={T.green} w={2} />
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                Coming Soon!
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: T.text,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {csLabel}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: T.muted,
                  marginBottom: 22,
                  lineHeight: 1.6,
                }}
              >
                This feature is under development and will be available in the
                next version of KrishiVigil.ai
              </div>
              <PrimaryBtn
                onClick={() => setCSLabel(null)}
                style={{ padding: "12px 36px", fontSize: "0.9rem" }}
              >
                Got it
              </PrimaryBtn>
            </div>
          </div>
        )}

        {showLang && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(5,46,22,0.5)",
              zIndex: 200,
              display: "flex",
              alignItems: "flex-end",
            }}
            onClick={() => setShowLang(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: T.card,
                width: "100%",
                borderRadius: "22px 22px 0 0",
                padding: "22px 20px 30px",
                animation: "slideUp 0.22s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 5,
                }}
              >
                <ITile icon="globe" size="md" />
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: "1rem", color: T.text }}
                  >
                    Select Language
                  </div>
                  <div style={{ fontSize: "0.67rem", color: T.muted }}>
                    Regional support coming soon
                  </div>
                </div>
              </div>
              <div
                style={{ height: 1, background: T.border2, margin: "14px 0" }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {LANGS.map((l) => (
                  <button
                    key={l.s}
                    onClick={() => {
                      setShowLang(false);
                      cs(`${l.s} Language Support`);
                    }}
                    style={{
                      background: "#f0fdf4",
                      border: `1px solid ${T.border}`,
                      borderRadius: 13,
                      padding: "12px 13px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: T.deep,
                      }}
                    >
                      {l.s}
                    </div>
                    <div
                      style={{
                        fontSize: "0.61rem",
                        color: T.muted,
                        marginTop: 2,
                      }}
                    >
                      {l.sub}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLang(false)}
                style={{
                  width: "100%",
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 13,
                  padding: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  color: T.text,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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

      <div
        style={{
          background: T.nav,
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          flexShrink: 0,
          boxShadow: "0 -2px 16px rgba(0,0,0,0.05)",
        }}
      >
        {[
          ["clock", "History", () => cs("Scan History"), false],
          ["shield", "Schemes", () => go("schemes"), screen === "schemes"],
          ["download", "Downloads", () => cs("PDF Downloads"), false],
        ].map(([icon, label, action, active]) => (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1,
              padding: "12px 8px 10px",
              background: active ? "#f0fdf4" : "none",
              border: "none",
              borderTop: active
                ? `2px solid ${T.green}`
                : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
            }}
          >
            <G
              n={icon}
              s={19}
              c={active ? T.green : T.muted}
              w={active ? 2.2 : 1.8}
            />
            <span
              style={{
                fontSize: "0.59rem",
                color: active ? T.green : T.muted,
                fontWeight: active ? 700 : 500,
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

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
