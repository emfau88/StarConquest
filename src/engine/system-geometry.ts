import type { SystemClass } from "../core/types";

export const SYSTEM_RADII: Readonly<Record<SystemClass, number>> = Object.freeze({
  PULSAR: 42,
  GIANT: 56,
  QUASAR: 70,
  NEXUS: 86,
});

export const systemHitRadius = (className: SystemClass): number =>
  SYSTEM_RADII[className] + 22;
