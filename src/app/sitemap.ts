import { MetadataRoute } from "next";
import { getMarcas, allModeloParams } from "@/lib/repuestos";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.pekinglobalparts.com";
  const now = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/repuestos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#marcas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const marcas: MetadataRoute.Sitemap = getMarcas().map(m => ({
    url: `${base}/repuestos/${m.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7,
  }));

  const modelos: MetadataRoute.Sitemap = allModeloParams().map(({ marca, modelo }) => ({
    url: `${base}/repuestos/${marca}/${modelo}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6,
  }));

  return [...estaticas, ...marcas, ...modelos];
}
