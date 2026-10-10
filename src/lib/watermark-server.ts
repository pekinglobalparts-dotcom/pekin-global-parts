import sharp from "sharp";

// Marca de agua en el servidor (para re-sellar fotos ya subidas).
// Mismo estilo que el sello del cliente: patrón diagonal tenue que cubre
// toda la foto, con "PEKÍN GLOBAL PARTS · pekinglobalparts.com".

function buildSvg(W: number, H: number): Buffer {
  const fs = Math.max(14, Math.round(Math.max(W, H) * 0.045));
  const text = "PEKÍN GLOBAL PARTS · pekinglobalparts.com";
  const tw = Math.round(text.length * fs * 0.52); // ancho aproximado
  const pw = tw + fs * 3; // ancho del patrón: no se encima
  const ph = Math.round(fs * 4.2); // alto del patrón: filas separadas
  const yBase = Math.round(ph / 2);
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="wm" width="${pw}" height="${ph}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <text x="2" y="${yBase + 2}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${fs}" fill="#000000" fill-opacity="0.17">${text}</text>
      <text x="0" y="${yBase}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${fs}" fill="#ffffff" fill-opacity="0.30">${text}</text>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wm)"/>
</svg>`;
  return Buffer.from(svg);
}

export async function marcarAguaBuffer(input: Buffer): Promise<Buffer> {
  const img = sharp(input, { failOn: "none" }).rotate(); // respeta EXIF
  const meta = await img.metadata();
  const W = meta.width || 0;
  const H = meta.height || 0;
  if (!W || !H) throw new Error("Imagen sin dimensiones");
  const svg = buildSvg(W, H);
  return img
    .composite([{ input: svg, top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toBuffer();
}
