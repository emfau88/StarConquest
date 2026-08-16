import type {
  CutPreview,
  EnergyLinkView,
  Owner,
  Point,
  SceneSnapshot,
  SectorTheme,
  StarSystemView,
  SystemClass,
  SystemThreatView,
  TutorialCue,
  VisualEffect,
} from "../core/types";
import {
  combatFrontFraction,
  findHostileReciprocalLink,
} from "../core/link-combat";
import {
  CanvasViewport,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from "./CanvasViewport";
import {
  getLinkCurve,
  getLinkLaneOffset,
  pointOnLink,
} from "./link-geometry";
import {
  FleetShipArtLibrary,
  isShipArtReady,
  type ShipRole,
} from "./ShipArt";
import {
  activeConvoyDistances,
  convoyShipCount,
  formingConvoyDistances,
} from "./fleet-motion";
import { SYSTEM_RADII } from "./system-geometry";
import { getImageAsset } from "./ImageAssetCache";
import {
  BACKDROP_URLS,
  CAPTURE_BURST_URL,
  TUTORIAL_GESTURE_URLS,
} from "./RuntimeAssets";
import {
  isSystemArtReady,
  SystemArtLibrary,
} from "./SystemArt";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
}

const OWNER_COLORS: Readonly<Record<Owner, string>> = Object.freeze({
  player: "#39c2ff",
  enemy: "#ff685f",
  enemy2: "#ffb14a",
  neutral: "#b8c8dd",
});
const ENERGY_PULSE_SPEED_PIXELS_PER_SECOND = 250;
const SYSTEM_ARTWORK_SCALE = 2.84;
const SYSTEM_HALO_SCALE = 1.72;
const SYSTEM_ARTWORK_DRAW_OFFSETS: Readonly<
  Record<Owner, Readonly<Record<SystemClass, Point>>>
> = Object.freeze({
  player: {
    PULSAR: { x: -1 / 640, y: -23 / 640 },
    GIANT: { x: 5 / 640, y: 3 / 640 },
    QUASAR: { x: -18 / 512, y: 20 / 512 },
    NEXUS: { x: 1 / 640, y: -5 / 640 },
  },
  enemy: {
    PULSAR: { x: -13 / 640, y: -12 / 640 },
    GIANT: { x: 0, y: 1 / 640 },
    QUASAR: { x: 20 / 512, y: 24 / 512 },
    NEXUS: { x: 0, y: 8 / 640 },
  },
  enemy2: {
    PULSAR: { x: 0, y: -25 / 414 },
    GIANT: { x: -1 / 512, y: -17 / 512 },
    QUASAR: { x: 2 / 512, y: 1 / 512 },
    NEXUS: { x: 0, y: -21 / 512 },
  },
  neutral: {
    PULSAR: { x: 1 / 640, y: 11 / 640 },
    GIANT: { x: -2 / 640, y: -13 / 640 },
    QUASAR: { x: 1 / 640, y: 14 / 640 },
    NEXUS: { x: 1 / 640, y: 14 / 640 },
  },
});

