import {
  LEVEL_ONE,
  type LevelDefinition,
} from "../data/levels";
import {
  GAME_RULES,
  SYSTEM_CLASS_SPECS,
} from "./game-rules";
import type {
  EnergyLinkView,
  GameStatus,
  Owner,
  Point,
  StarSystemView,
  SystemThreatView,
} from "./types";

interface StarSystemState extends StarSystemView {
  productionPerSecond: number;
  maxOutgoingLinks: number;
}

interface EnergyLinkState extends EnergyLinkView {
  formationCost: number;
}

export type SimulationEvent =
  | {
      kind: "link-created";
      owner: Owner;
      sourceId: string;
      targetId: string;
    }
  | {
      kind: "capture";
      owner: Owner;
      previousOwner: Owner;
      targetId: string;
      position: Point;
    }
  | {
      kind: "cut";
      owner: Owner;
      position: Point;
      targetPosition: Point;
      prominentBoost: boolean;
    }
  | {
      kind: "invalid";
      position: Point;
      reason:
        | "insufficient-energy"
        | "duplicate-link"
        | "invalid-target"
        | "link-limit";
    }
  | {
      kind: "link-collapsed";
      owner: Owner;
      position: Point;
      targetPosition: Point;
    }
  | { kind: "won"; elapsedSeconds: number }
  | { kind: "lost"; elapsedSeconds: number };

export interface LinkCommandResult {
  ok: boolean;
  reason?:
    | "insufficient-energy"
    | "duplicate-link"
    | "invalid-target"
    | "link-limit";
}

export interface CutOutcome {
  forwardEnergy: number;
  returnedEnergy: number;
  prominentBoost: boolean;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

export const linkIntensityForEnergy = (unitsInTransit: number): number => {
  const charge = clamp(
    Number.isFinite(unitsInTransit) ? unitsInTransit : 0,
    0,
    24,
  );
  return 0.18 + (charge / 24) * 0.82;
};

export const calculateCutOutcome = (
  unitsInTransit: number,
  cutFraction: number,
): CutOutcome => {
  const energy = Math.max(
    0,
    Number.isFinite(unitsInTransit) ? unitsInTransit : 0,
  );
  const fraction = clamp(
    Number.isFinite(cutFraction) ? cutFraction : 0,
    0,
    1,
  );
  const forwardEnergy = energy * (1 - fraction);
  return {
    forwardEnergy,
    returnedEnergy: energy - forwardEnergy,
    prominentBoost:
      fraction < GAME_RULES.prominentBoostCutFraction &&
      forwardEnergy > GAME_RULES.prominentBoostMinimumForwardEnergy,
  };
};

const distance = (a: Point, b: Point): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

const HOSTILE_OWNERS = ["enemy", "enemy2"] as const;
type HostileOwner = (typeof HOSTILE_OWNERS)[number];
const AI_CUT_FRACTION = 0.22;

export class GameSimulation {
  private systems: StarSystemState[] = [];
  private links: EnergyLinkState[] = [];
  private events: SimulationEvent[] = [];
  private nextLinkId = 1;
  private aiElapsedSeconds = 0;
  private hostileActionCounts: Record<HostileOwner, number> = {
    enemy: 0,
    enemy2: 0,
  };

  elapsedSeconds = 0;
  status: GameStatus = "playing";

  constructor(private readonly level: LevelDefinition = LEVEL_ONE) {
    this.reset();
  }

  reset(): void {
    this.systems = this.level.systems.map((definition) => {
      const spec = SYSTEM_CLASS_SPECS[definition.className];
      return {
        id: definition.id,
        owner: definition.owner,
        className: definition.className,
        position: { ...definition.position },
        energy: definition.startEnergy,
        capacity: spec.capacity,
        productionPerSecond: spec.productionPerSecond,
        maxOutgoingLinks: spec.maxOutgoingLinks,
      };
    });
    this.links = [];
    this.events = [];
    this.nextLinkId = 1;
    this.aiElapsedSeconds = 0;
    this.hostileActionCounts = { enemy: 0, enemy2: 0 };
    this.elapsedSeconds = 0;
    this.status = "playing";
  }

