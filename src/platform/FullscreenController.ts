type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export class FullscreenController {
  private readonly listeners = new Set<(active: boolean) => void>();

  constructor(private readonly target: HTMLElement) {
    document.addEventListener("fullscreenchange", this.handleChange);
    document.addEventListener("webkitfullscreenchange", this.handleChange);
  }

  isSupported(): boolean {
    const target = this.target as WebkitElement;
    return Boolean(
      document.fullscreenEnabled ||
        target.requestFullscreen ||
        target.webkitRequestFullscreen,
    );
  }

  isFullscreen(): boolean {
    const webkitDocument = document as WebkitDocument;
    return Boolean(
      document.fullscreenElement ?? webkitDocument.webkitFullscreenElement,
    );
  }

  subscribe(listener: (active: boolean) => void): void {
    this.listeners.add(listener);
  }

  async toggle(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    const webkitDocument = document as WebkitDocument;
    if (this.isFullscreen()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        await webkitDocument.webkitExitFullscreen?.();
      }
      return;
    }

    const target = this.target as WebkitElement;
    if (target.requestFullscreen) {
      await target.requestFullscreen({ navigationUI: "hide" });
    } else {
      await target.webkitRequestFullscreen?.();
    }

    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "landscape") => Promise<void>;
    };
    try {
      await orientation.lock?.("landscape");
    } catch {
      // Browsers may allow fullscreen while declining orientation locking.
    }
  }

  dispose(): void {
    document.removeEventListener("fullscreenchange", this.handleChange);
    document.removeEventListener("webkitfullscreenchange", this.handleChange);
    this.listeners.clear();
  }

  private readonly handleChange = (): void => {
    const active = this.isFullscreen();
    for (const listener of this.listeners) {
      listener(active);
    }
  };
}
