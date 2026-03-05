import React from "react";
import { T } from "../../utils/theme";

export const PrimaryBtn = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 700,
      background: `linear-gradient(135deg,${T.deep},${T.green})`,
      color: "#fff",
      borderRadius: 13,
      padding: "12px 24px",
      fontSize: "0.85rem",
      boxShadow: "0 4px 14px rgba(22,163,74,0.38)",
      letterSpacing: "0.2px",
      ...style,
    }}
  >
    {children}
  </button>
);
