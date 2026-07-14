import "server-only";

/**
 * Admin SDK singleton for the API routes. Bypasses security rules by design —
 * only ever reached from server code that has already verified the caller.
 *
 * FIREBASE_ADMIN_PRIVATE_KEY is stored with literal "\n" sequences (env vars
 * cannot carry real newlines), so it is un-escaped here.
 */

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const APP_NAME = "aplus-chat-admin";

export function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return getApp(APP_NAME);

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin is not configured (missing FIREBASE_ADMIN_* env).");
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, APP_NAME);
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
