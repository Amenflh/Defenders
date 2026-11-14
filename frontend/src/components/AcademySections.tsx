import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

/** Present the three independent organizations without implying a fourth division. */
export function BranchesSection({ t }: { t: Dictionary }) {
  return (
    <div className="container-site">
      <Reveal className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3">{t.branches.eyebrow}</p>
        <h2 className="heading-lg">{t.branches.title}</h2>
        <p className="mt-5 text-lg text-mist">{t.branches.intro}</p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {site.branches.map((branch, i) => {
          const copy = t.branches.items[i];
          return (
            <Reveal key={branch.name} delay={i * 100} className="h-full">
              <Link href={branch.href} className="branch-card group relative flex h-full min-h-[28rem] flex-col items-center overflow-hidden border border-line bg-ink-2 px-6 pt-14 pb-8 text-center transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_24px_60px_-28px_rgba(197,151,73,0.55)] sm:px-8">
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(197,151,73,0.14),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute start-5 top-5 z-10 border border-white/25 px-2.5 py-1 font-display text-xs tracking-[0.16em] text-bone">
                  0{i + 1}
                </span>
                {branch.logo && (
                  <span className="relative z-10 grid size-36 place-items-center overflow-hidden rounded-full bg-white p-2 shadow-2xl ring-4 ring-white/10 transition duration-500 group-hover:scale-105 group-hover:ring-gold/40 sm:size-40">
                    <Image src={branch.logo} alt={`${branch.name} logo`} width={160} height={160} className="size-full rounded-full object-contain" />
                  </span>
                )}
                <h3 className="relative z-10 mt-8 font-display text-3xl leading-tight uppercase text-bone">{branch.name}</h3>
                <p className="relative z-10 mt-4 flex-1 text-base leading-relaxed text-mist">{copy.text}</p>
                <span className="relative z-10 mt-8 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] text-gold uppercase">
                  {copy.cta}
                  <Icon name="arrow" className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/** Points forts : suivi médical, exclusivité nationale (football & sécurité), agrément. */
export function HighlightsSection({ t, approval }: { t: Dictionary; approval: string }) {
  const h = t.highlights;
  return (
    <div className="container-site">
      <Reveal className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3">{h.eyebrow}</p>
        <h2 className="heading-lg">{h.title}</h2>
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        <Reveal className="border border-line bg-ink-2 p-7">
          <span className="grid size-12 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="medical" /></span>
          <h3 className="mt-5 font-display text-xl uppercase">{h.medical.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist">{h.medical.text}</p>
        </Reveal>

        <Reveal delay={100} className="relative overflow-hidden border border-gold/50 bg-gradient-to-br from-gold/15 via-ink-2 to-ink-2 p-7">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-1">
              <span className="grid size-12 place-items-center rounded-full bg-gold text-ink"><Icon name="award" /></span>
              <h3 className="mt-5 font-display text-2xl uppercase">{h.exclusive.title}</h3>
              <p className="mt-2 flex gap-2">
                <span className="accent-football border border-gold px-2 py-0.5 font-display text-xs tracking-[0.12em] text-gold uppercase">Football</span>
                <span className="border border-bone/40 px-2 py-0.5 font-display text-xs tracking-[0.12em] text-bone uppercase">{t.nav.security}</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-mist">{h.exclusive.text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={site.documents.otdav} target="_blank" rel="noreferrer" className="btn btn-primary !px-4 !py-2.5 !text-xs">
                  <Icon name="file" width={16} height={16} /> {h.exclusive.certificate}
                </a>
                <a href={site.documents.exclusivityPost} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4 !py-2.5 !text-xs">
                  <Icon name="facebook" width={16} height={16} /> {h.exclusive.post}
                </a>
              </div>
            </div>
            <a href={site.documents.otdav} target="_blank" rel="noreferrer" className="group relative mx-auto block w-36 shrink-0 self-center overflow-hidden border border-line bg-white shadow-2xl sm:w-40">
              <Image src={site.documents.otdav} alt="Certificat de dépôt OTDAV — programme de formation des entraîneurs de football" width={160} height={223} className="h-auto w-full transition duration-500 group-hover:scale-105" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={200} className="border border-line bg-ink-2 p-7">
          <span className="grid size-12 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="shield" /></span>
          <h3 className="mt-5 font-display text-xl uppercase">{h.approved.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist">{h.approved.text}</p>
          <p className="mt-4 font-display text-sm tracking-[0.12em] text-gold uppercase">{approval}</p>
        </Reveal>
      </div>
    </div>
  );
}
