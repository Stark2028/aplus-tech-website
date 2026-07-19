"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { simulatorQuestions, type SimOption } from "@/data/education";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];
// Key colours mirror the real teacher clicker's rainbow keys (brochure p.2).
const KEY_COLORS: Record<SimOption, string> = {
  A: "bg-rose-500 hover:bg-rose-400 border-rose-700",
  B: "bg-sky-500 hover:bg-sky-400 border-sky-700",
  C: "bg-amber-500 hover:bg-amber-400 border-amber-700",
  D: "bg-violet-500 hover:bg-violet-400 border-violet-700",
};

type Phase = "idle" | "armed" | "transmitting" | "revealed";

export default function ClickerSimulator() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<SimOption | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const question = simulatorQuestions[qIndex];
  const isCorrect = selected === question.correct;

  const pick = (opt: SimOption) => {
    if (phase === "transmitting" || phase === "revealed") return;
    setSelected(opt);
    setPhase("armed");
  };

  const submit = () => {
    if (phase !== "armed" || !selected) return;
    setPhase("transmitting");
    timerRef.current = setTimeout(() => setPhase("revealed"), 450);
  };

  const next = () => {
    setQIndex((i) => (i + 1) % simulatorQuestions.length);
    setSelected(null);
    setPhase("idle");
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setPhase("idle");
  };

  const totalResponses =
    OPTION_KEYS.reduce((sum, key) => sum + question.classAnswers[key], 0) + (selected ? 1 : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Handheld clicker */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400/70 mb-4">
          Your clicker
        </p>
        <div className="w-full max-w-70 bg-linear-to-b from-gray-100 to-gray-300 rounded-[2.5rem] p-6 border-4 border-white shadow-2xl shadow-black/50">
          <div className="bg-slate-950 rounded-2xl p-4 mb-6 text-center min-h-20 flex flex-col justify-center border border-slate-700">
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/60 mb-1">
              {phase === "transmitting" ? "Sending…" : phase === "revealed" ? "Answer sent" : "Class Saathi"}
            </p>
            <p className="text-sm font-mono font-bold text-emerald-300" role="status" aria-live="polite">
              {phase === "idle" && "Press A, B, C or D"}
              {phase === "armed" && `Ready: ${selected} — press Submit`}
              {phase === "transmitting" && "• • •"}
              {phase === "revealed" && `Sent: ${selected}`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {OPTION_KEYS.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={phase === "transmitting" || phase === "revealed"}
                aria-label={`Answer ${opt}`}
                className={`aspect-square rounded-full text-2xl font-bold text-white border-b-4 shadow-lg transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${KEY_COLORS[opt]} ${
                  selected === opt ? "ring-4 ring-white/70 scale-105" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-300">
            <button
              onClick={submit}
              disabled={phase !== "armed"}
              className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
            <button
              onClick={restart}
              className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} aria-hidden="true" /> Restart
            </button>
          </div>
        </div>
      </div>

      {/* Smartboard */}
      <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
          <span>Classroom smartboard · {question.subject}</span>
          <span>
            Question {qIndex + 1} / {simulatorQuestions.length}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white leading-snug mb-6">{question.question}</h3>
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

        <AnimatePresence mode="wait">
          {phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/80 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle size={20} className="shrink-0 text-rose-400" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">{isCorrect ? "Correct!" : "Not quite."}</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-[11px] font-mono text-slate-400">
                  Class responses · {totalResponses} students
                </p>
                {OPTION_KEYS.map((opt) => {
                  const count = question.classAnswers[opt] + (selected === opt ? 1 : 0);
                  const pct = Math.round((count / totalResponses) * 100);
                  return (
                    <div key={opt} className="flex items-center gap-3 text-xs">
                      <span className="w-4 text-right font-bold text-slate-400">{opt}</span>
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            question.correct === opt ? "bg-emerald-500" : "bg-slate-600"
                          }`}
                        />
                      </div>
                      <span className="w-14 text-right font-mono text-slate-300">
                        {pct}% ({count})
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
            onClick={next}
            className="mt-5 ml-auto inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Next question <ChevronRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