  update(deltaSeconds: number): void {
    if (this.status !== "playing" || deltaSeconds <= 0) {
      return;
    }

    const delta = Math.min(0.1, deltaSeconds);
    this.elapsedSeconds += delta;
    this.aiElapsedSeconds += delta;
    this.produceEnergy(delta);
    this.updateLinks(delta);

    if (this.aiElapsedSeconds >= this.level.aiActionIntervalSeconds) {
      this.aiElapsedSeconds = 0;
      this.performHostileActions();
    }

    this.evaluateOutcome();
  }

  getSystems(): readonly StarSystemView[] {
    return this.systems;
  }

  getLinks(): readonly EnergyLinkView[] {
    return this.links;
  }

  getSystem(id: string): StarSystemView | undefined {
    return this.systems.find((system) => system.id === id);
  }

  getThreats(owner: Owner): readonly SystemThreatView[] {
    return this.systems
      .filter((system) => system.owner === owner)
      .map((system) => {
        const incoming = this.links.filter(
          (link) =>
            link.targetId === system.id && link.owner !== owner,
        );
        const incomingEnergy = incoming.reduce(
          (total, link) => total + link.unitsInTransit,
          0,
        );
        return {
          systemId: system.id,
          severity: clamp(
            0.3 +
              (incomingEnergy / Math.max(6, system.energy)) * 0.5 +
              Math.max(0, incoming.length - 1) * 0.15,
            0.3,
            1,
          ),
          incomingCount: incoming.length,
        };
      })
      .filter(({ incomingCount }) => incomingCount > 0)
      .map(({ systemId, severity }) => ({ systemId, severity }));
  }

  drainEvents(): SimulationEvent[] {
    return this.events.splice(0);
  }

  formationCost(sourceId: string, targetId: string): number | null {
    const source = this.findSystem(sourceId);
    const target = this.findSystem(targetId);
    if (!source || !target) {
      return null;
    }
    if (this.level.tutorialNoCost) {
      return GAME_RULES.tutorialFormationCost;
    }
    return (
      Math.ceil(
        distance(source.position, target.position) *
          GAME_RULES.distanceCostPerPixel,
      ) + GAME_RULES.baseFormationCost
    );
  }

  canCreatePlayerLink(sourceId: string, targetId: string): boolean {
    const source = this.findSystem(sourceId);
    const target = this.findSystem(targetId);
    const cost = this.formationCost(sourceId, targetId);
    return Boolean(
      source &&
        target &&
        source.owner === "player" &&
        source !== target &&
        cost !== null &&
        source.energy > cost + 1 &&
        !this.hasDuplicateLink(sourceId, targetId) &&
        this.outgoingLinkCount(sourceId) < source.maxOutgoingLinks,
    );
  }

  createPlayerLink(sourceId: string, targetId: string): LinkCommandResult {
    return this.createLink(sourceId, targetId, "player");
  }

  previewPlayerCut(
    linkId: string,
    cutFraction: number,
  ): CutOutcome | null {
    const link = this.links.find(
      (candidate) =>
        candidate.id === linkId &&
        candidate.owner === "player" &&
        candidate.state === "active",
    );
    return link
      ? calculateCutOutcome(link.unitsInTransit, cutFraction)
      : null;
  }

  cutPlayerLink(linkId: string, cutFraction: number): boolean {
    return this.cutLink(linkId, cutFraction, "player");
  }

