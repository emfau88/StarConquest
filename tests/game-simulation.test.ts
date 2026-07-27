import assert from "node:assert/strict";
import test from "node:test";
import { GameSimulation } from "../src/core/GameSimulation";
import type { LevelDefinition } from "../src/data/level-one";

const DUEL_LEVEL: LevelDefinition = {
  id: "test-duel",
  sector: 0,
  title: "Test Duel",
  objective: "Test",
  tutorialNoCost: true,
  threeStarSeconds: 30,
  twoStarSeconds: 60,
  aiActionIntervalSeconds: 999,
  systems: [
    {
      id: "player",
      owner: "player",
      className: "QUASAR",
      position: { x: 200, y: 450 },
      startEnergy: 40,
    },
    {
      id: "enemy",
      owner: "enemy",
      className: "GIANT",
      position: { x: 500, y: 450 },
      startEnergy: 5,
    },
  ],
};

const advance = (
  simulation: GameSimulation,
  seconds: number,
  step = 0.1,
): void => {
  for (let elapsed = 0; elapsed < seconds; elapsed += step) {
    simulation.update(step);
  }
};

test("owned systems produce energy", () => {
  const simulation = new GameSimulation(DUEL_LEVEL);
  const before = simulation.getSystem("player")?.energy ?? 0;
  advance(simulation, 1);
  const after = simulation.getSystem("player")?.energy ?? 0;
  assert.ok(after > before);
});

test("a player link grows, attacks and wins the duel", () => {
  const simulation = new GameSimulation(DUEL_LEVEL);
  assert.deepEqual(simulation.createPlayerLink("player", "enemy"), {
    ok: true,
  });
  assert.equal(simulation.getLinks()[0]?.state, "growing");

  advance(simulation, 20);

  assert.equal(simulation.getSystem("enemy")?.owner, "player");
  assert.equal(simulation.status, "won");
  assert.ok(
    simulation.drainEvents().some((event) => event.kind === "capture"),
  );
});

test("cutting an active link removes it and launches stored energy", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    systems: [
      DUEL_LEVEL.systems[0],
      { ...DUEL_LEVEL.systems[1], startEnergy: 60 },
    ],
  };
  const simulation = new GameSimulation(level);
  simulation.createPlayerLink("player", "enemy");
  advance(simulation, 2);
  const link = simulation.getLinks()[0];
  assert.equal(link?.state, "active");

  const sourceBefore = simulation.getSystem("player")?.energy ?? 0;
  const targetBefore = simulation.getSystem("enemy")?.energy ?? 0;
  assert.equal(simulation.cutPlayerLink(link.id, 0.2), true);

  assert.equal(simulation.getLinks().length, 0);
  assert.ok((simulation.getSystem("player")?.energy ?? 0) > sourceBefore);
  assert.ok((simulation.getSystem("enemy")?.energy ?? 0) < targetBefore);
  assert.ok(simulation.drainEvents().some((event) => event.kind === "cut"));
});
