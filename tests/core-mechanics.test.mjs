import assert from "node:assert/strict";
import test from "node:test";

import {
  OWNER,
  activateLink,
  activeFlowPerSecond,
  advanceActiveLink,
  canFormLink,
  createNode,
  cutLink,
  formLink,
  formationCost,
  produce,
} from "../src/core/reference-model.mjs";

const closeTo = (actual, expected, epsilon = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
};

test("owned systems produce while neutral systems remain unchanged", () => {
  const player = createNode({
    id: "player",
    owner: OWNER.PLAYER,
    className: "PULSAR",
    units: 10,
  });
  const neutral = createNode({
    id: "neutral",
    owner: OWNER.NEUTRAL,
    className: "PULSAR",
    units: 10,
  });

  closeTo(produce(player, 2).units, 15.7);
  assert.equal(produce(neutral, 2).units, 10);
});

test("production is capped by the system capacity", () => {
  const giant = createNode({
    id: "giant",
    owner: OWNER.ENEMY,
    className: "GIANT",
    units: 109,
  });

  assert.equal(produce(giant, 10).units, 110);
});

test("link formation uses distance cost and the tutorial exception", () => {
  const source = createNode({
    id: "source",
    owner: OWNER.PLAYER,
    className: "QUASAR",
    units: 30,
    x: 0,
    y: 0,
  });
  const target = createNode({
    id: "target",
    owner: OWNER.NEUTRAL,
    className: "PULSAR",
    units: 5,
    x: 100,
    y: 0,
  });

  assert.equal(formationCost(source, target), 6);
  assert.equal(formationCost(source, target, { tutorialNoCost: true }), 2);
  assert.equal(canFormLink({ ...source, units: 7 }, target), false);
  assert.equal(canFormLink({ ...source, units: 8 }, target), true);

  const formed = formLink(source, target);
  assert.equal(formed.source.units, 24);
  assert.equal(formed.link.unitsInTransit, 6);
  assert.equal(formed.link.state, "growing");
});

test("an active hostile link drains the target and pumps from the source", () => {
  const source = createNode({
    id: "source",
    owner: OWNER.PLAYER,
    className: "GIANT",
    units: 55,
  });
  const target = createNode({
    id: "target",
    owner: OWNER.ENEMY,
    className: "GIANT",
    units: 50,
  });
  const link = activateLink({
    owner: OWNER.PLAYER,
    sourceId: source.id,
    targetId: target.id,
    wasFriendlyAtCreation: false,
    formationCost: 10,
    unitsInTransit: 10,
    state: "growing",
  });
  const expectedFlow = activeFlowPerSecond(source);

  const result = advanceActiveLink({ source, target, link }, 1);

  closeTo(result.delivered, expectedFlow);
  closeTo(result.pumped, expectedFlow);
  closeTo(result.target.units, 50 - expectedFlow);
  closeTo(result.source.units, 55 - expectedFlow);
  closeTo(result.link.unitsInTransit, 10);
  assert.equal(result.captured, false);
});

test("crossing zero captures the target with the legacy five-energy foothold", () => {
  const source = createNode({
    id: "source",
    owner: OWNER.PLAYER,
    className: "GIANT",
    units: 40,
  });
  const target = createNode({
    id: "target",
    owner: OWNER.ENEMY,
    className: "PULSAR",
    units: 2,
  });
  const link = {
    owner: OWNER.PLAYER,
    sourceId: source.id,
    targetId: target.id,
    wasFriendlyAtCreation: false,
    formationCost: 8,
    unitsInTransit: 8,
    state: "active",
  };

  const result = advanceActiveLink({ source, target, link }, 1);

  assert.equal(result.captured, true);
  assert.equal(result.target.owner, OWNER.PLAYER);
  assert.equal(result.target.units, 5);
});

test("cutting a link sends the front forward and returns the rear", () => {
  const source = createNode({
    id: "source",
    owner: OWNER.PLAYER,
    className: "GIANT",
    units: 40,
  });
  const target = createNode({
    id: "target",
    owner: OWNER.ENEMY,
    className: "GIANT",
    units: 20,
  });
  const link = {
    owner: OWNER.PLAYER,
    sourceId: source.id,
    targetId: target.id,
    wasFriendlyAtCreation: false,
    formationCost: 10,
    unitsInTransit: 10,
    state: "active",
  };

  const result = cutLink({ source, target, link }, 0.2);

  assert.equal(result.forward, 8);
  assert.equal(result.rear, 2);
  assert.equal(result.returned, 2);
  assert.equal(result.source.units, 42);
  assert.equal(result.target.units, 12);
  assert.equal(result.link.unitsInTransit, 0);
  assert.equal(result.link.state, "dead");
  assert.equal(result.prominentBoost, true);
});

test("a near-source cut can capture immediately", () => {
  const source = createNode({
    id: "source",
    owner: OWNER.PLAYER,
    className: "GIANT",
    units: 40,
  });
  const target = createNode({
    id: "target",
    owner: OWNER.ENEMY,
    className: "PULSAR",
    units: 6,
  });
  const link = {
    owner: OWNER.PLAYER,
    sourceId: source.id,
    targetId: target.id,
    wasFriendlyAtCreation: false,
    formationCost: 10,
    unitsInTransit: 10,
    state: "active",
  };

  const result = cutLink({ source, target, link }, 0.2);

  assert.equal(result.captured, true);
  assert.equal(result.target.owner, OWNER.PLAYER);
  assert.equal(result.target.units, 5);
  assert.equal(result.prominentBoost, true);
});
