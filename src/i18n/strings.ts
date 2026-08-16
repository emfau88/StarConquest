export type Locale = "en" | "de";

export const LOCALE_PREFERENCE_KEY = "language";

export const STRINGS = {
  en: {
    sectorLabel: "Sector",
    missionLabel: "Mission",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    musicOn: "Music on",
    musicOff: "Music off",
    sfxOn: "Sound effects on",
    sfxOff: "Sound effects off",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    languageCode: "EN",
    languageToggleLabel: "Language: English. Switch to German",
    map: "Map",
    moreControls: "More controls",
    campaign: "Campaign",
    campaignMapTitle: "Sector map",
    campaignAtlasEyebrow: "Galactic atlas",
    selectSector: "Select sector",
    campaignProgress: "Campaign progress",
    secured: "secured",
    sectorPreview: "Selected sector preview",
    difficulty: "Difficulty",
    noRating: "No rating yet",
    loadingEyebrow: "Campaign systems",
    loadingTitle: "Preparing sector",
    loadingAssets: "Loading critical game assets",
    loadingProgress: "Loading progress",
    briefingEyebrow: "Mission briefing",
    startMission: "Start mission",
    campaignMapButton: "Campaign map",
    playAgain: "Play again",
    campaignSectors: "Campaign sectors",
    closeMap: "Close",
    available: "Available",
    locked: "Locked",
    completed: "Completed",
    star: "star",
    stars: "stars",
    canvasAriaLabel: "StarConquest game field",
    missionStatusAriaLabel: "Mission status",
    deviceOrientationAriaLabel: "Device orientation",
    rotateDevice: "Rotate your device",
    landscapePlay: "StarConquest is designed for landscape play.",
    documentDescription:
      "StarConquest is a fast strategy game about linking star systems and redirecting energy.",
    startFailure: "Unable to start StarConquest",
    connectHint: "Drag from your blue system to another star",
    cutHint: "Sever a blue flux lane: the front surges, the rear recalls",
    battleHint: "Build routes, reinforce your network and capture every hostile system",
    underAttack: "Your network is under attack — reinforce the marked system",
    systemLost: "System lost — stabilize the nearest blue system",
    paused: "Simulation paused",
    selected: "System selected",
    insufficient: "That system needs more energy",
    duplicate: "This route already exists",
    linkLimit: "This system has reached its route limit",
    invalid: "Start on a blue system and end on another star",
    wonEyebrow: "Sector secured",
    wonTitle: "Network captured",
    lostEyebrow: "Signal lost",
    lostTitle: "Your network collapsed",
    retry: "Play again",
    nextSector: "Next sector",
    resultSummary: "completed in",
    lostSummary: "Regroup, protect threatened systems and try a shorter route",
  },
  de: {
    sectorLabel: "Sektor",
    missionLabel: "Mission",
    pause: "Pause",
    resume: "Weiter",
    restart: "Neustart",
    musicOn: "Musik an",
    musicOff: "Musik aus",
    sfxOn: "Soundeffekte an",
    sfxOff: "Soundeffekte aus",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild verlassen",
    languageCode: "DE",
    languageToggleLabel: "Sprache: Deutsch. Zu Englisch wechseln",
    map: "Karte",
    moreControls: "Weitere Steuerung",
    campaign: "Kampagne",
    campaignMapTitle: "Sektorkarte",
    campaignAtlasEyebrow: "Galaktischer Atlas",
    selectSector: "Sektor auswählen",
    campaignProgress: "Kampagnenfortschritt",
    secured: "gesichert",
    sectorPreview: "Vorschau des ausgewählten Sektors",
    difficulty: "Schwierigkeit",
    noRating: "Noch keine Wertung",
    loadingEyebrow: "Kampagnensysteme",
    loadingTitle: "Sektor wird vorbereitet",
    loadingAssets: "Kritische Spielinhalte werden geladen",
    loadingProgress: "Ladefortschritt",
    briefingEyebrow: "Missionsbriefing",
    startMission: "Mission starten",
    campaignMapButton: "Kampagnenkarte",
    playAgain: "Nochmal spielen",
    campaignSectors: "Kampagnensektoren",
    closeMap: "Schließen",
    available: "Verfügbar",
    locked: "Gesperrt",
    completed: "Abgeschlossen",
    star: "Stern",
    stars: "Sterne",
    canvasAriaLabel: "StarConquest-Spielfeld",
    missionStatusAriaLabel: "Missionsstatus",
    deviceOrientationAriaLabel: "Geräteausrichtung",
    rotateDevice: "Drehe dein Gerät",
    landscapePlay: "StarConquest ist für das Querformat ausgelegt.",
    documentDescription:
      "StarConquest ist ein schnelles Strategiespiel über Sternenverbindungen und umgeleitete Energie.",
    startFailure: "StarConquest konnte nicht gestartet werden",
    connectHint: "Ziehe vom blauen System zu einem anderen Stern",
    cutHint: "Trenne einen blauen Energiekorridor: vorn Vorstoß, hinten Rückruf",
    battleHint: "Baue Routen, verstärke dein Netz und erobere alle feindlichen Systeme",
    underAttack: "Dein Netz wird angegriffen – verstärke das markierte System",
    systemLost: "System verloren – stabilisiere das nächste blaue System",
    paused: "Simulation pausiert",
    selected: "System ausgewählt",
    insufficient: "Dieses System braucht mehr Energie",
    duplicate: "Diese Route existiert bereits",
    linkLimit: "Dieses System hat sein Routenlimit erreicht",
    invalid: "Starte auf einem blauen System und ende auf einem anderen Stern",
    wonEyebrow: "Sektor gesichert",
    wonTitle: "Netzwerk erobert",
    lostEyebrow: "Signal verloren",
    lostTitle: "Dein Netzwerk ist zusammengebrochen",
    retry: "Nochmal spielen",
    nextSector: "Nächster Sektor",
    resultSummary: "abgeschlossen in",
    lostSummary: "Sammle dich, schütze bedrohte Systeme und wähle eine kürzere Route",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];

export function resolveLocale(candidate?: string): Locale {
  return candidate?.toLowerCase().startsWith("de") ? "de" : "en";
}

export function resolvePreferredLocale(
  storedLocale: string | null,
  browserLanguage?: string,
): Locale {
  return storedLocale === "de" || storedLocale === "en"
    ? storedLocale
    : resolveLocale(browserLanguage);
}

export function translate(locale: Locale, key: StringKey): string {
  return STRINGS[locale][key] ?? STRINGS.en[key];
}

export function formatStarLabel(locale: Locale, count: number): string {
  const normalizedCount = Math.max(0, Math.floor(count));
  const key = normalizedCount === 1 ? "star" : "stars";
  return `${normalizedCount} ${translate(locale, key)}`;
}
