# Sales Console — Structural Refresh (design)

**Date:** 2026-07-24
**Route:** `/admin/chat`
**Status:** approved for planning

## Problem

The sales console (`app/admin/chat/page.tsx`) has two problems reported by the
operator:

1. **The page scrolls when you pick a conversation.** Selecting a customer yanks
   the whole window down to the composer, so the agent must scroll up to read the
   thread and back down to type. Root causes, both real:
   - The console renders *inside* the public marketing shell. `app/layout.tsx`
     wraps every route — including `/admin` — in `Navbar`, `Footer`,
     `ScrollProgress`, and `ClientFloats` (the visitor `ChatLauncher` bubble,
     "Find Your Display", Back-to-top, cookie banner, mobile CTA). None of them
     hide on `/admin`. That makes the document taller than the viewport, so the
     document itself is scrollable.
   - `ChatThread` auto-scrolls with `end.current?.scrollIntoView({ behavior:
     "smooth" })`. `scrollIntoView` walks the entire scroll-chain up to the
     window, so when the document is scrollable it drags the whole page down.

2. **The console looks unfinished.** Plain rows, no avatars, no timestamps, thin
   empty state, and the public chrome bleeding in. The operator asked to improve
   the frontend; a "structural refresh" was chosen (not just a paint job).

## Goals

- Picking a conversation never moves the page. Header and composer stay fixed;
  only the message log scrolls.
- The console is a clean, full-height internal tool with no marketing chrome.
- A more capable, better-looking layout: filter tabs, avatars, timestamps, and a
  customer info sidebar.

## Non-goals (YAGNI)

- No conversation search box (deferred; filter tabs cover the common cases).
- No new backend, schema, or Firestore rule changes. Everything derives from the
  existing `Conversation` / `ChatMessage` / `VisitorDoc` model.
- No changes to the visitor-facing chat widget.
- No auth/presence/escalation logic changes.

## Design

### 1. Full-screen console (chrome removal + scroll containment)

**Hide public chrome on `/admin/*`.** Add a guard to each shell component so it
renders nothing on admin routes:

```ts
const pathname = usePathname();
if (pathname?.startsWith("/admin")) return null;
```

- `components/Navbar.tsx` — already imports `usePathname`; add the guard.
- `components/Footer.tsx` — already a client component using `usePathname`; add
  the guard.
- `components/ScrollProgress.tsx` — currently server; convert to a client
  component (add `"use client"` + `usePathname`) and guard.
- `components/ClientFloats.tsx` — already a client component; add the guard so the
  whole floating cluster is suppressed on admin.

The layout's `min-h-screen flex flex-col` wrapper stays. With Navbar/Footer null,
`main` (`flex-1`) fills the viewport and the console's `h-screen` fits exactly —
the document no longer scrolls. The `QuoteProvider` / `ComparisonProvider` /
`ChatProvider` and analytics stay mounted for all routes (harmless, and other
admin pages may rely on them).

*Alternative considered:* a single client `SiteChrome` wrapper in `layout.tsx`
that renders the shell for public routes and bare `{children}` for admin.
Cleaner centralization, but a larger refactor of the root layout. Rejected in
favor of the four one-line guards — lower risk, and "this widget hides itself on
admin" is a readable, self-contained rule per component.

**Contain the auto-scroll.** In `ChatThread`, replace the `scrollIntoView` call
with a direct scroll of the message-log container, which cannot affect the
window:

- Add a `logRef` on the scrollable `role="log"` div.
- On conversation change: jump instantly to bottom (`log.scrollTop =
  log.scrollHeight`, no animation).
- On a new message while the thread is open: smooth-scroll to bottom **only if
  the agent is already near the bottom** (within a threshold, e.g. 120px). If
  they've scrolled up to read history, don't yank them down.
- Near-bottom detection is a pure helper: `isNearBottom(el, threshold)` →
  `scrollHeight - scrollTop - clientHeight <= threshold`. Unit-tested.

### 2. Conversation list (left pane)

- **Filter tabs** above the list with live counts: **Open** · **No reply** ·
  **Closed**.
  - *Open* — the existing `useInbox()` live stream (`status == "open"`).
  - *No reply* — client filter of the open stream on `needsFollowUp`.
  - *Closed* — a new lazy hook `useClosedInbox(enabled)` that subscribes to
    `status == "closed"`, `orderBy(lastMessageAt desc)`, `limit(50)` **only when
    the Closed tab is active**. The hot path (open inbox) is unchanged; closed
    data is not streamed until requested.
