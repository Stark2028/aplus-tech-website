import type { SimOption, SimQuestion } from "@/data/education";

/** Pure derived-stats helpers for the classroom simulator. Everything is
 *  computed client-side from the existing simulated classAnswers — no new
 *  content claims (spec §G "Data"). */

export const CLASS_SIZE = 23; // simulated students; the visitor is seat 24
export const TOTAL_SEATS = CLASS_SIZE + 1;

export interface AnsweredQuestion {
  question: SimQuestion;
  yourAnswer: SimOption;
}

export interface SessionSummary {
  score: number;
  total: number;
  classAvgPct: number;
  bestStreak: number;
}

/** Deterministic permutation of 0..n-1, varied per question id (tiny seeded
 *  LCG + Fisher-Yates) so seat patterns are stable across renders. */
export function seatOrder(qid: number, n: number = TOTAL_SEATS): number[] {
  const seats = Array.from({ length: n }, (_, i) => i);
  let seed = qid * 9973 + 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }
  return seats;
}

/** Deal the 23 simulated classAnswers onto seats 0..22, deterministically. */
export function assignSeatAnswers(q: SimQuestion): SimOption[] {
  const pool: SimOption[] = [];
  (["A", "B", "C", "D"] as SimOption[]).forEach((opt) => {
    for (let i = 0; i < q.classAnswers[opt]; i++) pool.push(opt);
  });
  const order = seatOrder(q.id, CLASS_SIZE);
  const seats = new Array<SimOption>(CLASS_SIZE);
  order.forEach((seat, i) => {
    seats[seat] = pool[i];
  });
  return seats;
}

/** Class accuracy for one question as % of all 24 seats, visitor included. */
export function questionAccuracy(q: SimQuestion, yourAnswer: SimOption): number {
  const correct = q.classAnswers[q.correct] + (yourAnswer === q.correct ? 1 : 0);
  return Math.round((correct / TOTAL_SEATS) * 100);
}

/** Session roll-up. classAvgPct averages the simulated class only — the
 *  visitor's score is shown alongside it, not mixed into it. */
export function sessionSummary(answered: AnsweredQuestion[]): SessionSummary {
  const total = answered.length;
  const score = answered.filter((a) => a.yourAnswer === a.question.correct).length;
  const classAvgPct =
    total === 0
      ? 0
      : Math.round(
          (answered.reduce((s, a) => s + a.question.classAnswers[a.question.correct] / CLASS_SIZE, 0) / total) * 100
        );
  let bestStreak = 0;
  let run = 0;
  for (const a of answered) {
    run = a.yourAnswer === a.question.correct ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }
  return { score, total, classAvgPct, bestStreak };
}

/** Hardest question so far = lowest class accuracy (visitor included).
 *  Null when nothing is answered yet (teacher-view empty state guard). */
export function hardestQuestion(answered: AnsweredQuestion[]): AnsweredQuestion | null {
  if (answered.length === 0) return null;
  return answered.reduce((worst, a) =>
    questionAccuracy(a.question, a.yourAnswer) < questionAccuracy(worst.question, worst.yourAnswer) ? a : worst
  );
}

/** Consecutive correct answers at the tail of the session (streak chip). */
export function currentStreak(answered: AnsweredQuestion[]): number {
  let n = 0;
  for (let i = answered.length - 1; i >= 0; i--) {
    if (answered[i].yourAnswer === answered[i].question.correct) n++;
    else break;
  }
  return n;
}
