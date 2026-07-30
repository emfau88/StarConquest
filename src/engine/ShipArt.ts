import type { Owner } from "../core/types";

const assetUrl = (filename: string): string =>
  `${import.meta.env.BASE_URL}assets/ships/${filename}`;

export type ShipRole = "transport" | "interceptor" | "cruiser";

export class FleetShipArtLibrary {
  private readonly images = new Map<string, HTMLImageElement>();

  get(owner: Owner, role: ShipRole): HTMLImageElement | null {
    if (owner === "neutral") {
      return null;
    }
    const key = `${owner}:${role}`;
    const cached = this.images.get(key);
    if (cached) {
      return cached;
    }
    const image = new Image();
    image.decoding = "async";
    image.src = assetUrl(`${role}-${owner}.webp`);
    this.images.set(key, image);
    return image;
  }
}

export const isShipArtReady = (
  image: HTMLImageElement | null,
): image is HTMLImageElement =>
  image !== null && image.complete && image.naturalWidth > 0;
