import type { MetadataRoute } from "next";
import { getFormations } from "@/lib/formations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const formations = (await getFormations()) ?? [];
  const routes = [
    "",
    "/formations",
    ...formations.map((f) => `/formations/${f.slug}`),
    "/planning",
    "/securite",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/cookies",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/contact" ? 0.9 : 0.7,
  }));
}
