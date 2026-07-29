export type Owner = "player" | "enemy" | "enemy2" | "neutral";

export type SystemClass = "PULSAR" | "GIANT" | "QUASAR" | "NEXUS";

export type GameStatus = "playing" | "won" | "lost";

export type SectorTheme =
  | "azure-frontier"
  | "quasar-rift"
  | "nexus-void";

export interface Point {
  x: number;
  y: number;
}

export interface StarSystemView {
  id: string;
  owner: Owner;
  className: SystemClass;
  position: Point;
  energy: number;
  capacity: number;
}

export interface EnergyLinkView {
  id: string;
  sourceId: string;
  targetId: string;
  owner: Owner;
  intensity: number;
  state: "growing" | "active";
  growProgress: number;
  unitsInTransit: number;
}

export type VisualEffectKind = "capture" | "boost" | "cut" | "invalid";

export interface VisualEffect {
  id: number;
  kind: VisualEffectKind;
  position: Point;
  targetPosition?: Point;
  owner?: Owner;
  age: number;
  duration: number;
}

export interface DragPreview {
  source: Point;
  current: Point;
  valid: boolean;
  targetId: string | null;
}

export interface CutPreview {
  linkId: string;
  position: Point;
  forwardEnergy: number;
  returnedEnergy: number;
  prominentBoost: boolean;
}

export interface TutorialCue {
  kind: "connect" | "cut";
  source: Point;
  target: Point;
}

export interface SceneSnapshot {
  theme: SectorTheme;
  systems: readonly StarSystemView[];
  links: readonly EnergyLinkView[];
  elapsedSeconds: number;
  focusedSystemId: string | null;
  paused: boolean;
  status: GameStatus;
  dragPreview: DragPreview | null;
  cutTrail: readonly Point[];
  cutPreview: CutPreview | null;
  effects: readonly VisualEffect[];
  tutorialCue: TutorialCue | null;
}
