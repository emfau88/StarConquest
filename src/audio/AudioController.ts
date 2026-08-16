import { SafeStorage } from "../storage/SafeStorage";
import {
  MUSIC_ASSETS,
  SOUND_ASSETS,
  type MusicMode,
  type SoundEffect,
} from "./SoundAssets";

const AUDIO_PREFERENCE_KEY = "audio-enabled";
const MUSIC_FADE_MS = 650;

const SOUND_FREQUENCIES: Readonly<Record<SoundEffect, readonly number[]>> = {
  link: [330, 494],
  capture: [392, 523, 659],
  cut: [220, 130],
  boost: [420, 720, 980],
  win: [392, 523, 659, 784],
  lose: [294, 220, 147],
};

export class AudioController {
  private context: AudioContext | null = null;
  private readonly buffers = new Map<SoundEffect, AudioBuffer>();
  private readonly music = new Map<MusicMode, HTMLAudioElement>();
  private preloadPromise: Promise<void> | null = null;
  private musicMode: MusicMode = "gameplay";
  private activeMusicMode: MusicMode | null = null;
  private musicFadeTimer: number | null = null;
  private musicUnlocked = false;
  private musicPaused = false;
  private enabled: boolean;

  constructor(private readonly storage: SafeStorage) {
    this.enabled = storage.get(AUDIO_PREFERENCE_KEY) !== "false";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.storage.set(AUDIO_PREFERENCE_KEY, String(enabled));
    if (!enabled && this.context?.state === "running") {
      void this.context.suspend();
    }
    if (!enabled) {
      this.pauseMusic();
    }
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  async unlock(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    this.musicUnlocked = true;
    this.syncMusic();
    const context = this.getContext();
    if (context.state === "suspended") {
      await context.resume();
    }
    void this.preload();
  }

  preload(): Promise<void> {
    this.preloadPromise ??= this.loadBuffers();
    return this.preloadPromise;
  }

  preloadMusic(): void {
    (Object.keys(MUSIC_ASSETS) as MusicMode[]).forEach((mode) => {
      this.getMusicElement(mode);
    });
  }

  setMusicMode(mode: MusicMode): void {
    this.musicMode = mode;
    this.musicPaused = false;
    this.syncMusic();
  }

  setMusicPaused(paused: boolean): void {
    this.musicPaused = paused;
    this.syncMusic();
  }

  dispose(): void {
    this.pauseMusic();
    if (this.context && this.context.state !== "closed") {
      void this.context.close();
    }
  }

  play(effect: SoundEffect): void {
    if (!this.enabled || !this.context || this.context.state !== "running") {
      return;
    }

    const buffer = this.buffers.get(effect);
    if (buffer) {
      this.playSample(effect, buffer);
    }
    if (!buffer || effect === "win" || effect === "lose") {
      this.playTone(effect, buffer ? 0.035 : 0.075);
    }
  }

  private getContext(): AudioContext {
    this.context ??= new AudioContext();
    return this.context;
  }

  private async loadBuffers(): Promise<void> {
    const context = this.getContext();
    const entries = Object.entries(SOUND_ASSETS) as Array<
      [SoundEffect, (typeof SOUND_ASSETS)[SoundEffect]]
    >;
    await Promise.allSettled(entries.map(async ([effect, asset]) => {
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Unable to load sound asset: ${asset.url}`);
      }
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      this.buffers.set(effect, buffer);
    }));
  }

  private playSample(effect: SoundEffect, buffer: AudioBuffer): void {
    const context = this.context;
    if (!context) {
      return;
    }
    const asset = SOUND_ASSETS[effect];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = asset.playbackRate;
    gain.gain.value = asset.gain;
    source.connect(gain);
    gain.connect(context.destination);
    source.start();
  }

  private playTone(effect: SoundEffect, peakGain: number): void {
    const context = this.context;
    if (!context) {
      return;
    }
    const now = context.currentTime;
    SOUND_FREQUENCIES[effect].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.055;
      oscillator.type =
        effect === "cut" || effect === "lose" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  }

  private getMusicElement(mode: MusicMode): HTMLAudioElement {
    const existing = this.music.get(mode);
    if (existing) {
      return existing;
    }
    const element = new Audio();
    element.loop = true;
    element.preload = "none";
    element.src = MUSIC_ASSETS[mode].url;
    element.volume = 0;
    this.music.set(mode, element);
    return element;
  }

  private syncMusic(): void {
    if (
      !this.enabled ||
      !this.musicUnlocked ||
      this.musicPaused ||
      document.hidden
    ) {
      this.pauseMusic();
      return;
    }
    this.transitionMusic(this.musicMode);
  }

  private transitionMusic(nextMode: MusicMode): void {
    const next = this.getMusicElement(nextMode);
    if (this.activeMusicMode === nextMode && !next.paused) {
      return;
    }

    this.stopMusicFade();
    const previous = this.activeMusicMode
      ? this.getMusicElement(this.activeMusicMode)
      : null;
    const previousVolume = previous?.volume ?? 0;
    const targetVolume = MUSIC_ASSETS[nextMode].volume;
    next.volume = previous === next ? next.volume : 0;
    void next.play().catch(() => {});
    this.activeMusicMode = nextMode;

    const startedAt = performance.now();
    this.musicFadeTimer = window.setInterval(() => {
      const progress = Math.min(
        1,
        (performance.now() - startedAt) / MUSIC_FADE_MS,
      );
      next.volume = targetVolume * progress;
      if (previous && previous !== next) {
        previous.volume = previousVolume * (1 - progress);
      }
      if (progress < 1) {
        return;
      }
      this.stopMusicFade();
      if (previous && previous !== next) {
        previous.pause();
        previous.volume = 0;
      }
    }, 40);
  }

  private pauseMusic(): void {
    this.stopMusicFade();
    this.music.forEach((element) => {
      element.pause();
      element.volume = 0;
    });
    this.activeMusicMode = null;
  }

  private stopMusicFade(): void {
    if (this.musicFadeTimer !== null) {
      window.clearInterval(this.musicFadeTimer);
      this.musicFadeTimer = null;
    }
  }
}
