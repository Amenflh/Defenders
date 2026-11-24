export const site = {
  name: "Defenders Academy",
  shortName: "Defenders",
  descriptor: "Academy",
  tagline: "Sécurité, protection et formations certifiantes pour les professionnels du sport",
  group: "Defenders Academy",
  /**
   * Les deux filières de Defenders Academy. La sécurité / protection (DSP) fait partie de la
   * Tunisian Security Academy : elle n'est jamais présentée comme une filière séparée.
   */
  branches: [
    { key: "fitness", name: "Defenders Fitness Academy", headerName: "Defenders", headerDescriptor: "Fitness Academy", href: "/fitness-academy", logo: "/pics/logo-fitness-academy.jpg", mark: "DFA", comingSoon: false },
    { key: "tsa", name: "Tunisian Security Academy", headerName: "Tunisian Security", headerDescriptor: "Academy", href: "/tunisian-security-academy", logo: "/pics/partners/tsa-logo-eagle.jpg", mark: "TSA", comingSoon: false },
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
  /** Vidéos de Defenders Security Protection (page Sécurité et page Nos formations), affichées dans des cadres identiques. */
  securityVideos: [
    { url: "https://www.facebook.com/reel/1231628108029497/", layout: "portrait" },
    { url: "https://www.facebook.com/reel/1082973183535260/", layout: "landscape" },
    { url: "https://www.facebook.com/reel/1591488295804767/", layout: "square" },
  ] as { url: string; layout: "portrait" | "square" | "landscape" }[],
  securityHeroVideo: "https://www.facebook.com/reel/1082973183535260/",
  /**
   * Vidéos de fond des en-têtes, enchaînées pour montrer les trois formations (Pilates, Football, Personal Trainer).
   * La vidéo Pilates peut être remplacée depuis l'admin (Médias). Tant que football.mp4 / personal-trainer.mp4
   * ne sont pas déposés dans public/videos, les reels Facebook des fiches sont lus à la place (voir getHeroClips).
   */
  homeHeroVideos: {
    fitness: "/videos/1-Video by defenders_fitness_academy.mp4",
    football: "/videos/football.mp4",
    personalTraining: "/videos/personal-trainer.mp4",
  },
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
    /** Publication de la formation Éducateur canin & homme d'attaque K9 et son affiche. */
    k9CoursePost: "https://www.facebook.com/story.php?story_fbid=992042216718515&id=100077382387038",
    k9Poster: "/pics/k9.jpg",
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
    /** Témoignages vidéo de stagiaires (section « Témoignages » de l'accueil). */
    testimonialVideoEmbeds: [
      "https://www.facebook.com/reel/842610331713875/",
      "https://www.facebook.com/reel/726579750525884/",
      "https://www.facebook.com/reel/926929733328196/",
    ],
    footballVideos: ["https://www.facebook.com/share/r/1DGzq17D8M/"],
    footballVideoEmbeds: ["https://www.facebook.com/reel/1818481708830444/"],
  },
  /** Page LinkedIn : vide tant qu'elle n'est pas renseignée (le bouton est alors masqué). Modifiable dans l'admin. */
  linkedin: {
    label: "LinkedIn",
    href: "",
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
      logo: "/pics/partners/tsa-logo-eagle.jpg",
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
      logo: "/pics/partners/golden-tulip.jpeg",
    },
    {
      name: "Université Ibn Khaldoun",
      role: "Partenaire universitaire",
      description: "Université partenaire de l'académie.",
      href: "https://uik.ens.tn",
      logo: "/pics/partners/uik.webp",
    },
  ],
} as const;

export type NavKey = "home" | "formations" | "fitnessAcademy" | "gallery" | "security" | "akAcademy" | "planning" | "history" | "contact";
export type NavItem = { href: string; key: NavKey };

/** Navigation principale : les libellés viennent du dictionnaire de la langue active (t.nav[key]). */
export const mainNav: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/fitness-academy", key: "fitnessAcademy" },
  { href: "/tunisian-security-academy", key: "akAcademy" },
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
