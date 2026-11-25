import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/server";
import { dirFor } from "@/lib/i18n/config";
import { getContacts } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  const rules = t.internalRules;
  return { title: rules.title, description: rules.description };
}

export default async function InternalRulesPage() {
  const { locale, t } = await getDictionary();
  const contacts = await getContacts();
  const rules = t.internalRules;

  return (
    <>
      <PageIntro eyebrow={t.pages.legal.eyebrow} title={rules.title}>
        {rules.intro}
      </PageIntro>
      <section className="py-16 lg:py-20">
        <article
          className={`container-site max-w-4xl space-y-8 text-sm leading-7 text-mist ${locale === "ar" ? "font-[family-name:var(--font-cairo)]" : ""}`}
          dir={dirFor(locale)}
          lang={locale}
        >
          <ol className="space-y-6">
            {rules.clauses.map((clause, index) => (
              <li key={index} className="flex items-start gap-4">
                <span className="shrink-0 font-display text-bone">
                  {rules.chapterLabel} {index + 1}
                </span>
                <p>{clause}</p>
              </li>
            ))}
          </ol>
          <a
            href={contacts.documents.rules}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-gold hover:text-bone"
          >
            {t.form.rules.download}
          </a>
        </article>
      </section>
    </>
  );
}
