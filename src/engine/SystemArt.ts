import type {
  Owner,
  SystemClass,
} from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/systems/${filename}`;

type SystemArtSet = Readonly<Record<SystemClass, HTMLImageElement>>;

export const createSystemArt = (): Readonly<Record<Owner, SystemArtSet>> => {
  const player = createFactionArt("player");
  const enemy = createFactionArt("enemy");
  const neutral = createFactionArt("neutral");

  return Object.freeze({
    player,
    enemy,
    enemy2: enemy,
    neutral,
  });
};

export const isSystemArtReady = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0;

const createFactionArt = (
  faction: "player" | "enemy" | "neutral",
): SystemArtSet => {
  const small = createImage(assetUrl(`system-${faction}-small.png`));
  const medium = createImage(assetUrl(`system-${faction}-medium.png`));
  const large = createImage(assetUrl(`system-${faction}-large.png`));
  const quasar =
    faction === "neutral"
      ? large
      : createImage(assetUrl(`system-${faction}-quasar.png`));

  return Object.freeze({
    PULSAR: small,
    GIANT: medium,
    QUASAR: quasar,
    NEXUS: large,
  });
};

const createImage = (source: string): HTMLImageElement => {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  return image;
};
