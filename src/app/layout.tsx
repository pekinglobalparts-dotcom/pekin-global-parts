import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Pekin Global Parts | Importadora de Autopartes B2B",
    template: "%s | Pekin Global Parts",
  },
  description:
    "Plataforma B2B exclusiva para empresas. Importadora especializada en autopartes de alta calidad para flotas corporativas, concesionarias y talleres en Perú.",
  keywords: [
    "autopartes",
    "repuestos",
    "importadora",
    "B2B",
    "flotas",
    "concesionarias",
    "Perú",
    "Pekin",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Pekin Global Parts",
    title: "Pekin Global Parts | Importadora de Autopartes B2B",
    description:
      "Plataforma B2B exclusiva para empresas. Importadora especializada en autopartes de alta calidad.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} style={{ scrollBehavior: "smooth" }}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
