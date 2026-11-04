export const site = {
  name: "Defenders Fitness Academy",
  shortName: "Defenders",
  tagline: "Des formations certifiantes pour les coachs et les professionnels du sport",
  group: "Defenders Academy",
  approval: "Agrément n° 21-340-24",
  phone: { label: "+216 92 204 005", href: "tel:+21692204005" },
  phone2: { label: "+216 29 039 493", href: "tel:+21629039493" },
  email: { label: "direction-dsp@outlook.com", href: "mailto:direction-dsp@outlook.com" },
  address: {
    lines: ["Avenue Abou Dhabi", "8050 Hammamet, Tunisie"],
    href: "https://www.google.com/maps/search/?api=1&query=Avenue+Abou+Dhabi+Hammamet+8050+Tunisia",
    embedHref: "https://maps.google.com/maps?q=Avenue+Abou+Dhabi+Hammamet+8050+Tunisia&output=embed",
  },
  facebook: {
    label: "Defenders Fitness Academy",
    href: "https://www.facebook.com/DefendersFitnessAcademy",
  },
  instagram: {
    label: "@defenders_fitness_academy",
    href: "https://www.instagram.com/defenders_fitness_academy",
  },
  partners: {
    employment: [
      {
        name: "RITEJ Company for Recruitment",
        role: "Recrutement à l'étranger",
        description: "Agence spécialisée dans le recrutement à l'étranger depuis 2010.",
        href: "https://www.facebook.com/ritejcampanyforrecruitment",
        linkLabel: "Page officielle",
        logo: "/pics/partners/RITEJ-embleme.jpg",
      },
      {
        name: "Bayrak El Arab",
        role: "Recrutement et accompagnement",
        description: "Entretiens, contrats et accompagnement annoncés gratuits. Le recrutement dépend des offres et du profil.",
        href: "https://www.facebook.com/bayrakelarabe",
        instagramHref: "https://www.instagram.com/bayrakelarabe",
        linkLabel: "Facebook",
        logo: "/pics/partners/Bayrak.jpg",
      },
    ],
    training: [
      {
        name: "Tunisian Security Academy",
        role: "Académie partenaire",
        description: "Mentionnée comme co-partenaire dans l'annonce d'accord publiée avec Bayrak El Arab.",
        href: "https://www.facebook.com/profile.php?id=100077382387038",
        linkLabel: "Page officielle",
        logo: "/pics/partners/Security.jpg",
      },
      {
        name: "Sunset Studio Pilates",
        role: "Lieu de formation · Lac 1",
        description: "Studio mentionné dans les annonces de certaines sessions Pilates.",
        href: "https://www.facebook.com/profile.php?id=61579597566910",
        linkLabel: "Page du studio",
        logo: "/pics/partners/Sunset.jpg",
      },
    ],
  },
} as const;

export type NavItem = { href: string; label: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/#formations", label: "Nos formations" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/planning", label: "Planning" },
  { href: "/contact", label: "Contact" },
];
