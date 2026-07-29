import type { Owner } from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/ships/${filename}`;

export class TransportShipArtLibrary {
  private readonly images = new Map<Owner, HTMLImageElement>();

  get(owner: Owner): HTMLImageElement | null {
    if (owner === "neutral") {
      return null;
    }
    const cached = this.images.get(owner);
    if (cached) {
      return cached;
    }
    const image = new Image();
    image.decoding = "async";
    image.src = assetUrl(`transport-${owner}.webp`);
    this.images.set(owner, image);
    return image;
  }
}

export const isShipArtReady = (
  image: HTMLImageElement | null,
): image is HTMLImageElement =>
  image !== null && image.complete && image.naturalWidth > 0;
