import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AcademyCourseCard } from "@/components/AcademyCourseCard";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { FacebookVideoEmbed } from "@/components/FacebookVideoEmbed";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { divisionCopy } from "@/lib/division-copy";
import { bannerPhotos } from "@/lib/images";
import { site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/server";
import { SecurityQuoteForm } from "./SecurityQuoteForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: "Defenders Security Protection", description: t.pages.security.metaDescription };
}

export default async function SecurityPage() {
  const { locale, t } = await getDictionary();
  const S = t.pages.security;
  const experience = divisionCopy[locale].security;
  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow=""
        title={S.title}
        intro={S.intro}
        facebookVideoUrl={site.securityHeroVideo}
        poster={bannerPhotos[0].src}
        logo="/pics/partners/DSP-logo.jpg"
        logoAlt="Defenders Security Protection"
        coursesLabel={S.programmeTitle}
        showLogo={false}
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <Reveal className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden border border-gold/35 bg-gradient-to-br from-ink-3 via-ink-2 to-ink p-8 text-center">
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,151,73,0.17),transparent_65%)]" />
            <Image src="/pics/partners/DSP-logo.jpg" alt="Defenders Security Protection logo" width={208} height={208} className="relative z-10 size-40 rounded-full bg-white object-contain p-2 ring-1 ring-white/20 sm:size-48" />
            <p className="relative z-10 mt-5 font-display text-sm tracking-[0.18em] text-gold uppercase">Defenders Security Protection</p>
          </Reveal>

          <div className="border border-line bg-ink-2 p-7 sm:p-10">
            <Reveal className="mb-8 max-w-3xl">
              <p className="eyebrow mb-3">{S.servicesEyebrow}</p>
              <h2 className="heading-lg">{S.servicesTitle}</h2>
              <p className="mt-5 leading-relaxed text-mist">{S.servicesNote}</p>
            </Reveal>
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {S.services.map((service, index) => (
                <Reveal key={service.title} delay={index * 60} className="h-full bg-ink-2 p-6 sm:p-7">
                  <span className="font-display text-xs tracking-[0.14em] text-gold">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-xl uppercase text-bone">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{service.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink-2 py-16 lg:py-20">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow mb-3">{S.servicesEyebrow}</p>
            <h2 className="heading-lg">{S.closeProtectionTitle}</h2>
            <p className="mt-5 leading-relaxed text-mist">{S.closeProtectionText}</p>
            <Link href="/ak-tunisian-security-academy/formations/protection-rapprochee" className="btn btn-primary mt-7">
              {t.pages.akAcademy.courseDetailsLink} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          </Reveal>
          <Reveal delay={100} className="mt-8 grid items-start gap-6 md:grid-cols-2">
            {site.tunisianSecurityAcademy.closeProtectionVideos.map(({ embedUrl, layout }, index) => (
              <div key={embedUrl} className="mx-auto w-full max-w-2xl overflow-hidden border border-line bg-black p-2">
                <FacebookVideoEmbed url={embedUrl} layout={layout} title={`${S.closeProtectionTitle} ${index + 1}`} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="programmes" className="scroll-mt-24 border-y border-line bg-ink-2 py-16 lg:py-24">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-start">
          <Reveal>
            <AcademyCourseCard
              title={S.programmeTitle}
              text={S.programmeText}
              detail={S.programmeEyebrow}
              poster={bannerPhotos[0].src}
              href="https://acrobat.adobe.com/id/urn:aaid:sc:EU:42ab2b8c-bc1a-4c97-8286-b7da59f35486"
              action={S.download}
              external
            />
          </Reveal>

          <Reveal delay={120} className="border border-line bg-ink p-7 sm:p-8">
            <h3 className="font-display text-2xl uppercase text-bone">{S.infoTitle}</h3>
            <div className="mt-6 space-y-5">
              <a href={site.phone2.href} className="flex items-center gap-4 text-mist hover:text-bone">
                <Icon name="phone" className="text-gold" />
                {site.phone2.label}
              </a>
              <a href={site.phone.href} className="flex items-center gap-4 text-mist hover:text-bone">
                <Icon name="phone" className="text-gold" />
                {site.phone.label}
              </a>
              <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-mist hover:text-bone">
                <Icon name="phone" className="text-gold" />
                WhatsApp · {site.phone2.label}
              </a>
              <a href={site.email.href} className="flex items-center gap-4 break-all text-mist hover:text-bone">
                <Icon name="mail" className="text-gold" />
                {site.email.label}
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={site.securityPortal} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4">
                <Icon name="arrow" className="rtl:-scale-x-100" /> {S.portal}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="equipe" className="border-y border-line bg-ink-2 py-16 lg:py-20">
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

      <section id="galerie" className="border-y border-line py-16 lg:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{experience.galleryEyebrow}</p>
            <h2 className="heading-lg">{experience.galleryTitle}</h2>
            <p className="mt-4 leading-relaxed text-mist">{experience.galleryText}</p>
          </Reveal>
          <Reveal delay={100} className="flex min-h-56 flex-col items-center justify-center border border-dashed border-line bg-ink-2 p-8 text-center">
            <Icon name="shield" width={32} height={32} className="text-gold" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">{experience.noGalleryText}</p>
            <a href={site.securityPortal} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-bone">
              {S.portal} <Icon name="arrow" className="rtl:-scale-x-100" />
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
          <Link href="/historique?academy=security" className="btn btn-ghost">
            {t.history.seeAll} <Icon name="arrow" className="rtl:-scale-x-100" />
          </Link>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24 border-y border-line py-16 lg:py-24">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="eyebrow mb-3">{S.servicesEyebrow}</p>
            <h2 className="heading-lg">{S.quoteForm.title}</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-mist">{S.quoteForm.description}</p>
            <p className="mt-5 border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{S.servicesNote}</p>
          </Reveal>
          <Reveal delay={120}>
            <SecurityQuoteForm copy={S.quoteForm} />
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
