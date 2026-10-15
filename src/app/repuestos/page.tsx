import type { Metadata } from "next";
import Link from "next/link";
import { getMarcas } from "@/lib/repuestos";
import { RepuestosShell } from "./shell";

export const metadata: Metadata = {
  title: "Repuestos de motor por marca y modelo",
  description:
    "Importamos repuestos de motor para Toyota, Nissan, Hyundai, Mitsubishi, Kia y más. Pistones, anillos, metales, válvulas y más. Cotiza por WhatsApp — envíos a todo el Perú.",
  alternates: { canonical: "https://www.pekinglobalparts.com/repuestos" },
};

export default function RepuestosHub() {
  const marcas = getMarcas();
  const totalModelos = marcas.reduce((s, m) => s + m.modelos.length, 0);

  return (
    <RepuestosShell
      breadcrumbs={[{ label: "Repuestos" }]}
      title="Repuestos de motor para todas las marcas"
      intro={`Importamos repuestos de motor originales y de calidad para ${marcas.length} marcas y más de ${totalModelos} modelos. Pistones, anillos, metales de biela y bancada, válvulas, guías, camisas y más. Envíos a todo el Perú por la agencia que elijas.`}
    >
      <h2 className="text-lg font-bold text-slate-900 mb-4">Elige tu marca</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {marcas.map(m => (
          <Link key={m.slug} href={`/repuestos/${m.slug}`}
            className="group bg-white border border-slate-200 rounded-2xl p-4 hover:border-[#0f1f3d] hover:shadow-md transition-all">
            <p className="font-black text-slate-900 group-hover:text-[#0f1f3d]">{m.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.modelos.length} modelo(s)</p>
          </Link>
        ))}
      </div>
    </RepuestosShell>
  );
}
