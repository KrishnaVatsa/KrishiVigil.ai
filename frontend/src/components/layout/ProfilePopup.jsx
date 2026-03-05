import React from "react";
import { T, shM } from "../../utils/theme";
import { G } from "../icons/Icons";

export function ProfilePopup({
    setShowProf,
    gpsStatus,
    userLat,
    userLon,
    W,
}) {
    return (
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
    );
}
