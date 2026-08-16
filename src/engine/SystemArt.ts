import type {
  Owner,
  SystemClass,
} from "../core/types";
import { getImageAsset } from "./ImageAssetCache";
import { systemAssetUrl } from "./RuntimeAssets";

export class SystemArtLibrary {
  private readonly images = new Map<string, HTMLImageElement>();

  get(owner: Owner, className: SystemClass): HTMLImageElement {
    const url = systemAssetUrl(owner, className);
    const cached = this.images.get(url);
    if (cached) {
      return cached;
    }
    const image = getImageAsset(url);
    this.images.set(url, image);
    return image;
  }
}

export const isSystemArtReady = (image: HTMLImageElement): boolean =>
  image.complete && image.naturalWidth > 0;
