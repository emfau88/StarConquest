import type { Owner } from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/ships/${filename}`;

export const createTransportShipArt = (): Readonly<
  Record<Owner, HTMLImageElement | null>
> => {
  const player = createImage(assetUrl("transport-player.png"));
  const enemy = createImage(assetUrl("transport-enemy.png"));

  return Object.freeze({
    player,
    enemy,
    enemy2: enemy,
    neutral: null,
  });
};

export const isShipArtReady = (
  image: HTMLImageElement | null,
): image is HTMLImageElement =>
  image !== null && image.complete && image.naturalWidth > 0;

const createImage = (source: string): HTMLImageElement => {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  return image;
};
