# Live two-way chat + sales console (real-time, mobile + laptop) — Design

**Date:** 2026-07-14
**Status:** Approved (design), pending implementation plan
**Scope owner:** customer `ChatWidget` + new sales console at `/admin/chat` + Firebase backend
**Supersedes/extends:** [2026-07-13-chat-lead-capture-design.md](2026-07-13-chat-lead-capture-design.md)
(that spec explicitly parked "live two-way chat … requires a datastore + auth …
their own project"; this is that project)

## Problem

Today a visitor can *leave a message* (name/email/phone/message → email + Zoho
lead) or open WhatsApp, but there is no **live conversation**. The business has a
**dedicated salesperson** working leads from this site, and the previous
WordPress build gave him a console showing visitor chats, each visitor's page
trail, and the products they browsed. The new Next.js site has no equivalent — so
we rebuild it, better.

He needs to: hold a **real-time two-way chat**; know **what the visitor browsed**
and **where they are**; be **alerted on phone and laptop even when nothing is
open**; **know whether the visitor is still there**; and — critically — **never
silently drop a chat** when he is at lunch or on holiday.

## Correction: the `/city/product` URLs were NOT geolocation

The old console showed visitors on URLs like `/mumbai/samsung-video-wall`, which
looked like the site was detecting the visitor's city. **It was not.** The old
WordPress site programmatically generated ~7,000 **local-SEO landing pages**:

```
// Local SEO pages: /{city}/{product-slug}/  and  /{role}/{product-slug}/
```
— [lib/redirects.ts:5](../../../lib/redirects.ts#L5)

A visitor on `/mumbai/samsung-video-wall` simply means **Google sent them to the
Mumbai page**. The city came from the *landing page*, not the visitor's IP.

Consequences:
1. Those clone pages **no longer exist** (301'd to `/products/{slug}` + 95
   `/[city]` hubs), so the city-in-URL signal largely disappears. Do not rebuild a
   design that depends on it.
2. We capture the visitor's **real city via IP geolocation** instead — strictly
   better than the old console had.

## Decisions locked in brainstorming

- **Experience:** live two-way chat (not just faster alerts).
- **Backend:** **Firebase** — its free tier never pauses (a quiet week must not
  break chat). One platform for realtime, auth, push.
- **Agent alerts:** background push via **FCM**, fanned out to **multiple
  devices** (salesperson's phone + laptop, plus the owner's) so a hot lead is
  never stranded when one person is away. iOS needs a one-time "Add to Home
  Screen"; Android + desktop work immediately.
- **Console URL:** `/admin/chat`.
- **Mobile entry:** a **Chat launcher alongside** the existing WhatsApp/Call
  sticky bar — nothing removed.
- **Presence:** **real presence, both directions** (see §5). Not business hours.
- **No-reply safety net:** layered — see §6.
- **Customer offline when the agent replies:** **auto-email the reply** + a
  one-click **WhatsApp** button in the console (see §6.3).
- **Visitor intelligence:** live visitor list + proactive chat + journey
  enrichment (see §7).

## What is already safe (do not rebuild)

- `POST /api/contact` → **Resend email + Zoho CRM lead**
  ([app/api/contact/route.ts](../../../app/api/contact/route.ts),
  [lib/zoho.ts](../../../lib/zoho.ts)). A chat is contact-shaped (no
  `items_list`), so it flows through unchanged with
  `inquiry_type: "Website Live Chat"`.
- WhatsApp entry points ([lib/whatsapp.ts](../../../lib/whatsapp.ts)) and the
  WhatsApp tab of [components/ChatWidget.tsx](../../../components/ChatWidget.tsx).
- Per-IP rate limit + `clientIp()` ([lib/rateLimit.ts](../../../lib/rateLimit.ts))
  — reused by every new route.
- **PostHog** stays the analytics system of record. Our visitor tracking is
  **sales context, not analytics** — scoped, TTL'd, not a second warehouse.

## Goal

A visitor on any device holds a **live conversation** with the salesperson, who
sees **who is on the site now**, **what they browsed**, **where they are**, and
**whether they are still watching** — and can **start the chat himself**. He is
pushed a notification the moment a chat arrives, even with nothing open. When
nobody can reply, the customer is **told honestly**, the lead is **captured
anyway**, and the chat is **flagged so it cannot be forgotten**.

## 1. Architecture (one platform: Firebase)

```
Customer browser (widget)                    Console (/admin/chat)
   │ anon auth · onSnapshot                     │ email/pw auth (agent claim)
   │ page tracker · heartbeat                   │ onSnapshot · heartbeat
   ▼                                            ▼
        ┌──────────────── Firestore ────────────────┐
        │ visitors/{visitorId}   (presence, journey)│ ← realtime to BOTH sides
        │ conversations/{id}                        │
        │ conversations/{id}/messages/{m}           │
        │ agentDevices/{token}   (push targets)     │
        │ status/team            (team presence)    │
        └───────────────┬───────────────────────────┘
                        │
 customer sends    ──▶ POST /api/chat/notify      ──▶ FCM ──▶ push ALL devices
 3-min no reply    ──▶ POST /api/chat/escalate    ──▶ flag + push + email
 agent replies     ──▶ POST /api/chat/reply-email ──▶ Resend (if cust. offline)
 email link click  ──▶ GET  /api/chat/resume      ──▶ custom token → resume chat
 first page view   ──▶ POST /api/visitor/session  ──▶ IP + city (Admin SDK)
 chat starts       ──▶ POST /api/contact          ──▶ Resend email + Zoho lead
```

No always-on server — works on the serverless (Vercel) deploy. **Firestore**
streams live updates both ways; **Firebase Auth** gives customers anonymous
identity and agents email/password + an `agent: true` claim; **FCM** delivers
push; the **Admin SDK** runs in the API routes.

> **Deployment dependency:** IP-geolocation uses edge geo headers
> (`x-vercel-ip-city`, `x-vercel-ip-country-region`, `x-vercel-ip-country`),
> which exist on Vercel; the site is migrating there. Off-Vercel, city degrades
> to "Unknown" — **chat and presence are unaffected**.

## 2. Data model (Firestore)

```
visitors/{visitorId}              // visitorId = anonymous auth uid
  firstSeenAt, lastSeenAt         // lastSeenAt ⇒ "is the customer still here?"
  currentPage                     // path they are on right now
  chatOpen        (bool)          // widget panel open ⇒ they are watching
  journey    [{ path, title, productId?, at }]   // capped to last 30   (P3)
  productsViewed [productId]      // deduped "interested in" chips        (P3)
  ip, city, region, country       // edge geo headers (server-written)    (P3)
  referrer, utm                   // "arrived from Google"                (P3)

conversations/{conversationId}
  visitorId       // → visitors/{id}: presence + journey beside the chat
  ownerUid        // customer's anon uid (ownership check in rules)
  customer        // { name, email, phone }
  startedBy       // "customer" | "agent"   (agent ⇒ proactive chat)
  page            // path the chat started on
  status          // "open" | "closed"
  needsFollowUp   // bool — set by escalation, cleared on agent reply
  createdAt, lastMessageAt, lastPreview, lastSender
  unreadForAgent  // number — drives badge + push

conversations/{conversationId}/messages/{messageId}
  sender          // "customer" | "agent" | "system"
  text, createdAt
  emailedAt       // set when an agent reply was emailed to an offline customer

agentDevices/{fcmToken}
  token, label, agentUid, createdAt   // one doc per device → multi-device push

status/team                       // single public-read doc
  onlineUntil                     // heartbeat from any open console
```

Indexes: `conversations` (`status` == open, order `lastMessageAt` desc);
`visitors` (order `lastSeenAt` desc).
**TTL policy:** auto-delete `visitors` docs after **90 days**.

## 3. Customer widget — refactor [components/ChatWidget.tsx](../../../components/ChatWidget.tsx)

The **WhatsApp tab is unchanged**. The **"Leave a message" tab becomes live chat**:

- **Pre-chat form** — Name/Email/Phone/Message (same contract as today; keeps the
  `company_website` honeypot and `getCachedLead()` prefill). On submit:
  1. anonymous sign-in → `ownerUid` / `visitorId`;
  2. create `conversations/{id}` (linked to `visitorId`) + write the first message;
  3. `POST /api/contact` (`inquiry_type: "Website Live Chat"`) → **email + Zoho
     lead** (the durable backup);
  4. `POST /api/chat/notify` → push to all agent devices;
  5. `setCachedLead(...)`, `trackEvent("chat_started")`.
- **Live thread** — `onSnapshot` on `messages`; customer/agent/system bubbles;
  composer (each send also calls `/api/chat/notify`). Resumes across pages/visits
  via the persisted anon uid.
- **Team presence** — 🟢 *"Sales team is online — replies in minutes"* / ⚫ *"Team
  is away — we'll reply on WhatsApp/email"*, driven by `status/team` (§5).
- **Unanswered timeout** — 3 min after a customer message with no agent reply →
  writes a `system` message and calls `/api/chat/escalate` (§6).
- **Proactive chat inbound** — the widget subscribes for a conversation owned by
  its `visitorId` *even before the visitor starts one*, so an agent-initiated
  chat **pops the widget open** with the agent's opening line. (P3)
- **Heartbeat** — sets `chatOpen` while the panel is open; the visitor tracker
  heartbeats `lastSeenAt`/`currentPage` while the tab is visible (§5).
- **Split for size:** `components/chat/ChatWidget.tsx` (shell + tabs + floating
  buttons), `components/chat/LiveChat.tsx` (pre-chat form + thread + composer),
  `lib/chat/useConversation.ts` (customer-side Firestore logic).

**Mobile:** add a **Chat** launcher to
[components/MobileStickyCTA.tsx](../../../components/MobileStickyCTA.tsx) beside
WhatsApp/Call (the widget is desktop-only today; phone visitors must be able to
chat). WhatsApp + Call untouched.

## 4. Sales console — `app/admin/chat/` (new, responsive)

- **Login** — Firebase Auth email/password, requires the `agent: true` claim
  (enforced in rules, not just UI). Multiple agent accounts (salesperson + owner).
- **Conversations** — unread/open first; **`needsFollowUp` pinned in red**; thread;
  reply composer; close/reopen.
- **Customer presence, per conversation (§5)** — 🟢 *"Online — viewing QB65
  Signage"* / ⚫ *"Left 6 minutes ago"*. Tells him whether to keep typing or pick
  up the phone.
- **Lead context beside the chat** — journey (page trail), products viewed,
  city/region, IP, referrer. *(P3; name/email/phone/page available from P1.)*
- **[WhatsApp customer]** — one click, pre-filled with conversation context (§6.3).
- **Live visitors panel** — who is on the site right now, with a **[Chat]** button
  to open a proactive conversation. *(P3)*
- **Layout** — mobile: list → tap → thread; laptop: side-by-side.
- **In-app alerts** — sound + tab-title badge while open.
- **Heartbeat** — writes `status/team.onlineUntil = now + 90s` while open.
- `lib/chat/useInbox.ts`, `lib/chat/useLiveVisitors.ts`.

## 5. Presence — both directions

Business hours (Mon–Sat 9–18) **cannot** know about holidays, lunch, or sick
days, so scheduled presence is dropped. Presence is **measured**, and it flows
**both ways**:

| Who | Sees | Source | Rule |
|---|---|---|---|
| **Customer** → team | 🟢 online / ⚫ away | `status/team.onlineUntil` | Online iff a console is open and heart-beating (90s window). |
| **Agent** → customer | 🟢 on site (+ current page) / ⚫ left N min ago | `visitors/{id}.lastSeenAt`, `currentPage`, `chatOpen` | Online iff `lastSeenAt` within 90s. `chatOpen` distinguishes *watching the chat* from *browsing elsewhere*. |

- Console heartbeat: every ~45s while open; on unload it lets `onlineUntil`
  lapse (fail-safe — a crashed tab correctly decays to "away" in 90s).
- Visitor heartbeat: every ~45s **only while the tab is visible** (saves quota).
- The customer's `lastSeenAt`/`currentPage` heartbeat is **Phase 1** (it powers
  agent→customer presence); the richer journey/geo built on the same doc is
  Phase 3.

## 6. The no-reply safety net

A live chat nobody answers is **worse than no chat**. Layered so no single failure
loses the customer *or* the lead:

### 6.1 Timeline

| Moment | Behaviour |
|---|---|
| Before they type | If no console is open, widget already shows **"Team is away"** — expectation set. |
| The instant they send | Message → Firestore; **email to `info@`**; **Zoho lead**; **push to every device**. *The lead exists before anyone replies.* |
| 3 min, no agent reply | Widget posts a `system` message: *"Sorry — our team is tied up. We have your details and will reply on WhatsApp/email shortly,"* + WhatsApp/Call buttons. |
| Same moment | `POST /api/chat/escalate` → sets `needsFollowUp`, sends an **escalation push** to all devices, and emails `info@` ("⚠️ Unanswered chat"). |
| Customer leaves | Conversation waits unread with full history; name/email/phone already captured. |
| Holiday / never opened | It is a database row. Still unread, still in email, still in Zoho. Nothing expires. |
| Agent finally replies | `needsFollowUp` cleared; if the customer is offline → §6.3. |

**The escalation is triggered by the waiting customer's own browser**, so it fires
**even when no console is open** — no cron job, no paid plan. The route verifies
conversation ownership and is rate-limited.

### 6.2 Never a dead end for the customer
Every "away"/timeout state surfaces the **WhatsApp Web / QR / phone / email**
fallbacks already in the widget. The customer always has another route to a human.

### 6.3 Agent replies after the customer has left
- **Auto-email the reply** (Resend): subject *"Re: your chat with Aplus
  Technology Solutions"*, the reply text, and a **signed resume link** back into
  the live chat. Fired only when the customer is offline (`lastSeenAt` > 90s);
  consecutive agent messages are debounced into one email (≤1 per 2 min per
  conversation). Sets `emailedAt` on the message.
- **Resume link** — `/api/chat/resume?c={id}&token={hmac}` verifies an HMAC
  (`CHAT_RESUME_SECRET`) and mints a Firebase **custom token** for the
  conversation's `ownerUid`, so the customer resumes the *same* thread even on a
  different device/browser. Without this, rules would (correctly) lock them out.
- **[WhatsApp customer]** in the console — `buildWhatsAppUrlTo(phone, message)`
  (new helper; existing helpers only target the *business* number) with the
  customer's phone normalised to E.164 (default +91) and a pre-filled context
  line: *"Hi Rahul, following up on your chat about the QB65…"*.

## 7. Visitor intelligence (Phase 3)

- **Identity: not IP.** IP is a poor key (one office IP = many people; WiFi→4G =
  two "visitors"). We key on the **anonymous auth uid**; IP is recorded only as
  *context*.
- **Journey** — `lib/visitor/useVisitorTracker.ts` records each page view
  (`path`, `title`, `productId` on PDPs) into `visitors/{visitorId}`, capped to
  the last 30, plus a deduped `productsViewed`.
- **Geo + IP + referrer** — the client cannot see its own IP. Once per session it
  calls `POST /api/visitor/session`, which reads `clientIp(req)` + the edge geo
  headers and writes `ip`/`city`/`region`/`country`/`referrer`/`utm` via the Admin
  SDK. One call per session.
- **Live visitors panel + proactive chat** — agent opens a conversation
  (`startedBy: "agent"`) for a visitor on the live list; their widget pops open.
- **Bots** — crawlers (a large share of traffic, given ~7,500 indexed URLs) run no
  JS, so client-side tracking excludes them naturally.

## 8. Push notifications (FCM, multi-device)

- `public/firebase-messaging-sw.js` — service worker; `onBackgroundMessage` shows
  the OS notification; clicking opens `/admin/chat?c={conversationId}`.
- On console load: request permission, fetch the FCM token
  (`NEXT_PUBLIC_FIREBASE_VAPID_KEY`), upsert into `agentDevices` (one doc per
  device, tagged with `agentUid` + friendly label).
- `app/api/chat/notify/route.ts` — POST `{ conversationId }`. Verifies the caller's
  ID token owns the conversation, reads customer name + preview + city, **fans out
  to every `agentDevices` token**, prunes stale tokens. Rate-limited. Failure is
  **non-fatal** (message stored; email + Zoho already sent).
- `app/api/chat/escalate/route.ts` — same fan-out with an "⚠️ Unanswered" payload,
  plus `needsFollowUp` and an email to `info@`.
- **iOS** — minimal PWA manifest scoped to `/admin/chat` so it can be Added to
  Home Screen (required for push on iPhone). Android/desktop need no install.

## 9. Security, privacy & cost

**Firestore rules**
- *customer (anon)*: read/write only the conversation where
  `resource.data.ownerUid == request.auth.uid`, and its messages (may create only
  `sender: "customer"`/`"system"`, length-capped). Read/write only their **own**
  `visitors/{visitorId}` doc. **Cannot** read other conversations, other visitors,
  or `agentDevices`.
- *agent (`request.auth.token.agent == true`)*: read/write all conversations,
  messages, visitors, `agentDevices`, `status/team`.
- *public*: read-only `status/team` (leaks no UIDs).
- `scripts/set-agent-claim.mjs` — one-time Admin-SDK script granting `agent: true`.

**CSP** ([next.config.ts](../../../next.config.ts#L28)) — add Firebase hosts:
- `connect-src`: `https://*.googleapis.com https://firestore.googleapis.com
  https://fcm.googleapis.com https://firebaseinstallations.googleapis.com
  https://identitytoolkit.googleapis.com https://securetoken.googleapis.com
  https://*.gstatic.com`
- `script-src`: `https://www.gstatic.com` (messaging SW `importScripts`, unless the
  SW is bundled)
- `worker-src 'self' blob:` already present (SW is same-origin).

**Privacy (DPDP / GDPR)** — IP + browsing journey tied to a visitor is personal
data. Mitigations: **90-day TTL** on `visitors`; used only for sales follow-up;
**privacy-policy update** covering chat + visitor tracking. Ships with the feature.

**Cost** — Firestore free tier: 20k writes/day, 50k reads/day, 1 GiB. Estimated
~8–10 writes/visitor (session + page views + heartbeats). Mitigations already in
the design: heartbeat only while the tab is visible; journey capped at 30; session
written once; bots excluded. Overage is ~$0.18/100k writes — cheap, but **worth
watching** given the site's large SEO surface.

**Abuse** — pre-chat honeypot; per-IP limits on every new route; message-rate cap
in rules; `escalate`/`notify`/`reply-email` all verify conversation ownership.

## 10. Environment variables (new)

- **Client (public):** `NEXT_PUBLIC_FIREBASE_API_KEY`,
  `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
  `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- **Server (secret):** `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`,
  `FIREBASE_ADMIN_PRIVATE_KEY`, `CHAT_RESUME_SECRET`.

## 11. Error handling — never a dead end

- Firebase unreachable / rules error: inline error, WhatsApp Web / QR / phone /
  email fallbacks stay visible. Chat degrades to today's capture behaviour.
- `/api/chat/notify` or `/escalate` fails: **non-fatal** — the message is stored,
  the console still updates live, and the chat-start email + Zoho lead already
  landed.
- `/api/chat/reply-email` fails: reply still lives in the thread; console still
  offers the WhatsApp button.
- `/api/visitor/session` fails: presence + chat unaffected; city shows "Unknown".
- Push denied/unsupported: console still updates live in-app; push is an
  enhancement, not a dependency.
- iOS not Added to Home Screen: push unavailable there; email + in-app alerts
  cover it; console shows a one-time hint.

## 12. Testing

- **Unit (Vitest):** message/conversation helpers (shape, cap, preview); presence
  boundary logic (`onlineUntil`, `lastSeenAt` 90s); unanswered-timeout timer;
  reply-email debounce; `buildWhatsAppUrlTo` + E.164 normalisation (incl. missing
  +91); HMAC resume-token sign/verify (and rejection of a tampered token);
  `/api/chat/notify` (mock Admin SDK — ownership check, multi-device fan-out,
  stale-token pruning); `/api/visitor/session` (geo headers → doc; missing headers
  → "Unknown").
- **Rules (Firestore emulator):** a customer cannot read another customer's
  conversation, another visitor's doc, or `agentDevices`; cannot forge
  `sender: "agent"`; an agent can; `status/team` is public-read, not public-write.
- **Runtime (`verify` skill), two windows:** live round-trip both directions;
  team presence flips to "Away" when the console closes; customer presence flips
  to "Left" when the visitor's tab closes; the 3-min timeout posts the system
  message **and** flags `needsFollowUp` red in the console; agent reply to an
  offline customer sends the email, and its resume link reopens the same thread
  **in a different browser**; WhatsApp button opens the customer's number
  pre-filled; pre-chat submit produces email + Zoho lead; push lands on a real
  phone; mobile Chat launcher works; WhatsApp tab + `MobileStickyCTA` unchanged.

## 13. Phasing

Each phase ships independently and is useful on its own.

- **Phase 1 — Live chat core + two-way presence + safety net.** Firebase wiring +
  rules; widget live chat (desktop + mobile); console conversations; `status/team`
  presence; visitor `lastSeenAt`/`currentPage`/`chatOpen` heartbeat; unanswered
  timeout + `needsFollowUp`; email + Zoho on chat start; auto-email agent replies
  to offline customers (+ resume link) and the WhatsApp button.
- **Phase 2 — Push.** FCM + service worker + multi-device fan-out + escalation
  push + iOS PWA manifest.
- **Phase 3 — Visitor intelligence.** Journey, products viewed, IP/city/referrer,
  live visitors panel, proactive chat.

## 14. Non-goals (deferred)

Typing indicators; "seen" receipts for the customer; file/image attachments;
canned replies; multi-agent assignment/routing; transcript export; AI auto-answer;
a Firestore-trigger Cloud Function for push (the API-route approach suffices and
avoids the Blaze plan); rebuilding the old console's product-on/off, SEO, and
analytics tabs (separate project — PostHog covers analytics).
