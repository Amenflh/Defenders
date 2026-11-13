import type { Locale } from "./i18n/config";
import type { Photo } from "./images";
import { site } from "./site";
import type { FacebookVideoLayout } from "@/components/FacebookVideoEmbed";

/** Source-backed course records do not imply that a session took place. */
export const HISTORY_PROVISIONAL = true;

export type HistoryActivity = "football" | "pilates" | "personal-training" | "securite" | "tsa";
export type HistoryAcademy = "fitness" | "security" | "tsa";
type Localized = Record<Locale, string>;

export const HISTORY_ACADEMY_FOR_ACTIVITY: Record<HistoryActivity, HistoryAcademy> = {
  football: "fitness",
  pilates: "fitness",
  "personal-training": "fitness",
  securite: "security",
  tsa: "tsa",
};

export type HistoryEntry = {
  id: string;
  activity: HistoryActivity;
  date?: string;
  status: "course" | "completed";
  title: Localized;
  description?: Localized;
  place?: Localized;
  participants?: number;
  medicalFollowUp?: boolean;
  photos?: Photo[];
  video?: string;
  embeddedVideos?: { url: string; title: Localized; platform?: "facebook" | "instagram"; layout?: FacebookVideoLayout }[];
  sourceUrl: string;
  sourceLabel?: Localized;
  additionalSources?: { url: string; label: Localized }[];
};

export const ACTIVITY_LABELS: Record<HistoryActivity, Localized> = {
  football: { fr: "Football", en: "Football", ar: "كرة القدم" },
  pilates: { fr: "Fitness · Pilates", en: "Fitness · Pilates", ar: "اللياقة · بيلاتس" },
  "personal-training": { fr: "Personal Trainer", en: "Personal Trainer", ar: "مدرب شخصي" },
  securite: { fr: "Defenders Security Protection", en: "Defenders Security Protection", ar: "Defenders Security Protection" },
  tsa: { fr: "Tunisian Security Academy", en: "Tunisian Security Academy", ar: "الأكاديمية التونسية للأمن" },
};

export const HISTORY_STATUS_LABELS: Record<HistoryEntry["status"], Localized> = {
  course: {
    fr: "Programme de formation · réalisation non confirmée",
    en: "Course programme · delivery not confirmed",
    ar: "برنامج تكوين · لم يتم تأكيد انعقاده",
  },
  completed: {
    fr: "Session réalisée",
    en: "Session completed",
    ar: "دورة منجزة",
  },
};

