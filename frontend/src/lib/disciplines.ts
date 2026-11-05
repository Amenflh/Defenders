import { footballPhotos, personalPhotos, pilatesPhotos, type Photo } from "./images";

export const DISCIPLINE_SLUGS = ["pilates", "football", "personal-training"] as const;
export type DisciplineSlug = (typeof DISCIPLINE_SLUGS)[number];
export type DynamicPhoto = { src: Photo["src"] | string; alt: string };

export type Discipline = {
  slug: string;
  name: string;
  /** Classe Tailwind de la couleur d'accent de la discipline. */
  accent: { text: string; bg: string; border: string };
  headline: string;
  summary: string;
  intro: string[];
  facts: { label: string; value: string }[];
  objectives: string[];
  modules: { title: string; text: string }[];
  audience: string[];
  careers: string[];
  /** Première photo = visuel principal de la page ; les suivantes forment la galerie. */
  photos: DynamicPhoto[];
  /** Visuel utilisé sur les cartes (accueil, « découvrez aussi »). */
  cover: DynamicPhoto;
};

export const disciplines: Record<DisciplineSlug, Discipline> = {
  pilates: {
    slug: "pilates",
    name: "Pilates",
    accent: { text: "text-pilates", bg: "bg-pilates", border: "border-pilates" },
    headline: "Devenez instructeur Pilates Mat & Reformer",
    summary:
      "Maîtrisez la méthode Pilates, au sol comme sur Reformer, et apprenez à construire des séances sûres, progressives et adaptées à chaque client.",
    intro: [
      "Le Pilates est l'une des pratiques les plus demandées en studio et en coaching privé. Notre formation allie compréhension scientifique du mouvement et maîtrise pédagogique, pour vous permettre d'encadrer des séances de qualité dès la certification.",
      "Vous travaillez sur tapis et sur Reformer, avec un accent sur le placement, la respiration, le contrôle du centre et l'adaptation des exercices aux différents profils.",
    ],
    facts: [
      { label: "Supports", value: "Mat & Reformer" },
      { label: "Approche", value: "Théorie + pratique" },
      { label: "Validation", value: "Certificat" },
    ],
    objectives: [
      "Comprendre les principes fondamentaux de la méthode Pilates",
      "Analyser la posture et le mouvement grâce à l'anatomie fonctionnelle",
      "Enseigner le répertoire Mat et Reformer en toute sécurité",
      "Adapter les exercices aux débutants, sportifs et publics spécifiques",
      "Concevoir et animer des séances individuelles et collectives",
    ],
    modules: [
      { title: "Anatomie & biomécanique", text: "Colonne, bassin, ceinture scapulaire : les bases pour analyser chaque mouvement." },
      { title: "Principes fondamentaux", text: "Respiration, centrage, contrôle, précision, fluidité et concentration." },
      { title: "Répertoire Mat", text: "Exercices au sol, progressions et régressions, consignes et corrections." },
      { title: "Reformer", text: "Réglages, sécurité, enchaînements et utilisation des ressorts." },
      { title: "Publics spécifiques", text: "Adaptations pour le dos, la grossesse, les seniors et les sportifs." },
      { title: "Pédagogie & séance", text: "Construire, rythmer et animer une séance professionnelle." },
    ],
    audience: ["Coachs sportifs souhaitant se spécialiser", "Jeunes diplômés en sciences du sport", "Professionnels du bien-être et de la rééducation"],
    careers: ["Instructeur en studio Pilates", "Coach privé à domicile ou en ligne", "Intervenant en salle de sport et centre de bien-être"],
    photos: pilatesPhotos,
    cover: pilatesPhotos[0],
  },

  football: {
    slug: "football",
    name: "Football",
    accent: { text: "text-football", bg: "bg-football", border: "border-football" },
    headline: "Formation d'entraîneur de football",
    summary:
      "Une formation intensive pour encadrer, préparer et faire progresser des joueurs, des jeunes catégories jusqu'aux seniors.",
    intro: [
      "Entraîner, c'est transmettre une méthode. Notre formation d'entraîneur couvre la planification, la préparation physique, la tactique et le management d'un groupe, avec des formateurs issus du terrain.",
      "Le programme alterne apports théoriques et mises en situation, pour que chaque stagiaire reparte avec des séances prêtes à l'emploi et une vraie démarche d'entraîneur.",
    ],
    facts: [
      { label: "Durée", value: "4 jours intensifs" },
      { label: "Hébergement", value: "Inclus" },
      { label: "Validation", value: "Certificat accrédité" },
    ],
    objectives: [
      "Planifier une saison, un cycle et une séance d'entraînement",
      "Développer les qualités physiques spécifiques au football",
      "Transmettre des principes de jeu et une organisation tactique",
      "Encadrer les jeunes catégories avec une pédagogie adaptée",
      "Gérer un groupe, la communication et la motivation",
    ],
    modules: [
      { title: "Méthodologie", text: "Objectifs, contenus et progression d'une séance d'entraînement." },
      { title: "Préparation physique", text: "Endurance, vitesse, force et prévention des blessures du footballeur." },
      { title: "Tactique & principes de jeu", text: "Organisation collective, transitions et animation offensive/défensive." },
      { title: "Jeunes catégories", text: "Formation du jeune joueur, jeux réduits et apprentissage technique." },
      { title: "Analyse & vidéo", text: "Observer un match, en extraire des axes de travail." },
      { title: "Management", text: "Leadership, communication et gestion du vestiaire." },
    ],
    audience: ["Éducateurs et entraîneurs en activité", "Anciens joueurs en reconversion", "Jeunes diplômés en STAPS / sciences du sport"],
    careers: ["Entraîneur ou éducateur en club", "Préparateur physique football", "Opportunités à l'étranger avec notre partenaire RITEJ"],
    photos: footballPhotos,
    cover: footballPhotos[1],
  },

  "personal-training": {
    slug: "personal-training",
    name: "Personal Training",
    accent: { text: "text-personal", bg: "bg-personal", border: "border-personal" },
    headline: "Personal Fitness Trainer Certification",
    summary:
      "Devenez coach personnel : évaluation, programmation, musculation, nutrition et accompagnement client, validés par plusieurs certificats.",
    intro: [
      "Le coaching privé exige une expertise solide et une vraie relation client. La certification Personal Fitness Trainer vous donne les outils scientifiques et pratiques pour concevoir des programmes efficaces et sûrs.",
      "Formation intensive, encadrée par des formateurs expérimentés, avec un accompagnement vers l'emploi grâce à notre réseau de partenaires.",
    ],
    facts: [
      { label: "Durée", value: "4 jours consécutifs" },
      { label: "Certificats", value: "7 certificats" },
      { label: "Hébergement", value: "Inclus" },
    ],
    objectives: [
      "Évaluer la condition physique et les objectifs d'un client",
      "Programmer l'entraînement : force, hypertrophie, perte de poids, performance",
      "Maîtriser la technique et la sécurité en musculation",
      "Donner des conseils nutritionnels fondés sur les sciences du sport",
      "Développer son activité de coach privé",
    ],
    modules: [
      { title: "Physiologie de l'effort", text: "Filières énergétiques, adaptations et récupération." },
      { title: "Musculation", text: "Technique des mouvements fondamentaux, charges et sécurité." },
      { title: "Programmation", text: "Périodisation, progression et suivi des résultats." },
      { title: "Nutrition", text: "Besoins, composition corporelle et habitudes alimentaires." },
      { title: "Évaluation client", text: "Tests, anamnèse et définition d'objectifs mesurables." },
      { title: "Business du coaching", text: "Relation client, offre, tarification et fidélisation." },
    ],
    audience: ["Passionnés de fitness voulant devenir coach", "Coachs souhaitant une certification reconnue", "Jeunes diplômés en sciences du sport"],
    careers: ["Coach personnel indépendant", "Coach en salle de sport", "Opportunités de contrats à l'étranger avec RITEJ"],
    photos: personalPhotos,
    cover: personalPhotos[0],
  },
};

export const disciplineList = DISCIPLINE_SLUGS.map((slug) => disciplines[slug]);