  private cutLink(
    linkId: string,
    cutFraction: number,
    owner: Owner,
  ): boolean {
    const link = this.links.find(
      (candidate) =>
        candidate.id === linkId &&
        candidate.owner === owner &&
        candidate.state === "active",
    );
    if (!link) {
      return false;
    }

    const source = this.findSystem(link.sourceId);
    const target = this.findSystem(link.targetId);
    if (!source || !target) {
      return false;
    }

    const outcome = calculateCutOutcome(
      link.unitsInTransit,
      cutFraction,
    );
    const normalizedCutFraction = clamp(cutFraction, 0, 1);
    const cutPosition = {
      x:
        source.position.x +
        (target.position.x - source.position.x) *
          normalizedCutFraction,
      y:
        source.position.y +
        (target.position.y - source.position.y) *
          normalizedCutFraction,
    };
    this.applyTransfer(link.owner, target, outcome.forwardEnergy);
    if (source.owner === link.owner) {
      source.energy = Math.min(
        source.capacity,
        source.energy + outcome.returnedEnergy,
      );
    }

    link.unitsInTransit = 0;
    this.removeLink(link);
    this.events.push({
      kind: "cut",
      owner,
      position: cutPosition,
      targetPosition: { ...target.position },
      prominentBoost: outcome.prominentBoost,
    });
    this.evaluateOutcome();
    return true;
  }

  private produceEnergy(deltaSeconds: number): void {
    for (const system of this.systems) {
      if (system.owner === "neutral") {
        continue;
      }
      system.energy = Math.min(
        system.capacity,
        system.energy + system.productionPerSecond * deltaSeconds,
      );
    }
  }

  private updateLinks(deltaSeconds: number): void {
    for (const link of [...this.links]) {
      const source = this.findSystem(link.sourceId);
      const target = this.findSystem(link.targetId);
      if (!source || !target) {
        this.removeLink(link);
        continue;
      }

      if (source.owner !== link.owner) {
        const finalPayload = link.unitsInTransit;
        link.unitsInTransit = 0;
        this.removeLink(link);
        this.applyTransfer(link.owner, target, finalPayload);
        this.events.push({
          kind: "link-collapsed",
          owner: link.owner,
          position: { ...source.position },
          targetPosition: { ...target.position },
        });
        continue;
      }

      if (link.state === "growing") {
        const linkLength = Math.max(
          1,
          distance(source.position, target.position),
        );
        link.growProgress +=
          (GAME_RULES.linkGrowPixelsPerSecond / linkLength) * deltaSeconds;
        if (link.growProgress >= 1) {
          link.growProgress = 1;
          link.state = "active";
        }
        continue;
      }

      const pressure = clamp(source.energy / source.capacity, 0, 1);
      const flowPerSecond =
        GAME_RULES.baseFlowPerSecond *
        (GAME_RULES.pressureFloorMultiplier +
          pressure * GAME_RULES.pressureMultiplier);
      const requested = flowPerSecond * deltaSeconds;
      const delivered = Math.min(link.unitsInTransit, requested);
      link.unitsInTransit -= delivered;
      this.applyTransfer(link.owner, target, delivered);

      const pumped = Math.min(source.energy, requested);
      source.energy -= pumped;
      link.unitsInTransit += pumped;
      link.intensity = linkIntensityForEnergy(link.unitsInTransit);
    }
  }

  private applyTransfer(
    owner: Owner,
    target: StarSystemState,
    amount: number,
  ): void {
    if (amount <= 0) {
      return;
    }

    if (target.owner === owner) {
      target.energy = Math.min(target.capacity, target.energy + amount);
      return;
    }

    target.energy -= amount;
    if (target.energy > 0) {
      return;
    }

    const previousOwner = target.owner;
    target.owner = owner;
    target.energy = Math.min(
      target.capacity,
      Math.max(GAME_RULES.captureEnergyFloor, Math.abs(target.energy)),
    );
    this.events.push({
      kind: "capture",
      owner,
      previousOwner,
      targetId: target.id,
      position: { ...target.position },
    });
  }

