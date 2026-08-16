import { SafeStorage } from "../storage/SafeStorage";
import {
  MUSIC_ASSETS,
  SOUND_ASSETS,
  type GameplayMusicTrack,
  type MusicMode,
  type MusicTrack,
  type SoundEffect,
} from "./SoundAssets";

const LEGACY_AUDIO_PREFERENCE_KEY = "audio-enabled";
const SFX_PREFERENCE_KEY = "sfx-enabled";
const MUSIC_PREFERENCE_KEY = "music-enabled";
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
  private readonly music = new Map<MusicTrack, HTMLAudioElement>();
  private preloadPromise: Promise<void> | null = null;
  private musicMode: MusicMode = "gameplay";
  private gameplayMusicTrack: GameplayMusicTrack = "gameplay-chill";
  private activeMusicTrack: MusicTrack | null = null;
  private musicFadeTimer: number | null = null;
  private musicUnlocked = false;
  private musicPaused = false;
  private sfxEnabled: boolean;
  private musicEnabled: boolean;

  constructor(private readonly storage: SafeStorage) {
    const legacyEnabled = storage.get(LEGACY_AUDIO_PREFERENCE_KEY) !== "false";
    this.sfxEnabled = storage.get(SFX_PREFERENCE_KEY) === null
      ? legacyEnabled
      : storage.get(SFX_PREFERENCE_KEY) !== "false";
    this.musicEnabled = storage.get(MUSIC_PREFERENCE_KEY) === null
      ? legacyEnabled
      : storage.get(MUSIC_PREFERENCE_KEY) !== "false";
  }

  isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    this.storage.set(SFX_PREFERENCE_KEY, String(enabled));
    if (!enabled && this.context?.state === "running") {
      void this.context.suspend();
    }
  }

  toggleSfx(): boolean {
    this.setSfxEnabled(!this.sfxEnabled);
    return this.sfxEnabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.storage.set(MUSIC_PREFERENCE_KEY, String(enabled));
    if (!enabled) {
      this.pauseMusic();
    }
  }

  toggleMusic(): boolean {
    this.setMusicEnabled(!this.musicEnabled);
    return this.musicEnabled;
  }

  async unlock(): Promise<void> {
    if (!this.sfxEnabled && !this.musicEnabled) {
      return;
    }
    if (this.musicEnabled) {
      this.musicUnlocked = true;
      this.syncMusic();
    }
    if (!this.sfxEnabled) {
      return;
    }
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
    (Object.keys(MUSIC_ASSETS) as MusicTrack[]).forEach((track) => {
      this.getMusicElement(track);
    });
  }

  setMusicMode(mode: MusicMode): void {
    this.musicMode = mode;
    this.musicPaused = false;
    this.syncMusic();
  }

  setGameplayMusicTrack(track: GameplayMusicTrack): void {
    this.gameplayMusicTrack = track;
    if (this.musicMode === "gameplay") {
      this.syncMusic();
    }
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
    if (
      !this.sfxEnabled ||
      !this.context ||
      this.context.state !== "running"
    ) {
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

  private getMusicElement(track: MusicTrack): HTMLAudioElement {
    const existing = this.music.get(track);
    if (existing) {
      return existing;
    }
    const element = new Audio();
    element.loop = track === "menu";
    element.preload = "none";
    element.src = MUSIC_ASSETS[track].url;
    element.volume = 0;
    if (track !== "menu") {
      element.addEventListener("ended", () => {
        this.advanceGameplayMusic(track);
      });
    }
    this.music.set(track, element);
    return element;
  }

  private syncMusic(): void {
    if (
      !this.musicEnabled ||
      !this.musicUnlocked ||
      this.musicPaused ||
      document.hidden
    ) {
      this.pauseMusic();
      return;
    }
    this.transitionMusic(
      this.musicMode === "menu" ? "menu" : this.gameplayMusicTrack,
    );
  }

  private transitionMusic(nextTrack: MusicTrack): void {
    const next = this.getMusicElement(nextTrack);
    if (this.activeMusicTrack === nextTrack && !next.paused) {
      return;
    }

    this.stopMusicFade();
    const previous = this.activeMusicTrack
      ? this.getMusicElement(this.activeMusicTrack)
      : null;
    const previousVolume = previous?.volume ?? 0;
    const targetVolume = MUSIC_ASSETS[nextTrack].volume;
    next.volume = previous === next ? next.volume : 0;
    void next.play().catch(() => {});
    this.activeMusicTrack = nextTrack;

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
    this.activeMusicTrack = null;
  }

  private advanceGameplayMusic(completedTrack: GameplayMusicTrack): void {
    if (
      this.musicMode !== "gameplay" ||
      this.activeMusicTrack !== completedTrack
    ) {
      return;
    }
    this.gameplayMusicTrack = completedTrack === "gameplay-chill"
      ? "gameplay-space"
      : "gameplay-chill";
    this.activeMusicTrack = null;
    this.syncMusic();
  }

  private stopMusicFade(): void {
    if (this.musicFadeTimer !== null) {
      window.clearInterval(this.musicFadeTimer);
      this.musicFadeTimer = null;
    }
  }
}
