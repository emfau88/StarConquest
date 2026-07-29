import type {
  EnergyLinkView,
  Owner,
  Point,
  SceneSnapshot,
  SectorTheme,
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
import {
  createTransportShipArt,
  isShipArtReady,
} from "./ShipArt";
import { SYSTEM_RADII } from "./system-geometry";
import {
  createSystemArt,
  isSystemArtReady,
} from "./SystemArt";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
}

const BACKDROP_URLS: Readonly<Record<SectorTheme, string>> = Object.freeze({
  "azure-frontier":
    `${import.meta.env.BASE_URL}assets/backgrounds/sector-azure.webp`,
  "quasar-rift":
    `${import.meta.env.BASE_URL}assets/backgrounds/sector-quasar.webp`,
  "nexus-void":
    `${import.meta.env.BASE_URL}assets/backgrounds/sector-nexus.webp`,
});
const CAPTURE_BURST_URL =
  `${import.meta.env.BASE_URL}assets/vfx/capture-burst.png`;

const loadImage = (url: string): HTMLImageElement => {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  return image;
};

const OWNER_COLORS: Readonly<Record<Owner, string>> = Object.freeze({
  player: "#39c2ff",
  enemy: "#ff685f",
  enemy2: "#ffb14a",
  neutral: "#b8c8dd",
});

const buildStars = (): Star[] => {
  let seed = 0x51a7c0;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };

  return Array.from({ length: 72 }, () => ({
    x: random(),
    y: random(),
    radius: 0.4 + random() * 1.45,
    alpha: 0.22 + random() * 0.66,
    phase: random() * Math.PI * 2,
  }));
};

export class CanvasRenderer {
  private readonly stars = buildStars();
  private readonly backdropImages: Readonly<
    Record<SectorTheme, HTMLImageElement>
  > = {
    "azure-frontier": loadImage(BACKDROP_URLS["azure-frontier"]),
    "quasar-rift": loadImage(BACKDROP_URLS["quasar-rift"]),
    "nexus-void": loadImage(BACKDROP_URLS["nexus-void"]),
  };
  private readonly captureBurstImage = new Image();
  private readonly transportShipArt = createTransportShipArt();
  private readonly systemArt = createSystemArt();

  constructor(private readonly viewport: CanvasViewport) {
    this.captureBurstImage.decoding = "async";
    this.captureBurstImage.src = CAPTURE_BURST_URL;
  }

  render(scene: SceneSnapshot): void {
    const context = this.viewport.context;
    const metrics = this.viewport.getMetrics();
    this.viewport.prepareScreenSpace();
    context.clearRect(0, 0, metrics.cssWidth, metrics.cssHeight);
    this.drawBackdrop(context, scene.elapsedSeconds, scene.theme);

    this.viewport.enterWorldSpace();
    this.drawWorld(context, scene);
  }

