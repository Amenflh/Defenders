import "server-only";
import { formationHref } from "../academies";
import { replaceDefaultContacts } from "../contacts";
import { localizeFormation } from "../formation-i18n";
import { formatPrice, getFormations } from "../formations";
import { intlLocale, type Locale } from "../i18n/config";
import { dictionaries } from "../i18n/dictionaries";
import { getContacts, getFaqs } from "../settings";
import { buildSearchIndex, normalize, prepareIndex, searchIndex } from "../search-index";
import { site } from "../site";
import { adviceAnswer, COURSE_FOLLOW_UPS, GREETINGS, isAdviceQuestion, THANKS, topicAnswer, vary, withFollowUps } from "./knowledge";

/**
 * Assistant de recherche sans IA (gratuit, sans service externe) : il repère dans la question
 * une intention (tarif, date, durée, programme, contact…) et une formation, puis extrait la réponse
 * des contenus du site et du catalogue publié dans l'admin. Sinon, il se rabat sur la recherche du site.
 */

type Intent = "price" | "date" | "duration" | "program" | "audience" | "careers" | "contact" | "register" | "catalog" | "hello" | "thanks";

/** Mots déclencheurs, déjà normalisés (minuscules, sans accents, alif et ta marbuta unifiés). */
const INTENTS: Record<Intent, string[]> = {
  price: ["prix", "tarif", "tarifs", "cout", "coute", "couts", "payer", "paiement", "dinar", "dinars", "dt", "price", "prices", "cost", "costs", "fee", "fees", "pay", "سعر", "ثمن", "تكلفه", "اسعار", "الاسعار", "السعر", "بكم", "الثمن"],
  date: ["date", "dates", "quand", "prochaine", "prochain", "session", "sessions", "planning", "calendrier", "commence", "debut", "when", "next", "start", "schedule", "موعد", "متى", "تاريخ", "القادمه", "الرزنامه", "مواعيد"],
  duration: ["duree", "jours", "jour", "semaines", "semaine", "heures", "longtemps", "duration", "long", "days", "weeks", "hours", "مده", "المده", "يوم", "ايام", "اسبوع"],
  program: ["programme", "contenu", "contient", "module", "modules", "cours", "apprend", "apprendre", "matieres", "program", "programme", "content", "curriculum", "learn", "syllabus", "topics", "covers", "برنامج", "البرنامج", "محتوى", "مواد", "اتعلم"],
  audience: ["public", "profil", "prerequis", "conditions", "condition", "niveau", "audience", "requirements", "prerequisites", "level", "who", "لمن", "شروط", "الشروط", "مستوى"],
  careers: ["debouches", "debouche", "metier", "metiers", "emploi", "travail", "carriere", "job", "jobs", "career", "careers", "work", "عمل", "وظيفه", "مهنه", "شغل"],
  contact: ["contact", "contacter", "telephone", "tel", "numero", "appeler", "joindre", "whatsapp", "email", "mail", "adresse", "situe", "trouve", "localisation", "phone", "call", "number", "address", "located", "location", "اتصال", "هاتف", "رقم", "عنوان", "العنوان", "واتساب", "اين", "الهاتف"],
  register: ["inscrire", "inscription", "inscris", "inscrit", "reserver", "register", "registration", "enrol", "enroll", "signup", "تسجيل", "التسجيل", "اسجل", "سجل"],
  catalog: ["formations", "liste", "proposez", "offrez", "offre", "courses", "offer", "list", "trainings", "تكوينات", "التكوينات", "دورات", "الدورات"],
  hello: ["bonjour", "salut", "bonsoir", "hello", "hi", "hey", "salam", "مرحبا", "سلام", "اهلا", "السلام"],
  thanks: ["merci", "thanks", "thank", "شكرا"],
};
/** « combien » / « how much » / « كم » : tarif, sauf si la question parle de jours ou de durée. */
const WEAK_PRICE = ["combien", "much", "كم"];
/** Mots trop courants pour la recherche plein texte. */
const STOP = new Set(["formation", "formations", "pour", "avec", "dans", "quel", "quelle", "quels", "quelles", "vous", "votre", "vos", "est", "sont", "faut", "peut", "elle", "what", "with", "have", "does", "your", "that", "this", "there", "course", "training", "هل", "ما", "ماذا", "في", "من", "على", "تكوين", "التكوين"]);

