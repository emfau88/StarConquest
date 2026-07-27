import type { WorldPoint } from "../engine/CanvasViewport";
import { CanvasViewport } from "../engine/CanvasViewport";

export type PointerEventKind = "down" | "move" | "up" | "cancel";

export interface GamePointerEvent {
  kind: PointerEventKind;
  pointerId: number;
  position: WorldPoint;
}

export class PointerInput {
  private readonly events: GamePointerEvent[] = [];
  private activePointerId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly viewport: CanvasViewport,
  ) {
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerCancel);
    canvas.addEventListener("contextmenu", this.preventContextMenu);
  }

  drainEvents(): GamePointerEvent[] {
    return this.events.splice(0);
  }

  dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.removeEventListener("contextmenu", this.preventContextMenu);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.activePointerId !== null) {
      return;
    }
    this.activePointerId = event.pointerId;
    this.canvas.setPointerCapture(event.pointerId);
    this.queue("down", event);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId === this.activePointerId) {
      this.queue("move", event);
    }
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.queue("up", event);
    this.activePointerId = null;
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.queue("cancel", event);
    this.activePointerId = null;
  };

  private readonly preventContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private queue(kind: PointerEventKind, event: PointerEvent): void {
    event.preventDefault();
    this.events.push({
      kind,
      pointerId: event.pointerId,
      position: this.viewport.clientToWorld(event.clientX, event.clientY),
    });
  }
}
