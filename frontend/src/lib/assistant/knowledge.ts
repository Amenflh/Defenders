import "server-only";
import type { Locale } from "../i18n/config";
import { dictionaries } from "../i18n/dictionaries";
import { normalize } from "../search-index";
import { site } from "../site";

/**
 * Connaissances générales de l'assistant sur Defenders Academy (hors fiches de formation) :
 * présentation, agrément, suivi médical, partenaires, recrutement, réseaux, compte, conseils d'orientation…
 * Toutes les réponses reprennent des informations publiées sur le site (site.ts, dictionnaires).
 */

type L = Record<Locale, string>;
const pick = (text: L, locale: Locale) => text[locale];
const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

/** Marqueur de questions de relance, affichées en boutons par le panneau de l'assistant. */
export function withFollowUps(text: string, questions: string[]): string {
  const list = questions.filter(Boolean).slice(0, 3);
  return list.length ? `${text}\n\n[[suggest:${list.join("|")}]]` : text;
}

/** Une variante au hasard, pour que l'assistant ne réponde pas toujours mot pour mot pareil. */
export const vary = (options: string[]) => options[Math.floor(Math.random() * options.length)];

export const GREETINGS: Record<Locale, string[]> = {
  fr: [
    "Bonjour et bienvenue chez Defenders Academy ! Je peux vous parler de nos formations (Pilates, Football, Personal Trainer, sécurité, K9), des tarifs, des dates ou de l'inscription.",
    "Bonjour ! Ravi de vous aider. Une formation vous intéresse, ou voulez-vous que je vous conseille ?",
    "Salut ! Posez-moi n'importe quelle question sur Defenders Academy : formations, agrément, partenaires, contact…",
  ],
  en: [
    "Hello and welcome to Defenders Academy! I can tell you about our courses (Pilates, Football, Personal Trainer, security, K9), prices, dates or registration.",
    "Hi! Happy to help. Is there a course you are interested in, or would you like some advice?",
    "Hello! Ask me anything about Defenders Academy: courses, accreditation, partners, contact…",
  ],
  ar: [
    "مرحبًا بك في Defenders Academy! يمكنني إخبارك عن تكويناتنا (بيلاتس، كرة القدم، المدرب الشخصي، الأمن، K9) والأسعار والمواعيد والتسجيل.",
    "أهلًا! يسعدني مساعدتك. هل يهمك تكوين معيّن، أم تريد نصيحة؟",
    "مرحبًا! اسألني أي سؤال عن Defenders Academy: التكوينات، الاعتماد، الشركاء، الاتصال…",
  ],
};

export const THANKS: Record<Locale, string[]> = {
  fr: ["Avec plaisir ! Une autre question ?", "Je vous en prie ! N'hésitez pas si vous voulez en savoir plus.", "Avec plaisir. Bonne formation chez Defenders Academy !"],
  en: ["You're welcome! Anything else?", "My pleasure! Feel free to ask if you want to know more.", "You're welcome. Enjoy your training with Defenders Academy!"],
  ar: ["بكل سرور! هل لديك سؤال آخر؟", "العفو! لا تتردد إن أردت معرفة المزيد.", "بكل سرور. نتمنى لك تكوينًا ممتعًا مع Defenders Academy!"],
};

/** Questions de relance proposées après la réponse sur une formation. */
export const COURSE_FOLLOW_UPS: Record<Locale, { price: (n: string) => string; date: (n: string) => string; program: (n: string) => string; register: string; advice: string }> = {
  fr: { price: (n) => `Quel est le tarif de ${n} ?`, date: (n) => `Prochaine session de ${n} ?`, program: (n) => `Que contient ${n} ?`, register: "Comment s'inscrire ?", advice: "Quelle formation me conseillez-vous ?" },
  en: { price: (n) => `How much is ${n}?`, date: (n) => `Next session of ${n}?`, program: (n) => `What does ${n} cover?`, register: "How do I register?", advice: "Which course do you recommend?" },
  ar: { price: (n) => `ما سعر ${n}؟`, date: (n) => `متى الدورة القادمة لـ ${n}؟`, program: (n) => `ماذا يتضمن ${n}؟`, register: "كيف أسجل؟", advice: "أي تكوين تنصحني به؟" },
};

