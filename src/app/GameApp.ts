import { AudioController } from "../audio/AudioController";
import {
  GameSimulation,
  type SimulationEvent,
} from "../core/GameSimulation";
import type {
  DragPreview,
  Point,
  SceneSnapshot,
  StarSystemView,
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
import {
  distanceToSegment,
  getLinkCurve,
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
import { HudController } from "../ui/HudController";

const MAX_DELTA_SECONDS = 0.1;
const CUT_SAMPLE_COUNT = 40;
const CUT_DISTANCE = 34;
const CUT_TRAIL_POINT_DISTANCE = 10;

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
  private currentLevelIndex = 0;
  private currentLevel: LevelDefinition = LEVELS[0];
  private simulation = new GameSimulation(this.currentLevel);
  private readonly storage = new SafeStorage();
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
    const deltaSeconds = Math.min(MAX_DELTA_SECONDS, rawDelta);
    this.lastFrameTime = currentTime;

    this.processInput();
    if (!this.paused) {
      this.simulation.update(deltaSeconds);
      this.updateEffects(deltaSeconds);
      this.processSimulationEvents();
      this.hud.setElapsedSeconds(this.simulation.elapsedSeconds);
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
    for (const link of this.simulation.getLinks()) {
      if (link.owner !== "player" || link.state !== "active") {
        continue;
      }
      const source = systems.get(link.sourceId);
      const target = systems.get(link.targetId);
      if (!source || !target) {
        continue;
      }
      const curve = getLinkCurve(link, source, target);
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
        }
        break;
      case "capture":
        this.audio.play("capture");
        this.addEffect(
          "capture",
          event.position,
          undefined,
          event.owner,
          0.72,
        );
        if (event.owner === "player") {
          this.tutorialStage = 2;
          this.hud.setStatusKey("battleHint");
        }
        break;
      case "cut":
        this.audio.play(event.prominentBoost ? "boost" : "cut");
        if (event.prominentBoost) {
          this.addEffect(
            "boost",
            event.position,
            event.targetPosition,
            "player",
            0.58,
          );
        }
        this.tutorialStage = 2;
        this.hud.setStatusKey("battleHint");
        break;
      case "invalid":
        this.addEffect("invalid", event.position);
        this.showLinkError(event.reason);
        break;
      case "won": {
        this.audio.play("win");
        this.platform.gameplayStop();
        this.hud.showResult(
          "won",
          event.elapsedSeconds,
          this.starRating(event.elapsedSeconds),
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
  ): void {
    this.effects.push({
      id: this.nextEffectId++,
      kind,
      position: { ...position },
      targetPosition: targetPosition ? { ...targetPosition } : undefined,
      owner,
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
      levelIndex >= LEVELS.length
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
    this.platform.gameplayStop();
    this.hud.showCampaignMap(this.currentLevelIndex);
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
      effects: this.effects,
    };
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
