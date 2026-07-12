/* Logotipo SOV DECO PARTHY — "SOV DECO" dorado (Cinzel) + "Parthy" firma (Great Vibes) */

type Variant = "header" | "hero" | "footer";

export function SovLogo({ variant = "header" }: { variant?: Variant }) {
  return (
    <span className={`logo logo--${variant}`}>
      <span className="logo-top">SOV DECO</span>
      <span className="logo-script">Parthy</span>
    </span>
  );
}
