import type { Trend, YearBucket } from "./domain";

export const TREND_MIN_PREVIOUS = 5;
export const TREND_GROWTH_FACTOR = 1.25;
export const TREND_DECLINE_FACTOR = 0.75;
export const TREND_YEAR_WINDOW = 4;

export function deriveTrend(yearBuckets: YearBucket[]): Trend {
  const sorted = [...yearBuckets].sort((a, b) => a.year - b.year);
  if (sorted.length < TREND_YEAR_WINDOW) return "insufficient_data";
  const window = sorted.slice(-TREND_YEAR_WINDOW);
  const previous = window[0].publications + window[1].publications;
  const recent = window[2].publications + window[3].publications;
  if (previous < TREND_MIN_PREVIOUS) return "insufficient_data";
  if (recent >= previous * TREND_GROWTH_FACTOR) return "growing";
  if (recent <= previous * TREND_DECLINE_FACTOR) return "declining";
  return "stable";
}