  private drawBackdrop(
    context: CanvasRenderingContext2D,
    elapsedSeconds: number,
    theme: SectorTheme,
  ): void {
    const { cssWidth, cssHeight, safeRect } = this.viewport.getMetrics();
    const backdropImage = this.backdropImages[theme];
    const fallback = context.createLinearGradient(0, 0, cssWidth, cssHeight);
    fallback.addColorStop(0, "#087cca");
    fallback.addColorStop(0.48, "#0b44a3");
    fallback.addColorStop(1, "#643cba");
    context.fillStyle = fallback;
    context.fillRect(0, 0, cssWidth, cssHeight);

    if (backdropImage.complete && backdropImage.naturalWidth > 0) {
      const imageRatio =
        backdropImage.naturalWidth / backdropImage.naturalHeight;
      const screenRatio = cssWidth / cssHeight;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = backdropImage.naturalWidth;
      let sourceHeight = backdropImage.naturalHeight;

      if (imageRatio > screenRatio) {
        sourceWidth = sourceHeight * screenRatio;
        sourceX = (backdropImage.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = sourceWidth / screenRatio;
        sourceY = (backdropImage.naturalHeight - sourceHeight) / 2;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        backdropImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cssWidth,
        cssHeight,
      );
    }

    const playfieldShade = context.createRadialGradient(
      safeRect.x + safeRect.width * 0.5,
      safeRect.y + safeRect.height * 0.5,
      safeRect.width * 0.08,
      safeRect.x + safeRect.width * 0.5,
      safeRect.y + safeRect.height * 0.5,
      safeRect.width * 0.68,
    );
    playfieldShade.addColorStop(0, "rgba(3, 27, 84, 0.16)");
    playfieldShade.addColorStop(0.62, "rgba(3, 18, 60, 0.08)");
    playfieldShade.addColorStop(1, "rgba(2, 9, 34, 0.28)");
    context.fillStyle = playfieldShade;
    context.fillRect(0, 0, cssWidth, cssHeight);

    const hudShade = context.createLinearGradient(0, 0, 0, cssHeight * 0.3);
    hudShade.addColorStop(0, "rgba(2, 9, 34, 0.48)");
    hudShade.addColorStop(1, "rgba(2, 9, 34, 0)");
    context.fillStyle = hudShade;
    context.fillRect(0, 0, cssWidth, cssHeight * 0.3);

    for (const star of this.stars) {
      const twinkle =
        0.78 + Math.sin(elapsedSeconds * 0.48 + star.phase) * 0.22;
      context.globalAlpha = star.alpha * twinkle * 0.44;
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
    context.strokeStyle = "rgba(4, 17, 48, 0.72)";
    context.lineWidth = 9;
    this.strokeLinkProgress(context, curve, progress);

    context.shadowColor = color;
    context.shadowBlur = 13;
    context.strokeStyle = `${color}55`;
    context.lineWidth = 6 + link.intensity * 1.8;
    this.strokeLinkProgress(context, curve, progress);

    context.shadowBlur = 2;
    context.strokeStyle = link.state === "growing" ? "#e9fbff" : `${color}e8`;
    context.lineWidth = 2.4 + link.intensity * 1.15;
    this.strokeLinkProgress(context, curve, progress);

    const markerCount = Math.max(3, Math.floor(length / 170));
    for (let index = 1; index < markerCount; index += 1) {
      const t = index / markerCount;
      if (t >= progress) {
        break;
      }
      const point = pointOnLink(curve, t);
      context.globalAlpha = 0.42;
      context.fillStyle = "#f4fcff";
      context.beginPath();
      context.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
      context.fill();
    }

    const shipCount = Math.min(
      5,
      Math.max(2, 2 + Math.floor(link.unitsInTransit / 8)),
    );
    const speed = 0.105 + link.intensity * 0.065;
    if (progress > 0.18) {
      const routeStart = 0.085;
      const routeEnd = Math.max(routeStart, progress - 0.085);
      for (let index = 0; index < shipCount; index += 1) {
        const phase = (index / shipCount + elapsedSeconds * speed) % 1;
        const t = routeStart + (routeEnd - routeStart) * phase;
        const point = pointOnLink(curve, t);
        const tangent = this.tangentOnLink(curve, t);
        this.drawTransportShip(
          context,
          point,
          Math.atan2(tangent.y, tangent.x),
          link.owner,
          color,
          link.intensity,
        );
      }
    }

    context.globalAlpha = 1;
    context.restore();
  }

  private tangentOnLink(
    curve: ReturnType<typeof getLinkCurve>,
    fraction: number,
  ): Point {
    const t = Math.max(0, Math.min(1, fraction));
    return {
      x:
        2 * (1 - t) * (curve.control.x - curve.source.x) +
        2 * t * (curve.target.x - curve.control.x),
      y:
        2 * (1 - t) * (curve.control.y - curve.source.y) +
        2 * t * (curve.target.y - curve.control.y),
    };
  }

  private drawTransportShip(
    context: CanvasRenderingContext2D,
    position: Point,
    angle: number,
    owner: Owner,
    color: string,
    intensity: number,
  ): void {
    const scale = 1 + intensity * 0.2;
    context.save();
    context.translate(position.x, position.y);
    context.rotate(angle);
    context.scale(scale, scale);

    const exhaust = context.createLinearGradient(-18, 0, -7, 0);
    exhaust.addColorStop(0, `${color}00`);
    exhaust.addColorStop(0.46, `${color}8a`);
    exhaust.addColorStop(1, "#e7fbff");
    context.fillStyle = exhaust;
    context.shadowColor = color;
    context.shadowBlur = 10;
    context.beginPath();
    context.moveTo(-19, 0);
    context.lineTo(-7, -3.2);
    context.lineTo(-7, 3.2);
    context.closePath();
    context.fill();

    const artwork = this.transportShipArt[owner];
    if (isShipArtReady(artwork)) {
      context.shadowColor = color;
      context.shadowBlur = 9;
      context.drawImage(artwork, -29, -17, 58, 34);
      context.restore();
      return;
    }

    context.shadowBlur = 8;
    context.fillStyle = color;
    context.strokeStyle = "rgba(239, 250, 255, 0.9)";
    context.lineWidth = 1.2;

    if (owner === "enemy" || owner === "enemy2") {
      context.beginPath();
      context.moveTo(14, 0);
      context.lineTo(2, -7.5);
      context.lineTo(-9, -5);
      context.lineTo(-4, 0);
      context.lineTo(-9, 5);
      context.lineTo(2, 7.5);
      context.closePath();
    } else {
      context.beginPath();
      context.moveTo(14, 0);
      context.lineTo(-2, -8);
      context.lineTo(-7, -5);
      context.lineTo(-3, 0);
      context.lineTo(-7, 5);
      context.lineTo(-2, 8);
      context.closePath();
    }
    context.fill();
    context.stroke();

    const hull = context.createLinearGradient(-6, -3, 10, 3);
    hull.addColorStop(0, "#b9ddf4");
    hull.addColorStop(0.45, "#ffffff");
    hull.addColorStop(1, "#84b6d5");
    context.fillStyle = hull;
    context.shadowBlur = 0;
    context.beginPath();
    context.moveTo(11, 0);
    context.lineTo(-4, -3.2);
    context.lineTo(-8, 0);
    context.lineTo(-4, 3.2);
    context.closePath();
    context.fill();

    context.fillStyle = owner === "player" ? "#153c78" : "#55233a";
    context.beginPath();
    context.ellipse(3, 0, 3.2, 1.9, 0, 0, Math.PI * 2);
    context.fill();
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
      this.drawCaptureEffect(context, effect, progress, color);
    } else if (effect.kind === "boost" && effect.targetPosition) {
      const beam = context.createLinearGradient(
        effect.position.x,
        effect.position.y,
        effect.targetPosition.x,
        effect.targetPosition.y,
      );
      beam.addColorStop(0, "rgba(255, 214, 90, 0.08)");
      beam.addColorStop(0.56, "#ffd65a");
      beam.addColorStop(1, "#fff8ca");
      context.strokeStyle = beam;
      context.shadowColor = "#ffd65a";
      context.lineWidth = 18 - progress * 12;
      context.beginPath();
      context.moveTo(effect.position.x, effect.position.y);
      context.lineTo(effect.targetPosition.x, effect.targetPosition.y);
      context.stroke();
      context.strokeStyle = "#fffbe8";
      context.shadowBlur = 8;
      context.lineWidth = 4 - progress * 2.5;
      context.stroke();
      context.strokeStyle = "#ffd65a";
      context.beginPath();
      context.arc(
        effect.targetPosition.x,
        effect.targetPosition.y,
        30 + progress * 88,
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.fillStyle = "#fff8c8";
      context.beginPath();
      context.arc(
        effect.targetPosition.x,
        effect.targetPosition.y,
        7 + alpha * 8,
        0,
        Math.PI * 2,
      );
      context.fill();
    } else if (effect.kind === "cut") {
      const radius = 18 + progress * 42;
      context.strokeStyle = "#ffd65a";
      context.lineWidth = 7 - progress * 3;
      context.beginPath();
      context.moveTo(effect.position.x - radius, effect.position.y - radius);
      context.lineTo(effect.position.x + radius, effect.position.y + radius);
      context.moveTo(effect.position.x + radius, effect.position.y - radius);
      context.lineTo(effect.position.x - radius, effect.position.y + radius);
      context.stroke();
      context.strokeStyle = "#fff8d5";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(
        effect.position.x,
        effect.position.y,
        10 + progress * 54,
        0,
        Math.PI * 2,
      );
      context.stroke();
    } else {
      const radius = 16 + progress * 38;
      context.strokeStyle = "#ff7d75";
      context.lineWidth = 5;
      context.beginPath();
      context.arc(
        effect.position.x,
        effect.position.y,
        radius,
        -0.75,
        Math.PI * 1.55,
      );
      context.stroke();
    }
    context.restore();
  }

  private drawCaptureEffect(
    context: CanvasRenderingContext2D,
    effect: VisualEffect,
    progress: number,
    color: string,
  ): void {
    const eased = 1 - (1 - progress) ** 3;
    const fadeIn = Math.min(1, progress * 10);
    const fadeOut = Math.max(0, 1 - Math.max(0, progress - 0.45) / 0.55);
    const burstAlpha = fadeIn * fadeOut;
    const size = 84 + eased * 132;

    if (
      this.captureBurstImage.complete &&
      this.captureBurstImage.naturalWidth > 0
    ) {
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = burstAlpha * 0.68;
      context.drawImage(
        this.captureBurstImage,
        effect.position.x - size / 2,
        effect.position.y - size / 2,
        size,
        size,
      );
      context.restore();
    }

    const ringRadius = 30 + eased * 92;
    context.globalAlpha = fadeOut * 0.78;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 16;
    context.lineWidth = 5 - progress * 3.2;
    context.beginPath();
    context.arc(
      effect.position.x,
      effect.position.y,
      ringRadius,
      0,
      Math.PI * 2,
    );
    context.stroke();

    context.lineWidth = 2;
    context.globalAlpha = burstAlpha * 0.7;
    for (let index = 0; index < 6; index += 1) {
      const angle =
        effect.id * 0.73 + index * (Math.PI / 3) + progress * 0.28;
      const distance = 42 + eased * (48 + (index % 3) * 6);
      const particleSize = 2.4 + (1 - progress) * (index % 2 ? 2 : 3.5);
      const x = effect.position.x + Math.cos(angle) * distance;
      const y = effect.position.y + Math.sin(angle) * distance;
      context.save();
      context.translate(x, y);
      context.rotate(angle + Math.PI / 4);
      context.fillStyle = index % 2 === 0 ? "#f8feff" : color;
      context.fillRect(
        -particleSize / 2,
        -particleSize / 2,
        particleSize,
        particleSize,
      );
      context.restore();
    }
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
    const artwork = this.systemArt[system.owner][system.className];
    const hasArtwork = isSystemArtReady(artwork);
    const energyRatio = Math.max(
      0,
      Math.min(1, system.energy / system.capacity),
    );

    context.save();
    context.translate(system.position.x, system.position.y);

    if (!hasArtwork) {
      this.drawClassPattern(
        context,
        system.className,
        radius,
        color,
        elapsedSeconds,
        phaseOffset,
      );
    }

    const halo = context.createRadialGradient(
      0,
      0,
      radius * 0.18,
      0,
      0,
      radius * 2.25,
    );
    halo.addColorStop(0, `${color}68`);
    halo.addColorStop(0.42, `${color}28`);
    halo.addColorStop(1, `${color}00`);
    context.fillStyle = halo;
    context.beginPath();
    context.arc(0, 0, radius * 2.25, 0, Math.PI * 2);
    context.fill();

    if (hasArtwork) {
      this.drawSystemArtwork(
        context,
        artwork,
        radius,
        pulse,
        color,
        focused,
      );
    } else {
      context.fillStyle = "rgba(3, 14, 42, 0.7)";
      context.beginPath();
      context.arc(0, 3, drawRadius + 5, 0, Math.PI * 2);
      context.fill();

      const body = context.createRadialGradient(
        -radius * 0.34,
        -radius * 0.38,
        0,
        0,
        0,
        drawRadius,
      );
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.14, `${color}f2`);
      body.addColorStop(0.52, `${color}a8`);
      body.addColorStop(0.82, `${color}62`);
      body.addColorStop(1, "#082453");
      context.fillStyle = body;
      context.beginPath();
      context.arc(0, 0, drawRadius, 0, Math.PI * 2);
      context.fill();

      context.shadowColor = color;
      context.shadowBlur = focused ? 34 : 20;
      context.strokeStyle = focused ? "#eaf9ff" : color;
      context.lineWidth = focused ? 4.5 : 3;
      context.stroke();
      context.shadowBlur = 0;

      const innerGlass = context.createRadialGradient(
        -radius * 0.18,
        -radius * 0.22,
        0,
        0,
        0,
        radius * 0.72,
      );
      innerGlass.addColorStop(0, "rgba(255,255,255,0.38)");
      innerGlass.addColorStop(0.48, "rgba(255,255,255,0.08)");
      innerGlass.addColorStop(1, "rgba(1,16,48,0.34)");
      context.fillStyle = innerGlass;
      context.beginPath();
      context.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(232, 249, 255, 0.28)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
      context.stroke();
    }

    context.strokeStyle = "rgba(3, 19, 51, 0.72)";
    context.lineWidth = 7;
    context.beginPath();
    context.arc(0, 0, radius + 9, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = `${color}d0`;
    context.lineWidth = 5.5;
    context.lineCap = "round";
    context.beginPath();
    context.arc(
      0,
      0,
      radius + 9,
      -Math.PI / 2,
      -Math.PI / 2 + energyRatio * Math.PI * 2,
    );
    context.stroke();

    if (energyRatio > 0.02) {
      const endAngle = -Math.PI / 2 + energyRatio * Math.PI * 2;
      context.fillStyle = "#f6fdff";
      context.shadowColor = color;
      context.shadowBlur = 10;
      context.beginPath();
      context.arc(
        Math.cos(endAngle) * (radius + 9),
        Math.sin(endAngle) * (radius + 9),
        3.2,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.shadowBlur = 0;
    }

    context.fillStyle = "#f4f9ff";
    context.font = `900 ${Math.round(radius * 0.46)}px Inter, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = Math.max(3, radius * 0.07);
    context.strokeStyle = "rgba(2, 12, 36, 0.72)";
    context.strokeText(String(Math.floor(system.energy)), 0, -2);
    context.shadowColor = "#03112c";
    context.shadowBlur = 10;
    context.fillText(String(Math.floor(system.energy)), 0, -2);
    context.shadowBlur = 0;

    this.drawTierPips(context, system.className, radius, color);
    context.restore();
  }

  private drawSystemArtwork(
    context: CanvasRenderingContext2D,
    artwork: HTMLImageElement,
    radius: number,
    pulse: number,
    color: string,
    focused: boolean,
  ): void {
    const size = radius * 3.12 * pulse;

    context.save();
    context.shadowColor = color;
    context.shadowBlur = focused ? 34 : 21;
    context.drawImage(artwork, -size / 2, -size / 2, size, size);
    context.restore();

    context.strokeStyle = focused
      ? "rgba(241, 253, 255, 0.96)"
      : `${color}b8`;
    context.lineWidth = focused ? 4 : 2;
    context.shadowColor = color;
    context.shadowBlur = focused ? 20 : 10;
    context.beginPath();
    context.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    context.stroke();
    context.shadowBlur = 0;
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
    context.rotate(elapsedSeconds * 0.035 + phaseOffset);
    context.strokeStyle = "rgba(231, 248, 255, 0.62)";
    context.fillStyle = `${color}d8`;
    context.lineWidth = 2.2;
    context.shadowColor = color;
    context.shadowBlur = 10;

    switch (className) {
      case "PULSAR": {
        for (let index = 0; index < 4; index += 1) {
          context.rotate(Math.PI / 2);
          context.beginPath();
          context.moveTo(radius * 0.76, -5);
          context.lineTo(radius * 1.18, -2.3);
          context.lineTo(radius * 1.34, 0);
          context.lineTo(radius * 1.18, 2.3);
          context.lineTo(radius * 0.76, 5);
          context.closePath();
          context.fill();
          context.stroke();
        }
        context.globalAlpha = 0.75;
        context.strokeStyle = color;
        context.setLineDash([5, 8]);
        context.beginPath();
        context.arc(0, 0, radius * 1.42, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;
        break;
      }
      case "GIANT": {
        context.rotate(-elapsedSeconds * 0.02);
        for (const side of [-1, 1]) {
          context.save();
          context.scale(side, 1);
          context.beginPath();
          context.moveTo(radius * 0.72, -radius * 0.5);
          context.quadraticCurveTo(
            radius * 1.28,
            -radius * 0.42,
            radius * 1.38,
            0,
          );
          context.quadraticCurveTo(
            radius * 1.28,
            radius * 0.42,
            radius * 0.72,
            radius * 0.5,
          );
          context.lineTo(radius * 0.88, radius * 0.22);
          context.quadraticCurveTo(radius * 1.04, 0, radius * 0.88, -radius * 0.22);
          context.closePath();
          context.fill();
          context.stroke();
          context.restore();
        }
        context.globalAlpha = 0.72;
        context.strokeStyle = color;
        context.lineWidth = 3.5;
        context.beginPath();
        context.ellipse(0, 0, radius * 1.2, radius * 0.72, 0, 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 1;
        break;
      }
      case "QUASAR": {
        for (let index = 0; index < 3; index += 1) {
          context.beginPath();
          context.moveTo(radius * 0.66, -radius * 0.18);
          context.lineTo(radius * 1.28, -radius * 0.08);
          context.lineTo(radius * 1.5, 0);
          context.lineTo(radius * 1.28, radius * 0.08);
          context.lineTo(radius * 0.66, radius * 0.18);
          context.closePath();
          context.fill();
          context.stroke();
          context.rotate((Math.PI * 2) / 3);
        }
        context.strokeStyle = `${color}b8`;
        context.lineWidth = 4;
        for (let index = 0; index < 3; index += 1) {
          context.beginPath();
          context.arc(
            0,
            0,
            radius * 1.16,
            index * ((Math.PI * 2) / 3) + 0.22,
            index * ((Math.PI * 2) / 3) + 1.52,
          );
          context.stroke();
        }
        break;
      }
      case "NEXUS": {
        for (let index = 0; index < 6; index += 1) {
          context.beginPath();
          context.moveTo(radius * 0.7, -radius * 0.2);
          context.lineTo(radius * 1.2, -radius * 0.3);
          context.lineTo(radius * 1.44, 0);
          context.lineTo(radius * 1.2, radius * 0.3);
          context.lineTo(radius * 0.7, radius * 0.2);
          context.closePath();
          context.fill();
          context.stroke();
          context.rotate(Math.PI / 3);
        }
        context.strokeStyle = `${color}b8`;
        context.lineWidth = 4;
        context.beginPath();
        for (let index = 0; index < 6; index += 1) {
          const angle = index * (Math.PI / 3);
          const x = Math.cos(angle) * radius * 1.22;
          const y = Math.sin(angle) * radius * 1.22;
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        context.stroke();
        break;
      }
    }

    context.restore();
  }

  private drawTierPips(
    context: CanvasRenderingContext2D,
    className: SystemClass,
    radius: number,
    color: string,
  ): void {
    const count: Readonly<Record<SystemClass, number>> = {
      PULSAR: 1,
      GIANT: 2,
      QUASAR: 3,
      NEXUS: 4,
    };
    const pipCount = count[className];
    const spacing = Math.min(12, radius * 0.2);
    const startX = -((pipCount - 1) * spacing) / 2;
    const y = radius * 0.38;

    context.save();
    context.fillStyle = "#f4fcff";
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.shadowColor = color;
    context.shadowBlur = 7;
    for (let index = 0; index < pipCount; index += 1) {
      const x = startX + index * spacing;
      context.beginPath();
      context.moveTo(x, y - 3.4);
      context.lineTo(x + 3.8, y);
      context.lineTo(x, y + 3.4);
      context.lineTo(x - 3.8, y);
      context.closePath();
      context.fill();
      context.stroke();
    }
    context.restore();
  }
}
