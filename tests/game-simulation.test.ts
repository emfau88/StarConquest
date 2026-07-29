import assert from "node:assert/strict";
import test from "node:test";
import {
  BALANCE_PROFILES,
  simulateLevel,
} from "../src/balance/BalanceSimulator";
import {
  GameSimulation,
  calculateCutOutcome,
  linkIntensityForEnergy,
} from "../src/core/GameSimulation";
import { SYSTEM_CLASS_SPECS } from "../src/core/game-rules";
import { FixedStepClock } from "../src/engine/FixedStepClock";
import {
  LEVELS,
  type LevelDefinition,
} from "../src/data/levels";
import { CampaignProgress } from "../src/storage/CampaignProgress";

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

test("fixed-step clock produces consistent simulation time across frame rates", () => {
  const runClock = (framesPerSecond: number): number => {
    const clock = new FixedStepClock();
    let simulatedSeconds = 0;
    for (let frame = 0; frame < framesPerSecond * 2; frame += 1) {
      clock.advance(1 / framesPerSecond, (stepSeconds) => {
        simulatedSeconds += stepSeconds;
      });
    }
    return simulatedSeconds;
  };

  assert.ok(Math.abs(runClock(60) - 2) < 0.000_001);
  assert.ok(Math.abs(runClock(144) - 2) < 1 / 60);
});

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
    const systemsById = new Map(
      systems.map((system) => [system.id, system]),
    );
    const cutCandidate = links
      .filter(
        (link) =>
          link.owner === "player" && link.state === "active",
      )
      .map((link) => {
        const target = systemsById.get(link.targetId);
        const outcome = simulation.previewPlayerCut(link.id, 0.2);
        return target && target.owner !== "player" && outcome
          ? { link, target, outcome }
          : null;
      })
      .filter((candidate) => candidate !== null)
      .sort(
        (a, b) =>
          b.outcome.forwardEnergy / Math.max(1, b.target.energy) -
          a.outcome.forwardEnergy / Math.max(1, a.target.energy),
      )[0];
    if (
      cutCandidate &&
      cutCandidate.outcome.forwardEnergy >=
        Math.max(3, cutCandidate.target.energy * 0.75)
    ) {
      simulation.cutPlayerLink(cutCandidate.link.id, 0.2);
      continue;
    }
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

test("the campaign contains six progressively denser sectors", () => {
  assert.equal(LEVELS.length, 6);
  assert.deepEqual(
    LEVELS.map((level) => level.sector),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.difficulty),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.theme),
    [
      "azure-frontier",
      "azure-frontier",
      "quasar-rift",
      "quasar-rift",
      "nexus-void",
      "nexus-void",
    ],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.systems.length),
    [4, 6, 7, 8, 9, 10],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.aiActionIntervalSeconds),
    [14, 10, 8.5, 7, 5.5, 5],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.threeStarSeconds),
    [75, 100, 115, 140, 165, 195],
  );
  assert.deepEqual(
    LEVELS.map((level) => level.twoStarSeconds),
    [130, 170, 190, 230, 270, 320],
  );
});

test("campaign progress unlocks one sector and keeps the best star result", () => {
  const values = new Map<string, string>();
  const storage = {
    get: (key: string): string | null => values.get(key) ?? null,
    set: (key: string, value: string): void => {
      values.set(key, value);
    },
  };
  const progress = new CampaignProgress(storage, 6);

  assert.equal(progress.isUnlocked(0), true);
  assert.equal(progress.isUnlocked(1), false);
  progress.recordWin(0, 2);
  assert.equal(progress.isUnlocked(1), true);
  progress.recordWin(0, 1);
  progress.recordWin(1, 3);

  const reloaded = new CampaignProgress(storage, 6);
  assert.deepEqual(reloaded.snapshot(), {
    unlockedThrough: 2,
    bestStars: [2, 3, 0, 0, 0, 0],
  });
});

test("completed five-sector progress unlocks the added Helion sector", () => {
  const storage = {
    get: (): string =>
      JSON.stringify({
        unlockedThrough: 4,
        bestStars: [3, 2, 2, 1, 2],
      }),
    set: (): void => {},
  };

  const progress = new CampaignProgress(storage, 6);
  assert.equal(progress.isUnlocked(5), true);
  assert.deepEqual(progress.snapshot().bestStars, [3, 2, 2, 1, 2, 0]);
});

