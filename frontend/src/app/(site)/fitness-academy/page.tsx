import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ContactForm } from "../contact/ContactForm";
import { AcademyCourseCard } from "@/components/AcademyCourseCard";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { divisionCopy } from "@/lib/division-copy";
import { bannerPhotos } from "@/lib/images";
import { accentClassFor } from "@/lib/formation-visuals";
import { visualFor } from "@/lib/formation-visuals";
import { getFormations, trainingOptions } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { getHomeHeroVideo } from "@/lib/home-page-data";
import { pilatesPhotos } from "@/lib/images";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.pages.fitnessAcademy.title,
    description: t.pages.fitnessAcademy.metaDescription,
  };
}

export default async function FitnessAcademyPage() {
  await connection();
  const [formations, { locale, t }, heroVideo] = await Promise.all([getFormations(), getDictionary(), getHomeHeroVideo()]);
  const S = t.pages.fitnessAcademy;
  const experience = divisionCopy[locale].fitness;
  const availableTrainings = formations?.length
    ? trainingOptions(formations.map((formation) => localizeFormation(formation, locale)))
    : undefined;
  const courseVideos = {
    pilates: { embedUrls: site.facebook.pilatesVideoEmbeds },
    "personal-training": { embedUrls: site.facebook.personalTrainingVideoEmbeds },
    football: { embedUrls: site.facebook.footballVideoEmbeds },
  };
  const isCourseSlug = (slug: string): slug is keyof typeof courseVideos =>
    Object.prototype.hasOwnProperty.call(courseVideos, slug);

  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow=""
        title={S.title}
        intro={S.intro}
        videoSrc={heroVideo}
        poster={bannerPhotos[0].src}
        logo="/pics/logo.jpg"
        logoAlt="Defenders Fitness Academy"
        coursesLabel={S.programsTitle}
        showLogo={false}
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow mb-3">{S.aboutEyebrow}</p>
              <h2 className="heading-lg">{S.aboutTitle}</h2>
              <p className="mt-5 leading-relaxed text-mist">{S.aboutText}</p>
              <p className="mt-6 border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{S.sourceNote}</p>
            </Reveal>
            <Reveal delay={100} className="mt-8 flex flex-wrap gap-3">
              <a href="#inscription" className="btn btn-primary">
                {S.registrationTitle} <Icon name="arrow" className="rtl:-scale-x-100" />
              </a>
              <a href={site.instagram.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="instagram" /> {site.instagram.label}
              </a>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative min-h-[25rem] overflow-hidden border border-line bg-ink-2">
            <Image src={pilatesPhotos[0].src} alt={pilatesPhotos[0].alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
              <p className="max-w-xs font-display text-xl uppercase text-bone">{S.focusText}</p>
              <Image src="/pics/logo.jpg" alt={S.logoAlt} width={84} height={84} className="size-20 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-white/60" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="programmes" className="border-y border-line bg-ink-2 py-16 lg:py-24">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow mb-3">{S.programsEyebrow}</p>
              <h2 className="heading-lg">{S.programsTitle}</h2>
            </div>
            <a href={site.facebook.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="facebook" /> {S.profile}
            </a>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {S.programs.map((program, index) => {
              if (!isCourseSlug(program.slug)) {
                throw new Error(`Unknown Fitness Academy course: ${program.slug}`);
              }
              const media = courseVideos[program.slug];
              const detailsHref = program.slug === "personal-training" ? "/personal-training" : `/formations/${program.slug}`;
              return (
                <Reveal key={program.slug} delay={index * 70} className={`flex flex-col gap-3 ${accentClassFor(program.slug)}`}>
                  <AcademyCourseCard
                    title={program.title}
                    text={program.text}
                    href={detailsHref}
                    action={S.courseDetailsLink}
                    poster={visualFor(program.slug).cover.src}
                    videoEmbedUrl={media.embedUrls[0]}
                    accentClassName={accentClassFor(program.slug)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="equipe" className="border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <Reveal>
              <p className="eyebrow mb-3">{S.trainersEyebrow}</p>
              <h2 className="heading-lg">{S.trainersTitle}</h2>
            </Reveal>
            <Reveal delay={100} className="border border-line bg-ink p-7 sm:p-9">
              <p className="leading-relaxed text-mist">{S.trainersText}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="galerie" className="scroll-mt-24 py-16 lg:py-24">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{experience.galleryEyebrow}</p>
            <h2 className="heading-lg">{experience.galleryTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.galleryText}</p>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-3">
            {pilatesPhotos.map((photo, index) => (
              <Reveal key={photo.src.src} delay={index * 70}>
                <a href={photo.src.src} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden border border-line bg-ink">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-6 flex flex-wrap gap-3">
            <a href={site.facebook.videos} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="play" /> {S.videos}
            </a>
            <a href={site.instagram.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="instagram" /> {site.instagram.label}
            </a>
          </Reveal>
        </div>
      </section>

      <section id="temoignages" className="border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{experience.reviewsEyebrow}</p>
            <h2 className="heading-lg">{experience.reviewsTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.reviewsText}</p>
          </Reveal>
          <Reveal delay={100} className="border border-line bg-ink p-7 sm:p-9">
            <p className="leading-relaxed text-mist">{experience.reviewsEmpty}</p>
          </Reveal>
        </div>
      </section>

      <section id="historique" className="border-b border-line py-12">
        <div className="container-site flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="eyebrow mb-2">{t.nav.history}</p>
            <h2 className="font-display text-2xl uppercase">{t.history.title}</h2>
          </div>
          <Link href="/historique?academy=fitness" className="btn btn-ghost">
            {t.history.seeAll} <Icon name="arrow" className="rtl:-scale-x-100" />
          </Link>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24 py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <Reveal className="border border-line bg-ink-2 p-7 sm:p-9">
            <p className="eyebrow mb-3">{S.registrationEyebrow}</p>
            <h2 className="heading-lg">{S.registrationTitle}</h2>
            <p className="mt-5 leading-relaxed text-mist">{S.registrationText}</p>
            <div className="mt-8 space-y-4 border-t border-line pt-6 text-sm text-mist">
              <p>{site.address.lines.join(", ")}</p>
              <a href={site.phone2.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{site.phone2.label}</a>
              <a href={site.phone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{site.phone.label}</a>
              <a href={site.email.href} className="flex items-center gap-3 break-all hover:text-bone"><Icon name="mail" className="text-gold" />{site.email.label}</a>
            </div>
          </Reveal>
          <Reveal delay={120} className="border border-line bg-ink-2 p-6 sm:p-9">
            <ContactForm availableTrainings={availableTrainings} />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-ink-2 py-10">
        <div className="container-site">
          <Link href="/#filieres" className="inline-flex items-center gap-2 font-display text-sm tracking-[0.12em] text-gold uppercase hover:text-bone">
            <Icon name="arrow" className="rtl:-scale-x-100" /> {S.backToGroup}
          </Link>
        </div>
      </section>
    </div>
  );
}
