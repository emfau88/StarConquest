import type {
  Owner,
  Point,
  SystemClass,
} from "../core/types";

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
  title: string;
  objective: string;
  tutorialNoCost: boolean;
  threeStarSeconds: number;
  twoStarSeconds: number;
  aiActionIntervalSeconds: number;
  systems: readonly LevelSystemDefinition[];
}

export const LEVEL_ONE = {
  id: "first-contact",
  sector: 1,
  title: "First Contact",
  objective: "Capture all enemy systems",
  tutorialNoCost: true,
  threeStarSeconds: 90,
  twoStarSeconds: 150,
  aiActionIntervalSeconds: 12,
  systems: [
    {
      id: "player-quasar",
      owner: "player",
      className: "QUASAR",
      position: { x: 448, y: 470 },
      startEnergy: 30,
    },
    {
      id: "enemy-giant",
      owner: "enemy",
      className: "GIANT",
      position: { x: 1230, y: 470 },
      startEnergy: 12,
    },
    {
      id: "neutral-top",
      owner: "neutral",
      className: "PULSAR",
      position: { x: 820, y: 276 },
      startEnergy: 5,
    },
    {
      id: "neutral-bottom",
      owner: "neutral",
      className: "PULSAR",
      position: { x: 820, y: 664 },
      startEnergy: 5,
    },
  ],
} as const satisfies LevelDefinition;
