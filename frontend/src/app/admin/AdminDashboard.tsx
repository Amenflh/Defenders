"use client";

import { useState, useTransition } from "react";
import { AVAILABILITY_LABELS, PROFILE_LABELS, STATUS_LABELS, dateFmt } from "@/lib/labels";
import { StatusSelect } from "./StatusSelect";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { ChatInbox } from "./ChatInbox";
import { PaymentsManager } from "./PaymentsManager";
import { ReferralsManager } from "./ReferralsManager";
import { ResourcesManager } from "./ResourcesManager";
import { EntryManager, type Entry } from "./EntryManager";
import { cmsFields } from "./entry-fields";
import { HOMEPAGE_SECTIONS, moveSection, normalizeHomepageSections } from "./home-sections";
import { ImageUpload } from "./ImageUpload";
import { LivePreview } from "./LivePreview";
import { SecurityQuotesManager, type SecurityQuote } from "./SecurityQuotesManager";
import { openAdminTab, useAdminTab, useSetUnread } from "./AdminShell";
import type { AdminContact } from "./shell-data";
import { CONTACT_FIELDS, contactsFrom } from "@/lib/contacts";
import { followUpMessage, whatsappHref } from "@/lib/contact-links";
import { toCsv } from "@/lib/csv";
import type { AdminStats } from "./actions";
import { saveSettingsAction } from "./actions";

type Formation = { id: number; slug: string; name: string };
type CmsItem = Entry & { section: string };
type Contact = AdminContact;

/** Contenu de l'onglet ouvert (l'en-tête et le menu sont dans AdminShell). */
export function AdminDashboard({ stats, formations, cms, contacts = [], securityQuotes = [], securityQuotesError, initialSettings = {} }: { stats: AdminStats | null; formations: Formation[]; cms: CmsItem[]; contacts?: AdminContact[]; securityQuotes?: SecurityQuote[]; securityQuotesError?: string; initialSettings?: Record<string, unknown> }) {
  const tab = useAdminTab();
  const setUnread = useSetUnread();
  const names = Object.fromEntries(formations.map((f) => [f.slug, f.name]));
  return (
    <>
      {tab === "aperçu" && <AnalyticsOverview initialStats={stats} onOpenTab={openAdminTab} />}
      {tab === "messages" && <ChatInbox onUnreadChange={setUnread} />}
      {tab === "paiements" && <PaymentsManager />}
      {tab === "parrainage" && <ReferralsManager />}
      {tab === "ressources" && <ResourcesManager formations={formations.map((f) => ({ id: f.id, name: f.name }))} />}
      {tab === "demandes d'information" && <ContactsManager key="inquiry" contacts={contacts} names={names} type="inquiry" />}
      {tab === "inscriptions" && <ContactsManager key="registration" contacts={contacts} names={names} type="registration" />}
      {tab === "devis sécurité" && <SecurityQuotesManager quotes={securityQuotes} loadError={securityQuotesError} />}
      {tab === "contenus" && <ContentManager key="content" cms={cms.filter((item) => ["faq", "testimonials", "promotions"].includes(item.section))} />}
      {tab === "partenaires" && <ContentManager key="partners" cms={cms.filter((item) => item.section === "partners")} section="partners" />}
      {tab === "paramètres & footer" && <SettingsManager initialSettings={initialSettings} />}
    </>
  );
}

