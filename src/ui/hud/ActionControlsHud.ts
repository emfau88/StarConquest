import { translate, type Locale } from "../../i18n/strings";
import { requireElement } from "./dom";

type HudIconName =
  | "audio-off"
  | "audio-on"
  | "fullscreen-enter"
  | "fullscreen-exit"
  | "pause"
  | "play"
  | "restart";

const iconUrl = (name: HudIconName): string =>
  `${import.meta.env.BASE_URL}assets/ui/${name}.png`;

export interface HudControlActions {
  onMapOpen: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onAudioToggle: () => void;
  onFullscreenToggle: () => void;
}

export class ActionControlsHud {
  private readonly mapButton = requireElement(
    "#map-button",
    HTMLButtonElement,
  );
  private readonly restartButton = requireElement(
    "#restart-button",
    HTMLButtonElement,
  );
  private readonly audioButton = requireElement(
    "#audio-button",
    HTMLButtonElement,
  );
  private readonly fullscreenButton = requireElement(
    "#fullscreen-button",
    HTMLButtonElement,
  );
  private readonly pauseButton = requireElement(
    "#pause-button",
    HTMLButtonElement,
  );
  private readonly restartIcon = requireElement(
    "#restart-icon",
    HTMLImageElement,
  );
  private readonly audioIcon = requireElement(
    "#audio-icon",
    HTMLImageElement,
  );
  private readonly fullscreenIcon = requireElement(
    "#fullscreen-icon",
    HTMLImageElement,
  );
  private readonly pauseIcon = requireElement(
    "#pause-icon",
    HTMLImageElement,
  );
  private readonly restartLabel = requireElement(
    "#restart-label",
    HTMLSpanElement,
  );
  private readonly mapLabel = requireElement(
    "#map-label",
    HTMLSpanElement,
  );
  private readonly audioLabel = requireElement(
    "#audio-label",
    HTMLSpanElement,
  );
  private readonly fullscreenLabel = requireElement(
    "#fullscreen-label",
    HTMLSpanElement,
  );
  private readonly pauseLabel = requireElement(
    "#pause-label",
    HTMLSpanElement,
  );

  constructor(private readonly locale: Locale) {
    this.mapLabel.textContent = translate(locale, "map");
    this.restartLabel.textContent = translate(locale, "restart");
    this.restartIcon.src = iconUrl("restart");
    this.setPaused(false);
    this.setAudioEnabled(true);
    this.setFullscreen(false);
  }

  bind(actions: HudControlActions, signal: AbortSignal): void {
    this.mapButton.addEventListener("click", actions.onMapOpen, {
      signal,
    });
    this.pauseButton.addEventListener("click", actions.onPauseToggle, {
      signal,
    });
    this.restartButton.addEventListener("click", actions.onRestart, {
      signal,
    });
    this.audioButton.addEventListener("click", actions.onAudioToggle, {
      signal,
    });
    this.fullscreenButton.addEventListener(
      "click",
      actions.onFullscreenToggle,
      { signal },
    );
  }

  setPaused(paused: boolean): void {
    this.pauseLabel.textContent = translate(
      this.locale,
      paused ? "resume" : "pause",
    );
    this.pauseIcon.src = iconUrl(paused ? "play" : "pause");
    this.pauseButton.setAttribute("aria-pressed", String(paused));
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioLabel.textContent = translate(
      this.locale,
      enabled ? "audioOn" : "audioOff",
    );
    this.audioIcon.src = iconUrl(enabled ? "audio-on" : "audio-off");
    this.audioButton.setAttribute("aria-pressed", String(enabled));
  }

  setFullscreenSupported(supported: boolean): void {
    this.fullscreenButton.classList.toggle("is-unsupported", !supported);
  }

  setFullscreen(active: boolean): void {
    this.fullscreenLabel.textContent = translate(
      this.locale,
      active ? "exitFullscreen" : "fullscreen",
    );
    this.fullscreenIcon.src = iconUrl(
      active ? "fullscreen-exit" : "fullscreen-enter",
    );
    this.fullscreenButton.setAttribute("aria-pressed", String(active));
  }
}
