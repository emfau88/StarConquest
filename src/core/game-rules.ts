import type { SystemClass } from "./types";

export interface SystemClassSpec {
  capacity: number;
  productionPerSecond: number;
  maxOutgoingLinks: number;
}

export interface SystemMorphRule {
  upgradeAt?: number;
  downgradeBelow?: number;
}

export const SYSTEM_CLASS_SEQUENCE = [
  "PULSAR",
  "GIANT",
  "QUASAR",
  "NEXUS",
] as const satisfies readonly SystemClass[];

export const SYSTEM_CLASS_SPECS: Readonly<
  Record<SystemClass, SystemClassSpec>
> = Object.freeze({
  PULSAR: Object.freeze({
    capacity: 65,
    productionPerSecond: 2.85,
    maxOutgoingLinks: 1,
  }),
  GIANT: Object.freeze({
    capacity: 110,
    productionPerSecond: 1.8,
    maxOutgoingLinks: 2,
  }),
  QUASAR: Object.freeze({
    capacity: 175,
    productionPerSecond: 1.13,
    maxOutgoingLinks: 3,
  }),
  NEXUS: Object.freeze({
    capacity: 255,
    productionPerSecond: 0.66,
    maxOutgoingLinks: 4,
  }),
});

export const SYSTEM_MORPH_RULES: Readonly<
  Record<SystemClass, SystemMorphRule>
> = Object.freeze({
  PULSAR: Object.freeze({ upgradeAt: 55 }),
  GIANT: Object.freeze({
    downgradeBelow: 30,
    upgradeAt: 95,
  }),
  QUASAR: Object.freeze({
    downgradeBelow: 65,
    upgradeAt: 150,
  }),
  NEXUS: Object.freeze({ downgradeBelow: 110 }),
});

export const GAME_RULES = Object.freeze({
  distanceCostPerPixel: 0.04,
  baseFormationCost: 2,
  tutorialFormationCost: 2,
  baseFlowPerSecond: 6.5,
  pressureFloorMultiplier: 0.38,
  pressureMultiplier: 0.95,
  frontSupplyFloorMultiplier: 0.35,
  frontSupplyEnergyScale: 80,
  frontSupplyEnergyCap: 1.15,
  frontAttritionMultiplier: 1.5,
  formingFrontReserve: 24,
  frontPushPixelsPerSecond: 92,
  captureEnergyFloor: 5,
  linkGrowPixelsPerSecond: 220,
  prominentBoostCutFraction: 0.38,
  prominentBoostMinimumForwardEnergy: 3,
  systemMorphDurationSeconds: 0.7,
});
