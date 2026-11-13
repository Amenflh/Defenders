import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FormationCard } from "@/components/FormationCard";
import { Icon } from "@/components/Icon";
import { InstagramReelEmbed } from "@/components/InstagramReelEmbed";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { Unavailable } from "@/components/Unavailable";
import { isFeaturedPilatesCoursePast } from "@/lib/formation-announcements";
import { getFormations } from "@/lib/formations";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.formationsList.title, description: t.pages.formationsList.metaDescription };
}

/** Liste des formations publiées (#16). */
export default async function FormationsPage() {
  await connection();
  const [formations, { t }] = await Promise.all([getFormations(), getDictionary()]);
  const L = t.pages.formationsList;
  const featuredCourseIsPast = isFeaturedPilatesCoursePast();

  return (
    <div className="branch-theme-fitness">
      <PageIntro eyebrow={L.eyebrow} title={L.title}>
        {L.intro}
      </PageIntro>

      {formations === null ? (
        <Unavailable />
      ) : formations.length === 0 ? (
        <section className="py-20">
          <div className="container-site border border-line bg-ink-2 p-10 text-center">
            <h2 className="font-display text-2xl tracking-wide uppercase">{L.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-mist">{L.emptyText}</p>
            <Link href="/contact" className="btn btn-primary mt-6">
              {t.home.contactUs}
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-16 lg:py-24">
          <div className="container-site">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formations.map((f, i) => (
                <Reveal key={f.slug} delay={(i % 3) * 120}>
                  <FormationCard f={f} priority={i < 3} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 border border-gold/40 bg-gold/5 p-6 sm:p-8">
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <InstagramReelEmbed url={site.instagram.pilatesAnnouncementEmbed} title={L.featuredCourseTitle} />
                <div>
                  <p className="eyebrow mb-2">{L.featuredCourseEyebrow}</p>
                  <h2 className="font-display text-2xl uppercase text-bone">{L.featuredCourseTitle}</h2>
                  <p className="mt-3 max-w-3xl text-mist">{featuredCourseIsPast ? L.featuredCoursePastText : L.featuredCourseText}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="border border-gold/50 px-3 py-2 font-display text-sm text-gold">{L.featuredCourseDuration}</span>
                    <span className="border border-line px-3 py-2 font-display text-sm text-mist">
                      {featuredCourseIsPast ? L.featuredCoursePast : L.featuredCourseScheduled}
                    </span>
                  </div>
                  <a href={site.instagram.pilatesAnnouncement} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-display text-sm tracking-[0.12em] text-gold uppercase hover:text-bone">
                    <Icon name="instagram" width={16} height={16} /> {L.featuredCourseSource}
                  </a>
                </div>
              </div>
            </Reveal>
            <section className="mt-20 border-t border-line pt-16">
              <Reveal className="mb-8 max-w-3xl">
                <p className="eyebrow mb-3">{L.galleryEyebrow}</p>
                <h2 className="heading-lg">{L.galleryTitle}</h2>
                <p className="mt-5 text-mist">{L.galleryText}</p>
              </Reveal>
              <div className="grid gap-4 md:grid-cols-2">
                <Reveal>
                  <a href={site.instagram.pilatesAnnouncement} target="_blank" rel="noreferrer" className="flex h-full min-h-40 flex-col justify-between border border-line bg-ink-2 p-6 transition-colors hover:border-gold">
                    <Icon name="instagram" className="text-gold" width={26} height={26} />
                    <span className="mt-8 flex items-center justify-between gap-4 font-display text-lg uppercase">
                      {L.instagramReel}<Icon name="arrow" className="rtl:-scale-x-100" />
                    </span>
                  </a>
                </Reveal>
              </div>
            </section>
            <section className="mt-20 border-t border-line pt-16">
              <Reveal>
                <p className="eyebrow mb-3">{L.socialEyebrow}</p>
                <h2 className="heading-lg">{L.socialTitle}</h2>
                <p className="mt-5 text-mist">{L.socialText}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href={site.instagram.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    <Icon name="instagram" /> {L.instagram}
                  </a>
                </div>
              </Reveal>
            </section>
            <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border border-line bg-ink-2 p-8">
              <p className="max-w-xl text-mist">{L.hesitate}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/trouver-ma-formation" className="btn btn-ghost">
                  <Icon name="star" /> {L.quiz}
                </Link>
                <Link href="/planning" className="btn btn-ghost">
                  <Icon name="calendar" /> {t.nav.planning}
                </Link>
                <Link href="/contact" className="btn btn-primary">
                  {L.advice} <Icon name="arrow" className="rtl:-scale-x-100" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}
