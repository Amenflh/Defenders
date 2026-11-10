import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { seedAdmin } from "../modules/auth/auth.service.js";
import { FORMATION_CONTENT } from "./formation-content.js";

type SampleSession = Omit<Prisma.TrainingSessionCreateManyInput, "formationId"> & { formation: string };

/**
 * Planning hebdomadaire d'EXEMPLE, inséré seulement si la table est vide.
 * À remplacer par le planning réel (directement en base, ou via la future interface admin).
 */
const SAMPLE_PLANNING: SampleSession[] = [
  { formation: "pilates", title: "Fondamentaux du Pilates Mat", dayOfWeek: 1, startTime: "09:00", endTime: "11:00", format: "pratique", level: "debutant" },
  { formation: "pilates", title: "Anatomie & biomécanique", dayOfWeek: 2, startTime: "14:00", endTime: "16:00", format: "theorie", level: "tous_niveaux" },
  { formation: "pilates", title: "Reformer : progressions", dayOfWeek: 4, startTime: "09:00", endTime: "11:30", format: "pratique", level: "intermediaire" },
  { formation: "pilates", title: "Construire une séance", dayOfWeek: 6, startTime: "10:00", endTime: "12:00", format: "atelier", level: "avance" },

  { formation: "football", title: "Méthodologie de l'entraînement", dayOfWeek: 1, startTime: "14:00", endTime: "16:00", format: "theorie", level: "tous_niveaux" },
  { formation: "football", title: "Séances terrain : jeu réduit", dayOfWeek: 3, startTime: "16:00", endTime: "18:30", format: "pratique", level: "intermediaire" },
  { formation: "football", title: "Préparation physique du footballeur", dayOfWeek: 5, startTime: "09:00", endTime: "11:00", format: "theorie", level: "tous_niveaux" },
  { formation: "football", title: "Analyse vidéo & tactique", dayOfWeek: 6, startTime: "14:00", endTime: "16:00", format: "atelier", level: "avance" },

  { formation: "personal-training", title: "Physiologie de l'effort", dayOfWeek: 2, startTime: "09:00", endTime: "11:00", format: "theorie", level: "tous_niveaux" },
  { formation: "personal-training", title: "Musculation : technique & sécurité", dayOfWeek: 3, startTime: "09:00", endTime: "11:30", format: "pratique", level: "debutant" },
  { formation: "personal-training", title: "Nutrition & composition corporelle", dayOfWeek: 4, startTime: "14:00", endTime: "16:00", format: "theorie", level: "intermediaire" },
  { formation: "personal-training", title: "Coaching client & programmation", dayOfWeek: 5, startTime: "14:00", endTime: "16:30", format: "atelier", level: "avance" },
  { formation: "personal-training", title: "Évaluation pratique", dayOfWeek: 7, startTime: "10:00", endTime: "12:00", format: "evaluation", level: "tous_niveaux" },
];

