import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/server";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.legal.cookies.title, description: t.pages.legal.cookies.description };
}

export default async function CookiesPage() {
  const [settings, { locale, t }] = await Promise.all([getSiteSettings(), getDictionary()]);
  const L = t.pages.legal;
  // Le texte personnalisé dans l'admin est rédigé en français : il n'est affiché qu'en français.
  const text = locale === "fr" && typeof settings.cookies === "string" && settings.cookies ? settings.cookies : "";
  return (
    <>
      <PageIntro eyebrow={L.eyebrow} title={L.cookies.title} />
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          {text ? <p className="whitespace-pre-line">{text}</p> : (
            <>
              {L.cookies.sections.map(([title, body]) => (
                <section key={title}>
                  <h2 className="mb-3 font-display text-xl uppercase text-bone">{title}</h2>
                  <p>{body}</p>
                </section>
              ))}
              <Link href="/politique-de-confidentialite" className="inline-flex text-gold hover:text-bone">
                {L.cookies.link}
              </Link>
            </>
          )}
        </article>
      </section>
    </>
  );
}
