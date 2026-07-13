# Live two-way chat (real-time, mobile + laptop) — Design

**Date:** 2026-07-14
**Status:** Approved (design), pending implementation plan
**Scope owner:** customer `ChatWidget` + new agent inbox at `/admin/chat` + Firebase backend
**Supersedes/extends:** [2026-07-13-chat-lead-capture-design.md](2026-07-13-chat-lead-capture-design.md)
(that spec explicitly parked "live two-way chat … requires a datastore + auth …
their own project"; this is that project)

## Problem

Today a website visitor can *leave a message* (name/email/phone/message → email +
Zoho lead) or open WhatsApp, but there is no **live conversation**: the visitor
sends, then waits for a follow-up by email/WhatsApp later. The business wants a
real back-and-forth chat on the site — the customer types, an agent sees it
**in real time** and replies **live**, from either a **phone or a laptop**, and
is **alerted even when the site/inbox is not open**.

## Decisions locked in brainstorming

- **Experience:** live two-way chat (not just faster alerts).
- **Staffing:** someone is always watching during business hours (Mon–Sat 9–18,
  the existing `isOnline()` window). Live inbox, light in-app alerts, "online"
  shown to customers in-hours, away fallback out-of-hours.
- **Backend:** **Firebase** — chosen over Supabase because Firebase's free tier
  never pauses (a quiet week must not break chat). One platform for realtime,
  auth, and push.
- **Agent alerts:** **background push** to phone + laptop even when nothing is
  open, via **Firebase Cloud Messaging (FCM)**. iOS requires the inbox be
  "Added to Home Screen" once (Apple constraint) — Android + desktop work
  immediately.
- **Inbox URL:** `/admin/chat` (aligns with a future admin console).
- **Mobile entry:** add a **Chat launcher alongside** the existing WhatsApp/Call
  sticky bar — nothing removed.
- **Email backup:** yes — every new chat also emails `info@aplustechsol.com`
  (reusing the existing `/api/contact` pipeline) in addition to push + Zoho lead.

## What is already safe (do not rebuild)

- `POST /api/contact` → **Resend email + Zoho CRM lead** ([app/api/contact/route.ts](../../../app/api/contact/route.ts),
  [lib/zoho.ts](../../../lib/zoho.ts)). A chat is contact-shaped (no `items_list`)
  and carries name/email/phone/message, so it flows through unchanged with
  `inquiry_type: "Website Live Chat"`.
- `isOnline()` business-hours helper and the WhatsApp entry points in
  [components/ChatWidget.tsx](../../../components/ChatWidget.tsx) and
  [lib/whatsapp.ts](../../../lib/whatsapp.ts).
- Per-IP rate limit + honeypot in `/api/contact` ([lib/rateLimit.ts](../../../lib/rateLimit.ts)).

## Goal

A visitor on any device opens the chat, and after a one-step pre-chat form
(name/email/phone/message — the fields we already collect), holds a **live
conversation** with an agent. The agent answers from a responsive inbox on phone
or laptop and is **pushed a notification** the moment a chat arrives, even with
no tab open. Every conversation is **also captured as an email + Zoho lead** at
the moment it starts, so a missed live chat is never a lost lead.

## Architecture (one platform: Firebase)

```
Customer browser (widget)                 Agent browser (/admin/chat)
   │  anon auth, onSnapshot                   │  email/pw auth, onSnapshot
   ▼                                          ▼
        ┌──────────── Firestore ────────────┐
        │ conversations/{id}                 │  ← realtime to BOTH sides
        │ conversations/{id}/messages/{m}    │
        │ agentDevices/{token}               │
        └───────────────┬────────────────────┘
                        │ (customer sends message)
   customer browser ──▶ POST /api/chat/notify ──▶ FCM ──▶ push to agent devices
   pre-chat submit  ──▶ POST /api/contact     ──▶ Resend email + Zoho lead
```

- **Firestore** stores conversations/messages and streams live updates to both
  the widget and the inbox via `onSnapshot` listeners. No always-on server —
  works on the current Vercel-style serverless deploy.
- **Firebase Auth**: **anonymous** sign-in for customers (a visitor "owns" their
  conversation); **email/password** for agents, gated by a custom claim
  `agent: true`.
- **FCM** delivers background push to agent devices.
- **Firebase Admin SDK** (server) sends push from `/api/chat/notify` and sets the
  agent claim via a one-time script. No Cloud Functions / Blaze upgrade required.

## Data model (Firestore)

```
conversations/{conversationId}
  ownerUid        // customer's anonymous auth uid (ownership check in rules)
  customer        // { name, email, phone }
  page            // path the chat started on, e.g. "/products/…"
  status          // "open" | "closed"
  createdAt, lastMessageAt   // serverTimestamp
  lastPreview     // last message text (for the inbox list)
  lastSender      // "customer" | "agent"
  unreadForAgent  // number — drives inbox badge + whether to push

conversations/{conversationId}/messages/{messageId}
  sender          // "customer" | "agent"
  text            // capped length; trimmed
  createdAt       // serverTimestamp

agentDevices/{fcmToken}
  token, label, createdAt   // one doc per agent device/browser for push
```

Composite index: `conversations` where `status == "open"` ordered by
`lastMessageAt desc` (declared in `firestore.indexes.json`).

## Components

### 1. Firebase wiring (new)
- `lib/firebase/client.ts` — initialise app/auth/firestore/messaging (client,
  guarded to run once; messaging only in supported browsers).
- `lib/firebase/admin.ts` — initialise Admin SDK from service-account env vars
  (server only).
- `lib/chat/types.ts` — `Conversation`, `Message` types shared by both sides.

### 2. Customer widget — refactor [components/ChatWidget.tsx](../../../components/ChatWidget.tsx)
The **WhatsApp tab is unchanged** (Open WhatsApp Web + QR + quick chips +
phone/email). The **"Leave a message" tab becomes live chat**:
- **Pre-chat form** — Name/Email/Phone/Message (same contract as today; keeps
  the honeypot `company_website`, prefill via `getCachedLead()`). On submit:
  1. anonymous sign-in (if needed) → `ownerUid`;
  2. create `conversations/{id}` + write the first `message` (sender
     `"customer"`);
  3. fire `POST /api/contact` (`inquiry_type: "Website Live Chat"`) → **email +
     Zoho lead** (this *is* the email backup);
  4. `setCachedLead(...)`; `trackEvent("chat_started")`.
- **Live thread** — subscribe to the conversation's `messages` via `onSnapshot`;
  render customer/agent bubbles with timestamps; a composer sends new messages
  (each write also calls `/api/chat/notify`). Resumes on return visits via the
  persisted anon uid + `conversationId` in `localStorage`.
- **Online / away** — reuse `isOnline()`. In-hours: "Online — replies in
  minutes." Out-of-hours: still accepts messages, shows "We're away — we'll
  reply the next business day"; message is stored + agent pushed + emailed.
- Because this grows the file, split into: `components/chat/ChatWidget.tsx`
  (shell + tabs, keeps floating buttons), `components/chat/LiveChat.tsx`
  (pre-chat form + thread + composer), and `lib/chat/useConversation.ts` (all
  customer-side Firestore logic). Each stays small and testable.

### 3. Mobile entry — [components/MobileStickyCTA.tsx](../../../components/MobileStickyCTA.tsx)
Add a **Chat** launcher next to WhatsApp/Call that opens the same `LiveChat`
panel (the widget is currently desktop-only; live chat must work for phone
visitors). WhatsApp + Call stay exactly as they are.

### 4. Agent inbox — `app/admin/chat/` (new, responsive)
- **Login gate**: Firebase Auth email/password; verify the `agent: true` custom
  claim client-side (non-agents are redirected/blocked; rules enforce it
  server-side regardless).
- **Layout**: conversation list (open + unread first) + active thread + reply
  composer. Mobile = list → tap → thread; laptop = side-by-side. Shows customer
  name/email/phone + originating page.
- **Actions**: send reply (writes `message` sender `"agent"`, resets
  `unreadForAgent`), close/reopen conversation.
- **In-app alerts** (tab open): notification sound + tab-title badge + (if
  permission granted and focused) a `Notification`.
- `lib/chat/useInbox.ts` holds the agent-side Firestore logic.

### 5. Background push (FCM)
- `public/firebase-messaging-sw.js` — service worker; `onBackgroundMessage`
  shows the OS notification; clicking it opens `/admin/chat?c={conversationId}`.
- On inbox load (agent): request `Notification` permission, get the FCM token
  (using `NEXT_PUBLIC_FIREBASE_VAPID_KEY`), upsert into `agentDevices`.
- `app/api/chat/notify/route.ts` — POST `{ conversationId }`. Verifies the
  caller's Firebase ID token owns the conversation (Admin SDK), reads the
  conversation's customer name + last preview, and sends FCM to all
  `agentDevices` tokens. Rate-limited (reuse `lib/rateLimit.ts`); prunes tokens
  FCM reports as stale.
- **PWA for iOS push**: a minimal manifest scoped to `/admin/chat` so the inbox
  can be Added to Home Screen (required for push on iPhone). Android/desktop
  need no install.

### 6. Auth + security
- `firestore.rules`:
  - **customer** (anon): may read/write a conversation only where
    `resource.data.ownerUid == request.auth.uid`, and messages under it; may
    create a conversation only with their own `ownerUid`; message `text` length
    capped; cannot read `agentDevices` or other conversations.
  - **agent** (`request.auth.token.agent == true`): read/write all
    conversations, messages, and `agentDevices`.
- `scripts/set-agent-claim.mjs` — one-time Admin-SDK script to grant
  `agent: true` to an agent account (documented in the plan).
- **CSP** ([next.config.ts](../../../next.config.ts#L28)): add Firebase hosts.
  Expected additions (finalised against Firebase's current requirements during
  implementation):
  - `connect-src`: `https://*.googleapis.com https://firestore.googleapis.com
    https://fcm.googleapis.com https://firebaseinstallations.googleapis.com
    https://identitytoolkit.googleapis.com https://securetoken.googleapis.com
    https://*.gstatic.com`
  - `script-src`: `https://www.gstatic.com` (for the messaging service worker's
    `importScripts`, unless the SW is bundled instead)
  - `worker-src 'self' blob:` already present (SW is same-origin).
- **Abuse**: pre-chat honeypot (already dropped by `/api/contact`); per-IP limit
  on `/api/chat/notify`; per-conversation message-rate cap enforced in rules
  and/or client throttle.

### 7. Environment variables (new)
- **Client (public):** `NEXT_PUBLIC_FIREBASE_API_KEY`,
  `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
  `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- **Server (secret):** `FIREBASE_ADMIN_PROJECT_ID`,
  `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`.

## Data flow

```
Customer opens chat → pre-chat form (name/email/phone/message)
  └─▶ anon sign-in → create conversation + first message (Firestore)
        ├─▶ POST /api/contact ─▶ Resend email + Zoho lead   (backup, at start)
        └─▶ POST /api/chat/notify ─▶ FCM push ─▶ agent phone/laptop
Agent taps push / opens /admin/chat → sees thread live (onSnapshot)
  └─▶ replies → message (Firestore) ─▶ appears live in customer widget
Customer sends more → each ─▶ /api/chat/notify ─▶ push (until agent opens it)
```

## Error handling — never a dead end

- Firebase unreachable / permission error on send: show inline error and keep
  the WhatsApp Web / QR / phone / email fallbacks visible (same posture as the
  current widget). Chat degrades to the existing capture behaviour.
- `/api/chat/notify` failure is **non-fatal** — the message is already in
  Firestore and the agent's open inbox still updates live; the email + Zoho lead
  from chat-start already recorded the enquiry.
- Push permission denied / unsupported browser: inbox still works live with
  in-app sound + badge; push is an enhancement, not a dependency.
- iOS not installed to Home Screen: push silently unavailable there; email +
  in-app alerts still cover it. Inbox shows a one-time "Add to Home Screen for
  phone alerts" hint.

## Testing

- **Unit (Vitest):** conversation/message helpers (shape, text cap, preview);
  `isOnline()` behaviour at boundaries; `/api/chat/notify` route (mock Admin SDK
  + FCM — verifies ownership check, token fan-out, stale-token pruning).
- **Rules (Firestore emulator):** a customer cannot read another customer's
  conversation or `agentDevices`; an agent can; message length cap enforced.
- **Runtime (`verify` skill), two windows:** customer widget ↔ `/admin/chat`
  live round-trip (both directions); pre-chat submit creates email + Zoho lead;
  push arrives on a real device; mobile Chat launcher opens the panel; WhatsApp
  tab + `MobileStickyCTA` WhatsApp/Call unchanged.

## Scope

**In (MVP):** live two-way text chat on mobile + laptop; responsive agent inbox
at `/admin/chat`; FCM background push (with iOS PWA install); email + Zoho lead
on every chat start; online/away; Firestore security rules; CSP updates.

**Deferred (not now):** typing indicators; "seen" receipts to the customer;
real agent-presence (vs. business-hours online signal); file/image attachments;
canned replies; multi-agent assignment/routing; transcript export; AI
auto-answer; Firestore-trigger Cloud Function for push (API-route approach is
sufficient for MVP and avoids the Blaze plan).
