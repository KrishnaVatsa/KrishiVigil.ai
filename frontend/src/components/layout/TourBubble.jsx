import React from "react";
import { T } from "../../utils/theme";
import { KVLogo } from "../icons/Icons";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { TOUR_STEPS } from "../../utils/constants";

export const TourBubble = ({ step, onNext, onSkip }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backdropFilter: "blur(2px)",
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: "26px 24px",
        maxWidth: 320,
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        animation: "popIn 0.25s ease",
        border: `2px solid ${T.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 5,
          marginBottom: 18,
          justifyContent: "center",
        }}
      >
        {TOUR_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === TOUR_STEPS.indexOf(step) ? 20 : 7,
              height: 7,
              borderRadius: 4,
              background: i === TOUR_STEPS.indexOf(step) ? T.green : T.border,
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "inline-flex",
          background: "#f0fdf4",
          borderRadius: 16,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <KVLogo size={42} />
      </div>
      <div
        style={{
          fontWeight: 800,
          fontSize: "1rem",
          color: T.deep,
          marginBottom: 8,
        }}
      >
        {step.title}
      </div>
      <div
        style={{
          fontSize: "0.77rem",
          color: T.muted,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {step.desc}
      </div>
      <PrimaryBtn
        onClick={onNext}
        style={{
          width: "100%",
          padding: "13px",
          fontSize: "0.9rem",
          marginBottom: 10,
        }}
      >
        {step.btn}
      </PrimaryBtn>
      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: T.muted,
            cursor: "pointer",
            fontSize: "0.72rem",
            fontFamily: "inherit",
            padding: "4px",
          }}
        >
          Skip demo — explore freely
        </button>
      )}
    </div>
  </div>
);
