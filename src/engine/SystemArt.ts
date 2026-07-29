import type {
  Owner,
  SystemClass,
} from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/systems/${filename}`;

const systemFilename = (
  owner: Owner,
  className: SystemClass,
): string => {
  if (
    className === "QUASAR" &&
    (owner === "player" || owner === "enemy")
  ) {
    return `system-${owner}-quasar.webp`;
  }
  const tier =
    className === "PULSAR"
      ? "small"
      : className === "GIANT"
        ? "medium"
        : "large";
  return `system-${owner}-${tier}.webp`;
};

export class SystemArtLibrary {
  private readonly images = new Map<string, HTMLImageElement>();

  get(owner: Owner, className: SystemClass): HTMLImageElement {
    const filename = systemFilename(owner, className);
    const cached = this.images.get(filename);
    if (cached) {
      return cached;
    }
    const image = new Image();
    image.decoding = "async";
    image.src = assetUrl(filename);
    this.images.set(filename, image);
    return image;
  }
}

export const isSystemArtReady = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0;
