import {
  BALANCE_PROFILES,
  simulateLevel,
} from "../src/balance/BalanceSimulator";
import { LEVELS } from "../src/data/levels";

const results = Object.values(BALANCE_PROFILES).flatMap((profile) =>
  LEVELS.map((level) => simulateLevel(level, profile))
);

console.table(
  results.map((result) => ({
    sector: result.sector,
    profile: result.profileId,
    status: result.status,
    seconds: result.elapsedSeconds.toFixed(1),
    stars: result.stars,
    actions: result.actions,
    cuts: result.cuts,
    captures: result.captures,
  })),
);

const failedExpertRuns = results.filter(
  (result) =>
    result.profileId === "expert" && result.status !== "won",
);
if (failedExpertRuns.length > 0) {
  console.error("Expert viability check failed.");
  process.exitCode = 1;
}
