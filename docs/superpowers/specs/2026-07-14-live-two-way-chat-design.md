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
WordPress build gave him a console where he could see visitor chats, each
visitor's page trail, and the products they browsed. The new Next.js site has no
equivalent — so we must rebuild it, better.

The salesperson needs to: hold a **real-time two-way chat**; know **what the
visitor was looking at** (which products/pages) and **where they are**; be
**alerted on phone and laptop even when nothing is open**; and — critically —
**never silently drop a chat** when he is at lunch or on holiday.

## Correction: the `/city/product` URLs were NOT geolocation

The old console showed visitors on URLs like `/mumbai/samsung-video-wall`, which
looked like the site was detecting the visitor's city. **It was not.** The old
WordPress site programmatically generated ~7,000 **local-SEO landing pages**:

```
// Local SEO pages: /{city}/{product-slug}/  and  /{role}/{product-slug}/
```
— [lib/redirects.ts:5](../../../lib/redirects.ts#L5)

So a visitor on `/mumbai/samsung-video-wall` simply means **Google sent them to
the Mumbai page**. The city came from the *landing page*, not the visitor's IP.

Two consequences:
1. Those clone pages **no longer exist** on the new site (301'd to
   `/products/{slug}` + 95 `/[city]` hubs), so that city-in-URL signal largely
   disappears. Do not rebuild a design that depends on it.
2. We now capture the visitor's **real city via IP geolocation** (edge geo
   headers) — strictly better than inferring it from a URL.

## Decisions locked in brainstorming

- **Experience:** live two-way chat (not just faster alerts).
- **Backend:** **Firebase** — chosen over Supabase because its free tier never
  pauses (a quiet week must not break chat). One platform for realtime, auth,
  push.
- **Agent alerts:** **background push** via **FCM**, fanned out to **multiple
  devices** (salesperson's phone + laptop, plus the owner's) so a hot lead is
  never stranded when one person is away. iOS requires a one-time "Add to Home
  Screen" (Apple constraint); Android + desktop work immediately.
- **Console URL:** `/admin/chat` (aligns with a future admin console).
- **Mobile entry:** add a **Chat launcher alongside** the existing WhatsApp/Call
  sticky bar — nothing removed.
- **Email backup:** every new chat also emails `info@aplustechsol.com` + creates
  a Zoho lead (reusing `/api/contact`), in addition to push.
- **Visitor intelligence:** live visitor list + proactive chat + per-chat journey
  enrichment (see §6).
- **Presence:** **real agent presence**, not business hours (see §5).

## What is already safe (do not rebuild)

- `POST /api/contact` → **Resend email + Zoho CRM lead**
  ([app/api/contact/route.ts](../../../app/api/contact/route.ts),
  [lib/zoho.ts](../../../lib/zoho.ts)). A chat is contact-shaped (no
  `items_list`), so it flows through unchanged with
  `inquiry_type: "Website Live Chat"`.
- WhatsApp entry points ([lib/whatsapp.ts](../../../lib/whatsapp.ts)) and the
  WhatsApp tab of [components/ChatWidget.tsx](../../../components/ChatWidget.tsx).
- Per-IP rate limit + `clientIp()` helper
  ([lib/rateLimit.ts](../../../lib/rateLimit.ts)) — reused for the new routes.
- **PostHog** ([posthog-js](../../../package.json)) remains the analytics system
  of record. Our visitor tracking is **sales context, not analytics** — scoped,
  TTL'd, and deliberately not a second analytics warehouse.

## Goal

A visitor on any device holds a **live conversation** with the salesperson, who
sees **who is on the site right now**, **what they browsed**, and **where they
are** — and can **start the chat himself**. He is pushed a notification the
moment a chat arrives, even with nothing open. When nobody is watching, the
widget **says so honestly** and the chat still becomes an email + Zoho lead.

## 1. Architecture (one platform: Firebase)

```
Customer browser (widget)                    Console (/admin/chat)
   │ anon auth · onSnapshot                     │ email/pw auth (agent claim)
   │ page-view tracker · heartbeat              │ onSnapshot · heartbeat
   ▼                                            ▼
        ┌──────────────── Firestore ────────────────┐
        │ visitors/{visitorId}      (journey, geo)  │ ← realtime to BOTH sides
        │ conversations/{id}                        │
        │ conversations/{id}/messages/{m}           │
        │ agentDevices/{token}      (push targets)  │
        │ status/team               (presence)      │
        └───────────────┬───────────────────────────┘
                        │
  customer sends  ──▶ POST /api/chat/notify   ──▶ FCM ──▶ push to ALL devices
  first page view ──▶ POST /api/visitor/session ──▶ IP + city (Admin SDK)
  chat starts     ──▶ POST /api/contact       ──▶ Resend email + Zoho lead
```

