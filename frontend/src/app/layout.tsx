import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: site.name,
  description: `${site.name} : ${site.tagline}. Formations certifiantes en Pilates, football et personal training.`,
  icons: { icon: "/pics/logo.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${oswald.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        {/* Sans JavaScript, les animations d'apparition ne doivent jamais masquer le contenu. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
