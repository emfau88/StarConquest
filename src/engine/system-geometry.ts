import type { SystemClass } from "../core/types";

export const SYSTEM_RADII: Readonly<Record<SystemClass, number>> = Object.freeze({
  PULSAR: 34,
  GIANT: 45,
  QUASAR: 56,
  NEXUS: 69,
});

const SYSTEM_HIT_RADII: Readonly<Record<SystemClass, number>> = Object.freeze({
  PULSAR: 64,
  GIANT: 78,
  QUASAR: 92,
  NEXUS: 108,
});

export const systemHitRadius = (className: SystemClass): number =>
  SYSTEM_HIT_RADII[className];