No always-on server — works on the serverless (Vercel) deploy. **Firestore**
streams live updates to both sides; **Firebase Auth** gives customers anonymous
identity and agents email/password + an `agent: true` custom claim; **FCM**
delivers background push; the **Admin SDK** runs in the API routes.

> **Deployment dependency:** IP-geolocation uses the host's edge geo headers
> (`x-vercel-ip-city`, `x-vercel-ip-country-region`, `x-vercel-ip-country`).
> These exist on Vercel; the site is migrating there. Off-Vercel, city degrades
> to "Unknown" (chat is unaffected) until a geo-IP source is substituted.

## 2. Data model (Firestore)

```
visitors/{visitorId}              // visitorId = anonymous auth uid
  firstSeenAt, lastSeenAt         // lastSeenAt drives the "live now" list
  currentPage                     // path they are on right now
  journey    [{ path, title, productId?, at }]   // capped to last 30
  productsViewed [productId]      // deduped, for a quick "interested in" chip
  ip, city, region, country       // from edge geo headers (server-written)
  referrer, utm                   // "arrived from Google" signal
  hasConversation  (bool)

conversations/{conversationId}
  visitorId       // links to visitors/{id} → journey + geo shown beside the chat
  ownerUid        // customer's anon uid (ownership check in rules)
  customer        // { name, email, phone }
  startedBy       // "customer" | "agent"   (agent ⇒ proactive chat)
  page            // path the chat started on
  status          // "open" | "closed"
  createdAt, lastMessageAt, lastPreview, lastSender
  unreadForAgent  // number — drives badge + whether to push

conversations/{conversationId}/messages/{messageId}
  sender          // "customer" | "agent" | "system"
  text, createdAt

agentDevices/{fcmToken}
  token, label, agentUid, createdAt   // one doc per device → multi-device push

status/team                       // single public-read doc
  onlineUntil                     // heartbeat from any open console
```

Indexes: `conversations` (`status` == open, order `lastMessageAt` desc);
`visitors` (order `lastSeenAt` desc).
**TTL policy:** auto-delete `visitors` docs after **90 days** (storage + privacy).

## 3. Customer widget — refactor [components/ChatWidget.tsx](../../../components/ChatWidget.tsx)

The **WhatsApp tab is unchanged**. The **"Leave a message" tab becomes live chat**:

- **Pre-chat form** — Name/Email/Phone/Message (same contract as today; keeps the
  `company_website` honeypot and `getCachedLead()` prefill). On submit:
  1. anonymous sign-in (if needed) → `ownerUid` / `visitorId`;
  2. create `conversations/{id}` (linked to `visitorId`) + write the first
     message;
  3. `POST /api/contact` (`inquiry_type: "Website Live Chat"`) → **email + Zoho
     lead** — the durable backup;
  4. `POST /api/chat/notify` → push to all agent devices;
  5. `setCachedLead(...)`, `trackEvent("chat_started")`.
- **Live thread** — `onSnapshot` on `messages`; customer/agent bubbles with
  timestamps; composer sends new messages (each also calls `/api/chat/notify`).
  Resumes across visits/pages via the persisted anon uid.
- **Proactive chat inbound** — the widget subscribes (lightweight) for a
  conversation owned by its `visitorId` *even before the visitor starts one*, so
  an agent-initiated chat **pops the widget open** with the agent's opening line.
- **Presence-aware copy** — driven by `status/team`, not the clock (see §5).
- **Split for size:** `components/chat/ChatWidget.tsx` (shell + tabs + floating
  buttons), `components/chat/LiveChat.tsx` (pre-chat form + thread + composer),
  `lib/chat/useConversation.ts` (customer-side Firestore logic).

**Mobile:** add a **Chat** launcher to
[components/MobileStickyCTA.tsx](../../../components/MobileStickyCTA.tsx) beside
WhatsApp/Call (the widget is desktop-only today; phone visitors must be able to
chat). WhatsApp + Call are untouched.

## 4. Sales console — `app/admin/chat/` (new, responsive)

- **Login**: Firebase Auth email/password; requires the `agent: true` custom
  claim (enforced in rules, not just UI). Multiple agent accounts supported
  (salesperson + owner).