test("every campaign sector has valid, unique systems and scoring targets", () => {
  for (const level of LEVELS) {
    const ids = new Set(level.systems.map((system) => system.id));
    assert.equal(ids.size, level.systems.length);
    assert.ok(level.systems.some((system) => system.owner === "player"));
    assert.ok(
      level.systems.some(
        (system) =>
          system.owner === "enemy" || system.owner === "enemy2",
      ),
    );
    assert.ok(level.threeStarSeconds < level.twoStarSeconds);

    for (const system of level.systems) {
      assert.ok(system.position.x >= 100 && system.position.x <= 1500);
      assert.ok(system.position.y >= 180 && system.position.y <= 760);
      assert.ok(system.startEnergy > 0);
    }
  }
});

test("Helion systems expand with orange-owned links", () => {
  const helionLevel = LEVELS.find((level) => level.id === "helion-run");
  assert.ok(helionLevel);
  const simulation = new GameSimulation(helionLevel);

  advance(simulation, helionLevel.aiActionIntervalSeconds + 0.2);

  assert.ok(
    simulation.getLinks().some((link) => link.owner === "enemy2"),
  );
});

test("hostile AI reinforces an owned system under attack", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    difficulty: 4,
    aiActionIntervalSeconds: 0.5,
    systems: [
      {
        id: "player",
        owner: "player",
        className: "QUASAR",
        position: { x: 100, y: 450 },
        startEnergy: 80,
      },
      {
        id: "enemy-front",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 500, y: 450 },
        startEnergy: 10,
      },
      {
        id: "enemy-reserve",
        owner: "enemy",
        className: "GIANT",
        position: { x: 700, y: 450 },
        startEnergy: 80,
      },
    ],
  };
  const simulation = new GameSimulation(level);
  simulation.createPlayerLink("player", "enemy-front");
  advance(simulation, 0.6);

  assert.ok(
    simulation
      .getLinks()
      .some(
        (link) =>
          link.owner === "enemy" &&
          link.sourceId === "enemy-reserve" &&
          link.targetId === "enemy-front",
      ),
  );
});

test("hostile AI uses the same cut rule to finish a pressured target", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    difficulty: 6,
    tutorialNoCost: false,
    aiActionIntervalSeconds: 0.4,
    systems: [
      {
        id: "player",
        owner: "player",
        className: "GIANT",
        position: { x: 500, y: 450 },
        startEnergy: 7,
      },
      {
        id: "enemy",
        owner: "enemy",
        className: "QUASAR",
        position: { x: 300, y: 450 },
        startEnergy: 80,
      },
    ],
  };
  const simulation = new GameSimulation(level);
  advance(simulation, 2);

  assert.ok(
    simulation
      .drainEvents()
      .some(
        (event) =>
          event.kind === "cut" && event.owner === "enemy",
      ),
  );
});

test("a deterministic cut-aware strategy can win every sector", () => {
  for (const level of LEVELS) {
    const simulation = runExpansionBot(level);
    assert.equal(
      simulation.status,
      "won",
      `${level.id} was not won after ${simulation.elapsedSeconds.toFixed(1)}s`,
    );
  }
});

test("balance profiles preserve a readable campaign difficulty curve", () => {
  const learnerResults = LEVELS.map((level) =>
    simulateLevel(level, BALANCE_PROFILES.learner)
  );
  const regularResults = LEVELS.map((level) =>
    simulateLevel(level, BALANCE_PROFILES.regular)
  );
  const expertResults = LEVELS.map((level) =>
    simulateLevel(level, BALANCE_PROFILES.expert)
  );

  assert.equal(learnerResults[0]?.status, "won");
  assert.equal(learnerResults[5]?.status, "lost");
  assert.ok(regularResults.every((result) => result.status === "won"));
  assert.ok(expertResults.every((result) => result.status === "won"));
  assert.ok(
    regularResults[3].elapsedSeconds >
      regularResults[0].elapsedSeconds,
  );
  assert.ok(
    regularResults[5].elapsedSeconds >
      regularResults[2].elapsedSeconds,
  );
});

test("owned systems produce energy", () => {
  const simulation = new GameSimulation(DUEL_LEVEL);
  const before = simulation.getSystem("player")?.energy ?? 0;
  advance(simulation, 1);
  const after = simulation.getSystem("player")?.energy ?? 0;
  assert.ok(after > before);
});

