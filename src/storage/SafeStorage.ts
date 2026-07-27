export class SafeStorage {
  private readonly fallback = new Map<string, string>();
  private readonly prefix: string;

  constructor(prefix = "starconquest") {
    this.prefix = `${prefix}:`;
  }

  get(key: string): string | null {
    const storageKey = this.key(key);
    try {
      const value = window.localStorage.getItem(storageKey);
      return value ?? this.fallback.get(storageKey) ?? null;
    } catch {
      return this.fallback.get(storageKey) ?? null;
    }
  }

  set(key: string, value: string): void {
    const storageKey = this.key(key);
    this.fallback.set(storageKey, value);
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // The in-memory value remains available when persistent storage is blocked.
    }
  }

  remove(key: string): void {
    const storageKey = this.key(key);
    this.fallback.delete(storageKey);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing else is required for the in-memory fallback.
    }
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }
}
