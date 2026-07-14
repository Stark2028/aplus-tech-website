/**
 * Firebase client config, read from NEXT_PUBLIC_* env.
 *
 * Kept as a pure function of an env object (not a module-level constant) so it
 * is unit-testable and so a missing/half-filled env degrades to `null` rather
 * than throwing at import time. Chat must never take the whole page down: every
 * caller treats `null` as "chat unavailable, fall back to WhatsApp/phone".
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

type Env = Record<string, string | undefined>;

const KEYS = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

/**
 * NOTE: Next.js inlines `process.env.NEXT_PUBLIC_*` only for *statically
 * written* member expressions, so the defaults below are spelled out literally.
 * A dynamic `env[KEYS.apiKey]` lookup over `process.env` would be `undefined`
 * in the browser bundle.
 */
function defaultEnv(): Env {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function firebaseConfig(env: Env = defaultEnv()): FirebaseClientConfig | null {
  const out = {} as FirebaseClientConfig;
  for (const [field, key] of Object.entries(KEYS) as [keyof FirebaseClientConfig, string][]) {
    const value = env[key]?.trim();
    if (!value) return null;
    out[field] = value;
  }
  return out;
}

export function isFirebaseConfigured(env: Env = defaultEnv()): boolean {
  return firebaseConfig(env) !== null;
}
