import { GameApp } from "./app/GameApp";
import { applyDocumentLocale } from "./i18n/document";
import {
  LOCALE_PREFERENCE_KEY,
  resolvePreferredLocale,
  translate,
} from "./i18n/strings";
import { SafeStorage } from "./storage/SafeStorage";
import "./styles.css";

const locale = resolvePreferredLocale(
  new SafeStorage().get(LOCALE_PREFERENCE_KEY),
  navigator.language,
);
applyDocumentLocale(locale);

const canvas = document.querySelector("#game-canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error(translate(locale, "startFailure"));
}

const app = new GameApp(canvas);

try {
  await app.start();
} catch (error) {
  const status = document.querySelector("#status-message");
  if (status) {
    status.textContent = translate(locale, "startFailure");
  }
  throw error;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => app.stop());
}
