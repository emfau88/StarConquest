import { AudioController } from "../audio/AudioController";
import {
  GameSimulation,
  type SimulationEvent,
} from "../core/GameSimulation";
import {
  combatFrontFraction,
  findHostileReciprocalLink,
  pointBetweenSystems,
} from "../core/link-combat";
import type {
  CutPreview,
  DragPreview,
  Point,
  SceneSnapshot,
  StarSystemView,
  TutorialCue,
  VisualEffect,
  VisualEffectKind,
} from "../core/types";
import {
  LEVELS,
  localizeLevelText,
  type LevelDefinition,
} from "../data/levels";
import { CanvasRenderer } from "../engine/CanvasRenderer";
import { CanvasViewport } from "../engine/CanvasViewport";
import { FixedStepClock } from "../engine/FixedStepClock";
import {
  distanceToSegment,
  getLinkCurve,
  getLinkLaneOffset,
  pointOnLink,
} from "../engine/link-geometry";
import { systemHitRadius } from "../engine/system-geometry";
import { PointerInput } from "../input/PointerInput";
import {
  resolveLocale,
  type Locale,
  type StringKey,
} from "../i18n/strings";
import { FullscreenController } from "../platform/FullscreenController";
import {
  createPlatformAdapter,
  type PlatformAdapter,
} from "../platform/PlatformAdapter";
import { SafeStorage } from "../storage/SafeStorage";
import { CampaignProgress } from "../storage/CampaignProgress";
import { HudController } from "../ui/HudController";

const CUT_SAMPLE_COUNT = 40;
const CUT_DISTANCE = 34;
const CUT_TRAIL_POINT_DISTANCE = 10;

const resolveInitialLevelIndex = (): number => {
  if (!import.meta.env.DEV) {
    return 0;
  }
  const requestedSector = Number(
    new URLSearchParams(window.location.search).get("level"),
  );
  return Number.isInteger(requestedSector) &&
    requestedSector >= 1 &&
    requestedSector <= LEVELS.length
    ? requestedSector - 1
    : 0;
};

interface LinkGesture {
  kind: "link";
  sourceId: string;
  current: Point;
}

interface CutGesture {
  kind: "cut";
  trail: Point[];
}

type Gesture = LinkGesture | CutGesture;

interface CutCandidate {
  linkId: string;
  fraction: number;
  position: Point;
  distance: number;
}

