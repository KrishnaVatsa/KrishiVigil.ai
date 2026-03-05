import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// BACKEND API URL — change this if your Flask server runs on
// a different port or host
// ═══════════════════════════════════════════════════════════════
const API_BASE = "http://localhost:5000";

/* ─── SVG primitives ─── */
const Svg = ({ s=24, vb="0 0 24 24", children, style={} }) => (
  <svg width={s} height={s} viewBox={vb} fill="none" style={style}>{children}</svg>
);

const WeatherIcon = ({ type, s=28 }) => {
  if (type === "sun") return (
    <Svg s={s} style={{filter:"drop-shadow(0 0 6px rgba(251,191,36,0.7))"}}>
      <circle cx="12" cy="12" r="4.5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.5"/>
      {[0,45,90,135,180,225,270,315].map((deg,i)=>{
        const r=Math.PI*deg/180, x1=12+7.5*Math.cos(r), y1=12+7.5*Math.sin(r), x2=12+9.8*Math.cos(r), y2=12+9.8*Math.sin(r);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>;
      })}
    </Svg>
  );
  if (type === "rain") return (
    <Svg s={s}>
      <path d="M18 9.5h-1.1A7 7 0 1 0 8 18.5h10a4.5 4.5 0 0 0 0-9z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="0.5"/>
      {[[8,22],[11,21],[14,22],[17,21]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx="1.2" ry="2" fill="#3B82F6" opacity="0.85"/>
      ))}
    </Svg>
  );
  if (type === "cloud") return (
    <Svg s={s}>
      <path d="M18 9.5h-1.1A7 7 0 1 0 8 18.5h10a4.5 4.5 0 0 0 0-9z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.5"/>
    </Svg>
  );
  return (
    <Svg s={s}>
      <path d="M18 9.5h-1.1A7 7 0 1 0 8 18.5h10a4.5 4.5 0 0 0 0-9z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="0.5"/>
      {[[8,22],[11,21],[14,22]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx="1.2" ry="2" fill="#3B82F6" opacity="0.85"/>
      ))}
    </Svg>
  );
};

const KVLogo = ({ size=72 }) => (
  <div style={{position:"relative",width:size,height:size,display:"inline-block"}}>
    <div style={{position:"absolute",inset:-4,borderRadius:"30%",background:"radial-gradient(circle,rgba(22,163,74,0.18) 0%,transparent 70%)",animation:"kvGlow 3s ease-in-out infinite"}}/>
    <svg width={size} height={size} viewBox="0 0 80 80" style={{position:"relative",zIndex:1,filter:"drop-shadow(0 6px 18px rgba(22,163,74,0.38))"}}>
      <defs>
        <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#052e16"/><stop offset="45%" stopColor="#14532d"/><stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
        <linearGradient id="stalkG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac"/><stop offset="100%" stopColor="#4ade80"/>
        </linearGradient>
        <linearGradient id="grainG1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bbf7d0"/><stop offset="100%" stopColor="#86efac"/>
        </linearGradient>
        <linearGradient id="grainG2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#86efac"/><stop offset="100%" stopColor="#4ade80"/>
        </linearGradient>
        <linearGradient id="grainG3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80"/><stop offset="100%" stopColor="#22c55e"/>
        </linearGradient>
        <clipPath id="roundRect"><rect x="0" y="0" width="80" height="80" rx="22" ry="22"/></clipPath>
      </defs>
      <rect width="80" height="80" rx="22" ry="22" fill="url(#bgG)"/>
      <rect width="80" height="40" rx="22" ry="22" fill="rgba(255,255,255,0.06)" clipPath="url(#roundRect)"/>
      <line x1="40" y1="70" x2="40" y2="12" stroke="url(#stalkG)" strokeWidth="2.8" strokeLinecap="round"/>
      <ellipse cx="33" cy="54" rx="6.5" ry="3.2" transform="rotate(-40 33 54)" fill="url(#grainG1)" opacity="0.95"/>
      <ellipse cx="47" cy="54" rx="6.5" ry="3.2" transform="rotate(40 47 54)" fill="url(#grainG1)" opacity="0.95"/>
      <ellipse cx="33.5" cy="43" rx="6" ry="2.9" transform="rotate(-38 33.5 43)" fill="url(#grainG2)" opacity="0.95"/>
      <ellipse cx="46.5" cy="43" rx="6" ry="2.9" transform="rotate(38 46.5 43)" fill="url(#grainG2)" opacity="0.95"/>
      <ellipse cx="34" cy="33" rx="5.2" ry="2.6" transform="rotate(-35 34 33)" fill="url(#grainG3)" opacity="0.92"/>
      <ellipse cx="46" cy="33" rx="5.2" ry="2.6" transform="rotate(35 46 33)" fill="url(#grainG3)" opacity="0.92"/>
      <ellipse cx="40" cy="15" rx="3.5" ry="6" fill="#22c55e" opacity="0.9"/>
    </svg>
  </div>
);

