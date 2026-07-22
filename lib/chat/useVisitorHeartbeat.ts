"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { COL } from "./types";
import { HEARTBEAT_INTERVAL_MS } from "./presence";

/**
 * Tells the agent whether the customer is still there (spec §5, §4).
 *
 * Writes lastSeenAt / currentPage / chatOpen into visitors/{anon uid}. The agent
 * console turns that into "🟢 Online — viewing QB65 Signage" or "⚫ Left 6
 * minutes ago", which is what decides whether he keeps typing or picks up the
 * phone.
 *
 * Quota discipline (spec §9 — the free tier is 20k writes/day and this site has
 * a large crawl surface):
 *   • Only beats while the tab is VISIBLE. A backgrounded tab writes nothing.
 *   • Only beats for a visitor who has ALREADY signed in — i.e. one who opened
 *     the chat. We do not mint an anonymous uid, or a visitors doc, for every
 *     drive-by pageview. Phase 3 revisits this when the journey needs it.
 *   • Bots run no JS, so crawlers cost nothing.
 *
 * We deliberately do NOT clear presence on unload: letting lastSeenAt lapse means
 * a crashed tab decays to "away" on its own. A beforeunload write is unreliable
 * anyway, and a "goodbye" that never lands would strand the agent on "online".
 */
export function useVisitorHeartbeat(chatOpen: boolean): void {
  const pathname = usePathname();
  // Read the latest values from the interval without re-arming it every render.
  // Synced in an effect (not during render) — refs are an escape hatch from
  // render, and writing one mid-render breaks under the React Compiler.
  const state = useRef({ pathname, chatOpen });
  useEffect(() => {
    state.current = { pathname, chatOpen };
  });

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let onVisibility: (() => void) | undefined;
    // The uid the current timer is beating for. A plain `timer` guard pinned the
    // heartbeat to the FIRST uid: on the resume A→B transition, beat() kept
    // writing the closed-over visitors/{A} doc, which the rules deny for B
    // (auth.uid must equal visitorId), and the .catch swallowed every failure —
    // so an actively-typing customer showed as "left" in the console.
    let beatingUid: string | null = null;

    const teardownBeat = () => {
      if (timer) clearInterval(timer);
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      timer = undefined;
      onVisibility = undefined;
      beatingUid = null;
    };

    const unsubscribe = onAuthStateChanged(getAuthClient(), (user) => {
      if (cancelled) return;
      // Identity changed (or signed out): stop beating for the stale uid before
      // arming the new one.
      if (beatingUid && user?.uid !== beatingUid) teardownBeat();
      // No session ⇒ this visitor has never opened the chat (or just signed
      // out). Stay silent. Idempotent against onAuthStateChanged re-firing
      // (e.g. token refresh) for a uid we're already beating.
      if (!user || beatingUid === user.uid) return;

      beatingUid = user.uid;
      const visitorRef = doc(getDb(), COL.visitors, user.uid);
      let seeded = false;

      const beat = () => {
        if (document.visibilityState !== "visible") return;
        const payload: Record<string, unknown> = {
          lastSeenAt: serverTimestamp(),
          currentPage: state.current.pathname,
          chatOpen: state.current.chatOpen,
        };
        // firstSeenAt is write-once: stamp it on the first beat of this session
        // only. merge:true would otherwise overwrite it on every beat.
        if (!seeded) {
          payload.firstSeenAt = serverTimestamp();
          seeded = true;
        }
        void setDoc(visitorRef, payload, { merge: true }).catch(() => {
          // Presence is best-effort. A failed beat must never break the chat.
        });
      };

      beat();
      timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
      onVisibility = beat;
      document.addEventListener("visibilitychange", onVisibility);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      teardownBeat();
    };
  }, []);
}
