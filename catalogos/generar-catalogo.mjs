#!/usr/bin/env node
// Generador de catálogos Pekín Global Parts
// Uso:  node catalogos/generar-catalogo.mjs catalogos/data/tair-renting.json
// Salida: catalogos/salida/<archivo>.html  (+ .pdf si hay Chromium)
//
// Cada producto en el JSON: { categoria, marca, repuesto, codigo, modelo, precio }
//   - La FOTO se busca en catalogos/assets/fotos/<codigo>.(png|jpg|jpeg|webp)
//   - El LOGO de marca en catalogos/assets/logos/<MARCA>.png  (si no hay, va el nombre en texto)
//   - Si mostrarPrecios=false, se omite la columna de precio (catálogo público).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve, basename } from "path";
import { execFileSync } from "child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));            // catalogos/
const ASSETS = resolve(ROOT, "assets");
const OUT = resolve(ROOT, "salida");
mkdirSync(OUT, { recursive: true });

const dataPath = process.argv[2] || resolve(ROOT, "data/tair-renting.json");
const db = JSON.parse(readFileSync(dataPath, "utf8"));
const name = basename(dataPath).replace(/\.json$/, "");
const showPrice = db.mostrarPrecios !== false;

const b64 = (p) => readFileSync(p).toString("base64");
const mime = (p) => (p.endsWith(".jpg") || p.endsWith(".jpeg")) ? "jpeg" : p.endsWith(".webp") ? "webp" : "png";
const logoPekin = "data:image/jpeg;base64," + b64(resolve(ASSETS, "logo-pekin.jpg"));

function foto(codigo) {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const p = resolve(ASSETS, "fotos", codigo + "." + ext);
    if (existsSync(p)) return "data:image/" + mime(p) + ";base64," + b64(p);
  }
  return null;
}
function brandLogo(marca) {
  const p = resolve(ASSETS, "logos", marca + ".png");
  return existsSync(p) ? "data:image/png;base64," + b64(p) : null;
}
function brandBadge(marca, h = 24) {
  const lg = brandLogo(marca);
  if (lg) return `<span style="background:#fff;border:1px solid #e3e8f0;border-radius:6px;padding:4px 12px;display:inline-flex;align-items:center;"><img src="${lg}" style="height:${h}px;display:block;"></span>`;
  const label = marca === "ALT" ? "Alternativo" : marca;
  return `<span style="font-family:'Oswald',sans-serif;background:#0a1628;color:#fff;font-size:13px;font-weight:600;letter-spacing:1.5px;padding:6px 14px;border-radius:6px;">${label}</span>`;
}

const cats = [];
for (const p of db.productos) {
  let c = cats.find((x) => x.name === p.categoria);
  if (!c) { c = { name: p.categoria, items: [] }; cats.push(c); }
  c.items.push(p);
}

const ph = (codigo) => `
  <div style="width:100%;height:100%;border:2px dashed #cbd4e0;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:#9aa6b4;">
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#9aa6b4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
    <span style="font-size:12px;font-weight:600;letter-spacing:1px;">FOTO PRÓXIMAMENTE</span>
    ${codigo !== "—" ? `<span style="font-size:11px;color:#b3bccb;font-family:monospace;">${codigo}</span>` : ""}
  </div>`;

function row(p) {
  const f = foto(p.codigo);
  const specs = [["Código", p.codigo], ["Aplicación", p.modelo || db.vehiculo]];
  const specHtml = specs.map((s, i) => `
    <div style="display:flex;background:${i % 2 ? "#f6f8fb" : "#fff"};border-bottom:1px solid #edf1f7;">
      <div style="width:34%;padding:8px 18px;font-size:11px;color:#7a8aa0;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${s[0]}</div>
      <div style="flex:1;padding:8px 12px;font-size:14px;color:#12233d;font-weight:600;font-family:'Consolas',monospace;">${s[1]}</div>
    </div>`).join("");
  const priceBlock = showPrice && p.precio ? `
      <div style="text-align:right;">
        <div style="font-size:10px;color:#7a8aa0;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Por mayor · c/IGV</div>
        <div style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;color:#dc2626;line-height:0.95;">S/ ${p.precio}</div>
      </div>` : `<span></span>`;
  return `
  <div style="display:flex;border:1px solid #dbe2ec;border-radius:12px;overflow:hidden;margin-bottom:13px;height:196px;break-inside:avoid;">
    <div style="width:40%;background:#fff;display:flex;align-items:center;justify-content:center;padding:13px;border-right:1px solid #eef1f6;">
      ${f ? `<img src="${f}" style="max-width:100%;max-height:168px;object-fit:contain;">` : ph(p.codigo)}
    </div>
    <div style="width:60%;display:flex;flex-direction:column;">
      <div style="font-family:'Oswald',sans-serif;background:#dc2626;color:#fff;font-size:16px;font-weight:600;padding:10px 18px;">${p.repuesto}</div>
      ${specHtml}
      <div style="flex:1;display:flex;align-items:center;justify-content:space-between;padding:9px 18px;background:#fff;">
        ${brandBadge(p.marca, 24)}
        ${priceBlock}
      </div>
    </div>
  </div>`;
}

