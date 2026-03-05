import React from "react";
import { T, sh } from "../../../utils/theme";
import { G } from "../../icons/Icons";
import { ITile } from "../../ui/ITile";
import { Badge } from "../../ui/Badge";
import { SCHEMES } from "../../../utils/constants";

export const SchemesScreen = ({ go, filter, setFilter, cs }) => {
  const filtered =
    filter === "All" ? SCHEMES : SCHEMES.filter((s) => s.state === filter);

  return (
    <div
      style={{ padding: "16px 15px 16px", animation: "fadeSlideUp 0.3s ease" }}
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
        <G n="back" s={15} c={T.green} w={2} /> Back
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <ITile icon="shield" size="lg" />
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: T.deep }}>
            Government Schemes
          </div>
          <div style={{ fontSize: "0.67rem", color: T.muted }}>
            Central · Punjab · Haryana · Bihar
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 7,
          marginTop: 14,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {["All", "Punjab", "Haryana", "Bihar", "Central"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? T.green : "#f0fdf4",
              color: filter === f ? "#fff" : T.green,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {filtered.map((s) => (
        <div
          key={s.name}
          style={{
            background: T.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${T.border}`,
            boxShadow: sh,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 9,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ITile icon={s.icon} size="md" />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.83rem",
                    color: T.deep,
                  }}
                >
                  {s.name}
                </div>
                <Badge bg="#dcfce7" color={T.green} border={T.border}>
                  ELIGIBLE
                </Badge>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "0.71rem",
              color: T.textLight,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <G n="check" s={12} c={T.green} w={2.5} />
            {s.elig}
          </div>
          <div
            style={{
              fontSize: "0.71rem",
              color: T.textLight,
              marginBottom: 10,
            }}
          >
            Benefit: <strong style={{ color: T.deep }}>{s.comp}</strong>
          </div>
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
                fontSize: "0.66rem",
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
                borderRadius: 10,
                padding: "8px 15px",
                fontSize: "0.71rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <G n="zap" s={12} c="#fff" w={2} /> Apply Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
