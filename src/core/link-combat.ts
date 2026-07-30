import type {
  EnergyLinkView,
  Point,
  StarSystemView,
} from "./types";

type ReciprocalLinkView = Pick<
  EnergyLinkView,
  "id" | "sourceId" | "targetId" | "owner" | "unitsInTransit"
> & Partial<Pick<EnergyLinkView, "combatFrontFraction">>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

export const findHostileReciprocalLink = <
  Link extends ReciprocalLinkView,
>(
  link: ReciprocalLinkView,
  links: readonly Link[],
): Link | undefined =>
  links.find(
    (candidate) =>
      candidate.id !== link.id &&
      candidate.sourceId === link.targetId &&
      candidate.targetId === link.sourceId &&
      candidate.owner !== link.owner,
  );

export const combatFrontTargetFraction = (
  forward: ReciprocalLinkView,
  reverse: ReciprocalLinkView,
): number => {
  const forwardStrength = Math.max(0, forward.unitsInTransit);
  const reverseStrength = Math.max(0, reverse.unitsInTransit);
  const combinedStrength = forwardStrength + reverseStrength;
  const advantage =
    (forwardStrength - reverseStrength) /
    Math.max(12, combinedStrength);
  return clamp(0.5 + advantage * 0.28, 0.24, 0.76);
};

export const combatFrontFraction = (
  forward: ReciprocalLinkView,
  reverse: ReciprocalLinkView,
): number => {
  if (Number.isFinite(forward.combatFrontFraction)) {
    return clamp(forward.combatFrontFraction ?? 0.5, 0, 1);
  }
  if (Number.isFinite(reverse.combatFrontFraction)) {
    return 1 - clamp(reverse.combatFrontFraction ?? 0.5, 0, 1);
  }
  return combatFrontTargetFraction(forward, reverse);
};

export const pointBetweenSystems = (
  source: StarSystemView,
  target: StarSystemView,
  fraction: number,
): Point => ({
  x: source.position.x +
    (target.position.x - source.position.x) * fraction,
  y: source.position.y +
    (target.position.y - source.position.y) * fraction,
});
