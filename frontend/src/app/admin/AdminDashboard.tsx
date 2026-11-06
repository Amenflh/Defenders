"use client";

import { uploadFile } from "./uploadFile";
import { useState, useTransition } from "react";
import Image from "next/image";
import { logoutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/Logo";
import { AVAILABILITY_LABELS, PROFILE_LABELS, STATUS_LABELS, TRAINING_LABELS, dateFmt } from "@/lib/labels";
import { StatusSelect } from "./StatusSelect";
import { AnalyticsOverview } from "./AnalyticsOverview";
import type { AdminStats } from "./actions";
import {
  deleteCmsItemAction,
  deleteFormationAction,
  deleteMediaAction,
  saveCmsItemAction,
  saveFormationAction,
  saveMediaAction,
  saveSettingsAction,
} from "./actions";

type Formation = {
  id: number; slug: string; name: string; headline: string; summary: string; durationLabel: string | null; priceTnd: string | null; status: string; position: number;
  intro?: string[]; facts?: { label: string; value: string }[]; objectives?: string[]; modules?: { title: string; text: string }[]; audience?: string[]; careers?: string[];
  coverUrl?: string; galleryUrls?: string[]; accent?: string;
};
type Media = { id: number; type: string; url: string; title: string; category: string };
type CmsItem = { id: number; section: string; title: string; subtitle: string; body: string; imageUrl: string; linkUrl: string; position: number; active: boolean };
type Contact = {
  id: string; createdAt: string; firstName: string; lastName: string; email: string; phone: string; city: string; profile: string; trainings: string[]; availability: string; message: string; status: string;
};

const HOMEPAGE_SECTIONS = [
  { id: "hero", label: "Bannière d'accueil" },
  { id: "stats", label: "Chiffres clés" },
  { id: "promotions", label: "Promotions & certificats" },
  { id: "about", label: "À propos" },
  { id: "videos", label: "Vidéos" },
  { id: "security", label: "Sécurité protection" },
  { id: "formations", label: "Formations" },
  { id: "method", label: "Parcours de formation" },
  { id: "testimonials", label: "Témoignages" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Appel à l'action" },
  { id: "partners", label: "Partenaires" },
] as const;

type HomepageSection = { id: string; enabled: boolean; order: number };
function normalizeHomepageSections(value: unknown): HomepageSection[] {
  const saved = Array.isArray(value) ? value.filter((item): item is HomepageSection =>
    typeof item === "object" && item !== null &&
    "id" in item && typeof item.id === "string" &&
    "enabled" in item && typeof item.enabled === "boolean" &&
    "order" in item && typeof item.order === "number" && Number.isInteger(item.order),
  ) : [];
  return HOMEPAGE_SECTIONS.map((section, index) => {
    const config = saved.find((item) => item.id === section.id);
    return { id: section.id, enabled: config?.enabled ?? true, order: config?.order ?? index };
  }).sort((a, b) => a.order - b.order).map((section, index) => ({ ...section, order: index }));
}

export function AdminDashboard({ stats, formations, media, cms, contacts = [], initialSettings = {}, userName = "Administrateur", userEmail = "" }: { stats: AdminStats | null; formations: Formation[]; media: Media[]; cms: CmsItem[]; contacts?: Contact[]; initialSettings?: Record<string, unknown>; userName?: string; userEmail?: string }) {
  const [tab, setTab] = useState("aperçu");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const inquiryCount = contacts.filter((contact) => contact.profile === "demande-info").length;
  const registrationCount = contacts.length - inquiryCount;
  const latestInquiry = contacts.filter((contact) => contact.profile === "demande-info").sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  const latestRegistration = contacts.filter((contact) => contact.profile !== "demande-info").sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  const newContactCount = contacts.filter((contact) => contact.status === "nouveau").length;
  const logoUrl = typeof initialSettings.logoUrl === "string" && initialSettings.logoUrl ? initialSettings.logoUrl : undefined;
  const brandName = typeof initialSettings.brandName === "string" && initialSettings.brandName ? initialSettings.brandName : undefined;
  const brandDescriptor = typeof initialSettings.brandDescriptor === "string" && initialSettings.brandDescriptor ? initialSettings.brandDescriptor : undefined;
  const tabs = ["aperçu", "demandes d'information", "inscriptions", "formations", "contenus", "médias", "partenaires", "paramètres & footer"];
  const initials = userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";
  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-line bg-ink-2/95 px-4 backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Logo compact logoUrl={logoUrl} brandName={brandName} brandDescriptor={brandDescriptor} />
          <div className="min-w-0">
          <p className="eyebrow text-gold">Defenders · Administration</p>
          <p className="mt-1 truncate font-display text-xl uppercase text-bone">{tab}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noreferrer" className="hidden border border-line px-3 py-2 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold md:inline-flex">Voir le site</a>
          <div className="hidden text-right sm:block"><p className="text-sm text-bone">{userName}</p><p className="text-xs text-mist">{userEmail}</p></div>
          <div className="relative">
            <button type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-label={`Notifications${newContactCount ? `, ${newContactCount} nouvelle(s) demande(s)` : ""}`} aria-expanded={notificationsOpen} className="relative grid size-10 place-items-center border border-line text-mist transition-colors hover:border-gold hover:text-gold">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              {newContactCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">{newContactCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full z-40 mt-3 w-[min(22rem,calc(100vw-2rem))] border border-line bg-ink-2 p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
                  <h2 className="font-display text-lg uppercase text-bone">Notifications</h2>
                  <span className="text-[10px] uppercase tracking-widest text-mist">{newContactCount} nouvelle{newContactCount === 1 ? "" : "s"}</span>
                </div>
                <div className="space-y-2">
                  {([
                    { label: "Dernière demande d'information", contact: latestInquiry, target: "demandes d'information" },
                    { label: "Dernière inscription", contact: latestRegistration, target: "inscriptions" },
                  ] as const).map(({ label, contact, target }) => (
                    <button key={target} type="button" disabled={!contact} onClick={() => { setTab(target); setNotificationsOpen(false); }} className="w-full border border-line bg-ink p-3 text-left transition-colors enabled:hover:border-gold disabled:opacity-60">
                      <span className="block text-[10px] uppercase tracking-widest text-gold">{label}</span>
                      {contact ? (
                        <>
                          <span className="mt-1 block truncate text-sm text-bone">{contact.firstName} {contact.lastName}</span>
                          <span className="mt-1 block text-xs text-mist">{dateFmt.format(new Date(contact.createdAt))} · {STATUS_LABELS[contact.status] ?? contact.status}</span>
                        </>
                      ) : <span className="mt-1 block text-xs text-mist">Aucune demande reçue.</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid size-10 place-items-center rounded-full border border-gold/50 bg-gold text-sm font-bold text-ink">{initials}</div>
          <form action={logoutAction}><button type="submit" className="border border-line px-4 py-2 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">Déconnexion</button></form>
        </div>
      </header>
      <div className="grid min-h-[calc(100dvh-5rem)] min-w-0 lg:grid-cols-[250px_1fr]">
        <aside className="min-w-0 border-b border-line bg-ink-2 p-3 lg:border-r lg:border-b-0 lg:p-5">
          <div className="mb-6 hidden border-b border-line px-4 pb-5 lg:block">
            <p className="font-display text-lg uppercase text-bone">Centre de gestion</p>
            <p className="mt-1 text-xs text-mist">Administration du site</p>
          </div>
          <nav className="flex w-full min-w-0 gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:overflow-visible" aria-label="Sections administrateur">
            {tabs.map((name) => (
              <button key={name} onClick={() => setTab(name)} aria-current={tab === name ? "page" : undefined} className={`whitespace-nowrap border px-4 py-3 text-left text-xs uppercase tracking-wider transition-colors lg:w-full ${tab === name ? "border-gold bg-gold text-ink" : "border-transparent text-mist hover:border-line hover:text-bone"}`}>
                {name}
                {name === "demandes d'information" && <span className="ml-2 rounded-full bg-ink/15 px-2 py-0.5 text-[10px]">{inquiryCount}</span>}
                {name === "inscriptions" && <span className="ml-2 rounded-full bg-ink/15 px-2 py-0.5 text-[10px]">{registrationCount}</span>}
              </button>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 bg-ink px-4 py-8 sm:px-8 lg:px-10">
          {tab === "aperçu" && <AnalyticsOverview initialStats={stats} onOpenTab={setTab} />}
          {tab === "demandes d'information" && <ContactsManager contacts={contacts} type="inquiry" />}
          {tab === "inscriptions" && <ContactsManager contacts={contacts} type="registration" />}
          {tab === "contenus" && <ContentManager cms={cms.filter((item) => ["faq", "testimonials", "promotions"].includes(item.section))} />}
          {tab === "formations" && <FormationManager formations={formations} />}
          {tab === "médias" && <MediaManager media={media} />}
          {tab === "partenaires" && <ContentManager cms={cms.filter((item) => item.section === "partners")} section="partners" />}
          {tab === "paramètres & footer" && <SettingsManager initialSettings={initialSettings} />}
        </main>
      </div>
    </div>
  );
}

function ContactsManager({ contacts, type }: { contacts: Contact[]; type: "inquiry" | "registration" }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formationFilter, setFormationFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [dateOrder, setDateOrder] = useState<"newest" | "oldest">("newest");
  const typedContacts = contacts.filter((contact) => type === "inquiry" ? contact.profile === "demande-info" : contact.profile !== "demande-info");
  const formations = [...new Set(typedContacts.flatMap((contact) => contact.trainings))].sort();
  const profiles = [...new Set(typedContacts.map((contact) => contact.profile))].sort();
  const availabilities = [...new Set(typedContacts.map((contact) => contact.availability))].sort();
  const filtered = typedContacts.filter((contact) => {
    const statusMatch = filter === "all" || contact.status === filter;
    const formationMatch = type !== "registration" || formationFilter === "all" || contact.trainings.includes(formationFilter);
    const profileMatch = type !== "registration" || profileFilter === "all" || contact.profile === profileFilter;
    const availabilityMatch = type !== "registration" || availabilityFilter === "all" || contact.availability === availabilityFilter;
    const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(contact.createdAt));
    const dateMatch = (!dateFrom || dateKey >= dateFrom) && (!dateTo || dateKey <= dateTo);
    const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.phone} ${contact.city} ${contact.trainings.map((training) => TRAINING_LABELS[training] ?? training).join(" ")} ${PROFILE_LABELS[contact.profile] ?? contact.profile} ${AVAILABILITY_LABELS[contact.availability] ?? contact.availability}`.toLowerCase();
    return statusMatch && formationMatch && profileMatch && availabilityMatch && dateMatch && haystack.includes(query.toLowerCase().trim());
  }).sort((a, b) => (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * (dateOrder === "newest" ? -1 : 1));
  const total = typedContacts.length;
  const filters = [
    { value: "all", label: "Toutes", count: total },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label, count: typedContacts.filter((contact) => contact.status === value).length })),
  ];
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="eyebrow text-gold">Gestion commerciale</p>
          <h2 className="mt-2 font-display text-2xl uppercase text-bone">{type === "inquiry" ? "Demandes d'information" : "Demandes d'inscription"}</h2>
        </div>
        <div className={`grid gap-3 sm:grid-cols-2 ${type === "registration" ? "xl:w-[54rem] xl:grid-cols-4" : "xl:w-[34rem]"}`}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un client..." className="w-full border border-line bg-ink-2 px-4 py-3 text-sm text-bone outline-none placeholder:text-mist focus:border-gold" />
          <label className="flex items-center gap-2 text-xs text-mist">Du<input type="date" aria-label="Demandes reçues à partir du" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} className="min-w-0 flex-1 border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone" /></label>
          <label className="flex items-center gap-2 text-xs text-mist">Au<input type="date" aria-label="Demandes reçues jusqu'au" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="min-w-0 flex-1 border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone" /></label>
          {type === "registration" && <>
            <label className="text-xs text-mist">Formation
              <select aria-label="Filtrer par formation" value={formationFilter} onChange={(event) => setFormationFilter(event.target.value)} className="mt-1 w-full border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone">
                <option value="all">Toutes les formations</option>
                {formations.map((formation) => <option key={formation} value={formation}>{TRAINING_LABELS[formation] ?? formation}</option>)}
              </select>
            </label>
            <label className="text-xs text-mist">Profil
              <select aria-label="Filtrer par profil" value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)} className="mt-1 w-full border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone">
                <option value="all">Tous les profils</option>
                {profiles.map((profile) => <option key={profile} value={profile}>{PROFILE_LABELS[profile] ?? profile}</option>)}
              </select>
            </label>
            <label className="text-xs text-mist">Disponibilité
              <select aria-label="Filtrer par disponibilité" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} className="mt-1 w-full border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone">
                <option value="all">Toutes les disponibilités</option>
                {availabilities.map((availability) => <option key={availability} value={availability}>{AVAILABILITY_LABELS[availability] ?? availability}</option>)}
              </select>
            </label>
            <label className="text-xs text-mist">Trier par date
              <select aria-label="Trier par date" value={dateOrder} onChange={(event) => setDateOrder(event.target.value === "oldest" ? "oldest" : "newest")} className="mt-1 w-full border border-line bg-ink-2 px-3 py-2.5 text-sm text-bone">
                <option value="newest">Plus récentes d&apos;abord</option>
                <option value="oldest">Plus anciennes d&apos;abord</option>
              </select>
            </label>
          </>}
        </div>
      </div>
      <p className="mb-4 text-xs text-mist">{filtered.length} demande{filtered.length === 1 ? "" : "s"} affichée{filtered.length === 1 ? "" : "s"} sur {total}</p>
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-5">
        {filters.map((item) => (
          <button key={item.value} onClick={() => setFilter(item.value)} className={`p-4 text-left transition-colors ${filter === item.value ? "bg-gold text-ink" : "bg-ink-2 text-bone hover:bg-ink-3"}`}>
            <span className="font-display text-2xl">{item.count}</span>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="border border-line bg-ink-2 p-10 text-center text-mist">Aucune demande ne correspond à votre recherche.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((contact) => (
            <article key={contact.id} className="border border-line bg-ink-2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 font-display text-lg text-gold">
                    {(contact.firstName[0] ?? "").toUpperCase()}{(contact.lastName[0] ?? "").toUpperCase()}
                  </div>
                  <div><h3 className="font-display text-xl uppercase text-bone">{contact.firstName} {contact.lastName}</h3><p className="text-xs text-gold">{contact.profile === "demande-info" ? "Demande d'information" : "Inscription"}</p><p className="text-xs text-mist">Reçue le {dateFmt.format(new Date(contact.createdAt))}</p></div>
                </div>
                <StatusSelect id={contact.id} status={contact.status} labels={STATUS_LABELS} />
              </div>
              <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">E-mail</dt><dd className="mt-1 break-all text-bone"><a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a></dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Téléphone</dt><dd className="mt-1 text-bone"><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gold">{contact.phone}</a></dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Profil</dt><dd className="mt-1 text-bone">{PROFILE_LABELS[contact.profile] ?? contact.profile}</dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Disponibilité</dt><dd className="mt-1 text-bone">{AVAILABILITY_LABELS[contact.availability] ?? contact.availability}</dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Formation</dt><dd className="mt-1 text-gold">{contact.trainings.length ? contact.trainings.map((training) => TRAINING_LABELS[training] ?? training).join(", ") : "Demande générale"}</dd></div>
                {contact.city && <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Ville</dt><dd className="mt-1 text-bone">{contact.city}</dd></div>}
              </dl>
              {contact.message && <p className="mt-4 border-l-2 border-gold/50 bg-ink px-4 py-3 text-sm whitespace-pre-line text-mist">{contact.message}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsManager({ initialSettings = {} }: { initialSettings?: Record<string, unknown> }) {
  const legalDefaults = {
    mentions: "Éditeur du site\nDefenders Fitness Academy — Avenue Abou Dhabi, 8050 Hammamet, Tunisie\n\nContact\n+216 92 204 005 — +216 29 039 493 — direction-dsp@outlook.com\n\nActivité\nCentre de formation certifié — Agrément n° 21-340-24. Les contenus pédagogiques et les prochaines sessions doivent être confirmés directement auprès de l'académie.\n\nPropriété intellectuelle\nLes textes, photographies, vidéos, marques et éléments graphiques présents sur ce site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.\n\nResponsabilité\nLes informations du site sont fournies à titre informatif. L'académie peut les modifier ou les actualiser sans préavis. Les horaires et tarifs exacts sont confirmés auprès de l'équipe.",
    privacy: "Responsable du traitement\nDefenders Fitness Academy peut collecter les informations envoyées volontairement depuis le formulaire de contact ou d'inscription.\n\nDonnées collectées\nLe formulaire peut collecter le prénom, le nom, l'e-mail, le téléphone, la ville, le profil, les formations souhaitées, la disponibilité, le message et une éventuelle pièce jointe.\n\nFinalités\nCes données sont utilisées pour répondre à une demande, fournir des informations sur les formations et organiser le suivi des inscriptions.\n\nBase juridique et conservation\nLes données sont traitées dans le cadre du consentement et de la demande d'information. Elles sont conservées pendant la durée nécessaire au suivi de la demande.\n\nDestinataires\nLes informations sont consultées par les personnes habilitées de l'académie pour traiter la demande.\n\nSécurité\nDes mesures techniques limitent les accès et protègent les transmissions.\n\nVos droits\nVous pouvez demander l'accès, la rectification ou la suppression des données en écrivant à direction-dsp@outlook.com.",
    cookies: "Cookies strictement nécessaires\nLe site n'utilise pas de bandeau publicitaire ni de traçage marketing. Son fonctionnement peut utiliser des mécanismes techniques essentiels au chargement des pages.\n\nServices tiers\nLa carte intégrée et les liens vers les réseaux sociaux sont soumis aux politiques de confidentialité de leurs fournisseurs.\n\nGestion du navigateur\nVous pouvez supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Certaines fonctionnalités externes peuvent alors ne plus fonctionner normalement.",
  };
  const defaults = {
    phone: "+216 92 204 005", phone2: "+216 29 039 493", email: "direction-dsp@outlook.com", securityEmail: "akkari-dsp@outlook.com", facebook: "https://www.facebook.com/DefendersFitnessAcademy", instagram: "https://www.instagram.com/defenders_fitness_academy", address: "Avenue Abou Dhabi, 8050 Hammamet, Tunisie", approval: "Agrément n° 21-340-24",
    logoUrl: "", brandName: "Defenders", brandDescriptor: "Fitness Academy", certificationLabel: "Centre de formation certifié",
    heroLead: "Formez-vous en", heroDescription: "Des formations certifiantes pour les coachs et les professionnels du sport.", footerTagline: "Des formations certifiantes pour les coachs et les professionnels du sport.", footerGroup: "Defenders Academy",
    contactPopupEnabled: "true", contactPopupButtonLabel: "Nous contacter", contactPopupTitle: "Nous contacter",
    contactFirstNameLabel: "Prénom", contactLastNameLabel: "Nom", contactEmailLabel: "E-mail", contactPhoneLabel: "Téléphone",
    contactMessageLabel: "Votre message", contactMessagePlaceholder: "Comment pouvons-nous vous aider ?",
    contactConsentText: "J'accepte que Defenders Fitness Academy utilise ces informations pour me recontacter au sujet de ma demande.",
    contactSubmitLabel: "Envoyer mon message",
    statsDisciplines: "3", statsVideos: "2", statsPromotions: "7+", statsFacebook: "5904+",
    ...legalDefaults,
  };
  const [values, setValues] = useState<Record<string, string>>({
    ...defaults,
    ...Object.fromEntries(Object.entries(initialSettings).map(([key, value]) => [
      key,
      ["mentions", "privacy", "cookies"].includes(key) && (typeof value !== "string" || !value.trim())
        ? legalDefaults[key as keyof typeof legalDefaults]
        : typeof value === "string" ? value : String(value ?? ""),
    ])),
  });
  const [homepageSections, setHomepageSections] = useState(() => normalizeHomepageSections(initialSettings.homepageSections));
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<boolean | null>(null);
  const [group, setGroup] = useState<"accueil" | "contact" | "identite" | "coordonnees" | "statistiques" | "legal">("accueil");
  const [legalKey, setLegalKey] = useState<"mentions" | "privacy" | "cookies">("mentions");
  const moveHomepageSection = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= homepageSections.length) return;
    setOk(null);
    setHomepageSections((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((section, order) => ({ ...section, order }));
    });
  };
  const fields: [keyof typeof defaults, string, string][] = [
    ["phone", "Téléphone principal", "coordonnees"], ["phone2", "Deuxième téléphone", "coordonnees"], ["email", "E-mail principal", "coordonnees"],
    ["securityEmail", "E-mail sécurité", "coordonnees"], ["facebook", "Lien Facebook", "coordonnees"], ["instagram", "Lien Instagram", "coordonnees"],
    ["address", "Adresse", "coordonnees"],
    ["brandName", "Nom principal", "identite"], ["brandDescriptor", "Nom complémentaire", "identite"],
    ["certificationLabel", "Texte de certification", "identite"], ["approval", "Numéro d'agrément", "identite"],
    ["heroLead", "Accroche avant les formations", "identite"], ["heroDescription", "Description principale", "identite"],
    ["footerTagline", "Description du pied de page", "identite"], ["footerGroup", "Nom du groupe", "identite"],
    ["contactPopupButtonLabel", "Texte du bouton", "contact"], ["contactPopupTitle", "Titre de la fenêtre", "contact"],
    ["contactFirstNameLabel", "Libellé prénom", "contact"], ["contactLastNameLabel", "Libellé nom", "contact"],
    ["contactEmailLabel", "Libellé e-mail", "contact"], ["contactPhoneLabel", "Libellé téléphone", "contact"],
    ["contactMessageLabel", "Libellé du message", "contact"], ["contactMessagePlaceholder", "Exemple / placeholder du message", "contact"],
    ["contactConsentText", "Texte de consentement", "contact"], ["contactSubmitLabel", "Texte du bouton d'envoi", "contact"],
    ["statsDisciplines", "Disciplines", "statistiques"], ["statsVideos", "Vidéos", "statistiques"], ["statsPromotions", "Promotions", "statistiques"], ["statsFacebook", "Abonnés Facebook", "statistiques"],
  ];
  return (
    <div>
      <div className="mb-6"><p className="eyebrow text-gold">Configuration du site</p><h2 className="mt-2 font-display text-2xl uppercase text-bone">Paramètres & footer</h2></div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {([["accueil", "Zones & ordre accueil"], ["contact", "Fenêtre Nous contacter"], ["identite", "Identité"], ["coordonnees", "Coordonnées & footer"], ["statistiques", "Chiffres clés"], ["legal", "Pages légales"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setGroup(key)} className={`border px-4 py-2 text-xs uppercase tracking-wider ${group === key ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{label}</button>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); startTransition(async () => { setOk((await saveSettingsAction("site", { ...values, homepageSections })).ok); }); }}>
        {group === "legal" ? (
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap gap-2">
              {([["mentions", "Mentions légales"], ["privacy", "Confidentialité"], ["cookies", "Cookies"]] as const).map(([key, label]) => (
                <button type="button" key={key} onClick={() => setLegalKey(key)} className={`border px-4 py-2 text-xs ${legalKey === key ? "border-gold text-gold" : "border-line text-mist"}`}>{label}</button>
              ))}
            </div>
            <label className="block text-sm text-mist">
              <span className="mb-2 block font-medium text-bone">{legalKey === "mentions" ? "Texte Mentions légales" : legalKey === "privacy" ? "Texte Confidentialité" : "Texte Cookies"}</span>
              <textarea rows={18} value={values[legalKey]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [legalKey]: event.target.value })); }} className="block w-full resize-y border border-line bg-ink-2 px-4 py-4 leading-relaxed text-bone outline-none focus:border-gold" />
              <span className="mt-2 block text-xs text-mist">Le texte actuellement publié est préchargé ici. Modifiez-le puis enregistrez pour mettre à jour la page publique.</span>
            </label>
          </div>
        ) : group === "accueil" ? (
          <div className="max-w-3xl">
            <p className="mb-4 text-sm text-mist">Activez les zones visibles sur la page d&apos;accueil et changez leur ordre. Les sections masquées restent enregistrées et peuvent être réactivées.</p>
            <ol className="space-y-2">
              {homepageSections.map((section, index) => (
                <li key={section.id} className="flex items-center gap-3 border border-line bg-ink-2 p-3">
                  <span className="w-8 shrink-0 text-center font-display text-gold">{index + 1}</span>
                  <label className="flex min-w-0 flex-1 items-center gap-3 text-sm text-bone">
                    <input type="checkbox" checked={section.enabled} onChange={(event) => { setOk(null); setHomepageSections((current) => current.map((item) => item.id === section.id ? { ...item, enabled: event.target.checked } : item)); }} className="size-4 accent-[var(--color-gold)]" />
                    {HOMEPAGE_SECTIONS.find((item) => item.id === section.id)?.label}
                  </label>
                  <div className="flex gap-2">
                    <button type="button" aria-label="Monter la section" disabled={index === 0} onClick={() => moveHomepageSection(index, -1)} className="grid size-9 place-items-center border border-line text-bone disabled:opacity-30">↑</button>
                    <button type="button" aria-label="Descendre la section" disabled={index === homepageSections.length - 1} onClick={() => moveHomepageSection(index, 1)} className="grid size-9 place-items-center border border-line text-bone disabled:opacity-30">↓</button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
            {group === "identite" && (
              <div className="sm:col-span-2">
                <ImageUploadControl label="Logo du site" url={values.logoUrl} onUploaded={(logoUrl) => { setOk(null); setValues((old) => ({ ...old, logoUrl })); }} />
              </div>
            )}
            {group === "contact" && <label className="flex items-center gap-3 border border-line bg-ink-2 p-4 text-sm text-bone sm:col-span-2"><input type="checkbox" checked={values.contactPopupEnabled === "true"} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, contactPopupEnabled: String(event.target.checked) })); }} className="size-4 accent-[var(--color-gold)]" />Afficher les boutons et la fenêtre Nous contacter sur la page d&apos;accueil</label>}
            {fields.filter(([, , section]) => section === group).map(([name, label]) => (
              <label key={name} className="text-sm text-mist">{label}{["heroDescription", "footerTagline", "contactConsentText", "contactMessagePlaceholder"].includes(name) ? <textarea rows={3} value={values[name]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [name]: event.target.value })); }} className="mt-2 block w-full border border-line bg-ink-2 px-3 py-3 text-bone outline-none focus:border-gold" /> : <input value={values[name]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [name]: event.target.value })); }} className="mt-2 block w-full border border-line bg-ink-2 px-3 py-3 text-bone outline-none focus:border-gold" />}</label>
            ))}
            {group === "identite" && <p className="text-xs text-mist sm:col-span-2">Le logo et les textes seront appliqués à l&apos;accueil, à l&apos;en-tête, au pied de page et aux titres des pages.</p>}
          </div>
        )}
        <div className="mt-6 flex items-center gap-4">
          <button className="btn btn-primary" disabled={pending}>{pending ? "Enregistrement..." : "Enregistrer les paramètres"}</button>
          {ok === true && <span role="status" className="text-sm text-gold">Modifications enregistrées.</span>}
          {ok === false && <span role="alert" className="text-sm text-red-300">Échec de l’enregistrement. Réessayez.</span>}
        </div>
      </form>
    </div>
  );
}

