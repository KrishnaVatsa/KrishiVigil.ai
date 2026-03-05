import React from "react";
import { T } from "../../utils/theme";
import { G } from "../icons/Icons";

export function BottomNav({ screen, cs, go }) {
    return (
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
    );
}