test("link intensity follows stored route energy and stays bounded", () => {
  assert.equal(linkIntensityForEnergy(-10), 0.18);
  assert.ok(linkIntensityForEnergy(12) > linkIntensityForEnergy(4));
  assert.equal(linkIntensityForEnergy(24), 1);
  assert.equal(linkIntensityForEnergy(240), 1);
});

test("cut preview reports the same split used by the simulation", () => {
  const expected = calculateCutOutcome(10, 0.2);
  assert.deepEqual(expected, {
    forwardEnergy: 8,
    returnedEnergy: 2,
    prominentBoost: true,
  });

  const simulation = new GameSimulation(DUEL_LEVEL);
  simulation.createPlayerLink("player", "enemy");
  advance(simulation, 3);
  const link = simulation.getLinks()[0];
  assert.ok(link);
  const preview = simulation.previewPlayerCut(link.id, 0.2);
  assert.ok(preview);
  assert.equal(
    preview.forwardEnergy + preview.returnedEnergy,
    link.unitsInTransit,
  );
});

test("route limits reject new links without deleting stored energy", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    systems: [
      {
        ...DUEL_LEVEL.systems[0],
        id: "source",
        className: "PULSAR",
        startEnergy: 100,
      },
      {
        ...DUEL_LEVEL.systems[1],
        id: "target-a",
        owner: "neutral",
      },
      {
        ...DUEL_LEVEL.systems[1],
        id: "target-b",
        owner: "neutral",
        position: { x: 700, y: 450 },
      },
    ],
  };
  const simulation = new GameSimulation(level);
  assert.deepEqual(simulation.createPlayerLink("source", "target-a"), {
    ok: true,
  });
  const energyAfterFirstLink =
    simulation.getSystem("source")?.energy ?? 0;
  const firstLinkId = simulation.getLinks()[0]?.id;

  assert.deepEqual(simulation.createPlayerLink("source", "target-b"), {
    ok: false,
    reason: "link-limit",
  });
  assert.equal(simulation.getLinks()[0]?.id, firstLinkId);
  assert.equal(
    simulation.getSystem("source")?.energy,
    energyAfterFirstLink,
  );
});

test("hostile incoming links survive a third-party capture", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    aiActionIntervalSeconds: 0.1,
    systems: [
      {
        id: "player",
        owner: "player",
        className: "GIANT",
        position: { x: 100, y: 450 },
        startEnergy: 100,
      },
      {
        id: "contested",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 200, y: 450 },
        startEnergy: 1,
      },
      {
        id: "enemy",
        owner: "enemy",
        className: "GIANT",
        position: { x: 700, y: 450 },
        startEnergy: 100,
      },
    ],
  };
  const simulation = new GameSimulation(level);
  simulation.createPlayerLink("player", "contested");
  advance(simulation, 1);

  assert.equal(simulation.getSystem("contested")?.owner, "player");
  assert.ok(
    simulation
      .getLinks()
      .some(
        (link) =>
          link.owner === "enemy" && link.targetId === "contested",
      ),
  );
  const threat = simulation
    .getThreats("player")
    .find((candidate) => candidate.systemId === "contested");
  assert.ok(threat);
  assert.ok(threat.severity >= 0.3 && threat.severity <= 1);
});

test("captured sources collapse old links into a final payload", () => {
  const level: LevelDefinition = {
    ...DUEL_LEVEL,
    aiActionIntervalSeconds: 0.1,
    systems: [
      {
        id: "source",
        owner: "player",
        className: "PULSAR",
        position: { x: 200, y: 450 },
        startEnergy: 10,
      },
      {
        id: "ally",
        owner: "player",
        className: "GIANT",
        position: { x: 100, y: 450 },
        startEnergy: 100,
      },
      {
        id: "enemy",
        owner: "enemy",
        className: "GIANT",
        position: { x: 300, y: 450 },
        startEnergy: 100,
      },
    ],
  };
  const simulation = new GameSimulation(level);
  simulation.createPlayerLink("source", "ally");
  advance(simulation, 2);

  assert.equal(simulation.getSystem("source")?.owner, "enemy");
  assert.equal(
    simulation
      .getLinks()
      .some(
        (link) =>
          link.sourceId === "source" && link.owner === "player",
      ),
    false,
  );
  assert.ok(
    simulation
      .drainEvents()
      .some((event) => event.kind === "link-collapsed"),
  );
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
  const capture = simulation
    .drainEvents()
    .find((event) => event.kind === "capture");
  assert.ok(capture);
  assert.equal(capture.owner, "player");
  assert.equal(capture.previousOwner, "enemy");
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
