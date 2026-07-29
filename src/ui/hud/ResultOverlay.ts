import type { GameStatus } from "../../core/types";
import {
  localizeLevelText,
  type LevelDefinition,
} from "../../data/levels";
import { translate, type Locale } from "../../i18n/strings";
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

  constructor(private readonly locale: Locale) {
    this.retryButton.textContent = translate(locale, "retry");
    this.nextButton.textContent = translate(locale, "nextSector");
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
      `${won ? stars : 0} ${won && stars === 1 ? "star" : "stars"}`,
    );
    this.summary.textContent = won
      ? `${localizeLevelText(level.title, this.locale)} ` +
        `${translate(this.locale, "resultSummary")} ${formatTime(elapsedSeconds)}`
      : translate(this.locale, "lostSummary");
    this.nextButton.hidden = !won || !hasNextLevel;
    this.overlay.hidden = false;
    (won && hasNextLevel ? this.nextButton : this.retryButton).focus({
      preventScroll: true,
    });
  }

  hide(): void {
    this.overlay.hidden = true;
  }
}
