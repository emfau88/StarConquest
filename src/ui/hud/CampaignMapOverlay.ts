import {
  LEVELS,
  localizeLevelText,
} from "../../data/levels";
import {
  translate,
  type Locale,
} from "../../i18n/strings";
import { requireElement } from "./dom";

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
  private readonly nodes = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-level-index]"),
  );

  constructor(locale: Locale) {
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

    this.nodes.forEach((node, index) => {
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
      name.textContent = localizedTitle;
      number.textContent = String(level.sector).padStart(2, "0");
      node.setAttribute(
        "aria-label",
        `${translate(locale, "sectorLabel")} ${level.sector}: ${localizedTitle}`,
      );
    });
  }

  bind(
    onSelect: (levelIndex: number) => void,
    onClose: () => void,
    signal: AbortSignal,
  ): void {
    this.closeButton.addEventListener("click", onClose, { signal });
    this.nodes.forEach((node, index) => {
      node.addEventListener("click", () => onSelect(index), { signal });
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

  show(currentLevelIndex: number): void {
    this.nodes.forEach((node, index) => {
      const isCurrent = index === currentLevelIndex;
      node.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        node.setAttribute("aria-current", "step");
      } else {
        node.removeAttribute("aria-current");
      }
    });
    this.overlay.hidden = false;
    this.closeButton.focus({ preventScroll: true });
  }

  hide(): void {
    this.overlay.hidden = true;
  }
}