const Ic = ({ d, s=16, c="currentColor", w=1.8, style={} }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const paths = {
  user:["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  globe:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  bell:["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  map:["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  alert:["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  shield:["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  zap:["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  activity:["M22 12h-4l-3 9L9 3l-3 9H2"],
  check:["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"],
  clock:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"],
  download:["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  drop:["M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"],
  thermo:["M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"],
  trending:["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"],
  rupee:["M6 3h12","M6 8h12","M6 13l8.5 8"],
  sprout:["M7 20s4-6 4-10S7 4 7 4","M17 20s-4-6-4-10 4-6 4-6"],
  back:["M19 12H5","M12 5l-7 7 7 7"],
  info:["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 16v-4","M12 8h.01"],
  leaf:["M12 2C6 2 3 7 3 12c0 4 2.5 7 6 8.5","M12 2c6 0 9 5 9 10 0 4-2.5 7-6 8.5","M12 2v18"],
  camera:["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z","M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeoff:["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94","M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19","M1 1l22 22"],
  phone:["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  lock:["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  arrow:["M5 12h14","M12 5l7 7-7 7"],
  star:["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  scan:["M3 7V5a2 2 0 0 1 2-2h2","M17 3h2a2 2 0 0 1 2 2v2","M21 17v2a2 2 0 0 1-2 2h-2","M7 21H5a2 2 0 0 1-2-2v-2"],
  wind:["M9.59 4.59A2 2 0 1 1 11 8H2","M12.59 19.41A2 2 0 1 0 14 16H2","M17.59 11.41A2 2 0 1 1 19 8H2"],
  micro:["M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z","M19 10v2a7 7 0 0 1-14 0v-2","M12 19v4","M8 23h8"],
  wheat:["M12 22V2","M7 7c0-2.5 5-4 5-4s5 1.5 5 4","M7 12c0-2.5 5-4 5-4s5 1.5 5 4","M7 17c0-2.5 5-4 5-4s5 1.5 5 4"],
  close:["M18 6L6 18","M6 6l12 12"],
  gps:["M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z","M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
};
const G=({n,s=16,c="currentColor",w=1.8,style={}})=><Ic d={paths[n]||paths.info} s={s} c={c} w={w} style={style}/>;

const T={
  green:"#16a34a",dg:"#15803d",deep:"#14532d",
  bg:"#f1fdf4",card:"#ffffff",border:"#bbf7d0",border2:"#dcfce7",
  muted:"#6b7280",text:"#1f2937",textLight:"#374151",
  red:"#dc2626",redBg:"#fff5f5",redBo:"#fecaca",
  yel:"#d97706",yelBg:"#fffdf0",yelBo:"#fde68a",
  blu:"#2563eb",bluBg:"#f0f7ff",bluBo:"#bfdbfe",
  nav:"#ffffff",
};
const sh ="0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.05)";
const shM="0 8px 32px rgba(0,0,0,0.12)";

const Card=({children,style={}})=>(
  <div style={{background:T.card,borderRadius:18,padding:18,marginBottom:14,border:`1px solid ${T.border}`,boxShadow:sh,...style}}>{children}</div>
);
const SLabel=({icon,children,color=T.deep})=>(
  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
    <G n={icon} s={13} c={color} w={2.2}/>
    <span style={{fontWeight:700,fontSize:"0.68rem",color,textTransform:"uppercase",letterSpacing:"0.9px"}}>{children}</span>
  </div>
);
const Badge=({children,bg,color,border})=>(
  <span style={{background:bg,color,border:`1px solid ${border}`,borderRadius:20,padding:"3px 11px",fontSize:"0.63rem",fontWeight:700,display:"inline-block",letterSpacing:"0.3px"}}>{children}</span>
);
const ITile=({icon,size="sm",color="#fff"})=>{
  const sz=size==="sm"?30:size==="md"?38:46;
  const br=size==="sm"?10:size==="md"?12:14;
  return(<div style={{width:sz,height:sz,borderRadius:br,background:`linear-gradient(135deg,${T.deep},${T.green})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(22,163,74,0.3)"}}><G n={icon} s={size==="sm"?14:size==="md"?18:20} c={color} w={2}/></div>);
};
const PrimaryBtn=({children,onClick,style={}})=>(
  <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,background:`linear-gradient(135deg,${T.deep},${T.green})`,color:"#fff",borderRadius:13,padding:"12px 24px",fontSize:"0.85rem",boxShadow:"0 4px 14px rgba(22,163,74,0.38)",letterSpacing:"0.2px",...style}}>{children}</button>
);

// MSP lookup for crop popup preview
const MSP_DB={tomato:1200,potato:600,wheat:2275,rice:2183,maize:1962,onion:800,soybean:4600,cotton:6620,sugarcane:315,mustard:5650,sunflower:6760,groundnut:6377,chilli:9000,brinjal:700,cabbage:500,cauliflower:600};
const getMSP=(name)=>{const k=name.toLowerCase().trim();return MSP_DB[k]||MSP_DB[Object.keys(MSP_DB).find(c=>c.includes(k)||k.includes(c))]||1200;};

// Government schemes data (static — does not change per scan)
const SCHEMES=[
  {name:"PM Fasal Bima Yojana",icon:"shield",elig:"Yield loss > 25% — you qualify",comp:"Up to Rs 2,00,000",link:"pmfby.gov.in",state:"Central",flag:true},
  {name:"PM Kisan Samman Nidhi",icon:"leaf",elig:"All farmers with land qualify",comp:"Rs 6,000 / year",link:"pmkisan.gov.in",state:"Central",flag:false},
  {name:"Kisan Credit Card (KCC)",icon:"activity",elig:"Yield loss > 15% — funds needed",comp:"Rs 3,00,000 @ 4%",link:"Via nearest bank",state:"Central",flag:false},
  {name:"Punjab — Karj Mafi",icon:"map",elig:"Punjab farmer via GPS location",comp:"Debt relief Rs 2,00,000",link:"punjab.gov.in",state:"Punjab",flag:false},
  {name:"PMKSY Irrigation Subsidy",icon:"drop",elig:"Drip irrigation recommended",comp:"55-75% subsidy",link:"pmksy.gov.in",state:"Central",flag:false},
  {name:"Soil Health Card",icon:"sprout",elig:"Disease detected — soil check needed",comp:"Free soil test + card",link:"soilhealth.dac.gov.in",state:"Central",flag:false},
  {name:"Bihar Fasal Sahayata",icon:"shield",elig:"Bihar farmer, yield loss > 20%",comp:"Up to Rs 10,000/acre",link:"pacsonline.bih.nic.in",state:"Bihar",flag:false},
];

const LANGS=[
  {s:"हिंदी",sub:"Hindi · UP, MP, Rajasthan"},{s:"ਪੰਜਾਬੀ",sub:"Punjabi · Punjab, Haryana"},
  {s:"मैथिली",sub:"Maithili · Bihar"},{s:"मराठी",sub:"Marathi · Maharashtra"},
  {s:"తెలుగు",sub:"Telugu · Andhra, Telangana"},{s:"ಕನ್ನಡ",sub:"Kannada · Karnataka"},
  {s:"தமிழ்",sub:"Tamil · Tamil Nadu"},{s:"বাংলা",sub:"Bengali · West Bengal"},
];

const STEPS=[
  {icon:"camera",title:"Upload Any Crop Image",desc:"Leaf, fruit, stem — any visible symptom works"},
  {icon:"zap",title:"AI Analysis in <3s",desc:"EfficientNetB3 PlantVillage model runs inference instantly"},
  {icon:"drop",title:"Live Weather Check",desc:"GPS-based field risk assessment from OpenWeatherMap"},
  {icon:"rupee",title:"Exact Rs Loss Estimate",desc:"Calculated with your crop, land & state MSP"},
  {icon:"shield",title:"Government Schemes",desc:"Auto-matched schemes you qualify for"},
];

const TOUR_STEPS = [
  { title: "Welcome to KrishiVigil.ai", desc: "AI-powered crop protection. One image = complete farm report.", btn: "Start Tour" },
  { title: "Step 1 — Login", desc: "Sign in with any credentials to continue.", btn: "Go to Login", action: "login" },
  { title: "Step 2 — Live Weather", desc: "GPS detects your location. Live weather loads from OpenWeatherMap API.", btn: "See Home", action: "home" },
  { title: "Step 3 — Upload Image", desc: "Tap the upload zone to select your crop leaf image.", btn: "Try Upload", action: "upload" },
  { title: "Step 4 — AI Results", desc: "See live AI output: disease, health score, urgency, advice — all dynamic.", btn: "See Results", action: "results" },
  { title: "Step 5 — Schemes", desc: "Government schemes matched to your crop loss automatically.", btn: "See Schemes", action: "schemes" },
  { title: "All Done!", desc: "KrishiVigil.ai — One image. Complete crop protection.", btn: "Explore Freely" },
];

/* ════ LOGIN ════ */
const LoginPage=({onLogin})=>{
  const [mobile,setMobile]=useState("");
  const [pass,setPass]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [focused,setFocused]=useState(null);
  const [shake,setShake]=useState(false);
  const submit=()=>{
    if(!mobile||!pass){setShake(true);setTimeout(()=>setShake(false),500);return;}
    setLoading(true);setTimeout(()=>{setLoading(false);onLogin();},1600);
  };
  return(
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(170deg,#f0fdf4 0%,#dcfce7 35%,#bbf7d0 65%,#86efac 100%)",padding:"32px 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-80,width:300,height:300,borderRadius:"50%",background:"rgba(34,197,94,0.07)",filter:"blur(55px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",background:"rgba(22,163,74,0.09)",filter:"blur(45px)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:38,animation:"fadeSlideDown 0.7s ease both"}}>
        <KVLogo size={84}/>
        <div style={{marginTop:18,marginBottom:3}}>
          <span style={{fontWeight:900,fontSize:"1.95rem",color:"#14532d",letterSpacing:"-0.6px"}}>KrishiVigil<span style={{color:"#16a34a"}}>.ai</span></span>
        </div>
        <div style={{color:"#15803d",fontSize:"0.7rem",letterSpacing:"3.5px",fontWeight:700,textTransform:"uppercase"}}>Smart Crop Protection</div>
        <div style={{width:44,height:2,background:"linear-gradient(90deg,transparent,#16a34a,transparent)",margin:"11px auto 0",borderRadius:2}}/>
      </div>
      <div style={{background:"#ffffff",borderRadius:26,padding:"30px 26px",width:"100%",maxWidth:364,border:"1px solid #bbf7d0",boxShadow:"0 12px 48px rgba(20,83,45,0.14)",animation:"fadeSlideUp 0.7s 0.15s ease both"}}>
        <div style={{color:"#14532d",fontWeight:800,fontSize:"1.15rem",marginBottom:3}}>Welcome back</div>
        <div style={{color:"#6b7280",fontSize:"0.75rem",marginBottom:24}}>Sign in to protect your crops</div>
        <div style={{marginBottom:14}}>
          <label style={{color:"#374151",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",display:"block",marginBottom:7}}>MOBILE NUMBER / EMAIL</label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:focused==="m"?"#f0fdf4":"#f9fafb",borderRadius:13,padding:"13px 15px",border:`1.5px solid ${focused==="m"?"#16a34a":"#d1fae5"}`,transition:"all 0.2s",animation:shake&&!mobile?"shakeX 0.4s ease":undefined}}>
            <G n="phone" s={15} c={focused==="m"?"#16a34a":"#9ca3af"} w={2}/>
            <input type="text" placeholder="+91 98765 43210 or email" value={mobile} onChange={e=>setMobile(e.target.value)} onFocus={()=>setFocused("m")} onBlur={()=>setFocused(null)}
              style={{background:"none",border:"none",outline:"none",color:"#1f2937",fontSize:"0.86rem",flex:1,fontFamily:"inherit"}}/>
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{color:"#374151",fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",display:"block",marginBottom:7}}>PASSWORD</label>
          <div style={{display:"flex",alignItems:"center",gap:10,background:focused==="p"?"#f0fdf4":"#f9fafb",borderRadius:13,padding:"13px 15px",border:`1.5px solid ${focused==="p"?"#16a34a":"#d1fae5"}`,transition:"all 0.2s"}}>
            <G n="lock" s={15} c={focused==="p"?"#16a34a":"#9ca3af"} w={2}/>
            <input type={showPw?"text":"password"} placeholder="Enter your password" value={pass} onChange={e=>setPass(e.target.value)} onFocus={()=>setFocused("p")} onBlur={()=>setFocused(null)} onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{background:"none",border:"none",outline:"none",color:"#1f2937",fontSize:"0.86rem",flex:1,fontFamily:"inherit"}}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
              <G n={showPw?"eyeoff":"eye"} s={14} c="#9ca3af" w={2}/>
            </button>
          </div>
          <div style={{textAlign:"right",marginTop:7}}><span style={{color:"#16a34a",fontSize:"0.69rem",cursor:"pointer",fontWeight:600}}>Forgot password?</span></div>
        </div>
        <button onClick={submit} disabled={loading} style={{width:"100%",background:loading?"rgba(22,163,74,0.45)":`linear-gradient(135deg,${T.deep},${T.green})`,color:"#fff",border:"none",borderRadius:14,padding:"15px",fontWeight:700,fontSize:"0.93rem",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:loading?"none":"0 6px 22px rgba(22,163,74,0.45)",transition:"all 0.2s"}}>
          {loading?(<><div style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>Signing in...</>):(<>Sign In<G n="arrow" s={16} c="#fff" w={2.5}/></>)}
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0"}}>
          <div style={{flex:1,height:1,background:"#e5e7eb"}}/><span style={{color:"#9ca3af",fontSize:"0.66rem",fontWeight:500}}>OR</span><div style={{flex:1,height:1,background:"#e5e7eb"}}/>
        </div>
        <button onClick={submit} style={{width:"100%",background:"#f9fafb",color:"#374151",border:"1.5px solid #d1fae5",borderRadius:14,padding:"13px",fontWeight:600,fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>Create new account</button>
      </div>
      <div style={{marginTop:22,color:"#374151",fontSize:"0.64rem",textAlign:"center",fontWeight:500,animation:"fadeSlideUp 0.7s 0.4s ease both"}}>Trusted by 10,000+ farmers across India</div>
    </div>
  );
};

/* ════ CROP POPUP ════ */
const CropPopup=({onSubmit})=>{
  const [crop,setCrop]=useState("");
  const [land,setLand]=useState("");
  const [focused,setFocused]=useState(null);
  const [err,setErr]=useState(false);
  const crops=["Tomato","Potato","Wheat","Rice","Maize","Onion","Soybean","Cotton","Mustard","Chilli","Brinjal","Cauliflower"];
  const submit=()=>{
    if(!crop.trim()||!land){setErr(true);setTimeout(()=>setErr(false),600);return;}
    onSubmit({crop:crop.trim(),land:parseFloat(land)});
  };
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(5,46,22,0.55)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:24,padding:28,width:"100%",maxWidth:360,boxShadow:shM,animation:"popIn 0.25s ease",border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <div style={{background:`linear-gradient(135deg,${T.deep},${T.green})`,borderRadius:14,width:46,height:46,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(22,163,74,0.35)"}}><G n="wheat" s={22} c="#fff" w={2}/></div>
          <div>
            <div style={{fontWeight:800,fontSize:"1.05rem",color:T.deep}}>Your Farm Details</div>
            <div style={{fontSize:"0.7rem",color:T.muted,marginTop:2}}>Used by AI for accurate crop-specific analysis</div>
          </div>
        </div>
        <div style={{height:1,background:T.border2,margin:"16px 0"}}/>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"0.66rem",fontWeight:700,color:T.deep,letterSpacing:"0.5px",display:"block",marginBottom:7}}>CROP NAME</label>
          <div style={{display:"flex",alignItems:"center",gap:8,background:focused==="c"?"#f0fdf4":"#f9fafb",borderRadius:12,padding:"11px 14px",border:`1.5px solid ${focused==="c"?T.green:T.border}`,transition:"all 0.2s",animation:err&&!crop?"shakeX 0.4s ease":undefined}}>
            <G n="leaf" s={14} c={focused==="c"?T.green:T.muted} w={2}/>
            <input type="text" placeholder="e.g. Tomato, Wheat, Rice..." value={crop} onChange={e=>setCrop(e.target.value)} onFocus={()=>setFocused("c")} onBlur={()=>setFocused(null)}
              style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"0.88rem",flex:1,fontFamily:"inherit"}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>
            {crops.slice(0,6).map(c=>(
              <button key={c} onClick={()=>setCrop(c)} style={{background:crop===c?T.green:T.border2,color:crop===c?"#fff":T.deep,border:`1px solid ${crop===c?T.green:T.border}`,borderRadius:20,padding:"4px 10px",fontSize:"0.65rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{c}</button>
            ))}
          </div>
          {crop&&(
            <div style={{marginTop:8,background:"#f0fdf4",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:7,border:`1px solid ${T.border}`}}>
              <G n="rupee" s={12} c={T.green} w={2.5}/>
              <span style={{fontSize:"0.7rem",color:T.deep,fontWeight:600}}>MSP: Rs {(getMSP(crop)/100).toFixed(2)}/kg <span style={{color:T.muted,fontWeight:400}}>({crop})</span></span>
            </div>
          )}
        </div>
        <div style={{marginBottom:22}}>
          <label style={{fontSize:"0.66rem",fontWeight:700,color:T.deep,letterSpacing:"0.5px",display:"block",marginBottom:7}}>LAND SIZE (ACRES)</label>
          <div style={{display:"flex",alignItems:"center",gap:8,background:focused==="l"?"#f0fdf4":"#f9fafb",borderRadius:12,padding:"11px 14px",border:`1.5px solid ${focused==="l"?T.green:T.border}`,transition:"all 0.2s",animation:err&&!land?"shakeX 0.4s ease":undefined}}>
            <G n="map" s={14} c={focused==="l"?T.green:T.muted} w={2}/>
            <input type="number" placeholder="e.g. 2.5" value={land} onChange={e=>setLand(e.target.value)} onFocus={()=>setFocused("l")} onBlur={()=>setFocused(null)} min="0.1" step="0.1"
              style={{background:"none",border:"none",outline:"none",color:T.text,fontSize:"0.88rem",flex:1,fontFamily:"inherit"}}/>
            <span style={{fontSize:"0.72rem",color:T.muted,fontWeight:500}}>acres</span>
          </div>
          <div style={{display:"flex",gap:5,marginTop:8}}>
            {["0.5","1","2","3","5","10"].map(v=>(
              <button key={v} onClick={()=>setLand(v)} style={{background:land===v?T.green:T.border2,color:land===v?"#fff":T.deep,border:`1px solid ${land===v?T.green:T.border}`,borderRadius:20,padding:"4px 9px",fontSize:"0.65rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{v}</button>
            ))}
          </div>
        </div>
        <PrimaryBtn onClick={submit} style={{width:"100%",fontSize:"0.9rem",padding:"14px"}}>
          <G n="arrow" s={16} c="#fff" w={2}/> Proceed to Analysis
        </PrimaryBtn>
      </div>
    </div>
  );
};

/* ════ TIER COLOR HELPER ════ */
const tierStyle = (color) => {
  if (color === "red")    return {bg:T.redBg, bo:T.redBo, c:T.red};
  if (color === "yellow") return {bg:T.yelBg, bo:T.yelBo, c:T.yel};
  if (color === "blue")   return {bg:T.bluBg, bo:T.bluBo, c:T.blu};
  return {bg:"#f0fdf4", bo:T.border, c:T.green};
};

const fungicideColor = (type) => {
  if (type === "Systemic") return {c:T.blu,  bg:T.bluBg,  bo:T.bluBo};
  if (type === "Bio")      return {c:T.green,bg:"#f0fdf4", bo:T.border};
  return                          {c:T.red,  bg:T.redBg,  bo:T.redBo};
};

/* ════ MAIN APP ════ */
export default function App(){
  const [page,setPage]       = useState("login");
  const [screen,setScreen]   = useState("home");
  const [showLang,setShowLang]   = useState(false);
  const [showProf,setShowProf]   = useState(false);
  const [csLabel,setCSLabel]     = useState(null);
  const [drag,setDrag]           = useState(false);
  const [filter,setFilter]       = useState("All");
  const [analyzing,setAnalyzing] = useState(false);
  const [showCropPopup,setShowCropPopup] = useState(false);
  const [farmData,setFarmData]   = useState(null);
  const [pulse,setPulse]         = useState(false);
  const [selectedImage,setSelectedImage] = useState(null);
  const [selectedFile,setSelectedFile]   = useState(null);

  // ═══════════════════════════════════════════════════════════
  // API RESULT STATE
  // apiResult is populated by POST /predict response from Flask
  // Every result dashboard value comes from here — NOTHING hardcoded
  // ═══════════════════════════════════════════════════════════
  const [apiResult,setApiResult] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // WEATHER STATE
  // weatherData is populated by GET /weather?lat=X&lon=Y
  // Loaded on app start using browser GPS
  // Also returned inside /predict response
  // ═══════════════════════════════════════════════════════════
  const [weatherData,setWeatherData] = useState(null);
  const [gpsStatus,setGpsStatus]     = useState("detecting"); // detecting | live | denied | error

  // GPS coordinates state
  const [userLat,setUserLat] = useState(30.9010);  // default Ludhiana
  const [userLon,setUserLon] = useState(75.8573);

  const fileInputRef = useRef(null);
  const [tourStep,setTourStep]   = useState(0);
  const [tourActive,setTourActive] = useState(true);
  const [tourDone,setTourDone]   = useState(false);

  useEffect(()=>{const id=setInterval(()=>setPulse(p=>!p),1800);return()=>clearInterval(id);},[]);

  // ═══════════════════════════════════════════════════════════
  // GPS AUTO-DETECTION
  // Uses browser Geolocation API to get farmer's real coordinates
  // Then fetches live weather from Flask /weather endpoint
  // ═══════════════════════════════════════════════════════════
  useEffect(()=>{
    if(page !== "main") return;
    if(!navigator.geolocation){
      setGpsStatus("error");
      fetchWeather(userLat, userLon);
      return;
    }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setGpsStatus("live");
        fetchWeather(lat, lon);
      },
      (err) => {
        console.warn("GPS denied:", err.message);
        setGpsStatus("denied");
        fetchWeather(userLat, userLon);  // fallback to default coords
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [page]);

  // ═══════════════════════════════════════════════════════════
  // FETCH LIVE WEATHER
  // Calls Flask GET /weather endpoint with real GPS coordinates
  // ═══════════════════════════════════════════════════════════
  const fetchWeather = async (lat, lon) => {
    try {
      // ── BACKEND CONNECTION POINT ──────────────────────────
      // Flask weather endpoint: GET http://localhost:5000/weather
      // lat and lon come from browser GPS above
      // Response populates the entire weather strip on home screen
      // ─────────────────────────────────────────────────────
      const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
      if(res.ok){
        const data = await res.json();
        setWeatherData(data);
      }
    } catch(err){
      console.warn("Weather fetch failed:", err);
      // Keep weatherData as null — will show loading state
    }
  };

  const cs=l=>setCSLabel(l);
  const go=s=>{setScreen(s);setShowProf(false);};
  const filtered=filter==="All"?SCHEMES:SCHEMES.filter(s=>s.state===filter);

  const handleUpload=()=>{ if(fileInputRef.current) fileInputRef.current.click(); };

  const handleFileSelected=(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    setSelectedFile(file);
    const reader=new FileReader();
    reader.onload=(ev)=>setSelectedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ═══════════════════════════════════════════════════════════
  // HANDLE ANALYZE — sends image to Flask backend
  // ═══════════════════════════════════════════════════════════
  const handleAnalyze = async () => {
    if(!selectedImage) return;
    setAnalyzing(true);
    try {
      // ── BACKEND CONNECTION POINT ──────────────────────────
      // POST http://localhost:5000/predict
      // FormData fields sent:
      //   image -> crop leaf image file (required)
      //   crop  -> from farmData.crop (set in crop popup)
      //   land  -> from farmData.land (set in crop popup)
      //   lat   -> GPS latitude from browser
      //   lon   -> GPS longitude from browser
      //
      // These are added again here because analyze may be
      // called before or after crop popup submission
      // ─────────────────────────────────────────────────────
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("lat",   userLat.toString());
      formData.append("lon",   userLon.toString());

      // crop and land are appended later in handleCropSubmit
      // if already available, include them now
      if(farmData){
        formData.append("crop", farmData.crop);
        formData.append("land", farmData.land.toString());
      }

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      if(res.ok){
        const data = await res.json();
        setApiResult(data);
        // Update weather from the predict response too
        if(data.weather){
          setWeatherData(data.weather);
        }
      } else {
        setApiResult(null);  // will use demo fallback in render
      }
    } catch(err){
      console.warn("Backend not running — using demo mode:", err);
      setApiResult(null);
    }
    setAnalyzing(false);
    setShowCropPopup(true);
  };

  const handleRemoveImage=()=>{
    setSelectedImage(null);setSelectedFile(null);setApiResult(null);
    if(fileInputRef.current) fileInputRef.current.value="";
  };

  // ═══════════════════════════════════════════════════════════
  // HANDLE CROP SUBMIT — after user fills popup
  // Also sends final predict request with crop+land attached
  // ═══════════════════════════════════════════════════════════
  const handleCropSubmit = async (data) => {
    setFarmData(data);
    setShowCropPopup(false);

    // If we already have a result, re-request with crop+land included
    if(selectedFile){
      setAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("crop",  data.crop);
        formData.append("land",  data.land.toString());
        formData.append("lat",   userLat.toString());
        formData.append("lon",   userLon.toString());

        const res = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          body: formData,
        });
        if(res.ok){
          const result = await res.json();
          setApiResult(result);
          if(result.weather) setWeatherData(result.weather);
        }
      } catch(err){
        console.warn("Re-predict failed:", err);
      }
      setAnalyzing(false);
    }
    go("results");
  };

  // ═══════════════════════════════════════════════════════════
  // RESULT DATA — all values from API, nothing hardcoded
  // Falls back to demo values only when backend is offline
  // ═══════════════════════════════════════════════════════════
  const R = apiResult || {
    disease:"Late Blight", confidence:87.4, severity:"High",
    yield_loss:"50-80%", loss_pct:0.65, health_score:3,
    urgency:{hours:18, label:"Act within 18 hours", description:"Demo mode — backend offline. Deploy Flask server to see real AI results.", critical:true},
    all_scores:{"Late Blight":87.4,"Early Blight":7.2,"Leaf Spot":3.8,"Healthy":1.6},
    checklist:[
      {tier:"Do TODAY",color:"red",items:["Apply Metalaxyl+Mancozeb spray immediately","Remove infected leaves and burn them","Stop overhead irrigation"]},
      {tier:"Within 3 Days",color:"yellow",items:["Switch to drip irrigation","Apply foliar potassium spray"]},
      {tier:"This Week",color:"green",items:["Prune canopy for better airflow","Get soil test done"]},
      {tier:"Next Season",color:"blue",items:["Use blight-resistant varieties","3-year crop rotation"]},
    ],
    fungicides:[
      {name:"Ridomil Gold (Metalaxyl+Mancozeb)",dose:"2g/L water",timing:"Morning only",type:"Systemic"},
      {name:"Dithane M-45 (Mancozeb 75WP)",dose:"2.5g/L water",timing:"Every 7 days",type:"Contact"},
      {name:"Blitox 50 (Copper Oxychloride)",dose:"3g/L water",timing:"Preventive",type:"Contact"},
    ],
    economics: farmData ? {
      projected_loss: Math.round(farmData.land * 8000 * 12 * 0.65),
      treatment_cost: Math.round(farmData.land * 1200),
      net_saving: Math.round(farmData.land * 8000 * 12 * 0.65) - Math.round(farmData.land * 1200),
      insurance_cover: Math.min(Math.round(farmData.land * 8000 * 12 * 0.65), 200000),
      risk_label: "SEVERE",
      msp_per_kg: 12,
    } : null,
    demo: true,
  };

  // Weather display values — from live API or fallback
  const W = weatherData || {
    location: gpsStatus === "detecting" ? "Detecting location..." : "Ludhiana, Punjab",
    temperature: "--", humidity: "--", rain_prob: "--", wind_kph: "--",
    risk_score: 0, risk_label: "...",
    warnings: [], forecast: [], live: false,
  };

  // Economics shorthand
  const econ = R.economics;
  const lossAmt    = econ?.projected_loss  || 0;
  const treatCost  = econ?.treatment_cost  || 0;
  const netSaving  = econ?.net_saving      || 0;
  const riskLabel  = econ?.risk_label      || "MODERATE";
  const riskColor  = riskLabel==="SEVERE"?T.red:riskLabel==="HIGH"?T.yel:T.green;

  // All scores for confidence bars
  const CONF_BARS = Object.entries(R.all_scores||{}).map(([name,val])=>({
    name, val,
    color: name==="Late Blight"?T.red:name==="Early Blight"?"#f97316":name==="Leaf Spot"?T.blu:T.green
  }));

  // Tour logic
  const advanceTour=()=>{
    const step=TOUR_STEPS[tourStep];
    if(step.action==="login"){setTourActive(false);setTourStep(s=>s+1);return;}
    if(step.action==="home"){setPage("main");setScreen("home");setTourStep(s=>s+1);return;}
    if(step.action==="upload"){setTourActive(false);setScreen("home");handleUpload();setTourStep(s=>s+1);return;}
    if(step.action==="results"){if(!farmData)setFarmData({crop:"Tomato",land:3.5});setScreen("results");setTourStep(s=>s+1);setTourActive(true);return;}
    if(step.action==="schemes"){setScreen("schemes");setTourStep(s=>s+1);return;}
    setTourActive(false);setTourDone(true);
  };
  useEffect(()=>{if(tourStep===3&&screen==="results"&&farmData)setTourActive(true);},[screen,farmData]);

  if(page==="login") return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:T.bg,height:"100vh",maxWidth:430,margin:"0 auto",position:"relative",boxShadow:"0 0 60px rgba(0,0,0,0.15)",overflowY:"auto",overflowX:"hidden"}}>
      <LoginPage onLogin={()=>setPage("main")}/>
      {tourActive&&tourStep<=1&&<TourBubble step={TOUR_STEPS[tourStep]} onNext={advanceTour} onSkip={()=>{setTourActive(false);setTourDone(true);setPage("main");}}/>}
      <style>{CSS}</style>
    </div>
  );

  return(
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:T.bg,height:"100vh",maxWidth:430,margin:"0 auto",position:"relative",boxShadow:"0 0 60px rgba(0,0,0,0.15)",overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column"}}>

      {/* TOP NAV */}
      <div style={{background:T.nav,borderBottom:`1px solid ${T.border}`,padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 10px rgba(0,0,0,0.05)",flexShrink:0}}>
        <button onClick={()=>setShowProf(p=>!p)} style={{background:`linear-gradient(135deg,${T.deep},${T.green})`,border:"none",borderRadius:"50%",width:40,height:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(22,163,74,0.35)"}}>
          <G n="user" s={18} c="#fff" w={2}/>
        </button>
        <div style={{textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <KVLogo size={28}/>
            <span style={{fontWeight:800,fontSize:"1.05rem",color:T.deep,letterSpacing:"-0.4px"}}>KrishiVigil<span style={{color:T.green}}>.ai</span></span>
          </div>
          <div style={{fontSize:"0.53rem",color:T.muted,letterSpacing:"1px",marginTop:1}}>SMART CROP PROTECTION</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>cs("Alert Notifications")} style={{background:T.border2,border:`1px solid ${T.border}`,borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <G n="bell" s={16} c={T.green} w={2}/>
            <span style={{position:"absolute",top:6,right:6,background:T.red,borderRadius:"50%",width:7,height:7,border:"1.5px solid #fff",boxShadow:pulse?"0 0 0 3px rgba(220,38,38,0.2)":"none",transition:"box-shadow 0.4s"}}/>
          </button>
          <button onClick={()=>setShowLang(true)} style={{background:T.border2,border:`1.5px solid ${T.green}`,borderRadius:22,padding:"5px 11px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}}>
            <G n="globe" s={13} c={T.deep} w={2}/>
            <span style={{fontWeight:700,fontSize:"0.7rem",color:T.deep}}>हि/ਪੰ</span>
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",position:"relative"}}>

        {/* PROFILE POPUP */}
        {showProf&&(
          <div style={{position:"absolute",top:6,left:14,background:T.card,borderRadius:18,padding:18,boxShadow:shM,zIndex:100,width:236,border:`1px solid ${T.border}`,animation:"fadeSlideIn 0.18s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${T.border2}`}}>
              <div style={{background:`linear-gradient(135deg,${T.deep},${T.green})`,borderRadius:"50%",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center"}}><G n="user" s={20} c="#fff" w={1.8}/></div>
              <div>
                <div style={{fontWeight:700,fontSize:"0.88rem",color:T.text}}>Krishna Singh</div>
                <div style={{fontSize:"0.66rem",color:T.muted,display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                  <G n="gps" s={10} c={T.muted} w={2}/>
                  {gpsStatus==="live"?`GPS Live (${userLat.toFixed(2)}, ${userLon.toFixed(2)})`:W.location}
                </div>
              </div>
            </div>
            {[["map","Location",W.location],["drop","Weather",W.temperature!=="--"?`${W.temperature}°C, ${W.humidity}% humidity`:"Loading..."],["scan","Total Scans","12 crops scanned"]].map(([icon,label,val])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid #f1fdf4`,fontSize:"0.74rem"}}>
                <span style={{color:T.muted,display:"flex",alignItems:"center",gap:6}}><G n={icon} s={12} c={T.muted} w={2}/>{label}</span>
                <span style={{fontWeight:600,color:T.text,fontSize:"0.68rem",textAlign:"right",maxWidth:120}}>{val}</span>
              </div>
            ))}
            <div style={{marginTop:10,fontSize:"0.66rem",color:T.muted,background:T.border2,borderRadius:9,padding:"8px 10px",lineHeight:1.5}}>
              {gpsStatus==="live"?"GPS active — weather is live from your exact field location":"GPS not available — using default location"}
            </div>
            <button onClick={()=>setShowProf(false)} style={{marginTop:8,width:"100%",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"0.68rem",fontFamily:"inherit"}}>Close</button>
          </div>
        )}

        {/* ════ HOME ════ */}
        {screen==="home"&&(
          <>
            {/* ── WEATHER STRIP — all values from live weather API ── */}
            <div style={{background:`linear-gradient(160deg,#052e16 0%,#14532d 55%,#166534 100%)`,padding:"18px 18px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <G n="gps" s={13} c={gpsStatus==="live"?"#86efac":"#fcd34d"} w={2}/>
                    <span style={{color:"#fff",fontWeight:700,fontSize:"0.9rem"}}>
                      {W.location}
                    </span>
                  </div>
                  <div style={{color:"#86efac",fontSize:"0.63rem",marginLeft:19}}>
                    {gpsStatus==="detecting"?"Detecting GPS...":gpsStatus==="live"?"GPS Live · "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"Location detected · Updated now"}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:3}}>
                    {/* Temperature from live weather API */}
                    <span style={{color:"#fff",fontSize:"2.5rem",fontWeight:900,lineHeight:1}}>
                      {W.temperature!=="--"?Math.round(W.temperature):"--"}
                    </span>
                    <span style={{color:"#86efac",fontSize:"1rem",marginTop:5}}>°C</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginTop:2}}>
                    <G n="drop" s={11} c="#86efac" w={2}/>
                    {/* Humidity from live weather API */}
                    <span style={{color:"#86efac",fontSize:"0.63rem"}}>{W.humidity}% humidity</span>
                  </div>
                </div>
              </div>

              {/* 5-day forecast — from live weather API */}
              <div style={{display:"flex",gap:7,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
                {(W.forecast.length > 0 ? W.forecast : [{day:"Today",type:"cloud",hi:"--",lo:"--",rain:"--"}]).map((f,i)=>(
                  <div key={i} style={{background:i===0?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.07)",borderRadius:13,padding:"9px 11px",textAlign:"center",minWidth:62,flexShrink:0,border:i===0?"1px solid rgba(255,255,255,0.28)":"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{color:i===0?"#86efac":"rgba(255,255,255,0.6)",fontSize:"0.6rem",fontWeight:600,marginBottom:5}}>{f.day}</div>
                    <WeatherIcon type={f.type||"cloud"} s={22}/>
                    <div style={{color:"#fff",fontSize:"0.8rem",fontWeight:700,marginTop:4}}>{f.hi}°</div>
                    <div style={{color:f.type==="rain"?"#93c5fd":f.type==="sun"?"#fcd34d":"rgba(255,255,255,0.5)",fontSize:"0.59rem",marginTop:1}}>{f.rain}</div>
                  </div>
                ))}
              </div>

              {/* Field warnings — from live weather API, NOT hardcoded */}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {(W.warnings.length > 0 ? W.warnings : [{type:"ok",level:"low",text:"Fetching weather warnings..."}]).map((w,i)=>(
                  <div key={i} style={{background:"rgba(0,0,0,0.28)",borderRadius:10,padding:"8px 12px",display:"flex",gap:10,alignItems:"center",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{background:w.level==="medium"?"rgba(217,119,6,0.22)":w.level==="low"?"rgba(34,197,94,0.18)":"rgba(239,68,68,0.18)",borderRadius:7,padding:5,flexShrink:0}}>
                      <G n={w.type==="wind"?"wind":w.type==="humidity"?"drop":w.type==="ok"?"check":"alert"} s={13} c={w.level==="medium"?"#fcd34d":w.level==="low"?"#86efac":"#fca5a5"} w={2}/>
                    </div>
                    <span style={{color:"#f1f5f9",fontSize:"0.69rem",fontWeight:500,lineHeight:1.4}}>{w.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{padding:"18px 16px 16px"}}>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <G n="scan" s={16} c={T.deep} w={2}/>
                  <span style={{fontWeight:700,fontSize:"0.95rem",color:T.deep}}>Scan Your Crop</span>
                </div>
                <p style={{fontSize:"0.72rem",color:T.muted,margin:0}}>Upload any crop image — AI detects disease in under 3 seconds</p>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelected} style={{display:"none"}}/>

              <div
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);const file=e.dataTransfer.files[0];if(file){setSelectedFile(file);const reader=new FileReader();reader.onload=(ev)=>setSelectedImage(ev.target.result);reader.readAsDataURL(file);}}}
                style={{border:`2px dashed ${drag?T.green:selectedImage?"#16a34a":"#86efac"}`,borderRadius:20,padding:"20px",textAlign:"center",background:drag?"#f0fdf4":selectedImage?"#f0fdf4":T.card,transition:"all 0.2s",marginBottom:18,boxShadow:sh}}>
                {analyzing?(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"10px 0"}}>
                    <div style={{width:52,height:52,border:`4px solid ${T.border}`,borderTopColor:T.green,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                    <div style={{fontWeight:700,color:T.deep,fontSize:"0.9rem"}}>Analyzing with AI...</div>
                    <div style={{fontSize:"0.7rem",color:T.muted}}>EfficientNetB3 running inference</div>
                    <div style={{display:"flex",gap:6,marginTop:4}}>
                      {["Preprocessing","Running AI","Weather check","Calculating loss"].map((s,i)=>(
                        <div key={s} style={{background:"#f0fdf4",border:`1px solid ${T.border}`,borderRadius:20,padding:"3px 8px",fontSize:"0.59rem",color:T.green,fontWeight:600,animation:`fadeIn 0.4s ${i*0.35}s both`}}>{s}</div>
                      ))}
                    </div>
                  </div>
                ):selectedImage?(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
                    <div style={{position:"relative",display:"inline-block"}}>
                      <img src={selectedImage} alt="Selected crop" style={{width:"100%",maxWidth:260,height:170,objectFit:"cover",borderRadius:14,border:`2px solid ${T.border}`,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}/>
                      <button onClick={handleRemoveImage} style={{position:"absolute",top:-10,right:-10,background:T.red,border:"2.5px solid #fff",borderRadius:"50%",width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
                        <G n="close" s={13} c="#fff" w={2.5}/>
                      </button>
                    </div>
                    <div style={{fontSize:"0.72rem",color:T.green,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                      <G n="check" s={13} c={T.green} w={2.5}/> Image ready — tap Analyze Now
                    </div>
                    <div style={{display:"flex",gap:10,width:"100%"}}>
                      <button onClick={handleUpload} style={{flex:1,background:"#f0fdf4",border:`1.5px solid ${T.border}`,color:T.deep,borderRadius:12,padding:"10px",fontWeight:600,fontSize:"0.78rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <G n="camera" s={14} c={T.deep} w={2}/> Change
                      </button>
                      <button onClick={handleAnalyze} style={{flex:2,background:`linear-gradient(135deg,${T.deep},${T.green})`,border:"none",color:"#fff",borderRadius:12,padding:"10px",fontWeight:700,fontSize:"0.88rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 14px rgba(22,163,74,0.38)"}}>
                        <G n="zap" s={15} c="#fff" w={2}/> Analyze Now
                      </button>
                    </div>
                  </div>
                ):(
                  <div onClick={handleUpload} style={{cursor:"pointer"}}>
                    <div style={{display:"inline-flex",background:`linear-gradient(135deg,${T.deep},${T.green})`,borderRadius:"50%",padding:16,marginBottom:12,boxShadow:"0 4px 16px rgba(22,163,74,0.35)"}}>
                      <G n="camera" s={28} c="#fff" w={1.8}/>
                    </div>
                    <div style={{fontWeight:700,color:T.deep,fontSize:"0.95rem",marginBottom:4}}>Tap to upload crop image</div>
                    <div style={{fontSize:"0.7rem",color:T.muted,marginBottom:16}}>Drag & drop · JPG, PNG, WebP · Max 16MB</div>
                    <PrimaryBtn style={{pointerEvents:"none"}}><G n="zap" s={15} c="#fff" w={2}/> Analyze Now</PrimaryBtn>
                  </div>
                )}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
                <div style={{background:T.redBg,borderRadius:14,padding:"14px 10px",textAlign:"center",border:`1px solid ${T.redBo}`}}>
                  <div style={{display:"inline-flex",background:"rgba(220,38,38,0.08)",borderRadius:10,padding:8,marginBottom:6}}><G n="micro" s={16} c={T.red} w={2}/></div>
                  <div style={{fontWeight:800,color:T.red,fontSize:"0.72rem",lineHeight:1.25}}>AI-Powered</div>
                  <div style={{fontSize:"0.58rem",color:T.muted,marginTop:3,lineHeight:1.3}}>99.6% accuracy</div>
                </div>
                <div style={{background:T.bluBg,borderRadius:14,padding:"14px 10px",textAlign:"center",border:`1px solid ${T.bluBo}`}}>
                  <div style={{display:"inline-flex",background:"rgba(37,99,235,0.08)",borderRadius:10,padding:8,marginBottom:6}}><G n="shield" s={16} c={T.blu} w={2}/></div>
                  <div style={{fontWeight:800,color:T.blu,fontSize:"0.72rem",lineHeight:1.25}}>Govt Schemes</div>
                  <div style={{fontSize:"0.58rem",color:T.muted,marginTop:3,lineHeight:1.3}}>Auto-matched</div>
                </div>
                <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 10px",textAlign:"center",border:`1px solid ${T.border}`}}>
                  <div style={{display:"inline-flex",background:"rgba(22,163,74,0.08)",borderRadius:10,padding:8,marginBottom:6}}><G n="zap" s={16} c={T.green} w={2}/></div>
                  <div style={{fontWeight:800,color:T.green,fontSize:"1.1rem",lineHeight:1}}>&lt;3s</div>
                  <div style={{fontSize:"0.58rem",color:T.muted,marginTop:3,lineHeight:1.3}}>Scan Time</div>
                </div>
              </div>

              <Card>
                <SLabel icon="info" color={T.deep}>How It Works</SLabel>
                {STEPS.map((s,i)=>(
                  <div key={s.title} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i===STEPS.length-1?0:12}}>
                    <ITile icon={s.icon} size="sm"/>
                    <div style={{paddingTop:2}}>
                      <div style={{fontWeight:600,fontSize:"0.78rem",color:T.text}}>{s.title}</div>
                      <div style={{fontSize:"0.67rem",color:T.muted,marginTop:1}}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ════ RESULTS ════ */}
        {screen==="results"&&(
          <div style={{padding:"14px 15px 16px",animation:"fadeSlideUp 0.3s ease"}}>
            <button onClick={()=>go("home")} style={{background:"none",border:"none",color:T.green,fontWeight:600,cursor:"pointer",marginBottom:14,fontSize:"0.82rem",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}}>
              <G n="back" s={15} c={T.green} w={2}/> Back to Home
            </button>

            {/* Scanned image preview */}
            {selectedImage&&(
              <div style={{background:T.card,borderRadius:16,padding:14,marginBottom:14,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12,boxShadow:sh}}>
                <img src={selectedImage} alt="Uploaded crop" style={{width:68,height:68,objectFit:"cover",borderRadius:12,border:`2px solid ${T.border}`,flexShrink:0}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.78rem",color:T.deep,marginBottom:3}}>Scanned Image</div>
                  <div style={{fontSize:"0.68rem",color:T.muted,lineHeight:1.5}}>EfficientNetB3 PlantVillage model · 38 classes</div>
                  <div style={{marginTop:5}}>
                    <div style={{background:"#dcfce7",borderRadius:6,padding:"2px 8px",fontSize:"0.62rem",color:T.green,fontWeight:700,display:"inline-block"}}>
                      {R.demo?"Demo Mode — deploy Flask backend for live AI":"Real AI Result"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Farm data strip */}
            {farmData&&(
              <div style={{background:`linear-gradient(135deg,#f0fdf4,#dcfce7)`,border:`1px solid ${T.border}`,borderRadius:14,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <G n="leaf" s={14} c={T.green} w={2.5}/>
                <span style={{fontSize:"0.74rem",color:T.deep,fontWeight:600}}>{farmData.crop} · {farmData.land} acres · Rs {(getMSP(farmData.crop)/100).toFixed(2)}/kg MSP</span>
                <span style={{marginLeft:"auto",fontSize:"0.65rem",color:T.muted,cursor:"pointer"}} onClick={()=>setShowCropPopup(true)}>Edit</span>
              </div>
            )}

            {/* ── HEALTH SCORE — calculated from AI confidence + weather + yield loss ── */}
            <div style={{background:`linear-gradient(160deg,#052e16,#14532d,#166534)`,borderRadius:20,padding:20,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 24px rgba(21,128,61,0.28)"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <G n="activity" s={12} c="#86efac" w={2}/>
                  <span style={{color:"#86efac",fontSize:"0.64rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.9px"}}>Crop Health Score</span>
                </div>
                {/* health_score value comes from AI model + weather API calculation */}
                <div style={{color:"#fff",fontSize:"2.8rem",fontWeight:900,lineHeight:1}}>{R.health_score}<span style={{fontSize:"1.1rem",fontWeight:400,color:"#86efac"}}>/10</span></div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                  <div style={{background:"rgba(239,68,68,0.2)",borderRadius:7,padding:4}}><G n="alert" s={12} c="#fca5a5" w={2}/></div>
                  <span style={{color:"#fca5a5",fontWeight:700,fontSize:"0.77rem"}}>
                    {R.health_score<=3?"Critical — Immediate action needed":R.health_score<=6?"Moderate — Treatment recommended":"Good — Preventive care only"}
                  </span>
                </div>
              </div>
              <div style={{position:"relative",width:78,height:78}}>
                <svg viewBox="0 0 80 80" style={{transform:"rotate(-90deg)",width:78,height:78,position:"absolute",top:0,left:0}}>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9"/>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#fca5a5" strokeWidth="9" strokeDasharray={`${(R.health_score/10)*188.5} 188.5`} strokeLinecap="round"/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:"1.2rem"}}>{R.health_score}</div>
              </div>
            </div>

            {/* ── URGENCY TIMELINE — from AI confidence + weather ── */}
            {R.urgency && R.urgency.hours !== null && (
              <div style={{background:T.redBg,border:`1px solid ${T.redBo}`,borderRadius:16,padding:16,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <div style={{background:"rgba(220,38,38,0.1)",borderRadius:8,padding:5}}><G n="clock" s={14} c={T.red} w={2}/></div>
                  <span style={{fontWeight:700,color:T.red,fontSize:"0.82rem"}}>Urgency Timeline</span>
                </div>
                {/* label and hours come from AI confidence calculation in predictor.py */}
                <div style={{fontWeight:800,fontSize:"1.1rem",color:"#991b1b",marginBottom:5}}>{R.urgency.label}</div>
                <div style={{fontSize:"0.69rem",color:"#7f1d1d",lineHeight:1.6,marginBottom:12}}>{R.urgency.description}</div>
                <div style={{display:"flex",gap:5}}>
                  {[["Now","#dc2626","Act now"],["24h","#f97316","Urgent"],["48h","#eab308","Caution"],["72h+","#9ca3af","Monitor"]].map(([l,c,sub])=>(
                    <div key={l} style={{flex:1,background:c,borderRadius:9,padding:"7px 4px",textAlign:"center"}}>
                      <div style={{color:"#fff",fontSize:"0.69rem",fontWeight:800}}>{l}</div>
                      <div style={{color:"rgba(255,255,255,0.72)",fontSize:"0.54rem",marginTop:1}}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DISEASE DETECTION CARD — all values from AI model ── */}
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <SLabel icon="activity" color={T.deep}>Disease Detection</SLabel>
                {/* severity from AI model */}
                <Badge bg={R.severity==="High"?T.redBg:R.severity==="Medium"?T.yelBg:T.bluBg}
                       color={R.severity==="High"?T.red:R.severity==="Medium"?T.yel:T.blu}
                       border={R.severity==="High"?T.redBo:R.severity==="Medium"?T.yelBo:T.bluBo}>
                  {R.severity.toUpperCase()} SEVERITY
                </Badge>
              </div>
              {/* disease name from AI model */}
              <div style={{fontWeight:800,fontSize:"1.3rem",color:T.deep,marginBottom:6}}>{R.disease}</div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                {/* confidence from AI model */}
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:"0.71rem",color:T.muted}}><G n="check" s={12} c={T.green} w={2.5}/> Confidence: <strong style={{color:T.green}}>{R.confidence}%</strong></span>
                {/* yield_loss from AI model */}
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:"0.71rem",color:T.muted}}><G n="trending" s={12} c={T.red} w={2}/> Yield Loss: <strong style={{color:T.red}}>{R.yield_loss}</strong></span>
              </div>
              {/* all_scores aggregated from AI model's 38-class output */}
              {CONF_BARS.map(b=>(
                <div key={b.name} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.69rem",marginBottom:3}}>
                    <span style={{color:T.muted}}>{b.name}</span>
                    <span style={{fontWeight:700,color:b.color}}>{b.val}%</span>
                  </div>
                  <div style={{background:"#f1f5f9",borderRadius:6,height:7,overflow:"hidden"}}>
                    <div style={{width:`${b.val}%`,background:`linear-gradient(90deg,${b.color}88,${b.color})`,height:"100%",borderRadius:6,transition:"width 0.9s ease"}}/>
                  </div>
                </div>
              ))}

              {/* ── ACTION CHECKLIST — per disease + crop from predictor.py ── */}
              <div style={{marginTop:16}}>
                <SLabel icon="check" color={T.deep}>Smart Action Plan</SLabel>
                {/* checklist comes from ADVICE_DB in predictor.py, specific to detected disease + user's crop */}
                {(R.checklist||[]).map((c,ci)=>{
                  const ts = tierStyle(c.color);
                  return(
                    <div key={ci} style={{background:ts.bg,borderRadius:12,padding:"11px 13px",marginBottom:8,borderLeft:`3px solid ${ts.c}`,border:`1px solid ${ts.bo}`,borderLeftWidth:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                        <G n={c.color==="red"?"zap":c.color==="yellow"?"clock":c.color==="blue"?"shield":"leaf"} s={12} c={ts.c} w={2.5}/>
                        <span style={{fontWeight:700,fontSize:"0.7rem",color:ts.c}}>{c.tier}</span>
                      </div>
                      {(c.items||[]).map((item,ii)=>(
                        <div key={ii} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4}}>
                          <G n="check" s={12} c={ts.c} w={2.5}/>
                          <span style={{fontSize:"0.69rem",color:T.text,lineHeight:1.4}}>{item}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* ── FUNGICIDE RECOMMENDATIONS — per disease + crop ── */}
              <div style={{marginTop:14}}>
                <SLabel icon="info" color={T.deep}>Recommended Fungicides</SLabel>
                {/* fungicides from ADVICE_DB in predictor.py, specific to detected disease + crop */}
                {(R.fungicides||[]).map((f,fi)=>{
                  const fc = fungicideColor(f.type);
                  return(
                    <div key={fi} style={{background:fc.bg,borderRadius:12,padding:"11px 13px",marginBottom:8,border:`1px solid ${fc.bo}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{background:`${fc.c}15`,borderRadius:9,padding:7}}><G n="activity" s={14} c={fc.c} w={2}/></div>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontWeight:700,fontSize:"0.79rem",color:T.text}}>{f.name}</span>
                            <span style={{background:`${fc.c}18`,color:fc.c,borderRadius:8,padding:"1px 7px",fontSize:"0.59rem",fontWeight:600}}>{f.type}</span>
                          </div>
                          <div style={{fontSize:"0.63rem",color:T.muted,marginTop:2}}>Dose: {f.dose} · {f.timing}</div>
                        </div>
                      </div>
                      <div style={{fontSize:"0.59rem",color:T.muted,textAlign:"right"}}>Agri<br/>shops</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ── WEATHER RISK CARD — all from live weather API ── */}
            <Card>
              <SLabel icon="drop" color={T.deep}>Weather Risk Intelligence</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
                {[
                  {icon:"thermo",label:"Temperature",val:`${W.temperature}°C`,bg:T.redBg,c:T.red,bo:T.redBo},
                  {icon:"drop",  label:"Humidity",   val:`${W.humidity}%`,   bg:T.bluBg,c:T.blu,bo:T.bluBo},
                  {icon:"drop",  label:"Rain Prob.", val:`${W.rain_prob}%`,  bg:T.redBg,c:T.red,bo:T.redBo},
                  {icon:"wind",  label:"Wind Speed", val:`${W.wind_kph} km/h`,bg:T.yelBg,c:T.yel,bo:T.yelBo},
                ].map(m=>(
                  <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"11px 13px",border:`1px solid ${m.bo}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:"0.63rem",color:m.c}}><G n={m.icon} s={12} c={m.c} w={2}/>{m.label}</div>
                    {/* All weather values from live OpenWeatherMap API */}
                    <div style={{fontWeight:800,fontSize:"1.05rem",color:T.text}}>{m.val}</div>
                  </div>
                ))}
              </div>
              {/* Risk score from weather API + disease algorithm */}
              <div style={{background:"linear-gradient(135deg,#fff5f5,#fff8f8)",borderRadius:13,padding:"13px 15px",display:"flex",alignItems:"center",gap:13,border:`1px solid ${T.redBo}`,marginBottom:14}}>
                <div>
                  <div style={{fontWeight:900,fontSize:"2.4rem",color:T.red,lineHeight:1}}>{W.risk_score}</div>
                  <div style={{fontSize:"0.59rem",color:T.muted}}>out of 100</div>
                </div>
                <div>
                  <div style={{fontWeight:700,color:T.red,fontSize:"0.81rem"}}>{W.risk_label} Risk Score</div>
                  <div style={{fontSize:"0.67rem",color:"#7f1d1d",marginTop:3,lineHeight:1.4}}>
                    {W.location} · {W.live?"Live data from OpenWeatherMap":"Offline fallback data"}
                  </div>
                </div>
              </div>

              <SLabel icon="alert" color={T.yel}>Field Operation Warnings</SLabel>
              {/* Warnings generated from REAL weather values, not hardcoded */}
              {(W.warnings.length>0?W.warnings:[{type:"ok",level:"low",text:"No weather warnings at this time"}]).map((w,i)=>{
                const wc = w.level==="critical"||w.level==="high"?{c:T.red,bg:T.redBg,bo:T.redBo}:w.level==="medium"?{c:T.yel,bg:T.yelBg,bo:T.yelBo}:{c:T.green,bg:"#f0fdf4",bo:T.border};
                return(
                  <div key={i} style={{background:wc.bg,borderRadius:10,padding:"9px 12px",display:"flex",gap:10,alignItems:"center",marginBottom:7,border:`1px solid ${wc.bo}`}}>
                    <div style={{background:`${wc.c}14`,borderRadius:8,padding:5,flexShrink:0}}><G n="alert" s={12} c={wc.c} w={2}/></div>
                    <span style={{fontSize:"0.69rem",color:T.text,lineHeight:1.4}}>{w.text}</span>
                  </div>
                );
              })}
            </Card>

            {/* ── ECONOMIC LOSS CARD — from AI confidence × yield_loss × weather ── */}
            {econ && (
              <Card>
                <SLabel icon="rupee" color={T.deep}>Economic Loss Estimate</SLabel>
                <div style={{background:"linear-gradient(135deg,#fff5f5,#fff8f8)",borderRadius:14,padding:"18px 16px",textAlign:"center",marginBottom:14,border:`1px solid ${T.redBo}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:4,fontSize:"0.69rem",color:T.muted}}><G n="trending" s={14} c={T.red} w={2}/> Projected Crop Loss</div>
                  {/* Loss = AI confidence × yield_loss_pct × (1 + weather_risk/100) */}
                  <div style={{fontWeight:900,fontSize:"2.4rem",color:T.red,lineHeight:1.1}}>Rs {lossAmt.toLocaleString("en-IN")}</div>
                  <div style={{fontSize:"0.66rem",color:"#7f1d1d",marginTop:5}}>
                    {farmData?.crop} · {farmData?.land} acres · Rs {econ.msp_per_kg}/kg MSP · {econ.effective_loss_pct}% effective loss
                  </div>
                  <div style={{marginTop:10}}><Badge bg={riskColor} color="#fff" border={riskColor}>{riskLabel} FINANCIAL RISK</Badge></div>
                </div>
                {[
                  {icon:"zap",   label:"Treatment Cost",      val:`~Rs ${treatCost.toLocaleString("en-IN")}`, c:T.green},
                  {icon:"check", label:"Net Saving if Treated",val:`Rs ${netSaving.toLocaleString("en-IN")}`,  c:T.green},
                  {icon:"shield",label:"Max Insurance Cover",  val:`Rs ${econ.insurance_cover.toLocaleString("en-IN")}`,c:T.blu},
                ].map(r=>(
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid #f0fdf4`}}>
                    <span style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.75rem",color:T.muted}}><G n={r.icon} s={13} c={r.c} w={2}/>{r.label}</span>
                    <span style={{fontWeight:700,fontSize:"0.81rem",color:r.c}}>{r.val}</span>
                  </div>
                ))}
              </Card>
            )}

            {/* GOVERNMENT SCHEMES */}
            <Card>
              <SLabel icon="shield" color={T.deep}>Government Schemes You Qualify For</SLabel>
              {SCHEMES.map(s=>(
                <div key={s.name} style={{background:"#f8fffe",borderRadius:13,padding:"12px 13px",marginBottom:10,border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><ITile icon={s.icon} size="sm"/><span style={{fontWeight:700,fontSize:"0.77rem",color:T.deep}}>{s.name}</span></div>
                    <Badge bg="#dcfce7" color={T.green} border={T.border}>ELIGIBLE</Badge>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:"0.69rem",color:T.textLight,marginBottom:3}}><G n="check" s={11} c={T.green} w={2.5}/>{s.elig}</div>
                  <div style={{fontSize:"0.69rem",color:T.textLight,marginBottom:s.flag?8:6}}>Rs <strong>{s.comp}</strong></div>
                  {s.flag&&econ&&lossAmt>0&&(
                    <div style={{background:T.redBg,border:`1px solid ${T.redBo}`,borderRadius:9,padding:"7px 10px",fontSize:"0.65rem",color:T.red,marginBottom:7,display:"flex",gap:6,lineHeight:1.5}}>
                      <G n="alert" s={12} c={T.red} w={2}/>
                      Your estimated loss (Rs {lossAmt.toLocaleString("en-IN")}) exceeds threshold — apply immediately
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.64rem",color:T.blu}}><G n="globe" s={11} c={T.blu} w={2}/>{s.link}</span>
                    <button onClick={()=>cs("Scheme Application Portal")} style={{background:`linear-gradient(135deg,${T.deep},${T.green})`,color:"#fff",border:"none",borderRadius:9,padding:"6px 13px",fontSize:"0.67rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 8px rgba(22,163,74,0.22)"}}>
                      <G n="zap" s={11} c="#fff" w={2}/> Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ════ SCHEMES ════ */}
        {screen==="schemes"&&(
          <div style={{padding:"16px 15px 16px",animation:"fadeSlideUp 0.3s ease"}}>
            <button onClick={()=>go("home")} style={{background:"none",border:"none",color:T.green,fontWeight:600,cursor:"pointer",marginBottom:14,fontSize:"0.82rem",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}}><G n="back" s={15} c={T.green} w={2}/> Back</button>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <ITile icon="shield" size="lg"/>
              <div><div style={{fontWeight:800,fontSize:"1.05rem",color:T.deep}}>Government Schemes</div><div style={{fontSize:"0.67rem",color:T.muted}}>Central · Punjab · Haryana · Bihar</div></div>
            </div>
            <div style={{display:"flex",gap:7,marginTop:14,marginBottom:16,flexWrap:"wrap"}}>
              {["All","Punjab","Haryana","Bihar","Central"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?T.green:"#f0fdf4",color:filter===f?"#fff":T.green,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 14px",fontSize:"0.7rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
              ))}
            </div>
            {filtered.map(s=>(
              <div key={s.name} style={{background:T.card,borderRadius:16,padding:16,marginBottom:12,border:`1px solid ${T.border}`,boxShadow:sh}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><ITile icon={s.icon} size="md"/><div><div style={{fontWeight:700,fontSize:"0.83rem",color:T.deep}}>{s.name}</div><Badge bg="#dcfce7" color={T.green} border={T.border}>ELIGIBLE</Badge></div></div>
                </div>
                <div style={{fontSize:"0.71rem",color:T.textLight,marginBottom:4,display:"flex",alignItems:"center",gap:6}}><G n="check" s={12} c={T.green} w={2.5}/>{s.elig}</div>
                <div style={{fontSize:"0.71rem",color:T.textLight,marginBottom:10}}>Benefit: <strong style={{color:T.deep}}>{s.comp}</strong></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.66rem",color:T.blu}}><G n="globe" s={11} c={T.blu} w={2}/>{s.link}</span>
                  <button onClick={()=>cs("Scheme Application Portal")} style={{background:`linear-gradient(135deg,${T.deep},${T.green})`,color:"#fff",border:"none",borderRadius:10,padding:"8px 15px",fontSize:"0.71rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
                    <G n="zap" s={12} c="#fff" w={2}/> Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Crop popup */}
        {showCropPopup&&<CropPopup onSubmit={handleCropSubmit}/>}

        {/* Coming soon modal */}
        {csLabel&&(
          <div style={{position:"absolute",inset:0,background:"rgba(5,46,22,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={()=>setCSLabel(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,borderRadius:22,padding:28,textAlign:"center",maxWidth:300,width:"100%",boxShadow:shM,animation:"popIn 0.2s ease"}}>
              <div style={{display:"inline-flex",background:"#f0fdf4",borderRadius:"50%",padding:18,marginBottom:14}}><G n="star" s={28} c={T.green} w={2}/></div>
              <div style={{fontWeight:800,fontSize:"1.1rem",color:T.text,marginBottom:6}}>Coming Soon!</div>
              <div style={{fontSize:"0.78rem",color:T.text,fontWeight:600,marginBottom:6}}>{csLabel}</div>
              <div style={{fontSize:"0.7rem",color:T.muted,marginBottom:22,lineHeight:1.6}}>This feature is under development and will be available in the next version of KrishiVigil.ai</div>
              <PrimaryBtn onClick={()=>setCSLabel(null)} style={{padding:"12px 36px",fontSize:"0.9rem"}}>Got it</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Language modal */}
        {showLang&&(
          <div style={{position:"absolute",inset:0,background:"rgba(5,46,22,0.5)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowLang(false)}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,width:"100%",borderRadius:"22px 22px 0 0",padding:"22px 20px 30px",animation:"slideUp 0.22s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}><ITile icon="globe" size="md"/><div><div style={{fontWeight:700,fontSize:"1rem",color:T.text}}>Select Language</div><div style={{fontSize:"0.67rem",color:T.muted}}>Regional support coming soon</div></div></div>
              <div style={{height:1,background:T.border2,margin:"14px 0"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {LANGS.map(l=>(
                  <button key={l.s} onClick={()=>{setShowLang(false);cs(`${l.s} Language Support`);}} style={{background:"#f0fdf4",border:`1px solid ${T.border}`,borderRadius:13,padding:"12px 13px",cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                    <div style={{fontWeight:700,fontSize:"0.95rem",color:T.deep}}>{l.s}</div>
                    <div style={{fontSize:"0.61rem",color:T.muted,marginTop:2}}>{l.sub}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowLang(false)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:13,padding:"12px",cursor:"pointer",fontWeight:600,fontSize:"0.85rem",fontFamily:"inherit",color:T.text}}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky download button */}
      {(screen==="results"||screen==="schemes")&&(
        <div style={{padding:"0 14px 6px",background:T.bg,borderTop:`1px solid ${T.border2}`,flexShrink:0}}>
          <button onClick={()=>cs("Download Full Report as PDF")} style={{width:"100%",background:`linear-gradient(135deg,${T.deep},${T.green})`,color:"#fff",border:"none",borderRadius:16,padding:"13px",fontWeight:700,fontSize:"0.87rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:9,boxShadow:"0 4px 24px rgba(22,163,74,0.4)",marginTop:6}}>
            <G n="download" s={16} c="#fff" w={2}/> Download Full Report
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <div style={{background:T.nav,borderTop:`1px solid ${T.border}`,display:"flex",flexShrink:0,boxShadow:"0 -2px 16px rgba(0,0,0,0.05)"}}>
        {[["clock","History",()=>cs("Scan History"),false],["shield","Schemes",()=>go("schemes"),screen==="schemes"],["download","Downloads",()=>cs("PDF Downloads"),false]].map(([icon,label,action,active])=>(
          <button key={label} onClick={action} style={{flex:1,padding:"12px 8px 10px",background:active?"#f0fdf4":"none",border:"none",borderTop:active?`2px solid ${T.green}`:"2px solid transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"inherit"}}>
            <G n={icon} s={19} c={active?T.green:T.muted} w={active?2.2:1.8}/>
            <span style={{fontSize:"0.59rem",color:active?T.green:T.muted,fontWeight:active?700:500}}>{label}</span>
          </button>
        ))}
      </div>

      {/* Tour bubble */}
      {tourActive&&!tourDone&&page==="main"&&(
        <TourBubble step={TOUR_STEPS[tourStep]} onNext={advanceTour} onSkip={()=>{setTourActive(false);setTourDone(true);}}/>
      )}

      <style>{CSS}</style>
    </div>
  );
}

/* ════ TOUR BUBBLE ════ */
const TourBubble=({step,onNext,onSkip})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(2px)"}}>
    <div style={{background:"#fff",borderRadius:24,padding:"26px 24px",maxWidth:320,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",animation:"popIn 0.25s ease",border:`2px solid ${T.border}`}}>
      <div style={{display:"flex",gap:5,marginBottom:18,justifyContent:"center"}}>
        {TOUR_STEPS.map((_,i)=>(
          <div key={i} style={{width:i===TOUR_STEPS.indexOf(step)?20:7,height:7,borderRadius:4,background:i===TOUR_STEPS.indexOf(step)?T.green:T.border,transition:"all 0.3s"}}/>
        ))}
      </div>
      <div style={{display:"inline-flex",background:"#f0fdf4",borderRadius:16,padding:14,marginBottom:14}}><KVLogo size={42}/></div>
      <div style={{fontWeight:800,fontSize:"1rem",color:T.deep,marginBottom:8}}>{step.title}</div>
      <div style={{fontSize:"0.77rem",color:T.muted,lineHeight:1.6,marginBottom:20}}>{step.desc}</div>
      <PrimaryBtn onClick={onNext} style={{width:"100%",padding:"13px",fontSize:"0.9rem",marginBottom:10}}>{step.btn}</PrimaryBtn>
      {onSkip&&(<button onClick={onSkip} style={{width:"100%",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",padding:"4px"}}>Skip demo — explore freely</button>)}
    </div>
  </div>
);

const CSS=`
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