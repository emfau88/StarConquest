export interface PlatformAdapter {
  initialize(): Promise<void>;
  loadingStart(): void;
  loadingStop(): void;
  gameplayStart(): void;
  gameplayStop(): void;
}

export class LocalPlatformAdapter implements PlatformAdapter {
  async initialize(): Promise<void> {
    await Promise.resolve();
  }

  loadingStart(): void {}

  loadingStop(): void {}

  gameplayStart(): void {}

  gameplayStop(): void {}
}

export function createPlatformAdapter(): PlatformAdapter {
  return new LocalPlatformAdapter();
}
