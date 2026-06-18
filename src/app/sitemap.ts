import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.pekinglobalparts.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#marcas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/#nosotros`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#servicios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