/** Mots qui désignent chaque formation (normalisés). */
const ALIASES: Record<string, string[]> = {
  pilates: ["pilates", "reformer", "بيلاتس", "البيلاتس"],
  football: ["football", "foot", "soccer", "entraineur", "entraineurs", "coach football", "كره", "القدم"],
  "personal-training": ["personal", "musculation", "coaching", "شخصي"],
  k9: ["k9", "chien", "chiens", "canin", "canine", "cynophile", "dog", "dogs", "كلاب", "كلب", "الكلاب"],
  "intervention-initiale": ["intervention", "terrorisme", "evacuation", "premiers", "secours", "first", "response", "تدخل", "التدخل"],
  "protection-rapprochee": ["protection", "rapprochee", "bodyguard", "garde", "vip", "escorte", "حراسه", "الحمايه", "حمايه"],
  "securite-protection": ["securite", "agent", "agents", "gardiennage", "surveillance", "dsp", "security", "guard", "امن", "الامن", "حارس"],
};

type Course = {
  key: string;
  name: string;
  href: string;
  summary: string;
  price?: string | null;
  nextDate?: string | null;
  duration?: string | null;
  modules: string[];
  audience: string[];
  careers: string[];
  /** Chiffres clés « libellé : valeur » et précisions pratiques, pour la recherche plein texte. */
  facts: string[];
  aliases: string[];
};

const tokensOf = (text: string) => normalize(text).split(" ").filter(Boolean);
const has = (tokens: string[], words: string[]) => tokens.some((token) => words.includes(token));

function detectIntents(tokens: string[]): Intent[] {
  const found = (Object.keys(INTENTS) as Intent[]).filter((intent) => has(tokens, INTENTS[intent]));
  if (has(tokens, WEAK_PRICE) && !found.includes("duration") && !found.includes("price")) found.push("price");
  if (!found.includes("audience") && / (pour qui|for whom|for who|adresse a|s adresse) /.test(` ${tokens.join(" ")} `)) found.push("audience");
  // « session » seule avec « durée » : la question porte sur la durée.
  if (found.includes("duration") && found.includes("date") && !has(tokens, ["quand", "when", "متى", "prochaine", "next", "القادمه"])) {
    found.splice(found.indexOf("date"), 1);
  }
  return found;
}

/** Force de la correspondance entre la question et une formation (longueur cumulée des alias trouvés). */
function courseScore(tokens: string[], course: Course): number {
  const joined = ` ${tokens.join(" ")} `;
  return course.aliases.reduce((n, alias) => n + (joined.includes(` ${alias} `) ? alias.length : 0), 0);
}

function findCourse(tokens: string[], courses: Course[]): Course | null {
  let best: Course | null = null;
  let bestScore = 0;
  for (const course of courses) {
    const score = courseScore(tokens, course);
    if (score > bestScore) {
      best = course;
      bestScore = score;
    }
  }
  return best;
}

function upcoming(date: string | null | undefined, locale: Locale) {
  if (!date) return null;
  const at = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() - 86_400_000) return null;
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(at);
}

/** Formations publiées dans l'admin (les deux académies). */
async function buildCourses(locale: Locale): Promise<Course[]> {
  return ((await getFormations()) ?? []).map((source) => {
    const f = localizeFormation(source, locale);
    return {
      key: f.slug,
      name: f.name,
      href: formationHref(f),
      summary: [f.summary, f.practical].filter(Boolean).join(" "),
      price: formatPrice(f.priceTnd),
      nextDate: f.nextSessionDate,
      duration: f.durationLabel || f.facts.find((fact) => /dur|مد/i.test(fact.label))?.value,
      modules: f.modules.length ? f.modules.map((m) => `**${m.title}** : ${m.text}`) : f.objectives,
      audience: [...f.audience, ...f.prerequisites],
      careers: f.careers,
      facts: [...f.facts.map((fact) => `${fact.label} : ${fact.value}`), ...[f.location, f.practical].filter(Boolean)],
      aliases: [...(ALIASES[f.slug] ?? []), ...tokensOf(f.name).filter((w) => w.length >= 4 && !STOP.has(w))],
    };
  });
}

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function answerForCourse(course: Course, intents: Intent[], locale: Locale): string {
  const a = dictionaries[locale].assistant.answers;
  const link = `[${a.seeMore(course.name)}](${course.href})`;
  const date = upcoming(course.nextDate, locale);
  const parts: string[] = [];

  for (const intent of intents) {
    if (intent === "price") parts.push(course.price ? a.price(course.name, course.price) : a.noPrice(course.name));
    else if (intent === "date") parts.push(date ? a.date(course.name, date) : a.noDate(course.name));
    else if (intent === "duration") parts.push(course.duration ? a.duration(course.name, course.duration) : a.noDuration(course.name));
    else if (intent === "program") parts.push(course.modules.length ? `${a.program(course.name)}\n${bullets(course.modules)}` : `${a.noDetail(course.name)} ${course.summary}`);
    else if (intent === "audience") parts.push(course.audience.length ? `${a.audience(course.name)}\n${bullets(course.audience)}` : `${a.noDetail(course.name)} ${course.summary}`);
    else if (intent === "careers") parts.push(course.careers.length ? `${a.careers(course.name)}\n${bullets(course.careers)}` : `${a.noDetail(course.name)} ${course.summary}`);
  }

  if (!parts.length) {
    // Présentation : résumé + chiffres connus.
    const facts = [
      course.duration && `${a.labels.duration} : **${course.duration}**`,
      course.price && `${a.labels.price} : **${course.price}**`,
      date && `${a.labels.nextSession} : **${date}**`,
    ].filter(Boolean) as string[];
    parts.push(`**${course.name}** — ${course.summary}`);
    if (facts.length) parts.push(bullets(facts));
  }
  if (intents.includes("price") || intents.includes("date")) parts.push(contactLine(course.key, locale));
  parts.push(link);
  // Relances : les questions pas encore posées sur cette formation.
  const f = COURSE_FOLLOW_UPS[locale];
  const followUps = [
    !intents.includes("price") && f.price(course.name),
    !intents.includes("date") && f.date(course.name),
    !intents.includes("program") && course.modules.length > 0 && f.program(course.name),
    f.register,
  ].filter((q): q is string => Boolean(q));
  return withFollowUps(parts.join("\n\n"), followUps);
}