/** Données de référence, idempotent : peut être lancé à chaque démarrage. */
export async function ensureSeedData(): Promise<void> {
  await seedAdmin();
  await seedFormationContent();

  const defaultSettings = {
    phone: "+216 92 204 005",
    phone2: "+216 29 039 493",
    email: "direction-dsp@outlook.com",
    securityEmail: "akkari-dsp@outlook.com",
    facebook: "https://www.facebook.com/DefendersFitnessAcademy",
    instagram: "https://www.instagram.com/defenders_fitness_academy",
    address: "Avenue Abou Dhabi, 8050 Hammamet, Tunisie",
    approval: "Agrément n° 21-340-24",
    statsDisciplines: "3",
    statsVideos: "2",
    statsPromotions: "7+",
    statsFacebook: "5904+",
    footerTagline: "Des formations certifiantes pour les coachs et les professionnels du sport",
    footerGroup: "Defenders Academy",
    mentions: `Éditeur du site\nDefenders Fitness Academy — Avenue Abou Dhabi, 8050 Hammamet, Tunisie\n\nContact\n+216 92 204 005 — +216 29 039 493 — direction-dsp@outlook.com\n\nActivité\nCentre de formation certifié — Agrément n° 21-340-24. Les contenus pédagogiques et les prochaines sessions doivent être confirmés directement auprès de l'académie.\n\nPropriété intellectuelle\nLes textes, photographies, vidéos, marques et éléments graphiques présents sur ce site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.\n\nResponsabilité\nLes informations du site sont fournies à titre informatif. L'académie peut les modifier ou les actualiser sans préavis. Les horaires et tarifs exacts sont confirmés auprès de l'équipe.`,
    privacy: `Responsable du traitement\nDefenders Fitness Academy peut collecter les informations envoyées volontairement depuis le formulaire de contact ou d'inscription.\n\nDonnées collectées\nLe formulaire peut collecter le prénom, le nom, l'e-mail, le téléphone, la ville, le profil, les formations souhaitées, la disponibilité, le message et une éventuelle pièce jointe.\n\nFinalités\nLes données sont utilisées pour répondre à une demande, fournir des informations sur les formations, organiser le suivi des inscriptions et transmettre les informations demandées.\n\nSécurité et droits\nDes mesures techniques limitent les accès. Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à direction-dsp@outlook.com.`,
    cookies: `Cookies strictement nécessaires\nÀ ce jour, le site ne présente pas de bandeau publicitaire ni de traçage marketing. Le fonctionnement technique peut utiliser des mécanismes essentiels au chargement des pages.\n\nServices tiers\nLa carte intégrée et les liens vers les réseaux sociaux peuvent être soumis aux politiques de leurs fournisseurs.\n\nGestion du navigateur\nVous pouvez supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Certaines fonctionnalités externes peuvent alors ne plus fonctionner normalement.`,
  };
  await prisma.siteSetting.upsert({
    where: { key: "site" },
    create: { key: "site", value: JSON.stringify(defaultSettings) },
    update: {},
  });

  const faqs = [
    ["À qui s'adressent les formations ?", "Aux coachs qui souhaitent se spécialiser et aux jeunes diplômés en sciences du sport qui veulent développer des compétences pratiques. Contactez l'équipe pour vérifier les prérequis d'une session."],
    ["Que comprend la formation Pilates ?", "Un parcours Matwork et Reformer, Level 1 & 2, sur 40 heures et 6 jours, avec anatomie, posture, pratique et support pédagogique."],
    ["Quelles spécialités football sont proposées ?", "Les spécialités présentées comprennent l'entraînement de football, la préparation physique, l'entraînement des gardiens et la direction technique ou sportive."],
    ["Une certification est-elle délivrée ?", "Les parcours comprennent une évaluation théorique et pratique, avec certificat en fin de formation (Agrément n° 21-340-24)."],
    ["Où ont lieu les sessions ?", "L'adresse principale est à Hammamet. Le lieu exact dépend de la session ; certaines formations peuvent se tenir à Nabeul ou Sunset Studio à Lac 1."],
    ["Les services de recrutement à l'étranger sont-ils payants ?", "Bayrak El Arab annonce des services gratuits pour les entretiens, les contrats et l'accompagnement. Les offres dépendent du profil ; aucun emploi n'est garanti."],
    ["Comment connaître les tarifs et les prochaines dates ?", "Consultez le planning et contactez l'académie pour obtenir les tarifs et places disponibles à jour."],
  ] as const;
  if (await prisma.cmsItem.count({ where: { section: "faq" } }) === 0) {
    await prisma.cmsItem.createMany({ data: faqs.map(([title, body], position) => ({ section: "faq", title, body, position, active: true })) });
  }

  // Ordre d'affichage : les deux agences de recrutement (Bayrak, RITEJ) sont séparées par la Tunisian Security Academy.
  const partners = [
    ["Bayrak El Arab", "Recrutement et accompagnement", "Entretiens, contrats et accompagnement annoncés gratuits. Le recrutement dépend des offres et du profil.", "/pics/partners/Bayrak.jpg", "https://www.facebook.com/bayrakelarabe"],
    ["Tunisian Security Academy", "Académie partenaire", "Co-partenaire mentionné dans les annonces de recrutement et de formation.", "/pics/partners/TSA-logo.jpg", "https://www.facebook.com/profile.php?id=100077382387038"],
    ["RITEJ Company for Recruitment", "Recrutement à l'étranger", "Agence spécialisée dans le recrutement à l'étranger depuis 2010.", "/pics/partners/RITEJ-embleme.jpg", "https://www.facebook.com/ritejcampanyforrecruitment"],
    ["Sunset Studio Pilates", "Lieu de formation · Lac 1", "Studio partenaire mentionné dans certaines sessions Pilates.", "/pics/partners/Sunset.jpg", "https://www.facebook.com/profile.php?id=61579597566910"],
    ["Golden Tulip", "Partenaire hôtelier", "Hôtel partenaire de l'académie.", "/pics/partners/golden-tulip.svg", "https://www.goldentulip.com"],
  ] as const;
  if (await prisma.cmsItem.count({ where: { section: "partners" } }) === 0) {
    await prisma.cmsItem.createMany({ data: partners.map(([title, subtitle, body, imageUrl, linkUrl], position) => ({ section: "partners", title, subtitle, body, imageUrl, linkUrl, position, active: true })) });
  } else if (await prisma.cmsItem.count({ where: { section: "partners", title: "Golden Tulip" } }) === 0) {
    // Base déjà initialisée : on ajoute seulement le nouveau partenaire.
    const [title, subtitle, body, imageUrl, linkUrl] = partners[4];
    const last = await prisma.cmsItem.aggregate({ where: { section: "partners" }, _max: { position: true } });
    await prisma.cmsItem.create({ data: { section: "partners", title, subtitle, body, imageUrl, linkUrl, position: (last._max.position ?? 0) + 1, active: true } });
  }

  if (await prisma.cmsItem.count({ where: { section: "promotions" } }) === 0) {
    await prisma.cmsItem.createMany({ data: [
      { section: "promotions", title: "Promotion Football", subtitle: "4 jours intensifs", body: "Préparation physique, méthodologie et tactique.", imageUrl: "/pics/football_images/acc_images.jpg", position: 0, active: true },
      { section: "promotions", title: "Promotion Pilates", subtitle: "Mat & Reformer", body: "Formation certifiante pour instructeurs Pilates.", imageUrl: "/pics/Pilates_images/acc_images.jpg", position: 1, active: true },
      { section: "promotions", title: "Promotion Personal Training", subtitle: "7 certificats", body: "Certification Personal Fitness Trainer intensive.", imageUrl: "/pics/personal_trainers/acc_images.jpg", position: 2, active: true },
    ] });
  }

  if (await prisma.media.count() === 0) {
    await prisma.media.createMany({ data: [
      { type: "video" as const, url: "/videos/1-Video by defenders_fitness_academy.mp4", title: "Une équipe, une formation", category: "accueil" },
      { type: "video" as const, url: "/videos/2-Video by defenders_fitness_academy.mp4", title: "Pilates Matwork & Reformer", category: "accueil" },
    ] });
  }

  const richFormationSeeds = [
    {
      slug: "pilates",
      name: "Pilates",
      headline: "Devenez instructeur Pilates Mat & Reformer",
      summary: "Maîtrisez la méthode Pilates, au sol comme sur Reformer, et apprenez à construire des séances sûres, progressives et adaptées à chaque client.",
      intro: ["Le Pilates est l'une des pratiques les plus demandées en studio et en coaching privé. Notre formation allie compréhension scientifique du mouvement et maîtrise pédagogique.", "Vous travaillez sur tapis et sur Reformer, avec un accent sur le placement, la respiration, le contrôle du centre et l'adaptation des exercices aux différents profils."],
      facts: [{ label: "Supports", value: "Mat & Reformer" }, { label: "Approche", value: "Théorie + pratique" }, { label: "Validation", value: "Certificat" }],
      objectives: ["Comprendre les principes fondamentaux de la méthode Pilates", "Analyser la posture et le mouvement grâce à l'anatomie fonctionnelle", "Enseigner le répertoire Mat et Reformer en toute sécurité", "Adapter les exercices aux débutants, sportifs et publics spécifiques", "Concevoir et animer des séances individuelles et collectives"],
      modules: [{ title: "Anatomie & biomécanique", text: "Colonne, bassin, ceinture scapulaire : les bases pour analyser chaque mouvement." }, { title: "Principes fondamentaux", text: "Respiration, centrage, contrôle, précision, fluidité et concentration." }, { title: "Répertoire Mat", text: "Exercices au sol, progressions, régressions, consignes et corrections." }, { title: "Reformer", text: "Réglages, sécurité, enchaînements et utilisation des ressorts." }, { title: "Publics spécifiques", text: "Adaptations pour le dos, la grossesse, les seniors et les sportifs." }, { title: "Pédagogie & séance", text: "Construire, rythmer et animer une séance professionnelle." }],
      audience: ["Coachs sportifs souhaitant se spécialiser", "Jeunes diplômés en sciences du sport", "Professionnels du bien-être et de la rééducation"],
      careers: ["Instructeur en studio Pilates", "Coach privé à domicile ou en ligne", "Intervenant en salle de sport et centre de bien-être"],
      coverUrl: "/pics/Pilates_images/acc_images1.jpg",
      galleryUrls: ["/pics/Pilates_images/acc_images.jpg", "/pics/Pilates_images/acc_images2.jpg"],
      accent: "pilates",
    },
    {
      slug: "football",
      name: "Football",
      headline: "Formation d'entraîneur de football",
      summary: "Une formation intensive pour encadrer, préparer et faire progresser des joueurs, des jeunes catégories jusqu'aux seniors.",
      intro: ["Entraîner, c'est transmettre une méthode. Notre formation couvre la planification, la préparation physique, la tactique et le management.", "Le programme alterne apports théoriques et mises en situation, avec des séances prêtes à l'emploi."],
      facts: [{ label: "Durée", value: "4 jours intensifs" }, { label: "Hébergement", value: "Inclus" }, { label: "Validation", value: "Certificat accrédité" }],
      objectives: ["Planifier une saison, un cycle et une séance", "Développer les qualités physiques spécifiques au football", "Transmettre des principes de jeu et une organisation tactique", "Encadrer les jeunes catégories", "Gérer un groupe, la communication et la motivation"],
      modules: [{ title: "Méthodologie", text: "Objectifs, contenus et progression d'une séance." }, { title: "Préparation physique", text: "Endurance, vitesse, force et prévention des blessures." }, { title: "Tactique & principes de jeu", text: "Organisation collective, transitions et animation du jeu." }, { title: "Jeunes catégories", text: "Formation du jeune joueur, jeux réduits et apprentissage technique." }, { title: "Analyse & vidéo", text: "Observer un match et définir des axes de travail." }, { title: "Management", text: "Leadership, communication et gestion du vestiaire." }],
      audience: ["Éducateurs et entraîneurs en activité", "Anciens joueurs en reconversion", "Jeunes diplômés en STAPS / sciences du sport"],
      careers: ["Entraîneur ou éducateur en club", "Préparateur physique football", "Opportunités à l'étranger avec notre partenaire RITEJ"],
      coverUrl: "/pics/football_images/seance-equipe.jpg",
      galleryUrls: ["/pics/football_images/staff-technique.jpg", "/pics/football_images/exercice-plots.jpg", "/pics/football_images/coach-terrain.jpg"],
      accent: "football",
    },
    {
      slug: "personal-training",
      name: "Personal Training",
      headline: "Personal Fitness Trainer Certification",
      summary: "Devenez coach personnel : évaluation, programmation, musculation, nutrition et accompagnement client, validés par plusieurs certificats.",
      intro: ["Le coaching privé exige une expertise solide et une vraie relation client. La certification vous donne les outils scientifiques et pratiques pour concevoir des programmes efficaces et sûrs.", "Formation intensive, encadrée par des formateurs expérimentés, avec accompagnement vers l'emploi grâce à notre réseau de partenaires."],
      facts: [{ label: "Durée", value: "4 jours consécutifs" }, { label: "Certificats", value: "7 certificats" }, { label: "Hébergement", value: "Inclus" }],
      objectives: ["Évaluer la condition physique et les objectifs d'un client", "Programmer l'entraînement : force, hypertrophie, perte de poids, performance", "Maîtriser la technique et la sécurité en musculation", "Donner des conseils nutritionnels fondés sur les sciences du sport", "Développer son activité de coach privé"],
      modules: [{ title: "Physiologie de l'effort", text: "Filières énergétiques, adaptations et récupération." }, { title: "Musculation", text: "Technique des mouvements fondamentaux, charges et sécurité." }, { title: "Programmation", text: "Périodisation, progression et suivi des résultats." }, { title: "Nutrition", text: "Besoins, composition corporelle et habitudes alimentaires." }, { title: "Évaluation client", text: "Tests, anamnèse et définition d'objectifs mesurables." }, { title: "Business du coaching", text: "Relation client, offre, tarification et fidélisation." }],
      audience: ["Passionnés de fitness voulant devenir coach", "Coachs souhaitant une certification reconnue", "Jeunes diplômés en sciences du sport"],
      careers: ["Coach personnel indépendant", "Coach en salle de sport", "Opportunités de contrats à l'étranger avec RITEJ"],
      coverUrl: "/pics/personal_trainers/coaching-technique.jpg",
      galleryUrls: ["/pics/personal_trainers/coaching-halterophilie.jpg", "/pics/personal_trainers/suivi-client.jpg", "/pics/personal_trainers/coaching-equilibre.jpg"],
      accent: "personal",
    },
  ];
  // Anciennes affiches (peu professionnelles) remplacées par de vraies photos : seulement si l'admin ne les a pas changées.
  const LEGACY_COVERS = ["/pics/football_images/acc_images.jpg", "/pics/personal_trainers/acc_images1.jpeg"];
  for (const rich of richFormationSeeds) {
    const existing = await prisma.formation.findUnique({ where: { slug: rich.slug } });
    if (existing) {
      const mustFill = !existing.coverUrl && (!Array.isArray(existing.objectives) || existing.objectives.length === 0);
      if (mustFill) {
        await prisma.formation.update({ where: { id: existing.id }, data: rich });
      } else if (existing.coverUrl && LEGACY_COVERS.includes(existing.coverUrl)) {
        await prisma.formation.update({ where: { id: existing.id }, data: { coverUrl: rich.coverUrl, galleryUrls: rich.galleryUrls } });
      }
    } else {
      await prisma.formation.create({ data: { ...rich, status: "published", position: richFormationSeeds.indexOf(rich) } });
    }
  }

  if ((await prisma.trainingSession.count()) > 0) return;
  const formations = await prisma.formation.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(formations.map((f) => [f.slug, f.id]));

  const data = SAMPLE_PLANNING.filter((s) => idBySlug.has(s.formation)).map(({ formation, ...s }) => ({
    ...s,
    formationId: idBySlug.get(formation)!,
  }));
  const { count } = await prisma.trainingSession.createMany({ data });
  console.info(`[seed] planning d'exemple inséré (${count} créneaux)`);
}

/** Contenu initial des formations d'origine, seulement si elles n'en ont pas encore (jamais d'écrasement). */
async function seedFormationContent(): Promise<void> {
  const empty = await prisma.formation.findMany({
    where: { slug: { in: Object.keys(FORMATION_CONTENT) }, intro: { isEmpty: true }, objectives: { isEmpty: true } },
    select: { id: true, slug: true, durationLabel: true },
  });
  for (const f of empty) {
    const { durationLabel, ...content } = FORMATION_CONTENT[f.slug];
    await prisma.formation.update({ where: { id: f.id }, data: { ...content, durationLabel: f.durationLabel ?? durationLabel ?? null } });
  }
  if (empty.length) console.info(`[seed] contenu des formations initialisé (${empty.map((f) => f.slug).join(", ")})`);
}
