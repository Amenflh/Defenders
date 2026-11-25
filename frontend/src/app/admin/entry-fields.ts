import { ACADEMIES, ACADEMY_NAME } from "@/lib/academies";
import type { EntryField } from "./EntryManager";

/** Formulaires de l'éditeur commun (EntryManager). */

const academyOptions = ACADEMIES.map((value) => ({ value, label: ACADEMY_NAME[value] }));
const academyOrBoth = [{ value: "", label: "Les deux académies" }, ...academyOptions];
const position: EntryField = { name: "position", label: "Ordre d'affichage", type: "number", hint: "Plus petit = affiché en premier", initial: "0" };
const active: EntryField = { name: "active", label: "Visible sur le site", type: "checkbox", initial: true };

export const historyFields = (formations: { slug: string; name: string }[]): EntryField[] => [
  { name: "title", label: "Titre", type: "text", required: true, translatable: true },
  { name: "academy", label: "Académie", type: "select", options: academyOptions, initial: "fitness" },
  { name: "activity", label: "Formation concernée (filtre de la page)", type: "select", options: [{ value: "", label: "Aucune" }, ...formations.map((f) => ({ value: f.slug, label: f.name }))], initial: "" },
  { name: "date", label: "Date", type: "date", hint: "Facultatif" },
  { name: "status", label: "Statut", type: "select", options: [{ value: "course", label: "Programme annoncé" }, { value: "completed", label: "Session réalisée" }], initial: "completed" },
  { name: "description", label: "Description", type: "textarea", translatable: true },
  { name: "place", label: "Lieu", type: "text", translatable: true },
  { name: "participants", label: "Nombre de participants", type: "number", nullable: true },
  { name: "medicalFollowUp", label: "Suivi médical assuré", type: "checkbox" },
  { name: "photos", label: "Photos", type: "lines", hint: "Une adresse d'image par ligne (voir l'onglet Médias)" },
  { name: "videos", label: "Vidéos", type: "videos", hint: "Une par ligne : lien Facebook, Instagram, YouTube ou fichier | titre | portrait, square ou landscape" },
  { name: "sources", label: "Liens (publication, article…)", type: "links", hint: "Un par ligne : lien | texte du bouton" },
  position,
  active,
];

export const trainerFields: EntryField[] = [
  { name: "name", label: "Nom et prénom", type: "text", required: true },
  { name: "title", label: "Fonction / spécialité", type: "text", translatable: true },
  { name: "bio", label: "Présentation", type: "textarea", translatable: true },
  { name: "photoUrl", label: "Photo", type: "image" },
  { name: "academy", label: "Académie", type: "select", options: academyOrBoth, initial: "" },
  position,
  active,
];

const image: EntryField = { name: "imageUrl", label: "Image", type: "image" };
const link: EntryField = { name: "linkUrl", label: "Lien (facultatif)", type: "text" };

export const cmsFields: Record<"faq" | "testimonials" | "promotions" | "partners", EntryField[]> = {
  faq: [
    { name: "title", label: "Question", type: "text", required: true, translatable: true },
    { name: "body", label: "Réponse", type: "textarea", translatable: true },
    position, active,
  ],
  testimonials: [
    { name: "title", label: "Nom du stagiaire", type: "text", required: true, translatable: true },
    { name: "subtitle", label: "Fonction / formation suivie", type: "text", translatable: true },
    { name: "body", label: "Témoignage", type: "textarea", translatable: true },
    { ...image, label: "Photo" }, link,
    { name: "academy", label: "Académie", type: "select", options: academyOrBoth, initial: "" },
    position, active,
  ],
  promotions: [
    { name: "title", label: "Titre", type: "text", required: true, translatable: true },
    { name: "subtitle", label: "Sous-titre", type: "text", translatable: true },
    { name: "body", label: "Description", type: "textarea", translatable: true },
    image, link, position, active,
  ],
  partners: [
    { name: "title", label: "Nom du partenaire", type: "text", required: true },
    { name: "subtitle", label: "Rôle", type: "text", translatable: true },
    { name: "body", label: "Description", type: "textarea", translatable: true },
    { ...image, label: "Logo" }, link, position, active,
  ],
};
