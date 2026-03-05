export const T = {
  green: "#16a34a",
  dg: "#15803d",
  deep: "#14532d",
  bg: "#f1fdf4",
  card: "#ffffff",
  border: "#bbf7d0",
  border2: "#dcfce7",
  muted: "#6b7280",
  text: "#1f2937",
  textLight: "#374151",
  red: "#dc2626",
  redBg: "#fff5f5",
  redBo: "#fecaca",
  yel: "#d97706",
  yelBg: "#fffdf0",
  yelBo: "#fde68a",
  blu: "#2563eb",
  bluBg: "#f0f7ff",
  bluBo: "#bfdbfe",
  nav: "#ffffff",
};

export const sh = "0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05)";
export const shM = "0 8px 32px rgba(0,0,0,0.12)";

export const CSS = `
  @keyframes spin          { to{transform:rotate(360deg)} }
  @keyframes kvGlow        { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
  @keyframes floatDot      { from{transform:translateY(0)} to{transform:translateY(-9px)} }
  @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideIn   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp       { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes popIn         { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
  @keyframes shakeX        { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
  ::-webkit-scrollbar{width:0;height:0}
  input::placeholder{color:rgba(150,150,150,0.6)}
  input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
`;
