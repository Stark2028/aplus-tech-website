"use client";

import { useSyncExternalStore } from "react";

// Platform never changes during a session, so there is nothing to subscribe to.
const subscribe = () => () => {};

const getSnapshot = () =>
  /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || "");

// Server (and the first client paint) assume non-Mac so hydration matches;
// useSyncExternalStore then re-reads the real value on the client.
const getServerSnapshot = () => false;

/**
 * Returns true on macOS/iOS. Used to show the right search-shortcut hint
 * (⌘K on Mac, Ctrl+K elsewhere) — most of our India B2B audience is on Windows.
 */
export function useIsMac(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
