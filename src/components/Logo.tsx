import React from "react";

interface LogoProps {
  className?: string;
  compact?: boolean;
}

/* Icon: 2×2 arches — top row ∩ (dark blue), bottom row ∪ (lilac) */
function Icon({ size = 36, topColor = "#1C2B8C", bottomColor = "#7B7FC4" }: { size?: number; topColor?: string; bottomColor?: string }) {
  const h = size;
  const w = size * 1.1;
  const half = h / 2;
  const col = w / 2;
  const r = col * 0.82;
  const pad = col - r;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Top-left ∩ */}
      <path
        d={`M${pad},${half} L${pad},${half * 0.45} Q${pad},${half * 0.05} ${col * 0.5},${half * 0.05} Q${col - pad},${half * 0.05} ${col - pad},${half * 0.45} L${col - pad},${half}`}
        stroke={topColor} strokeWidth={size * 0.115} fill="none" strokeLinecap="round"
      />
      {/* Top-right ∩ */}
      <path
        d={`M${col + pad},${half} L${col + pad},${half * 0.45} Q${col + pad},${half * 0.05} ${col * 1.5},${half * 0.05} Q${w - pad},${half * 0.05} ${w - pad},${half * 0.45} L${w - pad},${half}`}
        stroke={topColor} strokeWidth={size * 0.115} fill="none" strokeLinecap="round"
      />
      {/* Bottom-left ∪ */}
      <path
        d={`M${pad},${half} L${pad},${half * 1.55} Q${pad},${h - half * 0.05} ${col * 0.5},${h - half * 0.05} Q${col - pad},${h - half * 0.05} ${col - pad},${half * 1.55} L${col - pad},${half}`}
        stroke={bottomColor} strokeWidth={size * 0.115} fill="none" strokeLinecap="round"
      />
      {/* Bottom-right ∪ */}
      <path
        d={`M${col + pad},${half} L${col + pad},${half * 1.55} Q${col + pad},${h - half * 0.05} ${col * 1.5},${h - half * 0.05} Q${w - pad},${h - half * 0.05} ${w - pad},${half * 1.55} L${w - pad},${half}`}
        stroke={bottomColor} strokeWidth={size * 0.115} fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className = "", compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon size={34} topColor="#1C2B8C" bottomColor="#7B7FC4" />
        <div className="flex flex-col leading-none">
          <span className="font-black text-[#1C2B8C] text-lg tracking-tight">PEKÍN S&amp;A</span>
          <span className="text-[#1C2B8C] text-[9px] font-semibold tracking-widest uppercase">Tu aliado en movimiento</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon size={50} topColor="#1C2B8C" bottomColor="#7B7FC4" />
      <div className="flex flex-col leading-none">
        <span className="font-black text-[#1C2B8C] text-2xl tracking-tight">PEKÍN S&amp;A</span>
        <span className="text-[#1C2B8C] text-[10px] font-semibold tracking-[0.22em] uppercase mt-0.5">Tu aliado en movimiento</span>
      </div>
    </div>
  );
}

/** White variant for dark backgrounds (navbar) */
export function LogoWhite({ className = "", compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon size={34} topColor="#FFFFFF" bottomColor="rgba(255,255,255,0.65)" />
        <div className="flex flex-col leading-none">
          <span className="font-black text-white text-lg tracking-tight">PEKÍN S&amp;A</span>
          <span className="text-white/75 text-[9px] font-semibold tracking-widest uppercase">Tu aliado en movimiento</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon size={50} topColor="#FFFFFF" bottomColor="rgba(255,255,255,0.65)" />
      <div className="flex flex-col leading-none">
        <span className="font-black text-white text-2xl tracking-tight">PEKÍN S&amp;A</span>
        <span className="text-white/75 text-[10px] font-semibold tracking-[0.22em] uppercase mt-0.5">Tu aliado en movimiento</span>
      </div>
    </div>
  );
}