- **Live visitors panel** — who is on the site *right now* (`lastSeenAt` within
  ~2 min): city, current page, pages viewed, products viewed, referrer. A
  **[Chat]** button starts a **proactive conversation** with that visitor.
- **Conversations panel** — unread/open first; the thread; reply composer;
  close/reopen. Beside each chat: the visitor's **journey** (page trail),
  **products viewed**, **city/region**, **IP**, and **referrer** — the lead
  context the salesperson asked for.
- **Layout** — mobile: list → tap → thread; laptop: side-by-side.
- **In-app alerts** (console open): sound + tab-title badge.
- **Heartbeat** — while open, writes `status/team.onlineUntil = now + 90s`.
- `lib/chat/useInbox.ts` + `lib/chat/useLiveVisitors.ts` hold the agent-side
  Firestore logic.

## 5. Presence & the "nobody is watching" problem

A live chat nobody answers is **worse than no chat**. Business hours (Mon–Sat
9–18) cannot know about holidays, lunch, or sick days, so **presence is real, not
scheduled**:

- **Online** = at least one console is open and heart-beating (`status/team`).
  The widget shows *"Online — replies in minutes."*
- **Away** = no heartbeat. The widget shows *"Our team is away — leave your
  message and we'll reply on WhatsApp/email."* The visitor **still sends**; it is
  still stored, still pushed, still an email + Zoho lead.
- **Unanswered timeout** — if the customer's message gets no agent reply within
  **3 minutes**, the widget posts a `system` message: *"Our team is away right
  now — we have your details and will reply on WhatsApp/email shortly,"* with the
  WhatsApp/phone fallbacks. No one is left staring at a dead box.
- **Nothing vanishes** — chats are Firestore rows, not ephemeral sockets. On
  holiday they queue unread with full history + journey; push still fires to
  every registered device; the email + Zoho lead already landed at chat start.

## 6. Visitor intelligence

- **Identity: not IP.** IP is a poor key (one office IP = many people; WiFi→4G =
  two "visitors"). We key on the **anonymous auth uid** and record IP only as
  *context*.
- **Journey tracking** — a small client tracker (`lib/visitor/useVisitorTracker.ts`)
  records each page view (`path`, `title`, `productId` on PDPs) into
  `visitors/{visitorId}`, capped to the last 30, plus a deduped
  `productsViewed`. Heartbeats `lastSeenAt` + `currentPage` every ~45s **only
  while the tab is visible**.
- **Geo + IP + referrer** — the client cannot see its own IP. Once per session it
  calls `POST /api/visitor/session`, which reads `clientIp(req)` and the edge geo
  headers and writes `ip`/`city`/`region`/`country`/`referrer`/`utm` server-side
  via the Admin SDK. One call per session — cheap.
- **Bots** — crawlers (a large share of traffic, given ~7,500 indexed URLs) run
  no JS, so client-side tracking excludes them naturally. No bot filter needed.

## 7. Push notifications (FCM, multi-device)

- `public/firebase-messaging-sw.js` — service worker; `onBackgroundMessage` shows
  the OS notification; clicking opens `/admin/chat?c={conversationId}`.
- On console load: request permission, fetch the FCM token
  (`NEXT_PUBLIC_FIREBASE_VAPID_KEY`), upsert into `agentDevices` (one doc per
  device, tagged with `agentUid` + a friendly label).
- `app/api/chat/notify/route.ts` — POST `{ conversationId }`. Verifies the
  caller's Firebase ID token owns the conversation, reads customer name + last
  preview + city, **fans out FCM to every `agentDevices` token**, and prunes
  tokens FCM reports stale. Rate-limited via `lib/rateLimit.ts`. Failure is
  **non-fatal** (message is already stored; email + Zoho already sent).
- **iOS**: a minimal PWA manifest scoped to `/admin/chat` so it can be Added to
  Home Screen (required for push on iPhone). Android/desktop need no install.

## 8. Security, privacy & cost

**Firestore rules**
- *customer (anon)*: read/write only the conversation where
  `resource.data.ownerUid == request.auth.uid`, and its messages; create only
  with their own uid; `text` length-capped. Read/write only their **own**
  `visitors/{visitorId}` doc. **Cannot** read other conversations, other
  visitors, or `agentDevices`.
- *agent (`request.auth.token.agent == true`)*: read/write all conversations,
  messages, visitors, `agentDevices`, `status/team`.
