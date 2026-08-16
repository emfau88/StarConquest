export type SoundEffect =
  | "link"
  | "capture"
  | "cut"
  | "boost"
  | "win"
  | "lose";

export interface SoundAssetDefinition {
  readonly url: string;
  readonly gain: number;
  readonly playbackRate: number;
}

export type MusicMode = "menu" | "gameplay";

export interface MusicAssetDefinition {
  readonly url: string;
  readonly volume: number;
}

const publicAssetUrl = (relativePath: string): string =>
  `${import.meta.env?.BASE_URL ?? "./"}assets/${relativePath}`;

const assetUrl = (filename: string): string =>
  publicAssetUrl(`audio/${filename}`);

const musicAssetUrl = (filename: string): string =>
  publicAssetUrl(`music/${filename}`);

export const SOUND_ASSETS: Readonly<
  Record<SoundEffect, SoundAssetDefinition>
> = Object.freeze({
  link: {
    url: assetUrl("laserRetro_001.ogg"),
    gain: 0.16,
    playbackRate: 1.06,
  },
  capture: {
    url: assetUrl("forceField_001.ogg"),
    gain: 0.2,
    playbackRate: 1,
  },
  cut: {
    url: assetUrl("laserSmall_003.ogg"),
    gain: 0.28,
    playbackRate: 1.08,
  },
  boost: {
    url: assetUrl("laserLarge_002.ogg"),
    gain: 0.2,
    playbackRate: 0.94,
  },
  win: {
    url: assetUrl("doorOpen_001.ogg"),
    gain: 0.18,
    playbackRate: 1.08,
  },
  lose: {
    url: assetUrl("doorClose_001.ogg"),
    gain: 0.18,
    playbackRate: 0.92,
  },
});

export const SOUND_ASSET_URLS = Object.values(SOUND_ASSETS).map(
  ({ url }) => url,
);

export const MUSIC_ASSETS: Readonly<
  Record<MusicMode, MusicAssetDefinition>
> = Object.freeze({
  menu: {
    url: musicAssetUrl("a_chill_fever.mp3"),
    volume: 0.075,
  },
  gameplay: {
    url: musicAssetUrl("chillloopable.mp3"),
    volume: 0.05,
  },
});

export const MUSIC_ASSET_URLS = Object.values(MUSIC_ASSETS).map(
  ({ url }) => url,
);
