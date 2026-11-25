import Image from "next/image";
import type { Contacts } from "@/lib/contacts";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

/**
 * « Ce qui nous distingue » : l'exclusivité nationale en vedette (bordure lumineuse, certificat en relief, sceau
 * tournant), le suivi médical (tracé cardiaque animé) et l'agrément (numéro en grand). Animations en CSS seul,
 * coupées si le visiteur préfère moins de mouvement (voir .hl-* dans globals.css).
 */
export function HighlightsSection({ t, approval, documents }: { t: Dictionary; approval: string; documents: Contacts["documents"] }) {
  const h = t.highlights;
  const number = approval.match(/\d[\d\s./-]*\d/)?.[0];

  return (
    <div className="container-site">
      <Reveal from="left" className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3">{h.eyebrow}</p>
        <h2 className="heading-lg">{h.title}</h2>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr] lg:grid-rows-2">
        {/* -------- Exclusivité nationale -------- */}
        <Reveal from="left" className="hl-glow group relative isolate overflow-hidden p-px lg:row-span-2">
          <div className="relative grid h-full gap-10 overflow-hidden bg-ink-2 p-6 sm:p-9 md:grid-cols-[1.25fr_0.75fr] md:items-center">
            <span aria-hidden="true" className="pointer-events-none absolute -top-32 -start-32 size-96 rounded-full bg-gold/20 blur-3xl" />
            <span aria-hidden="true" className="hl-grid pointer-events-none absolute inset-0" />
            <div className="relative">
              <span className="grid size-16 place-items-center rounded-full bg-gold text-ink shadow-[0_0_0_8px_color-mix(in_oklab,var(--color-gold)_18%,transparent)]">
                <Icon name="award" width={30} height={30} />
              </span>
              <h3 className="mt-7 font-display text-4xl leading-none uppercase text-bone sm:text-5xl">{h.exclusive.title}</h3>
              <p className="mt-5 flex flex-wrap gap-2">
                <span className="accent-football border border-gold bg-gold/10 px-3 py-1 font-display text-xs tracking-[0.14em] text-gold uppercase">Football</span>
                <span className="border border-gold/50 bg-gold/10 px-3 py-1 font-display text-xs tracking-[0.14em] text-gold uppercase">{t.nav.security}</span>
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-mist">{h.exclusive.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={documents.otdav} target="_blank" rel="noreferrer" className="btn btn-primary !px-5 !py-3 !text-xs">
                  <Icon name="file" width={16} height={16} /> {h.exclusive.certificate}
                </a>
                <a href={documents.exclusivityPost} target="_blank" rel="noreferrer" className="btn btn-ghost !px-5 !py-3 !text-xs">
                  <Icon name="facebook" width={16} height={16} /> {h.exclusive.post}
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[15rem] py-4">
              <span aria-hidden="true" className="absolute inset-6 rotate-6 border border-gold/40 bg-gold/15 transition-transform duration-700 group-hover:rotate-12" />
              <span aria-hidden="true" className="absolute inset-6 -rotate-3 border border-line bg-ink-3 transition-transform duration-700 group-hover:-rotate-6" />
              <a href={documents.otdav} target="_blank" rel="noreferrer" aria-label={h.exclusive.certificate} className="hl-paper relative block overflow-hidden bg-white shadow-2xl ring-1 ring-black/10">
                <Image src={documents.otdav} alt={h.exclusive.certificate} width={320} height={446} unoptimized={!documents.otdav.startsWith("/pics/")} className="h-auto w-full" />
                <span aria-hidden="true" className="hl-shine absolute inset-0" />
              </a>
              <svg aria-hidden="true" viewBox="0 0 120 120" direction="ltr" style={{ direction: "ltr" }} className="absolute -bottom-3 -end-3 size-28 drop-shadow-xl sm:size-32">
                <circle cx="60" cy="60" r="58" className="fill-gold" />
                <circle cx="60" cy="60" r="37" className="fill-none stroke-ink" strokeWidth="1.2" strokeDasharray="2 3" />
                <defs><path id="hl-seal-path" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
                <g className="hl-seal">
                  <text className="fill-ink font-display" fontSize="11.5" letterSpacing="2.1">
                    <textPath href="#hl-seal-path">DEFENDERS ACADEMY · TUNISIE ·</textPath>
                  </text>
                </g>
                <path d="M60 38l6.2 12.6 13.9 2-10 9.8 2.3 13.8L60 69.7l-12.4 6.5 2.4-13.8-10.1-9.8 13.9-2z" className="fill-ink" />
              </svg>
            </div>
          </div>
        </Reveal>

        {/* -------- Suivi médical -------- */}
        <Reveal from="right" delay={120} className="card-hover relative isolate flex flex-col justify-between gap-6 overflow-hidden border border-line bg-ink-2 p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <span className="hl-pulse relative grid size-14 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="medical" width={26} height={26} /></span>
            <div>
              <h3 className="font-display text-2xl leading-tight uppercase text-bone">{h.medical.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{h.medical.text}</p>
            </div>
          </div>
          <svg aria-hidden="true" viewBox="0 0 400 60" preserveAspectRatio="none" className="-mx-8 -mb-3 h-14 w-[calc(100%+4rem)] text-gold">
            <path d="M0 34 H90 L104 26 L116 34 H140 L152 6 L168 56 L180 34 H214 L228 22 L242 34 H400" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path pathLength="100" d="M0 34 H90 L104 26 L116 34 H140 L152 6 L168 56 L180 34 H214 L228 22 L242 34 H400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="hl-ecg" />
          </svg>
        </Reveal>

        {/* -------- Centre agréé -------- */}
        <Reveal from="right" delay={220} className="card-hover relative isolate flex flex-col justify-between gap-6 overflow-hidden border border-line bg-ink-2 p-6 sm:p-8">
          <Icon name="shield" width={220} height={220} className="pointer-events-none absolute -end-10 -bottom-12 -z-10 text-gold/10" />
          <div className="flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="shield" width={26} height={26} /></span>
            <div>
              <h3 className="font-display text-2xl leading-tight uppercase text-bone">{h.approved.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{h.approved.text}</p>
            </div>
          </div>
          <p>
            {number && <span dir="ltr" className="block text-[0.65rem] tracking-[0.24em] text-mist uppercase rtl:text-right">{approval.replace(number, "").trim()}</span>}
            <span dir="ltr" className="hl-number mt-1 block w-fit font-display text-5xl leading-none tracking-wide sm:text-6xl">{number ?? approval}</span>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