function contactLine(courseKey: string, locale: Locale) {
  const l = dictionaries[locale].assistant.answers.labels;
  if (courseKey === "k9") return `${l.k9} : ${site.tunisianSecurityAcademy.k9Contact.label} · [${l.whatsapp}](${site.whatsapp.href})`;
  const security = ["intervention-initiale", "protection-rapprochee", "securite-protection"].includes(courseKey);
  return `${security ? l.security : l.fitness} : ${security ? site.phone2.label : site.phone.label} · [${l.whatsapp}](${site.whatsapp.href})`;
}

function contactAnswer(locale: Locale) {
  const a = dictionaries[locale].assistant.answers;
  const l = a.labels;
  return `${a.contact}\n${bullets([
    `${l.fitness} : **${site.phone.label}**`,
    `${l.security} : **${site.phone2.label}** · [${site.securityEmail.label}](${site.securityEmail.href})`,
    `${l.k9} : **${site.tunisianSecurityAcademy.k9Contact.label}**`,
    `[${l.whatsapp}](${site.whatsapp.href}) · [Messenger](${site.messenger.href})`,
    `${l.email} : [${site.email.label}](${site.email.href})`,
    `${l.address} : ${site.address.lines.join(", ")} · [${l.directions}](${site.address.href})`,
  ])}\n[${dictionaries[locale].nav.contact}](/contact)`;
}

function catalogAnswer(courses: Course[], locale: Locale) {
  const a = dictionaries[locale].assistant.answers;
  return `${a.catalog}\n${bullets(courses.map((c) => `[${c.name}](${c.href})`))}`;
}

/** Phrases des fiches qui contiennent les mots de la question : « hébergement inclus ? » → Football, Intervention initiale. */
function fullTextAnswer(words: string[], courses: Course[], locale: Locale): string | null {
  if (!words.length) return null;
  const hits: { course: Course; score: number; snippet: string }[] = [];
  for (const course of courses) {
    const sentences = [...course.facts, ...course.modules, ...course.audience, ...course.careers, ...course.summary.split(/(?<=[.!?؟])\s+/)];
    let best = { score: 0, snippet: "" };
    for (const sentence of sentences) {
      const norm = ` ${normalize(sentence)} `;
      const score = words.filter((w) => norm.includes(` ${w}`)).length;
      if (score > best.score) best = { score, snippet: sentence };
    }
    if (best.score) hits.push({ course, ...best });
  }
  if (!hits.length) return null;
  const top = Math.max(...hits.map((h) => h.score));
  // Une question de deux mots ou plus doit en retrouver au moins deux.
  if (words.length >= 2 && top < 2) return null;
  const a = dictionaries[locale].assistant.answers;
  const lines = hits.filter((h) => h.score === top).slice(0, 4).map((h) => `[${h.course.name}](${h.course.href}) — ${h.snippet}`);
  return `${a.found}
${bullets(lines)}`;
}

const questionWords = (question: string) =>
  tokensOf(question).filter((w) => w.length >= 3 && !STOP.has(w) && !Object.values(INTENTS).some((list) => list.includes(w)) && !WEAK_PRICE.includes(w));

