export type Locale = "en" | "de";

const STRINGS = {
  en: {
    sectorLabel: "Sector",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    audioOn: "Audio on",
    audioOff: "Audio off",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    connectHint: "Drag from your blue system to another star",
    cutHint: "Swipe across your blue link to launch its stored energy",
    battleHint: "Build routes, reinforce your network and capture every red system",
    paused: "Simulation paused",
    selected: "System selected",
    insufficient: "That system needs more energy",
    duplicate: "This route already exists",
    invalid: "Start on a blue system and end on another star",
    wonEyebrow: "Sector secured",
    wonTitle: "Network captured",
    lostEyebrow: "Signal lost",
    lostTitle: "Your network collapsed",
    retry: "Play again",
    nextSector: "Next sector",
    resultSummary: "completed in",
  },
  de: {
    sectorLabel: "Sektor",
    pause: "Pause",
    resume: "Weiter",
    restart: "Neustart",
    audioOn: "Audio an",
    audioOff: "Audio aus",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild verlassen",
    connectHint: "Ziehe vom blauen System zu einem anderen Stern",
    cutHint: "Wische durch deine blaue Verbindung, um Energie zu starten",
    battleHint: "Baue Routen, verstärke dein Netz und erobere alle roten Systeme",
    paused: "Simulation pausiert",
    selected: "System ausgewählt",
    insufficient: "Dieses System braucht mehr Energie",
    duplicate: "Diese Route existiert bereits",
    invalid: "Starte auf einem blauen System und ende auf einem anderen Stern",
    wonEyebrow: "Sektor gesichert",
    wonTitle: "Netzwerk erobert",
    lostEyebrow: "Signal verloren",
    lostTitle: "Dein Netzwerk ist zusammengebrochen",
    retry: "Nochmal spielen",
    nextSector: "Nächster Sektor",
    resultSummary: "abgeschlossen in",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];

export function resolveLocale(candidate?: string): Locale {
  return candidate?.toLowerCase().startsWith("de") ? "de" : "en";
}

export function translate(locale: Locale, key: StringKey): string {
  return STRINGS[locale][key] ?? STRINGS.en[key];
}
