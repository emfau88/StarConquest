export const requireElement = <T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T => {
  const element = document.querySelector(selector);
  if (!(element instanceof constructor)) {
    throw new Error(`Required UI element is missing: ${selector}`);
  }
  return element;
};

export const formatTime = (elapsedSeconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
