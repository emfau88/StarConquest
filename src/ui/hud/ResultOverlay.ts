import type { GameStatus } from "../../core/types";
import {
  localizeLevelText,
  type LevelDefinition,
} from "../../data/levels";
import {
  formatStarLabel,
  translate,
  type Locale,
} from "../../i18n/strings";
import { formatTime, requireElement } from "./dom";

export class ResultOverlay {
  private readonly overlay = requireElement("#result-overlay", HTMLElement);
  private readonly eyebrow = requireElement(
    "#result-eyebrow",
    HTMLSpanElement,
  );
  private readonly title = requireElement("#result-title", HTMLElement);
  private readonly stars = requireElement("#result-stars", HTMLElement);
  private readonly summary = requireElement(
    "#result-summary",
    HTMLParagraphElement,
  );
  private readonly retryButton = requireElement(
    "#retry-button",
    HTMLButtonElement,
  );
  private readonly nextButton = requireElement(
    "#next-button",
    HTMLButtonElement,
  );
  private locale: Locale;
  private currentResult: {
    status: Exclude<GameStatus, "playing">;
    elapsedSeconds: number;
    stars: number;
    level: LevelDefinition;
    hasNextLevel: boolean;
  } | null = null;

  constructor(locale: Locale) {
    this.locale = locale;
    this.setLocale(locale);
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.retryButton.textContent = translate(locale, "retry");
    this.nextButton.textContent = translate(locale, "nextSector");
    if (this.currentResult) {
      this.render(false);
    }
  }

  bind(
    onRetry: () => void,
    onNext: () => void,
    signal: AbortSignal,
  ): void {
    this.retryButton.addEventListener("click", onRetry, { signal });
    this.nextButton.addEventListener("click", onNext, { signal });
  }

  show(
    status: Exclude<GameStatus, "playing">,
    elapsedSeconds: number,
    stars: number,
    level: LevelDefinition,
    hasNextLevel: boolean,
  ): void {
    this.currentResult = {
      status,
      elapsedSeconds,
      stars,
      level,
      hasNextLevel,
    };
    this.render(true);
  }

  private render(focusAction: boolean): void {
    if (!this.currentResult) {
      return;
    }
    const { status, elapsedSeconds, stars, level, hasNextLevel } =
      this.currentResult;
    const won = status === "won";
    this.overlay.classList.toggle("is-won", won);
    this.overlay.classList.toggle("is-lost", !won);
    this.eyebrow.textContent = translate(
      this.locale,
      won ? "wonEyebrow" : "lostEyebrow",
    );
    this.title.textContent = translate(
      this.locale,
      won ? "wonTitle" : "lostTitle",
    );
    this.stars.textContent = won
      ? `${"\u2605".repeat(stars)}${"\u2606".repeat(3 - stars)}`
      : "\u2606\u2606\u2606";
    this.stars.setAttribute(
      "aria-label",
      formatStarLabel(this.locale, won ? stars : 0),
    );
    this.summary.textContent = won
      ? `${localizeLevelText(level.title, this.locale)} ` +
        `${translate(this.locale, "resultSummary")} ${formatTime(elapsedSeconds)}`
      : translate(this.locale, "lostSummary");
    this.nextButton.hidden = !won || !hasNextLevel;
    this.overlay.hidden = false;
    if (focusAction) {
      (won && hasNextLevel ? this.nextButton : this.retryButton).focus({
        preventScroll: true,
      });
    }
  }

  hide(): void {
    this.currentResult = null;
    this.overlay.hidden = true;
  }
}
