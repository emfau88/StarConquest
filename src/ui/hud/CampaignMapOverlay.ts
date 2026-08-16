import type { Owner, SystemClass } from "../../core/types";
import {
  LEVELS,
  localizeLevelText,
  type LevelDefinition,
} from "../../data/levels";
import { translate, type Locale } from "../../i18n/strings";
import type { CampaignProgressSnapshot } from "../../storage/CampaignProgress";
import { requireElement } from "./dom";

type ProgressionIconName = "completed" | "locked" | "star";

interface CampaignNodeView {
  readonly button: HTMLButtonElement;
  readonly name: HTMLSpanElement;
  readonly state: HTMLSpanElement;
  readonly statusIcon: HTMLImageElement;
  readonly stars: HTMLSpanElement;
  readonly starIcons: readonly HTMLImageElement[];
  baseLabel: string;
}

const progressionIconUrl = (name: ProgressionIconName): string =>
  `${import.meta.env.BASE_URL}assets/progression/${name}.png`;

const PREVIEW_COLORS: Readonly<Record<Owner, string>> = {
  player: "#57d9ff",
  enemy: "#ff6b70",
  enemy2: "#ffb44f",
  neutral: "#c3d2e2",
};

const PREVIEW_RADII: Readonly<Record<SystemClass, number>> = {
  PULSAR: 7,
  GIANT: 9,
  QUASAR: 11,
  NEXUS: 13,
};

