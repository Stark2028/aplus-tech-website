"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { COL, TEAM_STATUS_DOC, toMillis } from "./types";
import { isTeamOnline, PRESENCE_WINDOW_MS } from "./presence";

/**
 * Is a sales console open right now? (spec §5)
 *
 * status/team is public-read, so this works BEFORE the visitor signs in — the
 * launcher shows the right dot on first paint, and the panel opens on the right
 * fork ("Chat now" vs "Leave a message").
 *
 * The re-tick is not decoration: onlineUntil is a timestamp, so when the last
 * console closes, NOTHING changes in Firestore — the value simply goes stale.
 * Without a local timer the widget would show "online" forever. Re-evaluating
 * every 15s flips it to "away" within the 90s window on its own.
 */
export function useTeamPresence(): { teamOnline: boolean } {
  const [onlineUntil, setOnlineUntil] = useState<number | null>(null);
  const [teamOnline, setTeamOnline] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onSnapshot(
      doc(getDb(), COL.status, TEAM_STATUS_DOC),
      (snap) => setOnlineUntil(toMillis(snap.data()?.onlineUntil)),
      // Presence is an enhancement. If it fails, stay "away" — the panel then
      // offers WhatsApp/Call, which is the honest fallback (spec §11).
      () => setOnlineUntil(null)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const evaluate = () => setTeamOnline(isTeamOnline(onlineUntil));
    evaluate();
    const id = setInterval(evaluate, PRESENCE_WINDOW_MS / 6);
    return () => clearInterval(id);
  }, [onlineUntil]);

  return { teamOnline };
}
