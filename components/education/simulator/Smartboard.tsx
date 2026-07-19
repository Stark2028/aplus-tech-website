"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, Flame, RotateCcw, XCircle } from "lucide-react";
import type { SimOption, SimQuestion } from "@/data/education";
import { TOTAL_SEATS, type SessionSummary } from "./seatMap";
import type { Phase } from "./ClassroomSimulator";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];

/** Percentage that counts up over ~700ms at reveal (instant under reduced motion). */
function CountUpPct({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    // All setN calls happen inside rAF callbacks (never synchronously in the
    // effect body) to keep renders from cascading.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      if (reduced) {
        setN(target);
        return;
      }
      const p = Math.min((t - t0) / 700, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{n}%</>;
}

/** Small CSS confetti burst (suppressed under reduced motion via CSS). */
function ConfettiBurst() {
  const pieces = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const dist = 46 + (i % 3) * 22;
    return {
      dx: `${Math.round(Math.cos(angle) * dist)}px`,
      dy: `${Math.round(Math.sin(angle) * dist - 30)}px`,
      rot: `${(i % 2 ? 1 : -1) * (120 + i * 20)}deg`,
      color: ["#34d399", "#38bdf8", "#fbbf24", "#a78bfa"][i % 4],
      delay: `${(i % 4) * 40}ms`,
    };
  });
  return (
    <span className="edu-sim-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={
            {
              "--dx": p.dx,
              "--dy": p.dy,
              "--rot": p.rot,
              background: p.color,
              animationDelay: p.delay,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

interface Props {
  question: SimQuestion;
  qIndex: number;
  total: number;
  phase: Phase;
  selected: SimOption | null;
  litSeats: Set<number>;
  collected: number;
  streak: number;
  isLast: boolean;
  summary: SessionSummary;
  onNext: () => void;
  onRestart: () => void;
}

export default function Smartboard({
  question,
  qIndex,
  total,
  phase,
  selected,
  litSeats,
  collected,
  streak,
  isLast,
  summary,
  onNext,
  onRestart,
}: Props) {
  const isCorrect = selected === question.correct;

  if (phase === "summary") {
    const yourPct = summary.total === 0 ? 0 : Math.round((summary.score / summary.total) * 100);
    return (
      <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
          <span>Classroom smartboard · session summary</span>
          <span>Simulation</span>
        </div>
        <div className="my-auto text-center py-6">
          <p className="edu-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400 mb-4">Session complete</p>
          <p className="edu-display text-6xl font-bold text-white">
            {summary.score}
            <span className="text-slate-500">/{summary.total}</span>
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              ["Your score", `${yourPct}%`],
              ["Class average", `${summary.classAvgPct}%`],
              ["Best streak", `×${summary.bestStreak}`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-4">
                <p className="edu-mono text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="edu-display text-2xl font-bold text-emerald-300 mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-gray-100 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <RotateCcw size={15} aria-hidden="true" /> Restart
            </button>
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors group"
            >
              Request a school demo
              <ArrowRight size={15} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
      <div className="flex items-center justify-between text-xs edu-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
        <span>Classroom smartboard · {question.subject}</span>
        <span>
          Question {qIndex + 1} / {total}
        </span>
      </div>
      <h3 className="edu-display text-lg md:text-xl font-bold text-white leading-snug mb-6">{question.question}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {OPTION_KEYS.map((opt) => {
          const revealed = phase === "revealed";
          const correct = question.correct === opt;
          const chosen = selected === opt;
          return (
            <div
              key={opt}
              className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-colors ${
                revealed && correct
                  ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-100"
                  : revealed && chosen
                  ? "bg-rose-950/70 border-rose-500/70 text-rose-100"
                  : chosen
                  ? "bg-emerald-900/30 border-emerald-500/50 text-white"
                  : "bg-slate-900 border-white/10 text-slate-300"
              }`}
            >
              <span className="w-6 h-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {opt}
              </span>
              <span>{question.options[opt]}</span>
            </div>
          );
        })}
      </div>

      {(phase === "idle" || phase === "armed") && (
        <div className="mt-auto flex items-center gap-2.5 edu-mono text-xs text-slate-400">
          <span className="edu-sim-livedot" aria-hidden="true" />
          {TOTAL_SEATS} students ready — waiting for your answer
        </div>
      )}

      {(phase === "transmitting" || phase === "collecting") && (
        <div className="mt-auto bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <p className="edu-mono text-[11px] text-slate-400 mb-3" role="status" aria-live="polite">
            {phase === "transmitting" ? "receiving…" : `answers ${collected}/${TOTAL_SEATS}`}
          </p>
          <div className="grid grid-cols-12 gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_SEATS }, (_, i) => (
              <i key={i} className={`edu-sim-seat ${litSeats.has(i) ? "on" : ""}`} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "revealed" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative bg-slate-900/80 border border-white/10 rounded-2xl p-5"
          >
            {isCorrect && <ConfettiBurst />}
            <div className="flex items-start gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
              ) : (
                <XCircle size={20} className="shrink-0 text-rose-400" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                  {isCorrect ? "Correct!" : "Not quite."}
                  {streak >= 2 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 edu-mono text-[10px] px-2 py-0.5">
                      <Flame size={11} aria-hidden="true" /> ×{streak} in a row
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <p className="edu-mono text-[11px] text-slate-400">
                Class responses · {TOTAL_SEATS} students · simulated
              </p>
              {OPTION_KEYS.map((opt) => {
                const count = question.classAnswers[opt] + (selected === opt ? 1 : 0);
                const pct = Math.round((count / TOTAL_SEATS) * 100);
                return (
                  <div key={opt} className="flex items-center gap-3 text-xs">
                    <span className="w-4 text-right font-bold text-slate-400">{opt}</span>
                    <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${question.correct === opt ? "bg-emerald-500" : "bg-slate-600"}`}
                      />
                    </div>
                    <span className="w-16 text-right edu-mono text-slate-300">
                      <CountUpPct target={pct} /> ({count})
                    </span>
                    <span className="w-9">
                      {selected === opt && (
                        <span className="edu-mono text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/40 rounded-full px-1.5 py-px">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "revealed" && (
        <button
          onClick={onNext}
          className="mt-5 ml-auto inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {isLast ? "See session summary" : "Next question"} <ChevronRight size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
