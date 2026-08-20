import type { Trend, YearBucket } from "./domain";

export const TREND_MIN_PREVIOUS = 5;
export const TREND_GROWTH_FACTOR = 1.25;
export const TREND_DECLINE_FACTOR = 0.75;
export const TREND_PREVIOUS_YEARS = 2;
export const TREND_RECENT_YEARS = 2;
export const TREND_YEAR_WINDOW = TREND_PREVIOUS_YEARS + TREND_RECENT_YEARS;

export function deriveTrend(yearBuckets: YearBucket[], now?: Date): Trend {
  const anchorYear = (now ?? new Date()).getFullYear();
  const previousStartYear =
    anchorYear - (TREND_PREVIOUS_YEARS + TREND_RECENT_YEARS);
  const countsByYear = new Map(
    yearBuckets.map((bucket) => [bucket.year, bucket.publications]),
  );

  const [previousYearA, previousYearB, recentYearA, recentYearB] = [
    previousStartYear,
    previousStartYear + 1,
    anchorYear - TREND_RECENT_YEARS,
    anchorYear - 1,
  ].map((year) => countsByYear.get(year));

  if (
    previousYearA === undefined ||
    previousYearB === undefined ||
    recentYearA === undefined ||
    recentYearB === undefined
  ) {
    return "insufficient_data";
  }

  const previous = previousYearA + previousYearB;
  const recent = recentYearA + recentYearB;
  if (previous < TREND_MIN_PREVIOUS) return "insufficient_data";
  if (recent >= previous * TREND_GROWTH_FACTOR) return "growing";
  if (recent <= previous * TREND_DECLINE_FACTOR) return "declining";
  return "stable";
}
