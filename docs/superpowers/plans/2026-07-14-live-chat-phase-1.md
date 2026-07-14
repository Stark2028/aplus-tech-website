# Live Two-Way Chat — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live two-way chat between site visitors and a salesperson — a customer widget, a sales console at `/admin/chat`, real presence in both directions, a no-reply safety net, and agent-sent catalogues/spec-sheets/images.

**Architecture:** Firebase is the whole backend. Firestore streams messages and presence live to both sides; Firebase Auth gives customers an anonymous uid and agents an email/password login with an `agent: true` custom claim; Firebase Storage holds agent-uploaded attachments. Security is enforced in Firestore/Storage **rules**, not just in the UI. Four Next.js API routes (Admin SDK) cover the things a browser must not be trusted to do: escalation, reply-emails, resume links. No always-on server — everything runs on the existing serverless (Vercel) deploy.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript (strict), Tailwind v4, Firebase JS SDK v12 (modular) + firebase-admin v13, Resend (already wired), Vitest.

**Source spec:** [docs/superpowers/specs/2026-07-14-live-two-way-chat-design.md](../specs/2026-07-14-live-two-way-chat-design.md)

**Scope:** Phase 1 only (spec §13). Phase 2 (FCM push), Phase 3 (visitor intelligence), Phase 4 (agent WhatsApp ping) get their own plans. Where Phase 1 code is a deliberate seam for a later phase, the task says so.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Vitest runs `environment: "node"`** ([vitest.config.mts](../../../vitest.config.mts)). There is **no jsdom and no React Testing Library** in this repo, and this plan does not add them. Consequence: **every unit test in this plan targets a pure TypeScript module.** React components and Firebase hooks are verified at runtime via the `verify` skill (Task 27), not by unit test. Design logic *out* of components and into `lib/chat/*.ts` so it is testable.
- **Tests are colocated**: `lib/chat/presence.ts` → `lib/chat/presence.test.ts`. Follow [lib/whatsapp.test.ts](../../../lib/whatsapp.test.ts) for style.
- **Presence window: 90 000 ms. Heartbeat interval: 45 000 ms. Unanswered timeout: 180 000 ms (3 min). Reply-email debounce: 120 000 ms (2 min).** Exact values, defined once in code, never re-typed as literals.
- **Attachments: max 10 MB (`10 * 1024 * 1024`); MIME allow-list is exactly `application/pdf`, `image/png`, `image/jpeg`, `image/webp`; agent-only writes.** Enforced in Storage rules *and* the UI (spec §4.1, §9).
- **Message text cap: 2000 chars.** Enforced in Firestore rules *and* the UI.
- **Firestore timestamps** are written with `serverTimestamp()` and read back as epoch-ms via a `toMillis()` helper. Application-level presence/escalation logic operates on `number` (epoch ms) so it stays pure and testable.
- **Every new API route** must: reject non-JSON content types, run the Origin check, and rate-limit per IP using `rateLimit()` + `clientIp()` from [lib/rateLimit.ts](../../../lib/rateLimit.ts) — same shape as [app/api/contact/route.ts](../../../app/api/contact/route.ts).
- **Zoho/Resend lead on chat start** uses the existing `POST /api/contact` unchanged, with `inquiry_type: "Website Live Chat"` (spec §3.2).
- **z-index layering** (spec §3.1): launcher `z-50`, chat panel / bottom sheet `z-[60]`, mobile sticky bar `z-40` (existing), cookie banner `z-300` (existing).
- **The mobile bottom sheet must be portaled to `<body>`** — a `backdrop-filter` ancestor becomes the containing block for `fixed` children and would clamp it (spec §3.1).
- **Customer-facing copy is verbatim from the spec.** Do not paraphrase: "Sales team is online — replies in minutes" / "Team is away — we'll reply on WhatsApp/email" / "Chat now" / "Leave a message" / "Continue on WhatsApp" / the §6.1 timeout message.
- **`/admin/` is already `disallow`ed** in [app/robots.ts](../../../app/robots.ts) — do not re-add it.
- **Commit after every task.** Conventional-commit prefixes (`feat:`, `test:`, `chore:`).
- Run `npm test` before every commit; it must pass.

---

## File Structure

**New — pure logic (unit-tested):**
| File | Responsibility |
|---|---|
| `lib/chat/types.ts` | Domain types + Firestore collection names. No logic. |
| `lib/chat/messages.ts` | `buildPreview`, message caps, `isSendable`. |
| `lib/chat/presence.ts` | `isTeamOnline`, `isVisitorOnline`, `formatLastSeen`, window constants. |
| `lib/chat/escalation.ts` | `shouldEscalate` + the 3-min timeout constant. |
| `lib/chat/attachments.ts` | `validateAttachment` (size + MIME allow-list), `isImageMime`. |
| `lib/chat/links.ts` | Quick-send link builders → `{ url, label, kind }`. |
| `lib/chat/resumeToken.ts` | HMAC sign/verify for the resume link. |
| `lib/chat/replyEmail.ts` | `shouldEmailReply` — offline + debounce decision. |
| `lib/firebase/config.ts` | Env → client config object; `isFirebaseConfigured()`. |

**New — Firebase wiring (not unit-tested):**
`lib/firebase/client.ts` (lazy client SDK singletons), `lib/firebase/admin.ts` (Admin SDK singleton), `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json`, `scripts/set-agent-claim.mjs`.

**New — customer side:**
`context/ChatContext.tsx` (shared panel open/close state — the desktop launcher and the mobile sticky bar both drive it), `lib/chat/useConversation.ts`, `lib/chat/useTeamPresence.ts`, `lib/chat/useVisitorHeartbeat.ts`, `components/chat/ChatLauncher.tsx`, `components/chat/ChatPanel.tsx`, `components/chat/LiveChat.tsx`, `components/chat/WhatsAppPanel.tsx`, `components/chat/MessageAttachment.tsx`.

**New — console:**
`app/admin/layout.tsx`, `app/admin/chat/page.tsx`, `components/admin/chat/AgentLogin.tsx`, `components/admin/chat/ConversationList.tsx`, `components/admin/chat/ChatThread.tsx`, `components/admin/chat/AttachmentPicker.tsx`, `components/admin/chat/LinkPicker.tsx`, `lib/chat/useInbox.ts`, `lib/chat/useTeamHeartbeat.ts`, `lib/chat/uploadAttachment.ts`.

**New — API routes:**
`app/api/chat/escalate/route.ts`, `app/api/chat/reply-email/route.ts`, `app/api/chat/resume/route.ts`.

**Modified:**
[lib/whatsapp.ts](../../../lib/whatsapp.ts) (+ `normalizeE164`, `buildWhatsAppUrlTo`), [components/MobileStickyCTA.tsx](../../../components/MobileStickyCTA.tsx) (3 → 4 buttons; `/quote` renders Chat only), [components/ClientFloats.tsx](../../../components/ClientFloats.tsx) (`ChatWidget` → `ChatLauncher`), [app/layout.tsx](../../../app/layout.tsx) (mount `ChatProvider`), [next.config.ts](../../../next.config.ts) (CSP), [components/SpecSheetButton.tsx](../../../components/SpecSheetButton.tsx) (`?download=spec` auto-trigger), [app/privacy/page.tsx](../../../app/privacy/page.tsx).

**Deleted:** [components/ChatWidget.tsx](../../../components/ChatWidget.tsx) — its WhatsApp content is lifted verbatim into `WhatsAppPanel.tsx` (Task 14) *before* deletion (Task 17). The spec requires the old green bubble to be **gone, not merely hidden** (§12).

---

## Task 1: Firebase dependencies + config module

**Files:**
- Modify: `package.json`
- Create: `lib/firebase/config.ts`
- Create: `lib/firebase/client.ts`
- Create: `lib/firebase/admin.ts`
- Create: `.env.example`
- Test: `lib/firebase/config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `firebaseConfig(env?: Record<string, string | undefined>): FirebaseClientConfig | null` — returns `null` when any required `NEXT_PUBLIC_FIREBASE_*` var is missing/blank.
  - `isFirebaseConfigured(env?): boolean`
  - `type FirebaseClientConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }`
  - `getFirebaseApp(): FirebaseApp`, `getDb(): Firestore`, `getAuthClient(): Auth`, `getStorageClient(): FirebaseStorage` (client, lazy singletons; throw if unconfigured)
  - `getAdminApp(): App`, `getAdminDb(): Firestore`, `getAdminAuth(): Auth` (server, lazy singletons)

- [ ] **Step 1: Install dependencies**

```bash
npm install firebase@^12 firebase-admin@^13
```

- [ ] **Step 2: Write the failing test**

Create `lib/firebase/config.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run lib/firebase/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"`.

- [ ] **Step 4: Write `lib/firebase/config.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/firebase/config.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write `lib/firebase/client.ts`** (no unit test — SDK singletons)

```ts
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
```

- [ ] **Step 7: Write `lib/firebase/admin.ts`** (no unit test — SDK singletons)

```ts
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
```

- [ ] **Step 8: Write `.env.example`** (documents the new vars; spec §10)

```bash
# ── Firebase (live chat) ─────────────────────────────────────────────
# Client — safe to expose; access is controlled by Firestore/Storage rules.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server — SECRET. Service-account credentials for the Admin SDK.
# Paste the private key on one line with literal \n in place of newlines.
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Server — SECRET. Signs the chat resume links emailed to offline customers.
# Generate with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CHAT_RESUME_SECRET=

# Absolute origin used to build links inside emails.
NEXT_PUBLIC_SITE_URL=https://www.aplustechsol.com
```

- [ ] **Step 9: Run the full suite and commit**

```bash
npm test
git add package.json package-lock.json lib/firebase .env.example
git commit -m "feat(chat): firebase client/admin wiring + config module"
```

---

## Task 2: Domain types + message helpers

**Files:**
- Create: `lib/chat/types.ts`
- Create: `lib/chat/messages.ts`
- Test: `lib/chat/messages.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (every later task imports from here):
  - `type Sender = "customer" | "agent" | "system"`
  - `type LinkKind = "product" | "specSheet" | "catalogue" | "category"`
  - `interface ChatLink { url: string; label: string; kind: LinkKind }`
  - `interface ChatAttachment { url: string; name: string; mime: string; size: number }`
  - `interface ChatMessage { id: string; sender: Sender; text: string; createdAt: number; emailedAt?: number; attachment?: ChatAttachment; link?: ChatLink }`
  - `interface ChatCustomer { name: string; email: string; phone: string }`
  - `interface Conversation { id; visitorId; ownerUid; customer: ChatCustomer; startedBy: "customer" | "agent"; page: string; status: "open" | "closed"; needsFollowUp: boolean; createdAt: number; lastMessageAt: number; lastPreview: string; lastSender: Sender; unreadForAgent: number }`
  - `interface VisitorDoc { firstSeenAt: number; lastSeenAt: number; currentPage: string; chatOpen: boolean }`
  - `const COL = { conversations: "conversations", messages: "messages", visitors: "visitors", status: "status", agentDevices: "agentDevices" }`
  - `const TEAM_STATUS_DOC = "team"`
  - `toMillis(value: unknown): number` — Firestore `Timestamp` | `number` | `null` → epoch ms (`0` when absent).
  - `MAX_MESSAGE_LEN = 2000`, `PREVIEW_LEN = 80`
  - `buildPreview(input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }): string`
  - `isSendable(input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }): boolean`

- [ ] **Step 1: Write the failing test**

Create `lib/chat/messages.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildPreview, isSendable, MAX_MESSAGE_LEN, PREVIEW_LEN } from "./messages";
import { toMillis } from "./types";

describe("buildPreview", () => {
  it("uses the text when present", () => {
    expect(buildPreview({ text: "Need pricing for a QB65" })).toBe("Need pricing for a QB65");
  });

  it("collapses whitespace and newlines into single spaces", () => {
    expect(buildPreview({ text: "Need\n\n  pricing   now" })).toBe("Need pricing now");
  });

  it("truncates with an ellipsis at PREVIEW_LEN", () => {
    const preview = buildPreview({ text: "x".repeat(200) });
    expect(preview).toHaveLength(PREVIEW_LEN);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("falls back to the attachment name when there is no text", () => {
    expect(
      buildPreview({ attachment: { url: "u", name: "QB65.pdf", mime: "application/pdf", size: 10 } })
    ).toBe("📎 QB65.pdf");
  });

  it("falls back to the link label when there is no text", () => {
    expect(buildPreview({ link: { url: "u", label: "QB65 — spec sheet", kind: "specSheet" } })).toBe(
      "🔗 QB65 — spec sheet"
    );
  });

  it("prefers text over an attachment when both are present", () => {
    expect(
      buildPreview({
        text: "Here you go",
        attachment: { url: "u", name: "QB65.pdf", mime: "application/pdf", size: 10 },
      })
    ).toBe("Here you go");
  });

  it("returns an empty string for an empty message", () => {
    expect(buildPreview({})).toBe("");
    expect(buildPreview({ text: "   " })).toBe("");
  });
});

describe("isSendable", () => {
  it("accepts non-empty text", () => {
    expect(isSendable({ text: "hi" })).toBe(true);
  });

  it("rejects blank or whitespace-only text with no attachment or link", () => {
    expect(isSendable({ text: "   " })).toBe(false);
    expect(isSendable({})).toBe(false);
  });

  it("rejects text over MAX_MESSAGE_LEN", () => {
    expect(isSendable({ text: "x".repeat(MAX_MESSAGE_LEN + 1) })).toBe(false);
    expect(isSendable({ text: "x".repeat(MAX_MESSAGE_LEN) })).toBe(true);
  });

  it("accepts an attachment or a link with no text", () => {
    expect(
      isSendable({ attachment: { url: "u", name: "a.pdf", mime: "application/pdf", size: 1 } })
    ).toBe(true);
    expect(isSendable({ link: { url: "u", label: "QB65", kind: "product" } })).toBe(true);
  });
});

describe("toMillis", () => {
  it("passes an epoch-ms number through", () => {
    expect(toMillis(1_700_000_000_000)).toBe(1_700_000_000_000);
  });

  it("unwraps a Firestore Timestamp via toMillis()", () => {
    expect(toMillis({ toMillis: () => 42 })).toBe(42);
  });

  it("returns 0 for null, undefined, or an unrecognised shape", () => {
    expect(toMillis(null)).toBe(0);
    expect(toMillis(undefined)).toBe(0);
    expect(toMillis("nonsense")).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/chat/messages.test.ts`
Expected: FAIL — `Failed to resolve import "./messages"`.

- [ ] **Step 3: Write `lib/chat/types.ts`**

```ts
/**
 * Chat domain model (spec §2).
 *
 * Timestamps are `number` (epoch ms) throughout the app. Firestore writes them
 * as `serverTimestamp()` and reads them back as `Timestamp`; `toMillis()` is the
 * single conversion point. Keeping the app model on plain numbers is what lets
 * presence and escalation logic stay pure and unit-testable.
 */

export type Sender = "customer" | "agent" | "system";
export type LinkKind = "product" | "specSheet" | "catalogue" | "category";

/** Quick-send link to an asset the site already produces (spec §4.1 A). */
export interface ChatLink {
  url: string;
  label: string;
  kind: LinkKind;
}

/** Agent-uploaded file in Firebase Storage (spec §4.1 B). */
export interface ChatAttachment {
  url: string;
  name: string;
  mime: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number;
  /** Set when this agent reply was emailed to an offline customer (spec §6.3). */
  emailedAt?: number;
  attachment?: ChatAttachment;
  link?: ChatLink;
}

export interface ChatCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Conversation {
  id: string;
  /** → visitors/{visitorId}: presence + (Phase 3) journey, beside the chat. */
  visitorId: string;
  /** The customer's anonymous auth uid. The ownership check in the rules. */
  ownerUid: string;
  customer: ChatCustomer;
  startedBy: "customer" | "agent";
  page: string;
  status: "open" | "closed";
  /** Set by /api/chat/escalate, cleared on the next agent reply (spec §6). */
  needsFollowUp: boolean;
  createdAt: number;
  lastMessageAt: number;
  lastPreview: string;
  lastSender: Sender;
  unreadForAgent: number;
}

export interface VisitorDoc {
  firstSeenAt: number;
  lastSeenAt: number;
  currentPage: string;
  /** Widget panel open ⇒ they are *watching the chat*, not just on the site. */
  chatOpen: boolean;
}

export const COL = {
  conversations: "conversations",
  messages: "messages",
  visitors: "visitors",
  status: "status",
  agentDevices: "agentDevices",
} as const;

/** status/team — the single public-read presence doc (spec §5). */
export const TEAM_STATUS_DOC = "team";

/** Firestore Timestamp | epoch-ms number | absent → epoch ms (0 when absent). */
export function toMillis(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    const ms = (value as { toMillis: () => number }).toMillis();
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}
```

- [ ] **Step 4: Write `lib/chat/messages.ts`**

```ts
import type { ChatAttachment, ChatLink } from "./types";

/** Hard cap on message text. Enforced here AND in firestore.rules — the rule is
 *  the real control; this one is just a kinder failure. */
export const MAX_MESSAGE_LEN = 2000;

/** Length of `lastPreview` (the inbox list line). */
export const PREVIEW_LEN = 80;

interface MessageBody {
  text?: string;
  attachment?: ChatAttachment;
  link?: ChatLink;
}

/**
 * One-line summary for the console inbox and (Phase 2) the push payload.
 * Text wins; otherwise name the attachment or the link, so a file-only message
 * never shows as a blank row.
 */
export function buildPreview({ text, attachment, link }: MessageBody): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean) {
    return clean.length > PREVIEW_LEN ? `${clean.slice(0, PREVIEW_LEN - 1)}…` : clean;
  }
  if (attachment) return `📎 ${attachment.name}`;
  if (link) return `🔗 ${link.label}`;
  return "";
}

/** Is there anything worth sending? Guards the composer's send button. */
export function isSendable({ text, attachment, link }: MessageBody): boolean {
  const clean = (text ?? "").trim();
  if (clean.length > MAX_MESSAGE_LEN) return false;
  return Boolean(clean || attachment || link);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/chat/messages.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 6: Commit**

```bash
npm test
git add lib/chat/types.ts lib/chat/messages.ts lib/chat/messages.test.ts
git commit -m "feat(chat): domain types + message preview helpers"
```

---

## Task 3: Presence + escalation timing

Both sides of the app read these. They are pure functions of `(timestamp, now)` so the 90-second and 3-minute boundaries are testable without a clock.

**Files:**
- Create: `lib/chat/presence.ts`
- Create: `lib/chat/escalation.ts`
- Test: `lib/chat/presence.test.ts`
- Test: `lib/chat/escalation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PRESENCE_WINDOW_MS = 90_000`, `HEARTBEAT_INTERVAL_MS = 45_000`
  - `isTeamOnline(onlineUntil: number | null | undefined, now?: number): boolean`
  - `isVisitorOnline(lastSeenAt: number | null | undefined, now?: number): boolean`
  - `formatLastSeen(lastSeenAt: number | null | undefined, now?: number): string`
  - `UNANSWERED_TIMEOUT_MS = 180_000`
  - `shouldEscalate(args: { lastCustomerMessageAt: number | null; lastAgentMessageAt: number | null; needsFollowUp: boolean; now: number }): boolean`

- [ ] **Step 1: Write the failing presence test**

Create `lib/chat/presence.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  isTeamOnline,
  isVisitorOnline,
  formatLastSeen,
  PRESENCE_WINDOW_MS,
} from "./presence";

const NOW = 1_700_000_000_000;

describe("isTeamOnline", () => {
  it("is online while onlineUntil is in the future", () => {
    expect(isTeamOnline(NOW + 1_000, NOW)).toBe(true);
  });

  it("is away once onlineUntil has lapsed — a crashed console decays to away", () => {
    expect(isTeamOnline(NOW - 1, NOW)).toBe(false);
    expect(isTeamOnline(NOW, NOW)).toBe(false);
  });

  it("is away when the doc has never been written", () => {
    expect(isTeamOnline(null, NOW)).toBe(false);
    expect(isTeamOnline(undefined, NOW)).toBe(false);
    expect(isTeamOnline(0, NOW)).toBe(false);
  });
});

