import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { RotatingWord } from "@/components/RotatingWord";
import { ScrollStory, type StoryItem } from "@/components/ScrollStory";
import { disciplineList } from "@/lib/disciplines";
import { bannerPhotos } from "@/lib/images";
import { site } from "@/lib/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedAccent } from "@/components/AnimatedAccent";
import { HeroSlideshow } from "@/components/HeroSlideshow";

const domain: StoryItem[] = [
  {
    id: "formation-continue",
    label: "Formation continue",
    title: "Se former tout au long de sa carrière",
    body: (
      <p>
        Defenders Fitness Academy est un centre de formation continue : nous accompagnons les professionnels du sport à
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
        Centre de formation certifié ({site.approval}), nous combinons apprentissages théoriques, pratique et évaluation
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

  return (
    <>
      {inscriptionSuccess && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-gold bg-ink-2 px-5 py-4 text-center text-sm text-bone shadow-2xl">
          Votre demande d&apos;inscription a bien été envoyée. Notre équipe vous recontactera prochainement.
        </div>
      )}
      {/* ---------------- HÉRO ---------------- */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
        <HeroSlideshow photos={bannerPhotos.slice(0, 6).map((photo) => photo.src)} />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--color-gold)_12%,transparent)_0%,transparent_58%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />

        <div className="container-site flex items-center">
          <div className="w-full max-w-5xl">
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs tracking-[0.2em] text-gold-soft uppercase">
                <Icon name="shield" width={14} height={14} /> Centre de formation certifié · {site.approval}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="heading-xl">
                Defenders
                <br />
                <span className="text-transparent [-webkit-text-stroke:1.5px_var(--color-bone)]">Fitness</span> Academy
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist sm:text-xl">
                Des formations certifiantes pour les <strong className="font-medium text-bone">coachs</strong> et les{" "}
                <strong className="font-medium text-bone">professionnels du sport</strong>.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-8 font-display text-2xl tracking-wide uppercase sm:text-3xl">
                Formez-vous en <span className="text-gold"><RotatingWord words={["Pilates", "Football", "Personal Training"]} /></span>
              </p>
            </Reveal>
            <Reveal delay={400} className="mt-10 flex flex-wrap gap-4">
              <Link href="#formations" className="btn btn-primary">
                Nos formations <Icon name="arrow" />
              </Link>
              <Link href="/contact?popup=1" className="btn btn-ghost">
                Demander mon inscription
              </Link>
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
      <section id="statistiques" className="border-y border-line bg-ink-2 py-14">
        <div className="container-site grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
          {[
            ["3", "Disciplines"],
            ["2", "Vidéos"],
            ["7+", "Promotions"],
            ["5904+", "Abonnés Facebook"],
          ].map(([value, label]) => (
            <div key={label} className="bg-ink-2 px-4 py-8 text-center sm:px-6 sm:py-10">
              <AnimatedAccent className="block font-display text-4xl text-gold sm:text-5xl">{value}</AnimatedAccent>
              <p className="mt-2 font-display text-xs uppercase tracking-[0.12em] text-mist sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- GALERIE ---------------- */}
      <section id="galerie" className="py-20 lg:py-24">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">Galerie</p>
              <h2 className="heading-lg">Promotions & certificats</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-mist">
              La vie de l&apos;académie entre séances, promotions, certificats et moments marquants.
            </p>
          </Reveal>

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {bannerPhotos.map((photo, index) => (
              <Reveal key={photo.src.src ?? photo.alt} delay={(index % 5) * 60} className="mb-5 break-inside-avoid">
                <figure className="group overflow-hidden border border-line bg-ink-2">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full object-contain"
                  />
                </figure>
              </Reveal>
            ))}

            {[
              { title: "Une équipe, une formation", src: "/videos/1-Video by defenders_fitness_academy.mp4" },
              { title: "Pilates Matwork & Reformer", src: "/videos/2-Video by defenders_fitness_academy.mp4" },
            ].map((video, index) => (
              <Reveal key={video.src} delay={(index + 2) * 60} className="mb-5 break-inside-avoid">
                <figure className="overflow-hidden border border-line bg-ink-2">
                  <video
                    src={video.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    controls
                    className="h-auto max-h-[620px] w-full bg-black object-contain"
                  />
                  <figcaption className="px-5 py-4 font-display text-sm uppercase text-gold-soft">
                    {video.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DOMAINE D'ACTIVITÉ (scroll) ---------------- */}
      <section id="a-propos" className="py-24 lg:py-32">
        <div className="container-site">
          <Reveal className="mb-16 max-w-3xl lg:mb-8">
            <p className="eyebrow mb-3">À propos de l&apos;académie</p>
            <h2 className="heading-lg">
              Former les coachs <span className="text-gold">de demain</span>
            </h2>
            <p className="mt-6 text-lg text-mist">
              <strong className="font-medium text-bone">Defenders Fitness Academy</strong> est un centre de formation continue
              spécialisé en coaching privé et sciences du sport. Découvrez ce qui fait notre différence.
            </p>
          </Reveal>
          <ScrollStory items={domain} />
        </div>
      </section>

      {/* ---------------- FORMATIONS ---------------- */}
      <section id="formations" className="bg-bone py-24 text-ink lg:py-32">
        <div className="container-site">
          <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3 !text-ink/60">Nos formations</p>
              <h2 className="heading-lg">Trois expertises, une exigence</h2>
            </div>
            <Link href="/planning" className="btn btn-dark self-start">
              <Icon name="calendar" /> Voir le planning
            </Link>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {disciplineList.map((d, i) => (
              <Reveal key={d.slug} delay={i * 120}>
                <Link href={`/${d.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(201,162,39,0.16)]">
                  <Image
                    src={d.cover.src}
                    alt={d.cover.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                  />
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
      <section className="border-y border-line bg-ink-2 py-20 lg:py-24">
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
      <section id="temoignages" className="py-24 lg:py-28">
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
          <p className="border border-line bg-ink-2 px-6 py-8 text-center text-sm text-mist">
            Témoignages vérifiés à venir.
          </p>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="border-y border-line bg-ink-2 py-24 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="heading-lg">Vos questions, nos réponses</h2>
            <p className="mt-5 max-w-md text-mist">
              Vous avez besoin d&apos;un renseignement sur votre profil ou une session ? Notre équipe vous répond.
            </p>
            <Link href="/contact" className="btn btn-primary mt-7">
              Nous contacter <Icon name="arrow" />
            </Link>
          </Reveal>
          <div>
            <Accordion type="single" collapsible className="border-t border-line">
              {faqs.map((faq) => (
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
      <section className="relative isolate overflow-hidden py-28">
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
            <Link href="/contact?popup=1" className="btn btn-primary">
              S&apos;inscrire <Icon name="arrow" />
            </Link>
            <a href={site.phone.href} className="btn btn-ghost">
              <Icon name="phone" /> {site.phone.label}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
