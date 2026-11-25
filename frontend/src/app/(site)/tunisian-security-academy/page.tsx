import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AcademyGallery, AcademyHistoryLink, AcademyProgrammes, AcademyTeam, AcademyTestimonials } from "@/components/AcademyBlocks";
import { AcademyVideoHero } from "@/components/AcademyVideoHero";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { getAcademyClips } from "@/lib/academy-content";
import { bannerPhotos } from "@/lib/images";
import { getFormations, trainingOptions } from "@/lib/formations";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { getContacts } from "@/lib/settings";
import { ContactForm } from "../contact/ContactForm";
import { SecurityQuoteForm } from "./SecurityQuoteForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.akAcademy.title, description: t.pages.akAcademy.metaDescription };
}

const LOGO = "/pics/partners/tsa-logo-eagle.jpg";

export default async function TunisianSecurityAcademyPage() {
  await connection();
  const [formations, { locale, t }, clips, contacts] = await Promise.all([getFormations("tsa"), getDictionary(), getAcademyClips("tsa"), getContacts()]);
  const S = t.pages.akAcademy;
  const Sec = t.pages.security;
  const experience = t.divisions.tsa;
  const contact = contacts.tunisianSecurityAcademy;
  const availableTrainings = formations?.length
    ? trainingOptions(formations.map((formation) => localizeFormation(formation, locale)))
    : undefined;

  return (
    <div className="branch-theme">
      <AcademyVideoHero
        eyebrow=""
        title={S.title}
        intro={S.intro}
        clips={clips}
        poster={bannerPhotos[0].src}
        logo={LOGO}
        logoAlt={S.logoAlt}
        coursesLabel={S.programsTitle}
        showLogo={false}
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal from="left">
            <p className="eyebrow mb-3">{S.aboutEyebrow}</p>
            <h2 className="heading-lg">{S.aboutTitle}</h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-mist">{S.aboutText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <article className="border-s-2 border-gold bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.focusTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.focusText}</p>
              </article>
              <article className="border-s-2 border-gold bg-ink-2 p-5">
                <p className="eyebrow mb-2">{S.locationTitle}</p>
                <p className="text-sm leading-relaxed text-mist">{S.location}</p>
              </article>
            </div>
            <p className="mt-6 border-s-2 border-gold/50 ps-4 text-sm leading-relaxed text-mist">{S.sourceNote}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inscription" className="btn btn-primary">
                {S.registrationTitle} <Icon name="arrow" className="rtl:-scale-x-100" />
              </a>
              <a href={contact.facebook} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="facebook" /> {S.profile}
              </a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120} className="mx-auto w-full max-w-sm border border-gold/35 bg-ink-2 p-7 text-center shadow-2xl sm:p-9">
            <Image src={LOGO} alt={S.logoAlt} width={280} height={280} priority className="mx-auto size-56 rounded-full object-contain" />
            <p className="mt-5 font-display text-sm tracking-[0.16em] text-bone uppercase">Tunisian Security Academy</p>
          </Reveal>
        </div>
      </section>

      <section id="programmes" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 text-bone lg:py-24">
        <div className="container-site">
          <Reveal from="left" className="mb-10 max-w-3xl">
            <p className="eyebrow mb-3">{S.courseEyebrow}</p>
            <h2 className="heading-lg">{S.programsTitle}</h2>
          </Reveal>
          <AcademyProgrammes academy="tsa" />
        </div>
      </section>

      <AcademyTeam academy="tsa" />

      <AcademyGallery
        academy="tsa"
        copy={{ eyebrow: experience.galleryEyebrow, title: experience.galleryTitle, text: experience.galleryText }}
        links={[
          { href: contact.videos, label: S.videos, icon: "play" },
          { href: contact.facebook, label: S.profile, icon: "facebook" },
          ...(contact.instagram ? [{ href: contact.instagram, label: "Instagram", icon: "instagram" as const }] : []),
        ]}
      />

      <AcademyTestimonials
        academy="tsa"
        copy={{ eyebrow: experience.reviewsEyebrow, title: experience.reviewsTitle, text: experience.reviewsText, empty: experience.reviewsEmpty }}
      />

      <AcademyHistoryLink academy="tsa" />

      {/* ---------------- SERVICES ET DEVIS : DEFENDERS SECURITY PROTECTION (ancienne page /securite) ---------------- */}
      <section id="securite" className="scroll-mt-28 py-16 lg:py-24" aria-label="Defenders Security Protection">
        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch">
          <Reveal from="left" className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden border border-gold/35 bg-gradient-to-br from-ink-3 via-ink-2 to-ink p-8 text-center">
            <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,151,73,0.17),transparent_65%)]" />
            <Image src={LOGO} alt={S.logoAlt} width={208} height={208} className="relative z-10 size-40 rounded-full bg-white object-contain p-2 ring-1 ring-white/20 sm:size-48" />
            <p className="relative z-10 mt-5 font-display text-sm tracking-[0.18em] text-gold uppercase">Defenders Security Protection</p>
            <div className="relative z-10 mt-7 space-y-4 text-start text-sm">
              {[contacts.phone2, contacts.phone].map((phone) => (
                <a key={phone.href} href={phone.href} className="flex items-center gap-3 text-mist hover:text-bone"><Icon name="phone" className="text-gold" /><span dir="ltr">{phone.label}</span></a>
              ))}
              <a href={contacts.whatsapp.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-mist hover:text-bone"><Icon name="chat" className="text-gold" />WhatsApp</a>
              <a href={contacts.securityEmail.href} className="flex items-center gap-3 break-all text-mist hover:text-bone"><Icon name="mail" className="text-gold" />{contacts.securityEmail.label}</a>
            </div>
            <a href={contacts.securityPortal} target="_blank" rel="noreferrer" className="btn btn-ghost relative z-10 mt-7 !px-4">
              <Icon name="arrow" className="rtl:-scale-x-100" /> {Sec.portal}
            </a>
          </Reveal>

          <div className="border border-line bg-ink-2 p-6 sm:p-10">
            <Reveal from="left" className="mb-8 max-w-3xl">
              <p className="eyebrow mb-3">{Sec.servicesEyebrow}</p>
              <h2 className="heading-lg">{Sec.servicesTitle}</h2>
              <p className="mt-5 leading-relaxed text-mist">{Sec.servicesNote}</p>
            </Reveal>
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {Sec.services.map((service, index) => (
                <Reveal from={(["left", "up", "right"] as const)[index % 3]} key={service.title} delay={index * 60} className="h-full bg-ink-2 p-6 sm:p-7">
                  <span className="font-display text-xs tracking-[0.14em] text-gold">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-xl uppercase text-bone">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{service.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="securite-devis" className="scroll-mt-28 border-y border-line bg-ink-2 py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal from="left">
            <p className="eyebrow mb-3">{Sec.servicesEyebrow}</p>
            <h2 className="heading-lg">{Sec.quoteForm.title}</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-mist">{Sec.quoteForm.description}</p>
          </Reveal>
          <Reveal from="right" delay={120}>
            <SecurityQuoteForm copy={Sec.quoteForm} />
          </Reveal>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-28 py-16 lg:py-24">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <Reveal from="left" className="border border-line bg-ink-2 p-6 sm:p-9">
            <p className="eyebrow mb-3">{S.registrationEyebrow}</p>
            <h2 className="heading-lg">{S.registrationTitle}</h2>
            <p className="mt-5 leading-relaxed text-mist">{S.registrationText}</p>
            <div className="mt-8 space-y-4 border-t border-line pt-6 text-sm text-mist">
              <p>{contact.address.join(", ")}</p>
              <a href={contact.phone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" /><span dir="ltr">{contact.phone.label}</span></a>
              <a href={contact.trainingPhone.href} className="flex items-center gap-3 hover:text-bone"><Icon name="phone" className="text-gold" /><span dir="ltr">{contact.trainingPhone.label}</span></a>
              <a href={contact.email.href} className="flex items-center gap-3 break-all hover:text-bone"><Icon name="mail" className="text-gold" />{contact.email.label}</a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120} className="border border-line bg-ink-2 p-5 sm:p-9">
            <ContactForm availableTrainings={availableTrainings} />
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
