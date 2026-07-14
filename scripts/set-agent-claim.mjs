/**
 * Grant (or revoke) the `agent: true` custom claim — the thing firestore.rules
 * checks to decide who can read every conversation. Run once per agent account.
 *
 * Usage:
 *   node scripts/set-agent-claim.mjs sales@aplustechsol.com
 *   node scripts/set-agent-claim.mjs sales@aplustechsol.com --revoke
 *
 * Requires FIREBASE_ADMIN_* in .env.local. The user must already exist — create
 * them in Firebase console → Authentication → Add user (email/password).
 *
 * The claim lands in the ID token, which the client caches for up to an hour, so
 * the agent must sign out and back in before it takes effect.
 */

import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Minimal .env.local loader — this script runs outside Next.js, which is what
// normally injects these.
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
  if (!match) continue;
  const [, key, rawValue] = match;
  if (process.env[key] === undefined) {
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

const [email, ...flags] = process.argv.slice(2);
const revoke = flags.includes("--revoke");

if (!email) {
  console.error("Usage: node scripts/set-agent-claim.mjs <email> [--revoke]");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth();
const user = await auth.getUserByEmail(email);

await auth.setCustomUserClaims(user.uid, revoke ? null : { agent: true });
// Invalidate existing sessions so a revoked agent loses access immediately
// rather than at the next hourly token refresh.
await auth.revokeRefreshTokens(user.uid);

console.log(
  revoke
    ? `Revoked agent claim for ${email} (${user.uid}). They must sign in again.`
    : `Granted agent:true to ${email} (${user.uid}). They must sign out and back in.`
);
