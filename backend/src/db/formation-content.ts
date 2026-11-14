import type { SessionLevel } from "../generated/prisma/client.js";

/**
 * Contenu initial des trois formations, repris du site d'origine.
 * Inséré une seule fois (formations sans contenu) : ensuite, l'admin le modifie depuis /admin/formations.
 */
export type FormationContent = {
  name: string;
  headline: string;
  summary: string;
  level?: SessionLevel;
  durationLabel?: string;
  intro: string[];
  facts: { label: string; value: string }[];
  objectives: string[];
  prerequisites?: string[];
  modules: { title: string; text: string }[];
  audience: string[];
  careers: string[];
};

export const FORMATION_CONTENT: Record<string, FormationContent> = {
  pilates: {
    name: "Pilates",
    headline: "Pilates Mat & Reformer : formation d'instructeur",
    summary:
      "Suivez le parcours Matwork & Reformer, niveaux 1 et 2 : 40 heures sur six jours à Nabeul, avec certification annoncée à l'issue de la formation. Contactez l'académie pour confirmer la prochaine session.",
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
  },

  football: {
    name: "Football",
    durationLabel: "4 jours intensifs",
    headline: "Formation en entraînement et coaching de football",
    summary:
      "Suivez quatre jours de théorie et de pratique à Hammamet : méthode d'entraînement, préparation physique, analyse du jeu et conduite des séances. Le post annonce deux certificats et un tarif de 750 TND ; aucune prochaine session n'est datée.",
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
  },

  "personal-training": {
    name: "Personal Training",
    durationLabel: "4 jours consécutifs",
    headline: "Formation de coach sportif personnel",
    summary:
      "Évaluez les objectifs de vos clients, planifiez leurs séances et encadrez la musculation, le conditionnement physique et les bases nutritionnelles. Consultez les vidéos sources et contactez l'académie pour les prochaines dates et le lieu.",
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
  },
};
