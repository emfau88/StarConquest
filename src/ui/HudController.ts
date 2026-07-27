import type { GameStatus } from "../core/types";
import {
  translate,
  type Locale,
  type StringKey,
} from "../i18n/strings";

export interface HudActions {
  onPauseToggle: () => void;
  onRestart: () => void;
  onAudioToggle: () => void;
  onFullscreenToggle: () => void;
  onRetry: () => void;
}

const requireElement = <T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T => {
  const element = document.querySelector(selector);
  if (!(element instanceof constructor)) {
    throw new Error(`Required UI element is missing: ${selector}`);
  }
  return element;
};

const formatTime = (elapsedSeconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export class HudController {
  private readonly sector = requireElement("#hud-sector", HTMLSpanElement);
  private readonly title = requireElement("#hud-title", HTMLElement);
  private readonly objective = requireElement(
    "#hud-objective",
    HTMLParagraphElement,
  );
  private readonly time = requireElement("#hud-time", HTMLTimeElement);
  private readonly status = requireElement("#status-message", HTMLSpanElement);
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
  private readonly resultOverlay = requireElement(
    "#result-overlay",
    HTMLElement,
  );
  private readonly resultEyebrow = requireElement(
    "#result-eyebrow",
    HTMLSpanElement,
  );
  private readonly resultTitle = requireElement("#result-title", HTMLElement);
  private readonly resultStars = requireElement("#result-stars", HTMLElement);
  private readonly resultSummary = requireElement(
    "#result-summary",
    HTMLParagraphElement,
  );
  private readonly retryButton = requireElement(
    "#retry-button",
    HTMLButtonElement,
  );

  constructor(private readonly locale: Locale) {
    this.sector.textContent = translate(locale, "sector");
    this.title.textContent = translate(locale, "title");
    this.objective.textContent = translate(locale, "objective");
    this.restartButton.textContent = translate(locale, "restart");
    this.retryButton.textContent = translate(locale, "retry");
    this.setStatusKey("connectHint");
  }

  bind(actions: HudActions): void {
    this.pauseButton.addEventListener("click", actions.onPauseToggle);
    this.restartButton.addEventListener("click", actions.onRestart);
    this.audioButton.addEventListener("click", actions.onAudioToggle);
    this.fullscreenButton.addEventListener(
      "click",
      actions.onFullscreenToggle,
    );
    this.retryButton.addEventListener("click", actions.onRetry);
  }

  setElapsedSeconds(elapsedSeconds: number): void {
    const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
    this.time.dateTime = `PT${wholeSeconds}S`;
    this.time.textContent = formatTime(wholeSeconds);
  }

  setPaused(paused: boolean): void {
    this.pauseButton.textContent = translate(
      this.locale,
      paused ? "resume" : "pause",
    );
    this.pauseButton.dataset.icon = paused ? "▶" : "Ⅱ";
    this.pauseButton.setAttribute("aria-pressed", String(paused));
    if (paused) {
      this.setStatusKey("paused");
    }
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioButton.textContent = translate(
      this.locale,
      enabled ? "audioOn" : "audioOff",
    );
    this.audioButton.dataset.icon = enabled ? "♪" : "×";
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
    this.fullscreenButton.dataset.icon = active ? "↙" : "⛶";
    this.fullscreenButton.setAttribute("aria-pressed", String(active));
  }

  setStatus(message: string): void {
    this.status.textContent = message;
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
  ): void {
    const won = status === "won";
    this.resultEyebrow.textContent = translate(
      this.locale,
      won ? "wonEyebrow" : "lostEyebrow",
    );
    this.resultTitle.textContent = translate(
      this.locale,
      won ? "wonTitle" : "lostTitle",
    );
    this.resultStars.textContent = won
      ? `${"★".repeat(stars)}${"☆".repeat(3 - stars)}`
      : "☆☆☆";
    this.resultStars.setAttribute(
      "aria-label",
      `${won ? stars : 0} ${won && stars === 1 ? "star" : "stars"}`,
    );
    this.resultSummary.textContent = won
      ? `${translate(this.locale, "resultSummary")} ${formatTime(elapsedSeconds)}`
      : translate(this.locale, "battleHint");
    this.resultOverlay.hidden = false;
  }

  hideResult(): void {
    this.resultOverlay.hidden = true;
  }
}
