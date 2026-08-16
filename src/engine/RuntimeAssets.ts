import type {
  Owner,
  SectorTheme,
  SystemClass,
} from "../core/types";
import type { LevelDefinition } from "../data/levels";
import { preloadImageAssets } from "./ImageAssetCache";
import type { ShipRole } from "./ShipArt";

const assetUrl = (relativePath: string): string =>
  `${import.meta.env?.BASE_URL ?? "./"}assets/${relativePath}`;

export const BACKDROP_URLS: Readonly<Record<SectorTheme, string>> =
  Object.freeze({
    "azure-frontier": assetUrl("backgrounds/sector-azure.webp"),
    "quasar-rift": assetUrl("backgrounds/sector-quasar.webp"),
    "nexus-void": assetUrl("backgrounds/sector-nexus.webp"),
  });

export const CAPTURE_BURST_URL = assetUrl("vfx/capture-burst.webp");

export const TUTORIAL_GESTURE_URLS = Object.freeze({
  connect: assetUrl("tutorial/connect-gesture.png"),
  cut: assetUrl("tutorial/cut-gesture.png"),
});

const SYSTEM_CLASSES: readonly SystemClass[] = [
  "PULSAR",
  "GIANT",
  "QUASAR",
  "NEXUS",
];
const SHIP_ROLES: readonly ShipRole[] = [
  "transport",
  "interceptor",
  "cruiser",
];
const SYSTEM_OWNERS: readonly Owner[] = [
  "player",
  "enemy",
  "enemy2",
  "neutral",
];
const FLEET_OWNERS: readonly Exclude<Owner, "neutral">[] = [
  "player",
  "enemy",
  "enemy2",
];

export const systemAssetUrl = (
  owner: Owner,
  className: SystemClass,
): string => {
  if (className === "QUASAR" && owner !== "neutral") {
    return assetUrl(`systems/system-${owner}-quasar.webp`);
  }
  const tier =
    className === "PULSAR"
      ? "small"
      : className === "GIANT"
        ? "medium"
        : "large";
  return assetUrl(`systems/system-${owner}-${tier}.webp`);
};

export const shipAssetUrl = (
  owner: Exclude<Owner, "neutral">,
  role: ShipRole,
): string => assetUrl(`ships/${role}-${owner}.webp`);

const SHARED_ASSET_URLS = [
  assetUrl("backgrounds/campaign-map.webp"),
  assetUrl("progression/completed.png"),
  assetUrl("progression/locked.png"),
  assetUrl("progression/star.png"),
  ...Object.values(TUTORIAL_GESTURE_URLS),
  CAPTURE_BURST_URL,
  ...[
    "audio-off",
    "audio-on",
    "fullscreen-enter",
    "fullscreen-exit",
    "pause",
    "play",
    "restart",
    "stopwatch",
  ].map((name) => assetUrl(`ui/${name}.png`)),
] as const;

export const ALL_RUNTIME_ASSET_URLS = Array.from(new Set([
  ...Object.values(BACKDROP_URLS),
  ...SHARED_ASSET_URLS,
  ...SYSTEM_OWNERS.flatMap((owner) =>
    SYSTEM_CLASSES.map((className) =>
      systemAssetUrl(owner, className)
    )
  ),
  ...FLEET_OWNERS.flatMap((owner) =>
    SHIP_ROLES.map((role) => shipAssetUrl(owner, role))
  ),
]));

export const criticalRuntimeAssetUrls = (
  level: LevelDefinition,
): readonly string[] => {
  const owners = Array.from(new Set(
    level.systems.map((system) => system.owner),
  ));
  const fleetOwners = owners.filter(
    (owner): owner is Exclude<Owner, "neutral"> => owner !== "neutral",
  );

  return Array.from(new Set([
    BACKDROP_URLS[level.theme],
    ...SHARED_ASSET_URLS,
    ...owners.flatMap((owner) =>
      SYSTEM_CLASSES.map((className) =>
        systemAssetUrl(owner, className)
      )
    ),
    ...fleetOwners.flatMap((owner) =>
      SHIP_ROLES.map((role) => shipAssetUrl(owner, role))
    ),
  ]));
};

export const preloadCriticalRuntimeAssets = async (
  level: LevelDefinition,
): Promise<void> => {
  await preloadImageAssets(criticalRuntimeAssetUrls(level));
};

export const deferredRuntimeAssetBatches = (
  currentLevel: LevelDefinition,
  nextLevel?: LevelDefinition,
): readonly (readonly string[])[] => {
  const loaded = new Set(criticalRuntimeAssetUrls(currentLevel));
  const nextLevelAssets = nextLevel
    ? criticalRuntimeAssetUrls(nextLevel).filter((url) => !loaded.has(url))
    : [];
  nextLevelAssets.forEach((url) => loaded.add(url));
  const remainingAssets = ALL_RUNTIME_ASSET_URLS.filter(
    (url) => !loaded.has(url),
  );

  return [nextLevelAssets, remainingAssets];
};

export const preloadDeferredRuntimeAssets = async (
  currentLevel: LevelDefinition,
  nextLevel?: LevelDefinition,
): Promise<void> => {
  const batches = deferredRuntimeAssetBatches(currentLevel, nextLevel);
  for (const [index, batch] of batches.entries()) {
    await waitForBrowserIdle(index === 0 ? 2_000 : 5_000);
    if (batch.length > 0) {
      await preloadImageAssets(batch);
    }
  }
};

const waitForBrowserIdle = (timeoutMs: number): Promise<void> =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout: timeoutMs });
      return;
    }
    globalThis.setTimeout(resolve, Math.min(timeoutMs, 1_200));
  });
