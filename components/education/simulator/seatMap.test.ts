import { describe, it, expect } from "vitest";
import { simulatorQuestions } from "@/data/education";
import {
  CLASS_SIZE,
  TOTAL_SEATS,
  seatOrder,
  assignSeatAnswers,
  questionAccuracy,
  sessionSummary,
  hardestQuestion,
  currentStreak,
} from "./seatMap";

describe("seatOrder", () => {
  it("returns a stable permutation of all seats", () => {
    const a = seatOrder(1);
    const b = seatOrder(1);
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(Array.from({ length: TOTAL_SEATS }, (_, i) => i));
  });

  it("varies by question id", () => {
    expect(seatOrder(1)).not.toEqual(seatOrder(2));
  });
});

describe("assignSeatAnswers", () => {
  it("deals exactly the question's classAnswers distribution across 23 seats", () => {
    for (const q of simulatorQuestions) {
      const seats = assignSeatAnswers(q);
      expect(seats).toHaveLength(CLASS_SIZE);
      const counts = { A: 0, B: 0, C: 0, D: 0 };
      seats.forEach((o) => counts[o]++);
      expect(counts).toEqual(q.classAnswers);
    }
  });
});

describe("questionAccuracy", () => {
  it("includes the visitor in the 24-seat denominator", () => {
    const q = simulatorQuestions[0]; // correct B; 16 of 23 simulated correct
    expect(questionAccuracy(q, "B")).toBe(Math.round((17 / 24) * 100));
    expect(questionAccuracy(q, "A")).toBe(Math.round((16 / 24) * 100));
  });
});

describe("session stats", () => {
  const q = (i: number) => simulatorQuestions[i];

  it("guards the empty session (teacher-view empty state)", () => {
    expect(sessionSummary([])).toEqual({ score: 0, total: 0, classAvgPct: 0, bestStreak: 0 });
    expect(hardestQuestion([])).toBeNull();
    expect(currentStreak([])).toBe(0);
  });

  it("scores, streaks and finds the hardest question of a mixed session", () => {
    const answered = [
      { question: q(0), yourAnswer: q(0).correct }, // right → 17/24
      { question: q(1), yourAnswer: q(1).correct }, // right → 15/24 (hardest)
      { question: q(2), yourAnswer: "A" as const }, // wrong (correct C) → 17/24
      { question: q(3), yourAnswer: q(3).correct }, // right → 19/24
    ];
    const s = sessionSummary(answered);
    expect(s.score).toBe(3);
    expect(s.total).toBe(4);
    expect(s.bestStreak).toBe(2);
    expect(currentStreak(answered)).toBe(1);
    expect(hardestQuestion(answered)?.question.id).toBe(2);
    // class average uses only the simulated 23 (visitor shown separately)
    const expectedAvg = Math.round(((16 / 23 + 14 / 23 + 17 / 23 + 18 / 23) / 4) * 100);
    expect(s.classAvgPct).toBe(expectedAvg);
  });
});
