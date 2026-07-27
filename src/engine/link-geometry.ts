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

const linkDirection = (id: string): number => {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }
  return Math.abs(hash) % 2 === 0 ? 1 : -1;
};

export function getLinkCurve(
  link: Pick<EnergyLinkView, "id">,
  source: StarSystemView,
  target: StarSystemView,
): LinkCurve {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const bend = Math.min(72, length * 0.12) * linkDirection(link.id);
  return {
    source: source.position,
    control: {
      x: (source.position.x + target.position.x) / 2 + (-dy / length) * bend,
      y: (source.position.y + target.position.y) / 2 + (dx / length) * bend,
    },
    target: target.position,
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
