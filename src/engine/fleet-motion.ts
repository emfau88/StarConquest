export const FLEET_SHIP_SPEED_PIXELS_PER_SECOND = 205;

const TARGET_CONVOY_SPACING_PIXELS = 110;
const PIONEER_FOLLOW_GAP_PIXELS = 28;
const ROUTE_EDGE_PADDING_PIXELS = 7;

const positiveModulo = (value: number, modulus: number): number =>
  ((value % modulus) + modulus) % modulus;

export const convoyShipCount = (
  segmentLength: number,
  maximumShips: number,
): number => {
  if (segmentLength <= 0 || maximumShips <= 0) {
    return 0;
  }
  const minimumShips =
    segmentLength >= 220 ? 3 : segmentLength >= 105 ? 2 : 1;
  return Math.min(
    maximumShips,
    Math.max(
      minimumShips,
      Math.round(segmentLength / TARGET_CONVOY_SPACING_PIXELS),
    ),
  );
};

export const activeConvoyDistances = (
  ageSeconds: number,
  segmentLength: number,
  maximumShips: number,
): readonly number[] => {
  const shipCount = convoyShipCount(segmentLength, maximumShips);
  if (shipCount === 0) {
    return [];
  }
  const spacing = segmentLength / shipCount;
  const leadDistance = positiveModulo(
    ageSeconds * FLEET_SHIP_SPEED_PIXELS_PER_SECOND -
      PIONEER_FOLLOW_GAP_PIXELS,
    segmentLength,
  );
  return Array.from({ length: shipCount }, (_, index) =>
    positiveModulo(leadDistance - index * spacing, segmentLength),
  );
};

export const formingConvoyDistances = (
  ageSeconds: number,
  frontDistance: number,
  fullRouteLength: number,
  maximumShips: number,
): readonly number[] => {
  const shipCount = convoyShipCount(fullRouteLength, maximumShips);
  if (shipCount === 0 || frontDistance <= ROUTE_EDGE_PADDING_PIXELS * 2) {
    return [];
  }
  const spacing = fullRouteLength / shipCount;
  const leadDistance =
    ageSeconds * FLEET_SHIP_SPEED_PIXELS_PER_SECOND -
    PIONEER_FOLLOW_GAP_PIXELS;
  const maximumDistance = frontDistance - ROUTE_EDGE_PADDING_PIXELS;
  const distances: number[] = [];
  for (let index = 0; index < shipCount; index += 1) {
    const distance = leadDistance - index * spacing;
    if (
      distance >= ROUTE_EDGE_PADDING_PIXELS &&
      distance <= maximumDistance
    ) {
      distances.push(distance);
    }
  }
  return distances;
};
