import Image from "next/image";
import Link from "next/link";
import { visualFor } from "@/lib/formation-visuals";
import { formatPrice, keyFacts, type Formation, type FormationDetail } from "@/lib/formations";
import { intlLocale } from "@/lib/i18n/config";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { accentClassFor } from "@/lib/formation-visuals";
import { FormationHighlights, FormationHistoryLink } from "./FormationExtras";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

/** Page détaillée d'une formation (#17) : contenu issu de l'API, modifiable dans l'espace admin. */
export async function FormationPage({ f: source, others: sourceOthers }: { f: FormationDetail; others: Formation[] }) {
  const { locale, t } = await getDictionary();
  const p = t.pages.formation;
  const f = localizeFormation(source, locale);
  const others = sourceOthers.map((o) => localizeFormation(o, locale));
  const { accent, photos } = visualFor(f.slug);
  const [defaultHero, ...defaultGallery] = photos;
  const uploadedImages = f.media.filter((m) => m.type === "image" && m.url !== f.coverUrl);
  const galleryUrls = f.galleryUrls.filter((url) => url !== f.coverUrl);
  const videos = f.media.filter((m) => m.type === "video");
  const facts = keyFacts(f);
  const price = formatPrice(f.priceTnd);

  return (
    <div className={accentClassFor(f.slug)}>
      {/* -------- Héro -------- */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className={`pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full ${accent.bg} opacity-10 blur-3xl`} />
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <nav aria-label={p.breadcrumb} className="mb-6 text-xs tracking-[0.2em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">{t.nav.home}</Link> <span aria-hidden="true">/</span>{" "}
                <Link href="/formations" className="hover:text-bone">{t.common.formations}</Link> <span aria-hidden="true">/</span>{" "}
                <span className={accent.text}>{f.name}</span>
              </nav>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="heading-xl">{f.name}</h1>
              {f.headline && <p className={`mt-4 font-display text-xl tracking-wide uppercase ${accent.text}`}>{f.headline}</p>}
            </Reveal>
            {f.summary && (
              <Reveal delay={160}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{f.summary}</p>
              </Reveal>
            )}
            {facts.length > 0 && (
              <Reveal delay={240}>
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
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-4">
              <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
                {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/planning" className="btn btn-ghost">
                <Icon name="calendar" /> {t.nav.planning}
              </Link>
            </Reveal>
          </div>

          <Reveal from="right" delay={150} className="relative">
            <div className={`absolute -inset-3 border ${accent.border} opacity-40`} aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
              {f.coverUrl ? (
                <Image src={f.coverUrl} alt={p.imageAlt(f.name)} fill preload unoptimized sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              ) : (
                <Image src={defaultHero.src} alt={defaultHero.alt} fill preload placeholder="blur" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <FormationHighlights slug={f.slug} />

      {/* -------- Présentation + objectifs -------- */}
      {(f.intro.length > 0 || f.objectives.length > 0) && (
        <section className="border-y border-line bg-ink-2 py-24">
          <div className="container-site grid gap-14 lg:grid-cols-2">
            {f.intro.length > 0 && (
              <Reveal>
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
              <Reveal delay={120}>
                <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">{p.objectives}</h3>
                <ul className="space-y-4">
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
            <Reveal className="mb-12">
              <p className="eyebrow mb-3">{p.programme}</p>
              <h2 className="heading-lg">{p.modules}</h2>
            </Reveal>
            <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {f.modules.map((m, i) => (
                <Reveal as="li" key={i} delay={(i % 3) * 100} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
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
      {(f.prerequisites.length > 0 || f.levelLabel || f.durationLabel || price) && (
        <section className="border-y border-line bg-ink-2 py-20">
          <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="eyebrow mb-3">{p.practical}</p>
              <h2 className="heading-lg">{p.beforeRegister}</h2>
              <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
                {[
                  [p.level, f.levelLabel],
                  [p.duration, f.durationLabel],
                  [p.price, price],
                ].map(([label, value]) => (
                  <div key={label} className="bg-ink p-5">
                    <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{label}</dt>
                    <dd className="mt-1 font-display text-lg tracking-wide uppercase">{value ?? p.onRequest}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={120}>
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
        <div className="container-site flex flex-col items-start justify-between gap-6 border border-line bg-ink-2 p-7 sm:flex-row sm:items-center">
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
        </div>
      </section>

      {/* -------- Formateurs -------- */}
      {f.trainers.length > 0 && (
        <section className="border-t border-line py-24">
          <div className="container-site">
            <Reveal className="mb-10">
              <p className="eyebrow mb-3">{p.team}</p>
              <h2 className="heading-lg">{p.trainers}</h2>
            </Reveal>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {f.trainers.map((trainer) => (
                <li key={trainer.id} className="border border-line bg-ink-2 p-6">
                  {trainer.photoUrl && (
                    <div className="relative mb-5 aspect-square overflow-hidden bg-ink-3">
                      <Image src={trainer.photoUrl} alt={trainer.name} fill unoptimized sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-2xl tracking-wide uppercase">{trainer.name}</h3>
                  {trainer.title && <p className={`mt-1 text-sm ${accent.text}`}>{trainer.title}</p>}
                  {trainer.bio && <p className="mt-3 text-sm leading-relaxed text-mist">{trainer.bio}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* -------- Galerie : photos du site + images et vidéos téléversées -------- */}
      {(defaultGallery.length > 0 || galleryUrls.length > 0 || uploadedImages.length > 0 || videos.length > 0) && (
        <section className="pb-24">
          <div className="container-site space-y-6">
            {videos.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2">
                {videos.map((v) => (
                  <figure key={v.id} className="overflow-hidden border border-line bg-ink-2">
                    <video src={v.url} controls preload="metadata" playsInline className="aspect-video w-full bg-black" />
                    {v.title && <figcaption className="px-4 py-3 text-sm text-mist">{v.title}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              {defaultGallery.map((p, i) => (
                <Reveal key={p.alt} from="zoom" delay={i * 120}>
                  <figure className="group relative aspect-[4/3] overflow-hidden bg-ink-3 sm:aspect-[4/5]">
                    <Image src={p.src} alt={p.alt} fill placeholder="blur" sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </figure>
                </Reveal>
              ))}
              {galleryUrls.map((url) => (
                <figure key={url} className="group relative aspect-[4/3] overflow-hidden bg-ink-3 sm:aspect-[4/5]">
                  <Image src={url} alt={p.imageAlt(f.name)} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </figure>
              ))}
              {uploadedImages.map((m) => (
                <figure key={m.id} className="group relative aspect-[4/3] overflow-hidden bg-ink-3 sm:aspect-[4/5]">
                  <Image src={m.url} alt={m.title || p.imageAlt(f.name)} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------- Public + débouchés -------- */}
      {(f.audience.length > 0 || f.careers.length > 0) && (
        <section className="bg-bone py-24 text-ink">
          <div className="container-site grid gap-10 md:grid-cols-2">
            {[
              { title: p.audience, items: f.audience },
              { title: p.careers, items: f.careers },
            ]
              .filter((col) => col.items.length > 0)
              .map((col, i) => (
                <Reveal key={col.title} delay={i * 120}>
                  <h2 className="mb-6 font-display text-3xl tracking-wide uppercase">{col.title}</h2>
                  <ul className="space-y-3">
                    {col.items.map((it, j) => (
                      <li key={j} className="flex items-center gap-3 border-b border-ink/10 pb-3">
                        <Icon name="star" width={16} height={16} className="shrink-0" /> {it}
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
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-lg">{others.length ? p.discoverAlso : p.readyToStart}</h2>
            <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
              {p.requestRegistration} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          </Reveal>
          {others.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {others.map((o, i) => (
                <Reveal key={o.slug} delay={i * 120}>
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
  const { cover } = visualFor(f.slug);
  return (
    <Link href={`/formations/${f.slug}`} className="group flex items-center gap-6 border border-line bg-ink-2 p-5 transition-colors hover:border-bone/40">
      <div className="relative size-24 shrink-0 overflow-hidden">
        {f.coverUrl ? (
          <Image src={f.coverUrl} alt="" fill unoptimized sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" />
        ) : (
          <Image src={cover.src} alt="" fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" />
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
