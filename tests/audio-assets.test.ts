import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  MUSIC_ASSETS,
  MUSIC_ASSET_URLS,
  SOUND_ASSETS,
  SOUND_ASSET_URLS,
  type SoundEffect,
} from "../src/audio/SoundAssets";

const effects: readonly SoundEffect[] = [
  "link",
  "capture",
  "cut",
  "boost",
  "win",
  "lose",
];

test("every gameplay sound has one compact runtime asset", () => {
  assert.deepEqual(Object.keys(SOUND_ASSETS), effects);
  assert.equal(new Set(SOUND_ASSET_URLS).size, effects.length);

  const totalBytes = SOUND_ASSET_URLS.reduce((total, url) => {
    const filename = url.split("/").at(-1);
    assert.ok(filename);
    return total + statSync(join("public", "assets", "audio", filename)).size;
  }, 0);

  assert.ok(totalBytes < 150_000, "Runtime sounds exceeded 150 KB");
});

test("sound mix settings stay within safe Web Audio ranges", () => {
  for (const effect of effects) {
    const asset = SOUND_ASSETS[effect];
    assert.ok(asset.gain > 0 && asset.gain <= 0.3);
    assert.ok(asset.playbackRate >= 0.9 && asset.playbackRate <= 1.1);
  }
});

test("menu and gameplay music use separate quiet tracks", () => {
  assert.deepEqual(Object.keys(MUSIC_ASSETS), [
    "menu",
    "gameplay-chill",
    "gameplay-space",
  ]);
  assert.equal(new Set(MUSIC_ASSET_URLS).size, 3);

  for (const asset of Object.values(MUSIC_ASSETS)) {
    const filename = asset.url.split("/").at(-1);
    assert.ok(filename);
    assert.ok(statSync(join("public", "assets", "music", filename)).size > 1_000_000);
    assert.ok(asset.volume > 0 && asset.volume <= 0.08);
  }
});
