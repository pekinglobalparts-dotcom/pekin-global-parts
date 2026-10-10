// Marca de agua para las fotos del catálogo.
// Se aplica en el navegador, ANTES de subir, así queda grabada en el archivo
// (permanente). Patrón diagonal tenue que cubre toda la foto: protege contra
// robo/recorte sin tapar el producto.

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function marcarAgua(file: File): Promise<File> {
  // Solo imágenes; en SSR o si algo falla, devolvemos el archivo original.
  if (typeof document === "undefined" || !file.type?.startsWith("image/")) return file;
  try {
    const img = await loadImg(file);
    const W = img.naturalWidth, H = img.naturalHeight;
    if (!W || !H) return file;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, W, H);

    const big = Math.max(W, H);
    const fs = Math.round(big * 0.047);
    const text = "PEKÍN GLOBAL PARTS  ·  pekinglobalparts.com";

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate((-30 * Math.PI) / 180);
    ctx.font = `bold ${fs}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const tw = ctx.measureText(text).width || big;
    const stepX = Math.max(1, tw + fs * 3.0); // ancho completo + espacio: no se encima
    const stepY = Math.max(1, fs * 4.2);       // filas separadas, legibles
    const diag = Math.ceil(Math.hypot(W, H)) + fs * 6;
    let row = 0;
    for (let y = -diag; y < diag; y += stepY) {
      const off = (row % 2) * (stepX / 2);
      for (let x = -diag; x < diag; x += stepX) {
        ctx.fillStyle = "rgba(0,0,0,0.17)";
        ctx.fillText(text, x + off + 2, y + 2);
        ctx.fillStyle = "rgba(255,255,255,0.30)";
        ctx.fillText(text, x + off, y);
      }
      row++;
    }
    ctx.restore();

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.9));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${base}-pekin.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Helper para el prop onBeforeUploadBegin de uploadthing.
export const marcarAguaFiles = (files: File[]) => Promise.all(files.map(marcarAgua));
