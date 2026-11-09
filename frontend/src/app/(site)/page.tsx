import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { RotatingWord } from "@/components/RotatingWord";
import { ScrollStory, type StoryItem } from "@/components/ScrollStory";
import { bannerPhotos } from "@/lib/images";
import { disciplineList } from "@/lib/disciplines";
import { site } from "@/lib/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedAccent } from "@/components/AnimatedAccent";
import { BannerMarquee } from "@/components/BannerMarquee";
import { trainingOptions } from "@/lib/formations";
import { apiFetch, getContactDefaults } from "@/lib/session";
import { VideoShowcase } from "@/components/VideoShowcase";
import { getSiteSettings } from "@/lib/settings";
import { PartnersMarquee, type PublicPartner } from "@/components/PartnersMarquee";
import { HomeContactButton } from "@/components/HomeContactButton";

const domain = (brandLabel: string, approval: string): StoryItem[] => [
  {
    id: "formation-continue",
    label: "Formation continue",
    title: "Se former tout au long de sa carrière",
    body: (
      <p>
        {brandLabel} est un centre de formation continue : nous accompagnons les professionnels du sport à
        chaque étape, de la première certification à la spécialisation, avec des formats intensifs pensés pour s&apos;intégrer
        à une vie active.
      </p>
    ),
    points: ["Formats intensifs sur quelques jours", "Hébergement inclus sur nos sessions résidentielles", "Petits groupes encadrés", "Contenus mis à jour en continu"],
  },
  {
    id: "coaching-prive",
    label: "Coaching privé",
    title: "L'expertise du coaching individuel",
    body: (
      <p>
        Le coaching privé exige plus qu&apos;un programme : il faut savoir évaluer, adapter, motiver et fidéliser. Nos
        formations développent ces compétences pour que chaque coach offre un accompagnement réellement personnalisé.
      </p>
    ),
    points: ["Évaluation et suivi du client", "Programmation individualisée", "Communication et relation client", "Développer son activité"],
  },
  {
    id: "sciences-du-sport",
    label: "Sciences du sport",
    title: "La science au service de la performance",
    body: (
      <p>
        Anatomie, biomécanique, physiologie de l&apos;effort, nutrition : chaque formation repose sur des bases scientifiques
        solides, traduites en outils concrets et directement applicables sur le terrain.
      </p>
    ),
    points: ["Anatomie & biomécanique", "Physiologie de l'effort", "Nutrition du sportif", "Prévention des blessures"],
  },
  {
    id: "certification",
    label: "Certification & emploi",
    title: "Une certification qui ouvre des portes",
    body: (
      <p>
        Centre de formation certifié ({approval}), nous combinons apprentissages théoriques, pratique et évaluation
        pour préparer chaque stagiaire à transmettre ses compétences sur le terrain.
      </p>
    ),
    points: ["Évaluations théoriques et pratiques", "Certificat en fin de parcours", "Accompagnement vers l'emploi", "Réseau de partenaires professionnels"],
  },
];

const steps = [
  { title: "Orientation", text: "L'équipe vous aide à choisir une discipline et une session adaptées à votre profil." },
  { title: "Formation", text: "Un parcours intensif qui associe notions théoriques, pratique et mises en situation." },
  { title: "Évaluation", text: "Chaque parcours se termine par une évaluation théorique et pratique." },
];

const hiddenPromotionImages = new Set([
  "/pics/football_images/acc_images.jpg",
  "/pics/Pilates_images/acc_images.jpg",
  "/pics/personal_trainers/acc_images.jpg",
]);

const HOME_SECTION_IDS = ["hero", "stats", "promotions", "about", "videos", "security", "formations", "method", "testimonials", "faq", "cta", "partners"] as const;

