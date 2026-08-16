import {
  LEVELS,
  localizeLevelText,
  type LevelDefinition,
} from "../../data/levels";
import { translate, type Locale } from "../../i18n/strings";
import type { CampaignProgressSnapshot } from "../../storage/CampaignProgress";
import { requireElement } from "./dom";

interface BriefingState {
  readonly level: LevelDefinition;
  readonly progress: CampaignProgressSnapshot;
}

export class MissionLaunchOverlay {
  private readonly overlay = requireElement("#launch-overlay", HTMLElement);
  private readonly loadingPanel = requireElement(
    "#launch-loading-panel",
    HTMLElement,
  );
  private readonly briefingPanel = requireElement(
    "#launch-briefing-panel",
    HTMLElement,
  );
  private readonly loadingEyebrow = requireElement(
    "#launch-loading-eyebrow",
    HTMLSpanElement,
  );
  private readonly loadingTitle = requireElement(
    "#launch-title",
    HTMLHeadingElement,
  );
  private readonly loadingDescription = requireElement(
    "#launch-description",
    HTMLParagraphElement,
  );
  private readonly progressBar = requireElement(
    "#launch-progress",
    HTMLElement,
  );
  private readonly progressFill = requireElement(
    "#launch-progress-fill",
    HTMLSpanElement,
  );
  private readonly progressValue = requireElement(
    "#launch-progress-value",
    HTMLSpanElement,
  );
  private readonly briefingEyebrow = requireElement(
    "#launch-briefing-eyebrow",
    HTMLSpanElement,
  );
  private readonly sector = requireElement(
    "#launch-sector",
    HTMLSpanElement,
  );
  private readonly levelTitle = requireElement(
    "#launch-level-title",
    HTMLHeadingElement,
  );
  private readonly objectiveLabel = requireElement(
    "#launch-objective-label",
    HTMLSpanElement,
  );
  private readonly objective = requireElement(
    "#launch-objective",
    HTMLParagraphElement,
  );
  private readonly campaignLabel = requireElement(
    "#launch-campaign-label",
    HTMLSpanElement,
  );
  private readonly campaignValue = requireElement(
    "#launch-campaign-value",
    HTMLElement,
  );
  private readonly startButton = requireElement(
    "#launch-start-button",
    HTMLButtonElement,
  );
  private readonly mapButton = requireElement(
    "#launch-map-button",
    HTMLButtonElement,
  );
  private readonly languageButton = requireElement(
    "#launch-language-button",
    HTMLButtonElement,
  );
  private readonly languageLabel = requireElement(
    "#launch-language-label",
    HTMLSpanElement,
  );
  private locale: Locale;
  private briefing: BriefingState | null = null;

  constructor(locale: Locale) {
    this.locale = locale;
    this.renderLocale();
    this.showLoading();
  }

  bind(
    onStart: () => void,
    onMapOpen: () => void,
    onLanguageToggle: () => void,
    signal: AbortSignal,
  ): void {
    this.startButton.addEventListener("click", onStart, { signal });
    this.mapButton.addEventListener("click", onMapOpen, { signal });
    this.languageButton.addEventListener("click", onLanguageToggle, { signal });
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.renderLocale();
    if (this.briefing) {
      this.renderBriefing(this.briefing);
    }
  }

  showLoading(): void {
    this.briefing = null;
    this.overlay.hidden = false;
    this.overlay.classList.remove("is-ready");
    this.loadingPanel.hidden = false;
    this.briefingPanel.hidden = true;
    this.setLoadingProgress(0);
  }

  setLoadingProgress(progress: number): void {
    const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
    this.progressFill.style.width = `${percent}%`;
    this.progressValue.textContent = `${percent}%`;
    this.progressBar.setAttribute("aria-valuenow", String(percent));
  }

  showBriefing(
    level: LevelDefinition,
    progress: CampaignProgressSnapshot,
  ): void {
    this.briefing = { level, progress };
    this.renderBriefing(this.briefing);
    this.overlay.hidden = false;
    this.overlay.classList.add("is-ready");
    this.loadingPanel.hidden = true;
    this.briefingPanel.hidden = false;
    requestAnimationFrame(() => this.startButton.focus({ preventScroll: true }));
  }

  hide(): void {
    this.overlay.hidden = true;
  }

  private renderLocale(): void {
    this.loadingEyebrow.textContent = translate(
      this.locale,
      "loadingEyebrow",
    );
    this.loadingTitle.textContent = translate(this.locale, "loadingTitle");
    this.loadingDescription.textContent = translate(
      this.locale,
      "loadingAssets",
    );
    this.progressBar.setAttribute(
      "aria-label",
      translate(this.locale, "loadingProgress"),
    );
    this.briefingEyebrow.textContent = translate(
      this.locale,
      "briefingEyebrow",
    );
    this.objectiveLabel.textContent = translate(this.locale, "missionLabel");
    this.campaignLabel.textContent = translate(
      this.locale,
      "campaignProgress",
    );
    this.startButton.textContent = translate(this.locale, "startMission");
    this.mapButton.textContent = translate(this.locale, "campaignMapButton");
    this.languageLabel.textContent = translate(this.locale, "languageCode");
    this.languageButton.setAttribute(
      "aria-label",
      translate(this.locale, "languageToggleLabel"),
    );
  }

  private renderBriefing({ level, progress }: BriefingState): void {
    this.sector.textContent =
      `${translate(this.locale, "sectorLabel")} ` +
      `${String(level.sector).padStart(2, "0")} / ` +
      `${String(LEVELS.length).padStart(2, "0")}`;
    this.levelTitle.textContent = localizeLevelText(level.title, this.locale);
    this.objective.textContent = localizeLevelText(level.objective, this.locale);
    const completed = progress.bestStars.filter((stars) => stars > 0).length;
    this.campaignValue.textContent =
      `${completed} / ${LEVELS.length} ${translate(this.locale, "secured")}`;
  }
}
