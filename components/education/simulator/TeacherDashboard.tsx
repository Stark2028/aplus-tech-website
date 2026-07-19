"use client";

import { BarChart3, Users } from "lucide-react";
import { simulatorQuestions, type SimOption } from "@/data/education";
import {
  assignSeatAnswers,
  hardestQuestion,
  questionAccuracy,
  TOTAL_SEATS,
  type AnsweredQuestion,
} from "./seatMap";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];

interface Props {
  answered: AnsweredQuestion[];
  onGoStudent: () => void;
}

function SeatCard({ ok, label, you = false }: { ok: boolean; label: string; you?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-1.5 py-1.5 text-center ${
        ok
          ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
          : "bg-rose-950/40 border-rose-500/30 text-rose-300"
      } ${you ? "ring-1 ring-emerald-400/50" : ""}`}
    >
      <span
        className={`block edu-mono text-[9px] uppercase tracking-wider ${you ? "text-emerald-400/80" : "text-slate-500"}`}
      >
        {label}
      </span>
      <span className="text-xs font-bold">{ok ? "✓" : "✗"}</span>
    </div>
  );
}

/** Teacher-side render of the same simulated session. Seats are anonymous
 *  ("Seat 01–24", spec hard constraint) — seat 24 is the visitor. */
export default function TeacherDashboard({ answered, onGoStudent }: Props) {
  // Divide-by-zero guard: nothing answered yet → empty state (spec §G).
  if (answered.length === 0) {
    return (
      <div className="bg-slate-950 rounded-3xl border border-white/10 p-10 md:p-14 text-center">
        <Users size={28} className="mx-auto text-slate-600" aria-hidden="true" />
        <h3 className="edu-display mt-4 text-xl font-bold text-white">No responses yet</h3>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          The teacher dashboard fills in as the class answers. Switch to the Student view and answer your first
          question.
        </p>
        <button
          onClick={onGoStudent}
          className="mt-6 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          Go to Student view
        </button>
      </div>
    );
  }

  const latest = answered[answered.length - 1];
  const seats = assignSeatAnswers(latest.question);
  const hardest = hardestQuestion(answered)!;
  const hardestPct = questionAccuracy(hardest.question, hardest.yourAnswer);
  const yourOk = latest.yourAnswer === latest.question.correct;

  return (
    <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
        <span>Teacher dashboard · simulated session</span>
        <span>
          {answered.length} / {simulatorQuestions.length} questions answered
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 24-seat response grid for the latest answered question */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <p className="edu-mono text-[11px] text-slate-400 mb-1">Latest question · {latest.question.subject}</p>
          <p className="text-sm text-slate-200 font-semibold mb-4 leading-snug">{latest.question.question}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {seats.map((ans, i) => (
              <SeatCard
                key={i}
                ok={ans === latest.question.correct}
                label={`Seat ${String(i + 1).padStart(2, "0")}`}
              />
            ))}
            <SeatCard ok={yourOk} label="Seat 24 · you" you />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {/* Per-question accuracy + answer distribution */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
            <p className="edu-mono text-[11px] text-slate-400 mb-3">Per-question accuracy</p>
            <div className="space-y-3.5">
              {answered.map((a) => {
                const pct = questionAccuracy(a.question, a.yourAnswer);
                return (
                  <div key={a.question.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Q{a.question.id} · {a.question.subject}
                      </span>
                      <span className="edu-mono text-slate-400">{pct}% correct</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    {/* answer-distribution mini-bars (A–D shares of 24) */}
                    <div className="mt-1.5 flex gap-1" aria-hidden="true">
                      {OPTION_KEYS.map((opt) => {
                        const count = a.question.classAnswers[opt] + (a.yourAnswer === opt ? 1 : 0);
                        return (
                          <i
                            key={opt}
                            className={`h-1 rounded-full ${opt === a.question.correct ? "bg-emerald-500" : "bg-slate-600"}`}
                            style={{ width: `${(count / TOTAL_SEATS) * 100}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardest question so far */}
          <div className="bg-amber-950/30 border border-amber-500/25 rounded-2xl p-5">
            <p className="edu-mono text-[11px] text-amber-400/90 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <BarChart3 size={12} aria-hidden="true" /> Hardest question so far
            </p>
            <p className="text-sm text-slate-200 font-semibold leading-snug">{hardest.question.question}</p>
            <p className="mt-1 text-xs text-slate-400">{hardestPct}% of the class answered correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
