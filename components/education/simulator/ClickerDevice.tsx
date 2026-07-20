"use client";

import { RotateCcw } from "lucide-react";
import type { SimOption } from "@/data/education";
import type { Phase } from "./ClassroomSimulator";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];
// Key colours mirror the real clicker's rainbow keys (brochure p.2).
const KEY_COLORS: Record<SimOption, string> = {
  A: "bg-rose-500 hover:bg-rose-400 border-rose-700",
  B: "bg-sky-500 hover:bg-sky-400 border-sky-700",
  C: "bg-amber-500 hover:bg-amber-400 border-amber-700",
  D: "bg-violet-500 hover:bg-violet-400 border-violet-700",
};

interface Props {
  phase: Phase;
  selected: SimOption | null;
  onPick: (opt: SimOption) => void;
  onSubmit: () => void;
  onRestart: () => void;
}

export default function ClickerDevice({ phase, selected, onPick, onSubmit, onRestart }: Props) {
  const locked = phase === "transmitting" || phase === "collecting" || phase === "revealed" || phase === "summary";
  const lcdLine: Record<Phase, string> = {
    idle: "Press A, B, C or D",
    armed: `Ready: ${selected} — press Submit`,
    transmitting: "• • •",
    collecting: `Sent: ${selected}`,
    revealed: `Sent: ${selected}`,
    summary: "Session complete",
  };

  return (
    <div className={`edu-sim-shell relative w-full max-w-70 rounded-[2.5rem] p-6 ${phase === "transmitting" ? "is-tx" : ""}`}>
      <span className="edu-sim-ring r1" aria-hidden="true" />
      <span className="edu-sim-ring r2" aria-hidden="true" />
      <span className={`edu-sim-led ${phase === "transmitting" ? "on" : ""}`} aria-hidden="true" />
      <div className="edu-sim-lcd relative rounded-2xl p-4 mb-6 text-center min-h-20 flex flex-col justify-center">
        <p className="edu-mono text-[10px] uppercase tracking-widest text-emerald-500/60 mb-1">
          {phase === "transmitting" ? "Sending…" : phase === "revealed" ? "Answer sent" : "Class Saathi"}
        </p>
        <p className="edu-mono text-sm font-bold text-emerald-300" role="status" aria-live="polite">
          {lcdLine[phase]}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {OPTION_KEYS.map((opt) => (
          <button
            key={opt}
            onClick={() => onPick(opt)}
            disabled={locked}
            aria-label={`Answer ${opt}`}
            className={`edu-key aspect-square rounded-full text-2xl font-bold text-white border-b-4 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${KEY_COLORS[opt]} ${
              selected === opt ? "ring-4 ring-white/70 scale-105" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-400/40">
        <button
          onClick={onSubmit}
          disabled={phase !== "armed"}
          className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
        <button
          onClick={onRestart}
          className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw size={13} aria-hidden="true" /> Restart
        </button>
      </div>
    </div>
  );
}
