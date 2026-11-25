import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Oswald } from "next/font/google";
import { dirFor } from "@/lib/i18n/config";
import { formationHref, type Academy } from "@/lib/academies";
import { localize, type Translations } from "@/lib/formation-i18n";
import { I18nProvider, type SiteData } from "@/lib/i18n/client";
import { getDictionary } from "@/lib/i18n/server";
import { getContacts, getFaqs, getPublishedFormations, getTextOverrides } from "@/lib/settings";
import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE, type Theme } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600"] });
// Police arabe : Inter et Oswald ne contiennent pas l'alphabet arabe.
// Pas de préchargement : elle n'est téléchargée que lorsque le site est affiché en arabe.
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.meta.title, description: t.meta.description, icons: { icon: "/pics/logo-defenders-academy-round.png" } };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getDictionary();
  type LightFormation = { id: number; slug: string; name: string; headline: string; summary: string; academy: Academy; translations?: Translations };
  const [overrides, contacts, formations, faqs] = await Promise.all([
    getTextOverrides(),
    getContacts(),
    getPublishedFormations<LightFormation>(),
    getFaqs(locale, t.home.faqs),
  ]);
  const data: SiteData = {
    contacts,
    formations: formations.map((source) => {
      const f = localize(source, locale);
      return { slug: f.slug, name: f.name, headline: f.headline, summary: f.summary, academy: f.academy, href: formationHref(f) };
    }),
    faqs,
  };
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme: Theme = isTheme(saved) ? saved : "dark";
  return (
    <html lang={locale} dir={dirFor(locale)} data-theme={theme} className={`${inter.variable} ${oswald.variable} ${cairo.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        {/* Sans JavaScript, les animations d'apparition ne doivent jamais masquer le contenu. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-wordmark] .footer-wordmark-letter{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <I18nProvider locale={locale} overrides={overrides[locale]} theme={theme} data={data}>{children}</I18nProvider>
      </body>
    </html>
  );
}
