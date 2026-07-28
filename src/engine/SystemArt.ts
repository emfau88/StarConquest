import type { Owner } from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/systems/${filename}`;

const SYSTEM_ART_URLS: Readonly<Record<Owner, string>> = Object.freeze({
  player: assetUrl("system-player-medium.png"),
  enemy: assetUrl("system-enemy-medium.png"),
  enemy2: assetUrl("system-enemy-medium.png"),
  neutral: assetUrl("system-neutral-medium.png"),
});

export const createSystemArt = (): Readonly<Record<Owner, HTMLImageElement>> => {
  const player = createImage(SYSTEM_ART_URLS.player);
  const enemy = createImage(SYSTEM_ART_URLS.enemy);
  const neutral = createImage(SYSTEM_ART_URLS.neutral);

  return Object.freeze({
    player,
    enemy,
    enemy2: enemy,
    neutral,
  });
};

export const isSystemArtReady = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0;

const createImage = (source: string): HTMLImageElement => {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  return image;
};
