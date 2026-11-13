import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { divisionCopy } from "@/lib/division-copy";
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
    <div className="branch-theme-security">
      <PageIntro
        eyebrow="Defenders Security Protection · Hammamet"
        title={S.title}
      >
        {S.intro}
      </PageIntro>

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

      <section id="security-quote" className="scroll-mt-24 border-y border-line py-20 lg:py-24">
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

      <section className="border-y border-line bg-ink-2 py-20 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow mb-3">{S.programmeEyebrow}</p>
            <h2 className="heading-lg">{S.programmeTitle}</h2>
            <p className="mt-5 max-w-xl text-mist">{S.programmeText}</p>
            <a
              href="https://acrobat.adobe.com/id/urn:aaid:sc:EU:42ab2b8c-bc1a-4c97-8286-b7da59f35486"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-7"
            >
              {S.download} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-line bg-ink p-7 sm:p-8">
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
            </div>
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
    </div>
  );
}
