import React from "react";
import { T, sh } from "../../utils/theme";

export const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: T.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      border: `1px solid ${T.border}`,
      boxShadow: sh,
      ...style,
    }}
  >
    {children}
  </div>
);
