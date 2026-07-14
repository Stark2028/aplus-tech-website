"use client";

/**
 * Lazy client-SDK singletons. Nothing is initialised at import time, so a page
 * that never opens chat never pays for the Firebase bundle or a network call.
 * Each getter throws if the env is missing — callers gate on
 * `isFirebaseConfigured()` first and fall back to WhatsApp/phone (spec §11).
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  const config = firebaseConfig();
  if (!config) throw new Error("Firebase is not configured (missing NEXT_PUBLIC_FIREBASE_* env).");
  return initializeApp(config);
}

export function getAuthClient(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getStorageClient(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