- *public*: read-only on `status/team` (a single boolean-ish doc; leaks no UIDs).
- `scripts/set-agent-claim.mjs` — one-time Admin-SDK script granting `agent: true`.

**CSP** ([next.config.ts](../../../next.config.ts#L28)) — add Firebase hosts:
- `connect-src`: `https://*.googleapis.com https://firestore.googleapis.com
  https://fcm.googleapis.com https://firebaseinstallations.googleapis.com
  https://identitytoolkit.googleapis.com https://securetoken.googleapis.com
  https://*.gstatic.com`
- `script-src`: `https://www.gstatic.com` (messaging SW `importScripts`, unless
  the SW is bundled)
- `worker-src 'self' blob:` already present (SW is same-origin).

**Privacy (DPDP / GDPR)** — IP + browsing journey tied to a visitor is personal
data. Mitigations: 90-day **TTL** on `visitors`; data used only for sales
follow-up; **privacy-policy update** listing chat + visitor tracking. Not a
blocker, but must ship with the feature.

**Cost** — Firestore free tier: 20k writes/day, 50k reads/day, 1 GiB. Estimated
~8–10 writes/visitor (session + page views + heartbeats). Mitigations already in
the design: heartbeat only while the tab is visible; journey capped at 30;
session/geo written once; bots excluded automatically. If traffic outgrows the
free tier, overage is ~$0.18/100k writes — cheap, but **worth watching** given
the site's large SEO surface.

**Abuse** — pre-chat honeypot (already dropped by `/api/contact`); per-IP limits
on `/api/chat/notify` and `/api/visitor/session`; message-rate cap in rules.

## 9. Environment variables (new)

- **Client (public):** `NEXT_PUBLIC_FIREBASE_API_KEY`,
  `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
  `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
  `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- **Server (secret):** `FIREBASE_ADMIN_PROJECT_ID`,
  `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`.

## 10. Error handling — never a dead end

- Firebase unreachable / rules error: inline error, and the WhatsApp Web / QR /
  phone / email fallbacks stay visible (current widget posture). Chat degrades to
  today's capture behaviour.
- `/api/chat/notify` fails: non-fatal (see §7).
- `/api/visitor/session` fails: journey still tracked; city shows "Unknown".
  Chat is never blocked by tracking.
- Push denied/unsupported: console still updates live in-app; push is an
  enhancement, not a dependency.
- iOS not installed to Home Screen: push unavailable there; email + in-app alerts
  cover it. Console shows a one-time "Add to Home Screen" hint.

## 11. Testing

- **Unit (Vitest):** conversation/message helpers (shape, text cap, preview);
  journey cap + dedupe; presence (`onlineUntil`) boundary logic; unanswered
  timeout; `/api/chat/notify` (mock Admin SDK — ownership check, multi-device
  fan-out, stale-token pruning); `/api/visitor/session` (geo headers → doc,
  missing headers → "Unknown").
- **Rules (Firestore emulator):** a customer cannot read another customer's
  conversation, another visitor's doc, or `agentDevices`; an agent can; message
  cap enforced; `status/team` is public-read but not public-write.
- **Runtime (`verify` skill), two windows:** customer widget ↔ `/admin/chat` live
  round-trip both directions; proactive chat pops the widget open; journey + city
  appear beside the chat; presence flips to "Away" when the console closes, and
  the 3-minute unanswered message fires; pre-chat submit produces email + Zoho
  lead; push arrives on a real phone; mobile Chat launcher works; WhatsApp tab +
  `MobileStickyCTA` WhatsApp/Call unchanged.

## 12. Phasing

Each phase ships independently and is useful on its own.

- **Phase 1 — Live chat core.** Firebase wiring + rules; widget live chat
  (desktop + mobile); console at `/admin/chat` with conversations; real presence
  + away + unanswered timeout; email + Zoho lead on chat start.
- **Phase 2 — Push.** FCM + service worker + multi-device fan-out + iOS PWA
  manifest.
- **Phase 3 — Visitor intelligence.** Journey tracking, IP/city/referrer, live
  visitors panel, proactive chat.

## 13. Non-goals (deferred)

Typing indicators; "seen" receipts for the customer; file/image attachments;
canned replies; multi-agent assignment/routing; transcript export; AI
auto-answer; a Firestore-trigger Cloud Function for push (the API-route approach
is sufficient and avoids the Blaze plan); rebuilding the old console's
product-on/off, SEO, and analytics tabs (separate project — PostHog covers
analytics).
