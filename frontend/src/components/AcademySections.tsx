import Image from "next/image";
import Link from "next/link";
import { formationHref } from "@/lib/academies";
import { visualFor } from "@/lib/formation-visuals";
import type { Formation } from "@/lib/formations";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";
import { FormationsIndex, type FormationsIndexItem } from "./FormationsIndex";
import { Icon } from "./Icon";
import { Reveal } from "./Reveal";

/** Les deux filières (Fitness et Tunisian Security Academy, qui inclut la sécurité / protection). */
export function BranchesSection({ t, formations: list }: { t: Dictionary; formations: Formation[] }) {
  // Toutes les formations publiées des deux académies (admin › Formations).
  const formations: FormationsIndexItem[] = list.map((f) => ({
    href: formationHref(f),
    title: f.name,
    academy: f.academy === "tsa" ? t.nav.akAcademy : t.nav.fitnessAcademy,
    detail: f.headline || f.durationLabel || "",
    image: f.coverUrl || visualFor(f.accent).cover.src,
  }));
  return (
    <div className="container-site">
      <Reveal from="left" className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3">{t.branches.eyebrow}</p>
        <h2 className="heading-lg">{t.branches.title}</h2>
        <p className="mt-5 text-lg text-mist">{t.branches.intro}</p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2">
        {site.branches.map((branch, i) => {
          const copy = t.branches.items[i];
          return (
            <Reveal key={branch.name} from={i % 2 === 0 ? "left" : "right"} delay={i * 120} className="h-full">
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

      <div className="mt-20 lg:mt-28">
        <Reveal from="left" className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h3 className="heading-lg">{t.common.allFormations}</h3>
          <Link href="/formations" className="inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-bone">
            {t.nav.formations} <Icon name="arrow" width={16} height={16} className="rtl:-scale-x-100" />
          </Link>
        </Reveal>
        <FormationsIndex items={formations} />
      </div>
    </div>
  );
}
