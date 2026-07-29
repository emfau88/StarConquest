import { GameSimulation } from "../core/GameSimulation";
import { SYSTEM_CLASS_SPECS } from "../core/game-rules";
import type {
  EnergyLinkView,
  StarSystemView,
} from "../core/types";
import type { LevelDefinition } from "../data/levels";

export interface BalanceProfile {
  readonly id: "learner" | "regular" | "expert";
  readonly actionIntervalSeconds: number;
  readonly cutPressureRatio: number;
  readonly reinforceBelowRatio: number;
}

export interface BalanceResult {
  readonly levelId: string;
  readonly sector: number;
  readonly profileId: BalanceProfile["id"];
  readonly status: "won" | "lost" | "timeout";
  readonly elapsedSeconds: number;
  readonly stars: number;
  readonly actions: number;
  readonly cuts: number;
  readonly captures: number;
}

export const BALANCE_PROFILES: Readonly<
  Record<BalanceProfile["id"], BalanceProfile>
> = Object.freeze({
  learner: Object.freeze({
    id: "learner",
    actionIntervalSeconds: 2.8,
    cutPressureRatio: 0.9,
    reinforceBelowRatio: 0.58,
  }),
  regular: Object.freeze({
    id: "regular",
    actionIntervalSeconds: 1.8,
    cutPressureRatio: 0.75,
    reinforceBelowRatio: 0.5,
  }),
  expert: Object.freeze({
    id: "expert",
    actionIntervalSeconds: 1,
    cutPressureRatio: 0.62,
    reinforceBelowRatio: 0.42,
  }),
});

const distance = (a: StarSystemView, b: StarSystemView): number =>
  Math.hypot(
    b.position.x - a.position.x,
    b.position.y - a.position.y,
  );

const hasRouteSlot = (
  source: StarSystemView,
  links: readonly EnergyLinkView[],
): boolean =>
  links.filter((link) => link.sourceId === source.id).length <
  SYSTEM_CLASS_SPECS[source.className].maxOutgoingLinks;

const tryCutRoute = (
  simulation: GameSimulation,
  profile: BalanceProfile,
  systems: readonly StarSystemView[],
  links: readonly EnergyLinkView[],
): boolean => {
  const systemsById = new Map(
    systems.map((system) => [system.id, system]),
  );
  const candidate = links
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
    .filter((value) => value !== null)
    .sort(
      (a, b) =>
        b.outcome.forwardEnergy / Math.max(1, b.target.energy) -
          a.outcome.forwardEnergy / Math.max(1, a.target.energy) ||
        a.link.id.localeCompare(b.link.id),
    )[0];

  return Boolean(
    candidate &&
      candidate.outcome.forwardEnergy >=
        Math.max(
          3,
          candidate.target.energy * profile.cutPressureRatio,
        ) &&
      simulation.cutPlayerLink(candidate.link.id, 0.2),
  );
};

const tryReinforce = (
  simulation: GameSimulation,
  profile: BalanceProfile,
  systems: readonly StarSystemView[],
  links: readonly EnergyLinkView[],
): boolean => {
  const threatenedIds = new Set(
    simulation.getThreats("player").map((threat) => threat.systemId),
  );
  const targets = systems
    .filter(
      (system) =>
        system.owner === "player" &&
        threatenedIds.has(system.id) &&
        system.energy / system.capacity <
          profile.reinforceBelowRatio,
    )
    .sort(
      (a, b) =>
        a.energy / a.capacity - b.energy / b.capacity ||
        a.id.localeCompare(b.id),
    );

  for (const target of targets) {
    const alreadyReinforced = links.some(
      (link) =>
        link.owner === "player" &&
        link.targetId === target.id &&
        link.sourceId !== target.id,
    );
    if (alreadyReinforced) {
      continue;
    }
    const sources = systems
      .filter(
        (source) =>
          source.owner === "player" &&
          source.id !== target.id &&
          hasRouteSlot(source, links),
      )
      .sort(
        (a, b) =>
          b.energy -
            distance(b, target) * 0.02 -
            (a.energy - distance(a, target) * 0.02) ||
          a.id.localeCompare(b.id),
      );
    for (const source of sources) {
      if (simulation.createPlayerLink(source.id, target.id).ok) {
        return true;
      }
    }
  }
  return false;
};

const tryAttack = (
  simulation: GameSimulation,
  systems: readonly StarSystemView[],
  links: readonly EnergyLinkView[],
): boolean => {
  const sources = systems
    .filter(
      (system) =>
        system.owner === "player" && hasRouteSlot(system, links),
    )
    .sort(
      (a, b) =>
        b.energy - a.energy || a.id.localeCompare(b.id),
    );

  for (const source of sources) {
    const targets = systems
      .filter((target) => target.owner !== "player")
      .sort((a, b) => {
        const score = (target: StarSystemView): number =>
          target.energy +
          distance(source, target) * 0.015 -
          (target.owner === "neutral" ? 4 : 0);
        return score(a) - score(b) || a.id.localeCompare(b.id);
      });
    for (const target of targets) {
      if (simulation.createPlayerLink(source.id, target.id).ok) {
        return true;
      }
    }
  }
  return false;
};

export const simulateLevel = (
  level: LevelDefinition,
  profile: BalanceProfile,
  maximumSeconds = 480,
): BalanceResult => {
  const simulation = new GameSimulation(level);
  let nextActionAt = 0.5;
  let actions = 0;
  let cuts = 0;
  let captures = 0;

  while (
    simulation.status === "playing" &&
    simulation.elapsedSeconds < maximumSeconds
  ) {
    simulation.update(0.1);
    for (const event of simulation.drainEvents()) {
      if (event.kind === "cut" && event.owner === "player") {
        cuts += 1;
      } else if (event.kind === "capture") {
        captures += 1;
      }
    }
    if (simulation.elapsedSeconds < nextActionAt) {
      continue;
    }
    nextActionAt += profile.actionIntervalSeconds;
    const systems = simulation.getSystems();
    const links = simulation.getLinks();
    if (
      tryCutRoute(simulation, profile, systems, links) ||
      tryReinforce(simulation, profile, systems, links) ||
      tryAttack(simulation, systems, links)
    ) {
      actions += 1;
    }
  }

  const status =
    simulation.status === "playing"
      ? "timeout"
      : simulation.status;
  const stars =
    status !== "won"
      ? 0
      : simulation.elapsedSeconds <= level.threeStarSeconds
        ? 3
        : simulation.elapsedSeconds <= level.twoStarSeconds
          ? 2
          : 1;
  return {
    levelId: level.id,
    sector: level.sector,
    profileId: profile.id,
    status,
    elapsedSeconds: simulation.elapsedSeconds,
    stars,
    actions,
    cuts,
    captures,
  };
};
