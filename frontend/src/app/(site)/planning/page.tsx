import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { accentClassFor, visualFor } from "@/lib/formation-visuals";
import { getFormations, type Formation } from "@/lib/formations";
import { intlLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";
import { localizeFormation } from "@/lib/formation-i18n";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.planning.title, description: t.planning.intro };
}

const DAY_MS = 86_400_000;

/** Formations datées d'abord (de la plus proche à la plus lointaine), puis celles dont la date n'est pas fixée. */
function byDate(a: Formation, b: Formation) {
  if (a.nextSessionDate && b.nextSessionDate) return a.nextSessionDate.localeCompare(b.nextSessionDate);
  if (a.nextSessionDate) return -1;
  if (b.nextSessionDate) return 1;
  return a.position - b.position;
}

/** Planning : chaque formation a une seule date de session (saisie dans l'admin › Formations). */
export default async function PlanningPage() {
  // Rendu à chaque requête : les formations viennent de l'API et BACKEND_URL est lu à l'exécution.
  await connection();
  const [list, { locale, t }] = await Promise.all([getFormations(), getDictionary()]);
  const formations = (list ?? []).slice().sort(byDate).map((f) => localizeFormation(f, locale));
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  const day = new Intl.DateTimeFormat(intlLocale[locale], { day: "2-digit", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(intlLocale[locale], { month: "long", year: "numeric", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", timeZone: "UTC" });

  return (
    <>
      <PageIntro eyebrow={t.planning.eyebrow} title={t.planning.title}>
        {t.planning.intro}
      </PageIntro>

      <section className="py-16 lg:py-20">
        <div className="container-site">
          {list ? (
            <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {formations.map((f, i) => {
                const date = f.nextSessionDate ? new Date(`${f.nextSessionDate}T00:00:00Z`) : null;
                const daysLeft = date ? Math.round((date.getTime() - today) / DAY_MS) : null;
                const cover = f.coverUrl ? { src: f.coverUrl, alt: f.name } : visualFor(f.slug).cover;
                return (
                  <Reveal as="li" key={f.slug} delay={i * 80} className={`${accentClassFor(f.slug || f.accent)} flex flex-col border border-line bg-ink-2`}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-ink">
                      <Image src={cover.src} alt={cover.alt} fill unoptimized={typeof cover.src === "string"} sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" />
                      <span className="absolute inset-x-0 top-0 h-1 bg-gold" />
                      <h2 className="absolute inset-x-0 bottom-0 p-5 font-display text-2xl tracking-wide uppercase">{f.name}</h2>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[0.65rem] tracking-[0.18em] text-mist uppercase">{t.planning.date}</p>
                      {date ? (
                        <div className="mt-3 flex items-center gap-4">
                          <span className="grid size-16 shrink-0 place-items-center bg-gold font-display text-3xl text-ink">{day.format(date)}</span>
                          <span>
                            <span className="block font-display text-lg uppercase">{month.format(date)}</span>
                            <span className="block text-sm text-mist capitalize">{weekday.format(date)}</span>
                            <span className="mt-1 block text-xs text-gold">{daysLeft !== null && daysLeft < 0 ? t.planning.past : t.planning.daysLeft(daysLeft ?? 0)}</span>
                          </span>
                        </div>
                      ) : (
                        <p className="mt-3 flex items-center gap-3 font-display text-lg uppercase text-mist">
                          <Icon name="calendar" className="text-gold" /> {t.planning.tba}
                        </p>
                      )}

                      {f.durationLabel && (
                        <p className="mt-4 text-sm text-mist">
                          {t.planning.duration} : <span className="text-bone">{f.durationLabel}</span>
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary !px-4 !py-2.5 !text-xs">
                          {t.planning.register} <Icon name="arrow" width={16} height={16} className="rtl:-scale-x-100" />
                        </Link>
                        <Link href={`/formations/${f.slug}`} className="btn btn-ghost !px-4 !py-2.5 !text-xs">
                          {t.planning.details}
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          ) : (
            <div className="border border-line bg-ink-2 p-10 text-center">
              <Icon name="calendar" width={36} height={36} className="mx-auto text-gold" />
              <h2 className="mt-4 font-display text-2xl tracking-wide uppercase">{t.planning.unavailableTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-mist">{t.planning.unavailableText}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn btn-primary">{t.home.contactUs}</Link>
                <a href={site.phone.href} className="btn btn-ghost">{site.phone.label}</a>
              </div>
            </div>
          )}

          <p className="mt-10 text-sm text-mist">{t.planning.note}</p>
        </div>
      </section>
    </>
  );
}
