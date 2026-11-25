import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ContactForm } from "../contact/ContactForm";
import { AcademyGallery, AcademyHistoryLink, AcademyProgrammes, AcademyTeam, AcademyTestimonials } from "@/components/AcademyBlocks";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getSiteMedia } from "@/lib/academy-content";
import { bannerPhotos, pilatesPhotos } from "@/lib/images";
import { getFormations, trainingOptions } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { getHeroClips } from "@/lib/home-page-data";
import { getContacts } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.fitnessAcademy.title, description: t.pages.fitnessAcademy.metaDescription };
}

export default async function FitnessAcademyPage() {
  await connection();
  const [formations, { locale, t }, heroClips, contacts, gallery] = await Promise.all([
    getFormations("fitness"),
    getDictionary(),
    getHeroClips(),
    getContacts(),
    getSiteMedia("galerie", "fitness"),
  ]);
  const S = t.pages.fitnessAcademy;
  const experience = t.divisions.fitness;
  const availableTrainings = formations?.length
    ? trainingOptions(formations.map((formation) => localizeFormation(formation, locale)))
    : undefined;
  const cover = gallery.find((m) => m.type === "image");

  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow=""
        title={S.title}
        intro={S.intro}
        clips={heroClips}
        poster={bannerPhotos[0].src}
        logo="/pics/logo-fitness-academy.jpg"
        logoAlt={S.logoAlt}
        coursesLabel={S.programsTitle}
        showLogo={false}
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Reveal from="left">
              <p className="eyebrow mb-3">{S.aboutEyebrow}</p>
              <h2 className="heading-lg">{S.aboutTitle}</h2>
              <p className="mt-5 leading-relaxed text-mist">{S.aboutText}</p>
              <p className="mt-6 border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{S.sourceNote}</p>
            </Reveal>
            <Reveal from="left" delay={100} className="mt-8 flex flex-wrap gap-3">
              <a href="#inscription" className="btn btn-primary">
                {S.registrationTitle} <Icon name="arrow" className="rtl:-scale-x-100" />
              </a>
              <a href={contacts.instagram.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="instagram" /> {contacts.instagram.label}
              </a>
            </Reveal>
          </div>

          <Reveal from="right" delay={120} className="relative min-h-[25rem] overflow-hidden border border-line bg-ink-2">
            <Image src={cover?.url ?? pilatesPhotos[0].src} alt={cover?.title ?? pilatesPhotos[0].alt} fill priority unoptimized={!!cover && !cover.url.startsWith("/pics/")} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
              <p className="max-w-xs font-display text-xl uppercase text-white">{S.focusText}</p>
              <Image src="/pics/logo-fitness-academy.jpg" alt={S.logoAlt} width={84} height={84} className="size-20 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-white/60" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="programmes" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 lg:py-24">
        <div className="container-site">
          <Reveal from="left" className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow mb-3">{S.programsEyebrow}</p>
              <h2 className="heading-lg">{S.programsTitle}</h2>
            </div>
            <a href={contacts.facebook.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="facebook" /> {S.profile}
            </a>
          </Reveal>
          <AcademyProgrammes academy="fitness" />
        </div>
      </section>

      <AcademyTeam academy="fitness" />

      <AcademyGallery
        academy="fitness"
        copy={{ eyebrow: experience.galleryEyebrow, title: experience.galleryTitle, text: experience.galleryText }}
        links={[
          { href: contacts.facebook.videos, label: S.videos, icon: "play" },
          { href: contacts.instagram.href, label: contacts.instagram.label, icon: "instagram" },
        ]}
      />

      <AcademyTestimonials
        academy="fitness"
        copy={{ eyebrow: experience.reviewsEyebrow, title: experience.reviewsTitle, text: experience.reviewsText, empty: experience.reviewsEmpty }}
      />

      <AcademyHistoryLink academy="fitness" />

      <section id="inscription" className="scroll-mt-28 py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <Reveal from="left" className="border border-line bg-ink-2 p-6 sm:p-9">
            <p className="eyebrow mb-3">{S.registrationEyebrow}</p>
            <h2 className="heading-lg">{S.registrationTitle}</h2>
            <p className="mt-5 leading-relaxed text-mist">{S.registrationText}</p>
            <div className="mt-8 space-y-4 border-t border-line pt-6 text-sm text-mist">
              <p>{contacts.address.lines.join(", ")}</p>
              <a href={contacts.phone2.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" /><span dir="ltr">{contacts.phone2.label}</span></a>
              <a href={contacts.phone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" /><span dir="ltr">{contacts.phone.label}</span></a>
              <a href={contacts.email.href} className="flex items-center gap-3 break-all hover:text-bone"><Icon name="mail" className="text-gold" />{contacts.email.label}</a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120} className="border border-line bg-ink-2 p-5 sm:p-9">
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
