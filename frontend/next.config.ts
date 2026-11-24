import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

/**
 * En développement, Next.js bloque ses scripts quand le site est ouvert par une autre
 * adresse que « localhost » (ex. http://172.28.32.1:3000 ou depuis un téléphone sur le Wi-Fi).
 * On autorise donc toutes les adresses IPv4 de cette machine.
 * N'a aucun effet en production (Docker / next start).
 */
const localIPv4s = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  // Produit .next/standalone : un serveur Node minimal, idéal pour l'image Docker.
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: localIPv4s,
  // Masque le bouton « N » de Next.js en dev (il chevauchait le bouton d'inscription flottant).
  devIndicators: false,
  // Compile Tailwind CSS v4 dans les fichiers .css via le loader Turbopack officiel.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Formulaire d'inscription : pièce jointe jusqu'à 5 Mo (limite par défaut des Server Actions : 1 Mo).
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    // Images optimisées gardées 1 jour (au lieu de 60 s) : moins de recalculs AVIF/WebP, coûteux en processeur.
    minimumCacheTTL: 86_400,
  },
  // En-têtes de sécurité (toutes les pages) et cache navigateur des fichiers du dossier public.
  async headers() {
    const security = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      // Politique de contenu prudente : interdit plugins, changement de <base>, envoi de formulaires vers
      // un autre site et l'affichage du site dans un cadre étranger (sans gêner le SDK Facebook).
      // (upgrade-insecure-requests seulement en production : le serveur de dev est en HTTP.)
      {
        key: "Content-Security-Policy",
        value: `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'${process.env.NODE_ENV === "production" ? "; upgrade-insecure-requests" : ""}`,
      },
    ];
    // Fichiers publics : 1 jour en cache, puis revalidation en arrière-plan pendant 7 jours.
    const staticCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/:path*", headers: security },
      { source: "/pics/:path*", headers: staticCache },
      { source: "/videos/:path*", headers: staticCache },
    ];
  },
  // Anciennes adresses : la page Sécurité est intégrée à la Tunisian Security Academy,
  // et l'adresse de l'académie ne contient plus « ak- ».
  async redirects() {
    return [
      { source: "/securite", destination: "/tunisian-security-academy#securite", permanent: true },
      { source: "/ak-tunisian-security-academy", destination: "/tunisian-security-academy", permanent: true },
      { source: "/ak-tunisian-security-academy/:path*", destination: "/tunisian-security-academy/:path*", permanent: true },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [{ source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` }];
  },
};

export default nextConfig;
