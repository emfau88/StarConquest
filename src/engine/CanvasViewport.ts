import type { Point } from "../core/types";

export const LOGICAL_WIDTH = 1600;
export const LOGICAL_HEIGHT = 900;
const TARGET_ASPECT = LOGICAL_WIDTH / LOGICAL_HEIGHT;
const MAX_DEVICE_PIXEL_RATIO = 2;

export interface SafeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportMetrics {
  cssWidth: number;
  cssHeight: number;
  devicePixelRatio: number;
  logicalScale: number;
  safeRect: SafeRect;
}

export interface WorldPoint extends Point {
  insideSafeArea: boolean;
}

export class CanvasViewport {
  readonly context: CanvasRenderingContext2D;

  private metrics: ViewportMetrics = {
    cssWidth: 1,
    cssHeight: 1,
    devicePixelRatio: 1,
    logicalScale: 1,
    safeRect: { x: 0, y: 0, width: 1, height: 1 },
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("Canvas 2D is not supported by this browser.");
    }
    this.context = context;
    this.resize();
  }

  resize(): ViewportMetrics {
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const devicePixelRatio = Math.min(
      MAX_DEVICE_PIXEL_RATIO,
      Math.max(1, window.devicePixelRatio || 1),
    );
    const viewportAspect = cssWidth / cssHeight;

    let safeRect: SafeRect;
    if (viewportAspect > TARGET_ASPECT) {
      const height = cssHeight;
      const width = height * TARGET_ASPECT;
      safeRect = {
        x: (cssWidth - width) / 2,
        y: 0,
        width,
        height,
      };
    } else {
      const width = cssWidth;
      const height = width / TARGET_ASPECT;
      safeRect = {
        x: 0,
        y: (cssHeight - height) / 2,
        width,
        height,
      };
    }

    const pixelWidth = Math.round(cssWidth * devicePixelRatio);
    const pixelHeight = Math.round(cssHeight * devicePixelRatio);
    if (
      this.canvas.width !== pixelWidth ||
      this.canvas.height !== pixelHeight
    ) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }

    this.metrics = {
      cssWidth,
      cssHeight,
      devicePixelRatio,
      logicalScale: safeRect.width / LOGICAL_WIDTH,
      safeRect,
    };
    return this.metrics;
  }

  getMetrics(): ViewportMetrics {
    return this.metrics;
  }

  prepareScreenSpace(): void {
    const { devicePixelRatio } = this.metrics;
    this.context.setTransform(
      devicePixelRatio,
      0,
      0,
      devicePixelRatio,
      0,
      0,
    );
  }

  enterWorldSpace(): void {
    const { devicePixelRatio, logicalScale, safeRect } = this.metrics;
    this.context.setTransform(
      devicePixelRatio * logicalScale,
      0,
      0,
      devicePixelRatio * logicalScale,
      devicePixelRatio * safeRect.x,
      devicePixelRatio * safeRect.y,
    );
  }

  clientToWorld(clientX: number, clientY: number): WorldPoint {
    const canvasRect = this.canvas.getBoundingClientRect();
    const screenX = clientX - canvasRect.left;
    const screenY = clientY - canvasRect.top;
    const { logicalScale, safeRect } = this.metrics;

    return {
      x: (screenX - safeRect.x) / logicalScale,
      y: (screenY - safeRect.y) / logicalScale,
      insideSafeArea:
        screenX >= safeRect.x &&
        screenX <= safeRect.x + safeRect.width &&
        screenY >= safeRect.y &&
        screenY <= safeRect.y + safeRect.height,
    };
  }
}
