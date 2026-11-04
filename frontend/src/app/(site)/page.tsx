import Image from "next/image";
import Link from "next/link";
import { BannerMarquee, KeywordTicker } from "@/components/BannerMarquee";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { RotatingWord } from "@/components/RotatingWord";
import { ScrollStory, type StoryItem } from "@/components/ScrollStory";
import { disciplineList } from "@/lib/disciplines";
import { bannerPhotos, brand } from "@/lib/images";
import { site } from "@/lib/site";

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
        Centre de formation certifié ({site.approval}), nous délivrons des certificats à l&apos;issue de chaque parcours et
        accompagnons nos diplômés vers l&apos;emploi, notamment à l&apos;international grâce à notre partenaire RITEJ.
      </p>
    ),
    points: ["Certificats délivrés en fin de parcours", "Évaluations théoriques et pratiques", "Réseau de partenaires employeurs", "Opportunités de contrats à l'étranger"],
  },
];

const steps = [
  { title: "Prise de contact", text: "Remplissez le formulaire ou appelez-nous : nous répondons à toutes vos questions." },
  { title: "Orientation", text: "Selon votre profil, nous vous conseillons la formation et la session adaptées." },
  { title: "Formation intensive", text: "Théorie, pratique et mises en situation avec nos formateurs experts." },
  { title: "Certification", text: "Évaluation finale, remise du certificat et accompagnement vers l'emploi." },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- HÉRO ---------------- */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
        <Image
          src={bannerPhotos[4].src}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className="-z-20 object-cover opacity-30 grayscale"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,transparent_0%,var(--color-ink)_70%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />

        <div className="container-site grid items-center gap-14 lg:grid-cols-[1.35fr_1fr]">
          <div>
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
                Centre de formation continue spécialisé en <strong className="font-medium text-bone">coaching privé</strong> et{" "}
                <strong className="font-medium text-bone">sciences du sport</strong>.
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
              <Link href="/contact" className="btn btn-ghost">
                Demander une inscription
              </Link>
            </Reveal>
          </div>

          <Reveal from="zoom" delay={250} className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="absolute inset-0 -z-10 rounded-full bg-gold/20 blur-3xl" />
            <Image
              src={brand.logo}
              alt="Écusson Defenders Fitness Academy"
              preload
              sizes="384px"
              className="w-full rounded-full ring-1 ring-white/10"
            />
          </Reveal>
        </div>

        <a
          href="#promotions"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] tracking-[0.3em] text-mist uppercase sm:flex"
        >
          Défiler
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </a>
      </section>

      {/* ---------------- BANDEAU D'IMAGES ---------------- */}
      <section id="promotions" className="py-20">
        <div className="container-site mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="eyebrow mb-3">Nos promotions</p>
            <h2 className="heading-lg">Ils ont choisi l&apos;excellence</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-sm text-mist">
              Cérémonies de certification, sessions en salle, travail sur le terrain : la vie de l&apos;académie en images.
            </p>
          </Reveal>
        </div>
        <BannerMarquee photos={bannerPhotos} />
      </section>

      <KeywordTicker words={["Coaching privé", "Sciences du sport", "Pilates", "Football", "Personal Training", "Certification"]} />

      {/* ---------------- DOMAINE D'ACTIVITÉ (scroll) ---------------- */}
      <section id="domaine" className="py-24 lg:py-32">
        <div className="container-site">
          <Reveal className="mb-16 max-w-3xl lg:mb-8">
            <p className="eyebrow mb-3">Notre domaine d&apos;activité</p>
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
                <Link href={`/${d.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink">
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
                    <p className="mt-3 line-clamp-3 text-sm text-bone/75">{d.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] uppercase">
                      Découvrir <Icon name="arrow" className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- POUR QUI ---------------- */}
      <section className="py-24 lg:py-32">
        <div className="container-site">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow mb-3">Pour qui ?</p>
            <h2 className="heading-lg">Que vous débutiez ou que vous exerciez déjà</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Coach professionnel",
                text: "Vous exercez déjà ? Spécialisez-vous, actualisez vos connaissances scientifiques et obtenez une nouvelle certification pour développer votre clientèle.",
                items: ["Spécialisation Pilates ou football", "Mise à jour scientifique", "Certification complémentaire"],
              },
              {
                title: "Jeune diplômé",
                text: "Fraîchement diplômé en sciences du sport ? Complétez votre formation par une expertise pratique, recherchée par les employeurs.",
                items: ["Expérience pratique encadrée", "Certificats reconnus", "Accompagnement vers l'emploi"],
              },
            ].map((card, i) => (
              <Reveal key={card.title} from={i === 0 ? "left" : "right"}>
                <div className="h-full border border-line bg-ink-2 p-8 transition-colors hover:border-gold/60 lg:p-10">
                  <h3 className="font-display text-3xl tracking-wide uppercase">{card.title}</h3>
                  <p className="mt-4 text-mist">{card.text}</p>
                  <ul className="mt-6 space-y-2">
                    {card.items.map((it) => (
                      <li key={it} className="flex items-center gap-3 text-sm">
                        <Icon name="check" className="text-gold" /> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PARCOURS ---------------- */}
      <section className="border-y border-line bg-ink-2 py-24">
        <div className="container-site">
          <Reveal className="mb-14 text-center">
            <p className="eyebrow mb-3">Votre parcours</p>
            <h2 className="heading-lg">De l&apos;inscription à la certification</h2>
          </Reveal>
          <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 120} className="relative">
                <span className="font-display text-6xl text-gold/25">0{i + 1}</span>
                <h3 className="mt-2 font-display text-xl tracking-wide uppercase">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- APPEL À L'ACTION ---------------- */}
      <section className="relative isolate overflow-hidden py-28">
        <Image src={bannerPhotos[0].src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/60" />
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Reveal>
            <h2 className="heading-lg max-w-2xl">
              Prêt à rejoindre la <span className="text-gold">prochaine promotion</span> ?
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
    </>
  );
}
