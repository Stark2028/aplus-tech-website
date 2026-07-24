import { describe, it, expect } from "vitest";
import { groupByDay } from "./messageGroups";
import type { ChatMessage } from "./types";

const NOW = new Date("2026-07-24T12:00:00Z").getTime();
const DAY = 86_400_000;

function msg(id: string, createdAt: number): ChatMessage {
  return { id, sender: "customer", text: id, createdAt };
}

describe("groupByDay", () => {
  it("returns nothing for no messages", () => {
    expect(groupByDay([], NOW)).toEqual([]);
  });

  it("prefixes a single message with one divider", () => {
    const out = groupByDay([msg("a", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message"]);
    expect(out[0]).toMatchObject({ type: "divider", label: "Today" });
  });

  it("groups same-day messages under one divider", () => {
    const out = groupByDay([msg("a", NOW - 3600_000), msg("b", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message", "message"]);
  });

  it("inserts a new divider when the day changes", () => {
    const out = groupByDay([msg("a", NOW - DAY), msg("b", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message", "divider", "message"]);
    expect(out[0]).toMatchObject({ label: "Yesterday" });
    expect(out[2]).toMatchObject({ label: "Today" });
  });

  it("gives divider ids distinct from message ids", () => {
    const out = groupByDay([msg("a", NOW)], NOW);
    const divider = out.find((i) => i.type === "divider")!;
    expect(divider.id).not.toBe("a");
  });
});