const Q: Record<string, L> = {
  about: { fr: "Qui êtes-vous ?", en: "Who are you?", ar: "من أنتم؟" },
  approval: { fr: "Êtes-vous un centre agréé ?", en: "Are you an accredited centre?", ar: "هل أنتم مركز معتمد؟" },
  medical: { fr: "Y a-t-il un suivi médical ?", en: "Is there medical follow-up?", ar: "هل توجد متابعة طبية؟" },
  partners: { fr: "Quels sont vos partenaires ?", en: "Who are your partners?", ar: "من هم شركاؤكم؟" },
  abroad: { fr: "Aidez-vous à travailler à l'étranger ?", en: "Do you help with jobs abroad?", ar: "هل تساعدون في العمل بالخارج؟" },
  security: { fr: "Proposez-vous des services de sécurité ?", en: "Do you offer security services?", ar: "هل تقدمون خدمات أمنية؟" },
  advice: { fr: "Quelle formation me conseillez-vous ?", en: "Which course do you recommend?", ar: "أي تكوين تنصحني به؟" },
  catalog: { fr: "Quelles formations proposez-vous ?", en: "Which courses do you offer?", ar: "ما هي التكوينات المتوفرة؟" },
  contact: { fr: "Comment vous contacter ?", en: "How can I contact you?", ar: "كيف أتصل بكم؟" },
  register: { fr: "Comment s'inscrire ?", en: "How do I register?", ar: "كيف أسجل؟" },
  exclusive: { fr: "Qu'est-ce que l'exclusivité OTDAV ?", en: "What is the OTDAV exclusivity?", ar: "ما هي حصرية OTDAV؟" },
  planning: { fr: "Quelles sont les prochaines dates ?", en: "What are the next dates?", ar: "ما هي المواعيد القادمة؟" },
  history: { fr: "Quelles formations ont déjà eu lieu ?", en: "Which courses have already taken place?", ar: "ما هي التكوينات السابقة؟" },
};
const follow = (locale: Locale, ...keys: (keyof typeof Q)[]) => keys.map((key) => pick(Q[key], locale));

type Topic = {
  id: string;
  /** Mots ou expressions déclencheurs (normalisés au chargement). */
  keywords: string[];
  answer: (locale: Locale, question: string) => string;
};

const fitnessCourses: L = {
  fr: "[Pilates](/fitness-academy/formations/pilates), [Football](/fitness-academy/formations/football) et [Personal Trainer](/fitness-academy/formations/personal-training)",
  en: "[Pilates](/fitness-academy/formations/pilates), [Football](/fitness-academy/formations/football) and [Personal Trainer](/fitness-academy/formations/personal-training)",
  ar: "[بيلاتس](/fitness-academy/formations/pilates) و[كرة القدم](/fitness-academy/formations/football) و[المدرب الشخصي](/fitness-academy/formations/personal-training)",
};
const tsaCourses: L = {
  fr: "[Intervention initiale](/tunisian-security-academy/formations/intervention-initiale), [Protection rapprochée](/tunisian-security-academy/formations/protection-rapprochee), [K9](/tunisian-security-academy/formations/k9) et la [sécurité & protection](/tunisian-security-academy#securite)",
  en: "[Initial Response](/tunisian-security-academy/formations/intervention-initiale), [Close Protection](/tunisian-security-academy/formations/protection-rapprochee), [K9](/tunisian-security-academy/formations/k9) and [security & protection](/tunisian-security-academy#securite)",
  ar: "[التدخل الأولي](/tunisian-security-academy/formations/intervention-initiale) و[الحماية القريبة](/tunisian-security-academy/formations/protection-rapprochee) و[K9](/tunisian-security-academy/formations/k9) و[الأمن والحماية](/tunisian-security-academy#securite)",
};

