import { describe, it, expect } from "vitest";
import { formatRelative, formatClock, sameDay, dayLabel } from "./time";

const NOW = new Date("2026-07-24T12:00:00Z").getTime();
const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;

describe("formatRelative", () => {
  it("returns empty string for a missing timestamp", () => {
    expect(formatRelative(0, NOW)).toBe("");
  });
  it("shows 'now' under a minute", () => {
    expect(formatRelative(NOW - 30_000, NOW)).toBe("now");
  });
  it("shows minutes under an hour", () => {
    expect(formatRelative(NOW - 5 * MIN, NOW)).toBe("5m");
  });
  it("shows hours under a day", () => {
    expect(formatRelative(NOW - 3 * HOUR, NOW)).toBe("3h");
  });
  it("shows days under a week", () => {
    expect(formatRelative(NOW - 2 * DAY, NOW)).toBe("2d");
  });
  it("falls back to a short date beyond a week", () => {
    expect(formatRelative(NOW - 30 * DAY, NOW)).not.toMatch(/^\d+[mhd]$|^now$/);
    expect(formatRelative(NOW - 30 * DAY, NOW).length).toBeGreaterThan(0);
  });
});

describe("formatClock", () => {
  it("returns empty string for 0", () => {
    expect(formatClock(0)).toBe("");
  });
  it("returns a non-empty label for a real timestamp", () => {
    expect(formatClock(NOW).length).toBeGreaterThan(0);
  });
});

describe("sameDay", () => {
  it("is true within the same calendar day", () => {
    expect(sameDay(NOW, NOW + HOUR)).toBe(true);
  });
  it("is false across a day boundary", () => {
    expect(sameDay(NOW, NOW + DAY)).toBe(false);
  });
});

describe("dayLabel", () => {
  it("labels today", () => {
    expect(dayLabel(NOW, NOW)).toBe("Today");
  });
  it("labels yesterday", () => {
    expect(dayLabel(NOW - DAY, NOW)).toBe("Yesterday");
  });
  it("uses a full date further back", () => {
    const label = dayLabel(NOW - 10 * DAY, NOW);
    expect(label).not.toBe("Today");
    expect(label).not.toBe("Yesterday");
    expect(label.length).toBeGreaterThan(0);
  });
});
