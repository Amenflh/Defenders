export const site = {
  name: "Defenders Academy",
  shortName: "Defenders",
  descriptor: "Academy",
  tagline: "Sécurité, protection et formations certifiantes pour les professionnels du sport",
  group: "Defenders Academy",
  /** Les trois filières de Defenders Academy. */
  branches: [
    { key: "security", name: "Defenders Security Protection", headerName: "Defenders Security", headerDescriptor: "Protection", href: "/securite", logo: "/pics/partners/DSP-logo.jpg", mark: "DSP", comingSoon: false },
    { key: "fitness", name: "Defenders Fitness Academy", headerName: "Defenders", headerDescriptor: "Fitness Academy", href: "/fitness-academy", logo: "/pics/logo.jpg", mark: "DFA", comingSoon: false },
    { key: "tsa", name: "A.K Tunisian Security Academy", headerName: "A.K Tunisian Security", headerDescriptor: "Academy", href: "/ak-tunisian-security-academy", logo: "/pics/partners/TSA-logo.jpg", mark: "TSA", comingSoon: false },
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
  securityPortal: "https://taplink.cc/defenderssecurityprotection",
  securityHeroVideo: "https://www.facebook.com/reel/1082973183535260/?start=1",
  tunisianSecurityAcademy: {
    facebook: "https://www.facebook.com/profile.php?id=100077382387038",
    videos: "https://www.facebook.com/100077382387038/videos/",
    firstResponseVideos: [
      {
        sourceUrl: "https://www.facebook.com/share/r/1D4ZZCjZku/",
        embedUrl: "https://www.facebook.com/reel/1747595872982498/",
        layout: "portrait",
      },
      {
        sourceUrl: "https://www.facebook.com/share/v/19iShpsQa8/",
        embedUrl: "https://www.facebook.com/reel/1591488295804767/",
        layout: "square",
      },
    ],
    closeProtectionVideos: [
      {
        sourceUrl: "https://www.facebook.com/share/v/19vDPzycfW/",
        embedUrl: "https://www.facebook.com/reel/1231628108029497/",
        layout: "portrait",
      },
      {
        sourceUrl: "https://www.facebook.com/share/v/1YiT9YW884/",
        embedUrl: "https://www.facebook.com/reel/1082973183535260/",
        layout: "landscape",
      },
    ],
    k9TrainingPost: "https://www.facebook.com/share/p/1E7x6Xconw/",
    k9Contact: { label: "+216 24 076 368", href: "tel:+21624076368" },
    phone: { label: "+216 29 039 493", href: "tel:+21629039493" },
    trainingPhone: { label: "+216 92 204 005", href: "tel:+21692204005" },
    email: { label: "akkari-abdrrahmen@live.fr", href: "mailto:akkari-abdrrahmen@live.fr" },
    address: ["Avenue d'Abou Dhabi", "8050 Hammamet, Tunisie"],
  },
  address: {
    lines: ["Avenue Abou Dhabi", "8050 Hammamet, Tunisie"],
    href: "https://www.google.com/maps/search/?api=1&query=Avenue+Abou+Dhabi+Hammamet+8050+Tunisia",
  },
  facebook: {
    label: "Defenders Fitness Academy",
    href: "https://www.facebook.com/DefendersFitnessAcademy",
    videos: "https://www.facebook.com/DefendersFitnessAcademy/videos/",
    pilatesVideos: [
      "https://www.facebook.com/share/r/1985tDibWA/",
      "https://www.facebook.com/share/r/1HW4hfeYzt/",
    ],
    pilatesVideoEmbeds: [
      "https://www.facebook.com/reel/1380600687572791/",
      "https://www.facebook.com/reel/2149688955939054/",
    ],
    personalTrainingVideos: [
      "https://www.facebook.com/share/r/195Kvtn2tE/",
      "https://www.facebook.com/share/r/19u4neMyov/",
      "https://www.facebook.com/share/r/18wmqDJpdZ/",
    ],
    personalTrainingVideoEmbeds: [
      "https://www.facebook.com/reel/877141621507702/",
      "https://www.facebook.com/reel/3279150018914978/",
      "https://www.facebook.com/reel/796475196712099/",
    ],
    footballVideos: ["https://www.facebook.com/share/r/1DGzq17D8M/"],
    footballVideoEmbeds: ["https://www.facebook.com/reel/1818481708830444/"],
  },
  instagram: {
    label: "@defenders_fitness_academy",
    href: "https://www.instagram.com/defenders_fitness_academy",
    pilatesAnnouncement: "https://www.instagram.com/defenders_fitness_academy/reel/DfXPgOJHGKx/",
    pilatesAnnouncementEmbed: "https://www.instagram.com/reel/DfXPgOJHGKx/embed/",
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

export type NavKey = "home" | "formations" | "fitnessAcademy" | "gallery" | "security" | "akAcademy" | "planning" | "history" | "contact";
export type NavItem = { href: string; key: NavKey };

/** Navigation principale : les libellés viennent du dictionnaire de la langue active (t.nav[key]). */
export const mainNav: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/securite", key: "security" },
  { href: "/fitness-academy", key: "fitnessAcademy" },
  { href: "/ak-tunisian-security-academy", key: "akAcademy" },
  { href: "/formations", key: "formations" },
  { href: "/#galerie", key: "gallery" },
  { href: "/planning", key: "planning" },
  { href: "/historique", key: "history" },
  { href: "/contact", key: "contact" },
];

/** Navigation du header : garde les liens qui mènent à des pages et sections utiles. */
export const headerNav = mainNav.filter(
  (item) => item.key !== "home" && item.key !== "gallery" && item.key !== "planning" && item.key !== "contact",
);