- **Rows**: avatar (initials + deterministic color) · name + relative time
  ("2m", "3h", "Jul 12") on the top line · preview · small page/context line ·
  existing unread badge and `NO REPLY` pill. Refined selected (`bg-blue-50`) and
  hover states; the red left-border for `needsFollowUp` stays.
- The tab state lives in the `Console` component and is passed to
  `ConversationList`, which renders whichever list is active.

### 3. Thread (center pane)

- **Header** slimmed to avatar + name + presence line. The contact actions
  (WhatsApp / Call / Email / Close) move to the sidebar. On screens below `lg`,
  the header shows an info toggle that opens the sidebar as a slide-over.
- **Messages**: keep the bubble styling. Add **day dividers** ("Today",
  "Yesterday", or a date) between messages that cross a calendar day, and a small
  per-message time (e.g. under or beside the bubble). System messages restyled as
  centered chips.
  - Grouping is a pure helper: given ordered messages, yield a flat list of
    `{ type: "divider", label } | { type: "message", message }`. Unit-tested.
  - Relative-time and clock-time formatting are pure helpers in a new
    `lib/chat/time.ts`. Unit-tested. (`formatLastSeen` in `presence.ts` stays as
    is for the "Left N ago" presence string.)
- **Empty state** (no conversation selected): centered icon + "Select a
  conversation" + one-line hint, replacing the bare gray text.

### 4. Customer sidebar (right pane, `lg+`)

A new `CustomerPanel` component showing, from `conversation` + `visitor`:

- avatar + name
- online dot / last-seen (`isVisitorOnline` / `formatLastSeen`)
- phone, email (each a click-to-act row)
- entry page (`conversation.page`) and live current page (`visitor.currentPage`)
- quick actions: WhatsApp, Call, Email, Close chat

Responsive behavior:
- `lg+`: always-visible third column (`w-72`).
- `md`: hidden; an info toggle in the thread header opens it as a right slide-over.
- mobile: same slide-over; thread keeps full width.

### 5. Layout structure

```
┌ header (Sales console · email · sign out) ────────────────────────┐
├ list (w-80/96) │ thread (flex-1) │ sidebar (w-72, lg+) ───────────┤
└───────────────────────────────────────────────────────────────────┘
```

- `lg+`: three columns.
- `md`: list + thread (sidebar becomes a slide-over).
- mobile: single column — list, tap → thread with a back button (unchanged).

The outer `h-screen flex flex-col` and the `min-h-0` scroll discipline from the
current page are preserved; the sidebar is added as a third flex child of the
existing row.

## Components & files

New:
- `lib/chat/time.ts` — `formatRelative(ts, now)`, `formatClock(ts)`,
  `sameDay(a, b)`, `dayLabel(ts, now)`.
- `lib/chat/scroll.ts` — `isNearBottom(el, threshold)`.
- `lib/chat/messageGroups.ts` — day-divider grouping.
- `components/admin/chat/CustomerPanel.tsx`
- `components/admin/chat/Avatar.tsx` — initials + deterministic color.
- `components/admin/chat/InboxTabs.tsx` — the filter tabs.
- Unit tests alongside each pure helper.

Changed:
- `app/admin/chat/page.tsx` — tab state, three-column layout, sidebar wiring.
- `components/admin/chat/ConversationList.tsx` — avatars, relative time, refined rows.
- `components/admin/chat/ChatThread.tsx` — contained scroll, day dividers,
  timestamps, header slimmed, sidebar toggle on narrow screens.
- `lib/chat/useInbox.ts` — add `useClosedInbox(enabled)`.
- `components/Navbar.tsx`, `components/Footer.tsx`,
  `components/ScrollProgress.tsx`, `components/ClientFloats.tsx` — `/admin` guard.

## Testing

- **TDD** for every pure helper: `time.ts`, `scroll.ts`, `messageGroups.ts`, and
  the avatar initials/color function. Write failing tests first.
- **Runtime verification** with the `verify` skill: sign in to the console, load
  conversations, confirm (a) selecting a conversation does not move the page,
  (b) the composer and header stay fixed, (c) tabs filter correctly, (d) the
  sidebar/actions work, (e) no marketing chrome appears on `/admin`.
- Regression guard: confirm the public site still shows Navbar/Footer/floats on
  non-admin routes.

## Risks

- **Chrome guard scope.** `startsWith("/admin")` hides chrome on *all* admin
  routes, not just chat. That is the intended behavior for an internal console;
  confirmed acceptable.
- **Closed-tab cost.** `useClosedInbox` is lazy and capped at 50 to avoid
  streaming an unbounded closed history.
- **Presence timers.** Relative-time labels are computed at render; they won't
  tick without a re-render. Acceptable — the live Firestore stream re-renders the
  list frequently. No new interval added.