function ContentManager({ cms, section = "" }: { cms: CmsItem[]; section?: string }) {
  const [activeSection, setActiveSection] = useState(section || "faq");
  const emptyDraft = { section: section || "faq", title: "", subtitle: "", body: "", imageUrl: "", linkUrl: "", position: 0, active: true };
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [saveResult, setSaveResult] = useState<boolean | null>(null);
  const [deleteResult, setDeleteResult] = useState<boolean | null>(null);
  const availableSections = section
    ? [{ key: "partners", label: "Partenaires" }]
    : [{ key: "faq", label: "FAQ" }, { key: "testimonials", label: "Témoignages" }, { key: "promotions", label: "Promotions" }];
  const visibleItems = cms.filter((item) => item.section === activeSection);
  const imageField = ["partners", "promotions", "testimonials"].includes(activeSection);
  const resetDraft = () => { setEditingId(null); setSaveResult(null); setDeleteResult(null); setDraft({ ...emptyDraft, section: activeSection }); };
  return (
    <div>
      <div className="mb-6"><p className="eyebrow text-gold">Gestion du contenu</p><h2 className="mt-2 font-display text-2xl uppercase text-bone">{section ? "Partenaires" : "Contenus du site"}</h2></div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {availableSections.map(({ key, label }) => <button key={key} onClick={() => { setActiveSection(key); setEditingId(null); setDraft({ ...emptyDraft, section: key }); setSaveResult(null); setDeleteResult(null); }} className={`border px-4 py-2 text-xs uppercase tracking-wider ${activeSection === key ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{label}<span className="ml-2 opacity-70">{cms.filter((item) => item.section === key).length}</span></button>)}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
        <form onSubmit={(event) => event.preventDefault()} className="h-fit space-y-4 border border-line bg-ink-2 p-5">
          <div className="flex items-center justify-between"><h3 className="font-display text-xl uppercase">{editingId ? "Modifier" : "Ajouter"} · {availableSections.find(({ key }) => key === activeSection)?.label}</h3>{editingId && <button type="button" onClick={resetDraft} className="text-xs text-mist hover:text-bone">Annuler</button>}</div>
          <label className="block text-xs text-mist">Titre<input placeholder="Titre" value={draft.title} onChange={(e) => { setSaveResult(null); setDraft({ ...draft, title: e.target.value }); }} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>
          {activeSection !== "faq" && <label className="block text-xs text-mist">{activeSection === "testimonials" ? "Auteur / fonction" : "Sous-titre"}<input placeholder="Sous-titre / auteur" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>}
          <label className="block text-xs text-mist">{activeSection === "faq" ? "Réponse" : activeSection === "testimonials" ? "Témoignage" : "Description"}<textarea placeholder="Contenu" rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>
          {imageField && <ImageUploadControl label={activeSection === "partners" ? "Logo du partenaire" : activeSection === "promotions" ? "Image de promotion" : "Photo du témoignage"} url={draft.imageUrl} onUploaded={(imageUrl) => { setDraft((old) => ({ ...old, imageUrl })); setSaveResult(null); }} />}
          {imageField && <label className="block text-xs text-mist">URL image<input placeholder="/pics/... ou URL" value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>}
          {activeSection !== "faq" && <label className="block text-xs text-mist">Lien<input placeholder="Lien (optionnel)" value={draft.linkUrl} onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>}
          <div className="grid grid-cols-[100px_1fr] items-center gap-3">
            <label className="text-xs text-mist">Ordre<input type="number" min={0} aria-label="Position" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })} className="mt-1 w-full border border-line bg-ink px-3 py-3 text-sm text-bone" /></label>
            <label className="mt-5 flex items-center gap-3 text-sm text-mist"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Visible sur le site</label>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" disabled={pending || !draft.title.trim()} onClick={() => startTransition(async () => { const result = await saveCmsItemAction({ ...draft, section: activeSection, id: editingId ?? undefined }); setDeleteResult(null); setSaveResult(result.ok); if (result.ok) resetDraft(); })} className="btn btn-primary">{pending ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
            {saveResult === true && <span role="status" className="text-xs text-gold">Enregistré</span>}
            {saveResult === false && <span role="alert" className="text-xs text-red-300">Échec. Réessayez.</span>}
          </div>
          {deleteResult === true && <p role="status" className="text-xs text-gold">Élément supprimé.</p>}
          {deleteResult === false && <p role="alert" className="text-xs text-red-300">Échec de la suppression. Réessayez.</p>}
        </form>
        <div className="grid content-start gap-4 md:grid-cols-2">
          {visibleItems.length === 0 && <p className="border border-line bg-ink-2 p-8 text-sm text-mist md:col-span-2">Aucun élément ici pour le moment. Utilisez le formulaire pour en créer un.</p>}
          {visibleItems.map((item) => (
            <article key={item.id} className="overflow-hidden border border-line bg-ink-2">
              {item.imageUrl && <div className="relative h-40 border-b border-line"><Image src={item.imageUrl} alt={item.title} fill sizes="(min-width: 1280px) 40vw, 100vw" className="object-cover" unoptimized /></div>}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="font-display text-lg text-bone">{item.title}</p>{item.subtitle && <p className="mt-1 text-xs text-gold">{item.subtitle}</p>}</div><span className={`shrink-0 border px-2 py-1 text-[10px] uppercase ${item.active ? "border-emerald-500/40 text-emerald-300" : "border-line text-mist"}`}>{item.active ? "Publié" : "Masqué"}</span></div>
                <p className="mt-3 line-clamp-3 text-sm text-mist">{item.body}</p>
                <div className="mt-5 flex gap-4 border-t border-line pt-4"><button onClick={() => { setEditingId(item.id); setSaveResult(null); setDeleteResult(null); setDraft({ section: item.section, title: item.title, subtitle: item.subtitle, body: item.body, imageUrl: item.imageUrl, linkUrl: item.linkUrl, position: item.position, active: item.active }); }} className="text-xs uppercase text-gold">Modifier</button><button disabled={pending} onClick={() => { if (window.confirm(`Supprimer « ${item.title} » ?`)) startTransition(async () => { setDeleteResult((await deleteCmsItemAction(item.id)).ok); }); }} className="text-xs uppercase text-red-300 disabled:opacity-50">Supprimer</button></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageUploadControl({ label, url, onUploaded }: { label: string; url: string; onUploaded: (url: string) => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  return (
    <div>
      <span className="mb-1 block text-xs text-mist">{label}</span>
      <label className="flex min-h-24 cursor-pointer items-center justify-center border border-dashed border-line bg-ink px-4 py-5 text-center text-xs text-mist transition-colors hover:border-gold hover:text-bone">
        <span>{pending ? "Importation..." : "Choisir une image · JPEG, PNG, WebP · 25 Mo max"}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={pending} onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          startTransition(async () => {
            const result = await uploadFile(file);
            if (result.file?.type === "image") {
              onUploaded(result.file.url);
              setMessage({ text: "Image importée. Enregistrez pour publier.", error: false });
            } else {
              setMessage({ text: result.error ?? "Échec de l’importation. Vérifiez le format et la taille.", error: true });
            }
          });
          event.currentTarget.value = "";
        }} />
      </label>
      {message && <p role={message.error ? "alert" : "status"} className={`mt-1 text-xs ${message.error ? "text-red-300" : "text-gold"}`}>{message.text}</p>}
      {url && <div className="relative mt-3 aspect-video w-full border border-line bg-ink"><Image src={url} alt={`Aperçu : ${label}`} fill sizes="(min-width: 1280px) 40vw, 100vw" className="object-contain" unoptimized /></div>}
    </div>
  );
}

function FormationManager({ formations }: { formations: Formation[] }) {
  const emptyDraft = { slug: "", name: "", headline: "", summary: "", durationLabel: "", priceTnd: "", status: "published", position: 0, coverUrl: "", accent: "gold", intro: "", facts: "", objectives: "", modules: "", audience: "", careers: "", galleryUrls: "" };
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [formMessage, setFormMessage] = useState<{ text: string; error: boolean } | null>(null);
  const submit = () => startTransition(async () => {
    const result = await saveFormationAction({
      ...draft,
      durationLabel: draft.durationLabel || null,
      priceTnd: draft.priceTnd ? Number(draft.priceTnd) : null,
      intro: draft.intro.split("\n").map((v) => v.trim()).filter(Boolean),
      facts: draft.facts.split("\n").map((v) => v.split("|")).filter((v) => v.length === 2).map(([label, value]) => ({ label: label.trim(), value: value.trim() })),
      objectives: draft.objectives.split("\n").map((v) => v.trim()).filter(Boolean),
      modules: draft.modules.split("\n").map((v) => v.split("|")).filter((v) => v.length === 2).map(([title, text]) => ({ title: title.trim(), text: text.trim() })),
      audience: draft.audience.split("\n").map((v) => v.trim()).filter(Boolean),
      careers: draft.careers.split("\n").map((v) => v.trim()).filter(Boolean),
      galleryUrls: draft.galleryUrls.split("\n").map((v) => v.trim()).filter(Boolean),
    }, editingId ?? undefined);
    setFormMessage(result.ok
      ? { text: "Formation enregistrée.", error: false }
      : { text: result.message ?? "Échec de l'enregistrement. Vérifiez le slug, les champs obligatoires et réessayez.", error: true });
    if (result.ok) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  });
  const deleteFormation = (id: number) => startTransition(async () => {
    const result = await deleteFormationAction(id);
    setFormMessage(result.ok
      ? { text: "Formation supprimée.", error: false }
      : { text: result.message ?? "La formation n'a pas pu être supprimée.", error: true });
  });
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.8fr)_1.2fr]">
      <div className="space-y-3">
        <label className="block text-xs text-mist">URL de la formation
          <input placeholder="ex. coaching-sportif" value={draft.slug} onChange={(e) => { setDraft({ ...draft, slug: e.target.value }); setFormMessage(null); }} className="mt-2 w-full border border-line bg-ink px-3 py-3" />
        </label>
        <p className="text-xs text-mist">L&apos;URL doit être unique et ne pas remplacer une page existante du site.{editingId ? " La modification du slug rendra les anciens liens externes invalides." : ""}</p>
        <input placeholder="Nom" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <input placeholder="Titre accroche" value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Description" rows={4} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Présentation : une ligne par paragraphe" rows={4} value={draft.intro} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <input placeholder="Durée" value={draft.durationLabel} onChange={(e) => setDraft({ ...draft, durationLabel: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <input placeholder="Prix TND" type="number" value={draft.priceTnd} onChange={(e) => setDraft({ ...draft, priceTnd: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <ImageUploadControl label="Visuel principal" url={draft.coverUrl} onUploaded={(coverUrl) => setDraft((old) => ({ ...old, coverUrl }))} />
        <input placeholder="URL image principale" value={draft.coverUrl} onChange={(e) => setDraft({ ...draft, coverUrl: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <ImageUploadControl label="Ajouter une image à la galerie" url={draft.galleryUrls.split("\n").filter(Boolean)[0] ?? ""} onUploaded={(url) => setDraft((old) => ({ ...old, galleryUrls: [...old.galleryUrls.split("\n").filter(Boolean), url].join("\n") }))} />
        <textarea placeholder="Galerie : une URL d'image par ligne" rows={3} value={draft.galleryUrls} onChange={(e) => setDraft({ ...draft, galleryUrls: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Objectifs : un objectif par ligne" rows={4} value={draft.objectives} onChange={(e) => setDraft({ ...draft, objectives: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Modules : Titre | Description (une ligne par module)" rows={5} value={draft.modules} onChange={(e) => setDraft({ ...draft, modules: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Faits : Libellé | Valeur (une ligne)" rows={3} value={draft.facts} onChange={(e) => setDraft({ ...draft, facts: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Public concerné : une ligne par profil" rows={3} value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <textarea placeholder="Débouchés : une ligne par débouché" rows={3} value={draft.careers} onChange={(e) => setDraft({ ...draft, careers: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <select value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} className="w-full border border-line bg-ink px-3 py-3"><option value="gold">Or</option><option value="pilates">Pilates</option><option value="football">Football</option><option value="personal">Personal Training</option></select>
        <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full border border-line bg-ink px-3 py-3"><option value="published">Publié</option><option value="draft">Brouillon</option><option value="archived">Archivé</option></select>
        <input type="number" min={0} placeholder="Position" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })} className="w-full border border-line bg-ink px-3 py-3" />
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={pending || !draft.slug || !draft.name} onClick={submit} className="btn btn-primary">{pending ? "Enregistrement..." : editingId ? "Enregistrer la formation" : "Ajouter formation"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft); setFormMessage(null); }} className="text-xs text-mist">Annuler</button>}
        </div>
        {formMessage && <p role={formMessage.error ? "alert" : "status"} className={`text-xs ${formMessage.error ? "text-red-300" : "text-gold"}`}>{formMessage.text}</p>}
      </div>
      <div className="space-y-3">
        {formations.map((f) => (
          <article key={f.id} className="flex items-start justify-between gap-4 border border-line bg-ink-2 p-4">
            {f.coverUrl && <div className="relative h-20 w-16 shrink-0 border border-line"><Image src={f.coverUrl} alt="" fill sizes="64px" className="object-cover" unoptimized /></div>}
            <div className="min-w-0 flex-1"><p className="font-display text-xl">{f.name}</p><p className="text-xs text-mist">/{f.slug} · {f.status} · {f.priceTnd ? `${f.priceTnd} TND` : "Prix non défini"}</p><p className="mt-2 line-clamp-2 text-sm text-mist">{f.summary}</p></div>
            <div className="flex shrink-0 gap-3">
              <button onClick={() => { setEditingId(f.id); setDraft({ slug: f.slug, name: f.name, headline: f.headline, summary: f.summary, durationLabel: f.durationLabel ?? "", priceTnd: f.priceTnd ?? "", status: f.status, position: f.position, coverUrl: f.coverUrl ?? "", accent: f.accent ?? "gold", intro: (f.intro ?? []).join("\n"), facts: (f.facts ?? []).map((x) => `${x.label} | ${x.value}`).join("\n"), objectives: (f.objectives ?? []).join("\n"), modules: (f.modules ?? []).map((x) => `${x.title} | ${x.text}`).join("\n"), audience: (f.audience ?? []).join("\n"), careers: (f.careers ?? []).join("\n"), galleryUrls: (f.galleryUrls ?? []).join("\n") }); }} className="text-xs uppercase text-gold">Modifier</button>
              <button disabled={pending} onClick={() => {
                if (window.confirm(`Supprimer « ${f.name} » ? Cette action est définitive. Archivez la formation pour la retirer du site sans perdre son historique.`)) {
                  deleteFormation(f.id);
                }
              }} className="text-xs uppercase text-red-300">Supprimer</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MediaManager({ media }: { media: Media[] }) {
  const [draft, setDraft] = useState({ type: "image", url: "", title: "", category: "" });
  const [uploadMessage, setUploadMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [saveResult, setSaveResult] = useState<boolean | null>(null);
  const [deleteResult, setDeleteResult] = useState<boolean | null>(null);
  return (
    <div>
      <div className="mb-6"><p className="eyebrow text-gold">Bibliothèque du site</p><h2 className="mt-2 font-display text-2xl uppercase text-bone">Images & vidéos</h2><p className="mt-2 max-w-2xl text-sm text-mist">Ajoutez des médias, remplacez leur fichier ou modifiez leur titre et leur catégorie. Les images des promotions se gèrent dans Contenus → Promotions.</p></div>
      <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
      <div className="h-fit space-y-3 border border-line bg-ink-2 p-5">
        <h3 className="font-display text-xl uppercase">{editingId ? "Modifier un média" : "Ajouter un média"}</h3>
        <label className="block border border-dashed border-line bg-ink p-4 text-sm text-mist">
          Importer un fichier (max. 25 Mo)
          <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="mt-3 block w-full text-xs text-mist" disabled={pending} onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            startTransition(async () => {
              const result = await uploadFile(file);
              if (result.file) {
                setDraft((old) => ({ ...old, url: result.file!.url, type: result.file!.type }));
                setUploadMessage({ text: "Fichier importé. Enregistrez pour publier.", error: false });
              } else {
                setUploadMessage({ text: result.error ?? "Échec de l'importation. Vérifiez le format et la taille.", error: true });
              }
            });
            event.currentTarget.value = "";
          }} />
        </label>
        {uploadMessage && <p role={uploadMessage.error ? "alert" : "status"} className={`text-xs ${uploadMessage.error ? "text-red-300" : "text-gold"}`}>{uploadMessage.text}</p>}
        {draft.url && <div className="relative h-40 border border-line bg-ink">{draft.type === "video" ? <video src={draft.url} controls muted className="h-full w-full object-contain" /> : <Image src={draft.url} alt="Aperçu du média" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain" unoptimized />}</div>}
        <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="w-full border border-line bg-ink px-3 py-3"><option value="image">Image</option><option value="video">Vidéo</option></select>
        <input placeholder="URL /pics/... ou URL vidéo" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <input placeholder="Titre" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <input placeholder="Catégorie" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full border border-line bg-ink px-3 py-3" />
        <div className="flex items-center gap-3"><button disabled={pending || !draft.url} onClick={() => startTransition(async () => { const result = await saveMediaAction(draft, editingId ?? undefined); setSaveResult(result.ok); setDeleteResult(null); if (result.ok) { setEditingId(null); setDraft({ type: "image", url: "", title: "", category: "" }); setUploadMessage(null); } })} className="btn btn-primary">{pending ? "Enregistrement..." : editingId ? "Enregistrer le média" : "Ajouter média"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft({ type: "image", url: "", title: "", category: "" }); setUploadMessage(null); }} className="text-xs text-mist">Annuler</button>}</div>
        {saveResult === true && <p role="status" className="text-xs text-gold">Média enregistré.</p>}
        {saveResult === false && <p role="alert" className="text-xs text-red-300">Échec de l&apos;enregistrement. Réessayez.</p>}
        {deleteResult === true && <p role="status" className="text-xs text-gold">Média supprimé.</p>}
        {deleteResult === false && <p role="alert" className="text-xs text-red-300">Échec de la suppression. Réessayez.</p>}
      </div>
      <div className="grid content-start gap-3 sm:grid-cols-2">{media.map((item) => (
        <article key={item.id} className="overflow-hidden border border-line bg-ink-2">
          <div className="relative h-40 border-b border-line bg-ink">
            {item.type === "video" ? <video src={item.url} controls muted className="h-full w-full object-contain" /> : <Image src={item.url} alt={item.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized />}
          </div>
          <div className="p-4"><p className="font-display">{item.title || item.url}</p><p className="mt-1 text-xs text-mist">{item.type} · {item.category}</p><div className="mt-3 flex gap-3"><button onClick={() => { setSaveResult(null); setDeleteResult(null); setEditingId(item.id); setDraft({ type: item.type, url: item.url, title: item.title, category: item.category }); }} className="text-xs uppercase text-gold">Modifier</button><button disabled={pending} onClick={() => { if (window.confirm(`Supprimer « ${item.title || item.url} » ?`)) startTransition(async () => { setDeleteResult((await deleteMediaAction(item.id)).ok); }); }} className="text-xs uppercase text-red-300">Supprimer</button></div></div>
        </article>
      ))}</div>
      </div>
    </div>
  );
}
