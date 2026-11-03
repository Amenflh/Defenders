import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produit .next/standalone : un serveur Node minimal, idéal pour l'image Docker.
  output: "standalone",
  poweredByHeader: false,
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
