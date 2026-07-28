import { translate, type Locale } from "../../i18n/strings";
import { requireElement } from "./dom";

export interface HudControlActions {
  onPauseToggle: () => void;
  onRestart: () => void;
  onAudioToggle: () => void;
  onFullscreenToggle: () => void;
}

export class ActionControlsHud {
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

  constructor(private readonly locale: Locale) {
    this.restartButton.textContent = translate(locale, "restart");
  }

  bind(actions: HudControlActions, signal: AbortSignal): void {
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
    this.pauseButton.textContent = translate(
      this.locale,
      paused ? "resume" : "pause",
    );
    this.pauseButton.dataset.icon = paused ? "\u25b6" : "\u2161";
    this.pauseButton.setAttribute("aria-pressed", String(paused));
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioButton.textContent = translate(
      this.locale,
      enabled ? "audioOn" : "audioOff",
    );
    this.audioButton.dataset.icon = enabled ? "\u266a" : "\u00d7";
    this.audioButton.setAttribute("aria-pressed", String(enabled));
  }

  setFullscreenSupported(supported: boolean): void {
    this.fullscreenButton.classList.toggle("is-unsupported", !supported);
  }

  setFullscreen(active: boolean): void {
    this.fullscreenButton.textContent = translate(
      this.locale,
      active ? "exitFullscreen" : "fullscreen",
    );
    this.fullscreenButton.dataset.icon = active ? "\u2199" : "\u26f6";
    this.fullscreenButton.setAttribute("aria-pressed", String(active));
  }
}
