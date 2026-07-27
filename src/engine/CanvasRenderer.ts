import type {
  EnergyLinkView,
  Owner,
  Point,
  SceneSnapshot,
  StarSystemView,
  SystemClass,
  VisualEffect,
} from "../core/types";
import {
  CanvasViewport,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from "./CanvasViewport";
import {
  getLinkCurve,
  pointOnLink,
} from "./link-geometry";
import { SYSTEM_RADII } from "./system-geometry";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
}

const OWNER_COLORS: Readonly<Record<Owner, string>> = Object.freeze({
  player: "#57c2ff",
  enemy: "#ff5b77",
  enemy2: "#ffb357",
  neutral: "#93a5c2",
});

const buildStars = (): Star[] => {
  let seed = 0x51a7c0;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };

  return Array.from({ length: 190 }, () => ({
    x: random(),
    y: random(),
    radius: 0.4 + random() * 1.45,
    alpha: 0.22 + random() * 0.66,
    phase: random() * Math.PI * 2,
  }));
};

export class CanvasRenderer {
  private readonly stars = buildStars();

  constructor(private readonly viewport: CanvasViewport) {}

  render(scene: SceneSnapshot): void {
    const context = this.viewport.context;
    const metrics = this.viewport.getMetrics();
    this.viewport.prepareScreenSpace();
    context.clearRect(0, 0, metrics.cssWidth, metrics.cssHeight);
    this.drawBackdrop(context, scene.elapsedSeconds);

    this.viewport.enterWorldSpace();
    this.drawWorld(context, scene);
  }

