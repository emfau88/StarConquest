import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const publicAssets = join(process.cwd(), "public", "assets");
const systemOwners = ["player", "enemy", "enemy2", "neutral"];
const systemTiers = ["small", "medium", "large"];
const fleetOwners = ["player", "enemy", "enemy2"];
const fleetRoles = ["transport", "interceptor", "cruiser"];
const requiredAssets = [
  ...systemOwners.flatMap((owner) =>
    systemTiers.map((tier) =>
      join("systems", `system-${owner}-${tier}.webp`)
    )
  ),
  join("systems", "system-player-quasar.webp"),
  join("systems", "system-enemy-quasar.webp"),
  join("systems", "system-enemy2-quasar.webp"),
  ...fleetOwners.flatMap((owner) =>
    fleetRoles.map((role) =>
      join("ships", `${role}-${owner}.webp`)
    )
  ),
  join("vfx", "capture-burst.webp"),
];

const directorySize = (directory) =>
  readdirSync(directory, { withFileTypes: true }).reduce(
    (total, entry) => {
      const path = join(directory, entry.name);
      return (
        total +
        (entry.isDirectory() ? directorySize(path) : statSync(path).size)
      );
    },
    0,
  );

test("optimized runtime artwork is complete", () => {
  for (const relativePath of requiredAssets) {
    const size = statSync(join(publicAssets, relativePath)).size;
    assert.ok(size > 1_000, `${relativePath} appears empty`);
  }
});

test("the complete public asset bundle stays below two megabytes", () => {
  assert.ok(
    directorySize(publicAssets) < 2_000_000,
    "Public assets exceeded the explicit two-megabyte budget",
  );
});
