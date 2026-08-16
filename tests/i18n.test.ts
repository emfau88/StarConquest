import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LEVELS, localizeLevelText } from "../src/data/levels";
import {
  formatStarLabel,
  resolveLocale,
  resolvePreferredLocale,
  STRINGS,
  translate,
} from "../src/i18n/strings";

test("English and German expose the same complete string catalogue", () => {
  assert.deepEqual(Object.keys(STRINGS.de), Object.keys(STRINGS.en));
  for (const locale of ["en", "de"] as const) {
    for (const [key, value] of Object.entries(STRINGS[locale])) {
      assert.ok(value.trim(), `${locale}.${key} must not be empty`);
    }
  }
});

test("every campaign text is available in English and German", () => {
  for (const level of LEVELS) {
    for (const locale of ["en", "de"] as const) {
      assert.ok(localizeLevelText(level.title, locale).trim());
      assert.ok(localizeLevelText(level.objective, locale).trim());
      assert.ok(localizeLevelText(level.openingHint, locale).trim());
    }
    assert.notEqual(level.title.en, level.title.de);
    assert.notEqual(level.objective.en, level.objective.de);
    assert.notEqual(level.openingHint.en, level.openingHint.de);
  }
});

test("stored language preference overrides browser detection", () => {
  assert.equal(resolveLocale("de-AT"), "de");
  assert.equal(resolveLocale("en-US"), "en");
  assert.equal(resolvePreferredLocale("de", "en-US"), "de");
  assert.equal(resolvePreferredLocale("en", "de-DE"), "en");
  assert.equal(resolvePreferredLocale(null, "de-CH"), "de");
  assert.equal(resolvePreferredLocale("invalid", "fr-FR"), "en");
});

test("localized accessibility labels use the correct singular and plural", () => {
  assert.equal(formatStarLabel("en", 1), "1 star");
  assert.equal(formatStarLabel("en", 3), "3 stars");
  assert.equal(formatStarLabel("de", 1), "1 Stern");
  assert.equal(formatStarLabel("de", 3), "3 Sterne");
  assert.match(translate("de", "languageToggleLabel"), /Englisch/);
  assert.match(translate("en", "languageToggleLabel"), /German/);
});

test("the static shell exposes the language control and bilingual fallback", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="language-button"/);
  assert.match(html, /id="more-button"/);
  assert.match(html, /id="language-label">EN</);
  assert.match(html, /StarConquest requires JavaScript/);
  assert.match(html, /StarConquest benötigt JavaScript/);
});
