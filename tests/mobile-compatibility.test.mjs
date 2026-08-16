import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rendererSource = readFileSync(
  "src/engine/CanvasRenderer.ts",
  "utf8",
);
const appSource = readFileSync("src/app/GameApp.ts", "utf8");
const netlifyConfig = readFileSync("netlify.toml", "utf8");

test("mobile canvas rendering avoids optional browser APIs", () => {
  assert.doesNotMatch(rendererSource, /context\.roundRect\(/);
  assert.match(rendererSource, /hasInkBounds/);
  assert.doesNotMatch(appSource, /\.at\(-1\)/);
});

test("Netlify never stores the versioned application shell", () => {
  assert.match(netlifyConfig, /for = "\/"/);
  assert.match(netlifyConfig, /for = "\/index\.html"/);
  assert.equal(
    netlifyConfig.match(/no-store, no-cache, must-revalidate/g)?.length,
    2,
  );
});
