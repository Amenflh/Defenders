import "server-only";
import { getContactDefaults, apiFetch } from "@/lib/session";
import { getDictionary } from "@/lib/i18n/server";
import { localizeFormation } from "@/lib/formation-i18n";
import { brandIdentity, getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import type { PublicPartner } from "@/components/PartnersMarquee";

const hiddenPromotionImages = new Set([
  "/pics/football_images/acc_images.jpg",
  "/pics/Pilates_images/acc_images.jpg",
  "/pics/personal_trainers/acc_images.jpg",
]);

const videoTitles: Record<string, Record<"fr" | "en" | "ar", string>> = {
  "Une équipe, une formation": { fr: "Une équipe, une formation", en: "One team, one course", ar: "فريق واحد، تكوين واحد" },
};

const homeSectionIds = ["hero", "stats", "promotions", "about", "videos", "security", "formations", "method", "testimonials", "faq", "cta", "partners", "branches", "highlights"] as const;
type HomeSectionId = (typeof homeSectionIds)[number];

export async function getHomePageData() {
  const [settings, contactDefaults, { locale, t }] = await Promise.all([
    getSiteSettings(),
    getContactDefaults(),
    getDictionary(),
  ]);
  const isFr = locale === "fr";
  const custom = (key: string, fallback: string) =>
    isFr && typeof settings[key] === "string" && settings[key] ? settings[key] as string : fallback;

  const [faqRes, testimonialRes, promotionsRes, mediaRes, formationsRes, partnersRes] = await Promise.all([
    apiFetch("/api/content/items/faq"),
    apiFetch("/api/content/items/testimonials"),
    apiFetch("/api/content/items/promotions"),
    apiFetch("/api/media?type=video"),
    apiFetch("/api/formations"),
    apiFetch("/api/content/items/partners"),
  ]);
  const faqsCms = faqRes.ok ? ((await faqRes.json()) as { items: { title: string; body: string }[] }).items : [];
  const testimonialsCms = testimonialRes.ok
    ? ((await testimonialRes.json()) as { items: { title: string; subtitle: string; body: string }[] }).items
    : [];
  const promotionsCms = promotionsRes.ok
    ? ((await promotionsRes.json()) as { items: { id: number; title: string; subtitle: string; body: string; imageUrl: string; linkUrl: string }[] }).items
    : [];
  const visiblePromotions = promotionsCms.filter((promotion) => !hiddenPromotionImages.has(promotion.imageUrl));
  const videosCms = mediaRes.ok
    ? ((await mediaRes.json()) as { media: { id: number; type: string; url: string; title: string; category: string }[] }).media.filter((item) => item.type === "video")
    : [];
  const formationsCms = formationsRes.ok
    ? ((await formationsRes.json()) as { formations: { id: number; slug: string; name: string; headline: string; summary: string; coverUrl?: string; accent?: string }[] }).formations.map((formation) => localizeFormation(formation, locale))
    : [];
  const partnersCms = partnersRes.ok ? ((await partnersRes.json()) as { items: PublicPartner[] }).items : [];
  const rotatingFormationNames = formationsCms.map((formation) => formation.name);
  const approval = typeof settings.approval === "string" && settings.approval ? settings.approval : site.approval;
  const certificationLabel = custom("certificationLabel", t.home.certification);
  const { brandName, brandDescriptor } = brandIdentity(settings);
  const heroDescription = custom("heroDescription", t.home.heroDescription);
  const heroLead = custom("heroLead", t.home.heroLead);
  const stats = [
    [typeof settings.statsDisciplines === "string" ? settings.statsDisciplines : "3", t.home.stats[0]],
    [typeof settings.statsPromotions === "string" ? settings.statsPromotions : "7+", t.home.stats[1]],
    [typeof settings.statsFacebook === "string" ? settings.statsFacebook : "5904+", t.home.stats[2]],
  ];
  const visibleFaqs = isFr && faqsCms.length > 0
    ? faqsCms.map((faq) => ({ question: faq.title, answer: faq.body }))
    : t.home.faqs;
  const savedHomeSections = Array.isArray(settings.homepageSections) ? settings.homepageSections : [];
  const homepageSections = homeSectionIds.map((id, index) => {
    const saved = savedHomeSections.find((section) => typeof section === "object" && section !== null && "id" in section && section.id === id);
    return {
      id,
      enabled: saved && "enabled" in saved && typeof saved.enabled === "boolean" ? saved.enabled : true,
      order: saved && "order" in saved && typeof saved.order === "number" ? saved.order : index,
    };
  }).sort((a, b) => a.order - b.order);
  const sectionOrder = (id: HomeSectionId) => homepageSections.find((section) => section.id === id)?.order ?? homeSectionIds.indexOf(id);
  const sectionEnabled = (id: HomeSectionId) => homepageSections.find((section) => section.id === id)?.enabled ?? true;

  const inquiryCopy = {
    contactPopupEnabled: settings.contactPopupEnabled !== "false",
    contactPopupButtonLabel: custom("contactPopupButtonLabel", t.home.contactUs),
    contactPopupTitle: custom("contactPopupTitle", t.home.contactUs),
    contactFirstNameLabel: custom("contactFirstNameLabel", t.form.firstName),
    contactLastNameLabel: custom("contactLastNameLabel", t.form.lastName),
    contactEmailLabel: custom("contactEmailLabel", t.form.email),
    contactPhoneLabel: custom("contactPhoneLabel", t.form.phone),
    contactMessageLabel: custom("contactMessageLabel", t.form.step4.replace(/^\d+\.\s*/, "")),
    contactMessagePlaceholder: custom("contactMessagePlaceholder", t.form.messagePlaceholder),
    contactConsentText: custom("contactConsentText", t.form.consent),
    contactSubmitLabel: custom("contactSubmitLabel", t.form.submit),
  };

  return {
    contactDefaults,
    locale,
    t,
    isFr,
    testimonialsCms,
    visiblePromotions,
    videosCms,
    formationsCms,
    partnersCms,
    rotatingFormationNames,
    approval,
    certificationLabel,
    brandName,
    brandDescriptor,
    heroDescription,
    heroLead,
    stats,
    visibleFaqs,
    sectionOrder,
    sectionEnabled,
    inquiryCopy,
  };
}

export async function getHomeHeroVideo(): Promise<string | undefined> {
  const fallback = "/videos/1-Video by defenders_fitness_academy.mp4";
  let response: Response;
  try {
    response = await apiFetch("/api/media?type=video");
  } catch (error) {
    console.error("[academy] hero video request failed; using the local video", error);
    return fallback;
  }
  if (!response.ok) {
    console.error(`[academy] hero video request returned ${response.status}; using the local video`);
    return fallback;
  }
  const { media } = (await response.json()) as { media: { type: string; url: string }[] };
  return media.find((item) => item.type === "video")?.url ?? fallback;
}

export function videoTitleFallback(locale: "fr" | "en" | "ar"): string {
  return videoTitles["Une équipe, une formation"][locale];
}

export function localizeVideoTitle(title: string, locale: "fr" | "en" | "ar", fallback: string): string {
  return videoTitles[title]?.[locale] ?? (title || fallback);
}
