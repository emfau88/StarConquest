import assert from "node:assert/strict";
import test from "node:test";
import type { Owner, Point, SystemClass } from "../src/core/types";
import { systemArtworkDrawOffset } from "../src/engine/CanvasRenderer";

interface ArtworkCoreCase {
  owner: Owner;
  className: SystemClass;
  measuredCoreOffset: Point;
}

const artworkCoreCases: readonly ArtworkCoreCase[] = [
  {
    owner: "player",
    className: "PULSAR",
    measuredCoreOffset: { x: 1 / 640, y: 23 / 640 },
  },
  {
    owner: "player",
    className: "GIANT",
    measuredCoreOffset: { x: -5 / 640, y: -3 / 640 },
  },
  {
    owner: "player",
    className: "QUASAR",
    measuredCoreOffset: { x: 18 / 512, y: -20 / 512 },
  },
  {
    owner: "player",
    className: "NEXUS",
    measuredCoreOffset: { x: -1 / 640, y: 5 / 640 },
  },
  {
    owner: "enemy",
    className: "PULSAR",
    measuredCoreOffset: { x: 13 / 640, y: 12 / 640 },
  },
  {
    owner: "enemy",
    className: "GIANT",
    measuredCoreOffset: { x: 0, y: -1 / 640 },
  },
  {
    owner: "enemy",
    className: "QUASAR",
    measuredCoreOffset: { x: -20 / 512, y: -24 / 512 },
  },
  {
    owner: "enemy",
    className: "NEXUS",
    measuredCoreOffset: { x: 0, y: -8 / 640 },
  },
  {
    owner: "enemy2",
    className: "PULSAR",
    measuredCoreOffset: { x: 0, y: 25 / 414 },
  },
  {
    owner: "enemy2",
    className: "GIANT",
    measuredCoreOffset: { x: 1 / 512, y: 17 / 512 },
  },
  {
    owner: "enemy2",
    className: "QUASAR",
    measuredCoreOffset: { x: -2 / 512, y: -1 / 512 },
  },
  {
    owner: "enemy2",
    className: "NEXUS",
    measuredCoreOffset: { x: 0, y: 21 / 512 },
  },
  {
    owner: "neutral",
    className: "PULSAR",
    measuredCoreOffset: { x: -1 / 640, y: -11 / 640 },
  },
  {
    owner: "neutral",
    className: "GIANT",
    measuredCoreOffset: { x: 2 / 640, y: 13 / 640 },
  },
  {
    owner: "neutral",
    className: "QUASAR",
    measuredCoreOffset: { x: -1 / 640, y: -14 / 640 },
  },
  {
    owner: "neutral",
    className: "NEXUS",
    measuredCoreOffset: { x: -1 / 640, y: -14 / 640 },
  },
];

test("every system artwork aligns its measured core with the world center", () => {
  for (const artworkCase of artworkCoreCases) {
    const drawOffset = systemArtworkDrawOffset(
      artworkCase.owner,
      artworkCase.className,
    );
    assert.ok(
      Math.abs(drawOffset.x + artworkCase.measuredCoreOffset.x) < 1e-12,
    );
    assert.ok(
      Math.abs(drawOffset.y + artworkCase.measuredCoreOffset.y) < 1e-12,
    );
  }
});
