import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/server";
import { getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.legal.privacy.title, description: t.pages.legal.privacy.description };
}

export default async function PrivacyPage() {
  const [settings, { locale, t }] = await Promise.all([getSiteSettings(), getDictionary()]);
  const L = t.pages.legal;
  // Le texte personnalisé dans l'admin est rédigé en français : il n'est affiché qu'en français.
  const text = locale === "fr" && typeof settings.privacy === "string" && settings.privacy ? settings.privacy : "";
  return (
    <>
      <PageIntro eyebrow={L.eyebrow} title={L.privacy.title}>
        {L.privacy.intro}
      </PageIntro>
      <section className="py-16 lg:py-20">
        <article className="container-site max-w-4xl space-y-8 text-sm leading-7 text-mist">
          {text ? <p className="whitespace-pre-line">{text}</p> : (
            <>
              {L.privacy.sections.map(([title, body]) => (
                <Section key={title} title={title}><p>{body}</p></Section>
              ))}
              <Section title={L.privacy.rightsTitle}>
                <p>{L.privacy.rights} <a href={site.email.href} className="text-gold hover:text-bone">{site.email.label}</a>.</p>
              </Section>
            </>
          )}
        </article>
      </section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl uppercase text-bone">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
