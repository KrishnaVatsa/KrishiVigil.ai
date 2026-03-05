import React from "react";
import { T, sh } from "../../../utils/theme";
import { G, WeatherIcon } from "../../icons/Icons";
import { Card } from "../../ui/Card";
import { SLabel } from "../../ui/SLabel";
import { ITile } from "../../ui/ITile";
import { PrimaryBtn } from "../../ui/PrimaryBtn";
import { STEPS } from "../../../utils/constants";

export const HomeScreen = ({
  gpsStatus,
  W,
  userLat,
  userLon,
  fileInputRef,
  handleFileSelected,
  drag,
  setDrag,
  setSelectedFile,
  setSelectedImage,
  selectedImage,
  analyzing,
  handleRemoveImage,
  handleUpload,
  handleAnalyze,
}) => {
  return (
    <>
      {/* ── WEATHER STRIP — all values from live weather API ── */}
      <div
        style={{
          background: `linear-gradient(160deg,#052e16 0%,#14532d 55%,#166534 100%)`,
          padding: "18px 18px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <G
                n="gps"
                s={13}
                c={gpsStatus === "live" ? "#86efac" : "#fcd34d"}
                w={2}
              />
              <span
                style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}
              >
                {W.location}
              </span>
            </div>
            <div
              style={{ color: "#86efac", fontSize: "0.63rem", marginLeft: 19 }}
            >
              {gpsStatus === "detecting"
                ? "Detecting GPS..."
                : gpsStatus === "live"
                  ? "GPS Live · " +
                    new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Location detected · Updated now"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
              <span
                style={{
                  color: "#fff",
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {W.temperature !== "--" ? Math.round(W.temperature) : "--"}
              </span>
              <span
                style={{ color: "#86efac", fontSize: "1rem", marginTop: 5 }}
              >
                °C
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                justifyContent: "flex-end",
                marginTop: 2,
              }}
            >
              <G n="drop" s={11} c="#86efac" w={2} />
              <span style={{ color: "#86efac", fontSize: "0.63rem" }}>
                {W.humidity}% humidity
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 7,
            overflowX: "auto",
            marginBottom: 14,
            paddingBottom: 2,
          }}
        >
          {(W.forecast.length > 0
            ? W.forecast
            : [{ day: "Today", type: "cloud", hi: "--", lo: "--", rain: "--" }]
          ).map((f, i) => (
            <div
              key={i}
              style={{
                background:
                  i === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                borderRadius: 13,
                padding: "9px 11px",
                textAlign: "center",
                minWidth: 62,
                flexShrink: 0,
                border:
                  i === 0
                    ? "1px solid rgba(255,255,255,0.28)"
                    : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  color: i === 0 ? "#86efac" : "rgba(255,255,255,0.6)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                {f.day}
              </div>
              <WeatherIcon type={f.type || "cloud"} s={22} />
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {f.hi}°
              </div>
              <div
                style={{
                  color:
                    f.type === "rain"
                      ? "#93c5fd"
                      : f.type === "sun"
                        ? "#fcd34d"
                        : "rgba(255,255,255,0.5)",
                  fontSize: "0.59rem",
                  marginTop: 1,
                }}
              >
                {f.rain}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(W.warnings.length > 0
            ? W.warnings
            : [
                {
                  type: "ok",
                  level: "low",
                  text: "Fetching weather warnings...",
                },
              ]
          ).map((w, i) => (
            <div
              key={i}
              style={{
                background: "rgba(0,0,0,0.28)",
                borderRadius: 10,
                padding: "8px 12px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  background:
                    w.level === "medium"
                      ? "rgba(217,119,6,0.22)"
                      : w.level === "low"
                        ? "rgba(34,197,94,0.18)"
                        : "rgba(239,68,68,0.18)",
                  borderRadius: 7,
                  padding: 5,
                  flexShrink: 0,
                }}
              >
                <G
                  n={
                    w.type === "wind"
                      ? "wind"
                      : w.type === "humidity"
                        ? "drop"
                        : w.type === "ok"
                          ? "check"
                          : "alert"
                  }
                  s={13}
                  c={
                    w.level === "medium"
                      ? "#fcd34d"
                      : w.level === "low"
                        ? "#86efac"
                        : "#fca5a5"
                  }
                  w={2}
                />
              </div>
              <span
                style={{
                  color: "#f1f5f9",
                  fontSize: "0.69rem",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {w.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "18px 16px 16px" }}>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <G n="scan" s={16} c={T.deep} w={2} />
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: T.deep }}
            >
              Scan Your Crop
            </span>
          </div>
          <p style={{ fontSize: "0.72rem", color: T.muted, margin: 0 }}>
            Upload any crop image — AI detects disease in under 3 seconds
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files[0];
            if (file) {
              setSelectedFile(file);
              const reader = new FileReader();
              reader.onload = (ev) => setSelectedImage(ev.target.result);
              reader.readAsDataURL(file);
            }
          }}
          style={{
            border: `2px dashed ${drag ? T.green : selectedImage ? "#16a34a" : "#86efac"}`,
            borderRadius: 20,
            padding: "20px",
            textAlign: "center",
            background: drag ? "#f0fdf4" : selectedImage ? "#f0fdf4" : T.card,
            transition: "all 0.2s",
            marginBottom: 18,
            boxShadow: sh,
          }}
        >
          {analyzing ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  border: `4px solid ${T.border}`,
                  borderTopColor: T.green,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div
                style={{ fontWeight: 700, color: T.deep, fontSize: "0.9rem" }}
              >
                Analyzing with AI...
              </div>
              <div style={{ fontSize: "0.7rem", color: T.muted }}>
                EfficientNetB3 running inference
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {[
                  "Preprocessing",
                  "Running AI",
                  "Weather check",
                  "Calculating loss",
                ].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      background: "#f0fdf4",
                      border: `1px solid ${T.border}`,
                      borderRadius: 20,
                      padding: "3px 8px",
                      fontSize: "0.59rem",
                      color: T.green,
                      fontWeight: 600,
                      animation: `fadeIn 0.4s ${i * 0.35}s both`,
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedImage ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={selectedImage}
                  alt="Selected crop"
                  style={{
                    width: "100%",
                    maxWidth: 260,
                    height: 170,
                    objectFit: "cover",
                    borderRadius: 14,
                    border: `2px solid ${T.border}`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  }}
                />
                <button
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: T.red,
                    border: "2.5px solid #fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <G n="close" s={13} c="#fff" w={2.5} />
                </button>
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: T.green,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <G n="check" s={13} c={T.green} w={2.5} /> Image ready — tap
                Analyze Now
              </div>
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button
                  onClick={handleUpload}
                  style={{
                    flex: 1,
                    background: "#f0fdf4",
                    border: `1.5px solid ${T.border}`,
                    color: T.deep,
                    borderRadius: 12,
                    padding: "10px",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <G n="camera" s={14} c={T.deep} w={2} /> Change
                </button>
                <button
                  onClick={handleAnalyze}
                  style={{
                    flex: 2,
                    background: `linear-gradient(135deg,${T.deep},${T.green})`,
                    border: "none",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "10px",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    boxShadow: "0 4px 14px rgba(22,163,74,0.38)",
                  }}
                >
                  <G n="zap" s={15} c="#fff" w={2} /> Analyze Now
                </button>
              </div>
            </div>
          ) : (
            <div onClick={handleUpload} style={{ cursor: "pointer" }}>
              <div
                style={{
                  display: "inline-flex",
                  background: `linear-gradient(135deg,${T.deep},${T.green})`,
                  borderRadius: "50%",
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
                }}
              >
                <G n="camera" s={28} c="#fff" w={1.8} />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: T.deep,
                  fontSize: "0.95rem",
                  marginBottom: 4,
                }}
              >
                Tap to upload crop image
              </div>
              <div
                style={{ fontSize: "0.7rem", color: T.muted, marginBottom: 16 }}
              >
                Drag & drop · JPG, PNG, WebP · Max 16MB
              </div>
              <PrimaryBtn style={{ pointerEvents: "none" }}>
                <G n="zap" s={15} c="#fff" w={2} /> Analyze Now
              </PrimaryBtn>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: T.redBg,
              borderRadius: 14,
              padding: "14px 10px",
              textAlign: "center",
              border: `1px solid ${T.redBo}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "rgba(220,38,38,0.08)",
                borderRadius: 10,
                padding: 8,
                marginBottom: 6,
              }}
            >
              <G n="micro" s={16} c={T.red} w={2} />
            </div>
            <div
              style={{
                fontWeight: 800,
                color: T.red,
                fontSize: "0.72rem",
                lineHeight: 1.25,
              }}
            >
              AI-Powered
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: T.muted,
                marginTop: 3,
                lineHeight: 1.3,
              }}
            >
              99.6% accuracy
            </div>
          </div>
          <div
            style={{
              background: T.bluBg,
              borderRadius: 14,
              padding: "14px 10px",
              textAlign: "center",
              border: `1px solid ${T.bluBo}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "rgba(37,99,235,0.08)",
                borderRadius: 10,
                padding: 8,
                marginBottom: 6,
              }}
            >
              <G n="shield" s={16} c={T.blu} w={2} />
            </div>
            <div
              style={{
                fontWeight: 800,
                color: T.blu,
                fontSize: "0.72rem",
                lineHeight: 1.25,
              }}
            >
              Govt Schemes
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: T.muted,
                marginTop: 3,
                lineHeight: 1.3,
              }}
            >
              Auto-matched
            </div>
          </div>
          <div
            style={{
              background: "#f0fdf4",
              borderRadius: 14,
              padding: "14px 10px",
              textAlign: "center",
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                background: "rgba(22,163,74,0.08)",
                borderRadius: 10,
                padding: 8,
                marginBottom: 6,
              }}
            >
              <G n="zap" s={16} c={T.green} w={2} />
            </div>
            <div
              style={{
                fontWeight: 800,
                color: T.green,
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              &lt;3s
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: T.muted,
                marginTop: 3,
                lineHeight: 1.3,
              }}
            >
              Scan Time
            </div>
          </div>
        </div>

        <Card>
          <SLabel icon="info" color={T.deep}>
            How It Works
          </SLabel>
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: i === STEPS.length - 1 ? 0 : 12,
              }}
            >
              <ITile icon={s.icon} size="sm" />
              <div style={{ paddingTop: 2 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    color: T.text,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{ fontSize: "0.67rem", color: T.muted, marginTop: 1 }}
                >
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
};
