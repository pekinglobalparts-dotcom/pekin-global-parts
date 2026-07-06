import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    url: "https://www.pekinglobalparts.com",
    siteName: "Pekin Global Parts",
    title: "Pekin Global Parts | Importadora de Autopartes B2B",
    description:
      "Plataforma B2B exclusiva para empresas. Importadora especializada en autopartes de alta calidad.",
    images: [
      {
        url: "https://www.pekinglobalparts.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pekín S&A — Tu aliado en movimiento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pekin Global Parts | Importadora de Autopartes B2B",
    description: "Plataforma B2B exclusiva para empresas automotrices en Perú.",
    images: ["https://www.pekinglobalparts.com/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-512.png",
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
