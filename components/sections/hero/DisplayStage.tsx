"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import "./stage.css";
import { useStageChannel } from "./useStageChannel";
import RetailScene from "./scenes/RetailScene";
import NocScene from "./scenes/NocScene";
import HotelScene from "./scenes/HotelScene";
import FlipScene from "./scenes/FlipScene";

const CHANNELS = [
  { key: "signage", chip: "SIGNAGE", label: "Smart Signage", ch: "CH·01", osd: "SMART SIGNAGE", Scene: RetailScene },
  { key: "video-wall", chip: "VIDEO WALL", label: "Video Wall", ch: "CH·02", osd: "VIDEO WALL", Scene: NocScene },
  { key: "hotel-tv", chip: "HOTEL TV", label: "Hospitality TV", ch: "CH·03", osd: "HOSPITALITY TV", Scene: HotelScene },
  { key: "interactive", chip: "INTERACTIVE", label: "Interactive Display", ch: "CH·04", osd: "INTERACTIVE", Scene: FlipScene },
] as const;

/** The hero's right-half "stage": a display that morphs through four product
 *  form factors on a pure-CSS 20s loop. React only handles manual chip mode
 *  and the desktop 3D tilt — the loop itself runs without JS. */
export default function DisplayStage() {
  const { manualIndex, select, resumeAuto } = useStageChannel();
  const posthog = usePostHog();
  const colRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // 3D mouse tilt: desktop fine-pointer viewports only, rAF-throttled.
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

  const manual = manualIndex !== null;
  const on = (i: number) => (manualIndex === i ? " on" : "");

  return (
    <div ref={colRef} className="stg-col w-full">
      <div className={`stg-scale${manual ? " stg-manual" : ""}`}>
        {/* Everything visual is decorative; the H1/copy carry the information. */}
        <div aria-hidden="true">
          <div className="stg-persp">
            {CHANNELS.map((c, i) => (
              <div key={c.key} className={`stg-glow g${i + 1}${on(i)}`} />
            ))}
            <div ref={tiltRef} className="stg-tilt">
              <div className="stg-dust d1" />
              <div className="stg-dust d2" />
              <div className="stg-dust d3" />
              <div className="stg-dust d4" />
              <div className="stg-float">
                <div className="stg-stagebox stg-reveal">
                  {CHANNELS.map((c, i) => (
                    <div key={c.key} className={`stg-osd o${i + 1}${on(i)}`}>
                      {c.ch} <b>{c.osd}</b>
                    </div>
                  ))}
                  {CHANNELS.map(({ key, Scene }, i) => (
                    <div key={key} className={`stg-prod p${i + 1}${on(i)}`}>
                      <Scene />
                    </div>
                  ))}
                  <div className="stg-boot" />
                </div>
                <div className="stg-floor">
                  {CHANNELS.map((c, i) => (
                    <div key={c.key} className={`stg-pool g${i + 1}${on(i)}`} />
                  ))}
                  <div className="stg-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stg-chips">
          {CHANNELS.map((c, i) => (
            <button
              key={c.key}
              type="button"
              className={`stg-chip c${i + 1}`}
              aria-pressed={manualIndex === i}
              aria-label={`Preview: ${c.label}`}
              onClick={() => {
                select(i);
                posthog?.capture("hero_stage_channel_click", { channel: c.key });
              }}
            >
              {c.chip}
              <span className="stg-chip-bar" />
            </button>
          ))}
          {manual && (
            <button
              type="button"
              className="stg-chip stg-chip-auto"
              onClick={() => {
                resumeAuto();
                posthog?.capture("hero_stage_auto_resume");
              }}
            >
              ▶ AUTO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
