import { describe, expect, it } from "vitest";
import {
  type MeasuredGroup,
  type MeasuredRow,
  chunkHeight,
  flowGroups,
  rowHeight,
} from "./specLayout";

const row = (h = 20): MeasuredRow => ({ labelLines: ["l"], valueLines: ["v"], height: h });
const group = (title: string, rows: number, h = 20): MeasuredGroup => ({
  title,
  rows: Array.from({ length: rows }, () => row(h)),
});

// headerH 18 → a 2-row group is 58 pt, a 1-row group is 38 pt.
const OPTS = { firstColH: 100, contColH: 200, headerH: 18, groupGap: 10 };

describe("rowHeight", () => {
  it("uses the taller of label/value line counts plus padding", () => {
    expect(rowHeight(1, 3, 11, 4)).toBe(3 * 11 + 8);
  });
  it("never returns less than one line", () => {
    expect(rowHeight(0, 0, 11, 4)).toBe(11 + 8);
  });
});

describe("chunkHeight", () => {
  it("is header plus the sum of row heights", () => {
    expect(chunkHeight(group("G", 3), 18)).toBe(18 + 60);
  });
});

describe("flowGroups", () => {
  it("places a small group at the top of the first column", () => {
    const placed = flowGroups([group("Display", 2)], OPTS);
    expect(placed).toHaveLength(1);
    expect(placed[0]).toMatchObject({ page: 0, col: 0, y: 0, title: "Display" });
  });

  it("filters out empty groups", () => {
    const placed = flowGroups([group("Empty", 0), group("A", 1)], OPTS);
    expect(placed).toHaveLength(1);
    expect(placed[0].title).toBe("A");
  });

  it("stacks a second group in the same column separated by groupGap", () => {
    // 58 + 10 + 38 = 106 ≤ 120
    const placed = flowGroups([group("A", 2), group("B", 1)], { ...OPTS, firstColH: 120 });
    expect(placed[1]).toMatchObject({ page: 0, col: 0, y: 68 });
  });

  it("moves a group that fits a fresh column to the second column instead of splitting", () => {
    // col0: A (58 ≤ 100). B needs 10 + 58 = 68 more → 126 > 100, but 58 fits an empty column.
    const placed = flowGroups([group("A", 2), group("B", 2)], OPTS);
    expect(placed[1]).toMatchObject({ page: 0, col: 1, y: 0, title: "B" });
  });

  it("overflows to a continuation page when both columns are full", () => {
    const tight = { ...OPTS, firstColH: 60 }; // each 58-pt group fills a column
    const placed = flowGroups([group("A", 2), group("B", 2), group("C", 2)], tight);
    expect(placed.map((p) => [p.page, p.col])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });

  it("splits a group taller than any column and suffixes continuations once", () => {
    // 10 rows × 20 = 200 + 18 header. Columns of 100: 4 rows fit per column
    // (18 + 80 = 98 ≤ 100).
    const placed = flowGroups([group("G", 10)], { ...OPTS, contColH: 100 });
    expect(placed.map((p) => [p.page, p.col, p.title, p.rows.length])).toEqual([
      [0, 0, "G", 4],
      [0, 1, "G (CONT.)", 4],
      [1, 0, "G (CONT.)", 2],
    ]);
  });

  it("force-places a row taller than an empty column instead of looping forever", () => {
    const placed = flowGroups([group("Huge", 1, 500)], { ...OPTS, contColH: 100 });
    expect(placed).toHaveLength(1);
    expect(placed[0].rows).toHaveLength(1);
  });
});
