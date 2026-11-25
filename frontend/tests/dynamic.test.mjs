// Contenu géré dans l'admin : liens des formations, traductions, coordonnées, textes et vidéos.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formationHref } from "../src/lib/academies.ts";
import { contactsFrom, replaceDefaultContacts } from "../src/lib/contacts.ts";
import { localize } from "../src/lib/formation-i18n.ts";
import { dictionaries } from "../src/lib/i18n/dictionaries.ts";
import { applyOverrides, flattenTexts } from "../src/lib/i18n/overrides.ts";
import { parsePreview, previewHref } from "../src/lib/preview/config.ts";
import { applyDraft } from "../src/lib/preview/draft.ts";
import { decodeRefs, encodeRef, markDictionary, stripRefs } from "../src/lib/preview/markers.ts";
import { instagramEmbed, isFacebookVideo, isVideoFile, youtubeEmbed } from "../src/lib/video.ts";

describe("formationHref", () => {
  it("donne la même forme d'adresse aux deux académies", () => {
    assert.equal(formationHref({ slug: "pilates", academy: "fitness" }), "/fitness-academy/formations/pilates");
    assert.equal(formationHref({ slug: "k9", academy: "tsa" }), "/tunisian-security-academy/formations/k9");
  });
});

describe("localize", () => {
  const item = { name: "Nom", list: ["a"], translations: { en: { name: "Name", list: [], unknown: "x" }, ar: { name: "  " } } };
  it("remplace les champs traduits et garde le français pour les autres", () => {
    assert.equal(localize(item, "en").name, "Name");
    assert.deepEqual(localize(item, "en").list, ["a"]);
    assert.equal("unknown" in localize(item, "en"), false);
    assert.equal(localize(item, "ar").name, "Nom");
    assert.equal(localize(item, "fr").name, "Nom");
  });
});

describe("contactsFrom", () => {
  it("utilise les valeurs par défaut sans réglage", () => {
    assert.equal(contactsFrom({}).phone.href, "tel:+21692204005");
  });
  it("applique les réglages partout, WhatsApp compris", () => {
    const c = contactsFrom({ phone: "+216 11 111 111", phone2: "+216 22 222 222", address: "Rue A, Tunis", facebook: "javascript:alert(1)" });
    assert.equal(c.phone.href, "tel:+21611111111");
    assert.equal(c.whatsapp.href, "https://wa.me/21622222222");
    assert.deepEqual(c.address.lines, ["Rue A", "Tunis"]);
    assert.match(c.facebook.href, /^https:\/\/www\.facebook\.com\//);
    assert.equal(replaceDefaultContacts("Appelez +216 92 204 005", c), "Appelez +216 11 111 111");
  });
});

describe("applyOverrides", () => {
  it("remplace un texte sans modifier le dictionnaire d'origine", () => {
    const original = dictionaries.fr.highlights.title;
    const t = applyOverrides(dictionaries.fr, { "highlights.title": "Nouveau titre", "home.faqs.0.question": "Q ?", "inconnu.chemin": "x" });
    assert.equal(t.highlights.title, "Nouveau titre");
    assert.equal(t.home.faqs[0].question, "Q ?");
    assert.equal(dictionaries.fr.highlights.title, original);
    assert.equal(Array.isArray(t.home.faqs), true);
  });
  it("liste les mêmes textes dans les trois langues", () => {
    const paths = (l) => flattenTexts(dictionaries[l]).map(({ path }) => path).filter((p) => !/faqs|clauses/.test(p)).sort();
    assert.deepEqual(paths("en"), paths("fr"));
    assert.deepEqual(paths("ar"), paths("fr"));
  });
});

describe("aperçu de l'admin", () => {
  it("cache la référence dans le texte sans le changer à l'écran", () => {
    const marked = "Bonjour" + encodeRef("t.home.title");
    assert.deepEqual(decodeRefs(marked), ["t.home.title"]);
    assert.equal(stripRefs(marked), "Bonjour");
    assert.deepEqual(decodeRefs("A" + encodeRef("f.1.name") + " · B" + encodeRef("f.1.headline")), ["f.1.name", "f.1.headline"]);
    assert.deepEqual(decodeRefs("Texte normal"), []);
  });
  it("marque le dictionnaire sauf les clés techniques", () => {
    const t = markDictionary(dictionaries.ar);
    assert.deepEqual(decodeRefs(t.highlights.title), ["t.highlights.title"]);
    assert.equal(t.pages.security.quoteForm.services[0].value, dictionaries.ar.pages.security.quoteForm.services[0].value);
    assert.equal(typeof t.home.formationsTitle, "function");
  });
  it("montre le brouillon : modification, ajout, masquage, suppression, ordre", () => {
    const body = { items: [{ id: 1, section: "faq", title: "Q1", position: 0 }, { id: 2, section: "faq", title: "Q2", position: 1 }, { id: 3, section: "faq", title: "Q3", position: 2 }] };
    const cms = { 1: { title: "Q1 bis", position: 9 }, 2: { deleted: true }, 3: { active: false }, new: { section: "faq", title: "Nouveau", position: 5 }, 7: { section: "partners", title: "Autre" } };
    const { body: result } = applyDraft("/api/content/items/faq", 200, body, { cms });
    assert.deepEqual(result.items.map((i) => i.title), ["Nouveau", "Q1 bis"]);
  });
  it("affiche une formation pas encore créée", () => {
    const draft = { formations: { new: { slug: "yoga", name: "Yoga", academy: "tsa", trainerIds: [4] } } };
    const result = applyDraft("/api/formations/yoga", 404, { error: "x" }, draft, [{ id: 4, name: "Coach" }, { id: 5, name: "Autre" }]);
    assert.equal(result.status, 200);
    assert.deepEqual([result.body.formation.name, result.body.formation.trainers.map((t) => t.name), result.body.formation.objectives], ["Yoga", ["Coach"], []]);
    assert.equal(applyDraft("/api/formations/inconnue", 404, { error: "x" }, draft).status, 404);
  });
  it("n'accepte que des paramètres d'aperçu valides", () => {
    assert.deepEqual(parsePreview("ar.abc-1"), { locale: "ar", draftId: "abc-1" });
    for (const bad of ["", "xx.abc", "fr", "fr.a/b", null]) assert.equal(parsePreview(bad), null);
    assert.equal(previewHref("/historique?academy=tsa#x", "fr", "d1"), "/historique?academy=tsa&apercu=fr.d1#x");
  });
});

describe("vidéos", () => {
  it("reconnaît les hébergeurs", () => {
    assert.equal(isFacebookVideo("https://www.facebook.com/reel/1/"), true);
    assert.equal(isFacebookVideo("https://facebook.com.evil.tn/reel/1"), false);
    assert.equal(instagramEmbed("https://www.instagram.com/reel/AbC_1/embed/"), "https://www.instagram.com/reel/AbC_1/embed/");
    assert.equal(youtubeEmbed("https://youtu.be/abcdefghijk"), "https://www.youtube-nocookie.com/embed/abcdefghijk");
    assert.equal(isVideoFile("/uploads/a.mp4"), true);
  });
});
