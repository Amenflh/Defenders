import Image from "next/image";
import Link from "next/link";
import { ACADEMY_PATH, formationHref } from "@/lib/academies";
import { getGallery } from "@/lib/academy-content";
import { accentClassFor, visualFor } from "@/lib/formation-visuals";
import { formatPrice, keyFacts, type Formation, type FormationDetail } from "@/lib/formations";
import { intlLocale } from "@/lib/i18n/config";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { GalleryMarquee } from "./GalleryMarquee";
import { VideoCarousel } from "./VideoCarousel";
import { FormationHighlights, FormationHistoryLink } from "./FormationExtras";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";
import { TrainerCards } from "./TrainerCards";

/** Page détaillée d'une formation, identique pour les deux académies : tout le contenu vient de l'espace admin. */
export async function FormationPage({ f: source, others: sourceOthers }: { f: FormationDetail; others: Formation[] }) {
  const { locale, t } = await getDictionary();
  const p = t.pages.formation;
  const f = localizeFormation(source, locale);
  const others = sourceOthers.map((o) => localizeFormation(o, locale));
  const { accent, photos } = visualFor(f.accent);
  const [defaultHero] = photos;
  const academyName = f.academy === "tsa" ? t.nav.akAcademy : t.nav.fitnessAcademy;
  const academyHref = ACADEMY_PATH[f.academy];
  const uploadedImages = f.media.filter((m) => m.type === "image" && m.url !== f.coverUrl);
  const galleryUrls = f.galleryUrls.filter((url) => url !== f.coverUrl);
  const videos = f.media.filter((m) => m.type === "video");
  const carouselVideos = f.videos.map((video, i) => ({ ...video, title: video.title || `${f.name} · ${i + 1}` }));
  // Galerie défilante : images de la formation, sinon celles de l'académie (admin › Médias).
  const ownPhotos = [
    ...(carouselVideos.length > 0 && f.coverUrl && !f.coverIsPoster ? [{ src: f.coverUrl, alt: p.imageAlt(f.name) }] : []),
    ...galleryUrls.map((url) => ({ src: url, alt: p.imageAlt(f.name) })),
    ...uploadedImages.map((m) => ({ src: m.url, alt: m.title || p.imageAlt(f.name) })),
  ];
  const galleryPhotos = galleryUrls.length + uploadedImages.length > 0 ? ownPhotos : (await getGallery(f.academy)).photos;
  const facts = keyFacts(f, { duration: p.duration, level: p.level, price: p.price, location: t.pages.akAcademy.locationTitle });
  const price = formatPrice(f.priceTnd);

  return (
    <div className={`branch-theme ${accentClassFor(f.accent)}`}>
      {/* -------- Héro -------- */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className={`pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full ${accent.bg} opacity-10 blur-3xl`} />
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal from="left">
              <nav aria-label={p.breadcrumb} className="mb-6 text-xs tracking-[0.2em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">{t.nav.home}</Link> <span aria-hidden="true">/</span>{" "}
                <Link href={academyHref} className="hover:text-bone">{academyName}</Link> <span aria-hidden="true">/</span>{" "}
                <span className={accent.text}>{f.name}</span>
              </nav>
            </Reveal>
            <Reveal from="left" delay={80}>
              <h1 className="heading-xl">{f.name}</h1>
              {f.headline && <p className={`mt-4 font-display text-xl tracking-wide uppercase ${accent.text}`}>{f.headline}</p>}
            </Reveal>
            {f.summary && (
              <Reveal from="left" delay={160}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{f.summary}</p>
              </Reveal>
            )}
            {f.practical && (
              <Reveal from="left" delay={200}>
                <p className="mt-5 max-w-xl border-s-2 border-gold/60 bg-ink-2 p-5 text-sm leading-relaxed text-mist">{f.practical}</p>
              </Reveal>
            )}
            {facts.length > 0 && (
              <Reveal from="left" delay={240}>
                <dl className="mt-10 grid border-y border-line" style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}>
                  {facts.map((fact) => (
                    <div key={fact.label} className="border-e border-line py-5 pe-3 last:border-e-0 [&:not(:first-child)]:ps-4">
                      <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{fact.label}</dt>
                      <dd className="mt-1 font-display text-lg leading-tight tracking-wide uppercase sm:text-xl">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
            <Reveal from="left" delay={320} className="mt-10 flex flex-wrap gap-4">
              <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
                {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/planning" className="btn btn-ghost">
                <Icon name="calendar" /> {t.nav.planning}
              </Link>
            </Reveal>
            {(f.contactPhone || f.sourceUrl) && (
              <Reveal from="left" delay={360} className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                {f.contactPhone && (
                  <a href={`tel:${f.contactPhone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-gold hover:text-bone">
                    <Icon name="phone" width={16} height={16} /> <span dir="ltr">{f.contactPhone}</span>
                  </a>
                )}
                {f.sourceUrl && (
                  <a href={f.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-gold hover:text-bone">
                    <Icon name={/facebook\.com/i.test(f.sourceUrl) ? "facebook" : "file"} width={16} height={16} /> {/facebook\.com/i.test(f.sourceUrl) ? t.pages.akAcademy.k9CoursePostLink : t.pages.security.download}
                  </a>
                )}
              </Reveal>
            )}
          </div>

          <Reveal from="right" delay={150} className={`relative ${f.coverIsPoster && carouselVideos.length === 0 ? "mx-auto w-full max-w-md" : ""}`}>
            {carouselVideos.length > 0 ? (
              <VideoCarousel videos={carouselVideos} labels={{ previous: p.previousVideo, next: p.nextVideo, upNext: p.upNext }} />
            ) : (
              <>
                <div className={`absolute -inset-3 border ${accent.border} opacity-40`} aria-hidden="true" />
                <div className={`relative overflow-hidden bg-ink-3 ${f.coverIsPoster ? "aspect-[72/102]" : "aspect-[4/5]"}`}>
                  {f.coverUrl ? (
                    <Image src={f.coverUrl} alt={p.imageAlt(f.name)} fill preload unoptimized={!f.coverUrl.startsWith("/pics/")} sizes="(min-width: 1024px) 45vw, 100vw" className={f.coverIsPoster ? "object-contain" : "formation-photo-drift object-cover"} />
                  ) : (
                    <Image src={defaultHero.src} alt={defaultHero.alt} fill preload placeholder="blur" sizes="(min-width: 1024px) 45vw, 100vw" className="formation-photo-drift object-cover" />
                  )}
                </div>
              </>
            )}
          </Reveal>
        </div>
      </section>

      <FormationHighlights slug={f.slug} />

      {/* -------- Présentation + objectifs -------- */}
      {(f.intro.length > 0 || f.objectives.length > 0) && (
        <section className="border-y border-line bg-ink-2 py-24">
          <div className={`container-site grid gap-14 ${f.intro.length > 0 && f.objectives.length > 0 ? "lg:grid-cols-2" : ""}`}>
            {f.intro.length > 0 && (
              <Reveal from="left">
                <p className="eyebrow mb-3">{p.theFormation}</p>
                <h2 className="heading-lg mb-6">{p.whatYouLearn}</h2>
                <div className="space-y-4 text-lg leading-relaxed text-mist">
                  {f.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}
            {f.objectives.length > 0 && (
              <Reveal from="right" delay={120}>
                <p className={f.intro.length > 0 ? "hidden" : "eyebrow mb-3"}>{p.theFormation}</p>
                <h3 className={`mb-6 uppercase ${f.intro.length > 0 ? "font-display text-2xl tracking-wide" : "heading-lg"}`}>{f.intro.length > 0 ? p.objectives : p.whatYouLearn}</h3>
                <ul className={f.intro.length > 0 ? "space-y-4" : "grid gap-x-10 gap-y-4 md:grid-cols-2"}>
                  {f.objectives.map((o, i) => (
                    <li key={i} className="flex gap-4 border-b border-line pb-4">
                      <Icon name="check" className={`mt-0.5 shrink-0 ${accent.text}`} />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* -------- Modules -------- */}
      {f.modules.length > 0 && (
        <section className="py-24">
          <div className="container-site">
            <Reveal from="left" className="mb-12">
              <p className="eyebrow mb-3">{p.programme}</p>
              <h2 className="heading-lg">{p.modules}</h2>
            </Reveal>
            <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {f.modules.map((m, i) => (
                <Reveal from={(["left", "up", "right"] as const)[i % 3]} as="li" key={i} delay={(i % 3) * 100} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
                  <span className={`font-display text-sm tracking-[0.3em] ${accent.text}`}>{p.module.toUpperCase()} {String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-2xl tracking-wide uppercase">{m.title}</h3>
                  {m.text && <p className="mt-3 text-sm leading-relaxed text-mist">{m.text}</p>}
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* -------- Infos pratiques : prérequis, niveau, durée, tarif -------- */}
      {(f.prerequisites.length > 0 || f.levelLabel || f.durationLabel || f.location || price) && (
        <section className="border-y border-line bg-ink-2 py-20">
          <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <Reveal from="left">
              <p className="eyebrow mb-3">{p.practical}</p>
              <h2 className="heading-lg">{p.beforeRegister}</h2>
              <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line">
                {[
                  [p.duration, f.durationLabel],
                  [t.pages.akAcademy.locationTitle, f.location],
                  [p.level, f.levelLabel],
                  [p.price, price],
                ].map(([label, value]) => (
                  <div key={label} className="bg-ink p-5">
                    <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{label}</dt>
                    <dd className="mt-1 font-display text-lg tracking-wide break-words uppercase">{value || p.onRequest}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal from="right" delay={120}>
              <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">{p.prerequisites}</h3>
              {f.prerequisites.length > 0 ? (
                <ul className="space-y-4">
                  {f.prerequisites.map((p, i) => (
                    <li key={i} className="flex gap-4 border-b border-line pb-4">
                      <Icon name="check" className={`mt-0.5 shrink-0 ${accent.text}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-mist">{p.noPrereq}</p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* -------- Date de la prochaine session (une seule date par formation) -------- */}
      <section className="py-16">
        <div className="container-site"><div className="flex flex-col items-start justify-between gap-6 border border-line bg-ink-2 p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-5">
            <span className="grid size-14 shrink-0 place-items-center bg-gold text-ink"><Icon name="calendar" /></span>
            <div>
              <p className="eyebrow mb-1">{t.planning.date}</p>
              <p className="font-display text-2xl uppercase">
                {f.nextSessionDate
                  ? new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${f.nextSessionDate}T00:00:00Z`))
                  : t.planning.tba}
              </p>
            </div>
          </div>
          <Link href="/planning" className="btn btn-ghost shrink-0">
            <Icon name="calendar" /> {p.fullPlanning}
          </Link>
        </div></div>
      </section>

      {/* -------- Formateurs -------- */}
      {f.trainers.length > 0 && (
        <section className="border-t border-line py-24">
          <div className="container-site">
            <Reveal from="left" className="mb-10">
              <p className="eyebrow mb-3">{p.team}</p>
              <h2 className="heading-lg">{p.trainers}</h2>
            </Reveal>
            <TrainerCards trainers={f.trainers.map((trainer) => localizeFormation(trainer, locale))} />
          </div>
        </section>
      )}

      {/* -------- Vidéos téléversées dans l'admin -------- */}
      {videos.length > 0 && (
        <section className="pb-12">
          <div className="container-site grid gap-6 sm:grid-cols-2">
            {videos.map((v) => (
              <figure key={v.id} className="overflow-hidden border border-line bg-ink-2">
                <video src={v.url} controls preload="metadata" playsInline className="mx-auto block max-h-[70svh] w-full bg-black object-contain" />
                {v.title && <figcaption className="px-4 py-3 text-sm text-mist">{v.title}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* -------- Galerie défilante : photos du site + images téléversées -------- */}
      {galleryPhotos.length > 0 && (
        <section className="pb-24">
          <Reveal from="left">
            <GalleryMarquee photos={galleryPhotos} label={p.galleryLabel} />
          </Reveal>
        </section>
      )}

      {/* -------- Public + débouchés -------- */}
      {(f.audience.length > 0 || f.careers.length > 0) && (
        <section className="border-y border-line bg-ink-2 py-24">
          <div className="container-site grid gap-10 md:grid-cols-2">
            {[
              { title: p.audience, items: f.audience },
              { title: p.careers, items: f.careers },
            ]
              .filter((col) => col.items.length > 0)
              .map((col, i) => (
                <Reveal from={i % 2 === 0 ? "left" : "right"} key={col.title} delay={i * 120}>
                  <h2 className="mb-6 font-display text-3xl tracking-wide uppercase">{col.title}</h2>
                  <ul className="space-y-3">
                    {col.items.map((it, j) => (
                      <li key={j} className="group flex items-center gap-3 border-b border-line pb-3 transition-colors hover:text-gold-soft">
                        <Icon name="star" width={16} height={16} className="shrink-0 text-gold transition-transform duration-300 group-hover:rotate-[72deg] group-hover:scale-110" /> {it}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
          </div>
        </section>
      )}

      {/* -------- Lien vers l'historique des sessions -------- */}
      <FormationHistoryLink slug={f.slug} />

      {/* -------- Autres formations -------- */}
      <section className="py-24">
        <div className="container-site">
          <Reveal from="left" className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-lg">{others.length ? p.discoverAlso : p.readyToStart}</h2>
            <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
              {p.requestRegistration} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          </Reveal>
          {others.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {others.map((o, i) => (
                <Reveal from={(["left", "up", "right"] as const)[i % 3]} key={o.slug} delay={i * 120}>
                  <FormationLink f={o} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FormationLink({ f }: { f: Formation }) {
  const { cover } = visualFor(f.accent);
  return (
    <Link href={formationHref(f)} className="group flex items-center gap-6 border border-line bg-ink-2 p-5 transition-colors hover:border-bone/40">
      <div className="relative size-24 shrink-0 overflow-hidden">
        {f.coverUrl ? (
          <Image src={f.coverUrl} alt="" fill unoptimized={!f.coverUrl.startsWith("/pics/")} sizes="96px" className={`transition duration-500 group-hover:scale-110 ${f.coverIsPoster ? "object-contain" : "formation-photo-drift object-cover"}`} />
        ) : (
          <Image src={cover.src} alt="" fill sizes="96px" className="formation-photo-drift object-cover transition duration-500 group-hover:scale-110" />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-2xl tracking-wide uppercase">{f.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-mist">{f.headline}</p>
      </div>
      <Icon name="arrow" className="ms-auto shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
    </Link>
  );
}
