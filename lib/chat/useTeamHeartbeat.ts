"use client";

import { useEffect } from "react";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COL, TEAM_STATUS_DOC } from "./types";
import { HEARTBEAT_INTERVAL_MS, PRESENCE_WINDOW_MS } from "./presence";

/**
 * "Sales team is online" (spec §5) — the customer's side of presence.
 *
 * Writes status/team.onlineUntil = now + 90s every 45s while a console is open.
 * It deliberately does NOT clear the flag on unload: letting the value LAPSE is
 * the fail-safe, so a crashed tab or a slammed laptop lid decays to "away" on its
 * own within 90 seconds. A "goodbye" write that never lands would strand every
 * visitor on a green dot with nobody home — the exact lie this feature exists to
 * avoid telling.
 *
 * onlineUntil is computed CLIENT-side (Timestamp.fromMillis) rather than with
 * serverTimestamp(), because serverTimestamp() cannot express "now + 90s".
 */
export function useTeamHeartbeat(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const ref = doc(getDb(), COL.status, TEAM_STATUS_DOC);
    const beat = () => {
      void setDoc(
        ref,
        { onlineUntil: Timestamp.fromMillis(Date.now() + PRESENCE_WINDOW_MS) },
        { merge: true }
      ).catch(() => {});
    };

    beat();
    const id = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]);
}
