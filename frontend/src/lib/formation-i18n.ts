import type { Locale } from "./i18n/config";

/**
 * Traductions anglaise et arabe du contenu des formations d'origine (le contenu de référence, en français,
 * vient de l'API et se modifie dans l'admin). Si l'admin crée une nouvelle formation, elle s'affiche en français
 * dans toutes les langues tant qu'aucune traduction n'est ajoutée ici.
 */
type Content = {
  name: string;
  headline: string;
  summary: string;
  intro: string[];
  objectives: string[];
  modules: { title: string; text: string }[];
  audience: string[];
  careers: string[];
  facts: { label: string; value: string }[];
};

const T: Record<string, Partial<Record<Exclude<Locale, "fr">, Content>>> = {
  pilates: {
    en: {
      name: "Pilates",
      headline: "Pilates Mat & Reformer Instructor Training",
      summary: "Train in Matwork and Reformer, levels 1 and 2: 40 hours over six days in Nabeul, with certification stated at the end of the course. Contact the academy to confirm the next session.",
      intro: [
        "Pilates is one of the most requested practices in studios and private coaching. Our course combines a scientific understanding of movement with teaching skills.",
        "You work on the mat and on the Reformer, focusing on alignment, breathing, core control and adapting exercises to different profiles.",
      ],
      objectives: [
        "Understand the fundamental principles of the Pilates method",
        "Analyse posture and movement through functional anatomy",
        "Teach the Mat and Reformer repertoire safely",
        "Adapt exercises for beginners, athletes and specific groups",
        "Design and lead one-to-one and group sessions",
      ],
      modules: [
        { title: "Anatomy & biomechanics", text: "Spine, pelvis, shoulder girdle: the basics to analyse every movement." },
        { title: "Core principles", text: "Breathing, centring, control, precision, flow and concentration." },
        { title: "Mat repertoire", text: "Floor exercises, progressions, regressions, cues and corrections." },
        { title: "Reformer", text: "Settings, safety, sequences and use of the springs." },
        { title: "Specific groups", text: "Adaptations for back pain, pregnancy, seniors and athletes." },
        { title: "Teaching & sessions", text: "Build, pace and lead a professional session." },
      ],
      audience: ["Fitness coaches who want to specialise", "Recent sports science graduates", "Wellness and rehabilitation professionals"],
      careers: ["Pilates studio instructor", "Private coach at home or online", "Instructor in gyms and wellness centres"],
      facts: [{ label: "Equipment", value: "Mat & Reformer" }, { label: "Approach", value: "Theory + practice" }, { label: "Validation", value: "Certificate" }],
    },
    ar: {
      name: "بيلاتس",
      headline: "تكوين مدربي Pilates Mat وReformer",
      summary: "تكوين Matwork وReformer، المستوى الأول والثاني: 40 ساعة خلال ستة أيام في نابل، مع شهادة مذكورة في نهاية التكوين. تواصل مع الأكاديمية للتثبت من موعد الدورة القادمة.",
      intro: [
        "البيلاتس من أكثر الممارسات طلبًا في الاستوديوهات والتدريب الخاص. يجمع تكويننا بين الفهم العلمي للحركة والتحكم البيداغوجي.",
        "تعمل على البساط وعلى الريفورمر، مع التركيز على وضعية الجسم والتنفس والتحكم في الجذع وتكييف التمارين مع مختلف الملفات.",
      ],
      objectives: [
        "فهم المبادئ الأساسية لطريقة البيلاتس",
        "تحليل وضعية الجسم والحركة عبر التشريح الوظيفي",
        "تدريس تمارين البساط والريفورمر بأمان",
        "تكييف التمارين للمبتدئين والرياضيين والفئات الخاصة",
        "تصميم وتنشيط حصص فردية وجماعية",
      ],
      modules: [
        { title: "التشريح والميكانيكا الحيوية", text: "العمود الفقري، الحوض، حزام الكتف: أسس تحليل كل حركة." },
        { title: "المبادئ الأساسية", text: "التنفس، التمركز، التحكم، الدقة، الانسيابية والتركيز." },
        { title: "تمارين البساط", text: "تمارين أرضية، تدرّج، تبسيط، توجيهات وتصحيحات." },
        { title: "الريفورمر", text: "الضبط، السلامة، تسلسل التمارين واستعمال النوابض." },
        { title: "الفئات الخاصة", text: "تكييفات لآلام الظهر، الحمل، كبار السن والرياضيين." },
        { title: "البيداغوجيا والحصة", text: "بناء حصة مهنية وتنظيم إيقاعها وتنشيطها." },
      ],
      audience: ["مدربو رياضة يرغبون في التخصص", "خريجون جدد في علوم الرياضة", "محترفو الرفاه وإعادة التأهيل"],
      careers: ["مدرب بيلاتس في استوديو", "مدرب خاص في المنزل أو عن بعد", "مدرب في قاعات الرياضة ومراكز الرفاه"],
      facts: [{ label: "الأجهزة", value: "بساط وريفورمر" }, { label: "المنهج", value: "نظري + تطبيقي" }, { label: "المصادقة", value: "شهادة" }],
    },
  },
  football: {
    en: {
      name: "Football",
      headline: "Football Coaching and Training Course",
      summary: "Take a four-day football-coaching course in Hammamet focused on session design, physical preparation, game analysis and practical coaching. The post lists two certificates and a 750 TND fee; upcoming dates are not stated.",
      intro: [
        "Coaching means passing on a method. Our course covers planning, physical preparation, tactics and management.",
        "The programme alternates theory and practical scenarios, with ready-to-use sessions.",
      ],
      objectives: [
        "Plan a season, a cycle and a session",
        "Develop football-specific physical qualities",
        "Teach game principles and tactical organisation",
        "Coach youth categories",
        "Manage a group, communication and motivation",
      ],
      modules: [
        { title: "Methodology", text: "Objectives, content and progression of a session." },
        { title: "Physical preparation", text: "Endurance, speed, strength and injury prevention." },
        { title: "Tactics & game principles", text: "Collective organisation, transitions and game management." },
        { title: "Youth categories", text: "Developing young players, small-sided games and technical learning." },
        { title: "Analysis & video", text: "Watch a match and define areas to work on." },
        { title: "Management", text: "Leadership, communication and dressing-room management." },
      ],
      audience: ["Working coaches and educators", "Experienced athletes (2+ years)", "Sports science graduates"],
      careers: ["Club coach or educator", "Football physical trainer", "Opportunities abroad with our partner RITEJ"],
      facts: [{ label: "Duration", value: "4 intensive days" }, { label: "Accommodation", value: "Included" }, { label: "Validation", value: "Accredited certificate" }],
    },
    ar: {
      name: "كرة القدم",
      headline: "تكوين في تدريب كرة القدم والإعداد",
      summary: "تكوين مدته أربعة أيام في الحمامات حول تخطيط الحصص والإعداد البدني وتحليل اللعب والتدريب التطبيقي. يذكر المنشور شهادتين وسعرًا قدره 750 دينارًا؛ ولا يحدد موعد الدورة القادمة.",
      intro: [
        "التدريب هو نقل منهجية. يشمل تكويننا التخطيط والإعداد البدني والتكتيك والتسيير.",
        "يتناوب البرنامج بين الدروس النظرية والوضعيات التطبيقية، مع حصص جاهزة للاستعمال.",
      ],
      objectives: [
        "تخطيط موسم ودورة وحصة تدريبية",
        "تطوير الصفات البدنية الخاصة بكرة القدم",
        "نقل مبادئ اللعب والتنظيم التكتيكي",
        "تأطير الفئات الشابة",
        "تسيير المجموعة والتواصل والتحفيز",
      ],
      modules: [
        { title: "المنهجية", text: "أهداف الحصة ومحتواها وتدرّجها." },
        { title: "الإعداد البدني", text: "التحمل، السرعة، القوة والوقاية من الإصابات." },
        { title: "التكتيك ومبادئ اللعب", text: "التنظيم الجماعي، التحولات وتنشيط اللعب." },
        { title: "الفئات الشابة", text: "تكوين اللاعب الشاب، الألعاب المصغرة والتعلم التقني." },
        { title: "التحليل والفيديو", text: "ملاحظة مباراة وتحديد محاور العمل." },
        { title: "التسيير", text: "القيادة، التواصل وتسيير غرفة الملابس." },
      ],
      audience: ["مربّون ومدربون ناشطون", "رياضيون ذوو خبرة (أكثر من سنتين)", "خريجو علوم الرياضة"],
      careers: ["مدرب أو مربٍّ في نادٍ", "معدّ بدني في كرة القدم", "فرص في الخارج مع شريكنا رتاج"],
      facts: [{ label: "المدة", value: "4 أيام مكثفة" }, { label: "الإقامة", value: "مشمولة" }, { label: "المصادقة", value: "شهادة معتمدة" }],
    },
  },
  "personal-training": {
    en: {
      name: "Personal Training",
      headline: "Personal Sports Coaching Course",
      summary: "Assess client goals, plan sessions, and coach strength training, conditioning and nutrition foundations. Watch the source videos and contact the academy for upcoming dates and location.",
      intro: [
        "Private coaching requires solid expertise and a real client relationship. The certification gives you the scientific and practical tools to design effective and safe programmes.",
        "An intensive course led by experienced trainers, with career support through our partner network.",
      ],
      objectives: [
        "Assess a client's fitness and goals",
        "Programme training: strength, hypertrophy, weight loss, performance",
        "Master strength-training technique and safety",
        "Give nutrition advice grounded in sports science",
        "Grow your private coaching business",
      ],
      modules: [
        { title: "Exercise physiology", text: "Energy systems, adaptations and recovery." },
        { title: "Strength training", text: "Technique of fundamental lifts, loads and safety." },
        { title: "Programming", text: "Periodisation, progression and tracking results." },
        { title: "Nutrition", text: "Needs, body composition and eating habits." },
        { title: "Client assessment", text: "Tests, health history and measurable goals." },
        { title: "Coaching business", text: "Client relations, offer, pricing and retention." },
      ],
      audience: ["Fitness enthusiasts who want to become coaches", "Coaches seeking a recognised certification", "Sports science graduates"],
      careers: ["Freelance personal trainer", "Gym coach", "Contract opportunities abroad with RITEJ"],
      facts: [{ label: "Duration", value: "4 consecutive days" }, { label: "Certificates", value: "7 certificates" }, { label: "Accommodation", value: "Included" }],
    },
    ar: {
      name: "التدريب الشخصي",
      headline: "تكوين في التدريب الرياضي الشخصي",
      summary: "قيّم أهداف الحرفاء، وبرمج حصصهم، ورافقهم في تمارين القوة واللياقة وأسس التغذية. شاهد الفيديوهات المصدرية وتواصل مع الأكاديمية لمعرفة المواعيد والمكان.",
      intro: [
        "يتطلب التدريب الخاص خبرة متينة وعلاقة حقيقية مع الحريف. تمنحك الشهادة الأدوات العلمية والعملية لتصميم برامج فعالة وآمنة.",
        "تكوين مكثف يؤطره مدربون ذوو خبرة، مع مرافقة نحو التشغيل عبر شبكة شركائنا.",
      ],
      objectives: [
        "تقييم اللياقة البدنية للحريف وأهدافه",
        "برمجة التدريب: القوة، تضخيم العضلات، إنقاص الوزن، الأداء",
        "إتقان تقنيات تقوية العضلات وقواعد السلامة",
        "تقديم نصائح غذائية مبنية على علوم الرياضة",
        "تطوير نشاطك كمدرب خاص",
      ],
      modules: [
        { title: "فيزيولوجيا الجهد", text: "مصادر الطاقة، التكيّفات والاسترجاع." },
        { title: "تقوية العضلات", text: "تقنيات الحركات الأساسية، الأحمال والسلامة." },
        { title: "البرمجة", text: "التخطيط الدوري، التدرّج ومتابعة النتائج." },
        { title: "التغذية", text: "الاحتياجات، تركيبة الجسم والعادات الغذائية." },
        { title: "تقييم الحريف", text: "الاختبارات، السوابق الصحية وأهداف قابلة للقياس." },
        { title: "إدارة نشاط التدريب", text: "العلاقة مع الحريف، العرض، التسعير والولاء." },
      ],
      audience: ["شغوفون باللياقة يرغبون في أن يصبحوا مدربين", "مدربون يبحثون عن شهادة معترف بها", "خريجو علوم الرياضة"],
      careers: ["مدرب شخصي مستقل", "مدرب في قاعة رياضة", "فرص عقود في الخارج مع رتاج"],
      facts: [{ label: "المدة", value: "4 أيام متتالية" }, { label: "الشهادات", value: "7 شهادات" }, { label: "الإقامة", value: "مشمولة" }],
    },
  },
};

/** Remplace les textes d'une formation par leur traduction (si elle existe) ; en français, renvoie la formation telle quelle. */
export function localizeFormation<F extends { slug: string } & Partial<Content>>(f: F, locale: Locale): F {
  if (locale === "fr") return f;
  const tr = T[f.slug]?.[locale];
  if (!tr) return f;
  const merged = { ...f } as F & Content;
  for (const key of Object.keys(tr) as (keyof Content)[]) {
    // On ne traduit que les champs présents dans la formation (une liste vidée dans l'admin reste vide).
    const current = f[key];
    if (current === undefined || (Array.isArray(current) && current.length === 0)) continue;
    (merged as Record<string, unknown>)[key] = tr[key];
  }
  return merged;
}
