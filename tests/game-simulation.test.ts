import assert from "node:assert/strict";
import test from "node:test";
import { GameSimulation } from "../src/core/GameSimulation";
import { SYSTEM_CLASS_SPECS } from "../src/core/game-rules";
import {
  LEVELS,
  type LevelDefinition,
} from "../src/data/levels";

const DUEL_LEVEL: LevelDefinition = {
  id: "test-duel",
  sector: 0,
  difficulty: 1,
  theme: "azure-frontier",
  title: { en: "Test Duel", de: "Testduell" },
  objective: { en: "Test", de: "Test" },
  openingHint: { en: "Test", de: "Test" },
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

const runExpansionBot = (
  level: LevelDefinition,
  maximumSeconds = 600,
): GameSimulation => {
  const simulation = new GameSimulation(level);
  let nextActionAt = 0;

  while (
    simulation.status === "playing" &&
    simulation.elapsedSeconds < maximumSeconds
  ) {
    simulation.update(0.1);
    if (simulation.elapsedSeconds < nextActionAt) {
      continue;
    }
    nextActionAt += 1;

    const systems = simulation.getSystems();
    const links = simulation.getLinks();
    const sources = systems
      .filter((system) => system.owner === "player")
      .sort((a, b) => b.energy - a.energy);

    let acted = false;
    for (const source of sources) {
      const outgoingCount = links.filter(
        (link) => link.sourceId === source.id,
      ).length;
      if (
        outgoingCount >=
        SYSTEM_CLASS_SPECS[source.className].maxOutgoingLinks
      ) {
        continue;
      }

      const targets = systems
        .filter((target) => target.owner !== "player")
        .sort((a, b) => {
          const score = (target: typeof a): number =>
            target.energy +
            Math.hypot(
              target.position.x - source.position.x,
              target.position.y - source.position.y,
            ) *
              0.015;
          return score(a) - score(b);
        });

      for (const target of targets) {
        if (simulation.createPlayerLink(source.id, target.id).ok) {
          acted = true;
          break;
        }
      }
      if (acted) {
        break;
      }
    }
  }

  return simulation;
};

test("the campaign contains five progressively denser sectors", () => {
  assert.equal(LEVELS.length, 5);
  assert.deepEqual(
    LEVELS.map((level) => level.sector),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.difficulty),
    [1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.theme),
    [
      "azure-frontier",
      "azure-frontier",
      "quasar-rift",
      "quasar-rift",
      "nexus-void",
    ],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.systems.length),
    [4, 6, 7, 8, 9],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.aiActionIntervalSeconds),
    [14, 10, 8.5, 7, 5.5],
  );
});

test("every campaign sector has valid, unique systems and scoring targets", () => {
  for (const level of LEVELS) {
    const ids = new Set(level.systems.map((system) => system.id));
    assert.equal(ids.size, level.systems.length);
    assert.ok(level.systems.some((system) => system.owner === "player"));
    assert.ok(level.systems.some((system) => system.owner === "enemy"));
    assert.ok(level.threeStarSeconds < level.twoStarSeconds);

    for (const system of level.systems) {
      assert.ok(system.position.x >= 100 && system.position.x <= 1500);
      assert.ok(system.position.y >= 180 && system.position.y <= 760);
      assert.ok(system.startEnergy > 0);
    }
  }
});

test("a simple deterministic expansion strategy can win every sector", () => {
  for (const level of LEVELS) {
    const simulation = runExpansionBot(level);
    assert.equal(
      simulation.status,
      "won",
      `${level.id} was not won after ${simulation.elapsedSeconds.toFixed(1)}s`,
    );
  }
});

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
