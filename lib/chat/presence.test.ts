import { describe, it, expect } from "vitest";
import {
  isTeamOnline,
  isVisitorOnline,
  formatLastSeen,
  PRESENCE_WINDOW_MS,
} from "./presence";

const NOW = 1_700_000_000_000;

describe("isTeamOnline", () => {
  it("is online while onlineUntil is in the future", () => {
    expect(isTeamOnline(NOW + 1_000, NOW)).toBe(true);
  });

  it("is away once onlineUntil has lapsed — a crashed console decays to away", () => {
    expect(isTeamOnline(NOW - 1, NOW)).toBe(false);
    expect(isTeamOnline(NOW, NOW)).toBe(false);
  });

  it("is away when the doc has never been written", () => {
    expect(isTeamOnline(null, NOW)).toBe(false);
    expect(isTeamOnline(undefined, NOW)).toBe(false);
    expect(isTeamOnline(0, NOW)).toBe(false);
  });
});

describe("isVisitorOnline", () => {
  it("is online inside the 90s window", () => {
    expect(isVisitorOnline(NOW - (PRESENCE_WINDOW_MS - 1), NOW)).toBe(true);
    expect(isVisitorOnline(NOW, NOW)).toBe(true);
  });

  it("is offline exactly at the window boundary and beyond", () => {
    expect(isVisitorOnline(NOW - PRESENCE_WINDOW_MS, NOW)).toBe(false);
    expect(isVisitorOnline(NOW - 10 * 60_000, NOW)).toBe(false);
  });

  it("is offline when never seen", () => {
    expect(isVisitorOnline(null, NOW)).toBe(false);
    expect(isVisitorOnline(0, NOW)).toBe(false);
  });

  it("tolerates a slightly future timestamp (clock skew) rather than reporting offline", () => {
    expect(isVisitorOnline(NOW + 5_000, NOW)).toBe(true);
  });
});

describe("formatLastSeen", () => {
  it("reports minutes for a recent departure", () => {
    expect(formatLastSeen(NOW - 6 * 60_000, NOW)).toBe("Left 6 minutes ago");
  });

  it("singularises one minute", () => {
    expect(formatLastSeen(NOW - 60_000, NOW)).toBe("Left 1 minute ago");
  });

  it("reports 'just now' inside the first minute", () => {
    expect(formatLastSeen(NOW - 20_000, NOW)).toBe("Left just now");
  });

  it("rolls up to hours past 60 minutes", () => {
    expect(formatLastSeen(NOW - 2 * 60 * 60_000, NOW)).toBe("Left 2 hours ago");
    expect(formatLastSeen(NOW - 60 * 60_000, NOW)).toBe("Left 1 hour ago");
  });

  it("rolls up to days past 24 hours", () => {
    expect(formatLastSeen(NOW - 3 * 24 * 60 * 60_000, NOW)).toBe("Left 3 days ago");
  });

  it("says so when the visitor was never seen", () => {
    expect(formatLastSeen(null, NOW)).toBe("Not seen yet");
    expect(formatLastSeen(0, NOW)).toBe("Not seen yet");
  });
});
