import "server-only";
import { cache } from "react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { HeroClip } from "@/components/HomeHeroVideo";
import { getSiteMedia } from "@/lib/academy-content";
import { getFormations } from "@/lib/formations";
import { pilatesPhotos } from "@/lib/images";
import { getContactDefaults } from "@/lib/session";
import { getDictionary } from "@/lib/i18n/server";
import { localizeFormation } from "@/lib/formation-i18n";
import { brandIdentity, getCmsItems, getContacts, getFaqs, getSiteSettings } from "@/lib/settings";
import { isFacebookVideo } from "@/lib/video";

const homeSectionIds = ["hero", "branches", "highlights", "promotions", "about", "videos", "security", "formations", "method", "testimonials", "faq", "cta", "partners"] as const;
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

  const [visibleFaqs, testimonials, promotions, partners, formations, contacts, videos, testimonialVideos, banner] = await Promise.all([
    getFaqs(locale, t.home.faqs),
    getCmsItems("testimonials", locale),
    getCmsItems("promotions", locale),
    getCmsItems("partners", locale),
    getFormations(),
    getContacts(),
    getSiteMedia("videos"),
    getSiteMedia("temoignage"),
    getSiteMedia("bandeau"),
  ]);
  const formationsCms = (formations ?? []).map((formation) => localizeFormation(formation, locale));
  // « Formez-vous en … » : noms courts des formations Fitness (les titres TSA sont des phrases).
  const rotatingFormationNames = formationsCms.filter((formation) => formation.academy === "fitness").map((formation) => formation.name);
  const approval = contacts.approval;
  const certificationLabel = custom("certificationLabel", t.home.certification);
  const { brandName, brandDescriptor } = brandIdentity(settings);
  const heroDescription = custom("heroDescription", t.home.heroDescription);
  const heroLead = custom("heroLead", t.home.heroLead);
  const savedHomeSections = Array.isArray(settings.homepageSections) ? settings.homepageSections : [];
  const homepageSections = homeSectionIds.map((id, index) => {
    const saved = savedHomeSections.find((section) => typeof section === "object" && section !== null && "id" in section && section.id === id);
    return {
      id,
      enabled: saved && "enabled" in saved && typeof saved.enabled === "boolean" ? saved.enabled : true,
      // Ordres enregistrés espacés : une section pas encore enregistrée garde sa place par défaut, sans égalité.
      order: saved && "order" in saved && typeof saved.order === "number" ? saved.order * 20 : index,
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
    contacts,
    testimonials,
    promotions,
    videos,
    testimonialVideos,
    banner,
    formationsCms,
    partners,
    rotatingFormationNames,
    approval,
    certificationLabel,
    brandName,
    brandDescriptor,
    heroDescription,
    heroLead,
    visibleFaqs,
    sectionOrder,
    sectionEnabled,
    inquiryCopy,
  };
}

/**
 * Fond des en-têtes (accueil, formations, historique, Fitness Academy), lu à la suite : la vidéo de fond choisie
 * dans l'admin (Médias › Vidéo de fond), puis la première vidéo de chaque autre formation Fitness.
 */
export const getHeroClips = cache(async (): Promise<HeroClip[]> => {
  const [media, formations] = await Promise.all([getSiteMedia("accueil", "fitness"), getFormations("fitness")]);
  const [main] = media.filter((item) => item.type === "video" && publicFileExists(item.url));
  const clip = (url: string, label: string, layout: "portrait" | "square" | "landscape" = "portrait"): HeroClip =>
    isFacebookVideo(url) ? { type: "facebook", url, layout, label } : { type: "video", src: url, label };
  const others = (formations ?? []).filter((f) => f.videos.length > 0).slice(1, 4).map((f) => clip(f.videos[0].url, f.name, f.videos[0].layout));
  return [
    main ? clip(main.url, main.title) : { type: "photos", images: pilatesPhotos.slice(0, 3).map((photo) => photo.src.src), label: "Pilates" },
    ...others,
  ];
});

/** Vrai si le fichier existe dans /public (évite de demander au navigateur une vidéo absente → erreur console). */
function publicFileExists(url: string): boolean {
  if (!url.startsWith("/") || url.startsWith("/uploads/")) return true;
  try {
    return existsSync(join(process.cwd(), "public", decodeURIComponent(url)));
  } catch {
    return false;
  }
}
