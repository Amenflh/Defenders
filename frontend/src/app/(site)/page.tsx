import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { ScrollStory, type StoryItem } from "@/components/ScrollStory";
import { HomeHero } from "@/components/HomeHero";
import { bannerPhotos } from "@/lib/images";
import { disciplineList } from "@/lib/disciplines";
import { site } from "@/lib/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedAccent } from "@/components/AnimatedAccent";
import { BannerMarquee } from "@/components/BannerMarquee";
import { trainingOptions } from "@/lib/formations";
import { VideoShowcase } from "@/components/VideoShowcase";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BranchesSection, HighlightsSection } from "@/components/AcademySections";
import { accentClassFor } from "@/lib/formation-visuals";
import { localizeFormation } from "@/lib/formation-i18n";
import { PartnersMarquee } from "@/components/PartnersMarquee";
import { HomeContactButton } from "@/components/HomeContactButton";
import { getHomePageData, localizeVideoTitle } from "@/lib/home-page-data";

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
    contactDefaults,
    locale,
    t,
    testimonialsCms,
    visiblePromotions,
    videosCms,
    formationsCms,
    partnersCms,
    rotatingFormationNames,
    approval,
    certificationLabel,
    brandName,
    brandDescriptor,
    heroDescription,
    heroLead,
    stats,
    visibleFaqs,
    sectionOrder,
    sectionEnabled,
    inquiryCopy,
  } = await getHomePageData();
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
        videoSrc={videosCms[0]?.url}
        poster={bannerPhotos[0].src.src}
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
      <section id="filieres" style={{ order: sectionOrder("branches") }} hidden={!sectionEnabled("branches")} className="py-20 lg:py-24">
        <BranchesSection t={t} />
      </section>

      {/* ---------------- CHIFFRES ---------------- */}
      <section id="statistiques" style={{ order: sectionOrder("stats") }} hidden={!sectionEnabled("stats")} className="border-y border-line bg-ink-2 py-14">
        <div className="container-site">
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {stats.map(([value, label]) => (
            <div key={label} className="bg-ink-2 px-4 py-8 text-center sm:px-6 sm:py-10">
              <AnimatedAccent className="block font-display text-4xl text-gold sm:text-5xl">{value}</AnimatedAccent>
              <p className="mt-2 font-display text-xs uppercase tracking-[0.12em] text-mist sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ---------------- POINTS FORTS : MÉDECINS, EXCLUSIVITÉ ---------------- */}
      <section id="engagements" style={{ order: sectionOrder("highlights") }} hidden={!sectionEnabled("highlights")} className="border-b border-line py-20 lg:py-24">
        <HighlightsSection t={t} approval={approval} />
      </section>

      {/* ---------------- PROMOTIONS ---------------- */}
      <section id="galerie" style={{ order: sectionOrder("promotions") }} hidden={!sectionEnabled("promotions")} className="border-b border-line bg-ink-2 py-12 lg:py-16" aria-label="Promotions">
        <div className="container-site mb-8">
          <Reveal>
            <p className="eyebrow mb-3">{t.home.promotionsEyebrow}</p>
            <h2 className="heading-lg">{t.home.promotionsTitle}</h2>
          </Reveal>
        </div>
        {visiblePromotions.length > 0 ? (
          <div className={`container-site mx-auto grid gap-px border border-line bg-line ${
            visiblePromotions.length === 1 ? "max-w-3xl grid-cols-1" : visiblePromotions.length === 2 ? "max-w-5xl sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {visiblePromotions.map((promotion) => {
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
        ) : <BannerMarquee photos={bannerPhotos} duration={70} />}
      </section>

      {/* ---------------- DOMAINE D'ACTIVITÉ (scroll) ---------------- */}
      <section id="a-propos" style={{ order: sectionOrder("about") }} hidden={!sectionEnabled("about")} className="py-24 lg:py-32">
        <div className="container-site">
          <Reveal className="mb-16 max-w-3xl lg:mb-8">
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
      <section style={{ order: sectionOrder("videos") }} hidden={!sectionEnabled("videos")} className="border-b border-line bg-ink py-20 lg:py-24" aria-label="Vidéos de l'académie">
        <div className="container-site">
          <Reveal className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">{t.home.videosEyebrow}</p>
            <h2 className="heading-lg">{t.home.videosTitle}</h2>
          </Reveal>
          {videosCms.length > 0 ? (
            <VideoShowcase
              videos={videosCms.map((video) => ({ title: localizeVideoTitle(video.title, locale, t.pages.video.fallbackTitle), src: video.url, category: video.category }))}
              trainings={formationsCms.length ? trainingOptions(formationsCms) : undefined}
              defaults={contactDefaults}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={site.facebook.videos} target="_blank" rel="noreferrer" className="flex min-h-32 items-center justify-between gap-5 border border-line bg-ink-2 p-6 transition-colors hover:border-gold">
                <span className="flex items-center gap-4">
                  <Icon name="facebook" className="shrink-0 text-gold" width={24} height={24} />
                  <span className="font-display text-lg uppercase">{t.pages.formationsList.facebookVideos}</span>
                </span>
                <Icon name="arrow" className="shrink-0 text-gold rtl:-scale-x-100" />
              </a>
              <a href={site.instagram.href} target="_blank" rel="noreferrer" className="flex min-h-32 items-center justify-between gap-5 border border-line bg-ink-2 p-6 transition-colors hover:border-gold">
                <span className="flex items-center gap-4">
                  <Icon name="instagram" className="shrink-0 text-gold" width={24} height={24} />
                  <span className="font-display text-lg uppercase">{t.pages.formationsList.instagramReel}</span>
                </span>
                <Icon name="arrow" className="shrink-0 text-gold rtl:-scale-x-100" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- SECURITY PROTECTION ---------------- */}
      <section style={{ order: sectionOrder("security") }} hidden={!sectionEnabled("security")} className="border-b border-line bg-ink-2 py-20 lg:py-24" aria-label="Defenders Security Protection">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">{t.home.securityEyebrow}</p>
            <h2 className="heading-lg">Defenders Security Protection</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-mist">{t.home.securityText}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/securite" className="btn btn-primary">
                {t.home.securityCta} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="phone" /> WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {t.home.securityCards.map(([title, text]) => (
                <div key={title} className="bg-ink-2 p-5 sm:p-7">
                  <Icon name="shield" className="text-gold" />
                  <h3 className="mt-4 font-display text-lg uppercase text-bone">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-mist sm:text-sm">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- FORMATIONS ---------------- */}
      <section id="formations" style={{ order: sectionOrder("formations") }} hidden={!sectionEnabled("formations")} className="bg-bone py-24 text-ink lg:py-32">
        <div className="container-site">
          <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3 !text-ink/60">{t.home.formationsEyebrow}</p>
              <h2 className="heading-lg">{t.home.formationsTitle(formationsCms.length)}</h2>
            </div>
            <div className="flex flex-wrap gap-3 self-start">
              <Link href="/formations" className="btn btn-dark">
                {t.home.allFormations} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/planning" className="btn btn-dark">
                <Icon name="calendar" /> {t.home.seePlanning}
              </Link>
              <Link href="/trouver-ma-formation" className="btn btn-dark">
                <Icon name="star" /> {t.home.quiz}
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {(formationsCms.length > 0 ? formationsCms.map((formation) => {
              const fallbackSource = disciplineList.find((item) => item.slug === formation.slug);
              const fallback = fallbackSource && localizeFormation(fallbackSource, locale);
              return {
                slug: formation.slug,
                name: formation.name,
                summary: formation.summary || fallback?.summary || formation.headline,
                cover: formation.coverUrl
                  ? { src: formation.coverUrl, alt: `Formation ${formation.name}` }
                  : fallback?.cover,
                accent: fallback?.accent ?? { bg: "bg-gold" },
              };
            }) : disciplineList.map((d) => ({ ...localizeFormation(d, locale) }))).map((d, i) => (
              <Reveal key={d.slug} delay={i * 120} className={accentClassFor(d.slug)}>
                <Link href={`/formations/${d.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(205,180,140,0.16)]">
                  {d.cover ? (
                    <Image
                      src={d.cover.src}
                      alt={d.cover.alt}
                      fill
                      placeholder={typeof d.cover.src === "string" ? "empty" : "blur"}
                      unoptimized={typeof d.cover.src === "string"}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-ink to-ink" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-bone">
                    <span className="mb-4 block h-1 w-12 bg-gold transition-all duration-500 group-hover:w-24" />
                    <h3 className="font-display text-3xl tracking-wide uppercase">{d.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone/80 transition-all duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">{d.summary}</p>
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
            <Reveal>
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
            <ol className="border-s border-line ps-6 sm:ps-8">
              {t.home.steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 100} className="relative pb-7 last:pb-0">
                  <span className="absolute -start-[2.05rem] top-0 grid size-8 place-items-center border border-gold bg-ink-2 font-display text-sm text-gold sm:-start-[2.55rem]">
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
      <section id="temoignages" style={{ order: sectionOrder("testimonials") }} hidden={!sectionEnabled("testimonials")} className="py-24 lg:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-3">{t.home.testimonialsEyebrow}</p>
            <h2 className="heading-lg">{t.home.testimonialsTitle}</h2>
            <p className="mt-5 max-w-2xl border-s-2 border-gold ps-4 text-sm leading-relaxed text-mist">{t.home.testimonialsNote}</p>
          </Reveal>
          <Reveal delay={120} className="border-t border-gold pt-6 lg:border-t-0 lg:border-s lg:pt-0 lg:ps-8">
            <Icon name="star" className="text-gold" />
            <p className="mt-4 font-display text-2xl uppercase">{t.home.shareExperience}</p>
            <a href={site.email.href} className="btn btn-ghost mt-6">
              {t.home.writeUs} <Icon name="arrow" className="rtl:-scale-x-100" />
            </a>
          </Reveal>
        </div>
        <div className="container-site mt-10">
          {testimonialsCms.length > 0 ? (
            <div className="grid gap-px border border-line bg-line md:grid-cols-3">
              {testimonialsCms.map((item, index) => (
                <article key={`${item.title}-${index}`} className="bg-ink-2 p-6">
                  <Icon name="star" className="text-gold" />
                  <blockquote className="mt-4 text-sm leading-relaxed text-bone">{item.body}</blockquote>
                  <p className="mt-5 font-display text-sm uppercase text-gold">{item.title}</p>
                  {item.subtitle && <p className="mt-1 text-xs text-mist">{item.subtitle}</p>}
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-line bg-ink-2 px-6 py-8 text-center text-sm text-mist">
              {t.home.testimonialsSoon}
            </p>
          )}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" style={{ order: sectionOrder("faq") }} hidden={!sectionEnabled("faq")} className="border-y border-line bg-ink-2 py-24 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg">{t.home.faqTitle}</h2>
            <p className="mt-5 max-w-md text-mist">{t.home.faqText}</p>
            {contactButton("btn btn-primary mt-7")}
          </Reveal>
          <div>
            <Accordion type="single" collapsible className="border-t border-line">
              {visibleFaqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ---------------- APPEL À L'ACTION ---------------- */}
      <section style={{ order: sectionOrder("cta") }} hidden={!sectionEnabled("cta")} className="relative isolate overflow-hidden py-28">
        <Image src={bannerPhotos[0].src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/60" />
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Reveal>
            <h2 className="heading-lg max-w-2xl">
              {t.home.ctaTitle[0]} <AnimatedAccent className="text-gold">{t.home.ctaTitle[1]}</AnimatedAccent> {t.home.ctaTitle[2]}
            </h2>
            <p className="mt-4 max-w-xl text-mist">{t.home.ctaText}</p>
          </Reveal>
          <Reveal delay={150} className="flex flex-wrap gap-4">
            <Link href="/contact" className="btn btn-primary">
              {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
            <a href={site.phone.href} className="btn btn-ghost">
              <Icon name="phone" /> {site.phone.label}
            </a>
          </Reveal>
        </div>
      </section>
      <div style={{ order: sectionOrder("partners") }} hidden={!sectionEnabled("partners")}>
        <PartnersMarquee partners={partnersCms} title={t.partners.title} locale={locale} />
      </div>
      </div>
    </>
  );
}
