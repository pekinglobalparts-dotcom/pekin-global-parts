/* Logotipo de SOV DECO PARTHY — globos + "SOV DECO" redondeado + "Parthy" manuscrito */

type Variant = "header" | "hero" | "footer";

function Balloons({ size, k }: { size: number; k: string }) {
  return (
    <svg
      className="sov-balloons"
      viewBox="0 0 72 100"
      width={size}
      height={(size * 100) / 72}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`bp-${k}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#a97ceb" />
          <stop offset="100%" stopColor="#8b4fd6" />
        </radialGradient>
        <radialGradient id={`bk-${k}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ff8fc4" />
          <stop offset="100%" stopColor="#f76aac" />
        </radialGradient>
        <radialGradient id={`bs-${k}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8fd4ff" />
          <stop offset="100%" stopColor="#5cbaf7" />
        </radialGradient>
      </defs>
      <path
        d="M20 42 Q30 56 37 62 M41 36 Q41 52 37 62 M53 48 Q46 57 37 62"
        stroke="#c9a8ec"
        strokeWidth="1.4"
        fill="none"
      />
      <path d="M37 62 q9 14 -3 34" stroke="#c9a8ec" strokeWidth="1.4" fill="none" />
      <ellipse cx="20" cy="25" rx="15" ry="18" fill={`url(#bp-${k})`} />
      <ellipse cx="41" cy="20" rx="15" ry="18" fill={`url(#bk-${k})`} />
      <ellipse cx="53" cy="32" rx="13" ry="16" fill={`url(#bs-${k})`} />
      <path d="M20 43 l4 5 l-8 0 z" fill="#8b4fd6" />
      <path d="M41 38 l4 5 l-8 0 z" fill="#f76aac" />
      <path d="M53 48 l3 4 l-7 0 z" fill="#5cbaf7" />
      <ellipse cx="15" cy="18" rx="3.5" ry="5" fill="#fff" opacity="0.5" />
      <ellipse cx="36" cy="13" rx="3.5" ry="5" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export function SovLogo({ variant = "header" }: { variant?: Variant }) {
  const size = variant === "hero" ? 64 : 34;
  const k = variant;
  return (
    <span className={`sov-logo sov-logo--${variant}`}>
      <Balloons size={size} k={k} />
      <span className="sov-logo-tx">
        <span className="sov-logo-top">SOV DECO</span>
        <span className="sov-logo-script">
          Parthy
          <svg
            className="sov-swash"
            viewBox="0 0 220 22"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`swg-${k}`} x1="0" x2="1">
                <stop offset="0" stopColor="#ec4899" />
                <stop offset="1" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <path
              d="M6 14 C 50 24 170 22 214 7"
              stroke={`url(#swg-${k})`}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>
      </span>
    </span>
  );
}
