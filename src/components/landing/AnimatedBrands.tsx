"use client";

const japaneseKorean = ["TOYOTA", "NISSAN", "HYUNDAI", "KIA", "MITSUBISHI", "SUZUKI", "FORD", "CHEVROLET", "VOLKSWAGEN", "HONDA", "MAZDA"];
const chinese = ["CHERY", "JAC MOTORS", "DFSK", "CHANGAN", "GREAT WALL", "HAVAL", "BYD", "MG", "JETOUR", "OMODA", "BESTUNE"];

function MarqueeRow({ brands, reverse = false }: { brands: string[]; reverse?: boolean }) {
  const items = [...brands, ...brands];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex gap-4 shrink-0 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ width: "max-content" }}
      >
        {items.map((brand, i) => (
          <div
            key={i}
            className="shrink-0 px-5 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white/60 text-sm font-bold tracking-widest whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors cursor-default"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimatedBrands() {
  return (
    <section className="py-14 bg-[#0a1628] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-semibold mb-2">Cobertura de marcas</p>
        <h3 className="text-white/60 text-base">Repuestos para todas las marcas del mercado peruano</h3>
      </div>
      <div className="space-y-4">
        <MarqueeRow brands={japaneseKorean} />
        <MarqueeRow brands={chinese} reverse />
      </div>
    </section>
  );
}