let body = `
<div style="height:1123px;background:#0a1628;color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:64px 58px;break-after:page;position:relative;overflow:hidden;">
  <div style="position:absolute;right:-120px;top:-120px;width:500px;height:500px;background:#dc2626;opacity:0.14;border-radius:50%;"></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="background:#fff;border-radius:14px;padding:14px 22px;"><img src="${logoPekin}" style="height:72px;display:block;"></div>
    ${db.cliente ? `<div style="text-align:right;background:#dc2626;padding:10px 18px;border-radius:8px;"><div style="font-size:12px;color:#ffd9d9;letter-spacing:3px;">DOCUMENTO</div><div style="font-family:'Oswald',sans-serif;font-size:22px;font-weight:700;">CONFIDENCIAL</div></div>` : ""}
  </div>
  <div>
    <div style="font-size:20px;font-weight:600;color:#dc2626;letter-spacing:7px;">${(db.titulo || "Catálogo de repuestos").toUpperCase()}</div>
    <div style="font-family:'Oswald',sans-serif;font-size:82px;font-weight:700;line-height:0.95;margin-top:8px;">${(db.cliente || db.vehiculo).toUpperCase()}</div>
    <div style="font-family:'Oswald',sans-serif;font-size:30px;font-weight:600;color:#9fb4d0;margin-top:12px;">${db.vehiculo} · ${db.anios || ""}</div>
    <div style="width:170px;height:5px;background:#dc2626;border-radius:3px;margin-top:22px;"></div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:14px;color:#9fb4d0;">
    <div>${db.notaPrecio ? "<b style='color:#fff;'>" + db.notaPrecio + "</b> · " : ""}Sujeto a stock</div>
    <div style="text-align:right;font-family:'Oswald',sans-serif;font-size:19px;color:#fff;font-weight:600;">WhatsApp +51 953 096 242<br><span style="font-size:13px;color:#9fb4d0;font-weight:400;">Pekin Global Parts S.A.C. · Tu aliado en movimiento</span></div>
  </div>
</div>`;

for (const c of cats) {
  body += `<div style="padding:24px 34px 0;">
    <div style="break-after:avoid;display:flex;align-items:center;justify-content:space-between;background:#0f1f3d;border-radius:8px;padding:11px 22px;margin-bottom:15px;">
      <span style="font-family:'Oswald',sans-serif;color:#fff;font-size:21px;font-weight:600;letter-spacing:1px;">${c.name}</span>
      ${brandBadge(c.items[0].marca, 24)}
    </div>
    ${c.items.map(row).join("")}
  </div>`;
}

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Barlow:wght@400;500;600;700&display=swap');
  @page { size:A4; margin:0; }
  * { box-sizing:border-box; }
  html,body { margin:0; padding:0; background:#fff; }
  body { width:794px; font-family:'Barlow',Arial,sans-serif; color:#0a1628; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
</style></head><body>${body}</body></html>`;

const htmlOut = resolve(OUT, name + ".html");
writeFileSync(htmlOut, html);
const total = db.productos.length, con = db.productos.filter((p) => foto(p.codigo)).length;
console.log(`✔ HTML: ${htmlOut}`);
console.log(`  ${total} productos · ${con} con foto · ${total - con} pendientes de foto`);

// Intentar PDF con Chromium si está disponible
const chromes = [process.env.CHROME, "/opt/pw-browsers/chromium", "google-chrome", "chromium", "chromium-browser"].filter(Boolean);
let done = false;
for (const ch of chromes) {
  try {
    execFileSync(ch, ["--headless=new", "--no-sandbox", "--no-pdf-header-footer",
      "--virtual-time-budget=6000", `--print-to-pdf=${resolve(OUT, name + ".pdf")}`, "file://" + htmlOut],
      { stdio: "ignore" });
    console.log(`✔ PDF:  ${resolve(OUT, name + ".pdf")}`);
    done = true; break;
  } catch { /* probar siguiente */ }
}
if (!done) console.log(`ℹ Para el PDF:  <chromium> --headless=new --no-pdf-header-footer --print-to-pdf=salida/${name}.pdf file://${htmlOut}`);
