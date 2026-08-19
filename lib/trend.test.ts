import { describe, expect, it } from "vitest";
import type { YearBucket } from "./domain";
import { deriveTrend } from "./trend";

function buckets(pairs: [year: number, publications: number][]): YearBucket[] {
  return pairs.map(([year, publications]) => ({ year, publications }));
}

describe("deriveTrend", () => {
  it("returns growing when the recent window reaches the growth factor", () => {
    expect(deriveTrend(buckets([[2022, 40], [2023, 60], [2024, 60], [2025, 65]]))).toBe("growing");
  });

  it("returns stable just below the growth factor", () => {
    expect(deriveTrend(buckets([[2022, 40], [2023, 60], [2024, 60], [2025, 64]]))).toBe("stable");
  });

  it("returns declining when the recent window reaches the decline factor", () => {
    expect(deriveTrend(buckets([[2022, 40], [2023, 60], [2024, 37], [2025, 38]]))).toBe("declining");
  });

  it("returns stable just above the decline factor", () => {
    expect(deriveTrend(buckets([[2022, 40], [2023, 60], [2024, 38], [2025, 38]]))).toBe("stable");
  });

  it("returns stable in the middle range", () => {
    expect(deriveTrend(buckets([[2022, 40], [2023, 60], [2024, 45], [2025, 55]]))).toBe("stable");
  });

  it("returns insufficient_data when the previous comparison base is too small", () => {
    expect(deriveTrend(buckets([[2022, 1], [2023, 1], [2024, 1], [2025, 1]]))).toBe("insufficient_data");
  });

  it("returns insufficient_data with fewer than four year buckets", () => {
    expect(deriveTrend(buckets([[2022, 100], [2023, 200]]))).toBe("insufficient_data");
  });

  it("returns insufficient_data with no year buckets", () => {
    expect(deriveTrend([])).toBe("insufficient_data");
  });

  it("sorts unsorted buckets by year before comparing", () => {
    expect(deriveTrend(buckets([[2025, 65], [2022, 40], [2024, 60], [2023, 60]]))).toBe("growing");
  });
});
