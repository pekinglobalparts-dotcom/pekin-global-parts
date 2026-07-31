import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number(amount));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  // Uso un generador criptográficamente seguro (Web Crypto), disponible tanto
  // en el servidor como en el navegador, en lugar de Math.random (predecible).
  const bytes = new Uint32Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(bytes[i] % chars.length);
  }
  return password;
}

export function generateNumero(prefix: string, id: string): string {
  const year = new Date().getFullYear();
  const short = id.slice(-6).toUpperCase();
  return `${prefix}-${year}-${short}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
