"use client";

import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getAuthClient } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

/**
 * Agent session for the console (spec §4, §9).
 *
 * Signing in is NOT the same as being an agent. Authorisation is the `agent:true`
 * custom claim (granted by scripts/set-agent-claim.mjs), and it is enforced in
 * firestore.rules — this hook only reads it so the UI can say something useful
 * instead of showing an empty console full of permission errors.
 */
export function useAgentAuth() {
  // isFirebaseConfigured() reads build-time env, so it never changes across
  // renders — deciding "unavailable" via a lazy initializer (rather than an
  // effect that calls setState) is both correct and avoids a wasted render.
  const [ready, setReady] = useState(() => !isFirebaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [isAgent, setIsAgent] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    isFirebaseConfigured() ? null : "Chat backend is not configured."
  );

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(getAuthClient(), async (next) => {
      setUser(next);
      if (next) {
        // force-refresh: the claim may have been granted after this token was
        // minted, and a stale token would lock a real agent out for an hour.
        const result = await next.getIdTokenResult(true).catch(() => null);
        setIsAgent(result?.claims.agent === true);
      } else {
        setIsAgent(false);
      }
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(getAuthClient(), email, password);
    } catch {
      // Deliberately vague: distinguishing "no such user" from "wrong password"
      // tells an attacker which agent emails exist.
      setError("Sign-in failed. Check the email and password.");
      throw new Error("sign-in-failed");
    }
  }, []);

  const signOutAgent = useCallback(async () => {
    await signOut(getAuthClient());
  }, []);

  return { ready, user, isAgent, signIn, signOutAgent, error };
}