  private drawBackdrop(
    context: CanvasRenderingContext2D,
    elapsedSeconds: number,
  ): void {
    const { cssWidth, cssHeight, safeRect } = this.viewport.getMetrics();
    const gradient = context.createRadialGradient(
      cssWidth * 0.46,
      cssHeight * 0.44,
      0,
      cssWidth * 0.5,
      cssHeight * 0.5,
      Math.max(cssWidth, cssHeight) * 0.78,
    );
    gradient.addColorStop(0, "#0b1830");
    gradient.addColorStop(0.5, "#06101e");
    gradient.addColorStop(1, "#030914");
    context.fillStyle = gradient;
    context.fillRect(0, 0, cssWidth, cssHeight);

    const nebula = context.createRadialGradient(
      safeRect.x + safeRect.width * 0.62,
      safeRect.y + safeRect.height * 0.46,
      0,
      safeRect.x + safeRect.width * 0.62,
      safeRect.y + safeRect.height * 0.46,
      safeRect.width * 0.42,
    );
    nebula.addColorStop(0, "rgba(68, 43, 111, 0.17)");
    nebula.addColorStop(0.46, "rgba(29, 67, 111, 0.07)");
    nebula.addColorStop(1, "rgba(6, 16, 30, 0)");
    context.fillStyle = nebula;
    context.fillRect(0, 0, cssWidth, cssHeight);

    for (const star of this.stars) {
      const twinkle =
        0.78 + Math.sin(elapsedSeconds * 0.48 + star.phase) * 0.22;
      context.globalAlpha = star.alpha * twinkle;
      context.fillStyle = "#dff7ff";
      context.beginPath();
      context.arc(
        star.x * cssWidth,
        star.y * cssHeight,
        star.radius,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.globalAlpha = 1;
  }

  private drawWorld(
    context: CanvasRenderingContext2D,
    scene: SceneSnapshot,
  ): void {
    const systems = new Map(scene.systems.map((system) => [system.id, system]));

    context.save();
    context.beginPath();
    context.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    context.clip();

    for (const link of scene.links) {
      const source = systems.get(link.sourceId);
      const target = systems.get(link.targetId);
      if (source && target) {
        this.drawLink(
          context,
          link,
          source,
          target,
          scene.elapsedSeconds,
        );
      }
    }

    if (scene.dragPreview) {
      this.drawDragPreview(context, scene);
    }

    for (const system of scene.systems) {
      this.drawSystem(
        context,
        system,
        scene.elapsedSeconds,
        system.id === scene.focusedSystemId,
      );
    }

    this.drawCutTrail(context, scene.cutTrail);
    for (const effect of scene.effects) {
      this.drawEffect(context, effect);
    }

    if (scene.paused) {
      context.fillStyle = "rgba(3, 9, 20, 0.5)";
      context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }

    context.restore();
  }

  private drawLink(
    context: CanvasRenderingContext2D,
    link: EnergyLinkView,
    source: StarSystemView,
    target: StarSystemView,
    elapsedSeconds: number,
  ): void {
    const color = OWNER_COLORS[link.owner];
    const curve = getLinkCurve(link, source, target);
    const length = Math.hypot(
      target.position.x - source.position.x,
      target.position.y - source.position.y,
    );
    const progress = Math.max(0, Math.min(1, link.growProgress));

    context.save();
    context.lineCap = "round";
    context.shadowColor = color;
    context.shadowBlur = 18;
    context.strokeStyle = `${color}35`;
    context.lineWidth = 12;
    this.strokeLinkProgress(context, curve, progress);

    context.shadowBlur = 4;
    context.strokeStyle = `${color}a8`;
    context.lineWidth = 4 + link.intensity * 2;
    this.strokeLinkProgress(context, curve, progress);

    const beadCount = Math.max(7, Math.floor(length / 68));
    const speed = 0.12 + link.intensity * 0.08;
    for (let index = 0; index < beadCount; index += 1) {
      const t = (index / beadCount + elapsedSeconds * speed) % 1;
      if (t > progress) {
        continue;
      }
      const point = pointOnLink(curve, t);
      const radius = 3 + link.intensity * 1.8;

      context.globalAlpha = 0.52 + link.intensity * 0.34;
      context.fillStyle = "#eaf9ff";
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    context.restore();
  }

  private strokeLinkProgress(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    progress: number,
  ): void {
    context.beginPath();
    context.moveTo(curve.source.x, curve.source.y);
    const segments = Math.max(2, Math.ceil(32 * progress));
    for (let index = 1; index <= segments; index += 1) {
      const point = pointOnLink(curve, progress * (index / segments));
      context.lineTo(point.x, point.y);
    }
    context.stroke();
  }

  private drawDragPreview(
    context: CanvasRenderingContext2D,
    scene: SceneSnapshot,
  ): void {
    const preview = scene.dragPreview;
    if (!preview) {
      return;
    }
    const color = preview.valid ? "#67f0a4" : "#57c2ff";
    context.save();
    context.setLineDash([15, 13]);
    context.lineDashOffset = -scene.elapsedSeconds * 60;
    context.lineCap = "round";
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 16;
    context.beginPath();
    context.moveTo(preview.source.x, preview.source.y);
    context.lineTo(preview.current.x, preview.current.y);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = color;
    context.beginPath();
    context.arc(preview.current.x, preview.current.y, 8, 0, Math.PI * 2);
    context.fill();

    const target = scene.systems.find(
      (system) => system.id === preview.targetId,
    );
    if (target) {
      context.lineWidth = 4;
      context.strokeStyle = color;
      context.beginPath();
      context.arc(
        target.position.x,
        target.position.y,
        SYSTEM_RADII[target.className] + 17,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }
    context.restore();
  }

  private drawCutTrail(
    context: CanvasRenderingContext2D,
    trail: readonly Point[],
  ): void {
    if (trail.length < 2) {
      return;
    }
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#ffcf66";
    context.shadowColor = "#ffcf66";
    context.shadowBlur = 18;
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(trail[0].x, trail[0].y);
    for (let index = 1; index < trail.length; index += 1) {
      context.lineTo(trail[index].x, trail[index].y);
    }
    context.stroke();
    context.restore();
  }

  private drawEffect(
    context: CanvasRenderingContext2D,
    effect: VisualEffect,
  ): void {
    const progress = Math.max(0, Math.min(1, effect.age / effect.duration));
    const alpha = 1 - progress;
    const color = effect.owner ? OWNER_COLORS[effect.owner] : "#ffcf66";
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 20;

    if (effect.kind === "capture") {
      context.lineWidth = 7 - progress * 4;
      context.beginPath();
      context.arc(
        effect.position.x,
        effect.position.y,
        42 + progress * 100,
        0,
        Math.PI * 2,
      );
      context.stroke();
    } else if (effect.kind === "boost" && effect.targetPosition) {
      context.lineWidth = 12 - progress * 8;
      context.beginPath();
      context.moveTo(effect.position.x, effect.position.y);
      context.lineTo(effect.targetPosition.x, effect.targetPosition.y);
      context.stroke();
      context.beginPath();
      context.arc(
        effect.targetPosition.x,
        effect.targetPosition.y,
        28 + progress * 74,
        0,
        Math.PI * 2,
      );
      context.stroke();
    } else {
      const radius = 18 + progress * 42;
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(effect.position.x - radius, effect.position.y - radius);
      context.lineTo(effect.position.x + radius, effect.position.y + radius);
      context.moveTo(effect.position.x + radius, effect.position.y - radius);
      context.lineTo(effect.position.x - radius, effect.position.y + radius);
      context.stroke();
    }
    context.restore();
  }

  private drawSystem(
    context: CanvasRenderingContext2D,
    system: StarSystemView,
    elapsedSeconds: number,
    focused: boolean,
  ): void {
    const color = OWNER_COLORS[system.owner];
    const radius = SYSTEM_RADII[system.className];
    const phaseOffset = system.id.length * 0.31;
    const pulse =
      1 + Math.sin(elapsedSeconds * 2.1 + phaseOffset) * 0.035;
    const drawRadius = radius * pulse;
    const energyRatio = Math.max(
      0,
      Math.min(1, system.energy / system.capacity),
    );

    context.save();
    context.translate(system.position.x, system.position.y);

    const halo = context.createRadialGradient(
      0,
      0,
      radius * 0.3,
      0,
      0,
      radius * 2.1,
    );
    halo.addColorStop(0, `${color}36`);
    halo.addColorStop(0.48, `${color}16`);
    halo.addColorStop(1, `${color}00`);
    context.fillStyle = halo;
    context.beginPath();
    context.arc(0, 0, radius * 2.1, 0, Math.PI * 2);
    context.fill();

    const body = context.createRadialGradient(
      -radius * 0.22,
      -radius * 0.22,
      0,
      0,
      0,
      drawRadius,
    );
    body.addColorStop(0, `${color}8c`);
    body.addColorStop(0.44, `${color}3c`);
    body.addColorStop(1, "#071322");
    context.fillStyle = body;
    context.beginPath();
    context.arc(0, 0, drawRadius, 0, Math.PI * 2);
    context.fill();

    context.shadowColor = color;
    context.shadowBlur = focused ? 28 : 16;
    context.strokeStyle = focused ? "#eaf9ff" : color;
    context.lineWidth = focused ? 4 : 2.5;
    context.stroke();
    context.shadowBlur = 0;

    this.drawClassPattern(
      context,
      system.className,
      radius,
      color,
      elapsedSeconds,
      phaseOffset,
    );

    context.strokeStyle = `${color}d0`;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(
      0,
      0,
      radius + 8,
      -Math.PI / 2,
      -Math.PI / 2 + energyRatio * Math.PI * 2,
    );
    context.stroke();

    context.fillStyle = "#f4f9ff";
    context.font = `800 ${Math.round(radius * 0.42)}px Inter, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "#020711";
    context.shadowBlur = 8;
    context.fillText(String(Math.floor(system.energy)), 0, 1);
    context.restore();
  }

  private drawClassPattern(
    context: CanvasRenderingContext2D,
    className: SystemClass,
    radius: number,
    color: string,
    elapsedSeconds: number,
    phaseOffset: number,
  ): void {
    context.save();
    context.strokeStyle = `${color}8f`;
    context.fillStyle = `${color}66`;
    context.lineWidth = 3;
    context.rotate(elapsedSeconds * 0.08 + phaseOffset);

    switch (className) {
      case "PULSAR": {
        for (let index = 0; index < 4; index += 1) {
          const angle = (index / 4) * Math.PI * 2;
          context.beginPath();
          context.arc(
            Math.cos(angle) * radius * 0.58,
            Math.sin(angle) * radius * 0.58,
            3.5,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
        break;
      }
      case "GIANT": {
        context.beginPath();
        context.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(radius * 0.78, 0, 6, 0, Math.PI * 2);
        context.fill();
        break;
      }
      case "QUASAR": {
        for (let index = 0; index < 3; index += 1) {
          context.rotate((Math.PI * 2) / 3);
          context.beginPath();
          context.moveTo(radius * 0.34, -8);
          context.lineTo(radius * 0.76, 0);
          context.lineTo(radius * 0.34, 8);
          context.closePath();
          context.stroke();
        }
        break;
      }
      case "NEXUS": {
        for (let index = 0; index < 6; index += 1) {
          context.rotate(Math.PI / 3);
          context.beginPath();
          context.arc(radius * 0.58, 0, 9, -0.8, 0.8);
          context.stroke();
        }
        break;
      }
    }

    context.restore();
  }
}
