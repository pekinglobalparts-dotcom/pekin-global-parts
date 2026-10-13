#!/usr/bin/env node
// Generador de flyers de oferta (1 producto) — Pekín Global Parts
// Uso:  node catalogos/flyer.mjs catalogos/data/flyer-copa.json
// Salida: catalogos/salida/flyer-<codigo>.html  (+ .png si hay Chromium)
//
// JSON: { repuesto, marca, codigo, modelo, precio, notaPrecio, etiqueta, alto }
//   La foto se busca en catalogos/assets/fotos/<codigo>.(png|jpg|jpeg|webp)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, basename } from "path";
import { execFileSync } from "child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(ROOT, "assets");
const OUT = resolve(ROOT, "salida");
mkdirSync(OUT, { recursive: true });

const d = JSON.parse(readFileSync(process.argv[2] || resolve(ROOT, "data/flyer-copa.json"), "utf8"));
const b64 = (p) => readFileSync(p).toString("base64");
const logo = "data:image/jpeg;base64," + b64(resolve(ASSETS, "logo-pekin.jpg"));
const alto = d.alto || 1300;

let fotoSrc = "";
for (const ext of ["png", "jpg", "jpeg", "webp"]) {
  const p = resolve(ASSETS, "fotos", d.codigo + "." + ext);
  if (existsSync(p)) { fotoSrc = "data:image/" + (ext === "jpg" ? "jpeg" : ext) + ";base64," + b64(p); break; }
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Barlow:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;} body{margin:0;}
.osw{font-family:'Oswald','Arial Narrow',Arial,sans-serif;} .bar{font-family:'Barlow',system-ui,sans-serif;}
</style></head><body>
<div class="bar" style="width:1080px;height:${alto}px;background:#0a1628;color:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden;">
  <div style="position:absolute;right:-140px;top:-140px;width:520px;height:520px;background:#dc2626;opacity:0.16;border-radius:50%;"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;padding:40px 48px 0;position:relative;">
    <div style="background:#fff;border-radius:12px;padding:11px 18px;"><img src="${logo}" style="height:52px;display:block;"></div>
    <div class="osw" style="background:#dc2626;color:#fff;font-weight:700;font-size:30px;letter-spacing:4px;padding:12px 26px;border-radius:8px;">OFERTA</div>
  </div>
  ${d.etiqueta ? `<div style="text-align:center;margin-top:22px;"><span class="osw" style="display:inline-block;background:#facc15;color:#0a1628;font-weight:700;font-size:30px;letter-spacing:3px;padding:10px 30px;border-radius:40px;transform:rotate(-1.5deg);box-shadow:0 6px 18px rgba(0,0,0,.3);">🔥 ${d.etiqueta}</span></div>` : ""}
  <div style="text-align:center;margin-top:24px;padding:0 48px;">
    <div class="osw" style="font-size:66px;font-weight:700;line-height:1.0;letter-spacing:0.5px;">${d.repuesto.toUpperCase()}</div>
    <div style="display:flex;gap:12px;justify-content:center;align-items:center;margin-top:16px;">
      <span class="osw" style="background:#dc2626;color:#fff;font-size:22px;font-weight:600;letter-spacing:2px;padding:7px 18px;border-radius:6px;">${d.marca}</span>
      ${d.codigo ? `<span class="bar" style="border:1px solid #33517a;color:#9fb4d0;font-size:20px;font-weight:500;padding:7px 16px;border-radius:6px;">Cód. ${d.codigo}</span>` : ""}
    </div>
  </div>
  <div style="margin:26px 48px 0;background:#fff;border-radius:20px;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:20px;">
    ${fotoSrc ? `<img src="${fotoSrc}" style="max-width:100%;max-height:100%;object-fit:contain;">` : `<span class="bar" style="color:#9aa6b4;font-size:22px;">FOTO: ${d.codigo}</span>`}
  </div>
  ${d.modelo ? `<div style="text-align:center;margin-top:20px;"><span class="bar" style="font-size:26px;font-weight:600;color:#e6edf6;">🚙 ${d.modelo}</span></div>` : ""}
  <div style="text-align:center;margin-top:16px;">
    <div style="display:flex;align-items:baseline;gap:10px;justify-content:center;">
      <span class="bar" style="color:#9fb4d0;font-size:40px;font-weight:600;">S/</span>
      <span class="osw" style="font-size:140px;font-weight:700;color:#fff;line-height:0.85;">${d.precio}</span>
      <span class="bar" style="color:#9fb4d0;font-size:34px;font-weight:600;">c/u</span>
    </div>
    ${d.notaPrecio ? `<div class="bar" style="font-size:22px;color:#facc15;font-weight:600;margin-top:6px;letter-spacing:1px;">${d.notaPrecio}</div>` : ""}
  </div>
  <div style="margin-top:24px;background:#dc2626;padding:24px 48px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:16px;">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2z"/></svg>
      <div><div class="bar" style="font-size:20px;font-weight:600;color:#ffe4e4;">Pídelo ya por WhatsApp</div>
      <div class="osw" style="font-size:38px;font-weight:700;color:#fff;line-height:1.1;">+51 953 096 242</div></div>
    </div>
    <div class="bar" style="text-align:right;font-size:15px;color:#ffe4e4;">Pekin Global Parts S.A.C.<br>Tu aliado en movimiento</div>
  </div>
</div>
</body></html>`;

const htmlOut = resolve(OUT, "flyer-" + d.codigo + ".html");
writeFileSync(htmlOut, html);
console.log(`✔ HTML: ${htmlOut}`);

const chromes = [process.env.CHROME, "/opt/pw-browsers/chromium", "google-chrome", "chromium", "chromium-browser"].filter(Boolean);
let done = false;
for (const ch of chromes) {
  try {
    execFileSync(ch, ["--headless=new", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=2",
      `--window-size=1080,${alto}`, "--virtual-time-budget=5000",
      `--screenshot=${resolve(OUT, "flyer-" + d.codigo + ".png")}`, "file://" + htmlOut], { stdio: "ignore" });
    console.log(`✔ PNG:  ${resolve(OUT, "flyer-" + d.codigo + ".png")}`);
    done = true; break;
  } catch { /* siguiente */ }
}
if (!done) console.log(`ℹ Para el PNG:  <chromium> --headless=new --force-device-scale-factor=2 --window-size=1080,${alto} --screenshot=salida/flyer-${d.codigo}.png file://${htmlOut}`);
