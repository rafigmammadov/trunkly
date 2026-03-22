import { buildTimeRange, isWithinRange } from "../src/schedule";

describe("buildTimeRange", () => {
  it("detects same-day range (no midnight crossing)", () => {
    const range = buildTimeRange("09:00", "17:00");
    expect(range.crossesMidnight).toBe(false);
    expect(range.startHour).toBe(9);
    expect(range.endHour).toBe(17);
  });

  it("detects midnight-crossing range", () => {
    const range = buildTimeRange("18:00", "09:00");
    expect(range.crossesMidnight).toBe(true);
  });

  it("handles exactly equal start/end as crossing midnight", () => {
    const range = buildTimeRange("00:00", "00:00");
    expect(range.crossesMidnight).toBe(true);
  });
});

describe("isWithinRange — same-day window (09:00–17:00)", () => {
  const range = buildTimeRange("09:00", "17:00");

  it("returns true at 09:00 (boundary start)", () => {
    expect(isWithinRange(9 * 60, range)).toBe(true);
  });

  it("returns true at 12:30 (midday)", () => {
    expect(isWithinRange(12 * 60 + 30, range)).toBe(true);
  });

  it("returns true at 16:59 (just before end)", () => {
    expect(isWithinRange(16 * 60 + 59, range)).toBe(true);
  });

  it("returns false at 17:00 (boundary end, exclusive)", () => {
    expect(isWithinRange(17 * 60, range)).toBe(false);
  });

  it("returns false at 08:59 (before window)", () => {
    expect(isWithinRange(8 * 60 + 59, range)).toBe(false);
  });

  it("returns false at 23:00 (after window)", () => {
    expect(isWithinRange(23 * 60, range)).toBe(false);
  });
});

describe("isWithinRange — midnight-crossing window (18:00–09:00)", () => {
  const range = buildTimeRange("18:00", "09:00");

  it("returns true at 18:00 (start of off-hours)", () => {
    expect(isWithinRange(18 * 60, range)).toBe(true);
  });

  it("returns true at 23:59 (just before midnight)", () => {
    expect(isWithinRange(23 * 60 + 59, range)).toBe(true);
  });

  it("returns true at 00:00 (midnight)", () => {
    expect(isWithinRange(0, range)).toBe(true);
  });

  it("returns true at 08:59 (near end of off-hours)", () => {
    expect(isWithinRange(8 * 60 + 59, range)).toBe(true);
  });

  it("returns false at 09:00 (back online)", () => {
    expect(isWithinRange(9 * 60, range)).toBe(false);
  });

  it("returns false at 12:00 (midday, working hours)", () => {
    expect(isWithinRange(12 * 60, range)).toBe(false);
  });

  it("returns false at 17:59 (late afternoon, still working)", () => {
    expect(isWithinRange(17 * 60 + 59, range)).toBe(false);
  });
});

describe("isWithinRange — edge: 30-min window (23:45–00:15)", () => {
  const range = buildTimeRange("23:45", "00:15");

  it("is midnight-crossing", () => {
    expect(range.crossesMidnight).toBe(true);
  });

  it("returns true at 23:45", () => {
    expect(isWithinRange(23 * 60 + 45, range)).toBe(true);
  });

  it("returns true at 00:00", () => {
    expect(isWithinRange(0, range)).toBe(true);
  });

  it("returns true at 00:14", () => {
    expect(isWithinRange(14, range)).toBe(true);
  });

  it("returns false at 00:15", () => {
    expect(isWithinRange(15, range)).toBe(false);
  });

  it("returns false at 12:00", () => {
    expect(isWithinRange(12 * 60, range)).toBe(false);
  });
});