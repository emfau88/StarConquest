import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CLASS_SPECS,
  CORE_RULES,
} from "../src/core/reference-model.mjs";

const legacyUrl = (fileName) =>
  new URL(`../reference/legacy-build/${fileName}`, import.meta.url);

const expectedHashes = Object.freeze({
  "index.html":
    "81489FB1333A385F84FE113E73CFF58B1749F002C05F1EBDC79C6211E2007675",
  "index1.html":
    "E40F2CB1A5DE972B83A0AE81E0FF287DFED17A445ABFABA49223034996BAC2B2",
  "index2.html":
    "3ABA369910547E6AD21E9D064947CF88E88BC4CE6D4480C70351341D1D483F6E",
  "index3.html":
    "C9C76EDEA8225440A7049FEA3B7E53E3FA839CF08F1E6422CCF2EF70B9F66046",
  "index4.html":
    "123EBA877E8F97D0B6699EF24E206C02F577E9BD1AFE165F9D2FC1F73A4CD370",
  "README.original.md":
    "F052E4F3B23C34B07D07639C32379E51C71C92E827C291D4460A291BD1FB0339",
});

test("the frozen legacy snapshot matches the public source commit", async () => {
  for (const [fileName, expectedHash] of Object.entries(expectedHashes)) {
    const bytes = await readFile(legacyUrl(fileName));
    const actualHash = createHash("sha256")
      .update(bytes)
      .digest("hex")
      .toUpperCase();

    assert.equal(actualHash, expectedHash, `${fileName} changed`);
  }
});

test("the reference model class values match the legacy source", async () => {
  const source = await readFile(legacyUrl("index.html"), "utf8");
  const classPattern =
    /(PULSAR|GIANT|QUASAR|NEXUS):\s*\{\s*cap:(\d+),\s*prod:([\d.]+),\s*maxBeams:(\d+),\s*rings:(\d+),\s*size:([\d.]+)\s*\}/g;
  const matches = [...source.matchAll(classPattern)];

  assert.equal(matches.length, 4);
  for (const match of matches) {
    const [, className, capacity, production, maxLinks, , size] = match;
    const spec = CLASS_SPECS[className];

    assert.equal(spec.capacity, Number(capacity));
    assert.equal(spec.productionPerSecond, Number(production));
    assert.equal(spec.maxOutgoingLinks, Number(maxLinks));
    assert.equal(spec.legacySize, Number(size));
  }
});

test("the reference flow and formation constants match the legacy source", async () => {
  const source = await readFile(legacyUrl("index.html"), "utf8");
  const distanceCost = source.match(/DIST_COST:\s*([\d.]+)/);
  const flowRate = source.match(/FLOW_RATE:\s*([\d.]+)/);

  assert.ok(distanceCost);
  assert.ok(flowRate);
  assert.equal(
    CORE_RULES.distanceCostPerPixel,
    Number(distanceCost[1]),
  );
  assert.equal(CORE_RULES.baseFlowPerSecond, Number(flowRate[1]));
});

test("the frozen source still contains the eight baseline levels", async () => {
  const source = await readFile(legacyUrl("index.html"), "utf8");
  const levelNames = [...source.matchAll(/\n\s*name:"([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(levelNames, [
    "Erstkontakt",
    "Vorposten",
    "Gegenoffensive",
    "Dominoeffekt",
    "Zweifrontenkrieg",
    "Dreieckskrieg",
    "Belagerungsring",
    "Endschlacht",
  ]);
});
