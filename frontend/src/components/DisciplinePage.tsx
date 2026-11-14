import Image from "next/image";
import Link from "next/link";
import type { Discipline } from "@/lib/disciplines";
import { disciplineList } from "@/lib/disciplines";
import { mergeFormationContent, type FormationContent } from "@/lib/formation-content";
import { apiFetch } from "@/lib/session";
import { localizeFormation } from "@/lib/formation-i18n";
import { getDictionary } from "@/lib/i18n/server";
import { accentClassFor } from "@/lib/formation-visuals";
import { site } from "@/lib/site";
import { FacebookVideoEmbed } from "./FacebookVideoEmbed";
import { FormationHighlights, FormationHistoryLink } from "./FormationExtras";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

export async function DisciplinePage({ d: source }: { d: Discipline }) {
  const { locale, t } = await getDictionary();
  const p = t.pages.formation;
  const d = localizeFormation(source, locale);
  const personalTrainingVideos = d.slug === "personal-training"
    ? {
        embedUrls: site.facebook.personalTrainingVideoEmbeds,
        titles: [p.personalTrainingVideo1, p.personalTrainingVideo2, p.personalTrainingVideo3],
      }
    : null;
  const [hero, ...gallery] = d.photos;
  const relatedRes = await apiFetch("/api/formations");
  const others = relatedRes.ok
    ? (((await relatedRes.json()) as { formations: FormationContent[] }).formations)
        .filter((formation) => formation.slug !== d.slug)
        .map((formation) => localizeFormation(mergeFormationContent(undefined, formation), locale))
    : disciplineList.filter((formation) => formation.slug !== d.slug).map((formation) => localizeFormation(formation, locale));

  return (
    <div className={accentClassFor(d.slug)}>
      {/* -------- Héro -------- */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className={`pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full ${d.accent.bg} opacity-10 blur-3xl`} />
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <nav aria-label={p.breadcrumb} className="mb-6 text-xs tracking-[0.2em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">{t.nav.home}</Link> <span aria-hidden="true">/</span>{" "}
                <span className={d.accent.text}>{d.name}</span>
              </nav>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="heading-xl">{d.name}</h1>
              <p className={`mt-4 font-display text-xl tracking-wide uppercase ${d.accent.text}`}>{d.headline}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{d.summary}</p>
            </Reveal>
            {personalTrainingVideos && (
              <Reveal delay={200}>
                <p className="mt-5 max-w-xl border-s-2 border-gold/60 bg-ink-2 p-5 text-sm leading-relaxed text-mist">{p.personalTrainingVideoDetails}</p>
              </Reveal>
            )}
            <Reveal delay={240}>
              <dl className="mt-10 grid grid-cols-3 border-y border-line">
                {d.facts.map((f) => (
                  <div key={f.label} className="border-r border-line py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                    <dt className="text-[0.65rem] tracking-[0.2em] text-mist uppercase">{f.label}</dt>
                    <dd className="mt-1 font-display text-lg leading-tight tracking-wide uppercase sm:text-xl">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-4">
              <Link href={`/contact?formation=${d.slug}`} className="btn btn-primary">
                {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
              <Link href="/planning" className="btn btn-ghost">
                <Icon name="calendar" /> {t.nav.planning}
              </Link>
            </Reveal>
          </div>

          <Reveal from="right" delay={150} className="relative">
            {personalTrainingVideos ? (
              <ul className="grid items-start gap-3 sm:grid-cols-2">
                {personalTrainingVideos.embedUrls.map((url, index) => (
                  <li key={url} className="overflow-hidden border border-line bg-ink-2">
                    <FacebookVideoEmbed url={url} title={personalTrainingVideos.titles[index]} />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className={`absolute -inset-3 border ${d.accent.border} opacity-40`} aria-hidden="true" />
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
                  <Image src={hero.src} alt={hero.alt} fill preload placeholder={typeof hero.src === "string" ? "empty" : "blur"} unoptimized={typeof hero.src === "string"} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                </div>
              </>
            )}
          </Reveal>
        </div>
      </section>

      <FormationHighlights slug={d.slug} />

      {/* -------- Présentation + objectifs -------- */}
      <section className="border-y border-line bg-ink-2 py-24">
        <div className="container-site grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-3">{p.theFormation}</p>
            <h2 className="heading-lg mb-6">{p.whatYouLearn}</h2>
            <div className="space-y-4 text-lg leading-relaxed text-mist">
              {d.intro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">{p.objectives}</h3>
            <ul className="space-y-4">
              {d.objectives.map((o) => (
                <li key={o} className="flex gap-4 border-b border-line pb-4">
                  <Icon name="check" className={`mt-0.5 shrink-0 ${d.accent.text}`} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* -------- Modules -------- */}
      <section className="py-24">
        <div className="container-site">
          <Reveal className="mb-12">
            <p className="eyebrow mb-3">{p.programme}</p>
            <h2 className="heading-lg">{p.modules}</h2>
          </Reveal>
          <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {d.modules.map((m, i) => (
              <Reveal as="li" key={m.title} delay={(i % 3) * 100} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
                <span className={`font-display text-sm tracking-[0.3em] ${d.accent.text}`}>{p.module.toUpperCase()} 0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl tracking-wide uppercase">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{m.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* -------- Galerie -------- */}
      {gallery.length > 0 && (
        <section className="pb-24">
          <div className="container-site">
            <div className={`grid gap-6 ${gallery.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
              {gallery.map((p, i) => (
                <Reveal key={p.alt} from="zoom" delay={i * 120}>
                  <figure
                    className={`group relative overflow-hidden bg-ink-3 ${gallery.length > 1 ? "aspect-[4/3] sm:aspect-[4/5]" : "aspect-video"}`}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      placeholder={typeof p.src === "string" ? "empty" : "blur"}
                      unoptimized={typeof p.src === "string"}
                      sizes={gallery.length > 1 ? "(min-width: 640px) 50vw, 100vw" : "100vw"}
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------- Public + débouchés -------- */}
      <section className="bg-bone py-24 text-ink">
        <div className="container-site grid gap-10 md:grid-cols-2">
          {[
            { title: p.audience, items: d.audience },
            { title: p.careers, items: d.careers },
          ].map((col, i) => (
            <Reveal key={col.title} delay={i * 120}>
              <h2 className="mb-6 font-display text-3xl tracking-wide uppercase">{col.title}</h2>
              <ul className="space-y-3">
                {col.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 border-b border-ink/10 pb-3">
                    <Icon name="star" width={16} height={16} className="shrink-0" /> {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------- Lien vers l'historique des sessions -------- */}
      <FormationHistoryLink slug={d.slug} />

      {/* -------- Autres formations -------- */}
      <section className="py-24">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-lg">{p.discoverAlso}</h2>
            <Link href={`/contact?formation=${d.slug}`} className="btn btn-primary">
              {p.requestRegistration} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 120}>
                <Link href={`/${o.slug}`} className="group flex items-center gap-6 border border-line bg-ink-2 p-5 transition-colors hover:border-bone/40">
                  <div className="relative size-24 shrink-0 overflow-hidden">
                    <Image src={o.cover.src} alt="" fill placeholder={typeof o.cover.src === "string" ? "empty" : "blur"} unoptimized={typeof o.cover.src === "string"} sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl tracking-wide uppercase">{o.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-mist">{o.headline}</p>
                  </div>
                  <Icon name="arrow" className="ms-auto shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
