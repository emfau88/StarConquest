import type { Owner } from "../core/types";
import { getImageAsset } from "./ImageAssetCache";
import { shipAssetUrl } from "./RuntimeAssets";

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
    const image = getImageAsset(shipAssetUrl(owner, role));
    this.images.set(key, image);
    return image;
  }
}

export const isShipArtReady = (
  image: HTMLImageElement | null,
): image is HTMLImageElement =>
  image !== null && image.complete && image.naturalWidth > 0;
