// Tests des fonctions pures du site (Node ≥ 22.18 exécute directement les fichiers .ts).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { followUpMessage, whatsappHref } from "../src/lib/contact-links.ts";
import { csvCell, toCsv } from "../src/lib/csv.ts";
import { safeHref } from "../src/lib/utils.ts";

describe("whatsappHref", () => {
  it("ajoute l'indicatif tunisien à un numéro à 8 chiffres", () => {
    assert.equal(whatsappHref("92 204 005"), "https://wa.me/21692204005");
  });
  it("accepte +216 et 00216", () => {
    assert.equal(whatsappHref("+216 92 204 005"), "https://wa.me/21692204005");
    assert.equal(whatsappHref("0021692204005"), "https://wa.me/21692204005");
  });
  it("encode le message", () => {
    assert.equal(whatsappHref("92204005", "Bonjour & merci ?"), "https://wa.me/21692204005?text=Bonjour%20%26%20merci%20%3F");
  });
  it("renvoie null pour un numéro inutilisable", () => {
    for (const bad of ["", "123", "abc", "1234567890123456"]) assert.equal(whatsappHref(bad), null, bad);
  });
});

describe("followUpMessage", () => {
  it("mentionne le prénom et les formations", () => {
    const msg = followUpMessage("Sami", ["Pilates", "Football"]);
    assert.match(msg, /^Bonjour Sami/);
    assert.match(msg, /Pilates, Football/);
  });
  it("reste correct sans formation", () => {
    assert.doesNotMatch(followUpMessage("Sami", []), /concernant/);
  });
});

describe("safeHref", () => {
  it("garde les liens sûrs", () => {
    for (const ok of ["/contact", "https://defenders.tn", "mailto:a@b.tn", "tel:+21692204005"]) assert.equal(safeHref(ok), ok);
  });
  it("remplace les liens dangereux par le repli", () => {
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "", null, undefined]) {
      assert.equal(safeHref(bad, "/"), "/", String(bad));
    }
  });
});

describe("export CSV", () => {
  it("double les guillemets", () => {
    assert.equal(csvCell('il a dit "oui"'), '"il a dit ""oui"""');
  });
  it("neutralise les formules Excel", () => {
    for (const formula of ["=HYPERLINK(\"x\")", "+1", "-2", "@SUM(A1)"]) assert.equal(csvCell(formula), `"'${formula.replace(/"/g, '""')}"`);
  });
  it("produit un fichier Excel-compatible (BOM, « ; », CRLF)", () => {
    assert.equal(toCsv([["a", "b"], [1, null]]), '﻿"a";"b"\r\n"1";""');
  });
});
