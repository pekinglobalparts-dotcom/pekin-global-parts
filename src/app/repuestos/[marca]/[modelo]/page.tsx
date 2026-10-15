import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelo, allModeloParams } from "@/lib/repuestos";
import { RepuestosShell } from "../../shell";

const WHATSAPP = "51953096242";

export function generateStaticParams() {
  return allModeloParams();
}

export async function generateMetadata({ params }: { params: Promise<{ marca: string; modelo: string }> }): Promise<Metadata> {
  const { marca, modelo } = await params;
  const data = getModelo(marca, modelo);
  if (!data) return {};
  const nombre = `${data.marca.label} ${data.modelo.label}`;
  return {
    title: `Repuestos de motor para ${nombre}`,
    description: `Repuestos de motor para ${nombre}: ${data.partes.slice(0, 8).map(p => p.nombre.toLowerCase()).join(", ")} y más. Cotiza por WhatsApp — envíos a todo el Perú.`,
    alternates: { canonical: `https://www.pekinglobalparts.com/repuestos/${marca}/${modelo}` },
  };
}

export default async function ModeloPage({ params }: { params: Promise<{ marca: string; modelo: string }> }) {
  const { marca, modelo } = await params;
  const data = getModelo(marca, modelo);
  if (!data) notFound();
  const nombre = `${data.marca.label} ${data.modelo.label}`;

  // Datos estructurados: lista de repuestos (ayuda a Google a entender la página)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Repuestos de motor para ${nombre}`,
    numberOfItems: data.partes.length,
    itemListElement: data.partes.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${p.nombre} para ${nombre}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RepuestosShell
        breadcrumbs={[
          { label: "Repuestos", href: "/repuestos" },
          { label: data.marca.label, href: `/repuestos/${marca}` },
          { label: data.modelo.label },
        ]}
        title={`Repuestos de motor para ${nombre}`}
        intro={`Tenemos repuestos de motor para ${nombre}. Importamos directo y entregamos a todo el Perú por la agencia que elijas. Consulta disponibilidad y precio por WhatsApp — te respondemos al instante.`}
        waMsg={`Hola Pekín Global Parts, busco repuestos de motor para ${nombre}.`}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">Repuestos disponibles para {nombre}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.partes.map((p, i) => {
            const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Pekín Global Parts, necesito ${p.nombre} para ${nombre}.`)}`;
            return (
              <a key={i} href={wa} target="_blank" rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-green-500 hover:shadow-md transition-all">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 group-hover:text-[#0f1f3d] text-sm truncate">{p.nombre}</p>
                  <p className="text-xs text-slate-400">para {nombre}</p>
                </div>
                <span className="text-xs font-bold text-green-600 shrink-0">Cotizar →</span>
              </a>
            );
          })}
        </div>
      </RepuestosShell>
    </>
  );
}