export class GameApp {
  private readonly viewport: CanvasViewport;
  private readonly renderer: CanvasRenderer;
  private readonly input: PointerInput;
  private readonly simulationClock = new FixedStepClock();
  private currentLevelIndex = resolveInitialLevelIndex();
  private currentLevel: LevelDefinition = LEVELS[this.currentLevelIndex];
  private simulation = new GameSimulation(this.currentLevel);
  private readonly storage = new SafeStorage();
  private readonly progress = new CampaignProgress(this.storage);
  private readonly audio = new AudioController(this.storage);
  private readonly platform: PlatformAdapter = createPlatformAdapter();
  private readonly locale: Locale = resolveLocale(navigator.language);
  private readonly hud = new HudController(this.locale);
  private readonly fullscreen: FullscreenController;
  private readonly resizeObserver: ResizeObserver;

  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private focusedSystemId: string | null = null;
  private paused = false;
  private campaignMapOpen = false;
  private pausedBeforeMap = false;
  private tutorialStage = 0;
  private gesture: Gesture | null = null;
  private effects: VisualEffect[] = [];
  private nextEffectId = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.viewport = new CanvasViewport(canvas);
    this.renderer = new CanvasRenderer(this.viewport);
    this.input = new PointerInput(canvas, this.viewport);
    this.fullscreen = new FullscreenController(canvas.closest(".game-shell") ?? canvas);
    this.resizeObserver = new ResizeObserver(() => this.viewport.resize());
  }

  async start(): Promise<void> {
    this.platform.loadingStart();
    await this.platform.initialize();

    this.hud.bind({
      onMapOpen: () => this.openCampaignMap(),
      onMapClose: () => this.closeCampaignMap(),
      onMapSelect: (levelIndex) => this.selectLevel(levelIndex),
      onPauseToggle: () => this.togglePause(),
      onRestart: () => this.restart(),
      onAudioToggle: () => this.toggleAudio(),
      onFullscreenToggle: () => {
        void this.fullscreen.toggle().catch(() => {
          this.hud.setStatusKey("invalid");
        });
      },
      onRetry: () => this.restart(),
      onNext: () => this.nextLevel(),
    });
    this.fullscreen.subscribe((active) => {
      this.hud.setFullscreen(active);
      this.viewport.resize();
    });
    this.hud.setFullscreenSupported(this.fullscreen.isSupported());
    this.hud.setFullscreen(this.fullscreen.isFullscreen());
    this.hud.setAudioEnabled(this.audio.isEnabled());
    this.hud.setElapsedSeconds(0);
    this.hud.setLevel(this.currentLevel);
    this.showOpeningHint();

    this.resizeObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.platform.loadingStop();
    this.platform.gameplayStart();
    this.animationFrameId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.input.dispose();
    this.hud.dispose();
    this.fullscreen.dispose();
    this.resizeObserver.disconnect();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    this.platform.gameplayStop();
  }

  private readonly frame = (currentTime: number): void => {
    const rawDelta =
      this.lastFrameTime === 0
        ? 0
        : (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.processInput();
    if (!this.paused) {
      this.simulationClock.advance(rawDelta, (stepSeconds) => {
        this.simulation.update(stepSeconds);
        this.updateEffects(stepSeconds);
        this.processSimulationEvents();
      });
      this.hud.setElapsedSeconds(this.simulation.elapsedSeconds);
    } else {
      this.simulationClock.reset();
    }

    this.renderer.render(this.snapshot());
    this.animationFrameId = requestAnimationFrame(this.frame);
  };

  private processInput(): void {
    for (const event of this.input.drainEvents()) {
      if (
        this.paused ||
        this.simulation.status !== "playing" ||
        !event.position.insideSafeArea
      ) {
        if (event.kind === "up" || event.kind === "cancel") {
          this.gesture = null;
        }
        continue;
      }

      if (event.kind === "down") {
        void this.audio.unlock();
        const selected = this.findSystemAt(
          event.position.x,
          event.position.y,
        );
        this.focusedSystemId = selected?.id ?? null;
        if (selected?.owner === "player") {
          this.gesture = {
            kind: "link",
            sourceId: selected.id,
            current: event.position,
          };
          this.hud.showSelectedSystem(selected.className);
        } else {
          this.gesture = {
            kind: "cut",
            trail: [event.position],
          };
        }
        continue;
      }

      if (event.kind === "move") {
        this.updateGesture(event.position);
        continue;
      }

      if (event.kind === "up") {
        this.updateGesture(event.position);
        this.finishGesture(event.position);
      } else if (event.kind === "cancel") {
        this.gesture = null;
      }
    }
  }

  private updateGesture(position: Point): void {
    if (this.gesture?.kind === "link") {
      this.gesture.current = position;
    } else if (this.gesture?.kind === "cut") {
      const last = this.gesture.trail.at(-1);
      if (
        !last ||
        Math.hypot(position.x - last.x, position.y - last.y) >=
          CUT_TRAIL_POINT_DISTANCE
      ) {
        this.gesture.trail.push(position);
      }
    }
  }

  private finishGesture(position: Point): void {
    const gesture = this.gesture;
    this.gesture = null;
    if (!gesture) {
      return;
    }

    if (gesture.kind === "link") {
      const target = this.findSystemAt(position.x, position.y);
      if (!target || target.id === gesture.sourceId) {
        this.addEffect("invalid", position);
        this.hud.setStatusKey("invalid");
        return;
      }
      const result = this.simulation.createPlayerLink(
        gesture.sourceId,
        target.id,
      );
      if (!result.ok) {
        this.showLinkError(result.reason);
      }
      return;
    }

    const cut = this.findCutCandidate(gesture.trail);
    if (cut && this.simulation.cutPlayerLink(cut.linkId, cut.fraction)) {
      this.addEffect("cut", cut.position);
    }
  }

  private showLinkError(reason: string | undefined): void {
    const messageKey: StringKey =
      reason === "insufficient-energy"
        ? "insufficient"
        : reason === "duplicate-link"
          ? "duplicate"
          : reason === "link-limit"
            ? "linkLimit"
          : "invalid";
    this.hud.setStatusKey(messageKey);
  }

  private findCutCandidate(trail: readonly Point[]): CutCandidate | null {
    if (trail.length < 2) {
      return null;
    }

    const systems = new Map(
      this.simulation.getSystems().map((system) => [system.id, system]),
    );
    let best: CutCandidate | null = null;
    const links = this.simulation.getLinks();
    for (const link of links) {
      if (link.owner !== "player" || link.state !== "active") {
        continue;
      }
      const source = systems.get(link.sourceId);
      const target = systems.get(link.targetId);
      if (!source || !target) {
        continue;
      }
      const curve = getLinkCurve(
        link,
        source,
        target,
        getLinkLaneOffset(link, links),
      );
      for (let index = 1; index < CUT_SAMPLE_COUNT; index += 1) {
        const fraction = index / CUT_SAMPLE_COUNT;
        const point = pointOnLink(curve, fraction);
        for (let trailIndex = 1; trailIndex < trail.length; trailIndex += 1) {
          const candidateDistance = distanceToSegment(
            point,
            trail[trailIndex - 1],
            trail[trailIndex],
          );
          if (
            candidateDistance <= CUT_DISTANCE &&
            (!best || candidateDistance < best.distance)
          ) {
            best = {
              linkId: link.id,
              fraction,
              position: point,
              distance: candidateDistance,
            };
          }
        }
      }
    }
    return best;
  }

  private findSystemAt(x: number, y: number): StarSystemView | undefined {
    return this.simulation.getSystems().find(
      (system) =>
        Math.hypot(system.position.x - x, system.position.y - y) <=
        systemHitRadius(system.className),
    );
  }

  private processSimulationEvents(): void {
    for (const event of this.simulation.drainEvents()) {
      this.processSimulationEvent(event);
    }
  }

  private processSimulationEvent(event: SimulationEvent): void {
    switch (event.kind) {
      case "link-created":
        if (event.owner === "player") {
          this.audio.play("link");
          if (this.tutorialStage === 0) {
            this.tutorialStage = 1;
            this.hud.setStatusKey("cutHint");
          }
        } else if (
          this.simulation.getSystem(event.targetId)?.owner === "player"
        ) {
          this.hud.setStatusKey("underAttack");
        }
        break;
      case "capture":
        this.audio.play("capture");
        this.addEffect(
          "capture",
          event.position,
          undefined,
          event.owner,
          0.52,
        );
        if (event.owner === "player") {
          if (this.currentLevelIndex === 0 && this.tutorialStage < 2) {
            this.tutorialStage = 1;
            this.hud.setStatusKey("cutHint");
          } else {
            this.tutorialStage = 2;
            this.hud.setStatusKey("battleHint");
          }
        } else if (event.previousOwner === "player") {
          this.hud.setStatusKey("systemLost");
        }
        break;
      case "cut":
        if (event.owner === "player") {
          this.audio.play(event.prominentBoost ? "boost" : "cut");
        }
        if (event.prominentBoost) {
          this.addEffect(
            "boost",
            event.position,
            event.targetPosition,
            event.owner,
            0.58,
          );
        }
        if (event.returnedEnergy > 0.05) {
          this.addEffect(
            "route-recall",
            event.position,
            event.sourcePosition,
            event.owner,
            0.46,
            event.returnedEnergy,
          );
        }
        if (event.forwardEnergy > 0.05) {
          this.addEffect(
            "route-surge",
            event.position,
            event.targetPosition,
            event.owner,
            0.52,
            event.forwardEnergy,
          );
        }
        if (event.owner === "player") {
          this.tutorialStage = 2;
          this.hud.setStatusKey("battleHint");
        }
        break;
      case "invalid":
        this.addEffect("invalid", event.position);
        this.showLinkError(event.reason);
        break;
      case "link-collapsed":
        this.addEffect(
          "cut",
          event.position,
          event.targetPosition,
          event.owner,
          0.36,
        );
        break;
      case "front-broken":
        this.addEffect(
          "front-break",
          event.position,
          event.targetPosition,
          event.owner,
          0.42,
        );
        break;
      case "won": {
        this.audio.play("win");
        this.platform.gameplayStop();
        const stars = this.starRating(event.elapsedSeconds);
        this.progress.recordWin(this.currentLevelIndex, stars);
        this.hud.showResult(
          "won",
          event.elapsedSeconds,
          stars,
          this.currentLevel,
          this.currentLevelIndex < LEVELS.length - 1,
        );
        break;
      }
      case "lost":
        this.audio.play("lose");
        this.platform.gameplayStop();
        this.hud.showResult(
          "lost",
          event.elapsedSeconds,
          0,
          this.currentLevel,
          false,
        );
        break;
    }
  }

  private starRating(elapsedSeconds: number): number {
    if (elapsedSeconds <= this.currentLevel.threeStarSeconds) {
      return 3;
    }
    if (elapsedSeconds <= this.currentLevel.twoStarSeconds) {
      return 2;
    }
    return 1;
  }

  private addEffect(
    kind: VisualEffectKind,
    position: Point,
    targetPosition?: Point,
    owner?: StarSystemView["owner"],
    duration = 0.45,
    strength?: number,
  ): void {
    this.effects.push({
      id: this.nextEffectId++,
      kind,
      position: { ...position },
      targetPosition: targetPosition ? { ...targetPosition } : undefined,
      owner,
      strength,
      age: 0,
      duration,
    });
  }

  private updateEffects(deltaSeconds: number): void {
    for (const effect of this.effects) {
      effect.age += deltaSeconds;
    }
    this.effects = this.effects.filter(
      (effect) => effect.age < effect.duration,
    );
  }

  private togglePause(): void {
    if (this.simulation.status !== "playing") {
      return;
    }
    this.paused = !this.paused;
    this.gesture = null;
    this.simulationClock.reset();
    this.hud.setPaused(this.paused);
    if (this.paused) {
      this.platform.gameplayStop();
    } else {
      this.lastFrameTime = performance.now();
      this.platform.gameplayStart();
      this.restoreTutorialHint();
    }
  }

  private restart(): void {
    this.simulation.reset();
    this.effects = [];
    this.gesture = null;
    this.focusedSystemId = null;
    this.tutorialStage = 0;
    this.paused = false;
    this.campaignMapOpen = false;
    this.pausedBeforeMap = false;
    this.simulationClock.reset();
    this.lastFrameTime = performance.now();
    this.hud.setElapsedSeconds(0);
    this.hud.setPaused(false);
    this.hud.hideCampaignMap();
    this.hud.hideResult();
    this.showOpeningHint();
    this.platform.gameplayStart();
  }

  private nextLevel(): void {
    if (
      this.simulation.status !== "won" ||
      this.currentLevelIndex >= LEVELS.length - 1
    ) {
      return;
    }

    this.loadLevel(this.currentLevelIndex + 1);
  }

  private selectLevel(levelIndex: number): void {
    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= LEVELS.length ||
      !this.progress.isUnlocked(levelIndex)
    ) {
      return;
    }
    this.loadLevel(levelIndex);
  }

  private loadLevel(levelIndex: number): void {
    this.currentLevelIndex = levelIndex;
    this.currentLevel = LEVELS[levelIndex];
    this.simulation = new GameSimulation(this.currentLevel);
    this.effects = [];
    this.gesture = null;
    this.focusedSystemId = null;
    this.tutorialStage = 0;
    this.paused = false;
    this.campaignMapOpen = false;
    this.pausedBeforeMap = false;
    this.simulationClock.reset();
    this.lastFrameTime = performance.now();
    this.hud.setLevel(this.currentLevel);
    this.hud.setElapsedSeconds(0);
    this.hud.setPaused(false);
    this.hud.hideCampaignMap();
    this.hud.hideResult();
    this.showOpeningHint();
    this.platform.gameplayStart();
  }

  private openCampaignMap(): void {
    if (this.campaignMapOpen) {
      return;
    }
    this.campaignMapOpen = true;
    this.pausedBeforeMap = this.paused;
    this.paused = true;
    this.gesture = null;
    this.simulationClock.reset();
    this.platform.gameplayStop();
    this.hud.showCampaignMap(
      this.currentLevelIndex,
      this.progress.snapshot(),
    );
  }

  private closeCampaignMap(): void {
    if (!this.campaignMapOpen) {
      return;
    }
    this.campaignMapOpen = false;
    this.hud.hideCampaignMap();
    this.paused =
      this.pausedBeforeMap || this.simulation.status !== "playing";
    this.pausedBeforeMap = false;
    this.simulationClock.reset();
    if (!this.paused) {
      this.lastFrameTime = performance.now();
      this.platform.gameplayStart();
      this.restoreTutorialHint();
    }
  }

  private restoreTutorialHint(): void {
    if (this.tutorialStage === 0) {
      this.showOpeningHint();
      return;
    }
    this.hud.setStatusKey(
      this.tutorialStage === 1 ? "cutHint" : "battleHint",
    );
  }

  private showOpeningHint(): void {
    this.hud.setStatus(
      localizeLevelText(this.currentLevel.openingHint, this.locale),
    );
  }

  private toggleAudio(): void {
    const enabled = this.audio.toggle();
    this.hud.setAudioEnabled(enabled);
    if (enabled) {
      void this.audio.unlock();
    }
  }

  private readonly handleVisibilityChange = (): void => {
    if (
      document.hidden &&
      !this.paused &&
      this.simulation.status === "playing"
    ) {
      this.paused = true;
      this.gesture = null;
      this.simulationClock.reset();
      this.hud.setPaused(true);
      this.platform.gameplayStop();
    }
  };

  private snapshot(): SceneSnapshot {
    return {
      theme: this.currentLevel.theme,
      systems: this.simulation.getSystems(),
      links: this.simulation.getLinks(),
      elapsedSeconds: this.simulation.elapsedSeconds,
      focusedSystemId: this.focusedSystemId,
      paused: this.paused,
      status: this.simulation.status,
      dragPreview: this.dragPreview(),
      cutTrail:
        this.gesture?.kind === "cut" ? this.gesture.trail : [],
      cutPreview: this.cutPreview(),
      threats: this.simulation.getThreats("player"),
      effects: this.effects,
      tutorialCue: this.tutorialCue(),
    };
  }

  private cutPreview(): CutPreview | null {
    if (this.gesture?.kind !== "cut") {
      return null;
    }
    const candidate = this.findCutCandidate(this.gesture.trail);
    if (!candidate) {
      return null;
    }
    const outcome = this.simulation.previewPlayerCut(
      candidate.linkId,
      candidate.fraction,
    );
    const link = this.simulation
      .getLinks()
      .find((candidateLink) => candidateLink.id === candidate.linkId);
    const source = link
      ? this.simulation.getSystem(link.sourceId)
      : undefined;
    const target = link
      ? this.simulation.getSystem(link.targetId)
      : undefined;
    const reciprocal = link
      ? findHostileReciprocalLink(
          link,
          this.simulation.getLinks(),
        )
      : undefined;
    const surgeTarget =
      link && reciprocal && source && target
        ? pointBetweenSystems(
            source,
            target,
            combatFrontFraction(link, reciprocal),
          )
        : target?.position;
    return outcome && source && target
      ? {
          linkId: candidate.linkId,
          position: candidate.position,
          source: { ...source.position },
          target: { ...(surgeTarget ?? target.position) },
          fraction: candidate.fraction,
          ...outcome,
        }
      : null;
  }

  private tutorialCue(): TutorialCue | null {
    if (
      this.currentLevelIndex !== 0 ||
      this.tutorialStage >= 2 ||
      this.simulation.status !== "playing"
    ) {
      return null;
    }

    const systems = this.simulation.getSystems();
    if (this.tutorialStage === 0) {
      const source = systems.find((system) => system.owner === "player");
      const target = systems.find((system) => system.owner === "neutral");
      return source && target
        ? {
            kind: "connect",
            source: { ...source.position },
            target: { ...target.position },
          }
        : null;
    }

    const link = this.simulation
      .getLinks()
      .find((candidate) =>
        candidate.owner === "player" && candidate.state === "active"
      );
    const source = link
      ? systems.find((system) => system.id === link.sourceId)
      : undefined;
    const target = link
      ? systems.find((system) => system.id === link.targetId)
      : undefined;
    return source && target
      ? {
          kind: "cut",
          source: { ...source.position },
          target: { ...target.position },
        }
      : null;
  }

  private dragPreview(): DragPreview | null {
    if (this.gesture?.kind !== "link") {
      return null;
    }
    const source = this.simulation.getSystem(this.gesture.sourceId);
    if (!source) {
      return null;
    }
    const target = this.findSystemAt(
      this.gesture.current.x,
      this.gesture.current.y,
    );
    return {
      source: source.position,
      current: this.gesture.current,
      targetId: target?.id ?? null,
      valid: Boolean(
        target &&
          target.id !== source.id &&
          this.simulation.canCreatePlayerLink(source.id, target.id),
      ),
    };
  }
}
