const images = new Map<string, HTMLImageElement>();
const pendingLoads = new Map<string, Promise<void>>();

export const getImageAsset = (url: string): HTMLImageElement => {
  const cached = images.get(url);
  if (cached) {
    return cached;
  }

  const image = new Image();
  image.decoding = "async";
  image.src = url;
  images.set(url, image);
  return image;
};

export const preloadImageAsset = (url: string): Promise<void> => {
  const image = getImageAsset(url);
  if (image.complete) {
    return image.naturalWidth > 0
      ? decodeImage(image)
      : Promise.reject(new Error(`Unable to load image asset: ${url}`));
  }

  const pending = pendingLoads.get(url);
  if (pending) {
    return pending;
  }

  const load = new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => {
      void decodeImage(image).then(resolve, reject);
    }, { once: true });
    image.addEventListener("error", () => {
      reject(new Error(`Unable to load image asset: ${url}`));
    }, { once: true });
  });
  pendingLoads.set(url, load);
  void load.then(
    () => pendingLoads.delete(url),
    () => pendingLoads.delete(url),
  );
  return load;
};

export const preloadImageAssets = async (
  urls: readonly string[],
): Promise<void> => {
  await Promise.all(urls.map((url) => preloadImageAsset(url)));
};

const decodeImage = async (image: HTMLImageElement): Promise<void> => {
  try {
    await image.decode();
  } catch {
    if (image.naturalWidth <= 0) {
      throw new Error(`Unable to decode image asset: ${image.src}`);
    }
  }
};
