"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./stage.css";
import { simulatorQuestions } from "@/data/education";

const OPTS = ["A", "B", "C", "D"] as const;

// Two question "beats" for the 16s loop — real entries from the simulator
// bank (Math + Science), so the decorative scene shows only vetted content.
const BEATS = [simulatorQuestions[0], simulatorQuestions[2]].map((q) => ({
  question: q.question,
  options: OPTS.map((o) => q.options[o]),
  correct: OPTS.indexOf(q.correct),
  // Result-bar widths: each option's share of the 23 simulated answers.
  widths: OPTS.map((o) => Math.round((q.classAnswers[o] / 23) * 100)),
}));

/** The education hero's right-half stage: a smartboard + student clicker
 *  running the classroom answer loop on a pure-CSS 16s clock (spec §B).
 *  React only wires the desktop 3D tilt — the loop runs without JS. */
export default function ClassroomStage() {
  const colRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // 3D mouse tilt: desktop fine-pointer viewports only, rAF-throttled —
  // identical guards to DisplayStage.
  useEffect(() => {
    const col = colRef.current;
    const tilt = tiltRef.current;
    if (!col || !tilt) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = col.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = `rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 4.5).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      tilt.style.transform = "rotateY(0deg) rotateX(0deg)";
    };
    col.addEventListener("mousemove", onMove);
    col.addEventListener("mouseleave", onLeave);
    return () => {
      col.removeEventListener("mousemove", onMove);
      col.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={colRef} className="edu-st-col w-full">
      <div className="edu-st-scale">
        {/* Everything visual is decorative; the H1/copy carry the information. */}
        <div aria-hidden="true">
          <div className="edu-st-persp">
            <div className="edu-st-glow" />
            <div ref={tiltRef} className="edu-st-tilt">
              <div className="edu-st-dust d1" />
              <div className="edu-st-dust d2" />
              <div className="edu-st-dust d3" />
              <div className="edu-st-dust d4" />
              <div className="edu-st-float">
                <div className="edu-st-stagebox">
                  <div className="edu-st-board edu-st-reveal">
                    <div className="edu-st-screen">
                      {BEATS.map((b, bi) => (
                        <div key={b.question} className={`edu-st-beat b${bi + 1}`}>
                          <div className="edu-st-bhead">
                            <span>CLASS SAATHI · LIVE QUIZ</span>
                            <span className="edu-st-count">
                              <i className="c1">answered 7/24</i>
                              <i className="c2">answered 16/24</i>
                              <i className="c3">answered 24/24</i>
                            </span>
                          </div>
                          <div className="edu-st-q">{b.question}</div>
                          <div className="edu-st-opts">
                            {b.options.map((opt, oi) => (
                              <div key={opt} className={`edu-st-opt ${oi === b.correct ? "is-correct" : ""}`}>
                                <span className="edu-st-key">{OPTS[oi]}</span>
                                <span className="edu-st-lbl">{opt}</span>
                                <span className="edu-st-track">
                                  <i
                                    className="edu-st-bar"
                                    style={{ "--w": String(b.widths[oi] / 100) } as CSSProperties}
                                  />
                                </span>
                                <span className="edu-st-chk">✓</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="edu-st-boot" />
                    </div>
                  </div>

                  {/* Bluetooth pulse rings + packets, clicker → board */}
                  <div className="edu-st-link">
                    <i className="edu-st-ring r1" />
                    <i className="edu-st-ring r2" />
                    <i className="edu-st-pkt k1" />
                    <i className="edu-st-pkt k2" />
                    <i className="edu-st-pkt k3" />
                  </div>

                  {/* Student clicker in the foreground; each beat's correct key
                      gets the matching press animation (press1/press2). */}
                  <div className="edu-st-clicker">
                    <i className="edu-st-led" />
                    <div className="edu-st-lcd">
                      <i className="l1">PRESS A–D</i>
                      <i className="l2">SENT ✓</i>
                    </div>
                    <div className="edu-st-keys">
                      {OPTS.map((letter, ki) => (
                        <i
                          key={letter}
                          className={[
                            `k${letter.toLowerCase()}`,
                            BEATS[0].correct === ki ? "press1" : "",
                            BEATS[1].correct === ki ? "press2" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {letter}
                        </i>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="edu-st-floor">
                  <div className="edu-st-pool" />
                  <div className="edu-st-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
