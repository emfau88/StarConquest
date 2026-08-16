import { requireElement } from "./dom";

export class StatusPrompt {
  private readonly card = requireElement(
    ".status-card",
    HTMLElement,
  );
  private readonly message = requireElement(
    "#status-message",
    HTMLSpanElement,
  );
  private hideTimer: number | null = null;

  setMessage(message: string, durationMs = 4_200): void {
    this.message.textContent = message;
    this.card.classList.add("is-visible");
    this.card.setAttribute("aria-hidden", "false");
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
    }
    this.hideTimer = window.setTimeout(() => this.hide(), durationMs);
  }

  setIdleMessage(message: string): void {
    if (!this.card.classList.contains("is-visible")) {
      this.message.textContent = message;
    }
  }

  hide(): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.card.classList.remove("is-visible");
    this.card.setAttribute("aria-hidden", "true");
  }

  dispose(): void {
    this.hide();
  }
}
