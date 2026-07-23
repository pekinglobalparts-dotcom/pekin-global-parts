import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-jost" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cormorant" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel" });
const greatvibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sovdecoparthy.com"),
  title: {
    default: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones",
    template: "%s | SOV DECO PARTHY",
  },
  description:
    "SOV DECO PARTHY — Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años, bautizos y toda celebración. Cotiza por WhatsApp y hacemos realidad la decoración de tus sueños.",
  applicationName: "SOV DECO PARTHY",
  keywords: [
    "decoración",
    "decoraciones",
    "decoración de eventos",
    "cumpleaños",
    "baby shower",
    "15 años",
    "18 años",
    "bautizo",
    "aniversarios",
    "eventos",
    "fiestas",
    "globos",
    "SOV DECO PARTHY",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://www.sovdecoparthy.com",
    siteName: "SOV DECO PARTHY",
    title: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones",
    description:
      "Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años, bautizos y más. Cotiza por WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOV DECO PARTHY | Decoración para tus eventos y celebraciones",
    description:
      "Decoración y arreglos decorativos para cumpleaños, baby shower, 15 y 18 años, bautizos y más. Cotiza por WhatsApp.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${jost.variable} ${cormorant.variable} ${cinzel.variable} ${greatvibes.variable}`}
      style={{ scrollBehavior: "smooth" }}
    >
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
