import React from "react";
import { T } from "../../utils/theme";
import { G } from "../icons/Icons";

export const SLabel = ({ icon, children, color = T.deep }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}
  >
    <G n={icon} s={13} c={color} w={2.2} />
    <span
      style={{
        fontWeight: 700,
        fontSize: "0.68rem",
        color,
        textTransform: "uppercase",
        letterSpacing: "0.9px",
      }}
    >
      {children}
    </span>
  </div>
);