const TOPICS: Topic[] = [
  {
    id: "about",
    keywords: ["qui etes", "qui etes vous", "a propos", "presentez", "presentation", "defenders academy", "c est quoi defenders", "filiere", "filieres", "academies", "about", "who are you", "who are", "divisions", "من انتم", "عرفني", "من هي", "الاختصاصات", "اختصاصات"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `**Defenders Academy** est un centre de formation continue agréé (${site.approval}), basé à Hammamet. Il réunit **deux filières** :\n${bullets([
          `**Defenders Fitness Academy** — ${fitnessCourses.fr}.`,
          `**Tunisian Security Academy** — ${tsaCourses.fr}.`,
        ])}\nChaque session est encadrée par des professionnels, avec un suivi médical.`,
        en: `**Defenders Academy** is an accredited continuing-education centre (${site.approval}) based in Hammamet. It brings together **two divisions**:\n${bullets([
          `**Defenders Fitness Academy** — ${fitnessCourses.en}.`,
          `**Tunisian Security Academy** — ${tsaCourses.en}.`,
        ])}\nEvery session is led by professionals, with medical follow-up.`,
        ar: `**Defenders Academy** مركز تكوين مستمر معتمد (${site.approval}) مقره الحمامات، ويضم **اختصاصين**:\n${bullets([
          `**Defenders Fitness Academy** — ${fitnessCourses.ar}.`,
          `**Tunisian Security Academy** — ${tsaCourses.ar}.`,
        ])}\nكل دورة يؤطرها مختصون مع متابعة طبية.`,
      }, locale),
      follow(locale, "advice", "approval", "contact"),
    ),
  },
  {
    id: "security-services",
    keywords: ["dsp", "defenders security protection", "gardiennage", "devis", "societe de securite", "agents de securite pour", "service de securite", "services de securite", "securiser", "security services", "security company", "quote", "guarding", "خدمات امنيه", "حراسه", "شركه حراسه", "عرض سعر"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `**Defenders Security Protection** (gardiennage, protection rapprochée, formation aux métiers de la sécurité) fait partie de la **Tunisian Security Academy**.\n${bullets([
          "[Découvrir l'offre sécurité](/tunisian-security-academy#securite)",
          "[Programme de formation](/tunisian-security-academy#securite-programme)",
          `Demande de devis : formulaire sur la page, ou [${site.securityEmail.label}](${site.securityEmail.href})`,
          `Téléphone : **${site.phone2.label}** · [WhatsApp](${site.whatsapp.href})`,
        ])}`,
        en: `**Defenders Security Protection** (guarding, close protection, training for security professions) is part of the **Tunisian Security Academy**.\n${bullets([
          "[Explore the security offer](/tunisian-security-academy#securite)",
          "[Training programme](/tunisian-security-academy#securite-programme)",
          `Request a quote: form on the page, or [${site.securityEmail.label}](${site.securityEmail.href})`,
          `Phone: **${site.phone2.label}** · [WhatsApp](${site.whatsapp.href})`,
        ])}`,
        ar: `**Defenders Security Protection** (الحراسة، الحماية القريبة، التكوين في مهن الأمن) جزء من **Tunisian Security Academy**.\n${bullets([
          "[اكتشف العرض الأمني](/tunisian-security-academy#securite)",
          "[برنامج التكوين](/tunisian-security-academy#securite-programme)",
          `طلب عرض سعر: الاستمارة في الصفحة، أو [${site.securityEmail.label}](${site.securityEmail.href})`,
          `الهاتف: **${site.phone2.label}** · [واتساب](${site.whatsapp.href})`,
        ])}`,
      }, locale),
      follow(locale, "about", "contact"),
    ),
  },
  {
    id: "approval",
    keywords: ["agrement", "agree", "agreee", "certifie", "certifiee", "certification", "certificat", "certificats", "diplome", "diplomes", "attestation", "reconnu", "reconnue", "officiel", "ministere", "accredited", "accreditation", "certificate", "certified", "diploma", "recognised", "recognized", "معتمد", "اعتماد", "شهاده", "ديبلوم", "دبلوم", "الوزاره"],
    answer: (locale) => {
      const h = dictionaries[locale].highlights;
      return withFollowUps(
        pick({
          fr: `${h.approved.text}\n${bullets([`Agrément : **${site.approval}**`, "Les parcours comprennent une évaluation théorique et pratique, avec un certificat en fin de formation."])}\n[Voir nos formations](/formations)`,
          en: `${h.approved.text}\n${bullets([`Accreditation: **${site.approval}**`, "Courses include a theoretical and practical assessment, with a certificate at the end of the course."])}\n[See our courses](/formations)`,
          ar: `${h.approved.text}\n${bullets([`الاعتماد: **${site.approval}**`, "تتضمن المسارات تقييمًا نظريًا وتطبيقيًا، مع شهادة في نهاية التكوين."])}\n[تكويناتنا](/formations)`,
        }, locale),
        follow(locale, "exclusive", "medical", "catalog"),
      );
    },
  },
  {
    id: "medical",
    keywords: ["medecin", "medecins", "medical", "medicale", "sante", "blessure", "blessures", "docteur", "doctor", "doctors", "injury", "health", "طبيب", "اطباء", "طبيه", "طبي", "اصابه"],
    answer: (locale) => withFollowUps(`${dictionaries[locale].highlights.medical.text}`, follow(locale, "approval", "catalog")),
  },
  {
    id: "exclusive",
    keywords: ["exclusivite", "exclusif", "exclusive", "exclusivity", "otdav", "droits d auteur", "حصري", "حصريه", "الحصريه"],
    answer: (locale) => {
      const h = dictionaries[locale].highlights.exclusive;
      return withFollowUps(
        `${h.text}\n${bullets([`[${h.certificate}](${site.documents.otdav})`, `[${h.post}](${site.documents.exclusivityPost})`])}`,
        follow(locale, "approval", "catalog"),
      );
    },
  },
  {
    id: "partners",
    keywords: ["partenaire", "partenaires", "partenariat", "partners", "partner", "partnership", "شركاء", "شريك", "شراكه"],
    answer: (locale) => withFollowUps(
      `${pick({ fr: "Nos partenaires :", en: "Our partners:", ar: "شركاؤنا:" }, locale)}\n${bullets(site.partners.map((p) => `[${p.name}](${p.href}) — ${p.description}`))}`,
      follow(locale, "abroad", "about"),
    ),
  },
  {
    id: "abroad",
    keywords: ["etranger", "a l etranger", "recrutement", "recruter", "emploi a l etranger", "travailler a l etranger", "contrat", "golfe", "abroad", "overseas", "recruitment", "work abroad", "الخارج", "بالخارج", "توظيف", "انتداب", "الخليج"],
    answer: (locale) => {
      const recruiters = site.partners.filter((p) => /bayrak|ritej/i.test(p.name));
      return withFollowUps(
        `${pick({
          fr: "Defenders Academy travaille avec des agences de recrutement partenaires. Le recrutement dépend des offres disponibles et de votre profil :",
          en: "Defenders Academy works with partner recruitment agencies. Recruitment depends on the offers available and on your profile:",
          ar: "تتعاون Defenders Academy مع وكالات توظيف شريكة. يتوقف التوظيف على العروض المتاحة وعلى ملفك:",
        }, locale)}\n${bullets(recruiters.map((p) => `[${p.name}](${p.href}) — ${p.description}`))}\n${pick({
          fr: `Pour en parler : [WhatsApp](${site.whatsapp.href}) ou **${site.phone2.label}**.`,
          en: `To discuss it: [WhatsApp](${site.whatsapp.href}) or **${site.phone2.label}**.`,
          ar: `للتحدث في الموضوع: [واتساب](${site.whatsapp.href}) أو **${site.phone2.label}**.`,
        }, locale)}`,
        follow(locale, "partners", "catalog"),
      );
    },
  },
  {
    id: "social",
    keywords: ["facebook", "instagram", "linkedin", "messenger", "reseaux", "reseaux sociaux", "page facebook", "social", "social media", "فيسبوك", "انستغرام", "مواقع التواصل"],
    answer: (locale) => withFollowUps(
      `${pick({ fr: "Suivez-nous :", en: "Follow us:", ar: "تابعونا:" }, locale)}\n${bullets([
        `[Facebook — Defenders Fitness Academy](${site.facebook.href})`,
        `[Instagram — ${site.instagram.label}](${site.instagram.href})`,
        `[Facebook — Tunisian Security Academy](${site.tunisianSecurityAcademy.facebook})`,
        `[Messenger](${site.messenger.href})`,
        ...(site.linkedin.href ? [`[LinkedIn](${site.linkedin.href})`] : []),
      ])}`,
      follow(locale, "contact", "history"),
    ),
  },
  {
    id: "history",
    keywords: ["historique", "anciennes sessions", "sessions passees", "deja eu lieu", "precedentes", "references", "history", "past sessions", "previous", "السابقه", "الدورات السابقه", "ارشيف"],
    answer: (locale) => withFollowUps(
      pick({
        fr: "Retrouvez les sessions et annonces passées, filtrables par académie et par activité, sur la page [Historique](/historique). Les photos des promotions sont dans la [galerie](/#galerie).",
        en: "Past sessions and announcements, filterable by academy and activity, are on the [History](/historique) page. Class photos are in the [gallery](/#galerie).",
        ar: "تجد الدورات والإعلانات السابقة، مع إمكانية التصفية حسب الأكاديمية والنشاط، في صفحة [السجل](/historique). صور الدفعات في [المعرض](/#galerie).",
      }, locale),
      follow(locale, "planning", "catalog"),
    ),
  },
  {
    id: "testimonials",
    keywords: ["avis", "temoignage", "temoignages", "retours", "anciens stagiaires", "reviews", "testimonials", "feedback", "اراء", "تجارب"],
    answer: (locale) => withFollowUps(
      pick({
        fr: "Des stagiaires racontent leur expérience en vidéo dans la section [Témoignages](/#temoignages) de l'accueil. Vous pouvez aussi partager la vôtre par e-mail.",
        en: "Trainees share their experience on video in the [Testimonials](/#temoignages) section of the home page. You can share yours by email too.",
        ar: "يروي متكونون تجربتهم بالفيديو في قسم [الشهادات](/#temoignages) بالصفحة الرئيسية، ويمكنك مشاركة تجربتك عبر البريد الإلكتروني.",
      }, locale),
      follow(locale, "history", "catalog"),
    ),
  },
  {
    id: "rules",
    keywords: ["reglement", "reglement interieur", "regles", "discipline", "absences", "rules", "policy", "internal rules", "النظام الداخلي", "قوانين", "القانون الداخلي"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `Le règlement intérieur s'applique à toutes les formations : [lire le règlement](/reglement-interieur) · [PDF](${site.documents.rules}).`,
        en: `The internal rules apply to every course: [read the rules](/reglement-interieur) · [PDF](${site.documents.rules}).`,
        ar: `يُطبَّق النظام الداخلي على كل التكوينات: [قراءة النظام](/reglement-interieur) · [PDF](${site.documents.rules}).`,
      }, locale),
      follow(locale, "register", "contact"),
    ),
  },
  {
    id: "account",
    keywords: ["compte", "mon compte", "connexion", "connecter", "se connecter", "mot de passe", "mon espace", "espace client", "account", "login", "log in", "password", "sign in", "حساب", "حسابي", "دخول", "كلمه السر"],
    answer: (locale) => withFollowUps(
      pick({
        fr: "Votre espace se trouve ici : [Se connecter](/login) · [Créer un compte](/register) · [Mon espace](/mon-espace). Vous y suivez vos demandes d'inscription.",
        en: "Your space is here: [Log in](/login) · [Create an account](/register) · [My space](/mon-espace). You can follow your registration requests there.",
        ar: "فضاؤك هنا: [تسجيل الدخول](/login) · [إنشاء حساب](/register) · [فضائي](/mon-espace). يمكنك متابعة طلبات التسجيل من هناك.",
      }, locale),
      follow(locale, "register", "catalog"),
    ),
  },
  {
    id: "payment",
    keywords: ["facilite", "facilites", "tranche", "tranches", "versement", "versements", "echelonne", "paiement en plusieurs", "installment", "installments", "payment plan", "تقسيط", "اقساط", "دفعات"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `Les modalités de paiement ne sont pas publiées sur le site : l'équipe vous les précise selon la formation. Contact : **${site.phone.label}** · [WhatsApp](${site.whatsapp.href}).`,
        en: `Payment terms are not published on the site: the team will explain them for your course. Contact: **${site.phone.label}** · [WhatsApp](${site.whatsapp.href}).`,
        ar: `طرق الدفع غير منشورة على الموقع: يوضحها لك الفريق حسب التكوين. الاتصال: **${site.phone.label}** · [واتساب](${site.whatsapp.href}).`,
      }, locale),
      follow(locale, "catalog", "register"),
    ),
  },
  {
    id: "online",
    keywords: ["en ligne", "a distance", "distanciel", "presentiel", "online", "remote", "in person", "عن بعد", "اونلاين", "حضوري"],
    answer: (locale) => withFollowUps(
      pick({
        fr: "Les formations comportent de la pratique sur place (terrain, studio, salle, exercices de mise en situation). Le site n'annonce pas de formation en ligne : l'équipe vous confirme les modalités de chaque session.",
        en: "Courses include on-site practice (pitch, studio, gym, scenario exercises). The site does not advertise online courses: the team will confirm the arrangements for each session.",
        ar: "تتضمن التكوينات تطبيقًا حضوريًا (ملعب، استوديو، قاعة، تمارين محاكاة). لا يعلن الموقع عن تكوين عن بعد، ويؤكد لك الفريق ترتيبات كل دورة.",
      }, locale),
      follow(locale, "planning", "contact"),
    ),
  },
  {
    id: "hours",
    keywords: ["horaire", "horaires", "ouvert", "ouverture", "heures d ouverture", "opening hours", "open", "مواقيت", "اوقات العمل", "مفتوح"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `Les horaires d'accueil ne sont pas publiés : appelez le **${site.phone.label}** ou écrivez-nous sur [WhatsApp](${site.whatsapp.href}) avant de passer. Adresse : ${site.address.lines.join(", ")} · [Itinéraire](${site.address.href}).`,
        en: `Opening hours are not published: call **${site.phone.label}** or message us on [WhatsApp](${site.whatsapp.href}) before visiting. Address: ${site.address.lines.join(", ")} · [Directions](${site.address.href}).`,
        ar: `أوقات الاستقبال غير منشورة: اتصل بـ **${site.phone.label}** أو راسلنا على [واتساب](${site.whatsapp.href}) قبل القدوم. العنوان: ${site.address.lines.join(", ")} · [الاتجاهات](${site.address.href}).`,
      }, locale),
      follow(locale, "contact"),
    ),
  },
  {
    id: "languages",
    keywords: ["langue", "langues", "arabe", "anglais", "francais", "language", "languages", "english", "arabic", "french", "لغه", "اللغه", "العربيه", "الفرنسيه"],
    answer: (locale) => withFollowUps(
      pick({
        fr: "Le site est disponible en français, en anglais et en arabe (sélecteur de langue en haut de page). Pour la langue d'enseignement d'une session, l'équipe vous la confirme.",
        en: "The site is available in French, English and Arabic (language switcher at the top of the page). The team will confirm the teaching language of a session.",
        ar: "الموقع متوفر بالفرنسية والإنجليزية والعربية (اختيار اللغة أعلى الصفحة). يؤكد لك الفريق لغة التدريس في كل دورة.",
      }, locale),
      follow(locale, "contact", "catalog"),
    ),
  },
  {
    id: "gallery",
    keywords: ["photo", "photos", "galerie", "images", "video", "videos", "gallery", "pictures", "صور", "فيديو", "المعرض"],
    answer: (locale) => withFollowUps(
      pick({
        fr: `Photos des promotions : [galerie](/#galerie) · Vidéos : [Facebook](${site.facebook.videos}) et [Instagram](${site.instagram.href}) · Sessions passées : [Historique](/historique).`,
        en: `Class photos: [gallery](/#galerie) · Videos: [Facebook](${site.facebook.videos}) and [Instagram](${site.instagram.href}) · Past sessions: [History](/historique).`,
        ar: `صور الدفعات: [المعرض](/#galerie) · الفيديوهات: [فيسبوك](${site.facebook.videos}) و[إنستغرام](${site.instagram.href}) · الدورات السابقة: [السجل](/historique).`,
      }, locale),
      follow(locale, "history", "social"),
    ),
  },
];

