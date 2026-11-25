import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { ScrollStory, type StoryItem } from "@/components/ScrollStory";
import { HomeHero } from "@/components/HomeHero";
import { bannerPhotos } from "@/lib/images";
import { formationHref } from "@/lib/academies";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedAccent } from "@/components/AnimatedAccent";
import { BannerMarquee } from "@/components/BannerMarquee";
import { TestimonialCards } from "@/components/AcademyBlocks";
import { GalleryMarquee } from "@/components/GalleryMarquee";
import { VideoEmbed } from "@/components/VideoEmbed";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BranchesSection } from "@/components/AcademySections";
import { HighlightsSection } from "@/components/HighlightsSection";
import { accentClassFor, visualFor } from "@/lib/formation-visuals";
import { PartnersMarquee } from "@/components/PartnersMarquee";
import { HomeContactButton } from "@/components/HomeContactButton";
import { getHeroClips, getHomePageData } from "@/lib/home-page-data";

/** Domaines d'activité (bloc « À propos ») dans la langue active. */
const domain = (t: Dictionary): StoryItem[] =>
  t.home.domain.map((item, i) => ({
    id: ["formation-continue", "coaching-prive", "sciences-du-sport", "certification"][i] ?? `domaine-${i}`,
    label: item.label,
    title: item.title,
    body: <p>{item.body}</p>,
    points: item.points,
  }));

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const inscriptionSuccess = params.inscription === "success";
  const {
    locale,
    t,
    contacts,
    testimonials,
    promotions,
    videos,
    testimonialVideos,
    banner,
    formationsCms,
    partners,
    rotatingFormationNames,
    approval,
    certificationLabel,
    brandName,
    brandDescriptor,
    heroDescription,
    heroLead,
    visibleFaqs,
    sectionOrder,
    sectionEnabled,
    inquiryCopy,
  } = await getHomePageData();
  const heroClips = await getHeroClips();
  const bannerImages = banner.filter((item) => item.type === "image").map((item) => ({ src: item.url, alt: item.title }));
  const contactButton = (className = "btn btn-ghost") => inquiryCopy.contactPopupEnabled
    ? <HomeContactButton
        className={className}
        label={inquiryCopy.contactPopupButtonLabel}
        popupTitle={inquiryCopy.contactPopupTitle}
        copy={{
          firstNameLabel: inquiryCopy.contactFirstNameLabel,
          lastNameLabel: inquiryCopy.contactLastNameLabel,
          emailLabel: inquiryCopy.contactEmailLabel,
          phoneLabel: inquiryCopy.contactPhoneLabel,
          messageLabel: inquiryCopy.contactMessageLabel,
          messagePlaceholder: inquiryCopy.contactMessagePlaceholder,
          consentText: inquiryCopy.contactConsentText,
          submitLabel: inquiryCopy.contactSubmitLabel,
        }}
      />
    : null;

  return (
    <>
      {inscriptionSuccess && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-gold bg-ink-2 px-5 py-4 text-center text-sm text-bone shadow-2xl">
          {t.home.successToast}
        </div>
      )}
      <div className="flex flex-col">
      <HomeHero
        order={sectionOrder("hero")}
        enabled={sectionEnabled("hero")}
        clips={heroClips}
        certificationLabel={certificationLabel}
        approval={approval}
        brandName={brandName}
        brandDescriptor={brandDescriptor}
        description={heroDescription}
        lead={heroLead}
        formationNames={rotatingFormationNames}
        t={t}
        contactButton={contactButton()}
      />

      {/* ---------------- LES FILIÈRES ---------------- */}
      <section id="filieres" style={{ order: sectionOrder("branches") }} hidden={!sectionEnabled("branches")} className="border-b border-line py-20 lg:py-24">
        <BranchesSection t={t} formations={formationsCms} />
      </section>

      {/* ---------------- POINTS FORTS : MÉDECINS, EXCLUSIVITÉ ---------------- */}
      <section id="engagements" style={{ order: sectionOrder("highlights") }} hidden={!sectionEnabled("highlights")} className="border-b border-line py-20 lg:py-24">
        <HighlightsSection t={t} approval={approval} documents={contacts.documents} />
      </section>

      {/* ---------------- PROMOTIONS ---------------- */}
      <section id="galerie" style={{ order: sectionOrder("promotions") }} hidden={!sectionEnabled("promotions")} className="border-b border-line bg-ink-2 py-12 lg:py-16" aria-label="Promotions">
        <div className="container-site mb-8">
          <Reveal from="left">
            <p className="eyebrow mb-3">{t.home.promotionsEyebrow}</p>
            <h2 className="heading-lg">{t.home.promotionsTitle}</h2>
          </Reveal>
        </div>
        {promotions.length > 0 ? (
          <div className={`container-site mx-auto grid gap-px border border-line bg-line ${
            promotions.length === 1 ? "max-w-3xl grid-cols-1" : promotions.length === 2 ? "max-w-5xl sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {promotions.map((promotion) => {
              const href = promotion.linkUrl.trim();
              const validHref = /^(https?:\/\/|\/(?!\/))/i.test(href);
              const external = /^https?:\/\//i.test(href);
              const card = (
                <>
                  {promotion.imageUrl ? <Image src={promotion.imageUrl} alt={promotion.title} fill unoptimized sizes="(min-width:768px) 33vw, 100vw" className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-55" /> : <div className="absolute inset-0 bg-gradient-to-br from-gold/25 via-ink-2 to-ink" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-bone"><p className="text-xs text-gold">{promotion.subtitle}</p><h3 className="mt-2 font-display text-2xl uppercase">{promotion.title}</h3>{promotion.body && <p className="mt-3 text-sm text-bone/80">{promotion.body}</p>}</div>
                </>
              );
              const className = "group relative block min-h-72 overflow-hidden bg-ink";
              if (!validHref) return <article key={promotion.id} className={className}>{card}</article>;
              if (external) return <a key={promotion.id} href={href} target="_blank" rel="noopener noreferrer" className={className}>{card}</a>;
              return <Link key={promotion.id} href={href} className={className}>{card}</Link>;
            })}
          </div>
        ) : bannerImages.length > 0 ? <GalleryMarquee photos={bannerImages} label={t.home.promotionsTitle} duration={70} /> : <BannerMarquee photos={bannerPhotos} duration={70} />}
      </section>

      {/* ---------------- DOMAINE D'ACTIVITÉ (scroll) ---------------- */}
      <section id="a-propos" style={{ order: sectionOrder("about") }} hidden={!sectionEnabled("about")} className="border-b border-line py-24 lg:py-32">
        <div className="container-site">
          <Reveal from="left" className="mb-16 max-w-3xl lg:mb-8">
            <p className="eyebrow mb-3">{t.home.aboutEyebrow}</p>
            <h2 className="heading-lg">
              {t.home.aboutTitle[0]} <span className="text-gold">{t.home.aboutTitle[1]}</span>
            </h2>
            <p className="mt-6 text-lg text-mist">
              <strong className="font-medium text-bone">{brandName} {brandDescriptor}</strong> {t.home.aboutText}
            </p>
          </Reveal>
          <ScrollStory items={domain(t)} />
        </div>
      </section>

      {/* ---------------- VIDÉOS ---------------- */}
      <section style={{ order: sectionOrder("videos") }} hidden={!sectionEnabled("videos") || videos.length === 0} className="border-b border-line bg-ink py-20 lg:py-24" aria-label="Vidéos de l'académie">
        <div className="container-site">
          <Reveal from="left" className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">{t.home.videosEyebrow}</p>
            <h2 className="heading-lg">{t.home.videosTitle}</h2>
          </Reveal>
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map(({ id, url, title }, index) => (
              <Reveal key={id} from={(["left", "up", "right"] as const)[index % 3]} delay={index * 120} className="video-card mx-auto flex w-full max-w-[360px] flex-col border border-line bg-ink-2">
                <VideoEmbed url={url} title={title || t.pages.video.fallbackTitle} />
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <p className="font-display text-sm uppercase text-gold-soft">{title || t.pages.video.fallbackTitle}</p>
                  <Link href="/contact" className="shrink-0 font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-bone">
                    {t.pages.video.register} <Icon name="arrow" className="inline rtl:-scale-x-100" width={14} height={14} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SECURITY PROTECTION ---------------- */}
      <section style={{ order: sectionOrder("security") }} hidden={!sectionEnabled("security")} className="border-b border-line bg-ink-2 py-20 lg:py-24" aria-labelledby="home-security-title">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <Reveal from="left">
            {/* Sécurité & protection : activité de la Tunisian Security Academy, jamais présentée comme une filière séparée. */}
            <p className="eyebrow mb-3">{t.home.securityEyebrow}</p>
            <h2 id="home-security-title" className="heading-lg">Tunisian Security Academy</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-mist">{t.home.securityText}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/tunisian-security-academy#securite" className="btn btn-primary">
                {t.home.securityCta} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <a href={contacts.whatsapp.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="phone" /> WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {t.home.securityCards.map(([title, text]) => (
                <div key={title} className="group bg-ink-2 p-5 transition-colors duration-300 hover:bg-ink-3 sm:p-7">
                  <Icon name="shield" className="text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
                  <h3 className="mt-4 font-display text-lg uppercase text-bone">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist sm:text-sm">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- FORMATIONS ---------------- */}
      <section id="formations" style={{ order: sectionOrder("formations") }} hidden={!sectionEnabled("formations")} className="border-b border-line bg-ink-2 py-24 lg:py-32">
        <div className="container-site">
          <Reveal from="left" className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3">{t.home.formationsEyebrow}</p>
              <h2 className="heading-lg">{t.home.formationsTitle(formationsCms.length)}</h2>
            </div>
            <div className="flex flex-wrap gap-3 self-start">
              <Link href="/formations" className="btn btn-primary">
                {t.home.allFormations} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/planning" className="btn btn-ghost">
                <Icon name="calendar" /> {t.home.seePlanning}
              </Link>
              <Link href="/trouver-ma-formation" className="btn btn-ghost">
                <Icon name="star" /> {t.home.quiz}
              </Link>
            </div>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-6">
            {formationsCms.map((formation) => ({
              ...formation,
              summary: formation.summary || formation.headline,
              cover: formation.coverUrl ? { src: formation.coverUrl, alt: t.pages.formation.imageAlt(formation.name) } : visualFor(formation.accent).cover,
            })).map((d, i) => (
              <Reveal key={d.slug} from={(["left", "up", "right"] as const)[i % 3]} delay={(i % 3) * 120} className={`w-full sm:w-[calc(50%-0.75rem)] ${formationsCms.length > 6 ? "lg:w-[calc(25%-1.125rem)]" : "lg:w-[calc(33.333%-1rem)]"} ${accentClassFor(d.accent)}`}>
                <Link href={formationHref(d)} className="group relative block aspect-[4/5] overflow-hidden bg-black transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(205,180,140,0.16)]">
                  <Image
                    src={d.cover.src}
                    alt={d.cover.alt}
                    fill
                    placeholder={typeof d.cover.src === "string" ? "empty" : "blur"}
                    unoptimized={typeof d.cover.src === "string" && !d.cover.src.startsWith("/pics/")}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="mb-4 block h-1 w-12 bg-gold transition-all duration-500 group-hover:w-24" />
                    <h3 className={`font-display tracking-wide uppercase ${formationsCms.length > 6 ? "text-2xl" : "text-3xl"}`}>{d.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/85 transition-all duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">{d.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] uppercase">
                      {t.home.discover} <Icon name="arrow" className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PUBLIC ET PARCOURS ---------------- */}
      <section style={{ order: sectionOrder("method") }} hidden={!sectionEnabled("method")} className="border-y border-line bg-ink-2 py-20 lg:py-24">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <Reveal from="left">
              <p className="eyebrow mb-3">{t.home.forWhoEyebrow}</p>
              <h2 className="heading-lg">{t.home.forWhoTitle}</h2>
              <p className="mt-5 max-w-xl leading-relaxed text-mist">{t.home.forWhoText}</p>
              <ul className="mt-6 space-y-3 text-sm text-bone">
                {t.home.forWho.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Icon name="check" className="shrink-0 text-gold" /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <ol className="ms-4 border-s border-line ps-8 sm:ps-10">
              {t.home.steps.map((step, i) => (
                <Reveal as="li" key={step.title} from="right" delay={i * 100} className="relative pb-7 last:pb-0">
                  <span className="absolute -start-12 top-0 grid size-8 place-items-center border border-gold bg-ink-2 font-display text-sm text-gold sm:-start-14">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-xl uppercase">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{step.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------- TÉMOIGNAGES ---------------- */}
      <section id="temoignages" style={{ order: sectionOrder("testimonials") }} hidden={!sectionEnabled("testimonials")} className="border-b border-line py-24 lg:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <Reveal from="left">
            <p className="eyebrow mb-3">{t.home.testimonialsEyebrow}</p>
            <h2 className="heading-lg">{t.home.testimonialsTitle}</h2>
            <p className="mt-5 max-w-2xl border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{t.home.testimonialsNote}</p>
          </Reveal>
          <Reveal from="right" delay={120} className="border-t border-gold pt-6 lg:border-t-0 lg:border-s lg:pt-0 lg:ps-8">
            <Icon name="star" className="text-gold" />
            <p className="mt-4 font-display text-2xl uppercase">{t.home.shareExperience}</p>
            <a href={contacts.email.href} className="btn btn-ghost mt-6">
              {t.home.writeUs} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          </Reveal>
        </div>
        <div className="container-site mt-10">
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonialVideos.map(({ id, url, title }, index) => (
              <Reveal key={id} from={(["left", "up", "right"] as const)[index % 3]} delay={index * 120} className="video-card mx-auto w-full max-w-[360px] border border-line bg-ink-2 p-2">
                <VideoEmbed url={url} title={title || t.home.testimonialVideo(index + 1)} />
              </Reveal>
            ))}
          </div>
        </div>
        <TestimonialCards items={testimonials} />
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" style={{ order: sectionOrder("faq") }} hidden={!sectionEnabled("faq")} className="border-y border-line bg-ink-2 py-24 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal from="left">
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg">{t.home.faqTitle}</h2>
            <p className="mt-5 max-w-md text-mist">{t.home.faqText}</p>
            {contactButton("btn btn-primary mt-7")}
          </Reveal>
          <Reveal from="right" delay={120}>
            <Accordion type="single" collapsible className="border-t border-line">
              {visibleFaqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* ---------------- APPEL À L'ACTION ---------------- */}
      <section style={{ order: sectionOrder("cta") }} hidden={!sectionEnabled("cta")} className="relative isolate overflow-hidden border-b border-line py-28">
        <Image src={bannerPhotos[0].src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/60" />
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Reveal from="left">
            <h2 className="heading-lg max-w-2xl">
              {t.home.ctaTitle[0]} <AnimatedAccent className="text-gold">{t.home.ctaTitle[1]}</AnimatedAccent> {t.home.ctaTitle[2]}
            </h2>
            <p className="mt-4 max-w-xl text-mist">{t.home.ctaText}</p>
          </Reveal>
          <Reveal from="right" delay={150} className="flex flex-wrap gap-4">
            <Link href="/contact" className="btn btn-primary">
              {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
            <a href={contacts.phone.href} className="btn btn-ghost">
              <Icon name="phone" /> <span dir="ltr">{contacts.phone.label}</span>
            </a>
          </Reveal>
        </div>
      </section>
      <div style={{ order: sectionOrder("partners") }} hidden={!sectionEnabled("partners")}>
        <PartnersMarquee partners={partners} title={t.partners.title} locale={locale} />
      </div>
      </div>
    </>
  );
}
