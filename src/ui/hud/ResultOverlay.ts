import type { GameStatus } from "../../core/types";
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

  constructor(private readonly locale: Locale) {
    this.retryButton.textContent = translate(locale, "retry");
  }

  bind(onRetry: () => void, signal: AbortSignal): void {
    this.retryButton.addEventListener("click", onRetry, { signal });
  }

  show(
    status: Exclude<GameStatus, "playing">,
    elapsedSeconds: number,
    stars: number,
  ): void {
    const won = status === "won";
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
      ? `${translate(this.locale, "resultSummary")} ${formatTime(elapsedSeconds)}`
      : translate(this.locale, "battleHint");
    this.overlay.hidden = false;
  }

  hide(): void {
    this.overlay.hidden = true;
  }
}
