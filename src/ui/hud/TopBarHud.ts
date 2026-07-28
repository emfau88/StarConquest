import { translate, type Locale } from "../../i18n/strings";
import { formatTime, requireElement } from "./dom";

export class TopBarHud {
  private readonly sector = requireElement("#hud-sector", HTMLSpanElement);
  private readonly title = requireElement("#hud-title", HTMLElement);
  private readonly objective = requireElement(
    "#hud-objective",
    HTMLParagraphElement,
  );
  private readonly time = requireElement("#hud-time", HTMLTimeElement);

  constructor(locale: Locale) {
    this.sector.textContent = translate(locale, "sector");
    this.title.textContent = translate(locale, "title");
    this.objective.textContent = translate(locale, "objective");
  }

  setElapsedSeconds(elapsedSeconds: number): void {
    const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
    this.time.dateTime = `PT${wholeSeconds}S`;
    this.time.textContent = formatTime(wholeSeconds);
  }
}
