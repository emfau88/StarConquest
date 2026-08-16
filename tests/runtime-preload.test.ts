import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE } from "../src/data/levels";
import {
  ALL_RUNTIME_ASSET_URLS,
  BACKDROP_URLS,
  criticalRuntimeAssetUrls,
} from "../src/engine/RuntimeAssets";

test("runtime asset catalogue is complete and deduplicated", () => {
  assert.equal(ALL_RUNTIME_ASSET_URLS.length, 42);
  assert.equal(
    new Set(ALL_RUNTIME_ASSET_URLS).size,
    ALL_RUNTIME_ASSET_URLS.length,
  );
  for (const url of ALL_RUNTIME_ASSET_URLS) {
    assert.match(url, /assets\//);
  }
});

test("critical preload covers the opening sector without later faction art", () => {
  const critical = criticalRuntimeAssetUrls(LEVEL_ONE);
  const allAssets = new Set(ALL_RUNTIME_ASSET_URLS);

  assert.ok(critical.includes(BACKDROP_URLS[LEVEL_ONE.theme]));
  assert.ok(critical.some((url) => url.endsWith("campaign-map.webp")));
  assert.ok(critical.some((url) => url.endsWith("connect-gesture.png")));
  assert.ok(critical.some((url) => url.endsWith("capture-burst.webp")));
  assert.ok(critical.some((url) => url.endsWith("cruiser-player.webp")));
  assert.ok(critical.some((url) => url.endsWith("cruiser-enemy.webp")));
  assert.ok(critical.every((url) => !url.includes("enemy2")));
  assert.ok(critical.every((url) => allAssets.has(url)));
});
