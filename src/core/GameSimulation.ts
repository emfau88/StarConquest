import {
  LEVEL_ONE,
  type LevelDefinition,
} from "../data/level-one";
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
} from "./types";

interface StarSystemState extends StarSystemView {
  productionPerSecond: number;
  maxOutgoingLinks: number;
}

interface EnergyLinkState extends EnergyLinkView {
  formationCost: number;
  createdOrder: number;
  wasFriendlyAtCreation: boolean;
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
      targetId: string;
      position: Point;
    }
  | {
      kind: "cut";
      position: Point;
      targetPosition: Point;
      prominentBoost: boolean;
    }
  | {
      kind: "invalid";
      position: Point;
      reason: "insufficient-energy" | "duplicate-link" | "invalid-target";
    }
  | { kind: "won"; elapsedSeconds: number }
  | { kind: "lost"; elapsedSeconds: number };

export interface LinkCommandResult {
  ok: boolean;
  reason?: "insufficient-energy" | "duplicate-link" | "invalid-target";
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

const distance = (a: Point, b: Point): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

export class GameSimulation {
  private systems: StarSystemState[] = [];
  private links: EnergyLinkState[] = [];
  private events: SimulationEvent[] = [];
  private nextLinkId = 1;
  private creationOrder = 1;
  private aiElapsedSeconds = 0;

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
    this.creationOrder = 1;
    this.aiElapsedSeconds = 0;
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
      this.performEnemyAction();
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
        !this.hasDuplicateLink(sourceId, targetId),
    );
  }

  createPlayerLink(sourceId: string, targetId: string): LinkCommandResult {
    return this.createLink(sourceId, targetId, "player");
  }

  cutPlayerLink(linkId: string, cutFraction: number): boolean {
    const link = this.links.find(
      (candidate) =>
        candidate.id === linkId &&
        candidate.owner === "player" &&
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

    const fraction = clamp(cutFraction, 0, 1);
    const forward = link.unitsInTransit * (1 - fraction);
    const rear = link.unitsInTransit * fraction;
    this.applyTransfer(link.owner, target, forward);
    if (source.owner === link.owner) {
      source.energy = Math.min(source.capacity, source.energy + rear);
    }

    link.unitsInTransit = 0;
    this.removeLink(link);
    const prominentBoost =
      fraction < GAME_RULES.prominentBoostCutFraction &&
      forward > GAME_RULES.prominentBoostMinimumForwardEnergy;
    this.events.push({
      kind: "cut",
      position: { ...source.position },
      targetPosition: { ...target.position },
      prominentBoost,
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

      if (!link.wasFriendlyAtCreation && source.owner !== link.owner) {
        this.removeLink(link);
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

    target.owner = owner;
    target.energy = Math.min(
      target.capacity,
      Math.max(GAME_RULES.captureEnergyFloor, Math.abs(target.energy)),
    );
    this.links = this.links.filter(
      (link) => link.targetId !== target.id || link.owner === owner,
    );
    this.events.push({
      kind: "capture",
      owner,
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
      this.events.push({
        kind: "invalid",
        position: { ...target.position },
        reason: "duplicate-link",
      });
      return { ok: false, reason: "duplicate-link" };
    }

    const cost = this.formationCost(sourceId, targetId);
    if (cost === null || source.energy <= cost + 1) {
      this.events.push({
        kind: "invalid",
        position: { ...source.position },
        reason: "insufficient-energy",
      });
      return { ok: false, reason: "insufficient-energy" };
    }

    const outgoing = this.links
      .filter((link) => link.sourceId === source.id)
      .sort((a, b) => a.createdOrder - b.createdOrder);
    if (outgoing.length >= source.maxOutgoingLinks) {
      this.removeLink(outgoing[0]);
    }

    source.energy -= cost;
    const link: EnergyLinkState = {
      id: `link-${this.nextLinkId++}`,
      sourceId,
      targetId,
      owner,
      intensity: 0.7,
      state: "growing",
      growProgress: 0,
      unitsInTransit: cost,
      formationCost: cost,
      createdOrder: this.creationOrder++,
      wasFriendlyAtCreation: source.owner === target.owner,
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

  private performEnemyAction(): void {
    const enemySources = this.systems
      .filter((system) => system.owner === "enemy")
      .sort((a, b) => b.energy - a.energy);

    for (const source of enemySources) {
      const targets = this.systems
        .filter(
          (system) =>
            system !== source &&
            system.owner !== "enemy" &&
            !this.hasDuplicateLink(source.id, system.id),
        )
        .sort((a, b) => {
          const aScore =
            a.energy + distance(source.position, a.position) * 0.012;
          const bScore =
            b.energy + distance(source.position, b.position) * 0.012;
          return aScore - bScore;
        });
      const target = targets[0];
      if (target && this.createLink(source.id, target.id, "enemy").ok) {
        return;
      }
    }
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
