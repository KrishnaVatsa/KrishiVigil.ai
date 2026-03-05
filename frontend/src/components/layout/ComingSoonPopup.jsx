import React from "react";
import { T, shM } from "../../utils/theme";
import { G } from "../icons/Icons";
import { PrimaryBtn } from "../ui/PrimaryBtn";

export function ComingSoonPopup({ csLabel, setCSLabel }) {
    if (!csLabel) return null;

    return (
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
                    This feature is under development and will be available in the next
                    version of KrishiVigil.ai
                </div>
                <PrimaryBtn
                    onClick={() => setCSLabel(null)}
                    style={{ padding: "12px 36px", fontSize: "0.9rem" }}
                >
                    Got it
                </PrimaryBtn>
            </div>
        </div>
    );
}
