import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readProjectFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("compact HUD exposes a secondary controls menu", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /id="more-button"/);
  assert.match(html, /aria-controls="hud-secondary-actions"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="hud-secondary-actions"/);
  assert.match(html, /id="hud-sector-compact"/);
  assert.match(html, /id="music-button"/);
  assert.match(html, /id="audio-button"/);
});

test("startup and campaign navigation expose a clear mission flow", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /id="launch-progress"/);
  assert.match(html, /id="launch-start-button"/);
  assert.match(html, /id="launch-map-button"/);
  assert.match(html, /id="campaign-progress-value"/);
  assert.match(html, /id="campaign-level-preview"/);
  assert.match(html, /id="campaign-start-button"/);
  assert.equal(html.match(/data-level-index=/g)?.length, 8);
  assert.doesNotMatch(html, /campaign-map__(?:helion|red)-branch/);
  assert.doesNotMatch(html, /campaign-map__final-route/);
});

test("compact tips are transient and campaign tiles remain readable", () => {
  const css = readProjectFile("src/styles.css");
  const promptSource = readProjectFile("src/ui/hud/StatusPrompt.ts");
  const compactRules = css.slice(css.indexOf("@media (max-width: 820px)"));

  assert.match(promptSource, /window\.setTimeout\(\(\) => this\.hide\(\)/);
  assert.match(compactRules, /\.status-card\s*\{[^}]*max-width:\s*min\(62vw/s);
  assert.match(compactRules, /\.campaign-map__nodes\s*\{[^}]*repeat\(4/s);
  assert.match(compactRules, /\.campaign-map__name\s*\{[^}]*display:\s*block/s);
});

test("compact HUD preserves readable objectives and touch targets", () => {
  const css = readProjectFile("src/styles.css");
  const compactRules = css.slice(css.indexOf("@media (max-width: 1100px)"));

  assert.match(compactRules, /\.hud__objective\s*\{[^}]*white-space:\s*normal/s);
  assert.match(compactRules, /\.icon-button\s*\{[^}]*min-width:\s*48px/s);
  assert.match(compactRules, /\.icon-button\s*\{[^}]*min-height:\s*48px/s);
  assert.match(compactRules, /\.hud__secondary-actions\.is-open\s*\{[^}]*display:\s*flex/s);
});

test("every compact HUD control receives a runtime accessible name", () => {
  const source = readProjectFile("src/ui/hud/ActionControlsHud.ts");

  for (const control of [
    "mapButton",
    "restartButton",
    "moreButton",
    "pauseButton",
    "musicButton",
    "audioButton",
    "fullscreenButton",
  ]) {
    assert.match(
      source,
      new RegExp(`setControlLabel\\(\\s*this\\.${control}`),
      `${control} must receive a localized accessible name`,
    );
  }
  assert.match(source, /languageButton\.setAttribute\("aria-label"/);
});
