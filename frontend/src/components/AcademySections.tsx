import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";
import { pilatesPhotos } from "@/lib/images";
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
          const isFitness = branch.key === "fitness";
          return (
            <Reveal key={branch.name} delay={i * 100} className="h-full">
              <Link href={branch.href} className="group relative flex h-full min-h-[26rem] flex-col overflow-hidden border border-line bg-ink-2 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-gold hover:bg-ink-3">
                <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-line bg-ink">
                  {isFitness ? (
                    <Image
                      src={pilatesPhotos[0].src}
                      alt={pilatesPhotos[0].alt}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span aria-hidden="true" className={`absolute inset-0 ${branch.key === "tsa" ? "bg-[radial-gradient(circle_at_center,rgba(197,151,73,0.12),transparent_65%)]" : "bg-[radial-gradient(circle_at_center,rgba(197,151,73,0.16),transparent_65%)]"}`} />
                  )}
                  {branch.logo && (
                    <span className={`relative z-10 grid size-28 place-items-center overflow-hidden rounded-full p-2 shadow-2xl ${isFitness ? "bg-white/95 ring-1 ring-white/60" : "bg-white ring-1 ring-black/10"}`}>
                      <Image src={branch.logo} alt={`${branch.name} logo`} width={112} height={112} className="size-full rounded-full object-contain" />
                    </span>
                  )}
                  <span className="absolute start-5 top-5 z-10 border border-white/25 bg-ink/80 px-2.5 py-1 font-display text-xs tracking-[0.16em] text-bone">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="font-display text-2xl uppercase text-bone">{branch.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{copy.text}</p>
                  <span className="mt-7 inline-flex items-center gap-2 font-display text-sm tracking-[0.15em] text-gold uppercase">
                    {copy.cta}
                    <Icon name="arrow" className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </span>
                </div>
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
