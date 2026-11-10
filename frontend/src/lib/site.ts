export const site = {
  name: "Defenders Academy",
  shortName: "Defenders",
  descriptor: "Academy",
  tagline: "Sécurité, protection et formations certifiantes pour les professionnels du sport",
  group: "Defenders Academy",
  /** Les trois filières de Defenders Academy. */
  branches: [
    { name: "Defenders Security Protection", href: "/securite", logo: "/pics/logo.jpg" },
    { name: "Defenders Fitness Academy", href: "/formations", logo: "/pics/logo.jpg" },
    { name: "A.K Tunisian Security Academy", href: "/securite", logo: "/pics/partners/TSA-logo.jpg" },
  ],
  approval: "Agrément n° 21-340-24",
  phone: { label: "+216 92 204 005", href: "tel:+21692204005" },
  phone2: { label: "+216 29 039 493", href: "tel:+21629039493" },
  email: { label: "direction-dsp@outlook.com", href: "mailto:direction-dsp@outlook.com" },
  securityEmail: { label: "akkari-dsp@outlook.com", href: "mailto:akkari-dsp@outlook.com" },
  whatsapp: { label: "WhatsApp", href: "https://wa.me/21629039493" },
  /** Messenger : les conversations ouvertes depuis les publicités Meta (« Envoyer un message ») arrivent ici. */
  messenger: { label: "Messenger", href: "https://m.me/DefendersFitnessAcademy" },
  documents: {
    rules: "/pics/documents/reglement-interieur-defenders.pdf",
    otdav: "/pics/documents/certificat-otdav-football.jpg",
    /** Publication Facebook annonçant l'exclusivité des formations football et sécurité. */
    exclusivityPost: "https://www.facebook.com/story.php?story_fbid=122176704962936428&id=61578092844519",
  },
  securityFacebook: [
    { label: "Defenders Security Protection", href: "https://www.facebook.com/100077382387038" },
    { label: "Defenders Security Protection", href: "https://www.facebook.com/profile.php?id=61556110269629" },
  ],
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
  /**
   * Partenaires, dans l'ordre d'affichage du bandeau : les deux agences de recrutement
   * (Bayrak et RITEJ) sont séparées par la Tunisian Security Academy.
   */
  partners: [
    {
      name: "Bayrak El Arab",
      role: "Recrutement et accompagnement",
      description: "Entretiens, contrats et accompagnement annoncés gratuits. Le recrutement dépend des offres et du profil.",
      href: "https://www.facebook.com/bayrakelarabe",
      logo: "/pics/partners/Bayrak.jpg",
    },
    {
      name: "Tunisian Security Academy",
      role: "Académie partenaire",
      description: "Mentionnée comme co-partenaire dans l'annonce d'accord publiée avec Bayrak El Arab.",
      href: "https://www.facebook.com/profile.php?id=100077382387038",
      logo: "/pics/partners/TSA-logo.jpg",
    },
    {
      name: "RITEJ Company for Recruitment",
      role: "Recrutement à l'étranger",
      description: "Agence spécialisée dans le recrutement à l'étranger depuis 2010.",
      href: "https://www.facebook.com/ritejcampanyforrecruitment",
      logo: "/pics/partners/RITEJ-embleme.jpg",
    },
    {
      name: "Sunset Studio Pilates",
      role: "Lieu de formation · Lac 1",
      description: "Studio mentionné dans les annonces de certaines sessions Pilates.",
      href: "https://www.facebook.com/profile.php?id=61579597566910",
      logo: "/pics/partners/Sunset.jpg",
    },
    {
      name: "Golden Tulip",
      role: "Partenaire hôtelier",
      description: "Hôtel partenaire de l'académie.",
      href: "https://www.goldentulip.com",
      logo: "/pics/partners/golden-tulip.svg",
    },
  ],
} as const;

export type NavKey = "home" | "formations" | "gallery" | "security" | "planning" | "history" | "contact";
export type NavItem = { href: string; key: NavKey };

/** Navigation principale : les libellés viennent du dictionnaire de la langue active (t.nav[key]). */
export const mainNav: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/formations", key: "formations" },
  { href: "/#galerie", key: "gallery" },
  { href: "/securite", key: "security" },
  { href: "/planning", key: "planning" },
  { href: "/historique", key: "history" },
  { href: "/contact", key: "contact" },
];