  private createLink(
    sourceId: string,
    targetId: string,
    owner: Owner,
  ): LinkCommandResult {
    const source = this.findSystem(sourceId);
    const target = this.findSystem(targetId);
    if (!source || !target || source === target || source.owner !== owner) {
      return { ok: false, reason: "invalid-target" };
    }
    if (this.hasDuplicateLink(sourceId, targetId)) {
      if (owner === "player") {
        this.events.push({
          kind: "invalid",
          position: { ...target.position },
          reason: "duplicate-link",
        });
      }
      return { ok: false, reason: "duplicate-link" };
    }

    const cost = this.formationCost(sourceId, targetId);
    if (cost === null || source.energy <= cost + 1) {
      if (owner === "player") {
        this.events.push({
          kind: "invalid",
          position: { ...source.position },
          reason: "insufficient-energy",
        });
      }
      return { ok: false, reason: "insufficient-energy" };
    }

    if (this.outgoingLinkCount(source.id) >= source.maxOutgoingLinks) {
      if (owner === "player") {
        this.events.push({
          kind: "invalid",
          position: { ...source.position },
          reason: "link-limit",
        });
      }
      return { ok: false, reason: "link-limit" };
    }

    source.energy -= cost;
    const link: EnergyLinkState = {
      id: `link-${this.nextLinkId++}`,
      sourceId,
      targetId,
      owner,
      intensity: linkIntensityForEnergy(cost),
      state: "growing",
      growProgress: 0,
      unitsInTransit: cost,
      formationCost: cost,
    };
    this.links.push(link);
    this.events.push({
      kind: "link-created",
      owner,
      sourceId,
      targetId,
    });
    return { ok: true };
  }

  private hasDuplicateLink(sourceId: string, targetId: string): boolean {
    return this.links.some(
      (link) => link.sourceId === sourceId && link.targetId === targetId,
    );
  }

  private outgoingLinkCount(sourceId: string): number {
    return this.links.filter((link) => link.sourceId === sourceId).length;
  }

  private performHostileActions(): void {
    for (const owner of HOSTILE_OWNERS) {
      if (this.status !== "playing") {
        break;
      }
      this.performFactionAction(owner);
    }
  }

  private performFactionAction(owner: HostileOwner): void {
    const hasFactionSystems = this.systems.some(
      (system) => system.owner === owner,
    );
    if (!hasFactionSystems) {
      return;
    }
    this.hostileActionCounts[owner] += 1;
    if (this.tryReinforceThreatenedSystem(owner)) {
      return;
    }
    if (this.tryCutHostileRoute(owner)) {
      return;
    }
    this.tryCreateHostileAttack(owner);
  }

  private tryReinforceThreatenedSystem(owner: HostileOwner): boolean {
    const threatenedSystems = this.systems
      .filter((system) => system.owner === owner)
      .map((system) => {
        const incomingThreats = this.links.filter(
          (link) =>
            link.targetId === system.id && link.owner !== owner,
        );
        const incomingEnergy = incomingThreats.reduce(
          (total, link) => total + Math.max(3, link.unitsInTransit),
          0,
        );
        return {
          system,
          incomingThreats,
          urgency:
            incomingEnergy / Math.max(1, system.energy) +
            (1 - system.energy / system.capacity),
        };
      })
      .filter(({ incomingThreats }) => incomingThreats.length > 0)
      .sort(
        (a, b) =>
          b.urgency - a.urgency ||
          a.system.id.localeCompare(b.system.id),
      );

    for (const { system: target } of threatenedSystems) {
      const alreadyReinforced = this.links.some(
        (link) =>
          link.owner === owner &&
          link.targetId === target.id &&
          link.sourceId !== target.id,
      );
      if (alreadyReinforced) {
        continue;
      }
      const sources = this.systems
        .filter(
          (source) =>
            source.owner === owner &&
            source !== target &&
            this.outgoingLinkCount(source.id) <
              source.maxOutgoingLinks &&
            !this.hasDuplicateLink(source.id, target.id),
        )
        .map((source) => ({
          source,
          cost: this.formationCost(source.id, target.id),
        }))
        .filter(
          (
            candidate,
          ): candidate is {
            source: StarSystemState;
            cost: number;
          } =>
            candidate.cost !== null &&
            candidate.source.energy > candidate.cost + 1,
        )
        .sort(
          (a, b) =>
            b.source.energy -
              b.cost -
              (a.source.energy - a.cost) ||
            a.source.id.localeCompare(b.source.id),
        );
      const source = sources[0]?.source;
      if (source && this.createLink(source.id, target.id, owner).ok) {
        return true;
      }
    }
    return false;
  }

