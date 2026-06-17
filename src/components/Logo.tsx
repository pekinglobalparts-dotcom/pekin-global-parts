import React from "react";

interface LogoProps {
  className?: string;
  /** If true, renders in a compact horizontal layout for navbar */
  compact?: boolean;
}

export function Logo({ className = "", compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Symbol */}
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Top row arches: navy / lilac / navy */}
          <path d="M2 16 C2 8 8 4 14 4 C14 4 14 10 14 16" stroke="#1a1f6e" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M14 16 C14 8 20 4 26 4 C26 4 26 10 26 16" stroke="#6b6fa8" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M26 16 C26 8 32 4 38 4 C38 4 38 10 38 16" stroke="#1a1f6e" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* Bottom row arches: lilac / navy / lilac */}
          <path d="M2 16 C2 24 8 28 14 28 C14 28 14 22 14 16" stroke="#6b6fa8" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M14 16 C14 24 20 28 26 28 C26 28 26 22 26 16" stroke="#1a1f6e" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M26 16 C26 24 32 28 38 28 C38 28 38 22 38 16" stroke="#6b6fa8" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Text */}
        <div className="flex flex-col leading-none">
          <span className="font-black text-[#1a1f6e] text-lg tracking-tight">PEKÍN S&amp;A</span>
          <span className="text-[#1a1f6e] text-[9px] font-medium tracking-widest uppercase">Tu aliado en movimiento</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Symbol – larger */}
      <svg width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 22 C3 11 11 5 20 5 C20 5 20 14 20 22" stroke="#1a1f6e" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M20 22 C20 11 28 5 36 5 C36 5 36 14 36 22" stroke="#6b6fa8" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M36 22 C36 11 44 5 53 5 C53 5 53 14 53 22" stroke="#1a1f6e" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M3 22 C3 33 11 39 20 39 C20 39 20 30 20 22" stroke="#6b6fa8" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M20 22 C20 33 28 39 36 39 C36 39 36 30 36 22" stroke="#1a1f6e" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M36 22 C36 33 44 39 53 39 C53 39 53 30 53 22" stroke="#6b6fa8" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="font-black text-[#1a1f6e] text-2xl tracking-tight">PEKÍN S&amp;A</span>
        <span className="text-[#1a1f6e] text-[11px] font-medium tracking-[0.2em] uppercase mt-0.5">Tu aliado en movimiento</span>
      </div>
    </div>
  );
}

/** White variant for dark/red backgrounds */
export function LogoWhite({ className = "", compact = false }: LogoProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M2 16 C2 8 8 4 14 4 C14 4 14 10 14 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M14 16 C14 8 20 4 26 4 C26 4 26 10 26 16" stroke="rgba(255,255,255,0.65)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M26 16 C26 8 32 4 38 4 C38 4 38 10 38 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M2 16 C2 24 8 28 14 28 C14 28 14 22 14 16" stroke="rgba(255,255,255,0.65)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M14 16 C14 24 20 28 26 28 C26 28 26 22 26 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M26 16 C26 24 32 28 38 28 C38 28 38 22 38 16" stroke="rgba(255,255,255,0.65)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-black text-white text-lg tracking-tight">PEKÍN S&amp;A</span>
          <span className="text-white/80 text-[9px] font-medium tracking-widest uppercase">Tu aliado en movimiento</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 22 C3 11 11 5 20 5 C20 5 20 14 20 22" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M20 22 C20 11 28 5 36 5 C36 5 36 14 36 22" stroke="rgba(255,255,255,0.65)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M36 22 C36 11 44 5 53 5 C53 5 53 14 53 22" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M3 22 C3 33 11 39 20 39 C20 39 20 30 20 22" stroke="rgba(255,255,255,0.65)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M20 22 C20 33 28 39 36 39 C36 39 36 30 36 22" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M36 22 C36 33 44 39 53 39 C53 39 53 30 53 22" stroke="rgba(255,255,255,0.65)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-black text-white text-2xl tracking-tight">PEKÍN S&amp;A</span>
        <span className="text-white/80 text-[11px] font-medium tracking-[0.2em] uppercase mt-0.5">Tu aliado en movimiento</span>
      </div>
    </div>
  );
}
