export const site = {
  name: "Defenders Fitness Academy",
  shortName: "Defenders",
  tagline: "Centre de formation continue spécialisé en coaching privé et sciences du sport",
  group: "Defenders Academy",
  approval: "Agrément n° 21-340-24",
  phone: { label: "+216 92 204 005", href: "tel:+21692204005" },
  phone2: { label: "+216 29 039 493", href: "tel:+21629039493" },
  email: { label: "direction-dsp@outlook.com", href: "mailto:direction-dsp@outlook.com" },
  address: {
    lines: ["Avenue Abou Dhabi", "8050 Hammamet, Tunisie"],
    href: "https://www.google.com/maps/search/?api=1&query=Avenue+Abou+Dhabi+Hammamet+8050+Tunisia",
  },
  facebook: {
    label: "Defenders Fitness Academy",
    href: "https://www.facebook.com/DefendersFitnessAcademy",
  },
  instagram: {
    label: "@defenders_fitness_academy",
    href: "https://www.instagram.com/defenders_fitness_academy",
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
