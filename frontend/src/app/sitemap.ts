import type { MetadataRoute } from "next";
import { getFormations } from "@/lib/formations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const formations = (await getFormations()) ?? [];
  const routes = [
    "",
    "/fitness-academy",
    "/formations",
    "/trouver-ma-formation",
    ...formations.map((f) => `/formations/${f.slug}`),
    "/planning",
    "/historique",
    "/securite",
    "/ak-tunisian-security-academy",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/cookies",
    "/reglement-interieur",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/contact" ? 0.9 : 0.7,
  }));
}
