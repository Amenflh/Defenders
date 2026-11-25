import type { SiteData } from "./i18n/client";
import type { Dictionary } from "./i18n/dictionaries";
import { mainNav } from "./site";

export type SearchGroup = "formations" | "pages" | "questions" | "contact";
export type SearchIcon = "fitness" | "shield" | "page" | "question" | "phone" | "mail" | "pin";

export type SearchItem = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  icon: SearchIcon;
  external?: boolean;
  /** Synonymes et termes voisins (toutes langues) : « chien » trouve la formation K9. */
  keywords?: string;
};

/** Minuscules, sans accents ni voyelles arabes, variantes d'alif et de ta marbuta unifiées. */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}+]+/gu, " ")
    .trim();
}

const SYNONYMS: Record<string, string> = {
  pilates: "reformer studio fitness posture souplesse gainage بيلاتس",
  football: "foot soccer entraineur coach gardien preparation physique directeur technique كرة القدم مدرب",
  "personal-training": "coach sportif personnel musculation fitness salle gym مدرب شخصي",
  k9: "chien canin cynophile dog maitre chien attaque obeissance كلاب كلب",
  "protection-rapprochee": "garde du corps bodyguard vip escorte close protection حراسة شخصية",
  "intervention-initiale": "terrorisme evacuation premiers secours crise first response تدخل",
  "securite-protection": "agent de securite gardiennage surveillance dsp حراسة امن",
};

/**
 * Index de recherche : formations publiées, pages, questions fréquentes et coordonnées de l'admin, dans la langue
 * du visiteur. Aucune requête réseau, résultats instantanés.
 */
export function buildSearchIndex(t: Dictionary, { formations, faqs, contacts }: SiteData): SearchItem[] {
  const items: SearchItem[] = formations.map((f) => ({
    id: `formation-${f.slug}`,
    group: "formations",
    title: f.name,
    subtitle: [f.academy === "tsa" ? t.nav.akAcademy : t.nav.fitnessAcademy, f.headline].filter(Boolean).join(" · "),
    href: f.href,
    icon: f.academy === "tsa" ? "shield" : "fitness",
    keywords: `${f.summary} ${SYNONYMS[f.slug] ?? ""}`,
  }));

  // Sous-titre lisible plutôt que l'adresse technique de la page.
  const pageDescriptions: Partial<Record<(typeof mainNav)[number]["key"], string>> = {
    fitnessAcademy: t.pages.fitnessAcademy.metaDescription,
    akAcademy: t.pages.akAcademy.metaDescription,
    security: t.pages.security.metaDescription,
    formations: t.common.allFormations,
    planning: t.common.planningLink,
    gallery: t.home.promotionsTitle,
    contact: t.home.faqText,
  };
  for (const item of mainNav) {
    items.push({ id: `page-${item.key}`, group: "pages", title: t.nav[item.key], subtitle: pageDescriptions[item.key] ?? "", href: item.href, icon: "page" });
  }
  items.push(
    { id: "page-quiz", group: "pages", title: t.pages.quiz.title, subtitle: t.pages.quiz.metaDescription, href: "/trouver-ma-formation", icon: "page", keywords: "quiz orientation test profil" },
    { id: "page-testimonials", group: "pages", title: t.nav.testimonials, subtitle: "", href: "/#temoignages", icon: "page", keywords: "avis retours stagiaires reviews" },
    { id: "page-faq", group: "pages", title: t.nav.faq, subtitle: t.home.faqTitle, href: "/#faq", icon: "page" },
    { id: "page-rules", group: "pages", title: t.common.rules, subtitle: "", href: "/reglement-interieur", icon: "page" },
    { id: "page-legal", group: "pages", title: t.common.legal, subtitle: "", href: "/mentions-legales", icon: "page" },
    { id: "page-privacy", group: "pages", title: t.common.privacy, subtitle: "", href: "/politique-de-confidentialite", icon: "page", keywords: "rgpd donnees personnelles" },
  );

  faqs.forEach((faq, index) => {
    items.push({ id: `faq-${index}`, group: "questions", title: faq.question, subtitle: faq.answer, href: "/#faq", icon: "question" });
  });

  items.push(
    { id: "contact-phone", group: "contact", title: `${t.search.callUs} ${contacts.phone.label}`, subtitle: t.nav.fitnessAcademy, href: contacts.phone.href, icon: "phone", keywords: "telephone tel numero appel" },
    { id: "contact-phone2", group: "contact", title: `${t.search.callUs} ${contacts.phone2.label}`, subtitle: t.nav.security, href: contacts.phone2.href, icon: "phone", keywords: "telephone tel numero appel" },
    { id: "contact-whatsapp", group: "contact", title: contacts.whatsapp.label, subtitle: contacts.phone2.label, href: contacts.whatsapp.href, icon: "phone", external: true, keywords: "whatsapp message" },
    { id: "contact-email", group: "contact", title: t.search.writeUs, subtitle: contacts.email.label, href: contacts.email.href, icon: "mail", keywords: "email mail courriel" },
    { id: "contact-address", group: "contact", title: t.search.findUs, subtitle: contacts.address.lines.join(", "), href: contacts.address.href, icon: "pin", external: true, keywords: "adresse hammamet carte maps localisation" },
  );

  return items;
}

type Indexed = SearchItem & { normTitle: string; normText: string };

export function prepareIndex(items: SearchItem[]): Indexed[] {
  return items.map((item) => ({
    ...item,
    normTitle: normalize(item.title),
    normText: normalize(`${item.subtitle} ${item.keywords ?? ""}`),
  }));
}

/** Chaque mot de la requête doit apparaître ; le titre compte plus que le texte, un début de mot plus qu'un milieu. */
export function searchIndex(index: Indexed[], query: string, limit = 12): SearchItem[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const scored: { item: Indexed; score: number }[] = [];
  for (const item of index) {
    let score = 0;
    let matched = true;
    for (const token of tokens) {
      const titleAt = item.normTitle.indexOf(token);
      if (titleAt === 0) score += 100;
      else if (titleAt > 0 && item.normTitle[titleAt - 1] === " ") score += 60;
      else if (titleAt > 0) score += 35;
      else if (item.normText.includes(` ${token}`) || item.normText.startsWith(token)) score += 18;
      else if (item.normText.includes(token)) score += 8;
      else {
        matched = false;
        break;
      }
    }
    if (matched) scored.push({ item, score: score + (item.group === "formations" ? 6 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(({ item }) => item);
}