const PREPARED = TOPICS.map((topic) => ({ ...topic, keywords: [...new Set(topic.keywords.map(normalize).filter(Boolean))] }));

/** Sujet général reconnu dans la question (le plus long mot-clé l'emporte), avec la force de la correspondance. */
export function topicAnswer(tokens: string[], question: string, locale: Locale): { text: string; score: number } | null {
  const joined = ` ${tokens.join(" ")} `;
  let best: (typeof PREPARED)[number] | null = null;
  let bestScore = 0;
  for (const topic of PREPARED) {
    const score = topic.keywords.reduce((n, kw) => n + (joined.includes(` ${kw} `) ? kw.length : 0), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best ? { text: best.answer(locale, question), score: bestScore } : null;
}

/* ----------------------------- Conseil d'orientation ----------------------------- */

const ADVICE_TRIGGERS = ["conseil", "conseille", "conseillez", "conseiller", "orientation", "orienter", "quiz", "laquelle", "lequel", "hesite", "choisir", "quoi faire", "pour moi", "me convient", "recommande", "recommandez", "recommend", "recommendation", "advice", "which course", "which one", "choose", "suits me", "best for me", "انصح", "تنصحني", "نصيحه", "اختار", "يناسبني", "اي تكوين"].map(normalize);

const GOALS: { key: string; words: string[]; text: L }[] = [
  {
    key: "football",
    words: ["football", "foot", "entraineur", "club", "equipe", "joueurs", "terrain", "soccer", "coach football", "team", "players", "كره", "القدم", "فريق", "نادي"],
    text: { fr: "[Football](/fitness-academy/formations/football) — pour entraîner une équipe ou un club", en: "[Football](/fitness-academy/formations/football) — to coach a team or club", ar: "[كرة القدم](/fitness-academy/formations/football) — لتدريب فريق أو نادٍ" },
  },
  {
    key: "personal",
    words: ["salle", "musculation", "fitness", "clients", "coach sportif", "perte de poids", "remise en forme", "gym", "personal", "weight", "قاعه", "رياضه", "مدرب شخصي", "لياقه"],
    text: { fr: "[Personal Trainer](/fitness-academy/formations/personal-training) — pour coacher des clients en salle ou à domicile", en: "[Personal Trainer](/fitness-academy/formations/personal-training) — to coach clients in the gym or at home", ar: "[المدرب الشخصي](/fitness-academy/formations/personal-training) — لتدريب الحرفاء في القاعة أو في المنزل" },
  },
  {
    key: "pilates",
    words: ["pilates", "posture", "dos", "souplesse", "gainage", "studio", "reformer", "rehabilitation", "flexibility", "بيلاتس", "مرونه", "الظهر"],
    text: { fr: "[Pilates](/fitness-academy/formations/pilates) — pour enseigner le Pilates Matwork & Reformer", en: "[Pilates](/fitness-academy/formations/pilates) — to teach Pilates Matwork & Reformer", ar: "[بيلاتس](/fitness-academy/formations/pilates) — لتدريس بيلاتس على البساط وعلى جهاز Reformer" },
  },
  {
    key: "security",
    words: ["securite", "agent", "hotel", "garde", "protection", "bodyguard", "police", "armee", "intervention", "security", "guard", "امن", "حارس", "حمايه", "فندق"],
    text: { fr: "[Tunisian Security Academy](/tunisian-security-academy) — intervention initiale, protection rapprochée, métiers de la sécurité", en: "[Tunisian Security Academy](/tunisian-security-academy) — initial response, close protection, security professions", ar: "[Tunisian Security Academy](/tunisian-security-academy) — التدخل الأولي، الحماية القريبة، مهن الأمن" },
  },
  {
    key: "k9",
    words: ["chien", "chiens", "canin", "k9", "dog", "dogs", "كلب", "كلاب"],
    text: { fr: "[K9 — Éducateur canin & homme d'attaque](/tunisian-security-academy/formations/k9)", en: "[K9 — Dog trainer & decoy](/tunisian-security-academy/formations/k9)", ar: "[K9 — مدرب كلاب ورجل هجوم](/tunisian-security-academy/formations/k9)" },
  },
].map((goal) => ({ ...goal, words: goal.words.map(normalize) }));

export function isAdviceQuestion(tokens: string[]): boolean {
  const joined = ` ${tokens.join(" ")} `;
  return ADVICE_TRIGGERS.some((trigger) => joined.includes(` ${trigger} `));
}

/** Recommandation selon les objectifs cités (« je veux entraîner un club » → Football), sinon tour d'horizon + quiz. */
export function adviceAnswer(tokens: string[], locale: Locale): string {
  const joined = ` ${tokens.join(" ")} `;
  const matched = GOALS.filter((goal) => goal.words.some((word) => joined.includes(` ${word} `)));
  const nav = dictionaries[locale].nav;
  if (matched.length) {
    return withFollowUps(
      `${pick({ fr: "D'après ce que vous décrivez, je vous conseille :", en: "Based on what you describe, I recommend:", ar: "حسب ما وصفته، أنصحك بـ:" }, locale)}\n${bullets(matched.map((goal) => pick(goal.text, locale)))}\n${pick({
        fr: "Pour affiner, faites le [quiz d'orientation](/trouver-ma-formation) (1 minute).",
        en: "To narrow it down, take the [orientation quiz](/trouver-ma-formation) (1 minute).",
        ar: "للمزيد من الدقة، أجب عن [اختبار التوجيه](/trouver-ma-formation) (دقيقة واحدة).",
      }, locale)}`,
      [COURSE_FOLLOW_UPS[locale].register, pick(Q.planning, locale)],
    );
  }
  return withFollowUps(
    `${pick({
      fr: "Tout dépend de votre objectif :",
      en: "It depends on your goal:",
      ar: "يتوقف ذلك على هدفك:",
    }, locale)}\n${bullets(GOALS.map((goal) => pick(goal.text, locale)))}\n${pick({
      fr: `Dites-moi ce que vous voulez faire (ex. « entraîner un club », « devenir coach en salle », « travailler dans la sécurité »), ou faites le [quiz d'orientation](/trouver-ma-formation). Toutes les fiches : [${nav.formations}](/formations).`,
      en: `Tell me what you want to do (e.g. "coach a club", "become a gym coach", "work in security"), or take the [orientation quiz](/trouver-ma-formation). All courses: [${nav.formations}](/formations).`,
      ar: `أخبرني بما تريد فعله (مثل «تدريب نادٍ» أو «مدرب في قاعة» أو «العمل في الأمن»)، أو أجب عن [اختبار التوجيه](/trouver-ma-formation). كل التكوينات: [${nav.formations}](/formations).`,
    }, locale)}`,
    [],
  );
}