function ContactsManager({ contacts, names, type }: { contacts: Contact[]; names: Record<string, string>; type: "inquiry" | "registration" }) {
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
    const haystack = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.phone} ${contact.city} ${contact.trainings.map((training) => names[training] ?? training).join(" ")} ${PROFILE_LABELS[contact.profile] ?? contact.profile} ${AVAILABILITY_LABELS[contact.availability] ?? contact.availability}`.toLowerCase();
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
                {formations.map((formation) => <option key={formation} value={formation}>{names[formation] ?? formation}</option>)}
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-mist">{filtered.length} demande{filtered.length === 1 ? "" : "s"} affichée{filtered.length === 1 ? "" : "s"} sur {total}</p>
        <button type="button" disabled={filtered.length === 0} onClick={() => downloadContactsCsv(filtered, type, names)} className="inline-flex items-center gap-2 border border-gold/60 px-4 py-2 text-xs uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-40">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>
          Exporter en CSV ({filtered.length})
        </button>
      </div>
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
                <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Formation</dt><dd className="mt-1 text-gold">{contact.trainings.length ? contact.trainings.map((training) => names[training] ?? training).join(", ") : "Demande générale"}</dd></div>
                {contact.city && <div><dt className="text-[0.65rem] uppercase tracking-widest text-mist">Ville</dt><dd className="mt-1 text-bone">{contact.city}</dd></div>}
              </dl>
              {contact.message && <p className="mt-4 border-l-2 border-gold/50 bg-ink px-4 py-3 text-sm whitespace-pre-line text-mist">{contact.message}</p>}
              <ContactQuickActions contact={contact} names={names} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/** Actions rapides sur une demande : WhatsApp avec message pré-rempli, appel, e-mail. */
function ContactQuickActions({ contact, names }: { contact: Contact; names: Record<string, string> }) {
  const formationNames = contact.trainings.map((training) => names[training] ?? training);
  const wa = whatsappHref(contact.phone, followUpMessage(contact.firstName, formationNames));
  const subject = encodeURIComponent(contact.profile === "demande-info" ? "Votre demande d'information" : "Votre inscription");
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
      {wa && <a href={wa} target="_blank" rel="noreferrer" className="border border-emerald-500/50 px-3 py-1.5 text-xs uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/10">WhatsApp</a>}
      <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">Appeler</a>
      <a href={`mailto:${contact.email}?subject=${subject}`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">E-mail</a>
    </div>
  );
}

/** Télécharge les demandes affichées (filtres appliqués) au format CSV, lisible par Excel (UTF-8 + « ; »). */
function downloadContactsCsv(contacts: Contact[], type: "inquiry" | "registration", names: Record<string, string>) {
  const header = ["Date", "Prénom", "Nom", "E-mail", "Téléphone", "Ville", "Profil", "Formations", "Disponibilité", "Statut", "Message"];
  const rows = contacts.map((c) => [
    dateFmt.format(new Date(c.createdAt)), c.firstName, c.lastName, c.email, c.phone, c.city,
    PROFILE_LABELS[c.profile] ?? c.profile,
    c.trainings.map((t) => names[t] ?? t).join(", "),
    AVAILABILITY_LABELS[c.availability] ?? c.availability,
    STATUS_LABELS[c.status] ?? c.status,
    c.message,
  ]);
  const csv = toCsv([header, ...rows]);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `defenders-${type === "inquiry" ? "demandes-info" : "inscriptions"}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const NO_DRAFT = {};
const LEGAL_PAGES = { mentions: "/mentions-legales", privacy: "/politique-de-confidentialite", cookies: "/cookies" };

