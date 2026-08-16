import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_ONE, LEVELS } from "../src/data/levels";
import {
  ALL_RUNTIME_ASSET_URLS,
  BACKDROP_URLS,
  criticalRuntimeAssetUrls,
  deferredRuntimeAssetBatches,
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

test("deferred preload prioritizes the next sector without duplication", () => {
  const current = new Set(criticalRuntimeAssetUrls(LEVEL_ONE));
  const batches = deferredRuntimeAssetBatches(LEVEL_ONE, LEVELS[1]);
  assert.equal(batches.length, 2);

  const [nextSector, remaining] = batches;
  assert.equal(nextSector.length, 0);
  assert.ok(nextSector.every((url) => !current.has(url)));
  assert.ok(remaining.every((url) => !current.has(url)));
  assert.ok(remaining.every((url) => !nextSector.includes(url)));
  assert.deepEqual(
    new Set([...current, ...nextSector, ...remaining]),
    new Set(ALL_RUNTIME_ASSET_URLS),
  );

  const helionBatches = deferredRuntimeAssetBatches(LEVELS[4], LEVELS[5]);
  assert.ok(helionBatches[0].some((url) => url.includes("enemy2")));
  assert.ok(helionBatches[1].every((url) => !helionBatches[0].includes(url)));
});

test("critical preload covers the opening sector without later faction art", () => {
  const critical = criticalRuntimeAssetUrls(LEVEL_ONE);
  const allAssets = new Set(ALL_RUNTIME_ASSET_URLS);

  assert.ok(critical.includes(BACKDROP_URLS[LEVEL_ONE.theme]));
  assert.ok(critical.some((url) => url.endsWith("campaign-atlas.webp")));
  assert.ok(critical.some((url) => url.endsWith("connect-gesture.png")));
  assert.ok(critical.some((url) => url.endsWith("capture-burst.webp")));
  assert.ok(critical.some((url) => url.endsWith("cruiser-player.webp")));
  assert.ok(critical.some((url) => url.endsWith("cruiser-enemy.webp")));
  assert.ok(critical.every((url) => !url.includes("enemy2")));
  assert.ok(critical.every((url) => allAssets.has(url)));
});
