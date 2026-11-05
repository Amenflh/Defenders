import Image from "next/image";
import Link from "next/link";
import { visualFor } from "@/lib/formation-visuals";
import { formatPrice, keyFacts, type Formation, type FormationDetail } from "@/lib/formations";
import { DAY_LABELS } from "@/lib/labels";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

/** Page détaillée d'une formation (#17) : contenu issu de l'API, modifiable dans l'espace admin. */
export function FormationPage({ f, others }: { f: FormationDetail; others: Formation[] }) {
  const { accent, photos } = visualFor(f.slug);
  const [defaultHero, ...defaultGallery] = photos;
  const uploadedImages = f.media.filter((m) => m.type === "image" && m.url !== f.coverUrl);
  const galleryUrls = f.galleryUrls.filter((url) => url !== f.coverUrl);
  const videos = f.media.filter((m) => m.type === "video");
  const facts = keyFacts(f);
  const price = formatPrice(f.priceTnd);

  return (
    <>
      {/* -------- Héro -------- */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className={`pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full ${accent.bg} opacity-10 blur-3xl`} />
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <nav aria-label="Fil d'Ariane" className="mb-6 text-xs tracking-[0.2em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">Accueil</Link> <span aria-hidden="true">/</span>{" "}
                <Link href="/formations" className="hover:text-bone">Formations</Link> <span aria-hidden="true">/</span>{" "}
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
                    <div key={fact.label} className="border-r border-line py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                      <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{fact.label}</dt>
                      <dd className="mt-1 font-display text-lg leading-tight tracking-wide uppercase sm:text-xl">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-4">
              <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
                S&apos;inscrire <Icon name="arrow" />
              </Link>
              <Link href={`/planning?discipline=${f.slug}`} className="btn btn-ghost">
                <Icon name="calendar" /> Planning
              </Link>
            </Reveal>
          </div>

          <Reveal from="right" delay={150} className="relative">
            <div className={`absolute -inset-3 border ${accent.border} opacity-40`} aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
              {f.coverUrl ? (
                <Image src={f.coverUrl} alt={`Formation ${f.name}`} fill preload unoptimized sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              ) : (
                <Image src={defaultHero.src} alt={defaultHero.alt} fill preload placeholder="blur" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------- Présentation + objectifs -------- */}
      {(f.intro.length > 0 || f.objectives.length > 0) && (
        <section className="border-y border-line bg-ink-2 py-24">
          <div className="container-site grid gap-14 lg:grid-cols-2">
            {f.intro.length > 0 && (
              <Reveal>
                <p className="eyebrow mb-3">La formation</p>
                <h2 className="heading-lg mb-6">Ce que vous allez apprendre</h2>
                <div className="space-y-4 text-lg leading-relaxed text-mist">
                  {f.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}
            {f.objectives.length > 0 && (
              <Reveal delay={120}>
                <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">Objectifs</h3>
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
              <p className="eyebrow mb-3">Programme</p>
              <h2 className="heading-lg">Les modules</h2>
            </Reveal>
            <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {f.modules.map((m, i) => (
                <Reveal as="li" key={i} delay={(i % 3) * 100} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
                  <span className={`font-display text-sm tracking-[0.3em] ${accent.text}`}>MODULE {String(i + 1).padStart(2, "0")}</span>
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
              <p className="eyebrow mb-3">Infos pratiques</p>
              <h2 className="heading-lg">Avant de vous inscrire</h2>
              <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
                {[
                  ["Niveau", f.levelLabel],
                  ["Durée", f.durationLabel],
                  ["Tarif", price],
                ].map(([label, value]) => (
                  <div key={label} className="bg-ink p-5">
                    <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{label}</dt>
                    <dd className="mt-1 font-display text-lg tracking-wide uppercase">{value ?? "Nous consulter"}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={120}>
              <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">Prérequis</h3>
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
                <p className="text-mist">Aucun prérequis particulier : contactez-nous pour vérifier que la formation correspond à votre profil.</p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* -------- Créneaux de la période en cours -------- */}
      {f.sessions.length > 0 && (
        <section className="py-24">
          <div className="container-site">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-3">Prochaines sessions</p>
                <h2 className="heading-lg">Semaine type</h2>
              </div>
              <Link href={`/planning?discipline=${f.slug}`} className="btn btn-ghost">
                <Icon name="calendar" /> Tout le planning
              </Link>
            </Reveal>
            <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {f.sessions.map((s) => (
                <li key={s.id} className={`border-l-4 ${accent.borderL} bg-ink p-6`}>
                  <p className="font-display text-sm tracking-[0.2em] text-mist uppercase">
                    {DAY_LABELS[s.day] ?? ""} · {s.start} – {s.end}
                  </p>
                  <h3 className="mt-2 font-display text-xl tracking-wide uppercase">{s.title}</h3>
                  <p className="mt-2 text-sm text-mist">
                    {s.format} · {s.level}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* -------- Formateurs -------- */}
      {f.trainers.length > 0 && (
        <section className="border-t border-line py-24">
          <div className="container-site">
            <Reveal className="mb-10">
              <p className="eyebrow mb-3">L&apos;équipe</p>
              <h2 className="heading-lg">Vos formateurs</h2>
            </Reveal>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {f.trainers.map((t) => (
                <li key={t.id} className="border border-line bg-ink-2 p-6">
                  {t.photoUrl && (
                    <div className="relative mb-5 aspect-square overflow-hidden bg-ink-3">
                      <Image src={t.photoUrl} alt={t.name} fill unoptimized sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-2xl tracking-wide uppercase">{t.name}</h3>
                  {t.title && <p className={`mt-1 text-sm ${accent.text}`}>{t.title}</p>}
                  {t.bio && <p className="mt-3 text-sm leading-relaxed text-mist">{t.bio}</p>}
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
                  <Image src={url} alt={`Formation ${f.name}`} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </figure>
              ))}
              {uploadedImages.map((m) => (
                <figure key={m.id} className="group relative aspect-[4/3] overflow-hidden bg-ink-3 sm:aspect-[4/5]">
                  <Image src={m.url} alt={m.title || `Formation ${f.name}`} fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
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
              { title: "Public concerné", items: f.audience },
              { title: "Débouchés", items: f.careers },
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

      {/* -------- Autres formations -------- */}
      <section className="py-24">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-lg">{others.length ? "Découvrez aussi" : "Prêt à vous lancer ?"}</h2>
            <Link href={`/contact?formation=${f.slug}`} className="btn btn-primary">
              Demander une inscription <Icon name="arrow" />
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
    </>
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
      <Icon name="arrow" className="ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
