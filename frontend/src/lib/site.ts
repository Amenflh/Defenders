export const site = {
  name: "Defenders Fitness Academy",
  shortName: "Defenders",
  tagline: "Centre de formation continue spécialisé en coaching privé et sciences du sport",
  group: "Defenders Academy",
  approval: "Agrément n° 21-340-24",
  phone: { label: "+216 92 204 005", href: "tel:+21692204005" },
  email: { label: "direction-dsp@outlook.com", href: "mailto:direction-dsp@outlook.com" },
  // TODO : remplacer par l'URL exacte de la page Facebook.
  facebook: {
    label: "Tunisian Security Academy",
    href: "https://www.facebook.com/search/top?q=Tunisian%20Security%20Academy",
  },
  partner: "RITEJ — Company for Recruitment",
} as const;

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/pilates", label: "Pilates" },
  { href: "/football", label: "Football" },
  { href: "/personal-training", label: "Personal Training" },
  { href: "/planning", label: "Planning" },
  { href: "/contact", label: "Contact" },
];
