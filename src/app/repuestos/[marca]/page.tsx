import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarca, getMarcas } from "@/lib/repuestos";
import { RepuestosShell } from "../shell";

export function generateStaticParams() {
  return getMarcas().map(m => ({ marca: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ marca: string }> }): Promise<Metadata> {
  const { marca } = await params;
  const m = getMarca(marca);
  if (!m) return {};
  return {
    title: `Repuestos de motor para ${m.label}`,
    description: `Repuestos de motor para ${m.label}: pistones, anillos, metales, válvulas y más, para ${m.modelos.length} modelos. Cotiza por WhatsApp — envíos a todo el Perú.`,
    alternates: { canonical: `https://www.pekinglobalparts.com/repuestos/${m.slug}` },
  };
}

export default async function MarcaPage({ params }: { params: Promise<{ marca: string }> }) {
  const { marca } = await params;
  const m = getMarca(marca);
  if (!m) notFound();

  return (
    <RepuestosShell
      breadcrumbs={[{ label: "Repuestos", href: "/repuestos" }, { label: m.label }]}
      title={`Repuestos de motor para ${m.label}`}
      intro={`Importamos repuestos de motor para ${m.label} — pistones, anillos, metales de biela y bancada, válvulas, guías, camisas y más. Disponibles para ${m.modelos.length} modelos. Elige tu modelo o cotiza directo por WhatsApp.`}
      waMsg={`Hola Pekín Global Parts, busco repuestos de motor para ${m.label}.`}
    >
      <h2 className="text-lg font-bold text-slate-900 mb-4">Modelos de {m.label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {m.modelos.map(mo => (
          <Link key={mo.slug} href={`/repuestos/${m.slug}/${mo.slug}`}
            className="group bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-[#0f1f3d] hover:shadow-md transition-all">
            <p className="font-bold text-slate-900 group-hover:text-[#0f1f3d] text-sm">{m.label} {mo.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{mo.partes} repuesto(s)</p>
          </Link>
        ))}
      </div>
    </RepuestosShell>
  );
}
