"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MessageCircle, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  categoria: { nombre: string };
  marca: { nombre: string };
  modelosCompatibles: string[];
}

function ProductCard({ producto }: { producto: Producto }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51987654321";
  const msg = encodeURIComponent(
    `Hola, me interesa cotizar:\n• Producto: ${producto.nombre}\n• Código: ${producto.codigo}\n• Cantidad: 1\n\n¿Podría indicarme disponibilidad y precio?`
  );

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
        {producto.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-slate-300" />
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={producto.stock > 0 ? "success" : "destructive"}>
            {producto.stock > 0 ? "En stock" : "Sin stock"}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-mono">{producto.codigo}</span>
          <span className="text-xs text-slate-500">{producto.marca.nombre}</span>
        </div>
        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {producto.modelosCompatibles.slice(0, 2).join(" · ")}
          {producto.modelosCompatibles.length > 2 && " +más"}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-blue-900">
              {formatCurrency(producto.precio)}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ und</span>
          </div>
          <a
            href={`https://wa.me/${whatsapp}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="secondary">
              <MessageCircle className="h-3.5 w-3.5" />
              Cotizar
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function CatalogoDestacado() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetch("/api/productos?destacado=true&limit=6")
      .then((r) => r.json())
      .then((data) => setProductos(data.productos || []))
      .catch(console.error);
  }, []);

  return (
    <section id="catalogo" ref={ref} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
            Catálogo destacado
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mt-3">
            Piezas más <span className="text-blue-900">solicitadas</span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto">
            Solo empresas registradas acceden al catálogo completo con precios
            preferentes. Solicite su cotización directamente.
          </p>
        </motion.div>

        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto, i) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard producto={producto} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a href="#afiliacion">
            <Button size="lg">Ver catálogo completo (requiere cuenta)</Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
