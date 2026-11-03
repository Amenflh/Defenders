import Image from "next/image";
import Link from "next/link";
import type { Discipline } from "@/lib/disciplines";
import { disciplineList } from "@/lib/disciplines";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

export function DisciplinePage({ d }: { d: Discipline }) {
  const [hero, ...gallery] = d.photos;
  const others = disciplineList.filter((o) => o.slug !== d.slug);

  return (
    <>
      {/* -------- Héro -------- */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className={`pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full ${d.accent.bg} opacity-10 blur-3xl`} />
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <nav aria-label="Fil d'Ariane" className="mb-6 text-xs tracking-[0.2em] text-mist uppercase">
                <Link href="/" className="hover:text-bone">Accueil</Link> <span aria-hidden="true">/</span>{" "}
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
                S&apos;inscrire <Icon name="arrow" />
              </Link>
              <Link href={`/planning?discipline=${d.slug}`} className="btn btn-ghost">
                <Icon name="calendar" /> Planning
              </Link>
            </Reveal>
          </div>

          <Reveal from="right" delay={150} className="relative">
            <div className={`absolute -inset-3 border ${d.accent.border} opacity-40`} aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
              <Image src={hero.src} alt={hero.alt} fill preload placeholder="blur" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------- Présentation + objectifs -------- */}
      <section className="border-y border-line bg-ink-2 py-24">
        <div className="container-site grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-3">La formation</p>
            <h2 className="heading-lg mb-6">Ce que vous allez apprendre</h2>
            <div className="space-y-4 text-lg leading-relaxed text-mist">
              {d.intro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h3 className="mb-6 font-display text-2xl tracking-wide uppercase">Objectifs</h3>
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
            <p className="eyebrow mb-3">Programme</p>
            <h2 className="heading-lg">Les modules</h2>
          </Reveal>
          <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {d.modules.map((m, i) => (
              <Reveal as="li" key={m.title} delay={(i % 3) * 100} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
                <span className={`font-display text-sm tracking-[0.3em] ${d.accent.text}`}>MODULE 0{i + 1}</span>
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
                      placeholder="blur"
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
            { title: "Public concerné", items: d.audience },
            { title: "Débouchés", items: d.careers },
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

      {/* -------- Autres formations -------- */}
      <section className="py-24">
        <div className="container-site">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="heading-lg">Découvrez aussi</h2>
            <Link href={`/contact?formation=${d.slug}`} className="btn btn-primary">
              Demander une inscription <Icon name="arrow" />
            </Link>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 120}>
                <Link href={`/${o.slug}`} className="group flex items-center gap-6 border border-line bg-ink-2 p-5 transition-colors hover:border-bone/40">
                  <div className="relative size-24 shrink-0 overflow-hidden">
                    <Image src={o.cover.src} alt="" fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl tracking-wide uppercase">{o.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-mist">{o.headline}</p>
                  </div>
                  <Icon name="arrow" className="ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
