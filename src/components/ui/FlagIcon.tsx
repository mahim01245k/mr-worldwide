// src/components/ui/FlagIcon.tsx
import React from "react";

interface FlagIconProps {
  code: string;
  size?: number;
  className?: string;
}

const FLAGS: Record<string, React.ReactNode> = {
  br: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#009c3b"/>
      <path d="M360 72L648 252 360 432 72 252Z" fill="#ffdf00"/>
      <circle cx="360" cy="252" r="90" fill="#002776"/>
      <path d="M270 252Q315 230 360 252Q405 274 450 252" stroke="#fff" strokeWidth="10" fill="none"/>
    </svg>
  ),
  il: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#fff"/>
      <rect y="42" width="720" height="42" fill="#0038b8"/>
      <rect y="420" width="720" height="42" fill="#0038b8"/>
      <polygon points="360,180 330,230 390,230" fill="none" stroke="#0038b8" strokeWidth="12"/>
      <polygon points="360,324 330,274 390,274" fill="none" stroke="#0038b8" strokeWidth="12"/>
    </svg>
  ),
  de: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="168" fill="#000"/>
      <rect y="168" width="720" height="168" fill="#dd0000"/>
      <rect y="336" width="720" height="168" fill="#ffce00"/>
    </svg>
  ),
  it: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="504" fill="#009246"/>
      <rect x="240" width="240" height="504" fill="#fff"/>
      <rect x="480" width="240" height="504" fill="#ce2b37"/>
    </svg>
  ),
  in: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="168" fill="#ff9933"/>
      <rect y="168" width="720" height="168" fill="#fff"/>
      <rect y="336" width="720" height="168" fill="#138808"/>
      <circle cx="360" cy="252" r="50" fill="none" stroke="#000080" strokeWidth="10"/>
      <circle cx="360" cy="252" r="8" fill="#000080"/>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#b22234"/>
      <rect y="38" width="720" height="19" fill="#fff"/>
      <rect y="76" width="720" height="19" fill="#fff"/>
      <rect y="114" width="720" height="19" fill="#fff"/>
      <rect y="152" width="720" height="19" fill="#fff"/>
      <rect y="190" width="720" height="19" fill="#fff"/>
      <rect y="228" width="720" height="19" fill="#fff"/>
      <rect width="288" height="266" fill="#3c3b6e"/>
    </svg>
  ),
  gb: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#012169"/>
      <line x1="0" y1="0" x2="720" y2="504" stroke="#fff" strokeWidth="80"/>
      <line x1="720" y1="0" x2="0" y2="504" stroke="#fff" strokeWidth="80"/>
      <line x1="0" y1="0" x2="720" y2="504" stroke="#c8102e" strokeWidth="40"/>
      <line x1="720" y1="0" x2="0" y2="504" stroke="#c8102e" strokeWidth="40"/>
      <line x1="360" y1="0" x2="360" y2="504" stroke="#fff" strokeWidth="120"/>
      <line x1="0" y1="252" x2="720" y2="252" stroke="#fff" strokeWidth="120"/>
      <line x1="360" y1="0" x2="360" y2="504" stroke="#c8102e" strokeWidth="70"/>
      <line x1="0" y1="252" x2="720" y2="252" stroke="#c8102e" strokeWidth="70"/>
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="504" fill="#002395"/>
      <rect x="240" width="240" height="504" fill="#fff"/>
      <rect x="480" width="240" height="504" fill="#ed2939"/>
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#de2910"/>
      <polygon points="120,84 135,120 170,120 142,142 155,178 120,155 85,178 98,142 70,120 105,120" fill="#ffde00"/>
    </svg>
  ),
  jp: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#fff"/>
      <circle cx="360" cy="252" r="180" fill="#bc002d"/>
    </svg>
  ),
  sa: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="504" fill="#006c35"/>
      <text x="360" y="200" textAnchor="middle" fill="#fff" fontSize="80" fontFamily="serif">☪</text>
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="168" fill="#74acdf"/>
      <rect y="168" width="720" height="168" fill="#fff"/>
      <rect y="336" width="720" height="168" fill="#74acdf"/>
      <circle cx="360" cy="252" r="60" fill="#f6b40e"/>
    </svg>
  ),
  es: (
    <svg viewBox="0 0 720 504" xmlns="http://www.w3.org/2000/svg">
      <rect width="720" height="10" fill="#aa151b"/>
      <rect y="10" width="720" height="20" fill="#f1bf00"/>
      <rect y="30" width="720" height="10" fill="#aa151b"/>
    </svg>
  ),
};

export function FlagIcon({ code, size = 24, className = "" }: FlagIconProps) {
  const flag = FLAGS[code];
  return (
    <div className={className} style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, lineHeight: 0, border: "1.5px solid rgba(255,255,255,0.15)", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
      {flag || <div style={{ width: "100%", height: "100%", background: "#374151" }} />}
    </div>
  );
}