export const history: HistoryEntry[] = [
  {
    id: "fitness-pilates-matwork-reformer-announcement",
    activity: "pilates",
    status: "course",
    title: {
      fr: "Formation Pilates Matwork & Reformer · niveaux 1 et 2",
      en: "Pilates Matwork & Reformer training · Levels 1 and 2",
      ar: "تكوين Pilates Matwork وReformer · المستوى 1 و2",
    },
    description: {
      fr: "Le programme comprend 40 heures sur six jours à Nabeul, en Matwork & Reformer, niveaux 1 et 2, avec une certification à l'issue de la formation. Le post identifie Defenders Fitness Academy comme organisme et cite l'agrément 21-340-24. Il mentionne aussi des contrats de travail à l'étranger sans préciser d'employeur ni de conditions. Aucune date de session n'est indiquée ; l'un des vidéos donne le numéro d'inscription +216 92 204 005.",
      en: "The course covers 40 hours over six days in Nabeul, Matwork & Reformer Levels 1 and 2, with certification on completion. The post identifies Defenders Fitness Academy as the provider and cites authorisation 21-340-24. It also mentions overseas employment contracts without naming an employer or terms. No session date is provided; one video lists +216 92 204 005 for registration.",
      ar: "يتضمن البرنامج 40 ساعة على ستة أيام في نابل، للمستويين الأول والثاني في Matwork وReformer، مع شهادة عند إتمام التكوين. ويذكر المنشور Defenders Fitness Academy كجهة منظمة ورقم الاعتماد 21-340-24. كما يذكر عقود عمل بالخارج دون تحديد جهة العمل أو الشروط. لم يُذكر موعد للدورة؛ ويعرض أحد الفيديوهات رقم التسجيل +216 92 204 005.",
    },
    place: {
      fr: "Nabeul, Tunisie",
      en: "Nabeul, Tunisia",
      ar: "نابل، تونس",
    },
    embeddedVideos: [
      {
        url: site.facebook.pilatesVideoEmbeds[0],
        title: { fr: "Pilates · vidéo 1", en: "Pilates · video 1", ar: "بيلاتس · الفيديو 1" },
      },
      {
        url: site.facebook.pilatesVideoEmbeds[1],
        title: { fr: "Pilates · vidéo 2", en: "Pilates · video 2", ar: "بيلاتس · الفيديو 2" },
      },
    ],
    sourceUrl: site.facebook.pilatesVideos[0],
    sourceLabel: {
      fr: "Voir la vidéo · programme Pilates",
      en: "Watch video · Pilates programme",
      ar: "شاهد الفيديو · برنامج بيلاتس",
    },
    additionalSources: [
      {
        url: site.facebook.pilatesVideos[1],
        label: {
          fr: "Voir la vidéo · détails et certification",
          en: "Watch video · details and certification",
          ar: "شاهد الفيديو · التفاصيل والشهادة",
        },
      },
    ],
  },
  {
    id: "fitness-pilates-course-post-2026-11-05",
    activity: "pilates",
    date: "2026-11-05",
    status: "course",
    title: {
      fr: "Pilates Matwork & Reformer · niveaux 1 et 2",
      en: "Pilates Matwork & Reformer · Levels 1 and 2",
      ar: "Pilates Matwork وReformer · المستوى 1 و2",
    },
    description: {
      fr: "Le programme indique Matwork du 27 au 29 novembre et Reformer du 4 au 6 décembre à Sunset Studio Pilates, pour 40 heures au total. Ces dates correspondent au calendrier indiqué dans le post ; la disponibilité et la réalisation des sessions ne sont pas confirmées.",
      en: "The programme lists Matwork for 27–29 November and Reformer for 4–6 December at Sunset Studio Pilates, for 40 hours in total. These dates are the schedule stated in the post; availability and delivery are not confirmed.",
      ar: "يحدد البرنامج Matwork من 27 إلى 29 نوفمبر وReformer من 4 إلى 6 ديسمبر في Sunset Studio Pilates، بإجمالي 40 ساعة. هذه هي المواعيد الواردة في المنشور؛ ولم يتم تأكيد التوفر أو انعقاد الدورات.",
    },
    place: {
      fr: "Sunset Studio Pilates · Lac 1, Tunis",
      en: "Sunset Studio Pilates · Lac 1, Tunis",
      ar: "Sunset Studio Pilates · البحيرة 1، تونس",
    },
    embeddedVideos: [
      {
        url: site.instagram.pilatesAnnouncementEmbed,
        title: { fr: "Pilates · programme Matwork & Reformer", en: "Pilates · Matwork & Reformer programme", ar: "بيلاتس · برنامج Matwork وReformer" },
        platform: "instagram",
      },
    ],
    sourceUrl: site.instagram.pilatesAnnouncement,
  },
  {
    id: "fitness-football-coach-course-announcement",
    activity: "football",
    status: "course",
    title: {
      fr: "Formation de quatre jours pour entraîneurs de football",
      en: "Four-day football-coach training course",
      ar: "تكوين مدربي كرة القدم لمدة أربعة أيام",
    },
    description: {
      fr: "Le post décrit une formation de quatre jours à Hammamet, avec des intervenants présentés comme internationaux et agréés. Le programme comprend la théorie et la pratique, les compétences de base, des séances suivant un programme anglais, l'analyse du jeu et les méthodes d'entraînement. Le post indique deux certificats internationaux (coaching football et premiers secours sportifs/CPR), un séjour en pension complète avec trois repas par jour et un tarif de 750 TND. Il fournit les numéros +216 29 039 493 et +216 92 204 005 pour les renseignements. Aucune date de session n'est indiquée.",
      en: "The post describes a four-day course in Hammamet with instructors it presents as international and accredited. Topics include theory and practical coaching, foundational skills, sessions following an English-language curriculum, game analysis, and coaching methods. It lists two international certificates (football coaching and sports first aid/CPR), full-board accommodation with three meals daily, and a fee of 750 TND. It gives +216 29 039 493 and +216 92 204 005 for inquiries. No session date is provided.",
      ar: "يصف المنشور تكوينًا لمدة أربعة أيام في الحمامات بإشراف محاضرين يقدمهم بوصفهم دوليين ومعتمدين. ويشمل البرنامج الجانب النظري والتطبيقي والمهارات الأساسية وحصصًا وفق المنهج الإنجليزي وتحليل اللعب وطرق التدريب. ويذكر المنشور شهادتين دوليتين (تدريب كرة القدم والإسعافات الأولية الرياضية/الإنعاش القلبي الرئوي) وإقامة كاملة مع ثلاث وجبات يوميًا بسعر 750 دينارًا تونسيًا. كما يورد الرقمين +216 29 039 493 و+216 92 204 005 للاستفسار. لم يُذكر موعد للدورة.",
    },
    place: {
      fr: "Hammamet, Tunisie",
      en: "Hammamet, Tunisia",
      ar: "الحمامات، تونس",
    },
    embeddedVideos: [
      {
        url: site.facebook.footballVideoEmbeds[0],
        title: { fr: "Formation football · programme", en: "Football course · programme", ar: "تكوين كرة القدم · البرنامج" },
      },
    ],
    sourceUrl: site.facebook.footballVideos[0],
  },
  {
    id: "fitness-football-registration-2026-06-09",
    activity: "football",
    date: "2026-06-09",
    status: "course",
    title: {
      fr: "Enregistrement du projet de formation des entraîneurs de football",
      en: "Registration of the football-coach training project",
      ar: "تسجيل مشروع تكوين مدربي كرة القدم",
    },
    description: {
      fr: "Le post de l'académie indique que les démarches d'enregistrement d'un projet de formation d'entraîneurs de football avaient été réalisées. Les spécialités citées sont le coaching de base, la préparation physique, le coaching des gardiens et la direction technique et sportive. Le post ne confirme pas l'agrément de chaque spécialité ni la tenue d'une session.",
      en: "The academy's post says registration procedures for a football-coach training project had been completed. The listed specialities are basic coaching, physical preparation, goalkeeper coaching, and technical and sporting direction. The post does not verify each programme's authorisation or confirm that a session took place.",
      ar: "يذكر منشور الأكاديمية استكمال إجراءات تسجيل مشروع تكوين مدربي كرة القدم. وتشمل الاختصاصات المذكورة التدريب الأساسي والإعداد البدني وتدريب حراس المرمى والإدارة الفنية والرياضية. ولا يؤكد المنشور ترخيص كل اختصاص أو انعقاد دورة.",
    },
    sourceUrl: site.facebook.href,
  },
  {
    id: "tsa-k9-training-announcement-2026-05-03",
    activity: "tsa",
    date: "2026-05-03",
    status: "course",
    title: {
      fr: "Formation K9 · éducateur canin et homme d'attaque",
      en: "K9 training · canine educator and attack-dog handler",
      ar: "تكوين K9 · مربي كلاب ومرافق كلاب التدخل",
    },
    description: {
      fr: "Le post du 3 mai 2026 présente une formation de 15 jours à Manouba avec Cynophile Coaching, alliant théorie et pratique en psychologie canine, obéissance et conduite K9. Il précise que deux certificats sont reconnus en Tunisie et à l'étranger, sans nommer les organismes émetteurs. Aucune date de session future n'est établie.",
      en: "The 3 May 2026 post presents a 15-day course in Manouba with Cynophile Coaching, combining theory and practice in canine psychology, obedience, and K9 handling. It says two certificates are recognised in Tunisia and abroad but does not name the issuing bodies. No future session date is established.",
      ar: "يعرض منشور 3 ماي 2026 تكوينًا مدته 15 يومًا في منوبة مع Cynophile Coaching، يجمع بين النظري والتطبيقي في سلوك الكلاب والطاعة والتعامل مع K9. ويذكر أن شهادتين معترف بهما في تونس والخارج دون تحديد الجهات المصدرة. لم يُحدد موعد لدورة مستقبلية.",
    },
    place: {
      fr: "Manouba, Tunisie",
      en: "Manouba, Tunisia",
      ar: "منوبة، تونس",
    },
    sourceUrl: site.tunisianSecurityAcademy.k9TrainingPost,
  },
  {
    id: "tsa-security-officers-announcement-2026-09-08",
    activity: "tsa",
    date: "2026-09-08",
    status: "course",
    title: {
      fr: "Formation pour agents de sécurité et équipes de première intervention",
      en: "Security-officer and first-response team training",
      ar: "تكوين أعوان الأمن وفرق التدخل الأولي",
    },
    description: {
      fr: "Le post décrit un programme de quatre jours destiné aux agents de sécurité et de gardiennage d'hôtels et d'établissements sensibles. L'académie le situe aussi dans la préparation d'équipes de première intervention face aux attaques terroristes et criminelles ; le post décrit toutefois les objectifs plus généralement comme la réponse aux incidents et aux dangers. Les thèmes cités comprennent l'auto-sécurité, l'étude des risques, la gestion des conflits et l'évacuation. Aucune date de session ni réalisation n'est confirmée.",
      en: "The post describes a four-day programme for security and guarding staff at hotels and sensitive establishments. The academy also frames it as preparing first-response teams for terrorist and criminal attacks; the post itself describes the objective more generally as responding to incidents and hazards. Listed topics include self-security, risk assessment, conflict management, and evacuation. No session date or completion is confirmed.",
      ar: "يصف المنشور برنامجًا مدته أربعة أيام لأعوان الأمن والحراسة في الفنادق والمؤسسات الحساسة. كما تقدم الأكاديمية التكوين بوصفه إعدادًا لفرق التدخل الأولي في مواجهة الهجمات الإرهابية والإجرامية؛ لكن المنشور نفسه يصف الهدف بصورة عامة بأنه الاستجابة للحوادث والأخطار. وتشمل المواضيع المذكورة الأمن الذاتي وتقييم المخاطر وإدارة النزاعات والإخلاء. لم يتم تأكيد موعد الدورة أو إنجازها.",
    },
    place: {
      fr: "Hammamet · dates exactes non établies",
      en: "Hammamet · exact dates not established",
      ar: "الحمامات · لم يتم تحديد التواريخ بدقة",
    },
    embeddedVideos: [
      {
        url: site.tunisianSecurityAcademy.firstResponseVideos[1].embedUrl,
        title: { fr: "Intervention initiale et sécurité", en: "Initial response and security", ar: "التدخل الأولي والأمن" },
        platform: "facebook",
        layout: site.tunisianSecurityAcademy.firstResponseVideos[1].layout,
      },
    ],
    sourceUrl: site.tunisianSecurityAcademy.firstResponseVideos[1].sourceUrl,
  },
  {
    id: "tsa-cfa-la-marsa-announcement-2026-10-23",
    activity: "tsa",
    date: "2026-10-23",
    status: "course",
    title: {
      fr: "Formation de futurs intervenants de première réponse avec CFA La Marsa",
      en: "First-responder training collaboration with CFA La Marsa",
      ar: "تعاون لتكوين مستجيبين أوائل مع CFA La Marsa",
    },
    description: {
      fr: "Le post de l'académie décrit une collaboration avec CFA La Marsa autour de la formation de futurs intervenants de première réponse. Les détails de session et sa réalisation ne sont pas établis.",
      en: "The academy post describes a collaboration with CFA La Marsa to train future first responders. Session details and completion have not been established.",
      ar: "يصف منشور الأكاديمية تعاونًا مع CFA La Marsa لتكوين مستجيبين أوائل. لم يتم التثبت من تفاصيل الدورة أو إنجازها.",
    },
    embeddedVideos: [
      {
        url: site.tunisianSecurityAcademy.firstResponseVideos[0].embedUrl,
        title: { fr: "Formation des futurs intervenants", en: "Future first-responder training", ar: "تكوين المستجيبين الأوائل" },
        platform: "facebook",
        layout: site.tunisianSecurityAcademy.firstResponseVideos[0].layout,
      },
    ],
    sourceUrl: site.tunisianSecurityAcademy.firstResponseVideos[0].sourceUrl,
  },
];

/** Returns source-backed course records, optionally limited to one or more activities. */
export function historyFor(activity?: string | readonly HistoryActivity[]): HistoryEntry[] {
  const selected = activity ? new Set(typeof activity === "string" ? [activity] : activity) : null;
  return history
    .filter((entry) => !selected || selected.has(entry.activity))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
