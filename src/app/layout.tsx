import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo" });

export const metadata: Metadata = {
  title: {
    default: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones",
    template: "%s | SOV DECO PARTHY",
  },
  description:
    "SOV DECO PARTHY — Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años, bautizos y toda celebración. Cotiza por WhatsApp y hacemos realidad la decoración de tus sueños.",
  keywords: [
    "decoración",
    "decoraciones",
    "cumpleaños",
    "baby shower",
    "15 años",
    "18 años",
    "bautizo",
    "eventos",
    "fiestas",
    "globos",
    "SOV DECO PARTHY",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "SOV DECO PARTHY",
    title: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones",
    description:
      "Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años, bautizos y más. Cotiza por WhatsApp.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${baloo.variable}`}
      style={{ scrollBehavior: "smooth" }}
    >
      <body className="min-h-screen bg-[#faf5ff] font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
