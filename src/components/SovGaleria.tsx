"use client";

import { useCallback, useEffect, useState } from "react";

export type GalItem = { label: string; src?: string };

const camPath = "M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ico" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <>
      <svg className="cam" viewBox="0 0 24 24">
        <path d={camPath} />
        <circle cx="12" cy="12.5" r="3.2" />
      </svg>
      <span className="cap">{label}</span>
    </>
  );
}

export function SovGaleria({ items, waNumber }: { items: GalItem[]; waNumber: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) => setOpen((i) => (i === null ? null : (i + dir + items.length) % items.length)),
    [items.length]
  );

  // Enlace profundo opcional (?foto=N) para abrir una foto directa
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("foto");
    if (n !== null) {
      const idx = Number(n);
      if (Number.isInteger(idx) && idx >= 0 && idx < items.length) setOpen(idx);
    }
  }, [items.length]);

  // Teclado + bloqueo de scroll cuando el visor está abierto
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, go]);

  const waFor = (label: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(
      `¡Hola SOV DECO PARTHY! Me encantó la decoración de ${label} que vi en su página. Me gustaría una así, ¿me pueden cotizar?`
    )}`;

  const current = open === null ? null : items[open];

  return (
    <>
      <div className="gal-grid">
        {items.map((it, i) => (
          <button className="gitem" key={it.label + i} onClick={() => setOpen(i)} aria-label={`Ver ${it.label} en grande`}>
            <span className="gframe">
              <span className="inner">
                {it.src ? <img src={it.src} alt={`Decoración de ${it.label}`} /> : <Placeholder label={it.label} />}
                <span className="hint">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16 16l4 4M11 8v6M8 11h6" />
                  </svg>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div className="lb-ov" role="dialog" aria-modal="true" aria-label={current.label} onClick={close}>
          <div className="lb-card" onClick={(e) => e.stopPropagation()}>
            <button className="lb-close" onClick={close} aria-label="Cerrar">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            {items.length > 1 && (
              <>
                <button className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Anterior">
                  <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </button>
                <button className="lb-nav lb-next" onClick={() => go(1)} aria-label="Siguiente">
                  <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </button>
              </>
            )}
            <div className="lb-frame">
              <div className="lb-pic">
                {current.src ? (
                  <img src={current.src} alt={`Decoración de ${current.label}`} />
                ) : (
                  <div className="lb-ph">
                    <svg className="cam" viewBox="0 0 24 24"><path d={camPath} /><circle cx="12" cy="12.5" r="3.2" /></svg>
                    <span>Foto próximamente</span>
                  </div>
                )}
              </div>
            </div>
            <div className="lb-body">
              <span className="lb-title">{current.label}</span>
              <a className="btn-wa" href={waFor(current.label)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Quiero una decoración así
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
