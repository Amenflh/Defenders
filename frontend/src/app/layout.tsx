import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Oswald } from "next/font/google";
import { dirFor } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary } from "@/lib/i18n/server";
import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE, type Theme } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600"] });
// Police arabe : Inter et Oswald ne contiennent pas l'alphabet arabe.
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.title, description: t.meta.description, icons: { icon: "/pics/logo.jpg" } };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getDictionary();
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme: Theme = isTheme(saved) ? saved : "dark";
  return (
    <html lang={locale} dir={dirFor(locale)} data-theme={theme} className={`${inter.variable} ${oswald.variable} ${cairo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        {/* Sans JavaScript, les animations d'apparition ne doivent jamais masquer le contenu. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <I18nProvider locale={locale} theme={theme}>{children}</I18nProvider>
      </body>
    </html>
  );
}
