import { LEVELS } from "../data/levels";

const STORAGE_KEY = "campaign-progress-v1";

interface ProgressStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export interface CampaignProgressSnapshot {
  readonly unlockedThrough: number;
  readonly bestStars: readonly number[];
}

interface StoredCampaignProgress {
  unlockedThrough?: unknown;
  bestStars?: unknown;
}

export class CampaignProgress {
  private unlockedThrough = 0;
  private bestStars: number[];

  constructor(
    private readonly storage: ProgressStorage,
    private readonly levelCount = LEVELS.length,
  ) {
    this.bestStars = Array.from({ length: levelCount }, () => 0);
    this.load();
  }

  isUnlocked(levelIndex: number): boolean {
    return (
      Number.isInteger(levelIndex) &&
      levelIndex >= 0 &&
      levelIndex < this.levelCount &&
      levelIndex <= this.unlockedThrough
    );
  }

  recordWin(levelIndex: number, stars: number): void {
    if (!this.isUnlocked(levelIndex)) {
      return;
    }
    const normalizedStars = Math.max(1, Math.min(3, Math.floor(stars)));
    this.bestStars[levelIndex] = Math.max(
      this.bestStars[levelIndex] ?? 0,
      normalizedStars,
    );
    this.unlockedThrough = Math.max(
      this.unlockedThrough,
      Math.min(this.levelCount - 1, levelIndex + 1),
    );
    this.save();
  }

  snapshot(): CampaignProgressSnapshot {
    return {
      unlockedThrough: this.unlockedThrough,
      bestStars: [...this.bestStars],
    };
  }

  private load(): void {
    const stored = this.storage.get(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredCampaignProgress;
      if (
        !Number.isInteger(parsed.unlockedThrough) ||
        !Array.isArray(parsed.bestStars)
      ) {
        return;
      }
      const storedStars: unknown[] = parsed.bestStars;

      this.unlockedThrough = Math.max(
        0,
        Math.min(
          this.levelCount - 1,
          Number(parsed.unlockedThrough),
        ),
      );
      this.bestStars = Array.from(
        { length: this.levelCount },
        (_, index) => {
          const value = storedStars[index];
          return typeof value === "number" && Number.isFinite(value)
            ? Math.max(0, Math.min(3, Math.floor(value)))
            : 0;
        },
      );
      const completedThrough = this.bestStars.reduce(
        (highest, stars, index) => (stars > 0 ? index : highest),
        -1,
      );
      this.unlockedThrough = Math.max(
        this.unlockedThrough,
        Math.min(this.levelCount - 1, completedThrough + 1),
      );
    } catch {
      // Corrupt progress falls back to a fresh campaign.
    }
  }

  private save(): void {
    this.storage.set(
      STORAGE_KEY,
      JSON.stringify(this.snapshot()),
    );
  }
}
