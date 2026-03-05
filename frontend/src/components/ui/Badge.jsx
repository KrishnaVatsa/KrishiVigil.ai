import React from "react";

export const Badge = ({ children, bg, color, border }) => (
  <span
    style={{
      background: bg,
      color,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "3px 11px",
      fontSize: "0.63rem",
      fontWeight: 700,
      display: "inline-block",
      letterSpacing: "0.3px",
    }}
  >
    {children}
  </span>
);
