"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { simulatorQuestions, type SimOption } from "@/data/education";
import { currentStreak, seatOrder, sessionSummary, TOTAL_SEATS, type AnsweredQuestion } from "./seatMap";
import ClickerDevice from "./ClickerDevice";
import Smartboard from "./Smartboard";
import "./simulator.css";

export type Phase = "idle" | "armed" | "transmitting" | "collecting" | "revealed" | "summary";

const TRANSMIT_MS = 450;
const COLLECT_MS = 2500;

export default function ClassroomSimulator() {
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
        ticker.current = setInterval(() => {
          setCollected((c) => {
            if (c + 1 >= TOTAL_SEATS) {
              if (ticker.current) {
                clearInterval(ticker.current);
                ticker.current = null;
              }
              // brief beat on the full grid before the reveal
              timers.current.push(setTimeout(finalize, 250));
              return TOTAL_SEATS;
            }
            return c + 1;
          });
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
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_4.5rem_minmax(0,7fr)] items-stretch">
      <div className="flex flex-col items-center justify-center">
        <p className="edu-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400/70 mb-4">
          Your clicker
        </p>
        <ClickerDevice phase={phase} selected={selected} onPick={pick} onSubmit={submit} onRestart={restart} />
      </div>
      <div className={`edu-sim-flight h-12 lg:h-auto ${phase === "transmitting" ? "is-tx" : ""}`} aria-hidden="true">
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
    </div>
  );
}
