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
  // Compile Tailwind CSS v4 dans les fichiers .css via le loader Turbopack officiel.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
