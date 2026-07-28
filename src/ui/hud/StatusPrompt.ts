import { requireElement } from "./dom";

export class StatusPrompt {
  private readonly message = requireElement(
    "#status-message",
    HTMLSpanElement,
  );

  setMessage(message: string): void {
    this.message.textContent = message;
  }
}
