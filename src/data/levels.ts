import type {
  Owner,
  Point,
  SectorTheme,
  SystemClass,
} from "../core/types";
import type { Locale } from "../i18n/strings";

export interface LocalizedLevelText {
  readonly en: string;
  readonly de: string;
}

export interface LevelSystemDefinition {
  id: string;
  owner: Owner;
  className: SystemClass;
  position: Point;
  startEnergy: number;
}

export interface LevelDefinition {
  id: string;
  sector: number;
  difficulty: number;
  theme: SectorTheme;
  title: LocalizedLevelText;
  objective: LocalizedLevelText;
  openingHint: LocalizedLevelText;
  tutorialNoCost: boolean;
  threeStarSeconds: number;
  twoStarSeconds: number;
  aiActionIntervalSeconds: number;
  systems: readonly LevelSystemDefinition[];
}

export const localizeLevelText = (
  text: LocalizedLevelText,
  locale: Locale,
): string => text[locale];

export const LEVELS = [
  {
    id: "first-contact",
    sector: 1,
    difficulty: 1,
    theme: "azure-frontier",
    title: {
      en: "First Contact",
      de: "Erster Kontakt",
    },
    objective: {
      en: "Secure the neutral stars, then capture the red system",
      de: "Sichere die neutralen Sterne und erobere dann das rote System",
    },
    openingHint: {
      en: "Drag from your blue system to a neutral star",
      de: "Ziehe vom blauen System zu einem neutralen Stern",
    },
    tutorialNoCost: true,
    threeStarSeconds: 75,
    twoStarSeconds: 130,
    aiActionIntervalSeconds: 14,
    systems: [
      {
        id: "player-quasar",
        owner: "player",
        className: "QUASAR",
        position: { x: 390, y: 470 },
        startEnergy: 36,
      },
      {
        id: "enemy-giant",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1210, y: 470 },
        startEnergy: 10,
      },
      {
        id: "neutral-top",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 800, y: 280 },
        startEnergy: 4,
      },
      {
        id: "neutral-bottom",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 800, y: 660 },
        startEnergy: 4,
      },
    ],
  },
  {
    id: "pressure-line",
    sector: 2,
    difficulty: 2,
    theme: "azure-frontier",
    title: {
      en: "Pressure Line",
      de: "Drucklinie",
    },
    objective: {
      en: "Build a stronger network before the two outposts expand",
      de: "Baue ein stärkeres Netz, bevor die zwei Vorposten expandieren",
    },
    openingHint: {
      en: "The central Giant is the key reinforcement",
      de: "Der zentrale Giant ist die entscheidende Verstärkung",
    },
    tutorialNoCost: false,
    threeStarSeconds: 100,
    twoStarSeconds: 170,
    aiActionIntervalSeconds: 10,
    systems: [
      {
        id: "player-quasar",
        owner: "player",
        className: "QUASAR",
        position: { x: 300, y: 470 },
        startEnergy: 38,
      },
      {
        id: "enemy-upper-outpost",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 1280, y: 290 },
        startEnergy: 9,
      },
      {
        id: "enemy-lower-outpost",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 1280, y: 650 },
        startEnergy: 9,
      },
      {
        id: "neutral-center",
        owner: "neutral",
        className: "GIANT",
        position: { x: 790, y: 470 },
        startEnergy: 6,
      },
      {
        id: "neutral-upper-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 570, y: 250 },
        startEnergy: 4,
      },
      {
        id: "neutral-lower-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 570, y: 690 },
        startEnergy: 4,
      },
    ],
  },
  {
    id: "cut-the-current",
    sector: 3,
    difficulty: 3,
    theme: "quasar-rift",
    title: {
      en: "Cut the Current",
      de: "Stromschnitt",
    },
    objective: {
      en: "Use boost cuts to break through the relay chain",
      de: "Durchbrich die Relaiskette mit gezielten Boost-Schnitten",
    },
    openingHint: {
      en: "Cut an active blue route near its source to launch its energy",
      de: "Schneide eine aktive blaue Route nahe der Quelle für einen Boost",
    },
    tutorialNoCost: false,
    threeStarSeconds: 115,
    twoStarSeconds: 190,
    aiActionIntervalSeconds: 8.5,
    systems: [
      {
        id: "player-quasar",
        owner: "player",
        className: "QUASAR",
        position: { x: 250, y: 470 },
        startEnergy: 40,
      },
      {
        id: "enemy-quasar",
        owner: "enemy",
        className: "QUASAR",
        position: { x: 1350, y: 470 },
        startEnergy: 15,
      },
      {
        id: "relay-west",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 520, y: 350 },
        startEnergy: 4,
      },
      {
        id: "relay-center",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 800, y: 470 },
        startEnergy: 5,
      },
      {
        id: "relay-east",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 1080, y: 590 },
        startEnergy: 4,
      },
      {
        id: "enemy-upper-reserve",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1000, y: 230 },
        startEnergy: 16,
      },
      {
        id: "lower-reserve",
        owner: "neutral",
        className: "GIANT",
        position: { x: 800, y: 710 },
        startEnergy: 8,
      },
    ],
  },
  {
    id: "twin-fronts",
    sector: 4,
    difficulty: 4,
    theme: "quasar-rift",
    title: {
      en: "Twin Fronts",
      de: "Doppelfront",
    },
    objective: {
      en: "Choose one front to overwhelm while holding the other",
      de: "Überrenne eine Front und halte gleichzeitig die andere",
    },
    openingHint: {
      en: "Concentrate your routes instead of splitting them evenly",
      de: "Bündele deine Routen, statt sie gleichmäßig aufzuteilen",
    },
    tutorialNoCost: false,
    threeStarSeconds: 140,
    twoStarSeconds: 230,
    aiActionIntervalSeconds: 7,
    systems: [
      {
        id: "player-nexus",
        owner: "player",
        className: "NEXUS",
        position: { x: 300, y: 470 },
        startEnergy: 42,
      },
      {
        id: "player-upper-outpost",
        owner: "player",
        className: "PULSAR",
        position: { x: 500, y: 230 },
        startEnergy: 14,
      },
      {
        id: "enemy-upper-front",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1260, y: 280 },
        startEnergy: 15,
      },
      {
        id: "enemy-lower-front",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 1260, y: 660 },
        startEnergy: 12,
      },
      {
        id: "neutral-upper",
        owner: "neutral",
        className: "GIANT",
        position: { x: 820, y: 310 },
        startEnergy: 8,
      },
      {
        id: "neutral-lower",
        owner: "neutral",
        className: "GIANT",
        position: { x: 820, y: 630 },
        startEnergy: 8,
      },
      {
        id: "enemy-center-relay",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 1040, y: 470 },
        startEnergy: 10,
      },
      {
        id: "neutral-player-flank",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 500, y: 710 },
        startEnergy: 5,
      },
    ],
  },
  {
    id: "heavy-orbit",
    sector: 5,
    difficulty: 5,
    theme: "nexus-void",
    title: {
      en: "Heavy Orbit",
      de: "Schwere Umlaufbahn",
    },
    objective: {
      en: "Dismantle the fortified network around the enemy Nexus",
      de: "Zerschlage das befestigte Netz rund um den feindlichen Nexus",
    },
    openingHint: {
      en: "Fast Pulsars expand; Giants hold energy; the Nexus anchors the siege",
      de: "Pulsare expandieren, Giants speichern Energie, der Nexus hält die Front",
    },
    tutorialNoCost: false,
    threeStarSeconds: 165,
    twoStarSeconds: 270,
    aiActionIntervalSeconds: 5.5,
    systems: [
      {
        id: "player-nexus",
        owner: "player",
        className: "NEXUS",
        position: { x: 270, y: 470 },
        startEnergy: 48,
      },
      {
        id: "neutral-player-pulsar",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 480, y: 700 },
        startEnergy: 6,
      },
      {
        id: "enemy-nexus",
        owner: "enemy",
        className: "NEXUS",
        position: { x: 1330, y: 470 },
        startEnergy: 30,
      },
      {
        id: "enemy-upper-giant",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1130, y: 240 },
        startEnergy: 18,
      },
      {
        id: "enemy-lower-giant",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1130, y: 700 },
        startEnergy: 18,
      },
      {
        id: "neutral-upper-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 760, y: 250 },
        startEnergy: 10,
      },
      {
        id: "neutral-lower-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 760, y: 690 },
        startEnergy: 10,
      },
      {
        id: "enemy-center-quasar",
        owner: "enemy",
        className: "QUASAR",
        position: { x: 800, y: 470 },
        startEnergy: 16,
      },
      {
        id: "neutral-upper-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 510, y: 250 },
        startEnergy: 5,
      },
    ],
  },
  {
    id: "helion-run",
    sector: 6,
    difficulty: 6,
    theme: "nexus-void",
    title: {
      en: "Helion Run",
      de: "Helion-Vorstoß",
    },
    objective: {
      en: "Break the long Helion supply lanes and capture their solar citadel",
      de: "Brich die langen Helion-Routen und erobere ihre Sonnenzitadelle",
    },
    openingHint: {
      en: "Orange Helion systems reach far; use boost cuts to beat their timing",
      de: "Orange Helion-Systeme greifen weit aus – komm ihnen mit Boost-Schnitten zuvor",
    },
    tutorialNoCost: false,
    threeStarSeconds: 195,
    twoStarSeconds: 320,
    aiActionIntervalSeconds: 5,
    systems: [
      {
        id: "player-nexus",
        owner: "player",
        className: "NEXUS",
        position: { x: 210, y: 470 },
        startEnergy: 52,
      },
      {
        id: "player-forward-pulsar",
        owner: "player",
        className: "PULSAR",
        position: { x: 410, y: 470 },
        startEnergy: 14,
      },
      {
        id: "neutral-upper-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 610, y: 230 },
        startEnergy: 5,
      },
      {
        id: "neutral-lower-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 610, y: 710 },
        startEnergy: 5,
      },
      {
        id: "neutral-center-quasar",
        owner: "neutral",
        className: "QUASAR",
        position: { x: 790, y: 470 },
        startEnergy: 10,
      },
      {
        id: "neutral-upper-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 850, y: 210 },
        startEnergy: 8,
      },
      {
        id: "helion-forward-pulsar",
        owner: "enemy2",
        className: "PULSAR",
        position: { x: 1050, y: 470 },
        startEnergy: 13,
      },
      {
        id: "helion-upper-giant",
        owner: "enemy2",
        className: "GIANT",
        position: { x: 1130, y: 230 },
        startEnergy: 18,
      },
      {
        id: "helion-lower-pulsar",
        owner: "enemy2",
        className: "PULSAR",
        position: { x: 1130, y: 710 },
        startEnergy: 14,
      },
      {
        id: "helion-nexus",
        owner: "enemy2",
        className: "NEXUS",
        position: { x: 1390, y: 470 },
        startEnergy: 34,
      },
    ],
  },
  {
    id: "three-powers",
    sector: 7,
    difficulty: 7,
    theme: "nexus-void",
    title: {
      en: "Three Powers",
      de: "Drei Mächte",
    },
    objective: {
      en: "Outmaneuver both hostile factions and secure the central frontier",
      de: "Manövriere beide Gegner aus und sichere die zentrale Front",
    },
    openingHint: {
      en: "Red and Helion fight each other too—reinforce the front that is under pressure",
      de: "Rot und Helion bekämpfen sich ebenfalls – verstärke die bedrohte Front",
    },
    tutorialNoCost: false,
    threeStarSeconds: 225,
    twoStarSeconds: 360,
    aiActionIntervalSeconds: 4.6,
    systems: [
      {
        id: "player-nexus",
        owner: "player",
        className: "NEXUS",
        position: { x: 210, y: 470 },
        startEnergy: 62,
      },
      {
        id: "player-upper-pulsar",
        owner: "player",
        className: "PULSAR",
        position: { x: 410, y: 300 },
        startEnergy: 16,
      },
      {
        id: "neutral-upper-relay",
        owner: "neutral",
        className: "PULSAR",
        position: { x: 610, y: 220 },
        startEnergy: 5,
      },
      {
        id: "player-lower-relay",
        owner: "player",
        className: "PULSAR",
        position: { x: 590, y: 710 },
        startEnergy: 14,
      },
      {
        id: "neutral-center-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 780, y: 470 },
        startEnergy: 12,
      },
      {
        id: "neutral-upper-quasar",
        owner: "neutral",
        className: "QUASAR",
        position: { x: 870, y: 220 },
        startEnergy: 14,
      },
      {
        id: "neutral-lower-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 850, y: 710 },
        startEnergy: 10,
      },
      {
        id: "red-forward-pulsar",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 1060, y: 320 },
        startEnergy: 12,
      },
      {
        id: "red-nexus",
        owner: "enemy",
        className: "NEXUS",
        position: { x: 1370, y: 220 },
        startEnergy: 32,
      },
      {
        id: "helion-forward-pulsar",
        owner: "enemy2",
        className: "PULSAR",
        position: { x: 1060, y: 620 },
        startEnergy: 12,
      },
      {
        id: "helion-nexus",
        owner: "enemy2",
        className: "NEXUS",
        position: { x: 1370, y: 710 },
        startEnergy: 32,
      },
    ],
  },
  {
    id: "nexus-siege",
    sector: 8,
    difficulty: 8,
    theme: "nexus-void",
    title: {
      en: "Nexus Siege",
      de: "Nexus-Belagerung",
    },
    objective: {
      en: "Break both Nexus networks and secure the final sector",
      de: "Durchbrich beide Nexus-Netze und sichere den letzten Sektor",
    },
    openingHint: {
      en: "Use every lesson: expand fast, reinforce threatened systems and cut charged routes",
      de: "Nutze alles Gelernte: schnell expandieren, bedrohte Systeme stärken und geladene Routen schneiden",
    },
    tutorialNoCost: false,
    threeStarSeconds: 255,
    twoStarSeconds: 400,
    aiActionIntervalSeconds: 4,
    systems: [
      {
        id: "player-nexus",
        owner: "player",
        className: "NEXUS",
        position: { x: 180, y: 470 },
        startEnergy: 70,
      },
      {
        id: "player-upper-pulsar",
        owner: "player",
        className: "PULSAR",
        position: { x: 360, y: 260 },
        startEnergy: 18,
      },
      {
        id: "player-lower-pulsar",
        owner: "player",
        className: "PULSAR",
        position: { x: 360, y: 680 },
        startEnergy: 18,
      },
      {
        id: "neutral-upper-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 590, y: 210 },
        startEnergy: 8,
      },
      {
        id: "neutral-lower-giant",
        owner: "neutral",
        className: "GIANT",
        position: { x: 590, y: 730 },
        startEnergy: 8,
      },
      {
        id: "neutral-gate-quasar",
        owner: "neutral",
        className: "QUASAR",
        position: { x: 760, y: 470 },
        startEnergy: 14,
      },
      {
        id: "red-forward-pulsar",
        owner: "enemy",
        className: "PULSAR",
        position: { x: 990, y: 300 },
        startEnergy: 14,
      },
      {
        id: "helion-forward-pulsar",
        owner: "enemy2",
        className: "PULSAR",
        position: { x: 990, y: 640 },
        startEnergy: 14,
      },
      {
        id: "red-upper-giant",
        owner: "enemy",
        className: "GIANT",
        position: { x: 1180, y: 210 },
        startEnergy: 20,
      },
      {
        id: "helion-lower-giant",
        owner: "enemy2",
        className: "GIANT",
        position: { x: 1180, y: 730 },
        startEnergy: 20,
      },
      {
        id: "red-nexus",
        owner: "enemy",
        className: "NEXUS",
        position: { x: 1400, y: 350 },
        startEnergy: 36,
      },
      {
        id: "helion-nexus",
        owner: "enemy2",
        className: "NEXUS",
        position: { x: 1400, y: 610 },
        startEnergy: 36,
      },
    ],
  },
] as const satisfies readonly LevelDefinition[];

export const LEVEL_ONE = LEVELS[0];
