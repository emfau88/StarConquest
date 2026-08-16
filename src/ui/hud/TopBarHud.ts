import {
  localizeLevelText,
  type LevelDefinition,
} from "../../data/levels";
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
  private locale: Locale;
  private level: LevelDefinition | null = null;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    if (this.level) {
      this.setLevel(this.level);
    }
  }

  setLevel(level: LevelDefinition): void {
    this.level = level;
    const displayedDifficulty = Math.max(
      1,
      Math.min(5, level.difficulty),
    );
    const difficulty =
      `${"\u2605".repeat(displayedDifficulty)}` +
      `${"\u2606".repeat(5 - displayedDifficulty)}`;
    this.sector.textContent =
      `${translate(this.locale, "sectorLabel")} ` +
      `${String(level.sector).padStart(2, "0")} · ${difficulty}`;
    this.title.textContent = localizeLevelText(level.title, this.locale);
    this.objective.textContent = localizeLevelText(
      level.objective,
      this.locale,
    );
  }

  setElapsedSeconds(elapsedSeconds: number): void {
    const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
    this.time.dateTime = `PT${wholeSeconds}S`;
    this.time.textContent = formatTime(wholeSeconds);
  }
}
