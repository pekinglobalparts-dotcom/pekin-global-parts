"use client";

import { useCallback, useEffect, useState } from "react";

export type GalItem = { label: string; src?: string; full?: string };

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

export function SovGaleria({ items, waNumber }: { items: GalItem[]; waNumber: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => setI((p) => (p + dir + items.length) % items.length),
    [items.length]
  );

  // Auto-avance con fade (respeta "reduce motion")
  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 4200);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const waFor = (label: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      `¡Hola SOV DECO PARTHY! Me encantó la decoración de ${label} que vi en su página. Me gustaría una así, ¿me pueden cotizar?`
    )}`;

  const cur = items[i];

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="car-stage">
        {items.map((it, idx) => (
          <div className={`car-slide${idx === i ? " active" : ""}`} key={idx} aria-hidden={idx !== i}>
            <div className="car-frame">
              <img src={it.full || it.src} alt={`Decoración de ${it.label}`} loading={idx === 0 ? "eager" : "lazy"} />
            </div>
          </div>
        ))}

        <button className="car-nav car-prev" onClick={() => go(-1)} aria-label="Anterior">
          <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
        <button className="car-nav car-next" onClick={() => go(1)} aria-label="Siguiente">
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </div>

      <div className="car-caption">
        <span className="car-title">{cur.label}</span>
        <a className="btn-wa" href={waFor(cur.label)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon />
          Quiero una decoración así
        </a>
      </div>

      <div className="car-dots" role="tablist" aria-label="Trabajos">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={idx === i ? "on" : ""}
            aria-label={`Ver trabajo ${idx + 1}`}
            aria-selected={idx === i}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
}
