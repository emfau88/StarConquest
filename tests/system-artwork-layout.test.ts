import assert from "node:assert/strict";
import test from "node:test";
import { systemArtworkDrawOffset } from "../src/engine/CanvasRenderer";

const SOURCE_SIZE = 512;

test("owner quasar artwork aligns its measured core with the world center", () => {
  const measuredCoreOffsets = {
    player: { x: 18 / SOURCE_SIZE, y: -20 / SOURCE_SIZE },
    enemy: { x: -20 / SOURCE_SIZE, y: -24 / SOURCE_SIZE },
  } as const;

  for (const owner of ["player", "enemy"] as const) {
    const artworkOffset = systemArtworkDrawOffset(owner, "QUASAR");
    const coreOffset = measuredCoreOffsets[owner];
    assert.equal(artworkOffset.x + coreOffset.x, 0);
    assert.equal(artworkOffset.y + coreOffset.y, 0);
  }
});

test("centered artwork keeps the default draw origin", () => {
  assert.deepEqual(systemArtworkDrawOffset("enemy2", "QUASAR"), {
    x: 0,
    y: 0,
  });
  assert.deepEqual(systemArtworkDrawOffset("player", "GIANT"), {
    x: 0,
    y: 0,
  });
  assert.deepEqual(systemArtworkDrawOffset("enemy", "PULSAR"), {
    x: 0,
    y: 0,
  });
});
