import { SafeStorage } from "../storage/SafeStorage";

const AUDIO_PREFERENCE_KEY = "audio-enabled";
export type SoundEffect =
  | "link"
  | "capture"
  | "cut"
  | "boost"
  | "win"
  | "lose";

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
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  async unlock(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  play(effect: SoundEffect): void {
    if (!this.enabled || !this.context || this.context.state !== "running") {
      return;
    }

    const context = this.context;
    const now = context.currentTime;
    SOUND_FREQUENCIES[effect].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.055;
      oscillator.type =
        effect === "cut" || effect === "lose" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.075, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  }
}
