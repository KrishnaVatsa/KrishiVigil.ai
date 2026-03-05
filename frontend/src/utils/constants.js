// BACKEND API URL — change this if your Flask server runs on
// a different port or host
export const API_BASE = "http://localhost:5000";

// MSP lookup for crop popup preview
export const MSP_DB = {
  tomato: 1200,
  potato: 600,
  wheat: 2275,
  rice: 2183,
  maize: 1962,
  onion: 800,
  soybean: 4600,
  cotton: 6620,
  sugarcane: 315,
  mustard: 5650,
  sunflower: 6760,
  groundnut: 6377,
  chilli: 9000,
  brinjal: 700,
  cabbage: 500,
  cauliflower: 600,
};

// Government schemes data (static — does not change per scan)
export const SCHEMES = [
  {
    name: "PM Fasal Bima Yojana",
    icon: "shield",
    elig: "Yield loss > 25% — you qualify",
    comp: "Up to Rs 2,00,000",
    link: "pmfby.gov.in",
    state: "Central",
    flag: true,
  },
  {
    name: "PM Kisan Samman Nidhi",
    icon: "leaf",
    elig: "All farmers with land qualify",
    comp: "Rs 6,000 / year",
    link: "pmkisan.gov.in",
    state: "Central",
    flag: false,
  },
  {
    name: "Kisan Credit Card (KCC)",
    icon: "activity",
    elig: "Yield loss > 15% — funds needed",
    comp: "Rs 3,00,000 @ 4%",
    link: "Via nearest bank",
    state: "Central",
    flag: false,
  },
  {
    name: "Punjab — Karj Mafi",
    icon: "map",
    elig: "Punjab farmer via GPS location",
    comp: "Debt relief Rs 2,00,000",
    link: "punjab.gov.in",
    state: "Punjab",
    flag: false,
  },
  {
    name: "PMKSY Irrigation Subsidy",
    icon: "drop",
    elig: "Drip irrigation recommended",
    comp: "55-75% subsidy",
    link: "pmksy.gov.in",
    state: "Central",
    flag: false,
  },
  {
    name: "Soil Health Card",
    icon: "sprout",
    elig: "Disease detected — soil check needed",
    comp: "Free soil test + card",
    link: "soilhealth.dac.gov.in",
    state: "Central",
    flag: false,
  },
  {
    name: "Bihar Fasal Sahayata",
    icon: "shield",
    elig: "Bihar farmer, yield loss > 20%",
    comp: "Up to Rs 10,000/acre",
    link: "pacsonline.bih.nic.in",
    state: "Bihar",
    flag: false,
  },
];

export const LANGS = [
  { s: "हिंदी", sub: "Hindi · UP, MP, Rajasthan" },
  { s: "ਪੰਜਾਬੀ", sub: "Punjabi · Punjab, Haryana" },
  { s: "मैथिली", sub: "Maithili · Bihar" },
  { s: "मराठी", sub: "Marathi · Maharashtra" },
  { s: "తెలుగు", sub: "Telugu · Andhra, Telangana" },
  { s: "ಕನ್ನಡ", sub: "Kannada · Karnataka" },
  { s: "தமிழ்", sub: "Tamil · Tamil Nadu" },
  { s: "বাংলা", sub: "Bengali · West Bengal" },
];

export const STEPS = [
  {
    icon: "camera",
    title: "Upload Any Crop Image",
    desc: "Leaf, fruit, stem — any visible symptom works",
  },
  {
    icon: "zap",
    title: "AI Analysis in <3s",
    desc: "EfficientNetB3 PlantVillage model runs inference instantly",
  },
  {
    icon: "drop",
    title: "Live Weather Check",
    desc: "GPS-based field risk assessment from OpenWeatherMap",
  },
  {
    icon: "rupee",
    title: "Exact Rs Loss Estimate",
    desc: "Calculated with your crop, land & state MSP",
  },
  {
    icon: "shield",
    title: "Government Schemes",
    desc: "Auto-matched schemes you qualify for",
  },
];

export const TOUR_STEPS = [
  {
    title: "Welcome to KrishiVigil.ai",
    desc: "AI-powered crop protection. One image = complete farm report.",
    btn: "Start Tour",
  },
  {
    title: "Step 1 — Login",
    desc: "Sign in with any credentials to continue.",
    btn: "Go to Login",
    action: "login",
  },
  {
    title: "Step 2 — Live Weather",
    desc: "GPS detects your location. Live weather loads from OpenWeatherMap API.",
    btn: "See Home",
    action: "home",
  },
  {
    title: "Step 3 — Upload Image",
    desc: "Tap the upload zone to select your crop leaf image.",
    btn: "Try Upload",
    action: "upload",
  },
  {
    title: "Step 4 — AI Results",
    desc: "See live AI output: disease, health score, urgency, advice — all dynamic.",
    btn: "See Results",
    action: "results",
  },
  {
    title: "Step 5 — Schemes",
    desc: "Government schemes matched to your crop loss automatically.",
    btn: "See Schemes",
    action: "schemes",
  },
  {
    title: "All Done!",
    desc: "KrishiVigil.ai — One image. Complete crop protection.",
    btn: "Explore Freely",
  },
];
