import {
  LEVELS,
  localizeLevelText,
} from "../../data/levels";
import {
  translate,
  type Locale,
} from "../../i18n/strings";
import type { CampaignProgressSnapshot } from "../../storage/CampaignProgress";
import { requireElement } from "./dom";

type ProgressionIconName = "completed" | "locked" | "star";

interface CampaignNodeView {
  readonly button: HTMLButtonElement;
  readonly name: HTMLSpanElement;
  baseLabel: string;
  readonly statusIcon: HTMLImageElement;
  readonly stars: HTMLSpanElement;
  readonly starIcons: readonly HTMLImageElement[];
}

const progressionIconUrl = (name: ProgressionIconName): string =>
  `${import.meta.env.BASE_URL}assets/progression/${name}.png`;

export class CampaignMapOverlay {
  private readonly overlay = requireElement(
    "#campaign-map",
    HTMLElement,
  );
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
  private progress: CampaignProgressSnapshot | null = null;

  constructor(locale: Locale) {
    this.locale = locale;
    if (this.nodes.length !== LEVELS.length) {
      throw new Error("Campaign map nodes do not match the level count");
    }

    this.eyebrow.textContent = translate(locale, "campaign");
    this.title.textContent = translate(locale, "campaignMapTitle");
    this.closeButton.textContent = translate(locale, "closeMap");
    requireElement(
      ".campaign-map__nodes",
      HTMLElement,
    ).setAttribute(
      "aria-label",
      translate(locale, "campaignSectors"),
    );

    this.nodeViews = this.nodes.map((node, index) => {
      const level = LEVELS[index];
      const name = node.querySelector(".campaign-map__name");
      const number = node.querySelector(".campaign-map__number");
      if (
        !(name instanceof HTMLSpanElement) ||
        !(number instanceof HTMLSpanElement)
      ) {
        throw new Error(`Campaign map node ${index + 1} is incomplete`);
      }
      const localizedTitle = localizeLevelText(level.title, locale);
      const baseLabel =
        `${translate(locale, "sectorLabel")} ${level.sector}: ${localizedTitle}`;
      name.textContent = localizedTitle;
      number.textContent = String(level.sector).padStart(2, "0");
      node.setAttribute("aria-label", baseLabel);

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
      node.append(statusIcon, stars);
      return {
        button: node,
        name,
        baseLabel,
        statusIcon,
        stars,
        starIcons,
      };
    });
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.eyebrow.textContent = translate(locale, "campaign");
    this.title.textContent = translate(locale, "campaignMapTitle");
    this.closeButton.textContent = translate(locale, "closeMap");
    requireElement(
      ".campaign-map__nodes",
      HTMLElement,
    ).setAttribute(
      "aria-label",
      translate(locale, "campaignSectors"),
    );
    this.nodeViews.forEach((view, index) => {
      const level = LEVELS[index];
      const localizedTitle = localizeLevelText(level.title, locale);
      view.name.textContent = localizedTitle;
      view.baseLabel =
        `${translate(locale, "sectorLabel")} ${level.sector}: ${localizedTitle}`;
    });
    this.renderProgress();
  }

  bind(
    onSelect: (levelIndex: number) => void,
    onClose: () => void,
    signal: AbortSignal,
  ): void {
    this.closeButton.addEventListener("click", onClose, { signal });
    this.nodeViews.forEach(({ button }, index) => {
      button.addEventListener("click", () => onSelect(index), { signal });
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
    this.progress = progress;
    this.renderProgress();
    this.overlay.hidden = false;
    this.closeButton.focus({ preventScroll: true });
  }

  private renderProgress(): void {
    const progress = this.progress;
    if (!progress) {
      return;
    }
    this.nodeViews.forEach((view, index) => {
      const { button, statusIcon, stars, starIcons } = view;
      const isCurrent = index === this.currentLevelIndex;
      const isUnlocked = index <= progress.unlockedThrough;
      const bestStars = Math.max(
        0,
        Math.min(3, progress.bestStars[index] ?? 0),
      );
      const isCompleted = bestStars > 0;

      button.disabled = !isUnlocked;
      button.classList.toggle("is-current", isCurrent);
      button.classList.toggle("is-locked", !isUnlocked);
      button.classList.toggle("is-completed", isCompleted);
      if (isCurrent) {
        button.setAttribute("aria-current", "step");
      } else {
        button.removeAttribute("aria-current");
      }

      statusIcon.hidden = isUnlocked && !isCompleted;
      statusIcon.src = progressionIconUrl(
        isUnlocked ? "completed" : "locked",
      );
      stars.hidden = !isCompleted;
      starIcons.forEach((star, starIndex) => {
        star.classList.toggle("is-earned", starIndex < bestStars);
      });

      const state = !isUnlocked
        ? translate(this.locale, "locked")
        : isCompleted
          ? `${translate(this.locale, "completed")}, ${bestStars} ${translate(this.locale, "stars")}`
          : translate(this.locale, "available");
      button.setAttribute("aria-label", `${view.baseLabel}, ${state}`);
    });
  }

  hide(): void {
    this.overlay.hidden = true;
  }
}