export class CampaignMapOverlay {
  private readonly overlay = requireElement("#campaign-map", HTMLElement);
  private readonly closeButton = requireElement(
    "#campaign-map-close",
    HTMLButtonElement,
  );
  private readonly eyebrow = requireElement(
    "#campaign-map-eyebrow",
    HTMLSpanElement,
  );
  private readonly title = requireElement(
    "#campaign-map-title",
    HTMLHeadingElement,
  );
  private readonly atlasEyebrow = requireElement(
    "#campaign-atlas-eyebrow",
    HTMLSpanElement,
  );
  private readonly atlasTitle = requireElement(
    "#campaign-atlas-title",
    HTMLHeadingElement,
  );
  private readonly progressLabel = requireElement(
    "#campaign-progress-label",
    HTMLSpanElement,
  );
  private readonly progressValue = requireElement(
    "#campaign-progress-value",
    HTMLElement,
  );
  private readonly progressFill = requireElement(
    "#campaign-progress-fill",
    HTMLSpanElement,
  );
  private readonly starsValue = requireElement(
    "#campaign-stars-value",
    HTMLSpanElement,
  );
  private readonly detailSector = requireElement(
    "#campaign-detail-sector",
    HTMLSpanElement,
  );
  private readonly detailState = requireElement(
    "#campaign-detail-state",
    HTMLSpanElement,
  );
  private readonly detailTitle = requireElement(
    "#campaign-detail-title",
    HTMLHeadingElement,
  );
  private readonly detailObjectiveLabel = requireElement(
    "#campaign-detail-objective-label",
    HTMLSpanElement,
  );
  private readonly detailObjective = requireElement(
    "#campaign-detail-objective",
    HTMLParagraphElement,
  );
  private readonly detailDifficulty = requireElement(
    "#campaign-detail-difficulty",
    HTMLSpanElement,
  );
  private readonly detailStars = requireElement(
    "#campaign-detail-stars",
    HTMLSpanElement,
  );
  private readonly startButton = requireElement(
    "#campaign-start-button",
    HTMLButtonElement,
  );
  private readonly preview = requireElement(
    "#campaign-level-preview",
    HTMLCanvasElement,
  );
  private readonly artwork = requireElement(
    ".campaign-map__art",
    HTMLImageElement,
  );
  private readonly nodes = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-level-index]"),
  );
  private readonly nodeViews: CampaignNodeView[];
  private locale: Locale;
  private currentLevelIndex = 0;
  private selectedLevelIndex = 0;
  private progress: CampaignProgressSnapshot | null = null;

  constructor(locale: Locale) {
    this.locale = locale;
    if (this.nodes.length !== LEVELS.length) {
      throw new Error("Campaign atlas tiles do not match the level count");
    }

    this.nodeViews = this.nodes.map((button, index) => {
      const name = button.querySelector(".campaign-map__name");
      const number = button.querySelector(".campaign-map__number");
      const state = button.querySelector(".campaign-map__node-state");
      if (
        !(name instanceof HTMLSpanElement) ||
        !(number instanceof HTMLSpanElement) ||
        !(state instanceof HTMLSpanElement)
      ) {
        throw new Error(`Campaign atlas tile ${index + 1} is incomplete`);
      }

      number.textContent = String(LEVELS[index].sector).padStart(2, "0");
      const statusIcon = new Image();
      statusIcon.className = "campaign-map__status-icon";
      statusIcon.alt = "";
      statusIcon.setAttribute("aria-hidden", "true");
      const stars = document.createElement("span");
      stars.className = "campaign-map__stars";
      stars.setAttribute("aria-hidden", "true");
      const starIcons = Array.from({ length: 3 }, () => {
        const star = new Image();
        star.src = progressionIconUrl("star");
        star.alt = "";
        stars.append(star);
        return star;
      });
      button.append(statusIcon, stars);
      return {
        button,
        name,
        state,
        statusIcon,
        stars,
        starIcons,
        baseLabel: "",
      };
    });
    this.renderLocale();
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.renderLocale();
    this.renderProgress();
  }

  bind(
    onSelect: (levelIndex: number) => void,
    onClose: () => void,
    signal: AbortSignal,
  ): void {
    this.closeButton.addEventListener("click", onClose, { signal });
    this.startButton.addEventListener(
      "click",
      () => onSelect(this.selectedLevelIndex),
      { signal },
    );
    this.nodeViews.forEach(({ button }, index) => {
      button.addEventListener("click", () => this.select(index), { signal });
    });
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && !this.overlay.hidden) {
          onClose();
        }
      },
      { signal },
    );
  }

  show(
    currentLevelIndex: number,
    progress: CampaignProgressSnapshot,
  ): void {
    if (!this.artwork.hasAttribute("src")) {
      const source = this.artwork.dataset.src;
      if (source) {
        this.artwork.src = source;
      }
    }
    this.currentLevelIndex = currentLevelIndex;
    this.selectedLevelIndex = currentLevelIndex;
    this.progress = progress;
    this.overlay.hidden = false;
    this.renderProgress();
    this.nodeViews[currentLevelIndex].button.focus({ preventScroll: true });
  }

  hide(): void {
    this.overlay.hidden = true;
  }

  private select(levelIndex: number): void {
    this.selectedLevelIndex = levelIndex;
    this.renderProgress();
  }

  private renderLocale(): void {
    this.eyebrow.textContent = translate(this.locale, "campaign");
    this.title.textContent = translate(this.locale, "campaignMapTitle");
    this.closeButton.textContent = translate(this.locale, "closeMap");
    this.atlasEyebrow.textContent = translate(
      this.locale,
      "campaignAtlasEyebrow",
    );
    this.atlasTitle.textContent = translate(this.locale, "selectSector");
    this.progressLabel.textContent = translate(
      this.locale,
      "campaignProgress",
    );
    this.detailObjectiveLabel.textContent = translate(
      this.locale,
      "missionLabel",
    );
    this.startButton.textContent = translate(this.locale, "startMission");
    this.preview.setAttribute(
      "aria-label",
      translate(this.locale, "sectorPreview"),
    );
    requireElement(".campaign-map__nodes", HTMLElement).setAttribute(
      "aria-label",
      translate(this.locale, "campaignSectors"),
    );
    this.nodeViews.forEach((view, index) => {
      const level = LEVELS[index];
      const localizedTitle = localizeLevelText(level.title, this.locale);
      view.name.textContent = localizedTitle;
      view.baseLabel =
        `${translate(this.locale, "sectorLabel")} ${level.sector}: ` +
        localizedTitle;
    });
  }

  private renderProgress(): void {
    const progress = this.progress;
    if (!progress) {
      return;
    }
    const completed = progress.bestStars.filter((stars) => stars > 0).length;
    const totalStars = progress.bestStars.reduce((sum, stars) => sum + stars, 0);
    this.progressValue.textContent =
      `${completed} / ${LEVELS.length} ${translate(this.locale, "secured")}`;
    this.progressFill.style.width = `${completed / LEVELS.length * 100}%`;
    this.starsValue.textContent =
      `${totalStars} / ${LEVELS.length * 3} ${translate(this.locale, "stars")}`;

    this.nodeViews.forEach((view, index) => {
      const isCurrent = index === this.currentLevelIndex;
      const isSelected = index === this.selectedLevelIndex;
      const isUnlocked = index <= progress.unlockedThrough;
      const bestStars = Math.max(0, Math.min(3, progress.bestStars[index] ?? 0));
      const isCompleted = bestStars > 0;
      const state = !isUnlocked
        ? translate(this.locale, "locked")
        : isCompleted
          ? translate(this.locale, "completed")
          : translate(this.locale, "available");

      view.button.classList.toggle("is-current", isCurrent);
      view.button.classList.toggle("is-selected", isSelected);
      view.button.classList.toggle("is-locked", !isUnlocked);
      view.button.classList.toggle("is-completed", isCompleted);
      view.button.setAttribute("aria-disabled", String(!isUnlocked));
      view.state.textContent = state;
      view.statusIcon.hidden = isUnlocked && !isCompleted;
      view.statusIcon.src = progressionIconUrl(
        isUnlocked ? "completed" : "locked",
      );
      view.stars.hidden = !isCompleted;
      view.starIcons.forEach((star, starIndex) => {
        star.classList.toggle("is-earned", starIndex < bestStars);
      });
      view.button.setAttribute("aria-label", `${view.baseLabel}, ${state}`);
      if (isCurrent) {
        view.button.setAttribute("aria-current", "step");
      } else {
        view.button.removeAttribute("aria-current");
      }
    });
    this.renderDetail(LEVELS[this.selectedLevelIndex], progress);
  }

  private renderDetail(
    level: LevelDefinition,
    progress: CampaignProgressSnapshot,
  ): void {
    const levelIndex = this.selectedLevelIndex;
    const isUnlocked = levelIndex <= progress.unlockedThrough;
    const bestStars = Math.max(0, Math.min(3, progress.bestStars[levelIndex] ?? 0));
    const state = !isUnlocked
      ? translate(this.locale, "locked")
      : bestStars > 0
        ? translate(this.locale, "completed")
        : translate(this.locale, "available");
    this.detailSector.textContent =
      `${translate(this.locale, "sectorLabel")} ` +
      `${String(level.sector).padStart(2, "0")} / ` +
      `${String(LEVELS.length).padStart(2, "0")}`;
    this.detailState.textContent = state;
    this.detailTitle.textContent = localizeLevelText(level.title, this.locale);
    this.detailObjective.textContent = localizeLevelText(
      level.objective,
      this.locale,
    );
    this.detailDifficulty.textContent =
      `${translate(this.locale, "difficulty")} ${level.difficulty} / ` +
      `${LEVELS.length}`;
    this.detailStars.textContent = bestStars > 0
      ? `${"★".repeat(bestStars)}${"☆".repeat(3 - bestStars)}`
      : translate(this.locale, "noRating");
    this.startButton.disabled = !isUnlocked;
    this.startButton.textContent = translate(
      this.locale,
      bestStars > 0 ? "playAgain" : "startMission",
    );
    this.drawPreview(level);
  }

  private drawPreview(level: LevelDefinition): void {
    const bounds = this.preview.getBoundingClientRect();
    const width = Math.max(280, Math.round(bounds.width));
    const height = Math.max(130, Math.round(bounds.height));
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.preview.width = width * ratio;
    this.preview.height = height * ratio;
    const context = this.preview.getContext("2d");
    if (!context) {
      return;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(5, 25, 66, 0.96)");
    gradient.addColorStop(1, "rgba(13, 44, 91, 0.82)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    const scaleX = (width - 40) / 1600;
    const scaleY = (height - 28) / 940;
    for (const system of level.systems) {
      const x = 20 + system.position.x * scaleX;
      const y = 14 + system.position.y * scaleY;
      const radius = PREVIEW_RADII[system.className];
      const color = PREVIEW_COLORS[system.owner];
      context.save();
      context.shadowColor = color;
      context.shadowBlur = radius * 1.8;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "rgba(235, 250, 255, 0.82)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(x, y, radius + 4, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
  }
}
