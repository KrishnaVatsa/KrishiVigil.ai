import React from "react";
import { T, sh } from "../../../utils/theme";
import { G } from "../../icons/Icons";
import { Card } from "../../ui/Card";
import { SLabel } from "../../ui/SLabel";
import { ITile } from "../../ui/ITile";
import { Badge } from "../../ui/Badge";
import { SCHEMES } from "../../../utils/constants";
import { getMSP, tierStyle, fungicideColor } from "../../../utils/helpers";

export const ResultsScreen = ({
  go,
  selectedImage,
  R,
  farmData,
  setShowCropPopup,
  CONF_BARS,
  W,
  econ,
  lossAmt,
  riskColor,
  riskLabel,
  treatCost,
  netSaving,
  cs,
}) => {
  return (
    <div
      style={{ padding: "14px 15px 16px", animation: "fadeSlideUp 0.3s ease" }}
    >
      <button
        onClick={() => go("home")}
        style={{
          background: "none",
          border: "none",
          color: T.green,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 14,
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "inherit",
        }}
      >
        <G n="back" s={15} c={T.green} w={2} /> Back to Home
      </button>

      {/* Scanned image preview */}
      {selectedImage && (
        <div
          style={{
            background: T.card,
            borderRadius: 16,
            padding: 14,
            marginBottom: 14,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: sh,
          }}
        >
          <img
            src={selectedImage}
            alt="Uploaded crop"
            style={{
              width: 68,
              height: 68,
              objectFit: "cover",
              borderRadius: 12,
              border: `2px solid ${T.border}`,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.78rem",
                color: T.deep,
                marginBottom: 3,
              }}
            >
              Scanned Image
            </div>
            <div
              style={{ fontSize: "0.68rem", color: T.muted, lineHeight: 1.5 }}
            >
              EfficientNetB3 PlantVillage model · 38 classes
            </div>
            <div style={{ marginTop: 5 }}>
              <div
                style={{
                  background: "#dcfce7",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: "0.62rem",
                  color: T.green,
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                {R.demo
                  ? "Demo Mode — deploy Flask backend for live AI"
                  : "Real AI Result"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farm data strip */}
      {farmData && (
        <div
          style={{
            background: `linear-gradient(135deg,#f0fdf4,#dcfce7)`,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "10px 14px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <G n="leaf" s={14} c={T.green} w={2.5} />
          <span style={{ fontSize: "0.74rem", color: T.deep, fontWeight: 600 }}>
            {farmData.crop} · {farmData.land} acres · Rs{" "}
            {(getMSP(farmData.crop) / 100).toFixed(2)}/kg MSP
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.65rem",
              color: T.muted,
              cursor: "pointer",
            }}
            onClick={() => setShowCropPopup(true)}
          >
            Edit
          </span>
        </div>
      )}

      {/* ── HEALTH SCORE ── */}
      <div
        style={{
          background: `linear-gradient(160deg,#052e16,#14532d,#166534)`,
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 24px rgba(21,128,61,0.28)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <G n="activity" s={12} c="#86efac" w={2} />
            <span
              style={{
                color: "#86efac",
                fontSize: "0.64rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.9px",
              }}
            >
              Crop Health Score
            </span>
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: "2.8rem",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {R.health_score}
            <span
              style={{ fontSize: "1.1rem", fontWeight: 400, color: "#86efac" }}
            >
              /10
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <div
              style={{
                background: "rgba(239,68,68,0.2)",
                borderRadius: 7,
                padding: 4,
              }}
            >
              <G n="alert" s={12} c="#fca5a5" w={2} />
            </div>
            <span
              style={{ color: "#fca5a5", fontWeight: 700, fontSize: "0.77rem" }}
            >
              {R.health_score <= 3
                ? "Critical — Immediate action needed"
                : R.health_score <= 6
                  ? "Moderate — Treatment recommended"
                  : "Good — Preventive care only"}
            </span>
          </div>
        </div>
        <div style={{ position: "relative", width: 78, height: 78 }}>
          <svg
            viewBox="0 0 80 80"
            style={{
              transform: "rotate(-90deg)",
              width: 78,
              height: 78,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="9"
            />
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="9"
              strokeDasharray={`${(R.health_score / 10) * 188.5} 188.5`}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: "1.2rem",
            }}
          >
            {R.health_score}
          </div>
        </div>
      </div>

      {/* ── URGENCY TIMELINE ── */}
      {R.urgency && R.urgency.hours !== null && (
        <div
          style={{
            background: T.redBg,
            border: `1px solid ${T.redBo}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: "rgba(220,38,38,0.1)",
                borderRadius: 8,
                padding: 5,
              }}
            >
              <G n="clock" s={14} c={T.red} w={2} />
            </div>
            <span
              style={{ fontWeight: 700, color: T.red, fontSize: "0.82rem" }}
            >
              Urgency Timeline
            </span>
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "#991b1b",
              marginBottom: 5,
            }}
          >
            {R.urgency.label}
          </div>
          <div
            style={{
              fontSize: "0.69rem",
              color: "#7f1d1d",
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {R.urgency.description}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[
              ["Now", "#dc2626", "Act now"],
              ["24h", "#f97316", "Urgent"],
              ["48h", "#eab308", "Caution"],
              ["72h+", "#9ca3af", "Monitor"],
            ].map(([l, c, sub]) => (
              <div
                key={l}
                style={{
                  flex: 1,
                  background: c,
                  borderRadius: 9,
                  padding: "7px 4px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "0.69rem",
                    fontWeight: 800,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: "0.54rem",
                    marginTop: 1,
                  }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISEASE DETECTION CARD ── */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <SLabel icon="activity" color={T.deep}>
            Disease Detection
          </SLabel>
          <Badge
            bg={
              R.severity === "High"
                ? T.redBg
                : R.severity === "Medium"
                  ? T.yelBg
                  : T.bluBg
            }
            color={
              R.severity === "High"
                ? T.red
                : R.severity === "Medium"
                  ? T.yel
                  : T.blu
            }
            border={
              R.severity === "High"
                ? T.redBo
                : R.severity === "Medium"
                  ? T.yelBo
                  : T.bluBo
            }
          >
            {R.severity.toUpperCase()} SEVERITY
          </Badge>
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.3rem",
            color: T.deep,
            marginBottom: 6,
          }}
        >
          {R.disease}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.71rem",
              color: T.muted,
            }}
          >
            <G n="check" s={12} c={T.green} w={2.5} /> Confidence:{" "}
            <strong style={{ color: T.green }}>{R.confidence}%</strong>
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.71rem",
              color: T.muted,
            }}
          >
            <G n="trending" s={12} c={T.red} w={2} /> Yield Loss:{" "}
            <strong style={{ color: T.red }}>{R.yield_loss}</strong>
          </span>
        </div>
        {CONF_BARS.map((b) => (
          <div key={b.name} style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.69rem",
                marginBottom: 3,
              }}
            >
              <span style={{ color: T.muted }}>{b.name}</span>
              <span style={{ fontWeight: 700, color: b.color }}>{b.val}%</span>
            </div>
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: 6,
                height: 7,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${b.val}%`,
                  background: `linear-gradient(90deg,${b.color}88,${b.color})`,
                  height: "100%",
                  borderRadius: 6,
                  transition: "width 0.9s ease",
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <SLabel icon="check" color={T.deep}>
            Smart Action Plan
          </SLabel>
          {(R.checklist || []).map((c, ci) => {
            const ts = tierStyle(c.color);
            return (
              <div
                key={ci}
                style={{
                  background: ts.bg,
                  borderRadius: 12,
                  padding: "11px 13px",
                  marginBottom: 8,
                  borderLeft: `3px solid ${ts.c}`,
                  border: `1px solid ${ts.bo}`,
                  borderLeftWidth: 3,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 7,
                  }}
                >
                  <G
                    n={
                      c.color === "red"
                        ? "zap"
                        : c.color === "yellow"
                          ? "clock"
                          : c.color === "blue"
                            ? "shield"
                            : "leaf"
                    }
                    s={12}
                    c={ts.c}
                    w={2.5}
                  />
                  <span
                    style={{ fontWeight: 700, fontSize: "0.7rem", color: ts.c }}
                  >
                    {c.tier}
                  </span>
                </div>
                {(c.items || []).map((item, ii) => (
                  <div
                    key={ii}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      marginBottom: 4,
                    }}
                  >
                    <G n="check" s={12} c={ts.c} w={2.5} />
                    <span
                      style={{
                        fontSize: "0.69rem",
                        color: T.text,
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <SLabel icon="info" color={T.deep}>
            Recommended Fungicides
          </SLabel>
          {(R.fungicides || []).map((f, fi) => {
            const fc = fungicideColor(f.type);
            return (
              <div
                key={fi}
                style={{
                  background: fc.bg,
                  borderRadius: 12,
                  padding: "11px 13px",
                  marginBottom: 8,
                  border: `1px solid ${fc.bo}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      background: `${fc.c}15`,
                      borderRadius: 9,
                      padding: 7,
                    }}
                  >
                    <G n="activity" s={14} c={fc.c} w={2} />
                  </div>
                  <div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.79rem",
                          color: T.text,
                        }}
                      >
                        {f.name}
                      </span>
                      <span
                        style={{
                          background: `${fc.c}18`,
                          color: fc.c,
                          borderRadius: 8,
                          padding: "1px 7px",
                          fontSize: "0.59rem",
                          fontWeight: 600,
                        }}
                      >
                        {f.type}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.63rem",
                        color: T.muted,
                        marginTop: 2,
                      }}
                    >
                      Dose: {f.dose} · {f.timing}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.59rem",
                    color: T.muted,
                    textAlign: "right",
                  }}
                >
                  Agri
                  <br />
                  shops
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SLabel icon="drop" color={T.deep}>
          Weather Risk Intelligence
        </SLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 9,
            marginBottom: 12,
          }}
        >
          {[
            {
              icon: "thermo",
              label: "Temperature",
              val: `${W.temperature}°C`,
              bg: T.redBg,
              c: T.red,
              bo: T.redBo,
            },
            {
              icon: "drop",
              label: "Humidity",
              val: `${W.humidity}%`,
              bg: T.bluBg,
              c: T.blu,
              bo: T.bluBo,
            },
            {
              icon: "drop",
              label: "Rain Prob.",
              val: `${W.rain_prob}%`,
              bg: T.redBg,
              c: T.red,
              bo: T.redBo,
            },
            {
              icon: "wind",
              label: "Wind Speed",
              val: `${W.wind_kph} km/h`,
              bg: T.yelBg,
              c: T.yel,
              bo: T.yelBo,
            },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: m.bg,
                borderRadius: 12,
                padding: "11px 13px",
                border: `1px solid ${m.bo}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  fontSize: "0.63rem",
                  color: m.c,
                }}
              >
                <G n={m.icon} s={12} c={m.c} w={2} />
                {m.label}
              </div>
              <div
                style={{ fontWeight: 800, fontSize: "1.05rem", color: T.text }}
              >
                {m.val}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "linear-gradient(135deg,#fff5f5,#fff8f8)",
            borderRadius: 13,
            padding: "13px 15px",
            display: "flex",
            alignItems: "center",
            gap: 13,
            border: `1px solid ${T.redBo}`,
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: "2.4rem",
                color: T.red,
                lineHeight: 1,
              }}
            >
              {W.risk_score}
            </div>
            <div style={{ fontSize: "0.59rem", color: T.muted }}>
              out of 100
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: T.red, fontSize: "0.81rem" }}>
              {W.risk_label} Risk Score
            </div>
            <div
              style={{
                fontSize: "0.67rem",
                color: "#7f1d1d",
                marginTop: 3,
                lineHeight: 1.4,
              }}
            >
              {W.location} ·{" "}
              {W.live
                ? "Live data from OpenWeatherMap"
                : "Offline fallback data"}
            </div>
          </div>
        </div>

        <SLabel icon="alert" color={T.yel}>
          Field Operation Warnings
        </SLabel>
        {(W.warnings.length > 0
          ? W.warnings
          : [
              {
                type: "ok",
                level: "low",
                text: "No weather warnings at this time",
              },
            ]
        ).map((w, i) => {
          const wc =
            w.level === "critical" || w.level === "high"
              ? { c: T.red, bg: T.redBg, bo: T.redBo }
              : w.level === "medium"
                ? { c: T.yel, bg: T.yelBg, bo: T.yelBo }
                : { c: T.green, bg: "#f0fdf4", bo: T.border };
          return (
            <div
              key={i}
              style={{
                background: wc.bg,
                borderRadius: 10,
                padding: "9px 12px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 7,
                border: `1px solid ${wc.bo}`,
              }}
            >
              <div
                style={{
                  background: `${wc.c}14`,
                  borderRadius: 8,
                  padding: 5,
                  flexShrink: 0,
                }}
              >
                <G n="alert" s={12} c={wc.c} w={2} />
              </div>
              <span
                style={{ fontSize: "0.69rem", color: T.text, lineHeight: 1.4 }}
              >
                {w.text}
              </span>
            </div>
          );
        })}
      </Card>

      {/* ── ECONOMIC LOSS CARD ── */}
      {econ && (
        <Card>
          <SLabel icon="rupee" color={T.deep}>
            Economic Loss Estimate
          </SLabel>
          <div
            style={{
              background: "linear-gradient(135deg,#fff5f5,#fff8f8)",
              borderRadius: 14,
              padding: "18px 16px",
              textAlign: "center",
              marginBottom: 14,
              border: `1px solid ${T.redBo}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                marginBottom: 4,
                fontSize: "0.69rem",
                color: T.muted,
              }}
            >
              <G n="trending" s={14} c={T.red} w={2} /> Projected Crop Loss
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: "2.4rem",
                color: T.red,
                lineHeight: 1.1,
              }}
            >
              Rs {lossAmt.toLocaleString("en-IN")}
            </div>
            <div
              style={{ fontSize: "0.66rem", color: "#7f1d1d", marginTop: 5 }}
            >
              {farmData?.crop} · {farmData?.land} acres · Rs {econ.msp_per_kg}
              /kg MSP · {econ.effective_loss_pct}% effective loss
            </div>
            <div style={{ marginTop: 10 }}>
              <Badge bg={riskColor} color="#fff" border={riskColor}>
                {riskLabel} FINANCIAL RISK
              </Badge>
            </div>
          </div>
          {[
            {
              icon: "zap",
              label: "Treatment Cost",
              val: `~Rs ${treatCost.toLocaleString("en-IN")}`,
              c: T.green,
            },
            {
              icon: "check",
              label: "Net Saving if Treated",
              val: `Rs ${netSaving.toLocaleString("en-IN")}`,
              c: T.green,
            },
            {
              icon: "shield",
              label: "Max Insurance Cover",
              val: `Rs ${econ.insurance_cover.toLocaleString("en-IN")}`,
              c: T.blu,
            },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: `1px solid #f0fdf4`,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                <G n={r.icon} s={13} c={r.c} w={2} />
                {r.label}
              </span>
              <span
                style={{ fontWeight: 700, fontSize: "0.81rem", color: r.c }}
              >
                {r.val}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* GOVERNMENT SCHEMES */}
      <Card>
        <SLabel icon="shield" color={T.deep}>
          Government Schemes You Qualify For
        </SLabel>
        {SCHEMES.map((s) => (
          <div
            key={s.name}
            style={{
              background: "#f8fffe",
              borderRadius: 13,
              padding: "12px 13px",
              marginBottom: 10,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ITile icon={s.icon} size="sm" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.77rem",
                    color: T.deep,
                  }}
                >
                  {s.name}
                </span>
              </div>
              <Badge bg="#dcfce7" color={T.green} border={T.border}>
                ELIGIBLE
              </Badge>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.69rem",
                color: T.textLight,
                marginBottom: 3,
              }}
            >
              <G n="check" s={11} c={T.green} w={2.5} />
              {s.elig}
            </div>
            <div
              style={{
                fontSize: "0.69rem",
                color: T.textLight,
                marginBottom: s.flag ? 8 : 6,
              }}
            >
              Rs <strong>{s.comp}</strong>
            </div>
            {s.flag && econ && lossAmt > 0 && (
              <div
                style={{
                  background: T.redBg,
                  border: `1px solid ${T.redBo}`,
                  borderRadius: 9,
                  padding: "7px 10px",
                  fontSize: "0.65rem",
                  color: T.red,
                  marginBottom: 7,
                  display: "flex",
                  gap: 6,
                  lineHeight: 1.5,
                }}
              >
                <G n="alert" s={12} c={T.red} w={2} />
                Your estimated loss (Rs {lossAmt.toLocaleString("en-IN")})
                exceeds threshold — apply immediately
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.64rem",
                  color: T.blu,
                }}
              >
                <G n="globe" s={11} c={T.blu} w={2} />
                {s.link}
              </span>
              <button
                onClick={() => cs("Scheme Application Portal")}
                style={{
                  background: `linear-gradient(135deg,${T.deep},${T.green})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 9,
                  padding: "6px 13px",
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 8px rgba(22,163,74,0.22)",
                }}
              >
                <G n="zap" s={11} c="#fff" w={2} /> Apply Now
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
