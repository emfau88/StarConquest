import type { GameStatus } from "../core/types";
import type { LevelDefinition } from "../data/levels";
import {
  translate,
  type Locale,
  type StringKey,
} from "../i18n/strings";
import type { CampaignProgressSnapshot } from "../storage/CampaignProgress";
import { ActionControlsHud } from "./hud/ActionControlsHud";
import { CampaignMapOverlay } from "./hud/CampaignMapOverlay";
import { MissionLaunchOverlay } from "./hud/MissionLaunchOverlay";
import { ResultOverlay } from "./hud/ResultOverlay";
import { StatusPrompt } from "./hud/StatusPrompt";
import { TopBarHud } from "./hud/TopBarHud";

export interface HudActions {
  onMapOpen: () => void;
  onMapClose: () => void;
  onMapSelect: (levelIndex: number) => void;
  onMissionStart: () => void;
  onLanguageToggle: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onMusicToggle: () => void;
  onSfxToggle: () => void;
  onFullscreenToggle: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export class HudController {
  private readonly topBar: TopBarHud;
  private readonly controls: ActionControlsHud;
  private readonly campaignMap: CampaignMapOverlay;
  private readonly launch: MissionLaunchOverlay;
  private readonly status: StatusPrompt;
  private readonly result: ResultOverlay;
  private bindings = new AbortController();
  private locale: Locale;

  constructor(locale: Locale) {
    this.locale = locale;
    this.topBar = new TopBarHud(locale);
    this.controls = new ActionControlsHud(locale);
    this.campaignMap = new CampaignMapOverlay(locale);
    this.launch = new MissionLaunchOverlay(locale);
    this.status = new StatusPrompt();
    this.status.setIdleMessage(translate(locale, "connectHint"));
    this.result = new ResultOverlay(locale);
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.topBar.setLocale(locale);
    this.controls.setLocale(locale);
    this.campaignMap.setLocale(locale);
    this.launch.setLocale(locale);
    this.status.setIdleMessage(translate(locale, "connectHint"));
    this.result.setLocale(locale);
  }

  bind(actions: HudActions): void {
    this.bindings.abort();
    this.bindings = new AbortController();
    this.controls.bind(actions, this.bindings.signal);
    this.launch.bind(
      actions.onMissionStart,
      actions.onMapOpen,
      actions.onLanguageToggle,
      this.bindings.signal,
    );
    this.campaignMap.bind(
      actions.onMapSelect,
      actions.onMapClose,
      this.bindings.signal,
    );
    this.result.bind(
      actions.onRetry,
      actions.onNext,
      this.bindings.signal,
    );
  }

  dispose(): void {
    this.bindings.abort();
    this.status.dispose();
  }

  setElapsedSeconds(elapsedSeconds: number): void {
    this.topBar.setElapsedSeconds(elapsedSeconds);
  }

  setLevel(level: LevelDefinition): void {
    this.topBar.setLevel(level);
  }

  setPaused(paused: boolean): void {
    this.controls.setPaused(paused);
    if (paused) {
      this.setStatusKey("paused");
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.controls.setMusicEnabled(enabled);
  }

  setSfxEnabled(enabled: boolean): void {
    this.controls.setSfxEnabled(enabled);
  }

  setFullscreenSupported(supported: boolean): void {
    this.controls.setFullscreenSupported(supported);
  }

  setFullscreen(active: boolean): void {
    this.controls.setFullscreen(active);
  }

  setStatus(message: string): void {
    this.status.setMessage(message);
  }

  hideStatus(): void {
    this.status.hide();
  }

  showLoading(): void {
    this.launch.showLoading();
  }

  setLoadingProgress(progress: number): void {
    this.launch.setLoadingProgress(progress);
  }

  showMissionBriefing(
    level: LevelDefinition,
    progress: CampaignProgressSnapshot,
  ): void {
    this.launch.showBriefing(level, progress);
  }

  hideMissionBriefing(): void {
    this.launch.hide();
  }

  setStatusKey(key: StringKey): void {
    this.setStatus(translate(this.locale, key));
  }

  showSelectedSystem(className: string): void {
    this.setStatus(`${translate(this.locale, "selected")}: ${className}`);
  }

  showResult(
    status: Exclude<GameStatus, "playing">,
    elapsedSeconds: number,
    stars: number,
    level: LevelDefinition,
    hasNextLevel: boolean,
  ): void {
    this.result.show(
      status,
      elapsedSeconds,
      stars,
      level,
      hasNextLevel,
    );
  }

  hideResult(): void {
    this.result.hide();
  }

  showCampaignMap(
    currentLevelIndex: number,
    progress: CampaignProgressSnapshot,
  ): void {
    this.campaignMap.show(currentLevelIndex, progress);
  }

  hideCampaignMap(): void {
    this.campaignMap.hide();
  }
}
