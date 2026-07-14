import { describe, it, expect } from "vitest";
import { firebaseConfig, isFirebaseConfigured } from "./config";

const FULL = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "p.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "p",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "p.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
};

describe("firebaseConfig", () => {
  it("maps a complete env into the SDK config shape", () => {
    expect(firebaseConfig(FULL)).toEqual({
      apiKey: "key",
      authDomain: "p.firebaseapp.com",
      projectId: "p",
      storageBucket: "p.appspot.com",
      messagingSenderId: "123",
      appId: "1:123:web:abc",
    });
  });

  it("returns null when a required var is missing", () => {
    const { NEXT_PUBLIC_FIREBASE_APP_ID: _omit, ...partial } = FULL;
    expect(firebaseConfig(partial)).toBeNull();
  });

  it("returns null when a required var is blank or whitespace", () => {
    expect(firebaseConfig({ ...FULL, NEXT_PUBLIC_FIREBASE_PROJECT_ID: "   " })).toBeNull();
  });

  it("isFirebaseConfigured mirrors firebaseConfig", () => {
    expect(isFirebaseConfigured(FULL)).toBe(true);
    expect(isFirebaseConfigured({})).toBe(false);
  });
});
