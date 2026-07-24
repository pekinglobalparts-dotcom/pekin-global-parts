/* Logotipo SOV DECO PARTY — "SOV DECO" dorado (Cinzel) + "Party" firma (Great Vibes) */

type Variant = "header" | "hero" | "footer";

export function SovLogo({ variant = "header" }: { variant?: Variant }) {
  return (
    <span className={`logo logo--${variant}`}>
      <span className="logo-top">SOV DECO</span>
      <span className="logo-script">Party</span>
    </span>
  );
}
