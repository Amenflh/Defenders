import Image from "next/image";
import { site } from "@/lib/site";
import { safeHref } from "@/lib/utils";

export type PublicPartner = { id?: number; name?: string; title?: string; role?: string; subtitle?: string; description?: string; body?: string; href?: string; linkUrl?: string; logo?: string; imageUrl?: string };
type Partner = { name: string; role: string; description: string; href: string; logo: string };
const fallbackPartners: Partner[] = site.partners.map((partner) => ({ ...partner }));

const isRecruiter = (p: Partner) => /bayrak|ritej/i.test(p.name);

/** Rôles des partenaires d'origine (saisis en français dans l'admin), traduits pour l'anglais et l'arabe. */
const ROLE_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  "Recrutement à l'étranger": { en: "Recruitment abroad", ar: "التوظيف بالخارج" },
  "Recrutement et accompagnement": { en: "Recruitment & support", ar: "التوظيف والمرافقة" },
  "Académie partenaire": { en: "Partner academy", ar: "أكاديمية شريكة" },
  "Lieu de formation · Lac 1": { en: "Training venue · Lac 1", ar: "مكان التكوين · البحيرة 1" },
  "Partenaire hôtelier": { en: "Hotel partner", ar: "شريك فندقي" },
};
const isTsa = (p: Partner) => /tunisian security academy/i.test(p.name);

/**
 * Ordre d'affichage : les logos des deux agences de recrutement (Bayrak et RITEJ) ne doivent pas se suivre,
 * la Tunisian Security Academy est placée entre les deux. Golden Tulip est ajouté s'il manque à la liste du CMS.
 */
function arrange(list: Partner[]): Partner[] {
  const partners = [...list];
  if (!partners.some((p) => /golden tulip/i.test(p.name))) partners.push(fallbackPartners.find((p) => /golden tulip/i.test(p.name))!);
  const recruiters = partners.filter(isRecruiter);
  const tsa = partners.find(isTsa);
  if (recruiters.length === 2 && tsa) {
    const others = partners.filter((p) => !isRecruiter(p) && p !== tsa);
    return [recruiters[0], tsa, recruiters[1], ...others];
  }
  return partners;
}

/** Nombre de copies de la liste : assez pour remplir les grands écrans sans trou pendant le défilement. */
const COPIES = 4;

/**
 * Bandeau des partenaires : logos cliquables qui défilent en continu (comme le bandeau photos).
 * Le défilement se met en pause au survol ou au focus clavier, pour cliquer facilement.
 */
export function PartnersMarquee({ partners: inputPartners, title = "Nos partenaires", locale = "fr" }: { partners?: PublicPartner[]; title?: string; locale?: "fr" | "en" | "ar" }) {
  const partners = arrange((inputPartners?.length ? inputPartners.map((partner) => ({
    name: partner.title || partner.name || "",
    role: partner.subtitle || partner.role || "",
    description: partner.body || partner.description || "",
    href: safeHref(partner.linkUrl || partner.href),
    logo: partner.imageUrl || partner.logo || "/pics/logo.jpg",
  })) : fallbackPartners).filter((partner) => partner.name));
  // Deux moitiés identiques : la piste se translate de -50 % pour une boucle sans couture.
  // Copie traduite : les objets de repli sont partagés entre les requêtes, on ne les modifie jamais.
  const shown = locale === "fr" ? partners : partners.map((p) => ({ ...p, role: ROLE_TRANSLATIONS[p.role]?.[locale] ?? p.role }));
  const half = Array.from({ length: COPIES / 2 }, () => shown).flat();

  return (
    <section className="border-b border-line bg-ink py-8" aria-labelledby="partners-title">
      <p id="partners-title" className="mb-6 text-center font-display text-xs tracking-[0.28em] text-mist uppercase">
        {title}
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
                  <span className="grid size-[76px] place-items-center overflow-hidden rounded-full border border-white/20 bg-white transition duration-300 group-hover:-translate-y-1 group-hover:border-gold group-hover:shadow-[0_10px_30px_rgba(205,180,140,.25)] group-focus-visible:ring-2 group-focus-visible:ring-gold sm:size-[88px]">
                    <Image
                      src={partner.logo}
                      alt={duplicate ? "" : `Logo ${partner.name}`}
                      width={88}
                      height={88}
                      // Les logos entrent dans l'écran par animation : en « lazy » ils resteraient vides.
                      loading="eager"
                      unoptimized={partner.logo.endsWith(".svg")}
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