function SettingsManager({ initialSettings = {} }: { initialSettings?: Record<string, unknown> }) {
  const legalDefaults = {
    mentions: "Éditeur du site\nDefenders Fitness Academy — Avenue Abou Dhabi, 8050 Hammamet, Tunisie\n\nContact\n+216 92 204 005 — +216 29 039 493 — direction-dsp@outlook.com\n\nActivité\nCentre de formation certifié — Agrément n° 21-340-24. Les contenus pédagogiques et les prochaines sessions doivent être confirmés directement auprès de l'académie.\n\nPropriété intellectuelle\nLes textes, photographies, vidéos, marques et éléments graphiques présents sur ce site sont protégés. Toute reproduction ou exploitation non autorisée est interdite.\n\nResponsabilité\nLes informations du site sont fournies à titre informatif. L'académie peut les modifier ou les actualiser sans préavis. Les horaires et tarifs exacts sont confirmés auprès de l'équipe.",
    privacy: "Responsable du traitement\nDefenders Academy collecte les informations envoyées volontairement depuis les formulaires de contact, d'inscription et de demande de devis sécurité.\n\nDonnées collectées\nLes formulaires peuvent collecter le prénom, le nom, l'entreprise ou l'organisme, l'e-mail, le téléphone, la ville, le profil, les formations souhaitées, le domaine de demande, la disponibilité, le message et une éventuelle pièce jointe.\n\nFinalités\nCes données sont utilisées pour répondre aux demandes, étudier un besoin de devis, fournir des informations sur les formations et organiser le suivi des inscriptions.\n\nBase juridique et conservation\nLes données sont traitées dans le cadre du consentement et de la demande de la personne concernée. Elles sont conservées pendant la durée nécessaire au suivi de la demande.\n\nDestinataires\nLes informations sont consultées par les personnes habilitées de l'académie pour traiter la demande concernée.\n\nSécurité\nDes mesures techniques limitent les accès et protègent les transmissions.\n\nVos droits\nVous pouvez demander l'accès, la rectification ou la suppression des données en écrivant à direction-dsp@outlook.com.",
    cookies: "Cookies strictement nécessaires\nLe site n'utilise pas de bandeau publicitaire ni de traçage marketing. Son fonctionnement peut utiliser des mécanismes techniques essentiels au chargement des pages.\n\nServices tiers\nLa carte intégrée et les liens vers les réseaux sociaux sont soumis aux politiques de confidentialité de leurs fournisseurs.\n\nGestion du navigateur\nVous pouvez supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Certaines fonctionnalités externes peuvent alors ne plus fonctionner normalement.",
  };
  const contacts = contactsFrom(initialSettings);
  const defaults: Record<string, string> = {
    ...Object.fromEntries(CONTACT_FIELDS.map(({ key }) => [key, ""])),
    phone: contacts.phone.label, phone2: contacts.phone2.label, email: contacts.email.label, securityEmail: contacts.securityEmail.label,
    facebook: contacts.facebook.href, instagram: contacts.instagram.href, linkedin: contacts.linkedin.href, messenger: contacts.messenger.href,
    address: contacts.address.lines.join(", "), approval: contacts.approval,
    tsaPhone: contacts.tunisianSecurityAcademy.phone.label, tsaPhone2: contacts.tunisianSecurityAcademy.trainingPhone.label, tsaEmail: contacts.tunisianSecurityAcademy.email.label,
    tsaAddress: contacts.tunisianSecurityAcademy.address.join(", "), tsaFacebook: contacts.tunisianSecurityAcademy.facebook, securityPortal: contacts.securityPortal,
    rulesUrl: contacts.documents.rules, otdavUrl: contacts.documents.otdav, exclusivityPost: contacts.documents.exclusivityPost,
    logoUrl: "", brandName: "Defenders", brandDescriptor: "Academy", certificationLabel: "Centre de formation certifié",
    heroLead: "Formez-vous en", heroDescription: "Des formations certifiantes pour les coachs et les professionnels du sport.", footerTagline: "Des formations certifiantes pour les coachs et les professionnels du sport.",
    contactPopupEnabled: "true", contactPopupButtonLabel: "Nous contacter", contactPopupTitle: "Nous contacter",
    contactFirstNameLabel: "Prénom", contactLastNameLabel: "Nom", contactEmailLabel: "E-mail", contactPhoneLabel: "Téléphone",
    contactMessageLabel: "Votre message", contactMessagePlaceholder: "Comment pouvons-nous vous aider ?",
    contactConsentText: "J'accepte que Defenders Fitness Academy utilise ces informations pour me recontacter au sujet de ma demande.",
    contactSubmitLabel: "Envoyer mon message",
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
  const [focused, setFocused] = useState<string | null>(null);
  // Aperçu : seulement quand quelque chose a changé depuis l'ouverture.
  const [opened] = useState(() => JSON.stringify([values, homepageSections]));
  const dirty = opened !== JSON.stringify([values, homepageSections]);
  const [group, setGroup] = useState<"accueil" | "contact" | "identite" | "coordonnees" | "tsa" | "documents" | "legal">("accueil");
  const [legalKey, setLegalKey] = useState<"mentions" | "privacy" | "cookies">("mentions");
  const moveHomepageSection = (index: number, offset: -1 | 1) => {
    setOk(null);
    setHomepageSections((current) => moveSection(current, index, offset));
  };
  const fields: [string, string, string][] = [
    ...CONTACT_FIELDS.map(({ key, label, group: part }): [string, string, string] => [key, label, part === "general" ? "coordonnees" : part]),
    ["brandName", "Nom principal", "identite"], ["brandDescriptor", "Nom complémentaire", "identite"],
    ["certificationLabel", "Texte de certification", "identite"], ["approval", "Numéro d'agrément", "identite"],
    ["heroLead", "Accroche avant les formations", "identite"], ["heroDescription", "Description principale", "identite"],
    ["footerTagline", "Description du pied de page", "identite"],
    ["contactPopupButtonLabel", "Texte du bouton", "contact"], ["contactPopupTitle", "Titre de la fenêtre", "contact"],
    ["contactFirstNameLabel", "Libellé prénom", "contact"], ["contactLastNameLabel", "Libellé nom", "contact"],
    ["contactEmailLabel", "Libellé e-mail", "contact"], ["contactPhoneLabel", "Libellé téléphone", "contact"],
    ["contactMessageLabel", "Libellé du message", "contact"], ["contactMessagePlaceholder", "Exemple / placeholder du message", "contact"],
    ["contactConsentText", "Texte de consentement", "contact"], ["contactSubmitLabel", "Texte du bouton d'envoi", "contact"],
  ];
  return (
    <div>
      <div className="mb-6"><p className="eyebrow text-gold">Configuration du site</p><h2 className="mt-2 font-display text-2xl uppercase text-bone">Paramètres & footer</h2></div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {([["accueil", "Zones & ordre accueil"], ["contact", "Fenêtre Nous contacter"], ["identite", "Identité"], ["coordonnees", "Coordonnées"], ["tsa", "Coordonnées TSA"], ["documents", "Documents"], ["legal", "Pages légales"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setGroup(key)} className={`border px-4 py-2 text-xs uppercase tracking-wider ${group === key ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <form className="min-w-0" onFocus={(event) => setFocused(event.target instanceof HTMLElement ? event.target.dataset.setting ?? null : null)} onSubmit={(event) => { event.preventDefault(); startTransition(async () => { setOk((await saveSettingsAction("site", { ...values, homepageSections })).ok); }); }}>
        {group === "legal" ? (
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap gap-2">
              {([["mentions", "Mentions légales"], ["privacy", "Confidentialité"], ["cookies", "Cookies"]] as const).map(([key, label]) => (
                <button type="button" key={key} onClick={() => setLegalKey(key)} className={`border px-4 py-2 text-xs ${legalKey === key ? "border-gold text-gold" : "border-line text-mist"}`}>{label}</button>
              ))}
            </div>
            <label className="block text-sm text-mist">
              <span className="mb-2 block font-medium text-bone">{legalKey === "mentions" ? "Texte Mentions légales" : legalKey === "privacy" ? "Texte Confidentialité" : "Texte Cookies"}</span>
              <textarea data-setting={legalKey} rows={18} value={values[legalKey]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [legalKey]: event.target.value })); }} className="block w-full resize-y border border-line bg-ink-2 px-4 py-4 leading-relaxed text-bone outline-none focus:border-gold" />
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
          <div className="grid gap-4 sm:grid-cols-2">
            {group === "identite" && (
              <div className="sm:col-span-2">
                <ImageUpload label="Logo du site" url={values.logoUrl} onUploaded={(logoUrl) => { setOk(null); setValues((old) => ({ ...old, logoUrl })); }} />
              </div>
            )}
            {group === "contact" && <label className="flex items-center gap-3 border border-line bg-ink-2 p-4 text-sm text-bone sm:col-span-2"><input type="checkbox" checked={values.contactPopupEnabled === "true"} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, contactPopupEnabled: String(event.target.checked) })); }} className="size-4 accent-[var(--color-gold)]" />Afficher les boutons et la fenêtre Nous contacter sur la page d&apos;accueil</label>}
            {fields.filter(([, , section]) => section === group).map(([name, label]) => (
              <label key={name} className="text-sm text-mist">{label}{["heroDescription", "footerTagline", "contactConsentText", "contactMessagePlaceholder"].includes(name) ? <textarea data-setting={name} rows={3} value={values[name]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [name]: event.target.value })); }} className="mt-2 block w-full border border-line bg-ink-2 px-3 py-3 text-bone outline-none focus:border-gold" /> : <input data-setting={name} value={values[name]} onChange={(event) => { setOk(null); setValues((old) => ({ ...old, [name]: event.target.value })); }} className="mt-2 block w-full border border-line bg-ink-2 px-3 py-3 text-bone outline-none focus:border-gold" />}</label>
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
      <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
        <p className="mb-3 text-sm text-mist">Le résultat sur le site, pendant que vous modifiez. Rien n&apos;est publié avant « Enregistrer les paramètres ».</p>
        <LivePreview path={group === "legal" ? LEGAL_PAGES[legalKey] : group === "coordonnees" ? "/contact" : group === "tsa" ? "/tunisian-security-academy" : "/"} draft={dirty ? { settings: { ...values, homepageSections } } : NO_DRAFT} focus={focused ? `s.${focused}` : undefined} height="70vh" />
      </div>
      </div>
    </div>
  );
}

const CMS_SECTIONS = [
  { key: "faq", label: "FAQ", item: "question" },
  { key: "testimonials", label: "Témoignages", item: "témoignage" },
  { key: "promotions", label: "Promotions", item: "promotion" },
  { key: "partners", label: "Partenaires", item: "partenaire" },
] as const;

/** FAQ, témoignages, promotions ou partenaires : ajout, modification, suppression, en trois langues. */
function ContentManager({ cms, section }: { cms: CmsItem[]; section?: "partners" }) {
  const [active, setActive] = useState<(typeof CMS_SECTIONS)[number]["key"]>(section ?? "faq");
  const sections = CMS_SECTIONS.filter(({ key }) => (section ? key === section : key !== "partners"));
  const current = CMS_SECTIONS.find(({ key }) => key === active)!;
  return (
    <div>
      <div className="mb-6"><p className="eyebrow text-gold">Gestion du contenu</p><h2 className="mt-2 font-display text-2xl uppercase text-bone">{section ? "Partenaires" : "Contenus du site"}</h2></div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {sections.map(({ key, label }) => <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(key)} className={`border px-4 py-2 text-xs uppercase tracking-wider ${active === key ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{label}<span className="ml-2 opacity-70">{cms.filter((item) => item.section === key).length}</span></button>)}
      </div>
      <EntryManager key={active} endpoint="/api/admin/cms" entries={cms.filter((item) => item.section === active)} fields={cmsFields[active]} titleField="title" badges={["subtitle", "academy"]} fixed={{ section: active }} itemName={current.item} empty="Aucun élément pour le moment. Utilisez le formulaire pour en créer un." />
    </div>
  );
}