  private tryCutHostileRoute(owner: HostileOwner): boolean {
    const cadence = Math.max(2, 7 - this.level.difficulty);
    const candidates = this.links
      .filter(
        (link) => link.owner === owner && link.state === "active",
      )
      .map((link) => {
        const target = this.findSystem(link.targetId);
        return target && target.owner !== owner
          ? {
              link,
              target,
              outcome: calculateCutOutcome(
                link.unitsInTransit,
                AI_CUT_FRACTION,
              ),
            }
          : null;
      })
      .filter(
        (
          candidate,
        ): candidate is {
          link: EnergyLinkState;
          target: StarSystemState;
          outcome: CutOutcome;
        } => candidate !== null,
      )
      .sort(
        (a, b) =>
          b.outcome.forwardEnergy / Math.max(1, b.target.energy) -
            a.outcome.forwardEnergy / Math.max(1, a.target.energy) ||
          a.link.id.localeCompare(b.link.id),
      );

    for (const candidate of candidates) {
      const canCapture =
        candidate.outcome.forwardEnergy >= candidate.target.energy;
      const worthwhilePressure =
        this.hostileActionCounts[owner] % cadence === 0 &&
        candidate.outcome.forwardEnergy >=
          Math.max(4, candidate.target.energy * 0.75);
      if (
        (canCapture || worthwhilePressure) &&
        this.cutLink(candidate.link.id, AI_CUT_FRACTION, owner)
      ) {
        return true;
      }
    }
    return false;
  }

  private tryCreateHostileAttack(owner: HostileOwner): boolean {
    const factionSources = this.systems
      .filter(
        (system) =>
          system.owner === owner &&
          this.outgoingLinkCount(system.id) <
            system.maxOutgoingLinks,
      )
      .sort((a, b) => b.energy - a.energy);
    const distanceWeight = owner === "enemy2" ? 0.006 : 0.012;
    const defensiveTargets = new Set(
      this.links
        .filter((link) => {
          const target = this.findSystem(link.targetId);
          return target?.owner === owner && link.owner !== owner;
        })
        .map((link) => link.sourceId),
    );

    for (const source of factionSources) {
      const targets = this.systems
        .filter(
          (system) =>
            system !== source &&
            system.owner !== owner &&
            !this.hasDuplicateLink(source.id, system.id) &&
            source.energy >
              (this.formationCost(source.id, system.id) ??
                Number.POSITIVE_INFINITY) +
                1,
        )
        .sort((a, b) => {
          const aScore =
            a.energy +
            distance(source.position, a.position) * distanceWeight -
            (defensiveTargets.has(a.id) ? 24 : 0);
          const bScore =
            b.energy +
            distance(source.position, b.position) * distanceWeight -
            (defensiveTargets.has(b.id) ? 24 : 0);
          return aScore - bScore || a.id.localeCompare(b.id);
        });
      const target = targets[0];
      if (target && this.createLink(source.id, target.id, owner).ok) {
        return true;
      }
    }
    return false;
  }

  private evaluateOutcome(): void {
    if (this.status !== "playing") {
      return;
    }
    const hasPlayer = this.systems.some((system) => system.owner === "player");
    const hasEnemy = this.systems.some(
      (system) => system.owner === "enemy" || system.owner === "enemy2",
    );

    if (hasPlayer && !hasEnemy) {
      this.status = "won";
      this.events.push({ kind: "won", elapsedSeconds: this.elapsedSeconds });
    } else if (!hasPlayer) {
      this.status = "lost";
      this.events.push({ kind: "lost", elapsedSeconds: this.elapsedSeconds });
    }
  }

  private findSystem(id: string): StarSystemState | undefined {
    return this.systems.find((system) => system.id === id);
  }

  private removeLink(link: EnergyLinkState | undefined): void {
    if (!link) {
      return;
    }
    this.links = this.links.filter((candidate) => candidate !== link);
  }
}
