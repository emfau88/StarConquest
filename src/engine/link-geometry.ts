import type {
  EnergyLinkView,
  Point,
  StarSystemView,
} from "../core/types";

export interface LinkCurve {
  source: Point;
  control: Point;
  target: Point;
}

type LinkLaneView = Pick<
  EnergyLinkView,
  "id" | "sourceId" | "targetId"
>;

const RECIPROCAL_LANE_OFFSET = 10;

export function getLinkLaneOffset(
  link: LinkLaneView,
  links: readonly LinkLaneView[],
): number {
  const hasReciprocalLink = links.some(
    (candidate) =>
      candidate.id !== link.id &&
      candidate.sourceId === link.targetId &&
      candidate.targetId === link.sourceId,
  );
  if (!hasReciprocalLink) {
    return 0;
  }
  return RECIPROCAL_LANE_OFFSET;
}

export function getLinkCurve(
  _link: Pick<EnergyLinkView, "id">,
  source: StarSystemView,
  target: StarSystemView,
  laneOffset = 0,
): LinkCurve {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const offsetX = (-dy / length) * laneOffset;
  const offsetY = (dx / length) * laneOffset;
  const shiftedSource = {
    x: source.position.x + offsetX,
    y: source.position.y + offsetY,
  };
  const shiftedTarget = {
    x: target.position.x + offsetX,
    y: target.position.y + offsetY,
  };
  return {
    source: shiftedSource,
    control: {
      x: (shiftedSource.x + shiftedTarget.x) / 2,
      y: (shiftedSource.y + shiftedTarget.y) / 2,
    },
    target: shiftedTarget,
  };
}

export function pointOnLink(curve: LinkCurve, fraction: number): Point {
  const t = Math.max(0, Math.min(1, fraction));
  const inverse = 1 - t;
  return {
    x:
      inverse * inverse * curve.source.x +
      2 * inverse * t * curve.control.x +
      t * t * curve.target.x,
    y:
      inverse * inverse * curve.source.y +
      2 * inverse * t * curve.control.y +
      t * t * curve.target.y,
  };
}

export function distanceToSegment(
  point: Point,
  start: Point,
  end: Point,
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const fraction = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
    ),
  );
  return Math.hypot(
    point.x - (start.x + dx * fraction),
    point.y - (start.y + dy * fraction),
  );
}