async function searchAnswer(question: string, courses: Course[], locale: Locale): Promise<string> {
  const t = dictionaries[locale];
  const a = t.assistant.answers;
  const [formations, faqs, contacts] = await Promise.all([getFormations(), getFaqs(locale, t.home.faqs), getContacts()]);
  const index = prepareIndex(buildSearchIndex(t, {
    contacts,
    faqs,
    formations: (formations ?? []).map((source) => {
      const f = localizeFormation(source, locale);
      return { slug: f.slug, name: f.name, headline: f.headline, summary: f.summary, academy: f.academy, href: formationHref(f) };
    }),
  }));
  const words = questionWords(question);

  // 1. Une page ou une question fréquente contient tous les mots.
  let results = words.length ? searchIndex(index, words.join(" "), 5) : [];
  if (results[0]?.group === "questions") return `**${results[0].title}**

${results[0].subtitle}

[${t.nav.faq}](${results[0].href})`;
  // 2. Une phrase d'une fiche de formation.
  const extracted = fullTextAnswer(words, courses, locale);
  if (extracted) return extracted;
  if (!results.length) {
    // Aucune entrée ne contient tous les mots : on cumule les résultats mot par mot.
    const score = new Map<string, { n: number; item: (typeof results)[number] }>();
    for (const word of words) {
      for (const item of searchIndex(index, word, 8)) {
        const entry = score.get(item.id) ?? { n: 0, item };
        entry.n += 1;
        score.set(item.id, entry);
      }
    }
    results = [...score.values()].sort((x, y) => y.n - x.n).slice(0, 5).map(({ item }) => item);
  }
  if (!results.length) return withFollowUps(a.notFound, [t.assistant.suggestions[0], COURSE_FOLLOW_UPS[locale].advice, t.assistant.suggestions[3]]);

  // Une question fréquente correspond : on cite directement sa réponse.
  const top = results[0];
  if (top.group === "questions") return `**${top.title}**\n\n${top.subtitle}\n\n[${t.nav.faq}](${top.href})`;
  return `${a.found}\n${bullets(results.map((item) => `[${item.title}](${item.href})`))}`;
}

export type Turn = { role: "user" | "assistant"; content: string };

/** Réponse à la dernière question, avec les coordonnées à jour de l'admin. */
export async function answer(turns: Turn[], locale: Locale): Promise<string> {
  const [text, contacts] = await Promise.all([rawAnswer(turns, locale), getContacts()]);
  return replaceDefaultContacts(text, contacts);
}

/** La formation citée plus tôt sert pour « et le prix ? ». */
async function rawAnswer(turns: Turn[], locale: Locale): Promise<string> {
  const a = dictionaries[locale].assistant.answers;
  const question = turns.at(-1)!.content;
  const tokens = tokensOf(question);
  const intents = detectIntents(tokens);
  const courses = await buildCourses(locale);

  let course = findCourse(tokens, courses);
  if (!course && intents.some((i) => ["price", "date", "duration", "program", "audience", "careers"].includes(i))) {
    for (const turn of turns.slice(0, -1).reverse()) {
      if (turn.role !== "user") continue;
      course = findCourse(tokensOf(turn.content), courses);
      if (course) break;
    }
  }

  const f = COURSE_FOLLOW_UPS[locale];
  const courseIntent = intents.some((i) => COURSE_INTENTS.includes(i));

  // « Quelle formation me conseillez-vous ? » / « je veux entraîner un club, que choisir ? »
  if (isAdviceQuestion(tokens) && !(course && courseIntent)) return adviceAnswer(tokens, locale);
  if (course && courseIntent) return answerForCourse(course, intents, locale);
  // Sujets généraux : agrément, partenaires, suivi médical, recrutement à l'étranger, réseaux…
  // (« vidéo Pilates » → la fiche Pilates ; « certificat Pilates » → l'agrément et la certification.)
  const topic = topicAnswer(tokens, question, locale);
  if (topic && (!course || topic.score > courseScore(tokens, course))) return topic.text;
  if (course) return answerForCourse(course, intents, locale);
  if (intents.includes("contact")) return withFollowUps(contactAnswer(locale), [f.register, f.advice]);
  if (intents.includes("register")) return withFollowUps(a.register, [f.advice, catalogQuestion(locale)]);
  if (intents.includes("catalog") || ((intents.includes("price") || intents.includes("date")) && tokens.length <= 4)) {
    const list = catalogAnswer(courses, locale);
    return withFollowUps(intents.includes("date") ? `${list}\n\n[${dictionaries[locale].nav.planning}](/planning)` : list, [f.advice, f.register]);
  }
  if (intents.includes("thanks") && tokens.length <= 4) return vary(THANKS[locale]);
  if (intents.includes("hello") && tokens.length <= 3) return withFollowUps(vary(GREETINGS[locale]), [catalogQuestion(locale), f.advice]);
  return searchAnswer(question, courses, locale);
}

const COURSE_INTENTS: Intent[] = ["price", "date", "duration", "program", "audience", "careers"];

const catalogQuestion = (locale: Locale) => dictionaries[locale].assistant.suggestions[0];
