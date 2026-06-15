import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nosotros } from "@/components/landing/Nosotros";
import { Beneficios } from "@/components/landing/Beneficios";
import { Sectores } from "@/components/landing/Sectores";
import { ProcesoAfiliacion } from "@/components/landing/ProcesoAfiliacion";
import { CatalogoDestacado } from "@/components/landing/CatalogoDestacado";
import { AfiliacionSection } from "@/components/landing/AfiliacionSection";
import { FAQ } from "@/components/landing/FAQ";
import { MetodosPago } from "@/components/landing/MetodosPago";
import { Contacto } from "@/components/landing/Contacto";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { AnimatedBrands } from "@/components/landing/AnimatedBrands";
import { VehicleShowcase } from "@/components/landing/VehicleShowcase";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AnimatedBrands />
        <Nosotros />
        <VehicleShowcase />
        <Beneficios />
        <CatalogoDestacado />
        <MetodosPago />
        <Sectores />
        <ProcesoAfiliacion />
        <AfiliacionSection />
        <FAQ />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