export const systemArtworkDrawOffset = (
  owner: Owner,
  className: SystemClass,
): Point => SYSTEM_ARTWORK_DRAW_OFFSETS[owner][className];

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
  private readonly backdropImages: Partial<
    Record<SectorTheme, HTMLImageElement>
  > = {};
  private captureBurstImage: HTMLImageElement | null = null;
  private readonly tutorialGestureImages: Partial<
    Record<TutorialCue["kind"], HTMLImageElement>
  > = {};
  private readonly fleetShipArt = new FleetShipArtLibrary();
  private readonly systemArt = new SystemArtLibrary();

  constructor(private readonly viewport: CanvasViewport) {}

  render(scene: SceneSnapshot): void {
    const context = this.viewport.context;
    const metrics = this.viewport.getMetrics();
    this.viewport.prepareScreenSpace();
    context.clearRect(0, 0, metrics.cssWidth, metrics.cssHeight);
    this.drawBackdrop(context, scene.elapsedSeconds, scene.theme);

    this.viewport.enterWorldSpace();
    this.drawWorld(context, scene);
  }

  private getBackdropImage(theme: SectorTheme): HTMLImageElement {
    const cached = this.backdropImages[theme];
    if (cached) {
      return cached;
    }
    const image = getImageAsset(BACKDROP_URLS[theme]);
    this.backdropImages[theme] = image;
    return image;
  }

  private getCaptureBurstImage(): HTMLImageElement {
    if (!this.captureBurstImage) {
      this.captureBurstImage = getImageAsset(CAPTURE_BURST_URL);
    }
    return this.captureBurstImage;
  }

  private getTutorialGestureImage(
    kind: TutorialCue["kind"],
  ): HTMLImageElement {
    const cached = this.tutorialGestureImages[kind];
    if (cached) {
      return cached;
    }
    const image = getImageAsset(TUTORIAL_GESTURE_URLS[kind]);
    this.tutorialGestureImages[kind] = image;
    return image;
  }

  private drawBackdrop(
    context: CanvasRenderingContext2D,
    elapsedSeconds: number,
    theme: SectorTheme,
  ): void {
    const { cssWidth, cssHeight, safeRect } = this.viewport.getMetrics();
    const backdropImage = this.getBackdropImage(theme);
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

    const drawnLinkIds = new Set<string>();
    for (const link of scene.links) {
      if (drawnLinkIds.has(link.id)) {
        continue;
      }
      const source = systems.get(link.sourceId);
      const target = systems.get(link.targetId);
      if (source && target) {
        const reciprocal = findHostileReciprocalLink(
          link,
          scene.links,
        );
        if (reciprocal) {
          drawnLinkIds.add(link.id);
          drawnLinkIds.add(reciprocal.id);
          this.drawContestedRoute(
            context,
            link,
            reciprocal,
            source,
            target,
            scene.elapsedSeconds,
          );
          continue;
        }
        drawnLinkIds.add(link.id);
        this.drawLink(
          context,
          link,
          source,
          target,
          scene.links,
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

    for (const threat of scene.threats) {
      const system = systems.get(threat.systemId);
      if (system) {
        this.drawThreatIndicator(
          context,
          system,
          threat,
          scene.elapsedSeconds,
        );
      }
    }

    if (scene.tutorialCue) {
      this.drawTutorialCue(
        context,
        scene.tutorialCue,
        scene.elapsedSeconds,
      );
    }

    this.drawCutTrail(context, scene.cutTrail);
    if (scene.cutPreview) {
      this.drawCutPreview(context, scene.cutPreview);
    }
    for (const effect of scene.effects) {
      this.drawEffect(context, effect);
    }

    if (scene.paused) {
      context.fillStyle = "rgba(3, 9, 20, 0.5)";
      context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }

    context.restore();
  }

  private drawContestedRoute(
    context: CanvasRenderingContext2D,
    forward: EnergyLinkView,
    reverse: EnergyLinkView,
    source: StarSystemView,
    target: StarSystemView,
    elapsedSeconds: number,
  ): void {
    const curve = getLinkCurve(forward, source, target);
    const hasFront =
      Number.isFinite(forward.combatFrontFraction) ||
      Number.isFinite(reverse.combatFrontFraction);
    const frontFraction = hasFront
      ? combatFrontFraction(forward, reverse)
      : 0.5;
    const forwardReach = hasFront
      ? frontFraction
      : forward.state === "active"
        ? 1
        : forward.growProgress;
    const reverseReach = hasFront
      ? frontFraction
      : reverse.state === "active"
        ? 0
        : 1 - reverse.growProgress;
    const forwardColor = OWNER_COLORS[forward.owner];
    const reverseColor = OWNER_COLORS[reverse.owner];

    context.save();
    context.lineCap = "round";
    context.strokeStyle = "rgba(2, 10, 30, 0.84)";
    context.lineWidth = 8;
    this.strokeLinkRange(context, curve, 0, 1);

    this.drawFrontSegment(
      context,
      curve,
      0,
      forwardReach,
      forwardColor,
      forward.intensity,
    );
    this.drawFrontSegment(
      context,
      curve,
      1,
      reverseReach,
      reverseColor,
      reverse.intensity,
    );

    this.drawRouteFleet(
      context,
      curve,
      0,
      forwardReach,
      forward,
      true,
      7,
    );
    this.drawRouteFleet(
      context,
      curve,
      1,
      reverseReach,
      reverse,
      true,
      7,
    );

    if (hasFront) {
      this.drawBattleBand(
        context,
        curve,
        frontFraction,
        forward,
        reverse,
        elapsedSeconds,
      );
    }
    context.restore();
  }

  private drawFrontSegment(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    start: number,
    end: number,
    color: string,
    intensity: number,
  ): void {
    context.shadowColor = color;
    context.shadowBlur = 6;
    context.strokeStyle = `${color}58`;
    context.lineWidth = 4 + intensity;
    this.strokeLinkRange(context, curve, start, end);
    context.shadowBlur = 1;
    context.strokeStyle = `${color}ed`;
    context.lineWidth = 2 + intensity * 0.55;
    this.strokeLinkRange(context, curve, start, end);
  }

  private visibleFleetCount(
    link: EnergyLinkView,
    maximum: number,
  ): number {
    const visualFlow = Math.max(
      link.flowPerSecond,
      Math.min(2.4, link.unitsInTransit / 6),
    );
    return Math.min(
      maximum,
      Math.max(1, 1 + Math.floor(visualFlow / 2.2)),
    );
  }

  private roleForFleetSlot(
    index: number,
    count: number,
  ): ShipRole {
    if (count >= 4 && index === count - 1) {
      return "cruiser";
    }
    return index % 2 === 1 ? "interceptor" : "transport";
  }

  private drawRouteFleet(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    routeStart: number,
    routeEnd: number,
    link: EnergyLinkView,
    isAttacking: boolean,
    maximumShips: number,
  ): void {
    const routeFraction = Math.abs(routeEnd - routeStart);
    const routeLength = Math.max(
      1,
      Math.hypot(
        curve.target.x - curve.source.x,
        curve.target.y - curve.source.y,
      ),
    );
    if (routeFraction < 0.045 || link.unitsInTransit <= 0.25) {
      return;
    }
    const segmentLength = routeLength * routeFraction;
    const direction = routeEnd >= routeStart ? 1 : -1;
    const distances =
      link.state === "growing"
        ? formingConvoyDistances(
            link.ageSeconds,
            segmentLength,
            routeLength,
            maximumShips,
          )
        : activeConvoyDistances(
            link.ageSeconds,
            segmentLength,
            maximumShips,
          );
    const targetShipCount = convoyShipCount(
      link.state === "growing" ? routeLength : segmentLength,
      maximumShips,
    );
    const color = OWNER_COLORS[link.owner];

    for (let index = 0; index < distances.length; index += 1) {
      const travelled = distances[index];
      const segmentPhase = travelled / segmentLength;
      const fraction =
        routeStart + direction * (travelled / routeLength);
      if (
        isAttacking &&
        link.state === "active" &&
        direction > 0 &&
        routeEnd > 0.97 &&
        segmentPhase > 0.9
      ) {
        this.drawDeliveryImpact(
          context,
          curve,
          link.owner,
          (segmentPhase - 0.9) / 0.1,
          link.intensity,
        );
      }
      const point = pointOnLink(curve, fraction);
      const tangent = this.tangentOnLink(curve, fraction);
      this.drawFleetShip(
        context,
        point,
        Math.atan2(tangent.y, tangent.x) +
          (direction < 0 ? Math.PI : 0),
        link.owner,
        color,
        link.intensity,
        isAttacking,
        this.roleForFleetSlot(index, targetShipCount),
        1,
      );
    }

    if (link.state === "growing") {
      const pioneerFraction = Math.max(0, Math.min(1, routeEnd));
      const pioneerPoint = pointOnLink(curve, pioneerFraction);
      const pioneerTangent = this.tangentOnLink(curve, pioneerFraction);
      const pioneerAngle =
        Math.atan2(pioneerTangent.y, pioneerTangent.x) +
        (direction < 0 ? Math.PI : 0);
      this.drawPioneerMarker(
        context,
        pioneerPoint,
        pioneerAngle,
        color,
        link.ageSeconds,
      );
      this.drawFleetShip(
        context,
        pioneerPoint,
        pioneerAngle,
        link.owner,
        color,
        link.intensity,
        isAttacking,
        "interceptor",
        0.88,
      );
    }
  }

  private drawPioneerMarker(
    context: CanvasRenderingContext2D,
    position: Point,
    angle: number,
    color: string,
    ageSeconds: number,
  ): void {
    const pulse = 0.5 + Math.sin(ageSeconds * 9) * 0.5;
    context.save();
    context.translate(position.x, position.y);
    context.rotate(angle);
    context.globalAlpha = 0.68 + pulse * 0.22;
    context.strokeStyle = "#f2fcff";
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 7 + pulse * 5;
    context.lineWidth = 1.6;
    context.beginPath();
    context.arc(0, 0, 27 + pulse * 2, -0.82, 0.82);
    context.stroke();
    context.beginPath();
    context.moveTo(31 + pulse * 2, 0);
    context.lineTo(24, -4.5);
    context.lineTo(24, 4.5);
    context.closePath();
    context.fill();
    context.restore();
  }

  private drawDeliveryImpact(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    owner: Owner,
    progress: number,
    intensity: number,
  ): void {
    const target = pointOnLink(curve, 1);
    const normalized = Math.max(0, Math.min(1, progress));
    const alpha = (1 - normalized) * (0.32 + intensity * 0.22);
    const color = OWNER_COLORS[owner];
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = "#f7fdff";
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 8;
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(
      target.x,
      target.y,
      8 + normalized * 15,
      0,
      Math.PI * 2,
    );
    context.stroke();
    context.globalAlpha = alpha * 0.55;
    context.beginPath();
    context.arc(target.x, target.y, 4 + normalized * 7, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private drawBattleBand(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    frontFraction: number,
    forward: EnergyLinkView,
    reverse: EnergyLinkView,
    elapsedSeconds: number,
  ): void {
    const front = pointOnLink(curve, frontFraction);
    const tangent = this.tangentOnLink(curve, frontFraction);
    const angle = Math.atan2(tangent.y, tangent.x);
    const combinedIntensity = (forward.intensity + reverse.intensity) / 2;
    const halfWidth = 13 + combinedIntensity * 8;
    const pulse = 0.5 + Math.sin(elapsedSeconds * 10) * 0.5;
    const forwardCount = Math.min(
      3,
      this.visibleFleetCount(forward, 3),
    );
    const reverseCount = Math.min(
      3,
      this.visibleFleetCount(reverse, 3),
    );
    const forwardColor = OWNER_COLORS[forward.owner];
    const reverseColor = OWNER_COLORS[reverse.owner];

    context.save();
    context.translate(front.x, front.y);
    context.rotate(angle);

    const bandGlow = context.createRadialGradient(0, 0, 1, 0, 0, halfWidth);
    bandGlow.addColorStop(0, "rgba(255, 249, 213, 0.38)");
    bandGlow.addColorStop(0.45, "rgba(255, 205, 91, 0.13)");
    bandGlow.addColorStop(1, "rgba(255, 205, 91, 0)");
    context.fillStyle = bandGlow;
    context.beginPath();
    context.ellipse(0, 0, 11 + pulse * 3, halfWidth, 0, 0, Math.PI * 2);
    context.fill();

    context.lineCap = "round";
    context.lineWidth = 2.2;
    context.shadowBlur = 7;
    context.globalAlpha = 0.72;
    context.strokeStyle = forwardColor;
    context.shadowColor = forwardColor;
    context.beginPath();
    context.moveTo(0, -halfWidth);
    context.lineTo(0, -2);
    context.stroke();
    context.strokeStyle = reverseColor;
    context.shadowColor = reverseColor;
    context.beginPath();
    context.moveTo(0, 2);
    context.lineTo(0, halfWidth);
    context.stroke();

    const lateralOffsets = [-0.55, 0.55, 0];
    const drawSide = (
      link: EnergyLinkView,
      count: number,
      direction: 1 | -1,
    ): void => {
      const color = OWNER_COLORS[link.owner];
      for (let index = 0; index < count; index += 1) {
        const lateral =
          lateralOffsets[index] * halfWidth +
          Math.sin(elapsedSeconds * 3.2 + index * 1.9) * 1.4;
        const longitudinal =
          direction * (10 + index * 6 + pulse * 1.5);
        const firePhase =
          (elapsedSeconds * 1.75 + index * 0.31 +
            (direction > 0 ? 0.17 : 0)) %
          1;
        if (firePhase < 0.2) {
          context.save();
          context.globalAlpha = (1 - firePhase / 0.2) * 0.7;
          context.strokeStyle = "#fff7cf";
          context.shadowColor = color;
          context.shadowBlur = 5;
          context.lineWidth = 1.2;
          context.beginPath();
          context.moveTo(longitudinal - direction * 3, lateral);
          context.lineTo(
            longitudinal - direction * (10 + firePhase * 18),
            lateral * 0.58,
          );
          context.stroke();
          context.restore();
        }
        this.drawFleetShip(
          context,
          { x: longitudinal, y: lateral },
          direction > 0 ? Math.PI : 0,
          link.owner,
          color,
          link.intensity,
          true,
          count >= 3 && index === count - 1
            ? "cruiser"
            : this.roleForFleetSlot(index, count),
          0.54,
        );
      }
    };

    drawSide(forward, forwardCount, -1);
    drawSide(reverse, reverseCount, 1);

    context.globalAlpha = 0.5 + pulse * 0.3;
    context.strokeStyle = "#fff2b8";
    context.shadowColor = "#ffcf66";
    context.shadowBlur = 7;
    context.lineWidth = 1.4;
    for (let index = -1; index <= 1; index += 1) {
      const sparkOffset = index * halfWidth * 0.3;
      context.beginPath();
      context.moveTo(-2 - pulse * 2, sparkOffset - 3);
      context.lineTo(3 + pulse * 4, sparkOffset + 3);
      context.stroke();
    }
    context.restore();
  }

  private drawLink(
    context: CanvasRenderingContext2D,
    link: EnergyLinkView,
    source: StarSystemView,
    target: StarSystemView,
    links: readonly EnergyLinkView[],
  ): void {
    const color = OWNER_COLORS[link.owner];
    const curve = getLinkCurve(
      link,
      source,
      target,
      getLinkLaneOffset(link, links),
    );
    const progress = Math.max(0, Math.min(1, link.growProgress));
    const isAttacking = target.owner !== link.owner;
    const routeLength = Math.max(
      1,
      Math.hypot(
        curve.target.x - curve.source.x,
        curve.target.y - curve.source.y,
      ),
    );

    context.save();
    context.lineCap = "round";
    context.strokeStyle = "rgba(2, 12, 34, 0.76)";
    context.lineWidth = 6.5;
    this.strokeLinkProgress(context, curve, progress);

    context.shadowColor = color;
    context.shadowBlur = isAttacking ? 7 : 4;
    context.strokeStyle = `${color}${isAttacking ? "50" : "38"}`;
    context.lineWidth = 3.6 + link.intensity * 0.9;
    this.strokeLinkProgress(context, curve, progress);

    context.shadowBlur = 1;
    context.strokeStyle = link.state === "growing" ? "#e9fbff" : `${color}e8`;
    context.lineWidth = 1.8 + link.intensity * 0.65;
    this.strokeLinkProgress(context, curve, progress);

    const visualFlow = Math.max(
      link.flowPerSecond,
      Math.min(2.4, link.unitsInTransit / 6),
    );
    const chargePulseCount =
      progress > 0.05
        ? Math.min(10, Math.max(1, Math.ceil(visualFlow / 1.25)))
        : 0;
    for (let index = 0; index < chargePulseCount; index += 1) {
      const phase =
        (link.ageSeconds * ENERGY_PULSE_SPEED_PIXELS_PER_SECOND +
          ((index + 0.5) * routeLength) /
            Math.max(1, chargePulseCount)) %
        routeLength;
      const t = phase / routeLength;
      if (t > progress - 0.035 || t < 0.035) {
        continue;
      }
      const point = pointOnLink(curve, t);
      const tangent = this.tangentOnLink(curve, t);
      context.save();
      context.translate(point.x, point.y);
      context.rotate(Math.atan2(tangent.y, tangent.x));
      context.globalAlpha =
        (isAttacking ? 0.34 : 0.24) + link.intensity * 0.24;
      context.fillStyle = "#f4fcff";
      context.beginPath();
      context.roundRect(
        -4 - link.intensity * 1.5,
        -1.1,
        8 + link.intensity * 3,
        2.2,
        1.1,
      );
      context.fill();
      context.restore();
    }

    if (progress > 0.045 && link.unitsInTransit > 0.25) {
      this.drawRouteFleet(
        context,
        curve,
        0,
        progress,
        link,
        isAttacking,
        isAttacking ? 7 : 6,
      );
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

  private drawFleetShip(
    context: CanvasRenderingContext2D,
    position: Point,
    angle: number,
    owner: Owner,
    color: string,
    intensity: number,
    isAttacking: boolean,
    role: ShipRole,
    presentationScale: number,
  ): void {
    const roleScale =
      role === "interceptor" ? 0.86 : role === "cruiser" ? 1.12 : 1;
    const scale =
      (1 + intensity * 0.08 + (isAttacking ? 0.03 : 0)) *
      roleScale *
      presentationScale;
    context.save();
    context.translate(position.x, position.y);
    context.rotate(angle);
    context.scale(scale, scale);

    const exhaustStart = isAttacking ? -30 : -24;
    const exhaust = context.createLinearGradient(exhaustStart, 0, -10, 0);
    exhaust.addColorStop(0, `${color}00`);
    exhaust.addColorStop(0.46, `${color}${isAttacking ? "b8" : "82"}`);
    exhaust.addColorStop(1, "#e7fbff");
    context.fillStyle = exhaust;
    context.shadowColor = color;
    context.shadowBlur = isAttacking ? 10 : 6;
    context.beginPath();
    context.moveTo(exhaustStart, 0);
    context.lineTo(-10, -4);
    context.lineTo(-10, 4);
    context.closePath();
    context.fill();

    const artwork = this.fleetShipArt.get(owner, role);
    if (isShipArtReady(artwork)) {
      context.shadowBlur = 0;
      context.fillStyle = "rgba(1, 8, 24, 0.58)";
      context.beginPath();
      context.ellipse(0, 0, 43, 22, 0, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = color;
      context.shadowBlur = isAttacking ? 10 : 7;
      context.drawImage(artwork, -42, -24, 84, 48);
      context.restore();
      return;
    }

    context.scale(1.55, 1.55);
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

    context.fillStyle =
      owner === "player"
        ? "#153c78"
        : owner === "enemy2"
          ? "#725013"
          : "#55233a";
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

  private strokeLinkRange(
    context: CanvasRenderingContext2D,
    curve: ReturnType<typeof getLinkCurve>,
    startFraction: number,
    endFraction: number,
  ): void {
    const start = Math.max(0, Math.min(1, startFraction));
    const end = Math.max(0, Math.min(1, endFraction));
    const distance = Math.abs(end - start);
    const segments = Math.max(2, Math.ceil(32 * distance));
    context.beginPath();
    const startPoint = pointOnLink(curve, start);
    context.moveTo(startPoint.x, startPoint.y);
    for (let index = 1; index <= segments; index += 1) {
      const fraction = start + (end - start) * (index / segments);
      const point = pointOnLink(curve, fraction);
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

  private drawCutPreview(
    context: CanvasRenderingContext2D,
    preview: CutPreview,
  ): void {
    const displayEnergy = (energy: number): string =>
      String(Math.round(energy * 10) / 10);
    const label =
      `→ ${displayEnergy(preview.forwardEnergy)}   ` +
      `↩ ${displayEnergy(preview.returnedEnergy)}`;
    const color = preview.prominentBoost ? "#ffd65a" : "#c7efff";

    context.save();
    this.drawCutFlow(
      context,
      preview.position,
      preview.source,
      "#56d8ff",
    );
    this.drawCutFlow(
      context,
      preview.position,
      preview.target,
      "#ffd65a",
    );
    if (
      preview.frontlineResistance !== undefined &&
      preview.frontlineResistance > 0
    ) {
      context.save();
      context.fillStyle = "rgba(22, 7, 20, 0.88)";
      context.strokeStyle = "#ff8178";
      context.shadowColor = "#ff685f";
      context.shadowBlur = 10;
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(
        preview.target.x,
        preview.target.y,
        18,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.stroke();
      context.fillStyle = "#fff4ee";
      context.shadowBlur = 0;
      context.font = "800 13px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        displayEnergy(preview.frontlineResistance),
        preview.target.x,
        preview.target.y + 0.5,
      );
      context.restore();
    }
    context.font = "800 18px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const width = context.measureText(label).width + 30;
    const labelX = Math.max(
      width / 2 + 12,
      Math.min(LOGICAL_WIDTH - width / 2 - 12, preview.position.x),
    );
    const labelY = Math.max(28, preview.position.y - 48);

    context.fillStyle = "rgba(3, 14, 38, 0.9)";
    context.strokeStyle = color;
    context.lineWidth = 2.5;
    context.shadowColor = color;
    context.shadowBlur = preview.prominentBoost ? 16 : 8;
    context.beginPath();
    context.roundRect(labelX - width / 2, labelY - 18, width, 36, 12);
    context.fill();
    context.stroke();

    context.fillStyle = "#f7fcff";
    context.shadowBlur = 0;
    context.fillText(label, labelX, labelY + 1);

    context.strokeStyle = color;
    context.lineWidth = 4;
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(
      preview.position.x,
      preview.position.y,
      preview.prominentBoost ? 13 : 10,
      0,
      Math.PI * 2,
    );
    context.stroke();
    context.restore();
  }

  private drawCutFlow(
    context: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    color: string,
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) {
      return;
    }

    const directionX = dx / distance;
    const directionY = dy / distance;
    const startDistance = Math.min(18, distance * 0.12);
    const endDistance = Math.max(startDistance, distance - 22);
    const arrowDistance =
      startDistance + (endDistance - startDistance) * 0.52;
    const arrowX = from.x + directionX * arrowDistance;
    const arrowY = from.y + directionY * arrowDistance;
    const normalX = -directionY;
    const normalY = directionX;

    context.save();
    context.globalAlpha = 0.92;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 12;
    context.lineCap = "round";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(
      from.x + directionX * startDistance,
      from.y + directionY * startDistance,
    );
    context.lineTo(
      from.x + directionX * endDistance,
      from.y + directionY * endDistance,
    );
    context.stroke();

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(
      arrowX + directionX * 11,
      arrowY + directionY * 11,
    );
    context.lineTo(
      arrowX - directionX * 8 + normalX * 7,
      arrowY - directionY * 8 + normalY * 7,
    );
    context.lineTo(
      arrowX - directionX * 8 - normalX * 7,
      arrowY - directionY * 8 - normalY * 7,
    );
    context.closePath();
    context.fill();
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
    } else if (
      (effect.kind === "route-surge" ||
        effect.kind === "route-recall") &&
      effect.targetPosition
    ) {
      this.drawRouteSplitEffect(context, effect, progress, color);
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
    } else if (effect.kind === "front-break") {
      const radius = 9 + progress * 22;
      context.strokeStyle = "#fff3bd";
      context.fillStyle = color;
      context.lineWidth = 3.5 - progress * 1.5;
      context.shadowColor = color;
      context.shadowBlur = 16 - progress * 8;
      context.beginPath();
      context.arc(
        effect.position.x,
        effect.position.y,
        radius,
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.globalAlpha = alpha * 0.65;
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI * 2 * index) / 6;
        const inner = 7 + progress * 10;
        const outer = 15 + progress * 34;
        context.beginPath();
        context.moveTo(
          effect.position.x + Math.cos(angle) * inner,
          effect.position.y + Math.sin(angle) * inner,
        );
        context.lineTo(
          effect.position.x + Math.cos(angle) * outer,
          effect.position.y + Math.sin(angle) * outer,
        );
        context.stroke();
      }
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

  private drawRouteSplitEffect(
    context: CanvasRenderingContext2D,
    effect: VisualEffect,
    progress: number,
    ownerColor: string,
  ): void {
    const target = effect.targetPosition;
    if (!target) {
      return;
    }
    const dx = target.x - effect.position.x;
    const dy = target.y - effect.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) {
      return;
    }

    const directionX = dx / distance;
    const directionY = dy / distance;
    const normalX = -directionY;
    const normalY = directionX;
    const isSurge = effect.kind === "route-surge";
    const routeColor = isSurge ? "#ffd65a" : ownerColor;
    const fade = 1 - progress;
    const headProgress = 1 - (1 - progress) ** 2;
    const strengthScale =
      0.85 + Math.min(1, Math.max(0, effect.strength ?? 0) / 18) * 0.35;
    const trailLength = 0.2 + strengthScale * 0.06;
    const tailProgress = Math.max(0, headProgress - trailLength);
    const head = {
      x: effect.position.x + dx * headProgress,
      y: effect.position.y + dy * headProgress,
    };
    const tail = {
      x: effect.position.x + dx * tailProgress,
      y: effect.position.y + dy * tailProgress,
    };

    context.save();
    context.lineCap = "round";
    context.globalAlpha = fade * 0.3;
    context.strokeStyle = routeColor;
    context.shadowColor = routeColor;
    context.shadowBlur = 5;
    context.lineWidth = 2.2;
    context.setLineDash([9, 12]);
    context.lineDashOffset = -progress * 45;
    context.beginPath();
    context.moveTo(effect.position.x, effect.position.y);
    context.lineTo(target.x, target.y);
    context.stroke();
    context.setLineDash([]);

    const trail = context.createLinearGradient(
      tail.x,
      tail.y,
      head.x,
      head.y,
    );
    trail.addColorStop(0, `${routeColor}00`);
    trail.addColorStop(0.5, routeColor);
    trail.addColorStop(1, "#ffffff");
    context.globalAlpha = Math.min(1, fade * 1.7);
    context.strokeStyle = trail;
    context.shadowBlur = 13;
    context.lineWidth = 5.5 * strengthScale;
    context.beginPath();
    context.moveTo(tail.x, tail.y);
    context.lineTo(head.x, head.y);
    context.stroke();

    context.globalAlpha = fade * 0.72;
    context.strokeStyle = routeColor;
    context.lineWidth = 1.8 * strengthScale;
    for (let side = -1; side <= 1; side += 2) {
      const offset = side * 5.5 * strengthScale;
      const sideTailProgress = Math.max(
        0,
        headProgress - trailLength * 0.72,
      );
      context.beginPath();
      context.moveTo(
        effect.position.x +
          dx * sideTailProgress +
          normalX * offset,
        effect.position.y +
          dy * sideTailProgress +
          normalY * offset,
      );
      context.lineTo(
        head.x + normalX * offset * 0.35,
        head.y + normalY * offset * 0.35,
      );
      context.stroke();
    }

    const arrowLength = 11 * strengthScale;
    const arrowWidth = 6.5 * strengthScale;
    context.globalAlpha = Math.min(1, fade * 1.9);
    context.fillStyle = "#f9feff";
    context.shadowBlur = 9;
    context.beginPath();
    context.moveTo(
      head.x + directionX * arrowLength,
      head.y + directionY * arrowLength,
    );
    context.lineTo(
      head.x - directionX * arrowLength * 0.65 +
        normalX * arrowWidth,
      head.y - directionY * arrowLength * 0.65 +
        normalY * arrowWidth,
    );
    context.lineTo(
      head.x - directionX * arrowLength * 0.65 -
        normalX * arrowWidth,
      head.y - directionY * arrowLength * 0.65 -
        normalY * arrowWidth,
    );
    context.closePath();
    context.fill();

    if (progress < 0.38) {
      context.globalAlpha = (1 - progress / 0.38) * 0.8;
      context.strokeStyle = routeColor;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(
        effect.position.x,
        effect.position.y,
        8 + progress * 32,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }
    if (progress > 0.72) {
      const arrival = (progress - 0.72) / 0.28;
      context.globalAlpha = (1 - arrival) * 0.72;
      context.strokeStyle = routeColor;
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(
        target.x,
        target.y,
        6 + arrival * 20,
        0,
        Math.PI * 2,
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
    const size = 64 + eased * 88;
    const captureBurstImage = this.getCaptureBurstImage();

    if (
      captureBurstImage.complete &&
      captureBurstImage.naturalWidth > 0
    ) {
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = burstAlpha * 0.5;
      context.drawImage(
        captureBurstImage,
        effect.position.x - size / 2,
        effect.position.y - size / 2,
        size,
        size,
      );
      context.restore();
    }

    const ringRadius = 26 + eased * 58;
    context.globalAlpha = fadeOut * 0.7;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 12;
    context.lineWidth = 4 - progress * 2.2;
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
    context.globalAlpha = burstAlpha * 0.58;
    for (let index = 0; index < 4; index += 1) {
      const angle =
        effect.id * 0.73 + index * (Math.PI / 2) + progress * 0.24;
      const distance = 32 + eased * (34 + (index % 2) * 6);
      const particleSize = 2 + (1 - progress) * (index % 2 ? 1.5 : 2.5);
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

  private drawTutorialCue(
    context: CanvasRenderingContext2D,
    cue: TutorialCue,
    elapsedSeconds: number,
  ): void {
    const dx = cue.target.x - cue.source.x;
    const dy = cue.target.y - cue.source.y;
    const angle = Math.atan2(dy, dx);
    const pulse = 0.5 + Math.sin(elapsedSeconds * 3.2) * 0.5;
    const image = this.getTutorialGestureImage(cue.kind);

    context.save();
    context.globalAlpha = 0.72 + pulse * 0.18;
    context.strokeStyle = cue.kind === "connect" ? "#b9f2ff" : "#ffd77a";
    context.shadowColor = cue.kind === "connect" ? "#51cfff" : "#ffbd57";
    context.shadowBlur = 12;
    context.lineWidth = 3;
    context.setLineDash([12, 13]);
    context.lineDashOffset = -elapsedSeconds * 36;

    if (cue.kind === "connect") {
      context.beginPath();
      context.moveTo(cue.source.x, cue.source.y);
      context.lineTo(cue.target.x, cue.target.y);
      context.stroke();

      context.setLineDash([]);
      context.lineWidth = 4;
      context.beginPath();
      context.arc(
        cue.target.x,
        cue.target.y,
        48 + pulse * 8,
        0,
        Math.PI * 2,
      );
      context.stroke();

      this.drawTutorialGestureImage(
        context,
        image,
        {
          x: cue.source.x + dx * 0.53,
          y: cue.source.y + dy * 0.53,
        },
        angle - Math.PI,
        90 + pulse * 6,
      );
    } else {
      const routePoint = {
        x: cue.source.x + dx * 0.3,
        y: cue.source.y + dy * 0.3,
      };
      const length = Math.max(1, Math.hypot(dx, dy));
      const perpendicular = {
        x: -dy / length,
        y: dx / length,
      };
      const travel = (pulse - 0.5) * 28;
      const gesturePoint = {
        x: routePoint.x + perpendicular.x * travel,
        y: routePoint.y + perpendicular.y * travel,
      };

      context.setLineDash([]);
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(
        routePoint.x - perpendicular.x * 42,
        routePoint.y - perpendicular.y * 42,
      );
      context.lineTo(
        routePoint.x + perpendicular.x * 42,
        routePoint.y + perpendicular.y * 42,
      );
      context.stroke();

      this.drawTutorialGestureImage(
        context,
        image,
        gesturePoint,
        angle + Math.PI / 4,
        96 + pulse * 7,
      );
    }

    context.restore();
  }

  private drawTutorialGestureImage(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    position: Point,
    rotation: number,
    size: number,
  ): void {
    if (!image.complete || image.naturalWidth <= 0) {
      return;
    }
    context.save();
    context.translate(position.x, position.y);
    context.rotate(rotation);
    context.drawImage(image, -size / 2, -size / 2, size, size);
    context.restore();
  }

  private drawSystem(
    context: CanvasRenderingContext2D,
    system: StarSystemView,
    elapsedSeconds: number,
    focused: boolean,
  ): void {
    const color = OWNER_COLORS[system.owner];
    const currentRadius = SYSTEM_RADII[system.className];
    const morphProgress = Math.max(0, Math.min(1, system.morphProgress));
    const easedMorphProgress =
      morphProgress * morphProgress * (3 - 2 * morphProgress);
    const targetRadius = system.morphTargetClassName
      ? SYSTEM_RADII[system.morphTargetClassName]
      : currentRadius;
    const radius =
      currentRadius +
      (targetRadius - currentRadius) * easedMorphProgress;
    const phaseOffset = system.id.length * 0.31;
    const pulse =
      1 + Math.sin(elapsedSeconds * 2.1 + phaseOffset) * 0.035;
    const drawRadius = radius * pulse;
    const artwork = this.systemArt.get(system.owner, system.className);
    const hasArtwork = isSystemArtReady(artwork);
    const targetArtwork = system.morphTargetClassName
      ? this.systemArt.get(system.owner, system.morphTargetClassName)
      : undefined;
    const hasTargetArtwork = targetArtwork
      ? isSystemArtReady(targetArtwork)
      : false;
    const hasAnyArtwork = hasArtwork || hasTargetArtwork;
    const energyRatio = Math.max(
      0,
      Math.min(1, system.energy / system.capacity),
    );

    context.save();
    context.translate(system.position.x, system.position.y);

    if (!hasAnyArtwork) {
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
      radius * SYSTEM_HALO_SCALE,
    );
    halo.addColorStop(0, `${color}68`);
    halo.addColorStop(0.4, `${color}22`);
    halo.addColorStop(1, `${color}00`);
    context.fillStyle = halo;
    context.beginPath();
    context.arc(0, 0, radius * SYSTEM_HALO_SCALE, 0, Math.PI * 2);
    context.fill();

    if (hasAnyArtwork) {
      if (hasArtwork) {
        this.drawSystemArtwork(
          context,
          artwork,
          radius,
          pulse,
          color,
          focused,
          system.owner,
          system.className,
          hasTargetArtwork ? 1 - easedMorphProgress : 1,
        );
      }
      if (hasTargetArtwork) {
        this.drawSystemArtwork(
          context,
          targetArtwork!,
          radius,
          pulse,
          color,
          focused,
          system.owner,
          system.morphTargetClassName!,
          easedMorphProgress,
        );
      }
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

    if (system.morphTargetClassName) {
      this.drawSystemMorphEffect(
        context,
        radius,
        color,
        elapsedSeconds,
        morphProgress,
      );
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

    const energyLabel = String(Math.floor(system.energy));
    context.fillStyle = "#f4f9ff";
    const energyFontSize = Math.round(Math.max(18, radius * 0.5));
    context.font = `900 ${energyFontSize}px Inter, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    const energyMetrics = context.measureText(energyLabel);
    const energyX =
      (energyMetrics.actualBoundingBoxLeft -
        energyMetrics.actualBoundingBoxRight) /
      2;
    const energyY =
      (energyMetrics.actualBoundingBoxAscent -
        energyMetrics.actualBoundingBoxDescent) /
      2;
    context.lineWidth = Math.max(3, energyFontSize * 0.14);
    context.strokeStyle = "rgba(2, 12, 36, 0.72)";
    context.strokeText(energyLabel, energyX, energyY);
    context.shadowColor = "#03112c";
    context.shadowBlur = 10;
    context.fillText(energyLabel, energyX, energyY);
    context.shadowBlur = 0;

    this.drawConnectionSlots(context, system, radius, color, focused);
    context.restore();
  }

  private drawThreatIndicator(
    context: CanvasRenderingContext2D,
    system: StarSystemView,
    threat: SystemThreatView,
    elapsedSeconds: number,
  ): void {
    const pulse =
      0.5 + Math.sin(elapsedSeconds * 5.2 + system.id.length) * 0.5;
    const radius =
      SYSTEM_RADII[system.className] + 25 + pulse * 3;
    const color = "#ff8a70";

    context.save();
    context.translate(system.position.x, system.position.y);
    context.globalAlpha = 0.52 + threat.severity * 0.32;
    context.strokeStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 8 + threat.severity * 7;
    context.lineWidth = 3.5;
    context.setLineDash([9, 11]);
    context.lineDashOffset = elapsedSeconds * 24;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);

    const markerY = -radius - 16;
    context.fillStyle = "rgba(63, 18, 31, 0.94)";
    context.strokeStyle = "#ffd4c8";
    context.lineWidth = 2;
    context.shadowBlur = 10;
    context.beginPath();
    context.moveTo(0, markerY - 10);
    context.lineTo(11, markerY + 9);
    context.lineTo(-11, markerY + 9);
    context.closePath();
    context.fill();
    context.stroke();
    context.shadowBlur = 0;
    context.fillStyle = "#fff7f3";
    context.font = "900 14px Inter, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("!", 0, markerY + 3);
    context.restore();
  }

  private drawSystemArtwork(
    context: CanvasRenderingContext2D,
    artwork: HTMLImageElement,
    radius: number,
    pulse: number,
    color: string,
    focused: boolean,
    owner: Owner,
    className: SystemClass,
    alpha = 1,
  ): void {
    const size = radius * SYSTEM_ARTWORK_SCALE * pulse;
    const drawOffset = systemArtworkDrawOffset(owner, className);
    const drawX = -size / 2 + drawOffset.x * size;
    const drawY = -size / 2 + drawOffset.y * size;

    context.save();
    context.globalAlpha = Math.max(0, Math.min(1, alpha));
    context.shadowColor = color;
    context.shadowBlur = focused ? 22 : 10;
    context.drawImage(artwork, drawX, drawY, size, size);

    context.strokeStyle = focused ? `${color}e8` : `${color}b8`;
    context.lineWidth = focused ? 2.8 : 2;
    context.shadowColor = color;
    context.shadowBlur = focused ? 20 : 10;
    context.beginPath();
    context.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    context.stroke();
    context.shadowBlur = 0;
    context.restore();
  }

  private drawSystemMorphEffect(
    context: CanvasRenderingContext2D,
    radius: number,
    color: string,
    elapsedSeconds: number,
    progress: number,
  ): void {
    const ringRadius = radius + 15;
    const flash = Math.sin(progress * Math.PI);

    context.save();
    context.rotate(elapsedSeconds * 2.8);
    context.strokeStyle = `rgba(242, 252, 255, ${0.38 + flash * 0.48})`;
    context.shadowColor = color;
    context.shadowBlur = 8 + flash * 8;
    context.lineWidth = 2.5;
    context.setLineDash([10, 8]);
    context.lineDashOffset = -progress * 28;
    context.beginPath();
    context.arc(0, 0, ringRadius, 0, Math.PI * 2);
    context.stroke();

    context.setLineDash([]);
    context.fillStyle = "rgba(246, 253, 255, 0.92)";
    for (const direction of [-1, 1]) {
      const x = direction * ringRadius;
      context.beginPath();
      context.moveTo(x, -4);
      context.lineTo(x + direction * 6, 0);
      context.lineTo(x, 4);
      context.closePath();
      context.fill();
    }
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

  private drawConnectionSlots(
    context: CanvasRenderingContext2D,
    system: StarSystemView,
    radius: number,
    color: string,
    focused: boolean,
  ): void {
    const slotCount = Math.max(
      system.maxOutgoingLinks,
      system.outgoingLinkCount,
    );
    const spacing = 13;
    const counterWidth = focused ? 28 : 0;
    const slotsWidth = Math.max(0, (slotCount - 1) * spacing) + 10;
    const width = slotsWidth + counterWidth + 14;
    const height = 15;
    const y = radius + 21;
    const slotsCenterX = focused ? -counterWidth / 2 : 0;
    const startX = slotsCenterX - ((slotCount - 1) * spacing) / 2;

    context.save();
    context.fillStyle = "rgba(2, 12, 35, 0.9)";
    context.strokeStyle = focused ? "rgba(238, 251, 255, 0.8)" : `${color}78`;
    context.lineWidth = focused ? 1.5 : 1;
    context.beginPath();
    context.roundRect(-width / 2, y - height / 2, width, height, 7.5);
    context.fill();
    context.stroke();

    for (let index = 0; index < slotCount; index += 1) {
      const x = startX + index * spacing;
      const occupied = index < system.outgoingLinkCount;
      const overloaded = index >= system.maxOutgoingLinks;
      const slotColor = overloaded ? "#ff9b68" : color;
      context.fillStyle = occupied ? "#f4fcff" : "rgba(2, 17, 43, 0.92)";
      context.strokeStyle = occupied ? slotColor : `${slotColor}b0`;
      context.lineWidth = occupied ? 2 : 1.5;
      context.shadowColor = slotColor;
      context.shadowBlur = occupied ? 8 : 0;
      context.beginPath();
      context.arc(x, y, occupied ? 3.5 : 3.2, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }

    if (focused) {
      context.shadowBlur = 0;
      context.fillStyle = "rgba(233, 248, 255, 0.9)";
      context.font = "800 9px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        `${system.outgoingLinkCount}/${system.maxOutgoingLinks}`,
        slotsWidth / 2 + 1,
        y + 0.5,
      );
    }
    context.restore();
  }
}
