import { translate, type Locale } from "./strings";

const setText = (selector: string, text: string): void => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
};

const setAriaLabel = (selector: string, label: string): void => {
  document.querySelector(selector)?.setAttribute("aria-label", label);
};

export function applyDocumentLocale(
  locale: Locale,
  levelTitle?: string,
): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = "ltr";
  document.title = levelTitle
    ? `StarConquest — ${levelTitle}`
    : "StarConquest";
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.setAttribute("content", translate(locale, "documentDescription"));

  setAriaLabel("#game-canvas", translate(locale, "canvasAriaLabel"));
  setAriaLabel(".hud", translate(locale, "missionStatusAriaLabel"));
  setAriaLabel(
    ".orientation-message",
    translate(locale, "deviceOrientationAriaLabel"),
  );
  setText(".hud__objective-label", translate(locale, "missionLabel"));
  setText(
    ".orientation-message strong",
    translate(locale, "rotateDevice"),
  );
  setText(
    ".orientation-message span",
    translate(locale, "landscapePlay"),
  );
}
