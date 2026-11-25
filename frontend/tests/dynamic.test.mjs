// Contenu géré dans l'admin : liens des formations, traductions, coordonnées, textes et vidéos.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formationHref } from "../src/lib/academies.ts";
import { contactsFrom, replaceDefaultContacts } from "../src/lib/contacts.ts";
import { localize } from "../src/lib/formation-i18n.ts";
import { dictionaries } from "../src/lib/i18n/dictionaries.ts";
import { applyOverrides, flattenTexts } from "../src/lib/i18n/overrides.ts";
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

describe("vidéos", () => {
  it("reconnaît les hébergeurs", () => {
    assert.equal(isFacebookVideo("https://www.facebook.com/reel/1/"), true);
    assert.equal(isFacebookVideo("https://facebook.com.evil.tn/reel/1"), false);
    assert.equal(instagramEmbed("https://www.instagram.com/reel/AbC_1/embed/"), "https://www.instagram.com/reel/AbC_1/embed/");
    assert.equal(youtubeEmbed("https://youtu.be/abcdefghijk"), "https://www.youtube-nocookie.com/embed/abcdefghijk");
    assert.equal(isVideoFile("/uploads/a.mp4"), true);
  });
});
