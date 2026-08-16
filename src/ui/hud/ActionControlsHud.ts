import { translate, type Locale } from "../../i18n/strings";
import { requireElement } from "./dom";

type HudIconName =
  | "audio-off"
  | "audio-on"
  | "fullscreen-enter"
  | "fullscreen-exit"
  | "pause"
  | "play"
  | "restart";

const iconUrl = (name: HudIconName): string =>
  `${import.meta.env.BASE_URL}assets/ui/${name}.png`;

export interface HudControlActions {
  onMapOpen: () => void;
  onLanguageToggle: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
  onMusicToggle: () => void;
  onSfxToggle: () => void;
  onFullscreenToggle: () => void;
}

export class ActionControlsHud {
  private readonly secondaryActions = requireElement(
    "#hud-secondary-actions",
    HTMLDivElement,
  );
  private readonly moreButton = requireElement(
    "#more-button",
    HTMLButtonElement,
  );
  private readonly languageButton = requireElement(
    "#language-button",
    HTMLButtonElement,
  );
  private readonly mapButton = requireElement(
    "#map-button",
    HTMLButtonElement,
  );
  private readonly restartButton = requireElement(
    "#restart-button",
    HTMLButtonElement,
  );
  private readonly audioButton = requireElement(
    "#audio-button",
    HTMLButtonElement,
  );
  private readonly musicButton = requireElement(
    "#music-button",
    HTMLButtonElement,
  );
  private readonly fullscreenButton = requireElement(
    "#fullscreen-button",
    HTMLButtonElement,
  );
  private readonly pauseButton = requireElement(
    "#pause-button",
    HTMLButtonElement,
  );
  private readonly restartIcon = requireElement(
    "#restart-icon",
    HTMLImageElement,
  );
  private readonly audioIcon = requireElement(
    "#audio-icon",
    HTMLImageElement,
  );
  private readonly fullscreenIcon = requireElement(
    "#fullscreen-icon",
    HTMLImageElement,
  );
  private readonly pauseIcon = requireElement(
    "#pause-icon",
    HTMLImageElement,
  );
  private readonly restartLabel = requireElement(
    "#restart-label",
    HTMLSpanElement,
  );
  private readonly mapLabel = requireElement(
    "#map-label",
    HTMLSpanElement,
  );
  private readonly audioLabel = requireElement(
    "#audio-label",
    HTMLSpanElement,
  );
  private readonly musicLabel = requireElement(
    "#music-label",
    HTMLSpanElement,
  );
  private readonly fullscreenLabel = requireElement(
    "#fullscreen-label",
    HTMLSpanElement,
  );
  private readonly pauseLabel = requireElement(
    "#pause-label",
    HTMLSpanElement,
  );
  private readonly languageLabel = requireElement(
    "#language-label",
    HTMLSpanElement,
  );
  private locale: Locale;
  private paused = false;
  private sfxEnabled = true;
  private musicEnabled = true;
  private fullscreenActive = false;

  constructor(locale: Locale) {
    this.locale = locale;
    this.restartIcon.src = iconUrl("restart");
    this.setLocale(locale);
  }

