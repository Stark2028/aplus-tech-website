"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { simulatorQuestions, type SimOption } from "@/data/education";
import { currentStreak, seatOrder, sessionSummary, TOTAL_SEATS, type AnsweredQuestion } from "./seatMap";
import ClickerDevice from "./ClickerDevice";
import Smartboard from "./Smartboard";
import TeacherDashboard from "./TeacherDashboard";
import "./simulator.css";

export type Phase = "idle" | "armed" | "transmitting" | "collecting" | "revealed" | "summary";
export type View = "student" | "teacher";

const TRANSMIT_MS = 450;
const COLLECT_MS = 2500;

export default function ClassroomSimulator() {
  const [view, setView] = useState<View>("student");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<SimOption | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [collected, setCollected] = useState(0);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (ticker.current) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const question = simulatorQuestions[qIndex];
  const isLast = qIndex === simulatorQuestions.length - 1;

  const pick = (opt: SimOption) => {
    if (phase !== "idle" && phase !== "armed") return;
    setSelected(opt);
    setPhase("armed");
  };

  const submit = () => {
    if (phase !== "armed" || !selected) return;
    const sel = selected;
    const finalize = () => {
      setCollected(TOTAL_SEATS);
      setAnswered((a) => [...a, { question, yourAnswer: sel }]);
      setPhase("revealed");
    };
    setPhase("transmitting");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(
      setTimeout(() => {
        // Reduced motion skips the collecting theater straight to the reveal.
        if (reduced) {
          finalize();
          return;
        }
        setPhase("collecting");
        setCollected(1);
        // Plain local counter: setState updaters must stay pure (React dev
        // double-invokes them), so the interval bookkeeping lives out here.
        let count = 1;
        ticker.current = setInterval(() => {
          count += 1;
          if (count >= TOTAL_SEATS) {
            if (ticker.current) {
              clearInterval(ticker.current);
              ticker.current = null;
            }
            setCollected(TOTAL_SEATS);
            // brief beat on the full grid before the reveal
            timers.current.push(setTimeout(finalize, 250));
          } else {
            setCollected(count);
          }
        }, COLLECT_MS / TOTAL_SEATS);
      }, TRANSMIT_MS)
    );
  };

  const next = () => {
    if (phase !== "revealed") return;
    if (isLast) {
      setPhase("summary");
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setCollected(0);
    setPhase("idle");
  };

  const restart = () => {
    clearTimers();
    setQIndex(0);
    setSelected(null);
    setCollected(0);
    setAnswered([]);
    setPhase("idle");
  };

  // Deterministic per-question light-up order for the collecting seat grid.
  const litSeats = new Set(seatOrder(question.id).slice(0, collected));

  return (
    <div>
      {/* Student / Teacher segmented toggle (spec §G) */}
      <div className="flex justify-center mb-10">
        <div
          role="tablist"
          aria-label="Simulator view"
          className="inline-flex items-center gap-1 bg-slate-900/80 ring-1 ring-white/10 rounded-full p-1"
        >
          {(["student", "teacher"] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`edu-mono px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                view === v ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {v === "student" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "student" ? (
          <motion.div
            key="student"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_4.5rem_minmax(0,7fr)] items-stretch"
          >
            <div className="flex flex-col items-center justify-center">
              <p className="edu-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400/70 mb-4">
                Your clicker
              </p>
              <ClickerDevice phase={phase} selected={selected} onPick={pick} onSubmit={submit} onRestart={restart} />
            </div>
            <div
              className={`edu-sim-flight h-12 lg:h-auto ${phase === "transmitting" ? "is-tx" : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
            <Smartboard
              question={question}
              qIndex={qIndex}
              total={simulatorQuestions.length}
              phase={phase}
              selected={selected}
              litSeats={litSeats}
              collected={collected}
              streak={currentStreak(answered)}
              isLast={isLast}
              summary={sessionSummary(answered)}
              onNext={next}
              onRestart={restart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="teacher"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <TeacherDashboard answered={answered} onGoStudent={() => setView("student")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
