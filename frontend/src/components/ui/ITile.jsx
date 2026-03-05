import React from "react";
import { T } from "../../utils/theme";
import { G } from "../icons/Icons";

export const ITile = ({ icon, size = "sm", color = "#fff" }) => {
  const sz = size === "sm" ? 30 : size === "md" ? 38 : 46;
  const br = size === "sm" ? 10 : size === "md" ? 12 : 14;
  return (
    <div
      style={{
        width: sz,
        height: sz,
        borderRadius: br,
        background: `linear-gradient(135deg,${T.deep},${T.green})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
      }}
    >
      <G
        n={icon}
        s={size === "sm" ? 14 : size === "md" ? 18 : 20}
        c={color}
        w={2}
      />
    </div>
  );
};