  bind(actions: HudControlActions, signal: AbortSignal): void {
    this.setSecondaryActionsOpen(false);
    this.moreButton.addEventListener("click", () => {
      this.setSecondaryActionsOpen(
        !this.secondaryActions.classList.contains("is-open"),
      );
    }, { signal });
    this.mapButton.addEventListener("click", () => {
      this.setSecondaryActionsOpen(false);
      actions.onMapOpen();
    }, {
      signal,
    });
    this.languageButton.addEventListener(
      "click",
      () => {
        this.setSecondaryActionsOpen(false);
        actions.onLanguageToggle();
      },
      { signal },
    );
    this.pauseButton.addEventListener("click", () => {
      this.setSecondaryActionsOpen(false);
      actions.onPauseToggle();
    }, {
      signal,
    });
    this.restartButton.addEventListener("click", () => {
      this.setSecondaryActionsOpen(false);
      actions.onRestart();
    }, {
      signal,
    });
    this.musicButton.addEventListener("click", () => {
      actions.onMusicToggle();
    }, {
      signal,
    });
    this.audioButton.addEventListener("click", () => {
      actions.onSfxToggle();
    }, {
      signal,
    });
    this.fullscreenButton.addEventListener(
      "click",
      () => {
        this.setSecondaryActionsOpen(false);
        actions.onFullscreenToggle();
      },
      { signal },
    );
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        this.secondaryActions.classList.contains("is-open")
      ) {
        this.setSecondaryActionsOpen(false);
        this.moreButton.focus({ preventScroll: true });
      }
    }, { signal });
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.mapLabel.textContent = translate(locale, "map");
    this.restartLabel.textContent = translate(locale, "restart");
    this.languageLabel.textContent = translate(locale, "languageCode");
    this.setControlLabel(this.mapButton, translate(locale, "map"));
    this.setControlLabel(this.restartButton, translate(locale, "restart"));
    const moreControls = translate(locale, "moreControls");
    this.setControlLabel(this.moreButton, moreControls);
    this.secondaryActions.setAttribute("aria-label", moreControls);
    const languageLabel = translate(locale, "languageToggleLabel");
    this.languageButton.setAttribute("aria-label", languageLabel);
    this.languageButton.title = languageLabel;
    this.setPaused(this.paused);
    this.setMusicEnabled(this.musicEnabled);
    this.setSfxEnabled(this.sfxEnabled);
    this.setFullscreen(this.fullscreenActive);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.pauseLabel.textContent = translate(
      this.locale,
      paused ? "resume" : "pause",
    );
    this.pauseIcon.src = iconUrl(paused ? "play" : "pause");
    this.setControlLabel(
      this.pauseButton,
      translate(this.locale, paused ? "resume" : "pause"),
    );
    this.pauseButton.setAttribute("aria-pressed", String(paused));
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.musicLabel.textContent = translate(
      this.locale,
      enabled ? "musicOn" : "musicOff",
    );
    this.setControlLabel(
      this.musicButton,
      translate(this.locale, enabled ? "musicOn" : "musicOff"),
    );
    this.musicButton.setAttribute("aria-pressed", String(enabled));
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    this.audioLabel.textContent = translate(
      this.locale,
      enabled ? "sfxOn" : "sfxOff",
    );
    this.audioIcon.src = iconUrl(enabled ? "audio-on" : "audio-off");
    this.setControlLabel(
      this.audioButton,
      translate(this.locale, enabled ? "sfxOn" : "sfxOff"),
    );
    this.audioButton.setAttribute("aria-pressed", String(enabled));
  }

  setFullscreenSupported(supported: boolean): void {
    this.fullscreenButton.classList.toggle("is-unsupported", !supported);
  }

  setFullscreen(active: boolean): void {
    this.fullscreenActive = active;
    this.fullscreenLabel.textContent = translate(
      this.locale,
      active ? "exitFullscreen" : "fullscreen",
    );
    this.fullscreenIcon.src = iconUrl(
      active ? "fullscreen-exit" : "fullscreen-enter",
    );
    this.setControlLabel(
      this.fullscreenButton,
      translate(
        this.locale,
        active ? "exitFullscreen" : "fullscreen",
      ),
    );
    this.fullscreenButton.setAttribute("aria-pressed", String(active));
  }

  private setSecondaryActionsOpen(open: boolean): void {
    this.secondaryActions.classList.toggle("is-open", open);
    this.moreButton.setAttribute("aria-expanded", String(open));
  }

  private setControlLabel(
    button: HTMLButtonElement,
    label: string,
  ): void {
    button.setAttribute("aria-label", label);
    button.title = label;
  }
}
