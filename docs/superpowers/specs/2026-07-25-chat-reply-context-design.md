# Chat reply context — "where did this message come from?"

**Date:** 2026-07-25
**Status:** Approved (design)
**Area:** Customer-facing live chat widget (`components/chat/*`, `context/ChatContext.tsx`, `lib/chat/*`)

## Problem

When a salesperson replies, the launcher shows a red unread badge. But the moment
the customer opens the widget, the reply is effectively hidden:

1. **The reply is buried on open.** `toggleChat()` and `openChat("home")` always
   reset the panel to the *home fork* — the marketing menu ("Chat now / Continue
   on WhatsApp / Call / Email"). The red badge clears to 0, and the customer is
   looking at a menu with **no signal that a human just replied** and no obvious
   path to the message (they'd have to guess to press "Chat now"). This is the
   exact state a customer sees today after tapping the badge.
2. **No sender identity.** Even once in the thread, an agent reply is a plain gray
   bubble with no name, avatar, or label. The only branding is the header that
   always reads "Aplus Technology Solutions". The customer cannot tell **who** the
   message is from.
3. **No origin context.** The conversation stores the `page` it started on, but
   that is never shown back to the customer, so there is no answer to **where /
   why** the chat began.

## Goal

After a reply, a customer who opens the widget should:

- **See the reply** immediately (not the marketing menu),
- know it is **from Aplus Sales**, and
- see **where and when** the chat began.

Scope is company-level identity ("Aplus Sales"), **not** per-salesperson name or
photo (deliberately out of scope — the data model does not store a per-message
author, and adding one would require console + rules changes).

## Design

Three independent pieces, smallest-blast-radius first.

### 1. Route into the thread on open (fixes the burial)

The routing decision lives in exactly one place: `openChat` in
`context/ChatContext.tsx`. `toggleChat` currently has its own inline open logic —
it is refactored to *delegate to `openChat("home")` when opening* (and just close
when already open), so the desktop badge tap and the mobile sticky bar
(`MobileStickyCTA` → `openChat("home")`) share the same rule instead of drifting.

**Rule (inside `openChat`):** when the requested view is `"home"` **and**
`unread > 0` **and** a conversation exists → open the **live thread**
(`view = "live"`) instead. For any other requested view (`"live"`, `"whatsapp"`)
or when there is no unread reply, the view is unchanged.

- A normal open with no waiting reply still shows the home fork — new visitors and
  visitors with a quiet thread are unaffected.
- The home fork's explicit "Chat now" (`openChat("live")`) and WhatsApp
  (`openChat("whatsapp")`) picks are honored as-is — the redirect only applies to
  the default `"home"` request.
- `unread` still clears to 0 on open (unchanged) — but now the customer actually
  sees the message that the badge was pointing at.

Implementation note: `openChat`/`toggleChat` are currently memoized with `[]`
dependencies. To read the live `unread`/`conversationId` at call time, add them to
the dependency array (simplest; these callbacks are not on a hot path). `toggleChat`
also needs `isOpen` (or the `setIsOpen` functional form) to decide open-vs-close.

### 2. "Aplus Sales" attribution on agent bubbles

In `components/chat/LiveChat.tsx`, agent messages gain a small header row shown on
the **first bubble of each consecutive agent run**:

```
[logo]  Aplus Sales · 2:14 pm
        Hi! About the Samsung QB55C you were looking at…
        (further consecutive agent bubbles: no repeated header)
```

- Avatar: the existing `/logo.png` in a small rounded chip (same asset the header
  uses).
- Label: **"Aplus Sales"** (company-level, fixed string).
- Timestamp: from `message.createdAt` via the existing `lib/chat/time.ts`
  formatter (`formatClock` → "2:14 pm"; unambiguous for older replies).
- "Run" detection is inline: an agent message shows the header when the previous
  rendered message is not an agent message. Any customer or system message breaks
  the run.
- Customer bubbles and the system (timeout) notice are unchanged.

### 3. Context chip at the top of the thread ("from where / when")

A single subtle, non-message line pinned at the top of the thread scroll (only
rendered in the thread view, i.e. when `conversationId` exists):

```
╭──────────────────────────────────────────╮
│  Chat started from the Samsung QB55C page │
│  · 24 Jul                                 │
╰──────────────────────────────────────────╯
```

- **Label source:** the page's own `<title>`, captured as a new `pageTitle` field
  when the chat starts (see §4). The site title template is `%s | Aplus Technology
  Solutions` (`app/layout.tsx`), so a page title looks like
  `Samsung QB55C (LH55QBCEBGCXXL) | Aplus Technology Solutions`. A small pure helper
  `lib/chat/pageLabel.ts` derives the label:
  1. **Split the title on `" | "` and take the first non-empty segment.** This
     robustly drops the brand suffix without depending on its exact wording, and
     avoids the naive "strip trailing suffix" bug: the **home page default** title
     is `Aplus Technology Solutions | Authorized Samsung Business Display
     Distributor` (brand at the *front*), whose first segment is the brand name.
  2. **Strip a trailing model-code in parentheses** — `Samsung QB55C
     (LH55QBCEBGCXXL)` → `Samsung QB55C` — so the chip reads cleanly.
  3. If the resulting segment is empty **or equals the brand name** ("Aplus
     Technology Solutions", the home-default case) → fall through to the path-derived
     label from `conversation.page` (last non-empty segment, hyphens → spaces,
     title-cased) for older conversations, then to the literal **"our website"**.

  Order of sources at render time: cleaned `pageTitle` → path-derived from `page`
  → "our website".
- **Date:** `conversation.createdAt`, rendered as a short absolute date ("24 Jul").
  No existing `time.ts` helper produces this exact form (`formatRelative` only
  falls back to "24 Jul" after 7+ days; `dayLabel` yields "24 July 2026"), so add
  a small `formatShortDate(ts)` to `lib/chat/time.ts`
  (`toLocaleDateString("en-IN", { day: "numeric", month: "short" })`), covered by
  the existing `time.test.ts`.
- **Copy varies on `startedBy`:**
  - `"customer"` → "You started this chat from **{label}** · {date}"
  - `"agent"` → "Aplus Sales started this chat · {date}"

## Data model change (§4)

One optional field is added to the `Conversation` model:

```ts
export interface Conversation {
  // …existing…
  /** The page <title> captured when the chat began — source for the origin chip. */
  pageTitle?: string;
}
```

- Written client-side in `useConversation.startConversation`, beside the existing
  `page`, as `pageTitle: document.title`.
- `mapConversation` maps it defensively (`(data.pageTitle ?? "") as string` or
  left `undefined`).
- **No Firestore rules deploy required.** The conversation `create` rule
  (`firestore.rules`) only asserts `ownerUid == auth.uid` and `status == 'open'`;
  it does not validate the field set, so an extra field is already permitted.
- **No admin/console change and no migration.** Old conversations simply lack the
  field and fall back to path-derived labels (fallback 2 above).

## Files touched

| File | Change |
|------|--------|
| `context/ChatContext.tsx` | Routing rule in `openChat`/`toggleChat` (§1) |
| `components/chat/LiveChat.tsx` | Agent sender label (§2) + origin chip (§3) |
| `lib/chat/useConversation.ts` | Capture `pageTitle: document.title` on create (§4) |
| `lib/chat/types.ts` | Optional `pageTitle` on `Conversation` + `mapConversation` (§4) |
| `lib/chat/pageLabel.ts` **(new)** | Pure label helper (§3) |
| `lib/chat/pageLabel.test.ts` **(new)** | Unit tests for the helper |

## Testing

- **Unit** (`pageLabel.test.ts`, matching the repo's `lib/chat/*.test.ts`
  convention): title-suffix stripping, path-fallback derivation, empty/whitespace
  input → "our website", already-clean titles pass through.
- **Runtime** (via the `verify` skill): open the widget, simulate an agent reply
  while the panel is closed → badge appears; open the launcher → lands **in the
  thread** with the reply visible, the "Aplus Sales · time" label on the agent
  bubble, and the origin chip at the top. Confirm a normal open with no unread
  still shows the home fork.

## Out of scope

- Per-salesperson name/photo attribution (would need a per-message author field,
  console changes, and rules changes).
- Any change to how the badge is counted (`ChatContext` unread logic is unchanged).
- Push/email notification copy (separate surface).

## Non-goals / risks

- The origin chip reflects where the chat **began**, not the current page — this is
  intentional ("from where" = origin). Resumed conversations keep their original
  `pageTitle`.
- `document.title` is read at conversation-start on the client; if a page has a
  generic or missing title, the cleaned label may be weak — the "our website"
  fallback keeps the chip grammatical rather than blank.
