import React from "react";
import { T } from "../../utils/theme";
import { KVLogo, G } from "../icons/Icons";

export function TopNav({ setShowProf, cs, setShowLang, pulse }) {
  return (
    <div
      style={{
        background: T.nav,
        borderBottom: `1px solid ${T.border}`,
        padding: "11px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setShowProf((p) => !p)}
        style={{
          background: `linear-gradient(135deg,${T.deep},${T.green})`,
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(22,163,74,0.35)",
        }}
      >
        <G n="user" s={18} c="#fff" w={2} />
      </button>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <KVLogo size={28} />
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.05rem",
              color: T.deep,
              letterSpacing: "-0.4px",
            }}
          >
            KrishiVigil<span style={{ color: T.green }}>.ai</span>
          </span>
        </div>
        <div
          style={{
            fontSize: "0.53rem",
            color: T.muted,
            letterSpacing: "1px",
            marginTop: 1,
          }}
        >
          SMART CROP PROTECTION
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => cs("Alert Notifications")}
          style={{
            background: T.border2,
            border: `1px solid ${T.border}`,
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <G n="bell" s={16} c={T.green} w={2} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: T.red,
              borderRadius: "50%",
              width: 7,
              height: 7,
              border: "1.5px solid #fff",
              boxShadow: pulse ? "0 0 0 3px rgba(220,38,38,0.2)" : "none",
              transition: "box-shadow 0.4s",
            }}
          />
        </button>
        <button
          onClick={() => setShowLang(true)}
          style={{
            background: T.border2,
            border: `1.5px solid ${T.green}`,
            borderRadius: 22,
            padding: "5px 11px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "inherit",
          }}
        >
          <G n="globe" s={13} c={T.deep} w={2} />
          <span
            style={{ fontWeight: 700, fontSize: "0.7rem", color: T.deep }}
          >
            हि/ਪੰ
          </span>
        </button>
      </div>
    </div>
  );
}
