import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AcademyCourseCard } from "@/components/AcademyCourseCard";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "../contact/ContactForm";
import { bannerPhotos } from "@/lib/images";
import { divisionCopy } from "@/lib/division-copy";
import { getHomeHeroVideo } from "@/lib/home-page-data";
import { getDictionary } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.pages.akAcademy.title,
    description: t.pages.akAcademy.metaDescription,
  };
}

export default async function AkTunisianSecurityAcademyPage() {
  const [{ locale, t }, heroVideo] = await Promise.all([getDictionary(), getHomeHeroVideo()]);
  const S = t.pages.akAcademy;
  const experience = divisionCopy[locale].tsa;
  const contact = site.tunisianSecurityAcademy;

  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow=""
        title={S.title}
        intro={S.intro}
        videoSrc={heroVideo}
        poster={bannerPhotos[0].src}
        logo="/pics/partners/TSA-logo.jpg"
        logoAlt={S.logoAlt}
        coursesLabel={S.courseTitle}
        showLogo={false}
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{S.aboutEyebrow}</p>
            <h2 className="heading-lg">{S.aboutTitle}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-mist">{S.aboutText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="border-s-2 border-gold bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.focusTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.focusText}</p>
              </article>
              <article className="border-s-2 border-line bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.locationTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.location}</p>
              </article>
            </div>
            <p className="mt-6 border-s-2 border-gold/50 ps-4 text-sm leading-relaxed text-mist">{S.sourceNote}</p>
          </Reveal>
          <Reveal delay={120} className="mx-auto w-full max-w-sm border border-gold/35 bg-ink-2 p-7 text-center shadow-2xl sm:p-9">
            <Image src="/pics/partners/TSA-logo.jpg" alt={S.logoAlt} width={280} height={280} priority className="mx-auto size-56 rounded-full object-contain" />
            <p className="mt-5 font-display text-sm tracking-[0.16em] text-bone uppercase">A.K Tunisian Security Academy</p>
          </Reveal>
        </div>
      </section>

      <section id="programmes" className="scroll-mt-24 border-y border-line bg-ink-2 py-16 text-bone lg:py-24">
        <div className="container-site">
          <Reveal className="mb-9 max-w-3xl">
            <p className="eyebrow mb-3">{S.courseEyebrow}</p>
            <h2 className="font-display text-3xl tracking-wide uppercase sm:text-4xl">{S.programsTitle}</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Reveal>
              <AcademyCourseCard
                title={S.courseTitle}
                text={S.courseText}
                detail={S.courseDuration}
                poster={bannerPhotos[0].src}
                videoEmbedUrl={contact.firstResponseVideos[0].embedUrl}
                videoLayout={contact.firstResponseVideos[0].layout}
                accentClassName="accent-intervention"
                href="/ak-tunisian-security-academy/formations/intervention-initiale"
                action={S.courseDetailsLink}
              />
            </Reveal>
            <Reveal delay={90}>
              <AcademyCourseCard
                title={S.k9CourseTitle}
                text={S.k9CourseText}
                detail={S.k9CourseDuration}
                poster="/pics/partners/TSA-logo.jpg"
                accentClassName="accent-k9"
                href="/ak-tunisian-security-academy/formations/k9"
                action={S.courseDetailsLink}
              />
            </Reveal>
            <Reveal delay={180}>
              <AcademyCourseCard
                title={S.closeProtectionTitle}
                text={S.closeProtectionText}
                detail={S.durationToConfirm}
                poster="/pics/partners/TSA-logo.jpg"
                videoEmbedUrl={contact.closeProtectionVideos[0].embedUrl}
                videoLayout={contact.closeProtectionVideos[0].layout}
                accentClassName="accent-protection"
                href="/ak-tunisian-security-academy/formations/protection-rapprochee"
                action={S.courseDetailsLink}
              />
            </Reveal>
          </div>
          <Reveal id="course-details" className="mt-6 scroll-mt-24 border border-line bg-ink p-6 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="eyebrow mb-2">{S.focusTitle}</p>
                <h3 className="font-display text-2xl uppercase">{S.courseTitle}</h3>
              </div>
              <span className="border border-line px-3 py-2 font-display text-sm text-gold">{S.courseDuration}</span>
            </div>
            <div className="mt-6">
              <ul className="grid gap-4 text-sm text-mist sm:grid-cols-2">
                {S.courseTopics.map((topic, index) => (
                  <li key={topic} className="flex items-start gap-3 border-t border-line pt-4">
                    <span className="font-display text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{S.coursePractical}</p>
            </div>
          </Reveal>
          <Reveal id="k9-programme" className="mt-6 scroll-mt-24 border border-line bg-ink p-6 sm:p-9">
            <p className="eyebrow mb-2">{S.k9CourseEyebrow}</p>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <h3 className="font-display text-2xl uppercase">{S.k9CourseTitle}</h3>
              <span className="border border-line px-3 py-2 font-display text-sm text-gold">{S.k9CourseDuration}</span>
            </div>
            <p className="mt-5 max-w-3xl leading-relaxed text-mist">{S.k9CourseText}</p>
            <ul className="mt-6 grid gap-4 text-sm text-mist sm:grid-cols-3">
              {S.k9CourseTopics.map((topic, index) => (
                <li key={topic} className="flex items-start gap-3 border-t border-line pt-4">
                  <span className="font-display text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{S.k9CoursePractical}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <a href={contact.k9Contact.href} className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-bone">
                <Icon name="phone" width={16} height={16} /> {S.k9CourseContact}: {contact.k9Contact.label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="equipe-pedagogique" className="border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{S.trainersEyebrow}</p>
            <h2 className="heading-lg">{S.trainersTitle}</h2>
          </Reveal>
          <Reveal delay={100} className="border border-line bg-ink p-7 sm:p-9">
            <p className="leading-relaxed text-mist">{S.trainersText}</p>
          </Reveal>
        </div>
      </section>

      <section id="galerie" className="border-b border-line py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{experience.galleryEyebrow}</p>
            <h2 className="heading-lg">{experience.galleryTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.noGalleryText}</p>
          </Reveal>
          <Reveal delay={100} className="flex min-h-56 flex-wrap items-center justify-center gap-3 border border-dashed border-line bg-ink-2 p-8">
            <a href={contact.facebook} target="_blank" rel="noreferrer" className="btn btn-primary">
              <Icon name="facebook" /> {S.profile}
            </a>
            <a href={contact.videos} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Icon name="play" /> {S.videos}
            </a>
          </Reveal>
        </div>
      </section>

      <section id="temoignages" className="scroll-mt-24 border-b border-line bg-ink-2 py-16 lg:py-20">
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
          <Link href="/historique?academy=tsa" className="btn btn-ghost">
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
              <p>{contact.address.join(", ")}</p>
              <a href={contact.phone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{contact.phone.label}</a>
              <a href={contact.trainingPhone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" />{contact.trainingPhone.label}</a>
              <a href={contact.email.href} className="flex items-center gap-3 break-all hover:text-bone"><Icon name="mail" className="text-gold" />{contact.email.label}</a>
            </div>
          </Reveal>
          <Reveal delay={120} className="border border-line bg-ink-2 p-6 sm:p-9">
            <ContactForm variant="inquiry" inquiryCopy={S.registrationForm} />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-10">
        <div className="container-site">
          <Link href="/#filieres" className="inline-flex items-center gap-2 font-display text-sm tracking-[0.12em] text-gold uppercase hover:text-bone">
            <Icon name="arrow" className="rtl:-scale-x-100" /> {S.backToGroup}
          </Link>
        </div>
      </section>
    </div>
  );
}
