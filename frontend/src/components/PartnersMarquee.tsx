import Image from "next/image";
import { site } from "@/lib/site";

const partners = [...site.partners.employment, ...site.partners.training];

/** Nombre de copies de la liste : assez pour remplir les grands écrans sans trou pendant le défilement. */
const COPIES = 4;

/**
 * Bandeau des partenaires : logos cliquables qui défilent en continu (comme le bandeau photos).
 * Le défilement se met en pause au survol ou au focus clavier, pour cliquer facilement.
 */
export function PartnersMarquee() {
  // Deux moitiés identiques : la piste se translate de -50 % pour une boucle sans couture.
  const half = Array.from({ length: COPIES / 2 }, () => partners).flat();

  return (
    <section className="border-b border-line bg-ink py-8" aria-labelledby="partners-title">
      <p id="partners-title" className="mb-6 text-center font-display text-xs tracking-[0.28em] text-mist uppercase">
        Nos partenaires
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul
          className="marquee-track animate-marquee flex w-max"
          style={{ "--marquee-duration": "35s" } as React.CSSProperties}
        >
          {[...half, ...half].map((partner, i) => {
            // Seule la première série est lue par les lecteurs d'écran et accessible au clavier.
            const duplicate = i >= partners.length;
            return (
              <li key={i} aria-hidden={duplicate || undefined} className="shrink-0 px-6 sm:px-10">
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={duplicate ? -1 : undefined}
                  title={`${partner.name} — ${partner.role}`}
                  className="group flex w-32 flex-col items-center gap-3 text-center outline-none sm:w-36"
                >
                  <span className="grid size-[76px] place-items-center overflow-hidden rounded-full border border-white/20 bg-white transition duration-300 group-hover:-translate-y-1 group-hover:border-gold group-hover:shadow-[0_10px_30px_rgba(201,162,39,.25)] group-focus-visible:ring-2 group-focus-visible:ring-gold sm:size-[88px]">
                    <Image
                      src={partner.logo}
                      alt={duplicate ? "" : `Logo ${partner.name}`}
                      width={88}
                      height={88}
                      // Les logos entrent dans l'écran par animation : en « lazy » ils resteraient vides.
                      loading="eager"
                      className="size-full object-contain"
                    />
                  </span>
                  <span className="text-[0.7rem] leading-tight text-mist transition-colors group-hover:text-bone">
                    {partner.name}
                    <span className="mt-1 block text-[0.62rem] tracking-[0.12em] text-gold/80 uppercase">{partner.role}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