const faqs = [
  {
    question: "À qui s'adressent les formations ?",
    answer: "Aux coachs qui souhaitent se spécialiser et aux jeunes diplômés en sciences du sport qui veulent développer des compétences pratiques. Contactez l'équipe pour vérifier les prérequis d'une session.",
  },
  {
    question: "Que comprend la formation Pilates ?",
    answer: "Les publications de l'académie présentent un parcours Matwork et Reformer, Level 1 & 2, sur 40 heures et 6 jours, avec anatomie, posture, pratique et support pédagogique. Les détails varient selon la session.",
  },
  {
    question: "Quelles spécialités football sont proposées ?",
    answer: "Les spécialités présentées par l'académie comprennent l'entraînement de football, la préparation physique, l'entraînement des gardiens et la direction technique ou sportive.",
  },
  {
    question: "Une certification est-elle délivrée ?",
    answer: `Les parcours comprennent une évaluation théorique et pratique, avec certificat en fin de formation (${site.approval}).`,
  },
  {
    question: "Où ont lieu les sessions ?",
    answer: "L'adresse de l'académie est à Hammamet. Le lieu de formation dépend de la session ; certaines annonces indiquent Nabeul ou Sunset Studio à Lac 1. Consultez le planning ou contactez l'équipe pour confirmer le lieu exact.",
  },
  {
    question: "Les services de recrutement à l'étranger sont-ils payants ?",
    answer: "Bayrak El Arab annonce des services gratuits pour les entretiens, les contrats et l'accompagnement. Les offres et recrutements dépendent du profil ; aucun emploi n'est garanti.",
  },
  {
    question: "Comment connaître les tarifs et les prochaines dates ?",
    answer: "Les tarifs et les places disponibles ne sont pas publiés de façon constante. Consultez le planning et contactez l'académie pour les informations à jour.",
  },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const inscriptionSuccess = params.inscription === "success";
  const [settings, contactDefaults] = await Promise.all([getSiteSettings(), getContactDefaults()]);
  const [faqRes, testimonialRes, promotionsRes, mediaRes, formationsRes, partnersRes] = await Promise.all([
    apiFetch("/api/content/items/faq"),
    apiFetch("/api/content/items/testimonials"),
    apiFetch("/api/content/items/promotions"),
    apiFetch("/api/media?type=video"),
    apiFetch("/api/formations"),
    apiFetch("/api/content/items/partners"),
  ]);
  const faqsCms = faqRes.ok ? ((await faqRes.json()) as { items: { title: string; body: string }[] }).items : [];
  const testimonialsCms = testimonialRes.ok ? ((await testimonialRes.json()) as { items: { title: string; subtitle: string; body: string }[] }).items : [];
  const promotionsCms = promotionsRes.ok ? ((await promotionsRes.json()) as { items: { id: number; title: string; subtitle: string; body: string; imageUrl: string; linkUrl: string }[] }).items : [];
  const visiblePromotions = promotionsCms.filter((promotion) => !hiddenPromotionImages.has(promotion.imageUrl));
  const videosCms = mediaRes.ok ? ((await mediaRes.json()) as { media: { id: number; type: string; url: string; title: string; category: string }[] }).media.filter((item) => item.type === "video") : [];
  const formationsCms = formationsRes.ok ? ((await formationsRes.json()) as { formations: { id: number; slug: string; name: string; headline: string; summary: string; coverUrl?: string; accent?: string }[] }).formations : [];
  const partnersCms = partnersRes.ok ? ((await partnersRes.json()) as { items: PublicPartner[] }).items : [];
  const rotatingFormationNames = formationsCms.map((formation) => formation.name);
  const approval = typeof settings.approval === "string" && settings.approval ? settings.approval : site.approval;
  const certificationLabel = typeof settings.certificationLabel === "string" && settings.certificationLabel ? settings.certificationLabel : "Centre de formation certifié";
  const brandName = typeof settings.brandName === "string" && settings.brandName ? settings.brandName : site.shortName;
  const brandDescriptor = typeof settings.brandDescriptor === "string" && settings.brandDescriptor ? settings.brandDescriptor : "Fitness Academy";
  const heroDescription = typeof settings.heroDescription === "string" && settings.heroDescription ? settings.heroDescription : "Des formations certifiantes pour les coachs et les professionnels du sport.";
  const heroLead = typeof settings.heroLead === "string" && settings.heroLead ? settings.heroLead : "Formez-vous en";
  const stats = [
    [typeof settings.statsDisciplines === "string" ? settings.statsDisciplines : "3", "Disciplines"],
    [typeof settings.statsVideos === "string" ? settings.statsVideos : "2", "Vidéos"],
    [typeof settings.statsPromotions === "string" ? settings.statsPromotions : "7+", "Promotions"],
    [typeof settings.statsFacebook === "string" ? settings.statsFacebook : "5904+", "Abonnés Facebook"],
  ];
  const visibleFaqs = faqsCms.length > 0
    ? faqsCms.map((faq) => ({ question: faq.title, answer: faq.body }))
    : faqs;
  const savedHomeSections = Array.isArray(settings.homepageSections) ? settings.homepageSections : [];
  const homepageSections = HOME_SECTION_IDS.map((id, index) => {
    const saved = savedHomeSections.find((section) => typeof section === "object" && section !== null && "id" in section && section.id === id);
    return {
      id,
      enabled: saved && "enabled" in saved && typeof saved.enabled === "boolean" ? saved.enabled : true,
      order: saved && "order" in saved && typeof saved.order === "number" ? saved.order : index,
    };
  }).sort((a, b) => a.order - b.order);
  const sectionOrder = (id: typeof HOME_SECTION_IDS[number]) => homepageSections.find((section) => section.id === id)?.order ?? HOME_SECTION_IDS.indexOf(id);
  const sectionEnabled = (id: typeof HOME_SECTION_IDS[number]) => homepageSections.find((section) => section.id === id)?.enabled ?? true;
  const inquiryCopy = {
    contactPopupEnabled: settings.contactPopupEnabled !== "false",
    contactPopupButtonLabel: typeof settings.contactPopupButtonLabel === "string" && settings.contactPopupButtonLabel ? settings.contactPopupButtonLabel : "Nous contacter",
    contactPopupTitle: typeof settings.contactPopupTitle === "string" && settings.contactPopupTitle ? settings.contactPopupTitle : "Nous contacter",
    contactFirstNameLabel: typeof settings.contactFirstNameLabel === "string" && settings.contactFirstNameLabel ? settings.contactFirstNameLabel : "Prénom",
    contactLastNameLabel: typeof settings.contactLastNameLabel === "string" && settings.contactLastNameLabel ? settings.contactLastNameLabel : "Nom",
    contactEmailLabel: typeof settings.contactEmailLabel === "string" && settings.contactEmailLabel ? settings.contactEmailLabel : "E-mail",
    contactPhoneLabel: typeof settings.contactPhoneLabel === "string" && settings.contactPhoneLabel ? settings.contactPhoneLabel : "Téléphone",
    contactMessageLabel: typeof settings.contactMessageLabel === "string" && settings.contactMessageLabel ? settings.contactMessageLabel : "Votre message",
    contactMessagePlaceholder: typeof settings.contactMessagePlaceholder === "string" && settings.contactMessagePlaceholder ? settings.contactMessagePlaceholder : "Comment pouvons-nous vous aider ?",
    contactConsentText: typeof settings.contactConsentText === "string" && settings.contactConsentText ? settings.contactConsentText : "J'accepte que Defenders Fitness Academy utilise ces informations pour me recontacter au sujet de ma demande.",
    contactSubmitLabel: typeof settings.contactSubmitLabel === "string" && settings.contactSubmitLabel ? settings.contactSubmitLabel : "Envoyer mon message",
  };
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
          Votre demande d&apos;inscription a bien été envoyée. Notre équipe vous recontactera prochainement.
        </div>
      )}
      <div className="flex flex-col">
      {/* ---------------- HÉRO ---------------- */}
      <section style={{ order: sectionOrder("hero") }} hidden={!sectionEnabled("hero")} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
        <video
          key={videosCms[0]?.url ?? "/videos/1-Video by defenders_fitness_academy.mp4"}
          src={videosCms[0]?.url ?? "/videos/1-Video by defenders_fitness_academy.mp4"}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/65" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-gold)_12%,transparent)_0%,transparent_58%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/60 to-ink" />

        <div className="container-site flex items-center">
          <div className="w-full max-w-5xl">
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs tracking-[0.2em] text-gold-soft uppercase">
                <Icon name="shield" width={14} height={14} /> {certificationLabel} · {approval}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="heading-xl">
                {brandName}
                <br />
                <span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]">{brandDescriptor}</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-mist sm:text-xl">
                {heroDescription}
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-8 font-display text-2xl tracking-wide uppercase sm:text-3xl">
                {heroLead} <span className="text-gold"><RotatingWord words={rotatingFormationNames.length ? rotatingFormationNames : ["Pilates", "Football", "Personal Training"]} /></span>
              </p>
            </Reveal>
            <Reveal delay={400} className="mt-10 flex flex-wrap gap-4">
              <Link href="#formations" className="btn btn-primary">
                Nos formations <Icon name="arrow" />
              </Link>
              <Link href="/trouver-ma-formation" className="btn btn-ghost">
                <Icon name="star" /> Trouver ma formation
              </Link>
              {contactButton()}
            </Reveal>
          </div>

        </div>

        <a
          href="#statistiques"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.3em] text-mist uppercase sm:flex"
        >
          Défiler
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </a>
      </section>

      {/* ---------------- CHIFFRES ---------------- */}
      <section id="statistiques" style={{ order: sectionOrder("stats") }} hidden={!sectionEnabled("stats")} className="border-y border-line bg-ink-2 py-14">
        <div className="container-site grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="bg-ink-2 px-4 py-8 text-center sm:px-6 sm:py-10">
              <AnimatedAccent className="block font-display text-4xl text-gold sm:text-5xl">{value}</AnimatedAccent>
              <p className="mt-2 font-display text-xs uppercase tracking-[0.12em] text-mist sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PROMOTIONS ---------------- */}
      <section id="galerie" style={{ order: sectionOrder("promotions") }} hidden={!sectionEnabled("promotions")} className="border-b border-line bg-ink-2 py-12 lg:py-16" aria-label="Promotions">
        <div className="container-site mb-8">
          <Reveal>
            <p className="eyebrow mb-3">Promotions & certificats</p>
            <h2 className="heading-lg">Moments marquants de nos formations</h2>
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
            <p className="eyebrow mb-3">À propos de l&apos;académie</p>
            <h2 className="heading-lg">
              Former les coachs <span className="text-gold">de demain</span>
            </h2>
            <p className="mt-6 text-lg text-mist">
              <strong className="font-medium text-bone">{brandName} {brandDescriptor}</strong> est un centre de formation continue
              spécialisé en coaching privé et sciences du sport. Découvrez ce qui fait notre différence.
            </p>
          </Reveal>
          <ScrollStory items={domain(`${brandName} ${brandDescriptor}`.trim(), approval)} />
        </div>
      </section>

      {/* ---------------- VIDÉOS ---------------- */}
      <section style={{ order: sectionOrder("videos") }} hidden={!sectionEnabled("videos")} className="border-b border-line bg-ink py-20 lg:py-24" aria-label="Vidéos de l'académie">
        <div className="container-site">
          <Reveal className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Vidéos</p>
            <h2 className="heading-lg">Au cœur de nos formations</h2>
          </Reveal>
          <VideoShowcase
            videos={videosCms.length > 0 ? videosCms.map((video) => ({ title: video.title || "Vidéo Defenders", src: video.url, category: video.category })) : [
              { title: "Une équipe, une formation", src: "/videos/1-Video by defenders_fitness_academy.mp4" },
              { title: "Pilates Matwork & Reformer", src: "/videos/2-Video by defenders_fitness_academy.mp4", category: "pilates" },
            ]}
            trainings={formationsCms.length ? trainingOptions(formationsCms) : undefined}
            defaults={contactDefaults}
          />
        </div>
      </section>

      {/* ---------------- SECURITY PROTECTION ---------------- */}
      <section style={{ order: sectionOrder("security") }} hidden={!sectionEnabled("security")} className="border-b border-line bg-ink-2 py-20 lg:py-24" aria-label="Defenders Security Protection">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <Reveal>
            <p className="eyebrow mb-3">Autre expertise Defenders</p>
            <h2 className="heading-lg">Defenders Security Protection</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-mist">
              Découvrez nos services de gardiennage, de protection rapprochée, de sécurité et de formation professionnelle.
              Notre équipe met son expertise au service des particuliers et des organisations.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/securite" className="btn btn-primary">
                Découvrir nos services <Icon name="arrow" />
              </Link>
              <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Icon name="phone" /> WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {[
                ["Gardiennage", "Sécurisation des sites"],
                ["Protection", "Accompagnement sécurisé"],
                ["Formation", "Modules professionnels"],
                ["Secourisme", "Premières interventions"],
              ].map(([title, text]) => (
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
              <p className="eyebrow mb-3 !text-ink/60">Nos formations</p>
              <h2 className="heading-lg">{formationsCms.length ? `${formationsCms.length} formations, une exigence` : "Nos formations, une exigence"}</h2>
            </div>
            <div className="flex flex-wrap gap-3 self-start">
              <Link href="/formations" className="btn btn-dark">
                Toutes les formations <Icon name="arrow" />
              </Link>
              <Link href="/planning" className="btn btn-dark">
                <Icon name="calendar" /> Voir le planning
              </Link>
              <Link href="/trouver-ma-formation" className="btn btn-dark">
                <Icon name="star" /> Quiz d&apos;orientation
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {(formationsCms.length > 0 ? formationsCms.map((formation) => {
              const fallback = disciplineList.find((item) => item.slug === formation.slug);
              return {
                slug: formation.slug,
                name: formation.name,
                summary: formation.summary || fallback?.summary || formation.headline,
                cover: formation.coverUrl
                  ? { src: formation.coverUrl, alt: `Formation ${formation.name}` }
                  : fallback?.cover,
                accent: fallback?.accent ?? { bg: "bg-gold" },
              };
            }) : disciplineList.map((d) => ({ ...d }))).map((d, i) => (
              <Reveal key={d.slug} delay={i * 120}>
                <Link href={`/formations/${d.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(201,162,39,0.16)]">
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
                    <span className={`mb-4 block h-1 w-12 ${d.accent.bg} transition-all duration-500 group-hover:w-24`} />
                    <h3 className="font-display text-3xl tracking-wide uppercase">{d.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-bone/80 transition-all duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">{d.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] uppercase">
                      Découvrir la formation <Icon name="arrow" className="transition-transform group-hover:translate-x-1" />
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
              <p className="eyebrow mb-3">Pour qui ?</p>
              <h2 className="heading-lg">Un parcours pour les professionnels du sport</h2>
              <p className="mt-5 max-w-xl leading-relaxed text-mist">
                Coachs en activité et jeunes diplômés peuvent choisir une spécialisation, puis contacter l&apos;équipe pour vérifier les conditions de la session.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-bone">
                {["Coachs qui souhaitent se spécialiser", "Diplômés en sciences du sport", "Professionnels qui veulent actualiser leurs pratiques"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Icon name="check" className="shrink-0 text-gold" /> {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <ol className="border-l border-line pl-6 sm:pl-8">
              {steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 100} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[2.05rem] top-0 grid size-8 place-items-center border border-gold bg-ink-2 font-display text-sm text-gold sm:-left-[2.55rem]">
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
            <p className="eyebrow mb-3">Témoignages</p>
            <h2 className="heading-lg">Leurs expériences de formation</h2>
            <p className="mt-5 max-w-2xl border-l-2 border-gold pl-4 text-sm leading-relaxed text-mist">
              Les retours de nos stagiaires seront publiés ici avec leur accord.
            </p>
          </Reveal>
          <Reveal delay={120} className="border-t border-gold pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <Icon name="star" className="text-gold" />
            <p className="mt-4 font-display text-2xl uppercase">Partagez votre expérience</p>
            <a href={site.email.href} className="btn btn-ghost mt-6">
              Nous écrire <Icon name="arrow" />
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
              Témoignages vérifiés à venir.
            </p>
          )}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" style={{ order: sectionOrder("faq") }} hidden={!sectionEnabled("faq")} className="border-y border-line bg-ink-2 py-24 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg">Vos questions, nos réponses</h2>
            <p className="mt-5 max-w-md text-mist">
              Vous avez besoin d&apos;un renseignement sur votre profil ou une session ? Notre équipe vous répond.
            </p>
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
              Prêt à rejoindre la <AnimatedAccent className="text-gold">prochaine promotion</AnimatedAccent> ?
            </h2>
            <p className="mt-4 max-w-xl text-mist">
              Places limitées par session. Contactez-nous pour connaître les prochaines dates et réserver votre place.
            </p>
          </Reveal>
          <Reveal delay={150} className="flex flex-wrap gap-4">
            <Link href="/contact" className="btn btn-primary">
              S&apos;inscrire <Icon name="arrow" />
            </Link>
            <a href={site.phone.href} className="btn btn-ghost">
              <Icon name="phone" /> {site.phone.label}
            </a>
          </Reveal>
        </div>
      </section>
      <div style={{ order: sectionOrder("partners") }} hidden={!sectionEnabled("partners")}>
        <PartnersMarquee partners={partnersCms} />
      </div>
      </div>
    </>
  );
}
