import React from "react";
import { T } from "../../utils/theme";
import { LANGS } from "../../utils/constants";
import { ITile } from "../ui/ITile";

export function LanguagePopup({ setShowLang, cs }) {
    return (
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
    );
}
