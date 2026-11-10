import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/server";
import { getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.legal.mentions.title, description: t.pages.legal.mentions.description };
}

export default async function LegalPage() {
  const [settings, { locale, t }] = await Promise.all([getSiteSettings(), getDictionary()]);
  const L = t.pages.legal;
  // Le texte personnalisé dans l'admin est rédigé en français : il n'est affiché qu'en français.
  const text = locale === "fr" && typeof settings.mentions === "string" && settings.mentions ? settings.mentions : "";
  return (
    <>
      <PageIntro eyebrow={L.eyebrow} title={L.mentions.title} />
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          {text ? <p className="whitespace-pre-line">{text}</p> : (
            <>
              <LegalSection title={L.mentions.publisher}>
                <p>{site.name}<br />{site.address.lines.join(" — ")}</p>
              </LegalSection>
              <LegalSection title={L.mentions.contact}>
                <p><a href={site.phone.href} className="text-bone hover:text-gold" dir="ltr">{site.phone.label}</a><br />
                  <a href={site.email.href} className="text-bone hover:text-gold">{site.email.label}</a></p>
              </LegalSection>
              {L.mentions.sections.map(([title, body]) => (
                <LegalSection key={title} title={title}><p>{body}</p></LegalSection>
              ))}
            </>
          )}
        </article>
      </section>
    </>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl uppercase text-bone">{title}</h2>
      {children}
    </section>
  );
}
