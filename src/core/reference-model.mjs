/**
 * Dependency-free reference model for the legacy StarConquest rules.
 *
 * This module is deliberately small. It is a behavioral contract for the
 * rebuild, not the future runtime architecture.
 */

export const OWNER = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy",
  ENEMY_2: "enemy2",
  NEUTRAL: "neutral",
});

export const CLASS_SPECS = Object.freeze({
  PULSAR: Object.freeze({
    capacity: 65,
    productionPerSecond: 2.85,
    maxOutgoingLinks: 1,
    legacySize: 1,
  }),
  GIANT: Object.freeze({
    capacity: 110,
    productionPerSecond: 1.8,
    maxOutgoingLinks: 2,
    legacySize: 1.3,
  }),
  QUASAR: Object.freeze({
    capacity: 175,
    productionPerSecond: 1.13,
    maxOutgoingLinks: 3,
    legacySize: 1.6,
  }),
  NEXUS: Object.freeze({
    capacity: 255,
    productionPerSecond: 0.66,
    maxOutgoingLinks: 4,
    legacySize: 2,
  }),
});

export const CORE_RULES = Object.freeze({
  distanceCostPerPixel: 0.04,
  baseFormationCost: 2,
  tutorialFormationCost: 2,
  baseFlowPerSecond: 6.5,
  pressureFloorMultiplier: 0.38,
  pressureMultiplier: 0.95,
  captureEnergyFloor: 5,
  prominentBoostCutFraction: 0.38,
  prominentBoostMinimumForwardEnergy: 3,
});

const clamp = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, value));

const requireNonNegativeFinite = (value, label) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number`);
  }
};

const requireFraction = (value) => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError("cut fraction must be between 0 and 1");
  }
};

export function createNode({
  id,
  owner,
  className,
  units,
  x = 0,
  y = 0,
}) {
  const spec = CLASS_SPECS[className];
  if (!spec) {
    throw new RangeError(`unknown class: ${className}`);
  }
  if (!Object.values(OWNER).includes(owner)) {
    throw new RangeError(`unknown owner: ${owner}`);
  }
  requireNonNegativeFinite(units, "units");
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new RangeError("node coordinates must be finite numbers");
  }

  return {
    id,
    owner,
    className,
    capacity: spec.capacity,
    productionPerSecond: spec.productionPerSecond,
    maxOutgoingLinks: spec.maxOutgoingLinks,
    units: Math.min(units, spec.capacity),
    x,
    y,
  };
}

export function produce(node, deltaSeconds) {
  requireNonNegativeFinite(deltaSeconds, "deltaSeconds");
  if (node.owner === OWNER.NEUTRAL) {
    return { ...node };
  }

  return {
    ...node,
    units: Math.min(
      node.capacity,
      node.units + node.productionPerSecond * deltaSeconds,
    ),
  };
}

export function distanceBetween(source, target) {
  return Math.hypot(target.x - source.x, target.y - source.y);
}

export function formationCost(source, target, { tutorialNoCost = false } = {}) {
  if (tutorialNoCost) {
    return CORE_RULES.tutorialFormationCost;
  }

  return (
    Math.ceil(
      distanceBetween(source, target) * CORE_RULES.distanceCostPerPixel,
    ) + CORE_RULES.baseFormationCost
  );
}

export function canFormLink(
  source,
  target,
  { tutorialNoCost = false } = {},
) {
  return (
    source.units >
    formationCost(source, target, { tutorialNoCost }) + 1
  );
}

export function formLink(
  source,
  target,
  { tutorialNoCost = false } = {},
) {
  const cost = formationCost(source, target, { tutorialNoCost });
  if (source.units <= cost + 1) {
    throw new RangeError("source does not have enough energy to form the link");
  }

  return {
    source: { ...source, units: source.units - cost },
    link: {
      owner: source.owner,
      sourceId: source.id,
      targetId: target.id,
      wasFriendlyAtCreation: source.owner === target.owner,
      formationCost: cost,
      unitsInTransit: cost,
      state: "growing",
    },
  };
}

export function activateLink(link) {
  if (link.state === "dead") {
    throw new RangeError("a dead link cannot be activated");
  }
  return { ...link, state: "active" };
}

export function applyTransfer(owner, target, amount) {
  requireNonNegativeFinite(amount, "amount");

  if (owner === target.owner) {
    return {
      target: {
        ...target,
        units: Math.min(target.capacity, target.units + amount),
      },
      captured: false,
    };
  }

  const remaining = target.units - amount;
  if (remaining > 0) {
    return {
      target: { ...target, units: remaining },
      captured: false,
    };
  }

  return {
    target: {
      ...target,
      owner,
      units: Math.min(
        target.capacity,
        Math.max(CORE_RULES.captureEnergyFloor, Math.abs(remaining)),
      ),
    },
    captured: true,
  };
}

export function activeFlowPerSecond(source) {
  const pressure = clamp(source.units / source.capacity, 0, 1);
  return (
    CORE_RULES.baseFlowPerSecond *
    (CORE_RULES.pressureFloorMultiplier +
      pressure * CORE_RULES.pressureMultiplier)
  );
}

export function advanceActiveLink({ source, target, link }, deltaSeconds) {
  requireNonNegativeFinite(deltaSeconds, "deltaSeconds");
  if (link.state !== "active") {
    throw new RangeError("only an active link can transfer energy");
  }

  const flow = activeFlowPerSecond(source);
  const requested = flow * deltaSeconds;
  const delivered = Math.min(link.unitsInTransit, requested);
  const transfer = applyTransfer(link.owner, target, delivered);
  const pumped = Math.min(source.units, requested);

  return {
    source: { ...source, units: source.units - pumped },
    target: transfer.target,
    link: {
      ...link,
      unitsInTransit: link.unitsInTransit - delivered + pumped,
    },
    delivered,
    pumped,
    captured: transfer.captured,
  };
}

export function cutLink({ source, target, link }, cutFraction) {
  requireFraction(cutFraction);
  if (link.state === "dead") {
    throw new RangeError("a dead link cannot be cut");
  }

  const forward = link.unitsInTransit * (1 - cutFraction);
  const rear = link.unitsInTransit * cutFraction;
  const transfer = applyTransfer(link.owner, target, forward);
  const returned = source.owner === link.owner ? rear : 0;

  return {
    source: {
      ...source,
      units: Math.min(source.capacity, source.units + returned),
    },
    target: transfer.target,
    link: { ...link, unitsInTransit: 0, state: "dead" },
    forward,
    rear,
    returned,
    captured: transfer.captured,
    prominentBoost:
      cutFraction < CORE_RULES.prominentBoostCutFraction &&
      forward > CORE_RULES.prominentBoostMinimumForwardEnergy,
  };
}