describe("isVisitorOnline", () => {
  it("is online inside the 90s window", () => {
    expect(isVisitorOnline(NOW - (PRESENCE_WINDOW_MS - 1), NOW)).toBe(true);
    expect(isVisitorOnline(NOW, NOW)).toBe(true);
  });

  it("is offline exactly at the window boundary and beyond", () => {
    expect(isVisitorOnline(NOW - PRESENCE_WINDOW_MS, NOW)).toBe(false);
    expect(isVisitorOnline(NOW - 10 * 60_000, NOW)).toBe(false);
  });

  it("is offline when never seen", () => {
    expect(isVisitorOnline(null, NOW)).toBe(false);
    expect(isVisitorOnline(0, NOW)).toBe(false);
  });

  it("tolerates a slightly future timestamp (clock skew) rather than reporting offline", () => {
    expect(isVisitorOnline(NOW + 5_000, NOW)).toBe(true);
  });
});

describe("formatLastSeen", () => {
  it("reports minutes for a recent departure", () => {
    expect(formatLastSeen(NOW - 6 * 60_000, NOW)).toBe("Left 6 minutes ago");
  });

  it("singularises one minute", () => {
    expect(formatLastSeen(NOW - 60_000, NOW)).toBe("Left 1 minute ago");
  });

  it("reports 'just now' inside the first minute", () => {
    expect(formatLastSeen(NOW - 20_000, NOW)).toBe("Left just now");
  });

  it("rolls up to hours past 60 minutes", () => {
    expect(formatLastSeen(NOW - 2 * 60 * 60_000, NOW)).toBe("Left 2 hours ago");
    expect(formatLastSeen(NOW - 60 * 60_000, NOW)).toBe("Left 1 hour ago");
  });

  it("rolls up to days past 24 hours", () => {
    expect(formatLastSeen(NOW - 3 * 24 * 60 * 60_000, NOW)).toBe("Left 3 days ago");
  });

  it("says so when the visitor was never seen", () => {
    expect(formatLastSeen(null, NOW)).toBe("Not seen yet");
    expect(formatLastSeen(0, NOW)).toBe("Not seen yet");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/chat/presence.test.ts`
Expected: FAIL — `Failed to resolve import "./presence"`.

- [ ] **Step 3: Write `lib/chat/presence.ts`**

```ts
/**
 * Measured presence, both directions (spec §5).
 *
 * Business hours cannot know about lunch, holidays, or a sick day, so presence
 * is *measured*, never scheduled:
 *
 *   team    → online iff a console is open and heart-beating (status/team.onlineUntil)
 *   visitor → online iff their tab heart-beat within the last 90s (visitors/{id}.lastSeenAt)
 *
 * Both heartbeats write every 45s into a 90s window, so exactly one beat can be
 * lost (a flaky network, a throttled background tab) before presence flips. And
 * because the window *lapses* rather than being cleared on unload, a crashed tab
 * correctly decays to "away" instead of showing online forever.
 */

export const PRESENCE_WINDOW_MS = 90_000;
export const HEARTBEAT_INTERVAL_MS = 45_000;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Is a sales console open right now? Reads status/team.onlineUntil. */
export function isTeamOnline(onlineUntil: number | null | undefined, now: number = Date.now()): boolean {
  if (!onlineUntil) return false;
  return onlineUntil > now;
}

/** Is the customer still on the site? Reads visitors/{id}.lastSeenAt. */
export function isVisitorOnline(lastSeenAt: number | null | undefined, now: number = Date.now()): boolean {
  if (!lastSeenAt) return false;
  // A future timestamp means the server clock ran ahead of ours, not that they
  // left — treat it as present rather than flapping the agent's UI to "away".
  return now - lastSeenAt < PRESENCE_WINDOW_MS;
}

/** "Left 6 minutes ago" — shown to the agent when the customer has gone (spec §4). */
export function formatLastSeen(lastSeenAt: number | null | undefined, now: number = Date.now()): string {
  if (!lastSeenAt) return "Not seen yet";

  const elapsed = Math.max(0, now - lastSeenAt);
  if (elapsed < MINUTE_MS) return "Left just now";

  const plural = (n: number, unit: string) => `Left ${n} ${unit}${n === 1 ? "" : "s"} ago`;

  if (elapsed < HOUR_MS) return plural(Math.floor(elapsed / MINUTE_MS), "minute");
  if (elapsed < DAY_MS) return plural(Math.floor(elapsed / HOUR_MS), "hour");
  return plural(Math.floor(elapsed / DAY_MS), "day");
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/chat/presence.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Write the failing escalation test**

Create `lib/chat/escalation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shouldEscalate, UNANSWERED_TIMEOUT_MS } from "./escalation";

const NOW = 1_700_000_000_000;
const base = {
  lastCustomerMessageAt: NOW - UNANSWERED_TIMEOUT_MS,
  lastAgentMessageAt: null as number | null,
  needsFollowUp: false,
  now: NOW,
};

describe("shouldEscalate", () => {
  it("escalates once the timeout has elapsed with no agent reply", () => {
    expect(shouldEscalate(base)).toBe(true);
  });

  it("does not escalate before the timeout", () => {
    expect(shouldEscalate({ ...base, lastCustomerMessageAt: NOW - (UNANSWERED_TIMEOUT_MS - 1) })).toBe(false);
  });

  it("does not escalate when the agent replied after the customer's message", () => {
    expect(
      shouldEscalate({ ...base, lastAgentMessageAt: base.lastCustomerMessageAt + 1_000 })
    ).toBe(false);
  });

  it("still escalates when the agent's only reply predates the customer's message", () => {
    expect(
      shouldEscalate({ ...base, lastAgentMessageAt: base.lastCustomerMessageAt - 1_000 })
    ).toBe(true);
  });

  it("does not escalate twice — an already-flagged conversation is left alone", () => {
    expect(shouldEscalate({ ...base, needsFollowUp: true })).toBe(false);
  });

  it("does not escalate when the customer has never sent anything", () => {
    expect(shouldEscalate({ ...base, lastCustomerMessageAt: null })).toBe(false);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run lib/chat/escalation.test.ts`
Expected: FAIL — `Failed to resolve import "./escalation"`.

- [ ] **Step 7: Write `lib/chat/escalation.ts`**

```ts
/**
 * The no-reply safety net's trigger condition (spec §6).
 *
 * Evaluated by the *waiting customer's own browser*, which is what lets the
 * escalation fire even when no console is open anywhere — no cron job, no paid
 * plan. The browser only decides *when*; POST /api/chat/escalate re-verifies
 * ownership server-side and does the privileged work.
 */

export const UNANSWERED_TIMEOUT_MS = 3 * 60_000;

interface EscalationState {
  lastCustomerMessageAt: number | null;
  lastAgentMessageAt: number | null;
  /** Already flagged — escalating again would re-spam the inbox. */
  needsFollowUp: boolean;
  now: number;
}

export function shouldEscalate({
  lastCustomerMessageAt,
  lastAgentMessageAt,
  needsFollowUp,
  now,
}: EscalationState): boolean {
  if (needsFollowUp) return false;
  if (!lastCustomerMessageAt) return false;
  // An agent reply *after* the customer's last message means they are answered.
  if (lastAgentMessageAt !== null && lastAgentMessageAt > lastCustomerMessageAt) return false;
  return now - lastCustomerMessageAt >= UNANSWERED_TIMEOUT_MS;
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run lib/chat/escalation.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 9: Commit**

```bash
npm test
git add lib/chat/presence.ts lib/chat/presence.test.ts lib/chat/escalation.ts lib/chat/escalation.test.ts
git commit -m "feat(chat): two-way presence + unanswered-escalation timing"
```

---

## Task 4: Attachment validation

The upload path is the one place an outsider could push a file at us, so the size and MIME limits get a real test here **and** a rule in Task 9. The UI check is the kind failure; the rule is the control.

**Files:**
- Create: `lib/chat/attachments.ts`
- Test: `lib/chat/attachments.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024`
  - `ALLOWED_ATTACHMENT_MIME: readonly ["application/pdf", "image/png", "image/jpeg", "image/webp"]`
  - `ATTACHMENT_ACCEPT: string` — the `accept` attribute for `<input type="file">`
  - `type AttachmentCheck = { ok: true } | { ok: false; reason: string }`
  - `validateAttachment(file: { name: string; size: number; type: string }): AttachmentCheck`
  - `isImageMime(mime: string): boolean`
  - `formatBytes(bytes: number): string`

- [ ] **Step 1: Write the failing test**

Create `lib/chat/attachments.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  validateAttachment,
  isImageMime,
  formatBytes,
  MAX_ATTACHMENT_BYTES,
} from "./attachments";

const pdf = { name: "qb65.pdf", size: 1_000, type: "application/pdf" };

describe("validateAttachment", () => {
  it.each(["application/pdf", "image/png", "image/jpeg", "image/webp"])(
    "accepts an allowed type: %s",
    (type) => {
      expect(validateAttachment({ ...pdf, type })).toEqual({ ok: true });
    }
  );

  it("accepts a file exactly at the size limit", () => {
    expect(validateAttachment({ ...pdf, size: MAX_ATTACHMENT_BYTES })).toEqual({ ok: true });
  });

  it("rejects a file over 10 MB", () => {
    const result = validateAttachment({ ...pdf, size: MAX_ATTACHMENT_BYTES + 1 });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toContain("10 MB");
  });

  it("rejects a disallowed type — zip", () => {
    const result = validateAttachment({ name: "a.zip", size: 10, type: "application/zip" });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toContain("PDF");
  });

  it("rejects SVG — it is an XSS vector, not a safe image", () => {
    expect(validateAttachment({ name: "a.svg", size: 10, type: "image/svg+xml" }).ok).toBe(false);
  });

  it("rejects an empty file", () => {
    expect(validateAttachment({ ...pdf, size: 0 }).ok).toBe(false);
  });

  it("rejects a file with no MIME type at all", () => {
    expect(validateAttachment({ ...pdf, type: "" }).ok).toBe(false);
  });

  it("ignores a charset parameter on the content type", () => {
    expect(validateAttachment({ ...pdf, type: "application/pdf; charset=binary" })).toEqual({ ok: true });
  });

  it("matches the type case-insensitively", () => {
    expect(validateAttachment({ ...pdf, type: "IMAGE/PNG" })).toEqual({ ok: true });
  });
});

describe("isImageMime", () => {
  it("is true for the allowed image types (rendered inline)", () => {
    expect(isImageMime("image/png")).toBe(true);
    expect(isImageMime("image/webp")).toBe(true);
  });

  it("is false for PDF (rendered as a download card)", () => {
    expect(isImageMime("application/pdf")).toBe(false);
  });

  it("is false for SVG even though it starts with image/", () => {
    expect(isImageMime("image/svg+xml")).toBe(false);
  });
});

describe("formatBytes", () => {
  it("formats KB and MB", () => {
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(1_572_864)).toBe("1.5 MB");
  });

  it("formats bytes under 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/chat/attachments.test.ts`
Expected: FAIL — `Failed to resolve import "./attachments"`.

- [ ] **Step 3: Write `lib/chat/attachments.ts`**

```ts
/**
 * Attachment guards (spec §4.1, §9).
 *
 * The allow-list is a SECURITY control, not a convenience: an upload is the one
 * inbound file path in the product. Deny by default, and keep this list in exact
 * sync with storage.rules — the rules are what actually stop a crafted request;
 * this module only gives the agent a readable error before they wait on an upload.
 *
 * SVG is deliberately excluded despite being an image: it can carry script.
 */

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AllowedMime = (typeof ALLOWED_ATTACHMENT_MIME)[number];

/** `accept` attribute for the file input. Convenience only — never the control. */
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_MIME.join(",");

const IMAGE_MIME = new Set<string>(["image/png", "image/jpeg", "image/webp"]);

export type AttachmentCheck = { ok: true } | { ok: false; reason: string };

/** Strip any `; charset=…` parameter and normalise case before matching. */
function baseMime(type: string): string {
  return type.split(";")[0].trim().toLowerCase();
}

export function validateAttachment(file: { name: string; size: number; type: string }): AttachmentCheck {
  const mime = baseMime(file.type);

  if (!mime || !(ALLOWED_ATTACHMENT_MIME as readonly string[]).includes(mime)) {
    return { ok: false, reason: "Only PDF, PNG, JPEG and WebP files can be sent." };
  }
  if (file.size <= 0) {
    return { ok: false, reason: "That file is empty." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, reason: `Files must be under 10 MB — this one is ${formatBytes(file.size)}.` };
  }
  return { ok: true };
}

/** Images render inline in the thread; everything else renders as a card. */
export function isImageMime(mime: string): boolean {
  return IMAGE_MIME.has(baseMime(mime));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${round(bytes / 1024)} KB`;
  return `${round(bytes / (1024 * 1024))} MB`;
}

/** One decimal place, but no trailing ".0". */
function round(value: number): string {
  return String(Math.round(value * 10) / 10);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/chat/attachments.test.ts`
Expected: PASS (17 tests).

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/chat/attachments.ts lib/chat/attachments.test.ts
git commit -m "feat(chat): attachment size + MIME allow-list guards"
```

---

## Task 5: Quick-send link builders + `?download=spec`

The cheap half of §4.1. The site already produces these assets, so the console can send a **link** for free — no Storage read, no egress, and the visitor lands back on-site where the lead gate and PostHog still apply.

One wrinkle to know: **spec sheets are generated in the browser**, not served as files ([components/SpecSheetButton.tsx:22](../../../components/SpecSheetButton.tsx#L22) dynamically imports `buildSpecSheetPdf`). There is no PDF URL to link to. So a spec-sheet link points at the product page with `?download=spec`, and this task teaches that page to auto-trigger the download.

**Files:**
- Create: `lib/chat/links.ts`
- Test: `lib/chat/links.test.ts`
- Modify: `components/SpecSheetButton.tsx`

**Interfaces:**
- Consumes: `ChatLink`, `LinkKind` (Task 2); `Product` from `@/data/products`; `ProductCategory` from `@/data/categories`.
- Produces:
  - `siteUrl(): string` — `NEXT_PUBLIC_SITE_URL` with any trailing slash stripped; falls back to `https://www.aplustechsol.com`.
  - `buildProductLink(product: Product): ChatLink`
  - `buildSpecSheetLink(product: Product): ChatLink`
  - `buildCategoryLink(category: ProductCategory): ChatLink`
  - `buildCatalogueLink(): ChatLink`
  - `searchCatalogue(query: string, limit?: number): Product[]` — powers `LinkPicker` (Task 24).

- [ ] **Step 1: Write the failing test**

Create `lib/chat/links.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildProductLink,
  buildSpecSheetLink,
  buildCategoryLink,
  buildCatalogueLink,
  searchCatalogue,
  siteUrl,
} from "./links";
import { products } from "@/data/products";
import { getCategoryById } from "@/data/categories";

const product = products[0];

describe("link builders", () => {
  it("builds a product link pointing at the PDP", () => {
    expect(buildProductLink(product)).toEqual({
      url: `${siteUrl()}/products/${product.id}`,
      label: product.name,
      kind: "product",
    });
  });

  it("builds a spec-sheet link that auto-triggers the PDP download", () => {
    const link = buildSpecSheetLink(product);
    expect(link.url).toBe(`${siteUrl()}/products/${product.id}?download=spec`);
    expect(link.kind).toBe("specSheet");
    expect(link.label).toContain("spec sheet");
  });

  it("builds a category link", () => {
    const category = getCategoryById("video-walls")!;
    expect(buildCategoryLink(category)).toEqual({
      url: `${siteUrl()}/categories/video-walls`,
      label: `${category.name} range`,
      kind: "category",
    });
  });

  it("builds the full-catalogue link", () => {
    expect(buildCatalogueLink()).toEqual({
      url: `${siteUrl()}/products`,
      label: "Full Samsung catalogue",
      kind: "catalogue",
    });
  });

  it("emits absolute URLs — a chat link may be opened from an email", () => {
    for (const link of [buildProductLink(product), buildSpecSheetLink(product), buildCatalogueLink()]) {
      expect(link.url.startsWith("https://")).toBe(true);
    }
  });
});

describe("searchCatalogue", () => {
  it("matches on product name, case-insensitively", () => {
    const hits = searchCatalogue(product.name.toLowerCase());
    expect(hits.map((p) => p.id)).toContain(product.id);
  });

  it("matches on series and on category", () => {
    expect(searchCatalogue(product.series).length).toBeGreaterThan(0);
    expect(searchCatalogue("video wall").length).toBeGreaterThan(0);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchCatalogue("")).toEqual([]);
    expect(searchCatalogue("   ")).toEqual([]);
  });

  it("caps the number of results", () => {
    expect(searchCatalogue("samsung", 3)).toHaveLength(3);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchCatalogue("zzzznotathing")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/chat/links.test.ts`
Expected: FAIL — `Failed to resolve import "./links"`.

- [ ] **Step 3: Write `lib/chat/links.ts`**

```ts
/**
 * Quick-send links (spec §4.1 A) — the cheap half of "send me the spec sheet".
 *
 * The site already produces every asset the salesperson wants to send, so the
 * console can send a LINK rather than a file: no Storage write, no egress, and
 * the visitor lands back on-site where the lead gate and PostHog still apply.
 *
 * Spec sheets are built client-side (pdf-lib in SpecSheetButton), so there is no
 * PDF URL to link to — a spec-sheet link points at the PDP with ?download=spec,
 * which SpecSheetButton picks up and fires on mount.
 *
 * URLs are ABSOLUTE: a link message is also inlined into the offline-customer
 * reply email (spec §6.3), where a relative path would be dead.
 */

import { products, type Product } from "@/data/products";
import type { ProductCategory } from "@/data/categories";
import type { ChatLink } from "./types";

const DEFAULT_SITE_URL = "https://www.aplustechsol.com";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function buildProductLink(product: Product): ChatLink {
  return {
    url: `${siteUrl()}/products/${product.id}`,
    label: product.name,
    kind: "product",
  };
}

export function buildSpecSheetLink(product: Product): ChatLink {
  return {
    url: `${siteUrl()}/products/${product.id}?download=spec`,
    label: `${product.name} — spec sheet (PDF)`,
    kind: "specSheet",
  };
}

export function buildCategoryLink(category: ProductCategory): ChatLink {
  return {
    url: `${siteUrl()}/categories/${category.id}`,
    label: `${category.name} range`,
    kind: "category",
  };
}

export function buildCatalogueLink(): ChatLink {
  return {
    url: `${siteUrl()}/products`,
    label: "Full Samsung catalogue",
    kind: "catalogue",
  };
}

/** Catalogue search behind the console's LinkPicker. Name, series, category. */
export function searchCatalogue(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: Product[] = [];
  for (const product of products) {
    const haystack = `${product.name} ${product.series} ${product.category} ${product.subCategory ?? ""}`.toLowerCase();
    if (haystack.includes(q)) hits.push(product);
    if (hits.length >= limit) break;
  }
  return hits;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/chat/links.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Teach the PDP to honour `?download=spec`**

Read [components/SpecSheetButton.tsx](../../../components/SpecSheetButton.tsx) first. It already has a `handleDownload`-style click handler that dynamically imports `buildSpecSheetPdf`. Extract that body into a `useCallback` named `download` (if it is not already one), then add the auto-trigger below it. Do **not** change the button's existing markup or the lead-gate behaviour.

```tsx
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

// …inside the component, after `download` is defined:

const searchParams = useSearchParams();
const autoFired = useRef(false);

// A spec-sheet link sent from the sales console lands here as ?download=spec
// (lib/chat/links.ts). Fire the same download the button would, exactly once —
// StrictMode double-invokes effects in dev, and a second PDF would be confusing.
useEffect(() => {
  if (autoFired.current) return;
  if (searchParams.get("download") !== "spec") return;
  autoFired.current = true;
  void download();
}, [searchParams, download]);
```

`useSearchParams()` in a client component requires the nearest server parent to have a `<Suspense>` boundary, or the page opts out of static rendering. `SpecSheetButton` is already rendered inside the PDP's client subtree — if `npm run build` reports a `useSearchParams` bailout for `/products/[slug]`, wrap the two `<SpecSheetButton …/>` usages in [app/products/[slug]/page.tsx](../../../app/products/[slug]/page.tsx) (lines ~253 and ~469) in `<Suspense fallback={null}>…</Suspense>`.

- [ ] **Step 6: Verify the build still statically renders the PDP**

Run: `npm run build`
Expected: build succeeds; `/products/[slug]` still listed as SSG (`●`). If it reports a `useSearchParams()` bailout, apply the `<Suspense>` wrap above and rebuild.

- [ ] **Step 7: Commit**

```bash
npm test
git add lib/chat/links.ts lib/chat/links.test.ts components/SpecSheetButton.tsx app/products
git commit -m "feat(chat): quick-send link builders + ?download=spec on the PDP"
```

---

## Task 6: WhatsApp-to-customer helper

Every existing helper targets the **business** number. The console needs the opposite direction — message *the customer* (spec §6.3). Indian numbers arrive from the pre-chat form in every shape imaginable (`9310509909`, `093105 09909`, `+91 93105-09909`), so normalisation is the whole job.

**Files:**
- Modify: `lib/whatsapp.ts`
- Modify: `lib/whatsapp.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `normalizeE164(phone: string, defaultCountryCode?: string): string | null` — `"+919310509909"` or `null` if unusable.
  - `buildWhatsAppUrlTo(phone: string, message: string): string | null` — `wa.me` link **to the customer**; `null` when the phone cannot be normalised (callers hide the button).

- [ ] **Step 1: Add the failing tests**

Append to `lib/whatsapp.test.ts`:

```ts
import { normalizeE164, buildWhatsAppUrlTo } from "./whatsapp";

describe("normalizeE164", () => {
  it("prepends the default +91 to a bare 10-digit Indian number", () => {
    expect(normalizeE164("9310509909")).toBe("+919310509909");
  });

  it("strips separators and spaces", () => {
    expect(normalizeE164("93105 09909")).toBe("+919310509909");
    expect(normalizeE164("93105-099-09")).toBe("+919310509909");
    expect(normalizeE164("(931) 050-9909")).toBe("+919310509909");
  });

  it("drops a leading trunk zero before applying the country code", () => {
    expect(normalizeE164("09310509909")).toBe("+919310509909");
  });

  it("keeps an explicit + prefix as-is", () => {
    expect(normalizeE164("+919310509909")).toBe("+919310509909");
    expect(normalizeE164("+1 415 555 2671")).toBe("+14155552671");
  });

  it("treats a 12-digit number starting with 91 as already country-coded", () => {
    expect(normalizeE164("919310509909")).toBe("+919310509909");
  });

  it("honours a non-default country code", () => {
    expect(normalizeE164("4155552671", "1")).toBe("+14155552671");
  });

  it("returns null for anything unusable", () => {
    expect(normalizeE164("")).toBeNull();
    expect(normalizeE164("   ")).toBeNull();
    expect(normalizeE164("12345")).toBeNull();
    expect(normalizeE164("not a phone")).toBeNull();
    expect(normalizeE164("+9999999999999999999")).toBeNull();
  });
});

describe("buildWhatsAppUrlTo", () => {
  it("targets the CUSTOMER's number, not the business number", () => {
    const url = buildWhatsAppUrlTo("9310509909", "Hi Rahul");
    expect(url).toBe("https://wa.me/919310509909?text=Hi%20Rahul");
  });

  it("URL-encodes the pre-filled context line", () => {
    const url = buildWhatsAppUrlTo("+919999999999", "Following up on the QB65 — pricing?");
    expect(url).toContain("text=Following%20up%20on%20the%20QB65%20%E2%80%94%20pricing%3F");
  });

  it("returns null for an unusable phone so the console can hide the button", () => {
    expect(buildWhatsAppUrlTo("nope", "Hi")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: FAIL — `normalizeE164 is not a function` (or an import error).

- [ ] **Step 3: Append to `lib/whatsapp.ts`**

```ts
/**
 * Normalise a customer-entered phone number to E.164 ("+919310509909").
 *
 * Every helper above targets the BUSINESS number; this is the other direction —
 * the sales console messaging the customer (spec §6.3). Numbers arrive from a
 * free-text form field, so assume nothing: "9310509909", "093105 09909",
 * "+91 93105-09909" must all land on the same value, and junk must return null
 * so the caller can hide the button rather than open a broken wa.me link.
 *
 * Returns null rather than throwing: an unusable phone is an expected input.
 */
export function normalizeE164(phone: string, defaultCountryCode = "91"): string | null {
  const raw = phone.trim();
  if (!raw) return null;

  const hasPlus = raw.startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (!hasPlus) {
    // A leading 0 is India's trunk prefix, not part of the subscriber number.
    digits = digits.replace(/^0+/, "");
    // Exactly 10 digits ⇒ a national number missing its country code.
    if (digits.length === 10) digits = `${defaultCountryCode}${digits}`;
  }

  // E.164 allows at most 15 digits; anything under 10 is not a mobile number.
  if (digits.length < 10 || digits.length > 15) return null;

  return `+${digits}`;
}

/** wa.me deep link addressed TO the customer, pre-filled with context. */
export function buildWhatsAppUrlTo(phone: string, message: string): string | null {
  const e164 = normalizeE164(phone);
  if (!e164) return null;
  // wa.me takes the digits without the leading '+'.
  return `https://wa.me/${e164.slice(1)}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/whatsapp.test.ts`
Expected: PASS (all existing tests plus 10 new).

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat(chat): buildWhatsAppUrlTo + E.164 normalisation for customer numbers"
```

---

## Task 7: Resume-link HMAC

When an agent replies to a customer who has closed the tab, we email the reply with a link back into the *same* thread (spec §6.3). The customer may open it in a different browser with no anonymous session — Firestore rules would (correctly) lock them out. The link therefore carries an HMAC that `/api/chat/resume` (Task 21) verifies before minting a Firebase custom token for the conversation's `ownerUid`.

**Files:**
- Create: `lib/chat/resumeToken.ts`
- Test: `lib/chat/resumeToken.test.ts`

**Interfaces:**
- Consumes: `siteUrl()` (Task 5).
- Produces:
  - `signResumeToken(conversationId: string, secret: string): string` — 64-char lowercase hex.
  - `verifyResumeToken(conversationId: string, token: string, secret: string): boolean`
  - `buildResumeUrl(conversationId: string, secret: string): string` — absolute `…/api/chat/resume?c=…&token=…`

- [ ] **Step 1: Write the failing test**

Create `lib/chat/resumeToken.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { signResumeToken, verifyResumeToken, buildResumeUrl } from "./resumeToken";

const SECRET = "test-secret-do-not-use-in-production";
const CONV = "conv_abc123";

describe("signResumeToken", () => {
  it("produces a 64-char hex digest", () => {
    expect(signResumeToken(CONV, SECRET)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(signResumeToken(CONV, SECRET)).toBe(signResumeToken(CONV, SECRET));
  });

  it("differs per conversation and per secret", () => {
    expect(signResumeToken(CONV, SECRET)).not.toBe(signResumeToken("conv_other", SECRET));
    expect(signResumeToken(CONV, SECRET)).not.toBe(signResumeToken(CONV, "other-secret"));
  });
});

describe("verifyResumeToken", () => {
  it("accepts a token it just signed", () => {
    expect(verifyResumeToken(CONV, signResumeToken(CONV, SECRET), SECRET)).toBe(true);
  });

  it("rejects a tampered token", () => {
    const token = signResumeToken(CONV, SECRET);
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(verifyResumeToken(CONV, tampered, SECRET)).toBe(false);
  });

  it("rejects a token minted for a DIFFERENT conversation — no cross-thread access", () => {
    const token = signResumeToken("conv_other", SECRET);
    expect(verifyResumeToken(CONV, token, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    expect(verifyResumeToken(CONV, signResumeToken(CONV, "wrong"), SECRET)).toBe(false);
  });

  it("rejects malformed input without throwing", () => {
    expect(verifyResumeToken(CONV, "", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "not-hex", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "abc", SECRET)).toBe(false);
    expect(verifyResumeToken(CONV, "A".repeat(64), SECRET)).toBe(false);
  });
});

describe("buildResumeUrl", () => {
  it("builds an absolute URL carrying the conversation id and its token", () => {
    const url = new URL(buildResumeUrl(CONV, SECRET));
    expect(url.pathname).toBe("/api/chat/resume");
    expect(url.searchParams.get("c")).toBe(CONV);
    expect(verifyResumeToken(CONV, url.searchParams.get("token")!, SECRET)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/chat/resumeToken.test.ts`
Expected: FAIL — `Failed to resolve import "./resumeToken"`.

- [ ] **Step 3: Write `lib/chat/resumeToken.ts`**

```ts
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl } from "./links";

/**
 * Signed resume links (spec §6.3).
 *
 * An agent replies; the customer has closed the tab. We email the reply with a
 * link back into the SAME thread — but they may open it in a browser that has no
 * anonymous session, and the rules would (correctly) refuse them. So the link
 * carries an HMAC over the conversation id, and /api/chat/resume trades a valid
 * token for a Firebase custom token scoped to that conversation's ownerUid.
 *
 * The MAC is over the conversation id alone, so a token minted for one thread
 * cannot open another. It does not expire: the alternative is emailing a dead
 * link to a customer who read the mail a week later, which is the failure mode
 * this whole feature exists to prevent. The secret (CHAT_RESUME_SECRET) is the
 * only thing standing between a guess and a thread, so it must be long random.
 *
 * Server-only: node:crypto. Never import from a client component.
 */

export function signResumeToken(conversationId: string, secret: string): string {
  return createHmac("sha256", secret).update(conversationId).digest("hex");
}

export function verifyResumeToken(conversationId: string, token: string, secret: string): boolean {
  // Shape-check before decoding: Buffer.from() silently drops invalid hex, which
  // would otherwise let a short/garbage token through to a length-mismatch path.
  if (!/^[a-f0-9]{64}$/.test(token)) return false;

  const expected = Buffer.from(signResumeToken(conversationId, secret), "hex");
  const given = Buffer.from(token, "hex");
  if (expected.length !== given.length) return false;

  // Constant-time — a fast-fail compare would leak the digest a byte at a time.
  return timingSafeEqual(expected, given);
}

export function buildResumeUrl(conversationId: string, secret: string): string {
  const token = signResumeToken(conversationId, secret);
  return `${siteUrl()}/api/chat/resume?c=${encodeURIComponent(conversationId)}&token=${token}`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/chat/resumeToken.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/chat/resumeToken.ts lib/chat/resumeToken.test.ts
git commit -m "feat(chat): HMAC-signed resume links for offline customers"
```

---

## Task 8: Reply-email decision

Whether an agent's reply should be emailed is a pure decision over three facts: is the customer offline, have we emailed recently, and do we even have an address. Isolating it here keeps Task 20's route thin and lets the debounce boundary be tested without a mail server.

**Files:**
- Create: `lib/chat/replyEmail.ts`
- Test: `lib/chat/replyEmail.test.ts`

**Interfaces:**
- Consumes: `isVisitorOnline`, `PRESENCE_WINDOW_MS` (Task 3).
- Produces:
  - `REPLY_EMAIL_DEBOUNCE_MS = 120_000`
  - `shouldEmailReply(args: { customerEmail: string; customerLastSeenAt: number | null; lastEmailedAt: number | null; now: number }): boolean`

- [ ] **Step 1: Write the failing test**

Create `lib/chat/replyEmail.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shouldEmailReply, REPLY_EMAIL_DEBOUNCE_MS } from "./replyEmail";
import { PRESENCE_WINDOW_MS } from "./presence";

const NOW = 1_700_000_000_000;
const OFFLINE = NOW - PRESENCE_WINDOW_MS - 1;

const base = {
  customerEmail: "buyer@acme.com",
  customerLastSeenAt: OFFLINE,
  lastEmailedAt: null as number | null,
  now: NOW,
};

describe("shouldEmailReply", () => {
  it("emails when the customer is offline and we have not emailed yet", () => {
    expect(shouldEmailReply(base)).toBe(true);
  });

  it("does NOT email while the customer is still watching — they can see the reply", () => {
    expect(shouldEmailReply({ ...base, customerLastSeenAt: NOW - 1_000 })).toBe(false);
  });

  it("does not email inside the debounce window — consecutive replies collapse into one", () => {
    expect(
      shouldEmailReply({ ...base, lastEmailedAt: NOW - (REPLY_EMAIL_DEBOUNCE_MS - 1) })
    ).toBe(false);
  });

  it("emails again once the debounce window has elapsed", () => {
    expect(shouldEmailReply({ ...base, lastEmailedAt: NOW - REPLY_EMAIL_DEBOUNCE_MS })).toBe(true);
  });

  it("does not email when there is no address to email", () => {
    expect(shouldEmailReply({ ...base, customerEmail: "" })).toBe(false);
    expect(shouldEmailReply({ ...base, customerEmail: "   " })).toBe(false);
  });

  it("emails a customer who has never heart-beat at all", () => {
    expect(shouldEmailReply({ ...base, customerLastSeenAt: null })).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run lib/chat/replyEmail.test.ts`
Expected: FAIL — `Failed to resolve import "./replyEmail"`.

- [ ] **Step 3: Write `lib/chat/replyEmail.ts`**

```ts
import { isVisitorOnline } from "./presence";

/**
 * Should an agent reply be emailed to the customer? (spec §6.3)
 *
 * Only when they cannot see it: if their tab is still heart-beating, the reply
 * is already on their screen and an email would be noise.
 *
 * The debounce matters more than it looks. A salesperson types the way people
 * type — "Hi Rahul", "just checking", "the QB65 is ₹X" — and without it that is
 * three emails in ninety seconds. One per two minutes per conversation.
 */

export const REPLY_EMAIL_DEBOUNCE_MS = 2 * 60_000;

interface ReplyEmailState {
  customerEmail: string;
  customerLastSeenAt: number | null;
  /** `emailedAt` of the most recent emailed message in this conversation. */
  lastEmailedAt: number | null;
  now: number;
}

export function shouldEmailReply({
  customerEmail,
  customerLastSeenAt,
  lastEmailedAt,
  now,
}: ReplyEmailState): boolean {
  if (!customerEmail.trim()) return false;
  if (isVisitorOnline(customerLastSeenAt, now)) return false;
  if (lastEmailedAt !== null && now - lastEmailedAt < REPLY_EMAIL_DEBOUNCE_MS) return false;
  return true;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run lib/chat/replyEmail.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/chat/replyEmail.ts lib/chat/replyEmail.test.ts
git commit -m "feat(chat): offline + debounce decision for agent reply emails"
```

---

## Task 9: Firestore + Storage security rules

**This is the security boundary of the entire feature.** The customer widget runs in a hostile browser: every access check the UI makes is advisory, and only these rules actually stop a crafted request. Write them before any code that depends on them.

Rules tests need the Firebase emulator, which needs **Java**. To keep `npm test` runnable without a JDK, they get their own config and script (`npm run test:rules`) and are **excluded** from the default suite.

**Files:**
- Create: `firestore.rules`
- Create: `storage.rules`
- Create: `firestore.indexes.json`
- Create: `firebase.json`
- Create: `vitest.rules.config.mts`
- Create: `tests/rules/firestore.rules.test.ts`
- Create: `tests/rules/storage.rules.test.ts`
- Modify: `package.json` (scripts)
- Modify: `vitest.config.mts` (exclude `tests/rules`)

**Interfaces:**
- Consumes: the collection names and message shape from Task 2; the MIME/size limits from Task 4.
- Produces: the deployed rule set every later task relies on. No TypeScript exports.

- [ ] **Step 1: Install the emulator test harness**

```bash
npm install -D @firebase/rules-unit-testing@^5 firebase-tools@^14
```

- [ ] **Step 2: Write `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "auth": { "port": 9099 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
```

- [ ] **Step 3: Write `firestore.indexes.json`** (spec §2)

```json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "visitors",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "lastSeenAt", "order": "DESCENDING" }]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 4: Write the failing Firestore rules test**

Create `tests/rules/firestore.rules.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from "firebase/firestore";

let env: RulesTestEnvironment;

const CUSTOMER = "cust_uid_1";
const OTHER_CUSTOMER = "cust_uid_2";
const CONV = "conv_1";

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "aplus-chat-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  // Seed a conversation owned by CUSTOMER, bypassing rules.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "conversations", CONV), {
      visitorId: CUSTOMER,
      ownerUid: CUSTOMER,
      customer: { name: "Rahul", email: "r@acme.com", phone: "+919310509909" },
      startedBy: "customer",
      page: "/products/samsung-qet-series",
      status: "open",
      needsFollowUp: false,
      lastMessageAt: Date.now(),
      lastPreview: "hi",
      lastSender: "customer",
      unreadForAgent: 1,
    });
    await setDoc(doc(db, "status", "team"), { onlineUntil: Date.now() + 90_000 });
    await setDoc(doc(db, "agentDevices", "tok_1"), { token: "tok_1", agentUid: "agent_1" });
  });
});

const asCustomer = () => env.authenticatedContext(CUSTOMER).firestore();
const asOtherCustomer = () => env.authenticatedContext(OTHER_CUSTOMER).firestore();
const asAgent = () => env.authenticatedContext("agent_1", { agent: true }).firestore();
const asAnon = () => env.unauthenticatedContext().firestore();

describe("conversations", () => {
  it("lets the owner read their own conversation", async () => {
    await assertSucceeds(getDoc(doc(asCustomer(), "conversations", CONV)));
  });

  it("BLOCKS another customer from reading it", async () => {
    await assertFails(getDoc(doc(asOtherCustomer(), "conversations", CONV)));
  });

  it("blocks a signed-out visitor entirely", async () => {
    await assertFails(getDoc(doc(asAnon(), "conversations", CONV)));
  });

  it("lets an agent read any conversation", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "conversations", CONV)));
  });

  it("blocks a customer from creating a conversation owned by someone else", async () => {
    await assertFails(
      setDoc(doc(asCustomer(), "conversations", "conv_forged"), {
        ownerUid: OTHER_CUSTOMER,
        visitorId: OTHER_CUSTOMER,
        status: "open",
      })
    );
  });

  it("blocks a customer from clearing their own needsFollowUp flag", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "conversations", CONV), { needsFollowUp: true });
    });
    await assertFails(updateDoc(doc(asCustomer(), "conversations", CONV), { needsFollowUp: false }));
    await assertSucceeds(updateDoc(doc(asAgent(), "conversations", CONV), { needsFollowUp: false }));
  });

  it("blocks a customer from reassigning ownerUid", async () => {
    await assertFails(updateDoc(doc(asCustomer(), "conversations", CONV), { ownerUid: OTHER_CUSTOMER }));
  });
});

describe("messages", () => {
  const msgs = (db: ReturnType<typeof asCustomer>) =>
    collection(db, "conversations", CONV, "messages");

  it("lets the owner send a customer message", async () => {
    await assertSucceeds(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "Need pricing", createdAt: Date.now() })
    );
  });

  it("BLOCKS a customer from forging an agent message", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), { sender: "agent", text: "Sure, ₹1", createdAt: Date.now() })
    );
  });

  it("BLOCKS a customer from attaching a file — agent-only upload surface", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), {
        sender: "customer",
        text: "",
        createdAt: Date.now(),
        attachment: { url: "https://evil/x.pdf", name: "x.pdf", mime: "application/pdf", size: 1 },
      })
    );
  });

  it("blocks a customer from posting an over-long message", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "x".repeat(2001), createdAt: Date.now() })
    );
  });

  it("accepts a message exactly at the 2000-char cap", async () => {
    await assertSucceeds(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "x".repeat(2000), createdAt: Date.now() })
    );
  });

  it("BLOCKS another customer from reading the thread", async () => {
    await assertFails(getDoc(doc(asOtherCustomer(), "conversations", CONV, "messages", "any")));
  });

  it("lets an agent send an agent message with an attachment", async () => {
    await assertSucceeds(
      addDoc(msgs(asAgent()), {
        sender: "agent",
        text: "Spec sheet attached",
        createdAt: Date.now(),
        attachment: { url: "https://x/a.pdf", name: "a.pdf", mime: "application/pdf", size: 100 },
      })
    );
  });
});

describe("visitors", () => {
  it("lets a visitor write only their own doc", async () => {
    await assertSucceeds(
      setDoc(doc(asCustomer(), "visitors", CUSTOMER), { lastSeenAt: Date.now(), currentPage: "/" })
    );
  });

  it("BLOCKS a visitor from writing another visitor's doc", async () => {
    await assertFails(
      setDoc(doc(asCustomer(), "visitors", OTHER_CUSTOMER), { lastSeenAt: Date.now() })
    );
  });

  it("BLOCKS a visitor from reading another visitor's doc", async () => {
    await assertFails(getDoc(doc(asCustomer(), "visitors", OTHER_CUSTOMER)));
  });

  it("lets an agent read any visitor", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "visitors", CUSTOMER)));
  });
});

describe("status/team", () => {
  it("is public-read — the widget shows presence before sign-in", async () => {
    await assertSucceeds(getDoc(doc(asAnon(), "status", "team")));
  });

  it("is NOT public-write — a visitor cannot fake the team being online", async () => {
    await assertFails(setDoc(doc(asCustomer(), "status", "team"), { onlineUntil: Date.now() }));
  });

  it("lets an agent heartbeat it", async () => {
    await assertSucceeds(setDoc(doc(asAgent(), "status", "team"), { onlineUntil: Date.now() + 90_000 }));
  });
});

describe("agentDevices", () => {
  it("BLOCKS a customer from reading push tokens", async () => {
    await assertFails(getDoc(doc(asCustomer(), "agentDevices", "tok_1")));
  });

  it("lets an agent read and write them", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "agentDevices", "tok_1")));
  });
});
```

- [ ] **Step 5: Write the failing Storage rules test**

Create `tests/rules/storage.rules.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

let env: RulesTestEnvironment;

const CUSTOMER = "cust_uid_1";
const OTHER_CUSTOMER = "cust_uid_2";
const CONV = "conv_1";
const PATH = `chat-attachments/${CONV}/msg_1/spec.pdf`;

const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
const big = new Uint8Array(10 * 1024 * 1024 + 1);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "aplus-chat-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
    storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });

  // Storage rules cross-read the conversation to authorise the owner, so the
  // Firestore doc must exist for the read tests to mean anything.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "conversations", CONV), { ownerUid: CUSTOMER });
  });
});

afterAll(async () => env.cleanup());

const asCustomer = () => env.authenticatedContext(CUSTOMER).storage();
const asOtherCustomer = () => env.authenticatedContext(OTHER_CUSTOMER).storage();
const asAgent = () => env.authenticatedContext("agent_1", { agent: true }).storage();

describe("storage: writes", () => {
  it("lets an agent upload an allowed type", async () => {
    await assertSucceeds(
      uploadBytes(ref(asAgent(), PATH), pdf, { contentType: "application/pdf" })
    );
  });

  it("BLOCKS a customer from uploading at all — no anonymous write surface", async () => {
    await assertFails(
      uploadBytes(ref(asCustomer(), PATH), pdf, { contentType: "application/pdf" })
    );
  });

  it("rejects a file over 10 MB even from an agent", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_2/big.pdf`), big, {
        contentType: "application/pdf",
      })
    );
  });

  it("rejects a disallowed content type — zip", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_3/x.zip`), pdf, {
        contentType: "application/zip",
      })
    );
  });

  it("rejects SVG — deny-by-default keeps the script vector out", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_4/x.svg`), pdf, {
        contentType: "image/svg+xml",
      })
    );
  });

  it("rejects an upload outside the chat-attachments prefix", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), "elsewhere/x.pdf"), pdf, { contentType: "application/pdf" })
    );
  });
});

describe("storage: reads", () => {
  it("lets the conversation's owner open what was sent to them", async () => {
    await assertSucceeds(getDownloadURL(ref(asCustomer(), PATH)));
  });

  it("BLOCKS an unrelated visitor from reading the attachment", async () => {
    await assertFails(getDownloadURL(ref(asOtherCustomer(), PATH)));
  });

  it("lets an agent read it", async () => {
    await assertSucceeds(getDownloadURL(ref(asAgent(), PATH)));
  });
});
```

- [ ] **Step 6: Add the rules-test config and scripts**

Create `vitest.rules.config.mts`:

```ts
import { defineConfig } from "vitest/config";

// Rules tests talk to the Firebase emulators (which need Java), so they are
// kept OUT of the default `npm test` run and driven by `npm run test:rules`,
// which starts the emulators first. Sequential: they share one emulator.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
```

Edit `vitest.config.mts` — exclude the rules tests from the default run:

```ts
import { defineConfig } from "vitest/config";

// `resolve.tsconfigPaths` makes Vitest honor the `@/*` alias from tsconfig.json
// so tests import project modules the same way the app does.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["**/*.test.{ts,tsx}"],
    // Firebase rules tests need the emulator (and a JDK). They run separately
    // via `npm run test:rules` so the default suite stays dependency-free.
    exclude: ["**/node_modules/**", "tests/rules/**"],
    environment: "node",
  },
});
```

Add to `package.json` `scripts`:

```json
"test:rules": "firebase emulators:exec --only firestore,storage,auth \"vitest run --config vitest.rules.config.mts\""
```

- [ ] **Step 7: Run the rules tests to verify they fail**

Run: `npm run test:rules`
Expected: FAIL — `firestore.rules` and `storage.rules` do not exist yet (`Error: Cannot find module` / emulator reports a missing rules file).

> Needs Java on PATH. If `java -version` fails, install a JDK (Temurin 17+) first. `npm test` does **not** need it.

- [ ] **Step 8: Write `firestore.rules`**

```
rules_version = '2';

// Live chat security model (spec §9).
//
// The customer widget runs in a hostile browser: every check the UI makes is
// advisory. THIS FILE is the only thing that actually stops a crafted request,
// so it is written deny-by-default and each allow is justified.
//
// Two principals:
//   agent    — request.auth.token.agent == true (set by scripts/set-agent-claim.mjs)
//   customer — an anonymous uid that owns exactly one conversation + one visitor doc
service cloud.firestore {
  match /databases/{database}/documents {

    function isAgent() {
      return request.auth != null && request.auth.token.agent == true;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    // Public presence (spec §5). Read-only to the world so the widget can show
    // "team is away" BEFORE the visitor signs in. It leaks no uids — one field.
    match /status/team {
      allow read: if true;
      allow write: if isAgent();
    }

    // A visitor may touch only their OWN doc, keyed by their anonymous uid.
    // (Phase 3 adds journey/geo here; the server writes geo via the Admin SDK,
    // which bypasses rules, so no client-write allowance is needed for it.)
    match /visitors/{visitorId} {
      allow read:          if isAgent() || (isSignedIn() && request.auth.uid == visitorId);
      allow create, update: if isAgent() || (isSignedIn() && request.auth.uid == visitorId);
      allow delete:        if isAgent();
    }

    match /conversations/{conversationId} {
      function owned() {
        return isSignedIn() && resource.data.ownerUid == request.auth.uid;
      }

      allow read: if isAgent() || owned();

      // A customer may open a conversation only in their own name. Forging
      // ownerUid would otherwise let them read a thread they do not own.
      allow create: if isAgent() || (
        isSignedIn()
        && request.resource.data.ownerUid == request.auth.uid
        && request.resource.data.status == 'open'
      );

      // A customer may update their own conversation, but may NOT reassign it
      // or clear the follow-up flag — that flag is the safety net (spec §6) and
      // is cleared only by an agent reply or the Admin SDK.
      allow update: if isAgent() || (
        owned()
        && request.resource.data.ownerUid == resource.data.ownerUid
        && request.resource.data.visitorId == resource.data.visitorId
        && request.resource.data.needsFollowUp == resource.data.needsFollowUp
      );

      allow delete: if isAgent();

      match /messages/{messageId} {
        function conv() {
          return get(/databases/$(database)/documents/conversations/$(conversationId)).data;
        }
        function ownsThread() {
          return isSignedIn() && conv().ownerUid == request.auth.uid;
        }

        allow read: if isAgent() || ownsThread();

        // The load-bearing rule. A customer may write only as themselves (or as
        // the system, for the §6.1 timeout notice), is length-capped, and may
        // NOT carry an attachment — customer upload is deliberately not a thing
        // in Phase 1 (spec §14), so the field is refused outright.
        allow create: if isAgent()
          ? request.resource.data.sender in ['agent', 'system']
          : (
              ownsThread()
              && request.resource.data.sender in ['customer', 'system']
              && request.resource.data.text is string
              && request.resource.data.text.size() <= 2000
              && !('attachment' in request.resource.data)
            );

        // Messages are an append-only log. Only an agent may amend one (the
        // reply-email route stamps emailedAt via the Admin SDK anyway).
        allow update, delete: if isAgent();
      }
    }

    // Push targets (Phase 2). A customer must never enumerate them.
    match /agentDevices/{token} {
      allow read, write: if isAgent();
    }
  }
}
```

- [ ] **Step 9: Write `storage.rules`**

```
rules_version = '2';

// Attachment storage (spec §4.1, §9).
//
// This is the ONLY inbound file path in the product, so it is the malware
// surface. Deny by default; the size cap and the MIME allow-list live HERE, not
// only in the UI — lib/chat/attachments.ts is a kindness, this is the control.
// Keep the list in exact sync with ALLOWED_ATTACHMENT_MIME.
service firebase.storage {
  match /b/{bucket}/o {

    match /chat-attachments/{conversationId}/{allPaths=**} {

      // The customer who owns the conversation may open what was sent to them;
      // any agent may read. Cross-read into Firestore for the ownership check.
      allow read: if request.auth != null && (
        request.auth.token.agent == true
        || firestore.get(/databases/(default)/documents/conversations/$(conversationId)).data.ownerUid == request.auth.uid
      );

      // AGENT-ONLY WRITE. An anonymous visitor cannot upload at all (spec §14):
      // that would be an unauthenticated write surface with no scanning story.
      allow write: if request.auth != null
        && request.auth.token.agent == true
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType in [
             'application/pdf', 'image/png', 'image/jpeg', 'image/webp'
           ];
    }

    // Everything outside chat-attachments/ is closed.
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 10: Run the rules tests to verify they pass**

Run: `npm run test:rules`
Expected: PASS — 21 Firestore + 9 Storage assertions. Every `BLOCKS`-named test must be green; a red one there is a real hole, not a flaky test.

- [ ] **Step 11: Deploy the rules and indexes to the live project**

```bash
npx firebase login
npx firebase use --add            # select the Firebase project, alias it "default"
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

Then in the Firebase console: **Firestore → TTL** → add a policy on collection `visitors`, field `expiresAt`… — *not applicable in Phase 1.* The 90-day TTL (spec §9) applies to the journey/geo data added in **Phase 3**; Phase 1's `visitors` doc holds only presence. Note it in the Phase 3 plan; do not configure it now.

- [ ] **Step 12: Commit**

```bash
npm test
git add firestore.rules storage.rules firestore.indexes.json firebase.json vitest.config.mts vitest.rules.config.mts tests/rules package.json package-lock.json
git commit -m "feat(chat): firestore + storage security rules with emulator tests"
```

---

## Task 10: Agent claim script

An agent is anyone whose ID token carries `agent: true`. Only the Admin SDK can set that, so it is a one-time script, not a UI. Without it, the console login succeeds but every read is refused by the rules — which is exactly the behaviour we want for a stranger who finds `/admin/chat`.

**Files:**
- Create: `scripts/set-agent-claim.mjs`

**Interfaces:**
- Consumes: `FIREBASE_ADMIN_*` env (Task 1).
- Produces: nothing importable — an operator tool.

- [ ] **Step 1: Write the script**

```js
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
```

- [ ] **Step 2: Create the agent account and grant the claim**

In Firebase console → **Authentication** → **Sign-in method**, enable **Anonymous** *and* **Email/Password**. Then **Users → Add user** for the salesperson, and:

Run: `node scripts/set-agent-claim.mjs sales@aplustechsol.com`
Expected: `Granted agent:true to sales@aplustechsol.com (<uid>). They must sign out and back in.`

- [ ] **Step 3: Commit**

```bash
git add scripts/set-agent-claim.mjs
git commit -m "feat(chat): admin script to grant the agent:true claim"
```

---

## Task 11: CSP — allow the Firebase hosts

The site ships a strict CSP ([next.config.ts:28](../../../next.config.ts#L28)). Firebase will be silently blocked by it until these hosts are allowed — and the failure looks like "chat just doesn't work", with the real cause only in the console. Do this **before** writing the widget, not after debugging it.

**Files:**
- Modify: `next.config.ts`

**Interfaces:** none.

- [ ] **Step 1: Extend `connect-src` and `img-src`** (spec §9)

In [next.config.ts](../../../next.config.ts), replace the `connect-src` and `img-src` lines inside the CSP array:

```ts
      // Firebase: Firestore streams over *.googleapis.com; auth uses
      // identitytoolkit + securetoken; Storage serves attachments. FCM is
      // listed now so Phase 2 does not need a CSP change of its own.
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://www.aplustechsol.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://firebasestorage.googleapis.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://us.i.posthog.com https://us-assets.i.posthog.com https://*.googleapis.com https://firestore.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://*.gstatic.com",
```

> `script-src https://www.gstatic.com` (spec §9) is needed only by the FCM service worker's `importScripts`. It is **not** added here — Phase 2 adds it alongside the worker, so Phase 1 does not widen `script-src` for code that does not exist yet.

- [ ] **Step 2: Verify the header is emitted**

```bash
npm run build && npm start
```

In a second terminal:

```bash
curl -sI http://localhost:3000/ | grep -i content-security-policy
```

Expected: the `connect-src` directive now contains `https://firestore.googleapis.com` and `img-src` contains `https://firebasestorage.googleapis.com`.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore(csp): allow firebase auth/firestore/storage hosts"
```

---

## Task 12: `ChatContext` — one panel, two openers

The desktop launcher and the mobile sticky bar are separate components in separate places in the tree, and **both must open the same panel** (spec §3.1). The project already solves exactly this shape with [context/ComparisonContext.tsx](../../../context/ComparisonContext.tsx) — follow it.

**Files:**
- Create: `context/ChatContext.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `<ChatProvider>{children}</ChatProvider>`
  - `useChat(): { isOpen: boolean; view: ChatView; openChat(view?: ChatView): void; closeChat(): void; toggleChat(): void; unread: number; setUnread(n: number): void }`
  - `type ChatView = "home" | "live" | "whatsapp"` — `"home"` is the presence-aware fork of spec §3.1.

- [ ] **Step 1: Write `context/ChatContext.tsx`**

```tsx
"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Panel state for the chat widget.
 *
 * It lives in context because TWO components open the same panel: the desktop
 * launcher (components/chat/ChatLauncher.tsx) and the mobile sticky bar's Chat
 * button (components/MobileStickyCTA.tsx). Spec §3.1 is explicit that there is
 * exactly ONE door — duplicating the panel per opener is the bug we are fixing.
 */

/** "home" = the presence-aware fork (Chat now / Leave a message + WhatsApp). */
export type ChatView = "home" | "live" | "whatsapp";

interface ChatContextValue {
  isOpen: boolean;
  view: ChatView;
  openChat: (view?: ChatView) => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Unread agent replies, shown on the launcher when the panel is closed. */
  unread: number;
  setUnread: (n: number) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("home");
  const [unread, setUnread] = useState(0);

  const openChat = useCallback((next: ChatView = "home") => {
    setView(next);
    setUnread(0);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      setView("home");
      setUnread(0);
      return true;
    });
  }, []);

  const value = useMemo(
    () => ({ isOpen, view, openChat, closeChat, toggleChat, unread, setUnread }),
    [isOpen, view, openChat, closeChat, toggleChat, unread]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
```

- [ ] **Step 2: Mount the provider in `app/layout.tsx`**

Add the import beside the existing context imports and wrap `ChatProvider` **inside** `ComparisonProvider`, so it encloses both `{children}` (for any in-page "chat with us" links later) and `<ClientFloats />`:

```tsx
import { ChatProvider } from "@/context/ChatContext";
```

```tsx
        <PostHogProvider>
          <QuoteProvider>
            <ComparisonProvider>
              <ChatProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main id="main-content" className="flex-1 bg-white">
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <Footer />
                </div>
                <ClientFloats />
              </ChatProvider>
            </ComparisonProvider>
          </QuoteProvider>
        </PostHogProvider>
```

- [ ] **Step 3: Verify the app still builds**

Run: `npm run build`
Expected: success. (No visible change yet — nothing consumes the context.)

- [ ] **Step 4: Commit**

```bash
git add context/ChatContext.tsx app/layout.tsx
git commit -m "feat(chat): ChatProvider — shared panel state for the single launcher"
```

---

## Task 13: Customer-side Firestore hooks

Three hooks, one file each. They own **all** the Firebase calls the customer makes; the components in Tasks 14–18 stay presentational. Not unit-tested (see Global Constraints) — verified at runtime in Task 27.

**Files:**
- Create: `lib/chat/useTeamPresence.ts`
- Create: `lib/chat/useVisitorHeartbeat.ts`
- Create: `lib/chat/useConversation.ts`

**Interfaces:**
- Consumes: `getAuthClient`, `getDb` (Task 1); `COL`, `TEAM_STATUS_DOC`, `toMillis`, `ChatMessage`, `ChatCustomer`, `Conversation` (Task 2); `isTeamOnline`, `HEARTBEAT_INTERVAL_MS`, `PRESENCE_WINDOW_MS` (Task 3); `shouldEscalate`, `UNANSWERED_TIMEOUT_MS` (Task 3); `buildPreview` (Task 2); `isFirebaseConfigured` (Task 1).
- Produces:
  - `useTeamPresence(): { teamOnline: boolean }`
  - `useVisitorHeartbeat(chatOpen: boolean): void`
  - `useConversation(): { ready: boolean; conversationId: string | null; messages: ChatMessage[]; conversation: Conversation | null; error: string | null; startConversation(input: { customer: ChatCustomer; message: string; page: string }): Promise<void>; sendMessage(text: string): Promise<void>; }`

- [ ] **Step 1: Write `lib/chat/useTeamPresence.ts`**

```ts
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
```

- [ ] **Step 2: Write `lib/chat/useVisitorHeartbeat.ts`**

```ts
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
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
  const state = useRef({ pathname, chatOpen });
  state.current = { pathname, chatOpen };

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const unsubscribe = onAuthStateChanged(getAuthClient(), (user) => {
      // No session ⇒ this visitor has never opened the chat. Stay silent.
      if (!user || cancelled) return;

      const visitorRef = doc(getDb(), COL.visitors, user.uid);

      const beat = () => {
        if (document.visibilityState !== "visible") return;
        void setDoc(
          visitorRef,
          {
            lastSeenAt: serverTimestamp(),
            currentPage: state.current.pathname,
            chatOpen: state.current.chatOpen,
            firstSeenAt: serverTimestamp(),
          },
          // merge:true so firstSeenAt is written once and then... also on every
          // beat. Guard it: only set firstSeenAt when creating.
          { merge: true }
        );
      };

      beat();
      timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
      document.addEventListener("visibilitychange", beat);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", () => {});
    };
  }, []);
}
```

> **Implementer note — fix the two flaws left in the sketch above.** (a) `firstSeenAt` must not be rewritten on every beat. (b) the `visibilitychange` listener is removed with a *different* function reference, so it never detaches. Write it correctly:

```ts
export function useVisitorHeartbeat(chatOpen: boolean): void {
  const pathname = usePathname();
  const state = useRef({ pathname, chatOpen });
  state.current = { pathname, chatOpen };

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let onVisibility: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(getAuthClient(), (user) => {
      if (!user || cancelled || timer) return;

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
        // only. merge:true would otherwise overwrite it 40 times an hour.
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
      if (timer) clearInterval(timer);
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
```

Use the second version. (`firstSeenAt` is technically re-stamped once per page load rather than truly once per visitor — Phase 3, which actually reads it, tightens this to a `create`-only write. Note it and move on.)

- [ ] **Step 3: Write `lib/chat/useConversation.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { trackEvent } from "@/lib/analytics";
import { setCachedLead } from "@/lib/leadGate";
import { COL, toMillis, type ChatCustomer, type ChatMessage, type Conversation } from "./types";
import { buildPreview } from "./messages";
import { shouldEscalate, UNANSWERED_TIMEOUT_MS } from "./escalation";

const TIMEOUT_NOTICE =
  "Sorry — our team is tied up. We have your details and will reply on WhatsApp/email shortly.";

interface StartInput {
  customer: ChatCustomer;
  message: string;
  page: string;
}

/**
 * The customer's whole side of the chat (spec §3.2).
 *
 * Signs in anonymously (the uid IS the visitor id and the conversation's
 * ownerUid — never the IP, spec §7), resumes the visitor's existing open thread
 * across pages and visits, streams messages, and runs the 3-minute unanswered
 * timer.
 *
 * Ordering note on startConversation: the durable capture (/api/contact → Resend
 * email + Zoho lead) is fired even if the Firestore write fails. The whole point
 * of §6 is that the LEAD EXISTS BEFORE ANYONE REPLIES — a Firebase outage must
 * cost us the live chat, not the customer.
 */
export function useConversation() {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── anonymous identity ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Chat is unavailable right now.");
      setReady(true);
      return;
    }
    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setReady(true);
    });
    // Anonymous sign-in is idempotent — an existing session is reused, which is
    // what lets a returning visitor land back in their own thread.
    if (!auth.currentUser) {
      void signInAnonymously(auth).catch(() => {
        setError("Chat is unavailable right now.");
        setReady(true);
      });
    }
    return unsubscribe;
  }, []);

  // ── find this visitor's open conversation ─────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(getDb(), COL.conversations),
      where("ownerUid", "==", uid),
      where("status", "==", "open"),
      orderBy("lastMessageAt", "desc"),
      limit(1)
    );
    return onSnapshot(
      q,
      (snap) => {
        const first = snap.docs[0];
        if (!first) {
          setConversationId(null);
          setConversation(null);
          return;
        }
        const data = first.data();
        setConversationId(first.id);
        setConversation({
          id: first.id,
          visitorId: data.visitorId,
          ownerUid: data.ownerUid,
          customer: data.customer,
          startedBy: data.startedBy,
          page: data.page,
          status: data.status,
          needsFollowUp: Boolean(data.needsFollowUp),
          createdAt: toMillis(data.createdAt),
          lastMessageAt: toMillis(data.lastMessageAt),
          lastPreview: data.lastPreview ?? "",
          lastSender: data.lastSender ?? "customer",
          unreadForAgent: data.unreadForAgent ?? 0,
        });
      },
      () => setError("Chat is unavailable right now.")
    );
  }, [uid]);

  // ── stream the thread ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(getDb(), COL.conversations, conversationId, COL.messages),
      orderBy("createdAt", "asc"),
      limit(200)
    );
    return onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sender: data.sender,
              text: data.text ?? "",
              createdAt: toMillis(data.createdAt),
              emailedAt: data.emailedAt ? toMillis(data.emailedAt) : undefined,
              attachment: data.attachment,
              link: data.link,
            };
          })
        );
      },
      () => setError("We lost the connection. Try WhatsApp or call us.")
    );
  }, [conversationId]);

  // ── the 3-minute unanswered timer (spec §6.1) ─────────────────────────────
  // Runs in the WAITING CUSTOMER'S OWN BROWSER, which is exactly why the safety
  // net fires when no console is open anywhere: no cron, no paid plan.
  const escalating = useRef(false);
  useEffect(() => {
    if (!conversationId || !conversation) return;

    const lastCustomerMessageAt =
      [...messages].reverse().find((m) => m.sender === "customer")?.createdAt ?? null;
    const lastAgentMessageAt =
      [...messages].reverse().find((m) => m.sender === "agent")?.createdAt ?? null;

    const check = async () => {
      const due = shouldEscalate({
        lastCustomerMessageAt,
        lastAgentMessageAt,
        needsFollowUp: conversation.needsFollowUp,
        now: Date.now(),
      });
      if (!due || escalating.current) return;
      escalating.current = true;

      const db = getDb();
      // The apology lands in the thread even if the route below fails.
      await addDoc(collection(db, COL.conversations, conversationId, COL.messages), {
        sender: "system",
        text: TIMEOUT_NOTICE,
        createdAt: serverTimestamp(),
      }).catch(() => {});

      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {
        // Non-fatal (spec §11): the message is stored, and the chat-start email
        // + Zoho lead already landed. The flag is a convenience, not the record.
      });

      trackEvent("chat_unanswered", { conversationId });
    };

    void check();
    const id = setInterval(check, 20_000);
    return () => clearInterval(id);
  }, [conversationId, conversation, messages]);

  // ── actions ───────────────────────────────────────────────────────────────

  const startConversation = useCallback(
    async ({ customer, message, page }: StartInput) => {
      if (!uid) throw new Error("not-ready");
      const db = getDb();
      const preview = buildPreview({ text: message });

      const convRef = await addDoc(collection(db, COL.conversations), {
        visitorId: uid,
        ownerUid: uid,
        customer,
        startedBy: "customer",
        page,
        status: "open",
        needsFollowUp: false,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastPreview: preview,
        lastSender: "customer",
        unreadForAgent: 1,
      });

      await addDoc(collection(db, COL.conversations, convRef.id, COL.messages), {
        sender: "customer",
        text: message,
        createdAt: serverTimestamp(),
      });

      // The durable backup — email + Zoho lead — fires regardless of what the
      // live chat does next (spec §6.1: "the lead exists before anyone replies").
      void fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          message,
          company_website: "",
          inquiry_type: "Website Live Chat",
          subject: "New Website Live Chat",
          from_name: "Aplus Website Live Chat",
        }),
      }).catch(() => {});

      setCachedLead({ name: customer.name, email: customer.email, phone: customer.phone });
      trackEvent("chat_started", { page });
      setConversationId(convRef.id);
    },
    [uid]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) throw new Error("no-conversation");
      const db = getDb();

      await addDoc(collection(db, COL.conversations, conversationId, COL.messages), {
        sender: "customer",
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, COL.conversations, conversationId), {
        lastMessageAt: serverTimestamp(),
        lastPreview: buildPreview({ text }),
        lastSender: "customer",
        unreadForAgent: increment(1),
      });

      // A fresh customer message re-arms the timer.
      escalating.current = false;
      trackEvent("chat_message_sent", { conversationId });
    },
    [conversationId]
  );

  return { ready, conversationId, conversation, messages, error, startConversation, sendMessage };
}
```

> Two things the implementer must not "tidy away":
> - `unreadForAgent: increment(1)` on a customer send, and the fact that the **rules forbid** the customer changing `needsFollowUp` — the update above never touches it, which is why it passes.
> - `UNANSWERED_TIMEOUT_MS` is imported but only used via `shouldEscalate`. Drop the unused import rather than inlining the constant.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (The API route `/api/chat/escalate` does not exist yet — that is fine, `fetch` is untyped against routes.)

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/chat/useTeamPresence.ts lib/chat/useVisitorHeartbeat.ts lib/chat/useConversation.ts
git commit -m "feat(chat): customer-side firestore hooks — presence, heartbeat, conversation"
```

---

## Task 14: `WhatsAppPanel` — lift the existing WhatsApp path out, unchanged

The spec is emphatic (§"What is already safe"): the WhatsApp content is **preserved verbatim** — Web link, scan-to-continue QR, quick-inquiry chips, phone/email fallbacks. §3.1 moves it from a tab into a labelled secondary path; it does not redesign it. So this task is a **pure extraction**: copy the JSX out of `ChatWidget`, change nothing inside it.

**Files:**
- Create: `components/chat/WhatsAppPanel.tsx`

**Interfaces:**
- Consumes: `getWhatsAppMessage`, `buildWhatsAppUrl`, `buildWhatsAppWebUrl` (existing `lib/whatsapp.ts`); `PHONE_DISPLAY`, `PHONE_TEL` (existing `lib/contact.ts`); `trackEvent`.
- Produces: `export default function WhatsAppPanel(): JSX.Element`; `export const WA_PATH: string` (the brand-mark SVG path, re-exported so `ChatPanel` and `MobileStickyCTA` stop duplicating it).

- [ ] **Step 1: Create the file**

Copy, from the current [components/ChatWidget.tsx](../../../components/ChatWidget.tsx):
- the `WA_PATH` constant (line 39–40) — now **exported**;
- the `QUICK_ACTIONS` constant (lines 26–30);
- the `openWhatsApp` handler (lines 77–82);
- the entire `{tab === "whatsapp" && ( … )}` block (lines 237–298) as the component body.

```tsx
"use client";

import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Phone, Mail, ChevronRight, Smartphone } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getWhatsAppMessage, buildWhatsAppUrl, buildWhatsAppWebUrl } from "@/lib/whatsapp";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

/**
 * The WhatsApp path — "continue on your phone" (spec §3.1).
 *
 * Lifted VERBATIM out of the old ChatWidget: Web link, scan-to-continue QR,
 * quick-inquiry chips, phone/email fallbacks. The spec preserves this content
 * exactly and only changes where it sits (a labelled secondary path instead of
 * a tab). Do not redesign it here — the wa.me / Web-link logic is untouched.
 */

/** WhatsApp brand mark. Exported so the launcher and sticky bar share one copy. */
export const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const QUICK_ACTIONS = [
  { label: "Get a product quote", msg: "Hi, I need a quote for Samsung display products." },
  { label: "Video wall inquiry", msg: "Hi, I'd like to know more about Samsung video wall solutions." },
  { label: "Hotel TV solutions", msg: "Hi, I'm looking for Samsung hotel TV solutions for my property." },
];

export default function WhatsAppPanel() {
  const pathname = usePathname();
  const waLink = buildWhatsAppUrl(getWhatsAppMessage(pathname)); // wa.me — the QR payload opens the phone's app

  const openWhatsApp = (msg?: string) => {
    const text = msg ?? getWhatsAppMessage(pathname);
    trackEvent("whatsapp_click", { source: "chat_widget", page: pathname });
    // Desktop: WhatsApp Web skips the wa.me "Continue to Chat" interstitial,
    // which looks broken to visitors without the desktop app.
    window.open(buildWhatsAppWebUrl(text), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <p className="text-gray-500 text-xs text-center">Connect with our sales team on WhatsApp</p>

      <button
        onClick={() => openWhatsApp()}
        className="w-full flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-md shadow-green-500/20"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
          <path d={WA_PATH} />
        </svg>
        <span className="flex-1 text-left text-sm">Open WhatsApp Web</span>
        <ChevronRight size={16} />
      </button>

      {/* QR — scan to continue on phone (solves the no-app-on-desktop case) */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-white p-1.5 border border-gray-100">
          <QRCodeSVG value={waLink} size={72} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-1.5">
            <Smartphone size={13} className="text-blue-500" /> No WhatsApp on this computer?
          </p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
            Scan with your phone&apos;s camera to open this chat in WhatsApp on your mobile.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick inquiries</p>
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => openWhatsApp(a.msg)}
            className="w-full text-left text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 px-4 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2"
          >
            {a.label}
            <ChevronRight size={14} className="shrink-0 text-gray-400" />
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Other ways to reach us</p>
        <a href={PHONE_TEL} className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
          <Phone size={15} className="text-blue-500 shrink-0" />
          {PHONE_DISPLAY}
        </a>
        <a href="mailto:info@aplustechsol.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
          <Mail size={15} className="text-blue-500 shrink-0" />
          info@aplustechsol.com
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors. (`ChatWidget` still exists and still renders; nothing is wired to this yet.)

```bash
git add components/chat/WhatsAppPanel.tsx
git commit -m "refactor(chat): lift the WhatsApp path out of ChatWidget, unchanged"
```

---

## Task 15: `MessageAttachment` — shared renderer

One renderer, used by **both** the customer thread and the console thread (spec §4.1). Images inline; PDFs and links as cards.

**Files:**
- Create: `components/chat/MessageAttachment.tsx`

**Interfaces:**
- Consumes: `ChatAttachment`, `ChatLink` (Task 2); `isImageMime`, `formatBytes` (Task 4).
- Produces: `export default function MessageAttachment({ attachment, link }: { attachment?: ChatAttachment; link?: ChatLink }): JSX.Element | null`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { FileText, ExternalLink, Download } from "lucide-react";
import type { ChatAttachment, ChatLink } from "@/lib/chat/types";
import { isImageMime, formatBytes } from "@/lib/chat/attachments";

/**
 * Renders the non-text payload of a message (spec §4.1). Shared by the customer
 * widget and the sales console so a spec sheet looks the same on both sides.
 *
 * Images render inline; PDFs and quick-send links render as cards. The MIME
 * check is isImageMime(), NOT `mime.startsWith("image/")` — SVG would pass that
 * and is excluded on purpose.
 *
 * A plain <img> is used rather than next/image: Storage URLs are signed, remote,
 * and one-off, so the optimizer would add a round-trip and a remotePatterns
 * entry for no benefit.
 */
export default function MessageAttachment({
  attachment,
  link,
}: {
  attachment?: ChatAttachment;
  link?: ChatLink;
}) {
  if (!attachment && !link) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachment &&
        (isImageMime(attachment.mime) ? (
          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-64 rounded-xl border border-black/10 object-contain bg-white"
            />
          </a>
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            download={attachment.name}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500">
              <FileText size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-gray-800 truncate">
                {attachment.name}
              </span>
              <span className="block text-[11px] text-gray-400">{formatBytes(attachment.size)}</span>
            </span>
            <Download size={15} className="shrink-0 text-gray-400" />
          </a>
        ))}

      {link && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2.5 hover:bg-blue-50 transition-colors"
        >
          <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white text-blue-600">
            <FileText size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-gray-800 truncate">{link.label}</span>
            <span className="block text-[11px] text-blue-500 capitalize">
              {link.kind === "specSheet" ? "Spec sheet" : link.kind}
            </span>
          </span>
          <ExternalLink size={15} className="shrink-0 text-blue-400" />
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add components/chat/MessageAttachment.tsx
git commit -m "feat(chat): shared attachment/link renderer"
```

---

## Task 16: `LiveChat` — pre-chat form + thread + composer

The message path *becomes* live chat (spec §3.2). The pre-chat form keeps today's contract exactly: same fields, the `company_website` honeypot, and `getCachedLead()` prefill.

**Files:**
- Create: `components/chat/LiveChat.tsx`

**Interfaces:**
- Consumes: `useConversation` (Task 13); `MessageAttachment` (Task 15); `MAX_MESSAGE_LEN`, `isSendable` (Task 2); `getCachedLead` (existing); `PHONE_TEL`, `PHONE_DISPLAY` (existing).
- Produces: `export default function LiveChat({ onWhatsApp }: { onWhatsApp: () => void }): JSX.Element` — `onWhatsApp` switches the parent panel to the WhatsApp view (used by the never-a-dead-end fallbacks, spec §6.2).

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Send, Phone, Loader2 } from "lucide-react";
import { useConversation } from "@/lib/chat/useConversation";
import { isSendable, MAX_MESSAGE_LEN } from "@/lib/chat/messages";
import MessageAttachment from "./MessageAttachment";
import { getCachedLead } from "@/lib/leadGate";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const FIELDS = [
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Company Email", type: "email", placeholder: "you@company.com" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
] as const;

/**
 * The live-chat path (spec §3.2). Two states in one component:
 *
 *   no conversation yet → the PRE-CHAT FORM. Same contract as today's capture
 *     form (same fields, same honeypot, same getCachedLead prefill) because it
 *     still produces the same email + Zoho lead — that is the durable backup
 *     that makes §6 safe. It just now ALSO opens a live thread.
 *
 *   conversation exists → the THREAD. Streams over onSnapshot; resumes across
 *     pages and visits via the persisted anonymous uid.
 */
export default function LiveChat({ onWhatsApp }: { onWhatsApp: () => void }) {
  const pathname = usePathname();
  const { ready, conversationId, messages, error, startConversation, sendMessage } = useConversation();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState("");
  const [prefill, setPrefill] = useState<Record<string, string>>({});

  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = getCachedLead();
    if (cached) setPrefill({ name: cached.name, email: cached.email, phone: cached.phone });
  }, []);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const fd = new FormData(e.currentTarget);
    const name = ((fd.get("name") as string) ?? "").trim();
    const email = ((fd.get("email") as string) ?? "").trim();
    const phone = ((fd.get("phone") as string) ?? "").trim();
    const message = ((fd.get("message") as string) ?? "").trim();

    // Whitespace-only values satisfy `required` but make junk CRM leads.
    if (!name || !email || !phone || !message) {
      setFormError("Please fill in your name, email, phone, and message.");
      setSubmitting(false);
      return;
    }
    // The honeypot is never read here: /api/contact drops filled ones server-side
    // (it 200s silently so bots don't learn the field is a trap). We just forward
    // it, which useConversation does.
    try {
      await startConversation({ customer: { name, email, phone }, message, page: pathname });
    } catch {
      setFormError("We couldn't start the chat. Try WhatsApp or call us below.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!isSendable({ text })) return;
    setDraft("");
    await sendMessage(text).catch(() => setDraft(text)); // put it back if it failed
  }

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 size={20} className="animate-spin text-gray-300" />
      </div>
    );
  }

  // Firebase unreachable ⇒ never a dead end (spec §11).
  if (error && !conversationId) {
    return (
      <div className="flex-1 p-4 space-y-3">
        <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          {error} Please use WhatsApp or call us — we&apos;ll reply right away.
        </div>
        <Fallbacks onWhatsApp={onWhatsApp} />
      </div>
    );
  }

  // ── pre-chat form ────────────────────────────────────────────────────────
  if (!conversationId) {
    return (
      <form onSubmit={handleStart} className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-gray-500 text-center">
          Tell us who you are and we&apos;ll start chatting right away.
        </p>

        {/* Honeypot — hidden from users; bots that fill it are dropped by /api/contact */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

        {FIELDS.map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={`chat-${id}`} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {label}
            </label>
            <input
              required
              id={`chat-${id}`}
              name={id}
              type={type}
              placeholder={placeholder}
              defaultValue={prefill[id] ?? ""}
              key={`${id}-${prefill[id] ?? ""}`}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm"
            />
          </div>
        ))}

        <div>
          <label htmlFor="chat-message" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Message
          </label>
          <textarea
            required
            id="chat-message"
            name="message"
            rows={3}
            maxLength={MAX_MESSAGE_LEN}
            placeholder="How can we help?"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm resize-none"
          />
        </div>

        {formError && (
          <div role="alert" className="space-y-2.5 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <p className="text-xs">{formError}</p>
            <Fallbacks onWhatsApp={onWhatsApp} />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting…" : (<><Send size={15} /> Start chatting</>)}
        </button>
      </form>
    );
  }

  // ── live thread ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          if (m.sender === "system") {
            return (
              <div key={m.id} className="space-y-2">
                <p className="text-[11px] text-center text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                  {m.text}
                </p>
                {/* §6.2 — every away/timeout state offers a route to a human. */}
                <Fallbacks onWhatsApp={onWhatsApp} />
              </div>
            );
          }
          const mine = m.sender === "customer";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                <MessageAttachment attachment={m.attachment} link={m.link} />
              </div>
            </div>
          );
        })}
        <div ref={threadEnd} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="Type a message…"
          aria-label="Type a message"
          className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={!isSendable({ text: draft })}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </>
  );
}

/** Never a dead end (spec §6.2): WhatsApp + phone, wherever things go wrong. */
function Fallbacks({ onWhatsApp }: { onWhatsApp: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onWhatsApp}
        className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-all"
      >
        WhatsApp
      </button>
      <a
        href={PHONE_TEL}
        className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-3 py-2 rounded-lg font-semibold text-xs transition-all"
      >
        <Phone size={13} /> Call {PHONE_DISPLAY}
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add components/chat/LiveChat.tsx
git commit -m "feat(chat): LiveChat — pre-chat form, live thread, composer"
```

---

## Task 17: `ChatLauncher` + `ChatPanel` — two desktop bubbles become one

The IA fix (spec §3.1). Today desktop floats **two** near-identical bubbles that open the **same** panel — green WhatsApp at [ChatWidget.tsx:152](../../../components/ChatWidget.tsx#L152), blue chat at [ChatWidget.tsx:168](../../../components/ChatWidget.tsx#L168) — differing only in which tab opens first. Users cannot tell them apart, so they hesitate. Add live chat on top and there would be three.

They collapse into **one** launcher whose panel forks explicitly by presence. The old green bubble must end up **gone, not hidden** — the spec calls that out, and Task 27 asserts it.

**Files:**
- Create: `components/chat/ChatLauncher.tsx`
- Create: `components/chat/ChatPanel.tsx`
- Modify: `components/ClientFloats.tsx`
- Delete: `components/ChatWidget.tsx`

**Interfaces:**
- Consumes: `useChat` (Task 12); `useTeamPresence`, `useVisitorHeartbeat` (Task 13); `LiveChat` (Task 16); `WhatsAppPanel`, `WA_PATH` (Task 14).
- Produces: `export default function ChatLauncher(): JSX.Element | null` — the single mount point; it renders the bubble **and** the panel. `ChatPanel` is its internal presentation.

- [ ] **Step 1: Write `components/chat/ChatPanel.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, MessageCircle, Phone, ChevronRight } from "lucide-react";
import { useChat, type ChatView } from "@/context/ChatContext";
import LiveChat from "./LiveChat";
import WhatsAppPanel, { WA_PATH } from "./WhatsAppPanel";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

/**
 * The panel behind the single launcher (spec §3.1) — desktop popover, mobile
 * bottom sheet, one component.
 *
 * PORTALED TO <body> ON PURPOSE. The panel uses backdrop-blur, and any
 * `backdrop-filter` ancestor becomes the containing block for `fixed` children —
 * so a bottom sheet rendered inside the blurred tree gets clamped to it instead
 * of the viewport. Do not "simplify" the portal away.
 *
 * Layering (spec §3.1): panel z-[60], above the mobile sticky bar (z-40) and
 * below the cookie banner (z-300).
 */
export default function ChatPanel({ teamOnline }: { teamOnline: boolean }) {
  const { isOpen, view, openChat, closeChat } = useChat();
  const [mounted, setMounted] = useState(false);

  // createPortal needs a DOM. ClientFloats already loads this with ssr:false,
  // but the guard keeps the component safe wherever it is mounted.
  useEffect(() => setMounted(true), []);

  // Escape closes — a fixed overlay with no keyboard exit is a trap.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeChat]);

  if (!mounted || !isOpen) return null;

  const panel = (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Aplus Technology Solutions"
      className={[
        "fixed z-[60] flex flex-col overflow-hidden bg-white/90 backdrop-blur-xl shadow-glass border border-white/40",
        // Mobile: bottom sheet, full width, above the sticky bar.
        "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]",
        // Desktop: anchored popover above the launcher.
        "md:inset-x-auto md:right-5 md:bottom-24 md:w-90 md:max-w-[calc(100vw-24px)] md:rounded-2xl md:max-h-[560px]",
      ].join(" ")}
    >
      <Header teamOnline={teamOnline} onClose={closeChat} />

      {view === "home" && <HomeFork teamOnline={teamOnline} onPick={openChat} />}
      {view === "live" && <LiveChat onWhatsApp={() => openChat("whatsapp")} />}
      {view === "whatsapp" && <WhatsAppPanel />}
    </div>
  );

  return createPortal(panel, document.body);
}

function Header({ teamOnline, onClose }: { teamOnline: boolean; onClose: () => void }) {
  return (
    <div className="bg-blue-600 px-5 py-4 flex items-center gap-3 shrink-0">
      <div className="relative shrink-0">
        <Image
          src="/logo.png"
          alt="Aplus Technology"
          width={36}
          height={36}
          className="rounded-lg bg-white p-0.5 object-contain"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-600 ${
            teamOnline ? "bg-green-400" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-sm truncate">Aplus Technology Solutions</div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${teamOnline ? "bg-green-300" : "bg-gray-300"}`} />
          <span className="text-blue-100 text-xs">
            {teamOnline
              ? "Sales team is online — replies in minutes"
              : "Team is away — we'll reply on WhatsApp/email"}
          </span>
        </div>
      </div>
      <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors" aria-label="Close chat">
        <X size={18} />
      </button>
    </div>
  );
}

/**
 * The explicit fork (spec §3.1). The two paths are genuinely different products,
 * so we NAME the difference instead of hiding it behind identical bubbles:
 *
 *   online → live chat is the hero, because it is genuinely the best path.
 *   away   → say so, and give WhatsApp/Call equal weight, because a live chat
 *            cannot be answered live.
 */
function HomeFork({ teamOnline, onPick }: { teamOnline: boolean; onPick: (view: ChatView) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {teamOnline ? (
        <>
          <button
            onClick={() => onPick("live")}
            className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-md shadow-blue-600/20"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span className="flex-1 text-left">
              <span className="block text-sm">Chat now</span>
              <span className="block text-[11px] font-medium text-blue-100">
                Talk to us right here, right now.
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0" />
          </button>

          <button
            onClick={() => onPick("whatsapp")}
            className="w-full flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-3 rounded-xl font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] shrink-0">
              <path d={WA_PATH} />
            </svg>
            <span className="flex-1 text-left">
              <span className="block text-sm">Continue on WhatsApp</span>
              <span className="block text-[11px] font-medium text-gray-400">
                The thread lives in WhatsApp.
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
          </button>

          <div className="flex gap-2 pt-1">
            <a
              href={PHONE_TEL}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 py-2"
            >
              <Phone size={13} /> Call
            </a>
            <a
              href="mailto:info@aplustechsol.com"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 py-2"
            >
              ✉ Email
            </a>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => onPick("live")}
            className="w-full flex items-center gap-3 bg-gray-900 hover:bg-blue-600 text-white px-4 py-4 rounded-xl font-bold transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span className="flex-1 text-left text-sm">Leave a message</span>
            <ChevronRight size={16} className="shrink-0" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPick("whatsapp")}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                <path d={WA_PATH} />
              </svg>
              WhatsApp
            </button>
            <a
              href={PHONE_TEL}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Phone size={14} /> Call
            </a>
          </div>

          <p className="text-[11px] text-center text-gray-500 leading-relaxed">
            We&apos;ll reply by WhatsApp or email.
          </p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/chat/ChatLauncher.tsx`**

```tsx
"use client";

import { MessageCircle, X } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useTeamPresence } from "@/lib/chat/useTeamPresence";
import { useVisitorHeartbeat } from "@/lib/chat/useVisitorHeartbeat";
import ChatPanel from "./ChatPanel";

/**
 * THE single chat entry point (spec §3.1).
 *
 * Replaces the old ChatWidget's TWO desktop bubbles (a green WhatsApp one and a
 * blue chat one that opened the same panel on different tabs) with ONE launcher
 * carrying a real presence dot. Net: desktop bottom-right goes from 2 floating
 * buttons to 1.
 *
 * The bubble itself is desktop-only — on mobile, Chat lives in the existing
 * sticky bar (MobileStickyCTA), so we add NO new floating element on either
 * breakpoint. The PANEL, however, renders on both: it is portaled to <body> from
 * inside ChatPanel and opens from either trigger via ChatContext.
 */
export default function ChatLauncher() {
  const { isOpen, toggleChat, unread } = useChat();
  const { teamOnline } = useTeamPresence();

  // Tell the agent whether the customer is still watching (spec §5).
  useVisitorHeartbeat(isOpen);

  return (
    <>
      {/* md:flex — the bubble is desktop-only; mobile uses the sticky bar. */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        className="hidden md:flex fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center shadow-xl shadow-blue-600/40 transition-all hover:scale-110"
      >
        {isOpen ? (
          <X className="text-white" size={22} />
        ) : (
          <>
            <MessageCircle className="text-white" size={24} />
            {/* Real presence, not a business-hours guess (spec §5). */}
            <span
              aria-hidden="true"
              className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                teamOnline ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      <ChatPanel teamOnline={teamOnline} />
    </>
  );
}
```

- [ ] **Step 3: Swap the mount in `components/ClientFloats.tsx`**

Replace the `ChatWidget` import and usage:

```tsx
const ChatLauncher = dynamic(() => import("./chat/ChatLauncher"), { ssr: false });
```

```tsx
      <div className="print:hidden">
        <ChatLauncher />
        <ComparisonFloatingBar />
        <QuoteLimitToast />
        <FinderFloatButton />
        <BackToTop />
        <CookieConsent />
        <MobileStickyCTA />
      </div>
```

- [ ] **Step 4: Delete the old widget**

```bash
git rm components/ChatWidget.tsx
```

Then confirm nothing else referenced it:

Run: `npx tsc --noEmit`
Expected: no errors. If a stale import surfaces, fix it — the spec requires the old green bubble to be **gone**, so a lingering render path is a bug, not a leftover.

- [ ] **Step 5: Verify the desktop bubble count is exactly one**

```bash
npm run dev
```

In the browser at `http://localhost:3000` (desktop width):
- Exactly **one** floating button sits bottom-right. The green WhatsApp bubble that used to sit above it is gone.
- Clicking it opens the panel on the **home fork**. With no console open, the hero reads **"Leave a message"** and the header says **"Team is away — we'll reply on WhatsApp/email"**.
- "Continue on WhatsApp" shows the old WhatsApp panel unchanged (Web link, QR, chips, phone/email).

- [ ] **Step 6: Commit**

```bash
npm test
git add components/chat/ChatLauncher.tsx components/chat/ChatPanel.tsx components/ClientFloats.tsx
git commit -m "feat(chat): one launcher, presence-aware panel — replaces the two desktop bubbles"
```

---

## Task 18: Mobile sticky bar gains Chat

Phone visitors are the ones who most need to chat, and today the widget is `hidden md:contents` — desktop-only. Chat joins the **existing** sticky bar rather than adding a floating element (spec §3.1).

Also: [MobileStickyCTA:29](../../../components/MobileStickyCTA.tsx#L29) suppresses the whole bar on `/quote` today because that page has its own WhatsApp/Call/Submit affordances. That rationale still holds for those three — but **live chat is a capability `/quote` does not otherwise have**, so on `/quote` the bar renders **Chat only**.

**Files:**
- Modify: `components/MobileStickyCTA.tsx`

**Interfaces:**
- Consumes: `useChat` (Task 12); `WA_PATH` (Task 14).
- Produces: no new exports.

- [ ] **Step 1: Rewrite the component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, FileText, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { WHATSAPP_NUMBER, getWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";
import { useChat } from "@/context/ChatContext";

/**
 * Mobile-only sticky CTA bar.
 *
 * Chat joins the bar rather than adding a floating bubble (spec §3.1): mobile
 * gains live chat with NO new floating element. Four buttons at 3/12 each keep
 * tap targets ≈80px wide on a 360px phone — comfortably over the 44px minimum.
 *
 * On /quote the bar used to hide entirely, because that page already has its own
 * WhatsApp/Call/Submit affordances. That is still true of those three — but live
 * chat is a capability /quote does NOT otherwise have, so there we render Chat
 * alone rather than nothing.
 */
export default function MobileStickyCTA() {
  const pathname = usePathname();
  const { openChat } = useChat();

  const isQuote = pathname.startsWith("/quote");

  const waMessage = getWhatsAppMessage(pathname);
  const waHref = buildWhatsAppUrl(waMessage);

  const openLiveChat = () => {
    trackEvent("chat_open", { source: "mobile_sticky", page: pathname });
    openChat("home");
  };

  return (
    <div
      // md:hidden — mobile only. The pb safe-area value handles iOS home-indicator devices.
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      role="region"
      aria-label="Quick contact"
    >
      <div className="grid grid-cols-12 gap-2 px-3 py-2.5">
        {/* Chat — 3/12 on a normal page, full width on /quote */}
        <button
          type="button"
          onClick={openLiveChat}
          aria-label="Chat with sales"
          className={`${
            isQuote ? "col-span-12" : "col-span-3"
          } flex items-center justify-center gap-1.5 bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors`}
        >
          <MessageCircle size={15} aria-hidden="true" />
          Chat
        </button>

        {!isQuote && (
          <>
            {/* WhatsApp — 3/12 */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat on WhatsApp at +${WHATSAPP_NUMBER}`}
              onClick={() => trackEvent("whatsapp_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-[#25D366] active:bg-[#1ea758] text-gray-900 font-semibold text-sm rounded-xl py-3 transition-colors shadow-sm shadow-green-600/20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-900 shrink-0" aria-hidden="true">
                <path d={WA_PATH} />
              </svg>
              <span className="sr-only sm:not-sr-only">WhatsApp</span>
            </a>

            {/* Call — 3/12 */}
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              aria-label="Call sales"
              onClick={() => trackEvent("call_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl py-3 transition-colors"
            >
              <Phone size={15} aria-hidden="true" />
              Call
            </a>

            {/* Quote — 3/12 */}
            <Link
              href="/quote"
              aria-label="Request a quote"
              onClick={() => trackEvent("quote_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors"
            >
              <FileText size={15} aria-hidden="true" />
              Quote
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
```

> **A judgement call the implementer must make and report.** The WhatsApp label at 3/12 on a 360px phone is tight. The `sr-only sm:not-sr-only` above hides the *word* and keeps the icon, which preserves the 44px+ tap target and the accessible name. If it looks wrong on a real device, prefer shrinking the label (e.g. `text-xs`) over dropping a button — the spec keeps **every** existing conversion path, Quote included. Do not silently remove one.
>
> Also note Chat and Quote are both `bg-blue-600` — two blue buttons side by side. If they read as one blob at 360px, give Quote a lighter treatment (`bg-blue-50 text-blue-700`) rather than restyling Chat, which is the new hero.

- [ ] **Step 2: Verify at 360 px**

```bash
npm run dev
```

In devtools at **360 px** width:
- The bar shows **four** buttons; every tap target is ≥44 px tall and ≥80 px wide.
- Tapping **Chat** opens the panel as a **bottom sheet** that is **not clipped** by the navbar (the portal from Task 17 is what prevents that) and sits **above** the sticky bar.
- On `/quote`, the bar shows **Chat only**.

- [ ] **Step 3: Commit**

```bash
npm test
git add components/MobileStickyCTA.tsx
git commit -m "feat(chat): mobile sticky bar gains Chat; /quote renders Chat only"
```

---

## Task 19: `POST /api/chat/escalate` — the no-reply flag

Called by the **waiting customer's own browser** after 3 minutes with no agent reply (Task 13). That is what makes the safety net work when *no console is open anywhere* — no cron job, no paid plan (spec §6.1).

Because the caller is an untrusted browser, the route re-verifies everything: a valid Firebase ID token, and that the token's uid actually **owns** the conversation it is escalating. Otherwise anyone could flag every conversation on the site.

In Phase 1 escalation = **set `needsFollowUp` + email `info@`**. Phase 2 adds the push fan-out here.

**Files:**
- Create: `app/api/chat/escalate/route.ts`
- Create: `lib/chat/apiGuards.ts`

**Interfaces:**
- Consumes: `getAdminAuth`, `getAdminDb` (Task 1); `rateLimit`, `clientIp` (existing).
- Produces:
  - `guardRequest(req: Request, bucket: string, limit: number, windowMs: number): Promise<NextResponse | null>` — returns a response to send, or `null` to proceed.
  - `verifyOwner(req: Request, conversationId: string): Promise<{ ok: true; uid: string; conversation: FirebaseFirestore.DocumentData } | { ok: false; status: number }>` — Bearer ID token → uid → ownership check.

- [ ] **Step 1: Write `lib/chat/apiGuards.ts`**

```ts
import "server-only";
import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COL } from "./types";

/**
 * Shared entry checks for every chat API route (spec §9: "escalate/notify/
 * reply-email all verify conversation ownership").
 *
 * The Origin allow-list mirrors app/api/contact/route.ts: reject a
 * present-but-wrong Origin (blocks browser-driven cross-site abuse), allow a
 * missing one (non-browser clients legitimately omit it, and they are still
 * covered by the rate limit and the ID-token check).
 */

const ALLOWED_ORIGINS = new Set([
  "https://www.aplustechsol.com",
  "https://aplustechsol.com",
]);

const ALLOW_LOCALHOST = process.env.NODE_ENV !== "production";

const VERCEL_ORIGINS = new Set(
  [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host.toLowerCase()}`)
);

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_ORIGINS.has(origin.toLowerCase())) return true;
  if (ALLOW_LOCALHOST && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

/** Content-type + Origin + per-IP rate limit. Returns a response, or null to proceed. */
export function guardRequest(
  req: Request,
  bucket: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ success: false, message: "Unsupported content type." }, { status: 415 });
  }

  const origin = req.headers.get("origin");
  if (origin && !isOriginAllowed(origin)) {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const result = rateLimit(`${bucket}:${clientIp(req)}`, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
    );
  }

  return null;
}

type OwnerCheck =
  | { ok: true; uid: string; isAgent: boolean; conversation: FirebaseFirestore.DocumentData }
  | { ok: false; status: number };

/**
 * Verify the caller holds a valid Firebase ID token AND owns the conversation
 * (or is an agent). This is THE check — the browser sending the request is
 * untrusted, and without it anyone could flag or email any conversation on the
 * site by guessing an id.
 */
export async function verifyOwner(req: Request, conversationId: string): Promise<OwnerCheck> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401 };

  let uid: string;
  let isAgent = false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
    isAgent = decoded.agent === true;
  } catch {
    return { ok: false, status: 401 };
  }

  const snap = await getAdminDb().collection(COL.conversations).doc(conversationId).get();
  if (!snap.exists) return { ok: false, status: 404 };

  const conversation = snap.data()!;
  if (!isAgent && conversation.ownerUid !== uid) return { ok: false, status: 403 };

  return { ok: true, uid, isAgent, conversation };
}
```

- [ ] **Step 2: Write `app/api/chat/escalate/route.ts`**

```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { guardRequest, verifyOwner } from "@/lib/chat/apiGuards";
import { COL } from "@/lib/chat/types";
import { siteUrl } from "@/lib/chat/links";

/**
 * "Nobody replied" (spec §6.1).
 *
 * Fired by the WAITING CUSTOMER'S browser 3 minutes after their message goes
 * unanswered — which is precisely why it still works when no console is open
 * anywhere. The browser only decides *when*; everything privileged happens here,
 * behind an ownership check, because the caller is untrusted.
 *
 * Phase 1: flag the conversation + email info@. Phase 2 adds the push fan-out to
 * every agent device at this same choke point.
 *
 * The customer has ALREADY been captured (email + Zoho lead fired at chat start),
 * so a failure here loses a convenience, not the lead.
 */

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@aplustechsol.com";
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const blocked = guardRequest(req, "chat-escalate", RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) return blocked;

    const body = (await req.json()) as { conversationId?: unknown };
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    if (!conversationId) {
      return NextResponse.json({ success: false, message: "Missing conversationId." }, { status: 400 });
    }

    const check = await verifyOwner(req, conversationId);
    if (!check.ok) {
      return NextResponse.json({ success: false }, { status: check.status });
    }
    const { conversation } = check;

    // Idempotent: a re-fired timer must not re-email.
    if (conversation.needsFollowUp === true) {
      return NextResponse.json({ success: true, alreadyFlagged: true });
    }

    await getAdminDb().collection(COL.conversations).doc(conversationId).update({
      needsFollowUp: true,
      escalatedAt: FieldValue.serverTimestamp(),
    });

    const customer = conversation.customer ?? {};
    const consoleUrl = `${siteUrl()}/admin/chat?c=${encodeURIComponent(conversationId)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: TO_EMAIL,
      subject: `⚠️ Unanswered chat — ${esc(customer.name ?? "a visitor")}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#b91c1c;padding:24px 32px">
        <div style="font-size:20px;font-weight:700;color:#fff">⚠️ Unanswered live chat</div>
        <div style="font-size:13px;color:#fecaca;margin-top:4px">Waiting 3+ minutes with no reply</div>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="font-size:14px;color:#111827;margin:0 0 8px"><strong>${esc(customer.name ?? "")}</strong></p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px">${esc(customer.email ?? "")} · ${esc(customer.phone ?? "")}</p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px">On page: ${esc(conversation.page ?? "")}</p>
        <p style="font-size:13px;color:#374151;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 20px">${esc(conversation.lastPreview ?? "")}</p>
        <a href="${consoleUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:8px">Open the chat →</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    });

    if (error) console.error("[chat/escalate][resend]", error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/chat/escalate]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

/** Escape user-supplied text before interpolating into the HTML email body. */
function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

- [ ] **Step 3: Send the ID token from the client**

The route requires `Authorization: Bearer <idToken>`. Update the `fetch` inside `lib/chat/useConversation.ts` (Task 13, the escalation effect):

```ts
      const idToken = await getAuthClient().currentUser?.getIdToken();
      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {});
```

- [ ] **Step 4: Verify the ownership check actually refuses a stranger**

With `npm run dev` running:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat/escalate \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"anything"}'
```

Expected: `401` — no token, no escalation. Then with a garbage token:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat/escalate \
  -H "Content-Type: application/json" -H "Authorization: Bearer not-a-token" \
  -d '{"conversationId":"anything"}'
```

Expected: `401`. A `200` here is a security bug — stop and fix it.

- [ ] **Step 5: Commit**

```bash
npm test
git add lib/chat/apiGuards.ts app/api/chat/escalate/route.ts lib/chat/useConversation.ts
git commit -m "feat(chat): escalate route — needsFollowUp flag + unanswered-chat email"
```

---

## Task 20: `POST /api/chat/reply-email` — reach a customer who left

The agent replies; the customer closed the tab twenty minutes ago. Email them the reply with a link straight back into the same thread (spec §6.3).

**Files:**
- Create: `app/api/chat/reply-email/route.ts`

**Interfaces:**
- Consumes: `guardRequest`, `verifyOwner` (Task 19); `shouldEmailReply` (Task 8); `toMillis`, `COL` (Task 2); `buildResumeUrl` (Task 7); `getAdminDb` (Task 1).
- Produces: nothing importable. Called by the console after each agent send (Task 23).

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { guardRequest, verifyOwner } from "@/lib/chat/apiGuards";
import { COL, toMillis } from "@/lib/chat/types";
import { shouldEmailReply } from "@/lib/chat/replyEmail";
import { buildResumeUrl } from "@/lib/chat/resumeToken";

/**
 * Email an agent reply to a customer who has left (spec §6.3).
 *
 * Called by the console after each agent send. The DECISION (offline? recently
 * emailed? do we even have an address?) lives in lib/chat/replyEmail.ts and is
 * unit-tested; this route just gathers the facts and acts.
 *
 * The email carries a SIGNED RESUME LINK. Without it, a customer opening the
 * mail on their phone would have no anonymous session and the rules would
 * (correctly) refuse them their own thread.
 *
 * Failure is non-fatal (spec §11): the reply still lives in the thread, and the
 * console still offers the one-click WhatsApp button.
 */

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const blocked = guardRequest(req, "chat-reply-email", RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) return blocked;

    const body = (await req.json()) as { conversationId?: unknown; messageId?: unknown };
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const messageId = typeof body.messageId === "string" ? body.messageId : "";
    if (!conversationId || !messageId) {
      return NextResponse.json({ success: false, message: "Missing ids." }, { status: 400 });
    }

    const check = await verifyOwner(req, conversationId);
    if (!check.ok) return NextResponse.json({ success: false }, { status: check.status });

    // Only an agent's reply gets emailed to the customer. A customer calling this
    // route about their own conversation must not be able to mail themselves.
    if (!check.isAgent) return NextResponse.json({ success: false }, { status: 403 });

    const secret = process.env.CHAT_RESUME_SECRET;
    if (!secret) {
      console.error("[chat/reply-email] CHAT_RESUME_SECRET is not set");
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const db = getAdminDb();
    const conversation = check.conversation;
    const customerEmail: string = conversation.customer?.email ?? "";
    const customerName: string = conversation.customer?.name ?? "";

    // Is the customer still watching? (visitors/{visitorId}.lastSeenAt)
    const visitorSnap = await db.collection(COL.visitors).doc(conversation.visitorId).get();
    const customerLastSeenAt = visitorSnap.exists ? toMillis(visitorSnap.data()?.lastSeenAt) : null;

    // When did we last email them? Debounce so a burst of agent messages becomes
    // ONE email rather than three (spec §6.3).
    const lastEmailed = await db
      .collection(COL.conversations)
      .doc(conversationId)
      .collection(COL.messages)
      .where("emailedAt", "!=", null)
      .orderBy("emailedAt", "desc")
      .limit(1)
      .get();
    const lastEmailedAt = lastEmailed.empty ? null : toMillis(lastEmailed.docs[0].data().emailedAt);

    const decision = shouldEmailReply({
      customerEmail,
      customerLastSeenAt: customerLastSeenAt || null,
      lastEmailedAt,
      now: Date.now(),
    });

    if (!decision) {
      return NextResponse.json({ success: true, emailed: false });
    }

    const messageRef = db
      .collection(COL.conversations)
      .doc(conversationId)
      .collection(COL.messages)
      .doc(messageId);
    const messageSnap = await messageRef.get();
    if (!messageSnap.exists) {
      return NextResponse.json({ success: false, message: "No such message." }, { status: 404 });
    }
    const message = messageSnap.data()!;

    const resumeUrl = buildResumeUrl(conversationId, secret);
    const attachmentUrl: string | undefined = message.attachment?.url ?? message.link?.url;
    const attachmentLabel: string | undefined = message.attachment?.name ?? message.link?.label;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: customerEmail,
      replyTo: process.env.CONTACT_TO_EMAIL ?? "info@aplustechsol.com",
      subject: "Re: your chat with Aplus Technology Solutions",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
        <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase">Aplus Technology Solutions</div>
        <div style="font-size:20px;font-weight:700;color:#fff;margin-top:4px">Our sales team replied</div>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="font-size:14px;color:#111827;margin:0 0 16px">Hi ${esc(customerName)},</p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-left:3px solid #2563eb;border-radius:8px;padding:16px;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${esc(message.text ?? "")}</div>
        ${
          attachmentUrl
            ? `<p style="margin:16px 0 0"><a href="${esc(attachmentUrl)}" style="font-size:13px;color:#2563eb;font-weight:600">📎 ${esc(attachmentLabel ?? "Attachment")}</a></p>`
            : ""
        }
        <p style="margin:24px 0 0">
          <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">Reply in the chat →</a>
        </p>
        <p style="font-size:12px;color:#9ca3af;margin:16px 0 0">Or just reply to this email — it reaches the same team.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    });

    if (error) {
      console.error("[chat/reply-email][resend]", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    await messageRef.update({ emailedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ success: true, emailed: true });
  } catch (err) {
    console.error("[api/chat/reply-email]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

> **Firestore gotcha the implementer will hit.** The `where("emailedAt", "!=", null)` query needs a single-field index and only matches documents where the field **exists**. If the emulator or production complains, the simpler equivalent is to `orderBy("emailedAt", "desc").limit(1)` alone — an `orderBy` on a field already excludes documents missing it. Prefer that; drop the `where`.

- [ ] **Step 2: Verify a non-agent cannot trigger a customer email**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/chat/reply-email \
  -H "Content-Type: application/json" -d '{"conversationId":"x","messageId":"y"}'
```

Expected: `401`.

- [ ] **Step 3: Commit**

```bash
npm test
git add app/api/chat/reply-email/route.ts
git commit -m "feat(chat): email agent replies to offline customers with a resume link"
```

---

## Task 21: `GET /api/chat/resume` — the link back into the thread

The customer clicks "Reply in the chat" in that email, possibly on a different device with no anonymous session. This route trades a valid HMAC for a Firebase **custom token** scoped to the conversation's `ownerUid`, so they land back in the *same* thread (spec §6.3).

**Files:**
- Create: `app/api/chat/resume/route.ts`
- Modify: `lib/chat/useConversation.ts`

**Interfaces:**
- Consumes: `verifyResumeToken` (Task 7); `getAdminAuth`, `getAdminDb` (Task 1); `rateLimit`, `clientIp`.
- Produces: a 302 to `/?chat=resume#t=<customToken>` — the widget picks the token out of the fragment and signs in with it.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { verifyResumeToken } from "@/lib/chat/resumeToken";
import { COL } from "@/lib/chat/types";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { siteUrl } from "@/lib/chat/links";

/**
 * Resume a chat from an emailed link (spec §6.3).
 *
 * A GET from an email client, so it cannot use the JSON/Origin guards — the HMAC
 * IS the authentication. verifyResumeToken is constant-time and is bound to the
 * conversation id, so a token for one thread cannot open another.
 *
 * The minted custom token is returned in the URL FRAGMENT, not the query string:
 * fragments are never sent to the server and stay out of access logs, Referer
 * headers, and analytics. It is single-use in practice (Firebase invalidates it
 * once exchanged) and short-lived (1 hour).
 */

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("c") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const secret = process.env.CHAT_RESUME_SECRET;

  const fail = () => NextResponse.redirect(`${siteUrl()}/?chat=expired`, 302);

  // Brute-forcing a 256-bit HMAC is not realistic, but an unauthenticated GET
  // that mints tokens still deserves a throttle.
  const limit = rateLimit(`chat-resume:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) return fail();

  if (!secret) {
    console.error("[chat/resume] CHAT_RESUME_SECRET is not set");
    return fail();
  }
  if (!conversationId || !verifyResumeToken(conversationId, token, secret)) return fail();

  try {
    const snap = await getAdminDb().collection(COL.conversations).doc(conversationId).get();
    if (!snap.exists) return fail();

    const ownerUid: string = snap.data()!.ownerUid;
    if (!ownerUid) return fail();

    const customToken = await getAdminAuth().createCustomToken(ownerUid);

    return NextResponse.redirect(
      `${siteUrl()}/?chat=resume#t=${encodeURIComponent(customToken)}`,
      302
    );
  } catch (err) {
    console.error("[api/chat/resume]", err);
    return fail();
  }
}
```

- [ ] **Step 2: Redeem the token in `lib/chat/useConversation.ts`**

Add this effect **before** the anonymous-sign-in effect, so a resume token wins over minting a fresh anonymous uid:

```ts
  // Resume from an emailed link (spec §6.3). /api/chat/resume lands us on
  // /?chat=resume#t=<customToken>; exchange it for a session as the ORIGINAL
  // ownerUid, so the rules let them back into their own thread even in a browser
  // that has never seen this site.
  const [resuming, setResuming] = useState(() =>
    typeof window !== "undefined" && window.location.hash.startsWith("#t=")
  );

  useEffect(() => {
    if (!resuming || !isFirebaseConfigured()) return;

    const customToken = decodeURIComponent(window.location.hash.slice(3));
    // Strip the token from the URL immediately — it must not survive into a
    // bookmark, a shared link, or the back/forward history.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    signInWithCustomToken(getAuthClient(), customToken)
      .catch(() => setError("That chat link has expired. Start a new chat, or use WhatsApp."))
      .finally(() => setResuming(false));
  }, [resuming]);
```

Import `signInWithCustomToken` from `firebase/auth`, and gate the anonymous sign-in so it does not race the resume:

```ts
    if (!auth.currentUser && !resuming) {
      void signInAnonymously(auth).catch(() => { … });
    }
```

Also open the panel automatically when the customer arrives via a resume link — in `ChatLauncher` (Task 17):

```tsx
  const { isOpen, toggleChat, unread, openChat } = useChat();

  // Arriving from a "reply in the chat" email — open straight into the thread.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat") === "resume") openChat("live");
  }, [openChat]);
```

- [ ] **Step 3: Verify a tampered token is refused**

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  "http://localhost:3000/api/chat/resume?c=conv_x&token=$(printf 'a%.0s' {1..64})"
```

Expected: `302 http://localhost:3000/?chat=expired` — **not** a redirect carrying a `#t=` token. A minted token here would mean the HMAC is not being checked.

- [ ] **Step 4: Commit**

```bash
npm test
git add app/api/chat/resume/route.ts lib/chat/useConversation.ts components/chat/ChatLauncher.tsx
git commit -m "feat(chat): signed resume links mint a custom token for the original owner"
```

---

## Task 22: Console shell + agent login

`/admin/chat` (spec §4). Firebase email/password, and the `agent: true` claim is what actually grants access — **enforced in the rules, not just the UI** (Task 9). A stranger who finds this URL and signs up gets a working login and an empty, permission-denied console. That is the design.

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/chat/page.tsx`
- Create: `components/admin/chat/AgentLogin.tsx`
- Create: `lib/chat/useAgentAuth.ts`

**Interfaces:**
- Consumes: `getAuthClient` (Task 1).
- Produces:
  - `useAgentAuth(): { ready: boolean; user: User | null; isAgent: boolean; signIn(email, password): Promise<void>; signOutAgent(): Promise<void>; error: string | null }`
  - `export default function AgentLogin({ onSignIn, error, busy }): JSX.Element`

- [ ] **Step 1: Write `app/admin/layout.tsx`**

```tsx
import type { Metadata } from "next";

/**
 * The console is a private tool, not a page. /admin/ is already disallowed in
 * app/robots.ts; this adds the meta-level noindex so a leaked link cannot be
 * indexed either.
 */
export const metadata: Metadata = {
  title: "Sales console",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
```

- [ ] **Step 2: Write `lib/chat/useAgentAuth.ts`**

```ts
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
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAgent, setIsAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Chat backend is not configured.");
      setReady(true);
      return;
    }
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
```

- [ ] **Step 3: Write `components/admin/chat/AgentLogin.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";

export default function AgentLogin({
  onSignIn,
  error,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  error: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    await onSignIn(String(fd.get("email") ?? ""), String(fd.get("password") ?? "")).catch(() => {});
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900">Sales console</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sign in to answer live chats.</p>
        </div>

        <div>
          <label htmlFor="agent-email" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Email
          </label>
          <input
            required
            id="agent-email"
            name="email"
            type="email"
            autoComplete="username"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="agent-password" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            required
            id="agent-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <><LogIn size={16} /> Sign in</>}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Write `app/admin/chat/page.tsx`** (shell; Task 23 fills the inbox in)

```tsx
"use client";

import { useAgentAuth } from "@/lib/chat/useAgentAuth";
import AgentLogin from "@/components/admin/chat/AgentLogin";
import { Loader2 } from "lucide-react";

export default function AdminChatPage() {
  const { ready, user, isAgent, signIn, signOutAgent, error } = useAgentAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (!user) return <AgentLogin onSignIn={signIn} error={error} />;

  // Signed in but not an agent. The rules already refuse them everything — this
  // just explains why the console is empty instead of showing a wall of errors.
  if (!isAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <p className="text-sm text-gray-800 font-semibold">This account is not a sales agent.</p>
          <p className="text-xs text-gray-500">
            Ask an administrator to grant access, then sign out and back in.
          </p>
          <button
            onClick={signOutAgent}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Task 23 replaces this with the inbox.
  return <div className="p-6 text-sm text-gray-500">Signed in as {user.email}. Inbox coming next.</div>;
}
```

- [ ] **Step 5: Verify the claim gate**

```bash
npm run dev
```

At `http://localhost:3000/admin/chat`:
- Signing in with the agent account (Task 10) reaches the "Inbox coming next" screen.
- Creating a *non*-agent user in Firebase console and signing in with it shows **"This account is not a sales agent."**

- [ ] **Step 6: Commit**

```bash
npm test
git add app/admin lib/chat/useAgentAuth.ts components/admin/chat/AgentLogin.tsx
git commit -m "feat(chat): sales console shell + agent-claim-gated login"
```

---

## Task 23: Console inbox, thread, presence, team heartbeat

The working console (spec §4). Unread/open first, `needsFollowUp` **pinned in red**, customer presence per conversation, reply composer, and the heartbeat that makes the customer's widget say "Sales team is online".

**Files:**
- Create: `lib/chat/useInbox.ts`
- Create: `lib/chat/useTeamHeartbeat.ts`
- Create: `components/admin/chat/ConversationList.tsx`
- Create: `components/admin/chat/ChatThread.tsx`
- Modify: `app/admin/chat/page.tsx`

**Interfaces:**
- Consumes: Tasks 1–3, 15, 20; `formatLastSeen`, `isVisitorOnline` (Task 3).
- Produces:
  - `useTeamHeartbeat(active: boolean): void`
  - `useInbox(): { conversations: Conversation[]; error: string | null }`
  - `useThread(conversationId: string | null): { messages: ChatMessage[]; visitor: VisitorDoc | null; sendReply(input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }): Promise<void>; markRead(): Promise<void>; setStatus(status: "open" | "closed"): Promise<void> }` — also in `lib/chat/useInbox.ts`.

- [ ] **Step 1: Write `lib/chat/useTeamHeartbeat.ts`**

```ts
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
```

- [ ] **Step 2: Write `lib/chat/useInbox.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import {
  COL,
  toMillis,
  type ChatAttachment,
  type ChatLink,
  type ChatMessage,
  type Conversation,
  type VisitorDoc,
} from "./types";
import { buildPreview } from "./messages";

/**
 * The agent's inbox (spec §4). Streams every OPEN conversation, freshest first.
 *
 * Sort order is deliberate: needsFollowUp pins to the top (spec §4 — "pinned in
 * red"), then unread, then recency. A conversation the safety net has flagged is
 * the single most expensive thing in the list to miss, so it outranks everything.
 */
export function useInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(getDb(), COL.conversations),
      where("status", "==", "open"),
      orderBy("lastMessageAt", "desc"),
      limit(100)
    );

    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            visitorId: data.visitorId,
            ownerUid: data.ownerUid,
            customer: data.customer ?? { name: "", email: "", phone: "" },
            startedBy: data.startedBy ?? "customer",
            page: data.page ?? "",
            status: data.status ?? "open",
            needsFollowUp: Boolean(data.needsFollowUp),
            createdAt: toMillis(data.createdAt),
            lastMessageAt: toMillis(data.lastMessageAt),
            lastPreview: data.lastPreview ?? "",
            lastSender: data.lastSender ?? "customer",
            unreadForAgent: data.unreadForAgent ?? 0,
          } satisfies Conversation;
        });

        rows.sort((a, b) => {
          if (a.needsFollowUp !== b.needsFollowUp) return a.needsFollowUp ? -1 : 1;
          const aUnread = a.unreadForAgent > 0;
          const bUnread = b.unreadForAgent > 0;
          if (aUnread !== bUnread) return aUnread ? -1 : 1;
          return b.lastMessageAt - a.lastMessageAt;
        });

        setConversations(rows);
      },
      (err) => {
        console.error("[useInbox]", err);
        setError("Could not load conversations. Check that this account has agent access.");
      }
    );
  }, []);

  return { conversations, error };
}

/** One conversation: its messages, the customer's presence, and the actions. */
export function useThread(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitor, setVisitor] = useState<VisitorDoc | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setVisitorId(null);
      return;
    }

    const db = getDb();

    const unsubConv = onSnapshot(doc(db, COL.conversations, conversationId), (snap) => {
      setVisitorId(snap.data()?.visitorId ?? null);
    });

    const unsubMsgs = onSnapshot(
      query(
        collection(db, COL.conversations, conversationId, COL.messages),
        orderBy("createdAt", "asc"),
        limit(300)
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sender: data.sender,
              text: data.text ?? "",
              createdAt: toMillis(data.createdAt),
              emailedAt: data.emailedAt ? toMillis(data.emailedAt) : undefined,
              attachment: data.attachment,
              link: data.link,
            };
          })
        );
      }
    );

    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [conversationId]);

  // Is the customer still watching? (spec §5 — decides "keep typing" vs "call them")
  useEffect(() => {
    if (!visitorId) {
      setVisitor(null);
      return;
    }
    return onSnapshot(doc(getDb(), COL.visitors, visitorId), (snap) => {
      const data = snap.data();
      setVisitor(
        data
          ? {
              firstSeenAt: toMillis(data.firstSeenAt),
              lastSeenAt: toMillis(data.lastSeenAt),
              currentPage: data.currentPage ?? "",
              chatOpen: Boolean(data.chatOpen),
            }
          : null
      );
    });
  }, [visitorId]);

  const sendReply = useCallback(
    async (input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }) => {
      if (!conversationId) return;
      const db = getDb();
      const text = (input.text ?? "").trim();

      // Firestore rejects `undefined`. Build the doc from what is actually present.
      const payload: Record<string, unknown> = {
        sender: "agent",
        text,
        createdAt: serverTimestamp(),
      };
      if (input.attachment) payload.attachment = input.attachment;
      if (input.link) payload.link = input.link;

      const messageRef = await addDoc(
        collection(db, COL.conversations, conversationId, COL.messages),
        payload
      );

      await updateDoc(doc(db, COL.conversations, conversationId), {
        lastMessageAt: serverTimestamp(),
        lastPreview: buildPreview(input),
        lastSender: "agent",
        unreadForAgent: 0,
        // An agent reply IS the answer the safety net was waiting for (spec §6.1).
        needsFollowUp: false,
      });

      // Reach them even if they left (spec §6.3). Non-fatal: the reply is already
      // in the thread, and the console still offers the WhatsApp button.
      const idToken = await getAuthClient().currentUser?.getIdToken();
      void fetch("/api/chat/reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ conversationId, messageId: messageRef.id }),
      }).catch(() => {});
    },
    [conversationId]
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    await updateDoc(doc(getDb(), COL.conversations, conversationId), { unreadForAgent: 0 }).catch(
      () => {}
    );
  }, [conversationId]);

  const setStatus = useCallback(
    async (status: "open" | "closed") => {
      if (!conversationId) return;
      await updateDoc(doc(getDb(), COL.conversations, conversationId), { status });
    },
    [conversationId]
  );

  return { messages, visitor, sendReply, markRead, setStatus };
}
```

- [ ] **Step 3: Write `components/admin/chat/ConversationList.tsx`**

```tsx
"use client";

import { AlertTriangle } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return <p className="p-6 text-sm text-gray-400 text-center">No open chats.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                selected ? "bg-blue-50" : "hover:bg-gray-50"
              } ${c.needsFollowUp ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 font-semibold text-sm text-gray-900 truncate">
                  {c.customer.name || "Visitor"}
                </span>
                {c.needsFollowUp && (
                  // The safety net fired and nobody answered. Loudest thing here.
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">
                    <AlertTriangle size={10} /> NO REPLY
                  </span>
                )}
                {c.unreadForAgent > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {c.unreadForAgent}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastPreview}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.page}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: Write `components/admin/chat/ChatThread.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Phone, Mail, ArrowLeft, CheckCheck } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";
import { useThread } from "@/lib/chat/useInbox";
import { isVisitorOnline, formatLastSeen } from "@/lib/chat/presence";
import { isSendable, MAX_MESSAGE_LEN } from "@/lib/chat/messages";
import MessageAttachment from "@/components/chat/MessageAttachment";

export default function ChatThread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const { messages, visitor, sendReply, markRead, setStatus } = useThread(conversation.id);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void markRead();
  }, [conversation.id, markRead]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const online = isVisitorOnline(visitor?.lastSeenAt ?? null);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!isSendable({ text })) return;
    setDraft("");
    await sendReply({ text }).catch(() => setDraft(text));
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-gray-700" aria-label="Back to list">
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">
            {conversation.customer.name || "Visitor"}
          </p>
          {/* Is he talking to someone who is still there? (spec §5) */}
          <p className="flex items-center gap-1.5 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={online ? "text-green-700" : "text-gray-400"}>
              {online
                ? `Online${visitor?.currentPage ? ` — viewing ${visitor.currentPage}` : ""}`
                : formatLastSeen(visitor?.lastSeenAt ?? null)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {conversation.customer.phone && (
            <a
              href={`tel:${conversation.customer.phone}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Call customer"
            >
              <Phone size={16} />
            </a>
          )}
          {conversation.customer.email && (
            <a
              href={`mailto:${conversation.customer.email}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Email customer"
            >
              <Mail size={16} />
            </a>
          )}
          <button
            onClick={() => setStatus("closed")}
            className="ml-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 transition-colors"
          >
            Close
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          if (m.sender === "system") {
            return (
              <p key={m.id} className="text-[11px] text-center text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                {m.text}
              </p>
            );
          }
          const mine = m.sender === "agent";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                <MessageAttachment attachment={m.attachment} link={m.link} />
                {m.emailedAt && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-blue-100">
                    <CheckCheck size={11} /> Emailed
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {/* Task 24 inserts the AttachmentPicker + LinkPicker into this row. */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex items-center gap-2 shrink-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="Reply…"
          aria-label="Reply"
          className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
        />
        <button
          type="submit"
          disabled={!isSendable({ text: draft })}
          aria-label="Send reply"
          className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Wire the console page**

Replace the placeholder in `app/admin/chat/page.tsx` (keep the auth gates from Task 22 exactly as they are; only the signed-in-agent branch changes):

```tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useAgentAuth } from "@/lib/chat/useAgentAuth";
import { useInbox } from "@/lib/chat/useInbox";
import { useTeamHeartbeat } from "@/lib/chat/useTeamHeartbeat";
import AgentLogin from "@/components/admin/chat/AgentLogin";
import ConversationList from "@/components/admin/chat/ConversationList";
import ChatThread from "@/components/admin/chat/ChatThread";

export default function AdminChatPage() {
  const { ready, user, isAgent, signIn, signOutAgent, error: authError } = useAgentAuth();

  // …the !ready / !user / !isAgent branches from Task 22, unchanged…

  return <Console email={user!.email ?? ""} onSignOut={signOutAgent} />;
}

function Console({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const { conversations, error } = useInbox();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // "Sales team is online" on every visitor's widget, for as long as this is open.
  useTeamHeartbeat(true);

  // Deep link from the escalation email / (Phase 2) a push notification.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) setSelectedId(c);
  }, []);

  // In-app alert: badge the tab title so an unread chat is visible from another
  // window (spec §4). Push (Phase 2) covers "nothing open at all".
  const unread = conversations.reduce((n, c) => n + (c.unreadForAgent > 0 ? 1 : 0), 0);
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Sales console` : "Sales console";
  }, [unread]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <span className="font-bold text-sm text-gray-900">Sales console</span>
        <span className="flex-1 text-xs text-gray-400 truncate">{email}</span>
        <button
          onClick={() => void onSignOut()}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>

      {error && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 border-b border-red-200 px-4 py-2">
          {error}
        </p>
      )}

      {/* Mobile: list → tap → thread. Laptop: side by side (spec §4). */}
      <div className="flex-1 min-h-0 flex">
        <aside
          className={`${
            selected ? "hidden md:block" : "block"
          } w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-200 bg-white overflow-y-auto`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <main className={`${selected ? "block" : "hidden md:block"} flex-1 min-w-0`}>
          {selected ? (
            <ChatThread conversation={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Select a conversation.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify the round trip**

With `npm run dev`, open **two** windows:
1. `/admin/chat`, signed in as the agent.
2. The site home page (a different browser profile, or incognito — it needs its own anonymous uid).

Then:
- The widget's launcher dot turns **green** and the panel header reads **"Sales team is online — replies in minutes"**, with **"Chat now"** as the hero.
- Start a chat. It appears in the console **immediately**, with an unread badge.
- Reply. It appears in the customer's thread **immediately**.
- The console header shows **"Online — viewing /"**. Close the customer's tab and within ~90 s it flips to **"Left just now"**.
- Close the console. Within ~90 s the customer's panel flips to **"Team is away"** and the hero becomes **"Leave a message"**.

- [ ] **Step 7: Commit**

```bash
npm test
git add lib/chat/useInbox.ts lib/chat/useTeamHeartbeat.ts components/admin/chat app/admin/chat/page.tsx
git commit -m "feat(chat): console inbox, thread, customer presence, team heartbeat"
```

---

## Task 24: Send catalogues, spec sheets & images

"Here is the spec sheet" is a core sales move for someone selling display hardware, so the console gets **two** ways to do it (spec §4.1): a **quick-send link** (free, keeps the visitor on-site) and a real **file upload**.

**Files:**
- Create: `lib/chat/uploadAttachment.ts`
- Create: `components/admin/chat/LinkPicker.tsx`
- Create: `components/admin/chat/AttachmentPicker.tsx`
- Modify: `components/admin/chat/ChatThread.tsx`

**Interfaces:**
- Consumes: `validateAttachment`, `ATTACHMENT_ACCEPT` (Task 4); `searchCatalogue`, `buildProductLink`, `buildSpecSheetLink`, `buildCatalogueLink` (Task 5); `getStorageClient` (Task 1); `sendReply` (Task 23).
- Produces:
  - `uploadAttachment(conversationId: string, file: File): Promise<ChatAttachment>` — throws on a rejected file.
  - `LinkPicker({ onPick }: { onPick: (link: ChatLink) => void })`
  - `AttachmentPicker({ conversationId, onUploaded, onError }: {...})`

- [ ] **Step 1: Write `lib/chat/uploadAttachment.ts`**

```ts
"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorageClient } from "@/lib/firebase/client";
import { validateAttachment } from "./attachments";
import type { ChatAttachment } from "./types";

/**
 * Upload an agent attachment (spec §4.1 B).
 *
 * The validate() call here is a KINDNESS, not the control: it fails fast with a
 * readable message instead of making the agent wait on an upload that Storage
 * will reject anyway. storage.rules is the actual boundary — it re-checks the
 * size and the MIME allow-list, and it refuses non-agents outright.
 *
 * Path is scoped per conversation so the read rule can authorise the owner:
 *   chat-attachments/{conversationId}/{messageId}/{filename}
 * We do not have the messageId yet (the message is written after the upload), so
 * a random segment stands in — the rules only care about the conversationId.
 */
export async function uploadAttachment(conversationId: string, file: File): Promise<ChatAttachment> {
  const check = validateAttachment({ name: file.name, size: file.size, type: file.type });
  if (!check.ok) throw new Error(check.reason);

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const key = crypto.randomUUID();
  const path = `chat-attachments/${conversationId}/${key}/${safeName}`;

  const storageRef = ref(getStorageClient(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  return { url, name: file.name, mime: file.type, size: file.size };
}
```

- [ ] **Step 2: Write `components/admin/chat/AttachmentPicker.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { ATTACHMENT_ACCEPT } from "@/lib/chat/attachments";
import { uploadAttachment } from "@/lib/chat/uploadAttachment";
import type { ChatAttachment } from "@/lib/chat/types";

export default function AttachmentPicker({
  conversationId,
  onUploaded,
  onError,
}: {
  conversationId: string;
  onUploaded: (attachment: ChatAttachment) => void;
  onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset immediately so picking the SAME file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      onUploaded(await uploadAttachment(conversationId, file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label="Attach a file"
        title="Attach a PDF or image (max 10 MB)"
        className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
      </button>
    </>
  );
}
```

- [ ] **Step 3: Write `components/admin/chat/LinkPicker.tsx`**

```tsx
"use client";

import { useState } from "react";
import { FileText, Link2, X } from "lucide-react";
import { searchCatalogue, buildProductLink, buildSpecSheetLink, buildCatalogueLink } from "@/lib/chat/links";
import type { ChatLink } from "@/lib/chat/types";

/**
 * Quick-send links (spec §4.1 A) — search the catalogue, send a product page or
 * its spec sheet as a titled card. The cheapest path: no upload, no egress, and
 * the visitor lands back on-site where the lead gate and PostHog still apply.
 */
export default function LinkPicker({ onPick }: { onPick: (link: ChatLink) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const hits = searchCatalogue(query);

  const send = (link: ChatLink) => {
    onPick(link);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Send a product link or spec sheet"
        aria-expanded={open}
        title="Send a product link or spec sheet"
        className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors"
      >
        <Link2 size={16} />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-10 w-80 max-w-[calc(100vw-32px)] bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => send(buildCatalogueLink())}
            className="w-full text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-2 transition-colors"
          >
            📚 Send the full catalogue
          </button>

          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {hits.map((product) => (
              <li key={product.id} className="py-2">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{product.name}</p>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => send(buildProductLink(product))}
                    className="flex-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    Product page
                  </button>
                  <button
                    type="button"
                    onClick={() => send(buildSpecSheetLink(product))}
                    className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <FileText size={11} /> Spec sheet
                  </button>
                </div>
              </li>
            ))}
            {query.trim() && hits.length === 0 && (
              <li className="py-3 text-xs text-gray-400 text-center">No products match.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Put both into the composer in `components/admin/chat/ChatThread.tsx`**

Add the imports, an `uploadError` state, and the two pickers to the composer row. Both send **immediately** on pick — an attachment does not wait for the agent to also type something.

```tsx
import AttachmentPicker from "./AttachmentPicker";
import LinkPicker from "./LinkPicker";
import type { ChatAttachment, ChatLink } from "@/lib/chat/types";

// …inside the component:
  const [uploadError, setUploadError] = useState("");

  const sendAttachment = async (attachment: ChatAttachment) => {
    setUploadError("");
    await sendReply({ text: draft.trim(), attachment }).catch(() =>
      setUploadError("Could not send that file.")
    );
    setDraft("");
  };

  const sendLink = async (link: ChatLink) => {
    await sendReply({ text: draft.trim(), link }).catch(() => {});
    setDraft("");
  };
```

Replace the composer `<form>` with:

```tsx
      <div className="border-t border-gray-200 shrink-0">
        {uploadError && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 px-4 py-2">
            {uploadError}
          </p>
        )}
        <form onSubmit={handleSend} className="p-3 flex items-center gap-2">
          <LinkPicker onPick={sendLink} />
          <AttachmentPicker
            conversationId={conversation.id}
            onUploaded={sendAttachment}
            onError={setUploadError}
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_MESSAGE_LEN}
            placeholder="Reply…"
            aria-label="Reply"
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
          <button
            type="submit"
            disabled={!isSendable({ text: draft })}
            aria-label="Send reply"
            className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
```

- [ ] **Step 5: Verify both paths end-to-end**

With the two windows from Task 23:
- **Link:** click 🔗, search "QB65" (or any product), send **Spec sheet**. A titled card appears in **both** threads. Clicking it in the customer's thread opens the PDP and the spec-sheet PDF downloads automatically (the `?download=spec` handler from Task 5).
- **File:** click 📎, pick a PDF. It appears as a download card in both threads. Pick a PNG — it renders **inline**.
- **Rejected:** pick a `.zip` (or rename one). The composer shows *"Only PDF, PNG, JPEG and WebP files can be sent."* and nothing uploads.
- **Oversized:** pick a file over 10 MB. It is refused with the size message.

- [ ] **Step 6: Commit**

```bash
npm test
git add lib/chat/uploadAttachment.ts components/admin/chat
git commit -m "feat(chat): send catalogues, spec sheets and images (upload + quick-send links)"
```

---

## Task 25: WhatsApp the customer, from the console

One click, pre-filled with context (spec §6.3). This is the escape hatch for "the customer left and I need them *now*".

**Files:**
- Modify: `components/admin/chat/ChatThread.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppUrlTo` (Task 6).
- Produces: no new exports.

- [ ] **Step 1: Add the button to the thread header**

```tsx
import { buildWhatsAppUrlTo } from "@/lib/whatsapp";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";

// …inside the component, above the return:

  // "Hi Rahul, following up on your chat about…" — the context line is the whole
  // point: a bare "hi" from an unknown number gets ignored.
  const firstName = (conversation.customer.name || "").trim().split(/\s+/)[0];
  const waHref = buildWhatsAppUrlTo(
    conversation.customer.phone,
    `Hi${firstName ? ` ${firstName}` : ""}, following up on your chat with Aplus Technology Solutions about ${
      conversation.lastPreview || "your enquiry"
    }`
  );
```

In the header's action group, before the Call link:

```tsx
          {/* null when the phone cannot be normalised — hide rather than open a
              broken wa.me link (lib/whatsapp.ts: buildWhatsAppUrlTo). */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp the customer"
              title="WhatsApp the customer"
              className="p-2 text-gray-400 hover:text-[#25D366] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d={WA_PATH} />
              </svg>
            </a>
          )}
```

- [ ] **Step 2: Verify**

In the console, open a conversation whose customer gave a phone number. Click the WhatsApp icon: it opens `wa.me/91…` addressed to **the customer's** number (not the business number), pre-filled with the context line. Then confirm a conversation with a junk phone value shows **no** WhatsApp icon rather than a dead link.

- [ ] **Step 3: Commit**

```bash
npm test
git add components/admin/chat/ChatThread.tsx
git commit -m "feat(chat): one-click WhatsApp to the customer with conversation context"
```

---

## Task 26: Privacy policy

Chat messages, a visitor's presence, and their current page tied to an identifier are **personal data** under DPDP/GDPR. The spec says the policy update **ships with the feature** (§9) — not later.

**Files:**
- Modify: `app/privacy/page.tsx`

- [ ] **Step 1: Read the existing page and match its structure**

Read [app/privacy/page.tsx](../../../app/privacy/page.tsx) and add a section in the **same** component/heading style the page already uses. Content to cover:

- **What live chat collects:** the name, email and phone you enter in the chat form; the messages you send; the page you are on and whether the chat window is open; a random anonymous identifier stored in your browser so your conversation is still yours when you come back.
- **What it is used for:** replying to you, and sales follow-up. Nothing else. It is not sold or shared.
- **Where it goes:** Google Firebase (Firestore/Storage), our email (Resend), and our CRM (Zoho) — the same destinations the existing contact form already uses.
- **Retention:** chat conversations are kept for as long as we are doing business with you; the presence record is short-lived.
- **How to have it deleted:** email `info@aplustechsol.com`.

Do **not** claim a 90-day visitor TTL yet — that policy belongs to the journey/geo data added in Phase 3 (see Task 9, Step 11). Say only what Phase 1 actually does.

- [ ] **Step 2: Verify and commit**

Run: `npm run build`
Expected: success; `/privacy` renders the new section.

```bash
git add app/privacy/page.tsx
git commit -m "docs(privacy): disclose live-chat data collection and retention"
```

---

## Task 27: Runtime verification

The unit tests cover the pure logic; **none** of them cover the thing the user actually asked for. This task is where that gets proven. Use the `verify` skill.

**Files:** none — this is a verification pass.

- [ ] **Step 1: Run the full suite and the build**

```bash
npm test
npm run test:rules
npm run lint
npm run build
```

Expected: all green. Do not proceed past a failure — fix it.

- [ ] **Step 2: Entry-point IA (spec §12)**

Invoke the `verify` skill, then check each:

- [ ] Desktop renders **exactly one** floating chat bubble bottom-right. Grep the DOM: the old green WhatsApp bubble is **gone, not hidden** (`components/ChatWidget.tsx` no longer exists).
- [ ] The panel's hero action flips between **"Chat now"** and **"Leave a message"** as the console opens and closes.
- [ ] The mobile sticky bar shows **four** buttons; every tap target is ≥44 px at 360 px width.
- [ ] `/quote` on mobile shows **Chat only**.
- [ ] The mobile bottom sheet is portaled to `<body>` and is **not clipped** by the navbar's `backdrop-filter`.
- [ ] The panel sits **above** the sticky bar (z-40) and **below** the cookie banner (z-300).

- [ ] **Step 3: The live round trip, two windows**

- [ ] Messages flow **both** directions in real time.
- [ ] Team presence flips to **"Team is away"** within 90 s of the console closing.
- [ ] Customer presence flips to **"Left just now"** within 90 s of the visitor's tab closing.
- [ ] Pre-chat submit produces the **email to `info@`** and the **Zoho lead** (`inquiry_type: "Website Live Chat"`).

- [ ] **Step 4: The safety net (spec §6) — the part that matters most**

- [ ] Send a customer message and **do not reply**. After 3 minutes the widget posts the system message *"Sorry — our team is tied up…"* with WhatsApp/Call buttons.
- [ ] The same moment, the conversation is flagged **`needsFollowUp`** and pinned **red** at the top of the console, and an **"⚠️ Unanswered chat"** email lands at `info@`.
- [ ] **Do this with the console closed entirely** — it must still fire. That is the whole design (the customer's own browser triggers it). If it only works with a console open, the feature is broken.

- [ ] **Step 5: Reaching a customer who left (spec §6.3)**

- [ ] Close the customer's tab. Reply from the console. An email arrives with the reply text and a **"Reply in the chat"** button.
- [ ] Open that link **in a different browser** (no existing session). It lands in the **same thread**, with the full history.
- [ ] Send two more replies quickly: they collapse into **at most one** further email (2-minute debounce).
- [ ] The **WhatsApp** button opens the **customer's** number, pre-filled.

- [ ] **Step 6: Attachments (spec §4.1)**

- [ ] Agent sends a PDF → download card on both sides. A PNG → inline image.
- [ ] Agent sends a **spec-sheet link** → card on both sides; clicking it downloads the PDF from the PDP.
- [ ] A `.zip` and an 11 MB file are both **refused**.
- [ ] Sending an attachment to an **offline** customer includes it in the reply email.

- [ ] **Step 7: Degradation (spec §11)**

- [ ] Blank the `NEXT_PUBLIC_FIREBASE_*` vars and reload. The widget still opens, shows an error, and still offers **WhatsApp / QR / phone / email**. The site does not break.

- [ ] **Step 8: Commit any fixes, then finish the branch**

```bash
git add -A
git commit -m "fix(chat): runtime verification findings"
```

Then use `superpowers:finishing-a-development-branch`.

---

## Deferred to later phases (do NOT build here)

| Thing | Phase | Why not now |
|---|---|---|
| FCM push, service worker, `agentDevices` fan-out, `/api/chat/notify`, iOS PWA manifest | 2 | The console's in-app alerts + the escalation email cover Phase 1. `agentDevices` and the `status/team` rules are already in place as the seam. |
| Journey, `productsViewed`, IP/city/referrer, `/api/visitor/session`, live-visitors panel, proactive chat, the 90-day `visitors` TTL | 3 | Phase 1's `visitors` doc holds presence only. Do not configure the TTL policy yet. |
| WhatsApp ping to the salesperson (Meta Cloud API template) | 4 | Gated on Meta's business-verification queue, not on our code. Start the paperwork in parallel. |
| Typing indicators, seen receipts, canned replies, multi-agent routing, transcript export, AI auto-answer, customer-side upload | — | Spec §14 non-goals. |

---

## Self-review

**Spec coverage** — every numbered requirement in spec §12a maps to a task:

| # | Requirement | Task |
|---|---|---|
| 1, 2 | Interactive chatbox; real-time two-way | 13, 16, 23 |
| 3 | Customer can chat on mobile **and** laptop | 17, 18 |
| 4 | Enquiry received in real time on mobile and laptop | 23 (responsive console) |
| 5, 6, 15 | Per-person threads, told apart, keyed on the anon uid | 2, 9, 13, 23 |
| 12 | Both sides see live/offline | 3, 13, 23 |
| 13 | What happens if nobody replies | 3, 19 (+ 27 Step 4) |
| 11 | Chats must not vanish on holiday | 13 (email + Zoho at start), 19 |
| 14 | Don't confuse users with two widgets | 17, 18 |
| 16 | Send catalogues / spec sheets / images | 4, 5, 24 |
| 17 | Salesperson need not sit on the site | 19 (escalation email) + 23; **fully** met in Phase 2 (push) |
| 7, 8, 9 | Products viewed, pages visited, city | **Phase 3** |
| 10, 18 | Push when nothing is open; WhatsApp ping | **Phase 2 / Phase 4** |

**Known gaps, called out rather than hidden:**
- Requirement 17 is only *partly* met in Phase 1 — the salesperson still has to open the console or watch email. Push (Phase 2) is what completes it. Ship Phase 2 promptly.
- The escalation timer compares a **client** `Date.now()` against **server** timestamps. A badly-skewed client clock could escalate early or late. Acceptable at this scale; revisit if it misbehaves.
- `firstSeenAt` is re-stamped once per page load rather than truly once per visitor (Task 13). Harmless until Phase 3 reads it; tighten there.

