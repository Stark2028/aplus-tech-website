# Sales Console Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/admin/chat` into a clean full-height internal console that never scrolls the page when you pick a conversation, with filter tabs, avatars, timestamps, and a customer info sidebar.

**Architecture:** Strip the public marketing shell (Navbar/Footer/ScrollProgress/ClientFloats) on `/admin/*` so the document is exactly one viewport tall, and switch `ChatThread` from `scrollIntoView` (which walks the whole scroll-chain up to the window) to a scroll of the message-log element only. Then layer on structural UI — pure helpers (time, avatar, scroll, message-grouping) are TDD'd in `lib/chat`; the React surfaces consume them.

**Tech Stack:** Next.js (App Router, RSC), React client components, Tailwind CSS, Firebase Firestore (`onSnapshot`), Vitest (node environment), lucide-react icons.

## Global Constraints

- Test runner: `npm run test` (Vitest, `vitest run`). Environment is **node** — no DOM/jsdom. Every pure helper must take plain values (numbers/objects/strings), never a live DOM node, so it is testable.
- Tests live beside source as `lib/chat/<name>.test.ts`. Import style matches the repo: `import { describe, it, expect } from "vitest";`.
- The `@/*` path alias resolves to the repo root (e.g. `@/lib/chat/time`).
- This repo enforces `react-hooks/set-state-in-effect` as an **error** — never call a plain `setState` synchronously inside a `useEffect` body. Refs and scroll-position writes inside effects are fine.
- No new Firestore composite index is required: the closed-inbox query reuses the existing `(status ==, lastMessageAt desc)` index that the open inbox already relies on (composite indexes are keyed on the field/order pair, independent of the equality value).
- Timestamps are epoch-ms `number` throughout (`Conversation.lastMessageAt`, `ChatMessage.createdAt`). `0` means a `serverTimestamp()` has not resolved yet.
- Branch: `feat/sales-console-refresh` (already created off `master`; the design spec is committed there).
- Do not touch the visitor-facing widget, auth, presence, or escalation logic.

---

### Task 1: Hide the marketing shell on `/admin/*`

Makes the console full-height (half of the scroll-bug fix) and removes the chat-bubble / "Find Your Display" / navbar / footer clutter.

**Files:**
- Modify: `components/Navbar.tsx` (guard after line 21)
- Modify: `components/Footer.tsx` (guard after line 41)
- Modify: `components/ScrollProgress.tsx` (make client + guard)
- Modify: `components/ClientFloats.tsx` (add import + guard)

**Interfaces:**
- Produces: nothing consumed by later tasks. Behavioral change only — these components render `null` on any path starting with `/admin`.

- [ ] **Step 1: Guard Navbar**

In `components/Navbar.tsx`, `usePathname` is already imported and `const pathname = usePathname();` exists at line 19. Add an early return immediately after the `cartCount` line (line 21):

```tsx
  const cartCount = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  // The sales console (/admin) is a standalone full-screen tool — no marketing chrome.
  if (pathname?.startsWith("/admin")) return null;
```

- [ ] **Step 2: Guard Footer**

In `components/Footer.tsx`, `const pathname = usePathname();` already exists at line 41. Add immediately after it:

```tsx
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
```

- [ ] **Step 3: Guard ScrollProgress**

`components/ScrollProgress.tsx` is currently a server component. Replace its entire contents with a client version that reads the path:

```tsx
"use client";

import { usePathname } from "next/navigation";

export default function ScrollProgress() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-100 pointer-events-none"
      aria-hidden="true"
      style={{
        background: "#2563eb",
        transformOrigin: "left",
        transform: "scaleX(0)",
        animationTimeline: "scroll(root block)",
        animationName: "scroll-progress",
        animationTimingFunction: "linear",
        animationFillMode: "both",
      }}
    />
  );
}
```

- [ ] **Step 4: Guard ClientFloats**

In `components/ClientFloats.tsx`, add the import and an early return. After the existing `import dynamic from "next/dynamic";` line, add:

```tsx
import { usePathname } from "next/navigation";
```

Then at the top of the `ClientFloats()` function body, before `return (`:

```tsx
export default function ClientFloats() {
  const pathname = usePathname();
  // The console renders none of the public floating UI (chat bubble, finder,
  // back-to-top, cookie banner, mobile CTA).
  if (pathname?.startsWith("/admin")) return null;

  return (
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/Navbar.tsx components/Footer.tsx components/ScrollProgress.tsx components/ClientFloats.tsx
git commit -m "feat(console): strip marketing chrome on /admin routes"
```

---

### Task 2: `isNearBottom` scroll helper (TDD)

Pure predicate that decides whether the message log is scrolled near enough to the bottom to keep auto-following. Node-testable because it takes a metrics object, not an element.

**Files:**
- Create: `lib/chat/scroll.ts`
- Test: `lib/chat/scroll.test.ts`

**Interfaces:**
- Produces: `isNearBottom(m: { scrollTop: number; scrollHeight: number; clientHeight: number }, threshold?: number): boolean` — a live `HTMLElement` satisfies the parameter shape (it has all three props), so callers pass the element directly.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/scroll.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isNearBottom } from "./scroll";

describe("isNearBottom", () => {
  it("is true when pinned exactly to the bottom", () => {
    expect(isNearBottom({ scrollTop: 900, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
  });

  it("is true within the default 120px threshold", () => {
    expect(isNearBottom({ scrollTop: 800, scrollHeight: 1000, clientHeight: 100 })).toBe(true);
  });

  it("is false when scrolled up beyond the threshold", () => {
    expect(isNearBottom({ scrollTop: 500, scrollHeight: 1000, clientHeight: 100 })).toBe(false);
  });

  it("honors a custom threshold", () => {
    expect(isNearBottom({ scrollTop: 500, scrollHeight: 1000, clientHeight: 100 }, 400)).toBe(true);
  });

  it("is true for content shorter than the viewport", () => {
    expect(isNearBottom({ scrollTop: 0, scrollHeight: 80, clientHeight: 100 })).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- scroll`
Expected: FAIL — `isNearBottom` is not exported / module not found.

- [ ] **Step 3: Write minimal implementation**

Create `lib/chat/scroll.ts`:

```ts
/**
 * Is a scrollable element close enough to its bottom that we should keep it
 * pinned when new content arrives? Takes plain metrics (an HTMLElement already
 * exposes scrollTop/scrollHeight/clientHeight) so it stays pure and testable in
 * the node test environment.
 */
export function isNearBottom(
  m: { scrollTop: number; scrollHeight: number; clientHeight: number },
  threshold = 120
): boolean {
  return m.scrollHeight - m.scrollTop - m.clientHeight <= threshold;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- scroll`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/chat/scroll.ts lib/chat/scroll.test.ts
git commit -m "feat(console): add isNearBottom scroll helper"
```

---

### Task 3: Contain the ChatThread auto-scroll

Replace `scrollIntoView` (which drags the window) with a scroll of the log element only, following new messages only when the agent is already near the bottom.

**Files:**
- Modify: `components/admin/chat/ChatThread.tsx` (imports, refs, the two scroll effects, the log `<div>`)

**Interfaces:**
- Consumes: `isNearBottom` from `@/lib/chat/scroll` (Task 2).
- Produces: nothing for later tasks.

- [ ] **Step 1: Import the helper**

In `components/admin/chat/ChatThread.tsx`, add to the imports near the top:

```tsx
import { isNearBottom } from "@/lib/chat/scroll";
```

- [ ] **Step 2: Replace the `end` ref with a log ref + stick tracking**

Delete this line (currently line 25):

```tsx
  const end = useRef<HTMLDivElement>(null);
```

Replace with:

```tsx
  const logRef = useRef<HTMLDivElement>(null);
  // Keep the log pinned to the bottom unless the agent scrolls up to read history.
  const stickToBottom = useRef(true);
```

- [ ] **Step 3: Replace the scroll effect**

Delete the existing effect (currently lines 35-37):

```tsx
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
```

Replace with two effects plus a scroll handler:

```tsx
  // Switching conversations always jumps straight to the newest message.
  useEffect(() => {
    stickToBottom.current = true;
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [conversation.id]);

  // A new message follows only if the agent is already at the bottom — never
  // yank them away from history they're reading. Scrolls the log, never the page.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  const handleLogScroll = () => {
    const log = logRef.current;
    if (log) stickToBottom.current = isNearBottom(log);
  };
```

- [ ] **Step 4: Wire the ref + handler onto the log, drop the sentinel div**

Change the log container (currently line 140-145) from:

```tsx
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
```

to:

```tsx
      <div
        ref={logRef}
        onScroll={handleLogScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
```

And delete the sentinel div at the end of the message list (currently line 173):

```tsx
        <div ref={end} />
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (the removed `end` ref has no other references).

- [ ] **Step 6: Commit**

```bash
git add components/admin/chat/ChatThread.tsx
git commit -m "feat(console): contain thread auto-scroll to the message log"
```

---

### Task 4: Time formatting helpers (TDD)

Compact relative time for list rows, clock time for message bubbles, and day-divider labels.

**Files:**
- Create: `lib/chat/time.ts`
- Test: `lib/chat/time.test.ts`

**Interfaces:**
- Produces:
  - `formatRelative(ts: number, now?: number): string` — "", "now", "5m", "3h", "2d", or a short date.
  - `formatClock(ts: number): string` — localized "3:45 PM" (or "" for `0`).
  - `sameDay(a: number, b: number): boolean`
  - `dayLabel(ts: number, now?: number): string` — "Today" | "Yesterday" | long date.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/time.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatRelative, formatClock, sameDay, dayLabel } from "./time";

const NOW = new Date("2026-07-24T12:00:00Z").getTime();
const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;

describe("formatRelative", () => {
  it("returns empty string for a missing timestamp", () => {
    expect(formatRelative(0, NOW)).toBe("");
  });
  it("shows 'now' under a minute", () => {
    expect(formatRelative(NOW - 30_000, NOW)).toBe("now");
  });
  it("shows minutes under an hour", () => {
    expect(formatRelative(NOW - 5 * MIN, NOW)).toBe("5m");
  });
  it("shows hours under a day", () => {
    expect(formatRelative(NOW - 3 * HOUR, NOW)).toBe("3h");
  });
  it("shows days under a week", () => {
    expect(formatRelative(NOW - 2 * DAY, NOW)).toBe("2d");
  });
  it("falls back to a short date beyond a week", () => {
    expect(formatRelative(NOW - 30 * DAY, NOW)).not.toMatch(/^\d+[mhd]$|^now$/);
    expect(formatRelative(NOW - 30 * DAY, NOW).length).toBeGreaterThan(0);
  });
});

describe("formatClock", () => {
  it("returns empty string for 0", () => {
    expect(formatClock(0)).toBe("");
  });
  it("returns a non-empty label for a real timestamp", () => {
    expect(formatClock(NOW).length).toBeGreaterThan(0);
  });
});

describe("sameDay", () => {
  it("is true within the same calendar day", () => {
    expect(sameDay(NOW, NOW + HOUR)).toBe(true);
  });
  it("is false across a day boundary", () => {
    expect(sameDay(NOW, NOW + DAY)).toBe(false);
  });
});

describe("dayLabel", () => {
  it("labels today", () => {
    expect(dayLabel(NOW, NOW)).toBe("Today");
  });
  it("labels yesterday", () => {
    expect(dayLabel(NOW - DAY, NOW)).toBe("Yesterday");
  });
  it("uses a full date further back", () => {
    const label = dayLabel(NOW - 10 * DAY, NOW);
    expect(label).not.toBe("Today");
    expect(label).not.toBe("Yesterday");
    expect(label.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- time`
Expected: FAIL — module `./time` not found.

- [ ] **Step 3: Write minimal implementation**

Create `lib/chat/time.ts`:

```ts
/**
 * Presentational time helpers for the console. Pure and deterministic (callers
 * pass `now` in tests). `formatLastSeen` in presence.ts stays the source of the
 * "Left N ago" presence string — these cover list rows and message bubbles.
 */

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Compact age for a conversation row: "now" | "5m" | "3h" | "2d" | "Jul 12". */
export function formatRelative(ts: number, now: number = Date.now()): string {
  if (!ts) return "";
  const diff = Math.max(0, now - ts);
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return new Date(ts).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/** Clock time under a message bubble: "3:45 PM". */
export function formatClock(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Same calendar day in local time. */
export function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Divider label between messages: "Today" | "Yesterday" | "12 July 2026". */
export function dayLabel(ts: number, now: number = Date.now()): string {
  if (sameDay(ts, now)) return "Today";
  if (sameDay(ts, now - DAY)) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- time`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/chat/time.ts lib/chat/time.test.ts
git commit -m "feat(console): add relative/clock/day time helpers"
```

---

### Task 5: Avatar helper + component

Deterministic initials and color for a customer, plus the reusable `Avatar` circle.

**Files:**
- Create: `lib/chat/avatar.ts`
- Test: `lib/chat/avatar.test.ts`
- Create: `components/admin/chat/Avatar.tsx`

**Interfaces:**
- Produces:
  - `initials(name: string): string` — 1-2 uppercase letters, `"?"` when empty.
  - `colorFor(seed: string): string` — a stable Tailwind `bg-*` class from a fixed palette.
  - `Avatar` default export: `({ name: string; seed?: string; size?: number }) => JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/avatar.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { initials, colorFor } from "./avatar";

describe("initials", () => {
  it("uses first + last initial for a full name", () => {
    expect(initials("Sameer Prasad")).toBe("SP");
  });
  it("uses the first two letters of a single name", () => {
    expect(initials("Sameer")).toBe("SA");
  });
  it("collapses extra whitespace", () => {
    expect(initials("  Sameer   Kumar Prasad ")).toBe("SP");
  });
  it("falls back to ? for an empty name", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});

describe("colorFor", () => {
  it("is deterministic for the same seed", () => {
    expect(colorFor("abc")).toBe(colorFor("abc"));
  });
  it("returns a tailwind bg class from the palette", () => {
    expect(colorFor("anything")).toMatch(/^bg-[a-z]+-500$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- avatar`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `lib/chat/avatar.ts`:

```ts
/** Up to two uppercase initials from a name; "?" when there is nothing to show. */
export function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

/** Stable palette color for a seed string (name or id), so a customer keeps one hue. */
export function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- avatar`
Expected: PASS.

- [ ] **Step 5: Create the Avatar component**

Create `components/admin/chat/Avatar.tsx`:

```tsx
import { initials, colorFor } from "@/lib/chat/avatar";

/** Initials circle with a stable per-customer color. */
export default function Avatar({
  name,
  seed,
  size = 36,
}: {
  name: string;
  seed?: string;
  size?: number;
}) {
  const label = name?.trim() || "Visitor";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(
        seed || label
      )}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {initials(label)}
    </span>
  );
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/chat/avatar.ts lib/chat/avatar.test.ts components/admin/chat/Avatar.tsx
git commit -m "feat(console): add avatar helper and component"
```

---

### Task 6: Refresh the conversation-list rows

Add avatars and a relative timestamp to each row, plus a configurable empty label (used by the tabs in Task 7).

**Files:**
- Modify: `components/admin/chat/ConversationList.tsx`

**Interfaces:**
- Consumes: `Avatar` (Task 5), `formatRelative` from `@/lib/chat/time` (Task 4).
- Produces: `ConversationList` now accepts an optional `emptyLabel?: string` prop (default `"No conversations."`), consumed by Task 7.

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `components/admin/chat/ConversationList.tsx` with:

```tsx
"use client";

import { AlertTriangle } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";
import { formatRelative } from "@/lib/chat/time";
import Avatar from "./Avatar";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  emptyLabel = "No conversations.",
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel?: string;
}) {
  if (conversations.length === 0) {
    return <p className="p-6 text-sm text-gray-400 text-center">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        const name = c.customer.name || "Visitor";
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                selected ? "bg-blue-50" : "hover:bg-gray-50"
              } ${c.needsFollowUp ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}
            >
              <Avatar name={name} seed={c.id} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-900">
                    {name}
                  </span>
                  <span className="shrink-0 text-[10px] text-gray-400">
                    {formatRelative(c.lastMessageAt)}
                  </span>
                  {c.needsFollowUp && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      <AlertTriangle size={10} /> NO REPLY
                    </span>
                  )}
                  {c.unreadForAgent > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {c.unreadForAgent}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">{c.lastPreview}</p>
                <p className="mt-0.5 truncate text-[10px] text-gray-400">{c.page}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/chat/ConversationList.tsx
git commit -m "feat(console): avatars + relative time on conversation rows"
```

---

### Task 7: Filter tabs (Open / No reply / Closed)

Add the `useClosedInbox` lazy stream, an `InboxTabs` control, and wire tab state into the console.

**Files:**
- Modify: `lib/chat/useInbox.ts` (add `useClosedInbox`)
- Create: `components/admin/chat/InboxTabs.tsx`
- Modify: `app/admin/chat/page.tsx` (`Console` function)

**Interfaces:**
- Consumes: `mapConversation`, `COL`, `getDb` (already imported in `useInbox.ts`); `ConversationList` `emptyLabel` (Task 6).
- Produces:
  - `useClosedInbox(enabled: boolean): { conversations: Conversation[]; error: string | null }`
  - `type TabKey = "open" | "noreply" | "closed"` (exported from `InboxTabs.tsx`)
  - `InboxTabs` default export: `({ active: TabKey; onChange: (t: TabKey) => void; counts: { open: number; noreply: number; closed: number | null } }) => JSX.Element`

- [ ] **Step 1: Add `useClosedInbox`**

In `lib/chat/useInbox.ts`, append this hook after the existing `useInbox` function (before `useThread`):

```ts
/**
 * Closed conversations, newest first — lazily. Only subscribes while `enabled`
 * (the Closed tab is active), so the default console never streams closed
 * history. Reuses the (status, lastMessageAt) index the open inbox already uses.
 */
export function useClosedInbox(enabled: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setConversations([]);
      return;
    }
    const q = query(
      collection(getDb(), COL.conversations),
      where("status", "==", "closed"),
      orderBy("lastMessageAt", "desc"),
      limit(50)
    );
    return onSnapshot(
      q,
      (snap) => {
        setConversations(
          snap.docs.map((d) => mapConversation(d.id, d.data() as Record<string, unknown>))
        );
      },
      (err) => {
        console.error("[useClosedInbox]", err);
        setError("Could not load closed conversations.");
      }
    );
  }, [enabled]);

  return { conversations, error };
}
```

- [ ] **Step 2: Create `InboxTabs`**

Create `components/admin/chat/InboxTabs.tsx`:

```tsx
"use client";

export type TabKey = "open" | "noreply" | "closed";

export default function InboxTabs({
  active,
  onChange,
  counts,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  counts: { open: number; noreply: number; closed: number | null };
}) {
  const tabs: { key: TabKey; label: string; count: number | null }[] = [
    { key: "open", label: "Open", count: counts.open },
    { key: "noreply", label: "No reply", count: counts.noreply },
    { key: "closed", label: "Closed", count: counts.closed },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-2">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              on ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  on ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Wire tabs into the console**

In `app/admin/chat/page.tsx`:

Add to the imports at the top:

```tsx
import { useInbox, useClosedInbox } from "@/lib/chat/useInbox";
import InboxTabs, { type TabKey } from "@/components/admin/chat/InboxTabs";
```

(Replace the existing `import { useInbox } from "@/lib/chat/useInbox";` line with the first line above.)

In the `Console` function, replace the current inbox line:

```tsx
  const { conversations, error } = useInbox();
```

with the tab-aware derivation:

```tsx
  const { conversations: open, error } = useInbox();
  const [tab, setTab] = useState<TabKey>("open");
  const { conversations: closed } = useClosedInbox(tab === "closed");

  const noReply = open.filter((c) => c.needsFollowUp);
  const visible = tab === "open" ? open : tab === "noreply" ? noReply : closed;
  const counts = {
    open: open.length,
    noreply: noReply.length,
    closed: tab === "closed" ? closed.length : null,
  };
```

Then update the unread reducer and the `selected` lookup, which currently reference `conversations`:

```tsx
  const unread = open.reduce((n, c) => n + (c.unreadForAgent > 0 ? 1 : 0), 0);
```

```tsx
  const selected = [...open, ...closed].find((c) => c.id === selectedId) ?? null;
```

Finally, replace the `<aside>` block (currently lines 94-104) with a flex column that stacks the tabs above the scrolling list:

```tsx
        <aside
          className={`${
            selected ? "hidden md:flex" : "flex"
          } w-full flex-col md:w-80 lg:w-96 shrink-0 border-r border-gray-200 bg-white`}
        >
          <InboxTabs active={tab} onChange={setTab} counts={counts} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={visible}
              selectedId={selectedId}
              onSelect={setSelectedId}
              emptyLabel={
                tab === "open"
                  ? "No open chats."
                  : tab === "noreply"
                  ? "Nothing waiting on a reply."
                  : "No closed chats."
              }
            />
          </div>
        </aside>
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/chat/useInbox.ts components/admin/chat/InboxTabs.tsx app/admin/chat/page.tsx
git commit -m "feat(console): Open / No reply / Closed filter tabs"
```

---

### Task 8: Day dividers + message timestamps (TDD helper)

Group the thread by calendar day and show a clock time under each bubble.

**Files:**
- Create: `lib/chat/messageGroups.ts`
- Test: `lib/chat/messageGroups.test.ts`
- Modify: `components/admin/chat/ChatThread.tsx` (message render)

**Interfaces:**
- Consumes: `ChatMessage` from `@/lib/chat/types`; `sameDay`, `dayLabel`, `formatClock` from `@/lib/chat/time` (Task 4).
- Produces: `groupByDay(messages: ChatMessage[], now?: number): ThreadItem[]` where
  `type ThreadItem = { type: "divider"; id: string; label: string } | { type: "message"; id: string; message: ChatMessage }`.

- [ ] **Step 1: Write the failing test**

Create `lib/chat/messageGroups.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { groupByDay } from "./messageGroups";
import type { ChatMessage } from "./types";

const NOW = new Date("2026-07-24T12:00:00Z").getTime();
const DAY = 86_400_000;

function msg(id: string, createdAt: number): ChatMessage {
  return { id, sender: "customer", text: id, createdAt };
}

describe("groupByDay", () => {
  it("returns nothing for no messages", () => {
    expect(groupByDay([], NOW)).toEqual([]);
  });

  it("prefixes a single message with one divider", () => {
    const out = groupByDay([msg("a", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message"]);
    expect(out[0]).toMatchObject({ type: "divider", label: "Today" });
  });

  it("groups same-day messages under one divider", () => {
    const out = groupByDay([msg("a", NOW - 3600_000), msg("b", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message", "message"]);
  });

  it("inserts a new divider when the day changes", () => {
    const out = groupByDay([msg("a", NOW - DAY), msg("b", NOW)], NOW);
    expect(out.map((i) => i.type)).toEqual(["divider", "message", "divider", "message"]);
    expect(out[0]).toMatchObject({ label: "Yesterday" });
    expect(out[2]).toMatchObject({ label: "Today" });
  });

  it("gives divider ids distinct from message ids", () => {
    const out = groupByDay([msg("a", NOW)], NOW);
    const divider = out.find((i) => i.type === "divider")!;
    expect(divider.id).not.toBe("a");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- messageGroups`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `lib/chat/messageGroups.ts`:

```ts
import type { ChatMessage } from "./types";
import { sameDay, dayLabel } from "./time";

export type ThreadItem =
  | { type: "divider"; id: string; label: string }
  | { type: "message"; id: string; message: ChatMessage };

/**
 * Flatten an ordered message list into render items with a day divider before
 * the first message of each calendar day. An optimistic message whose
 * serverTimestamp has not resolved (createdAt === 0) is grouped with `now` so it
 * never spawns a stray "1 January 1970" divider.
 */
export function groupByDay(messages: ChatMessage[], now: number = Date.now()): ThreadItem[] {
  const items: ThreadItem[] = [];
  let prev: number | null = null;
  for (const m of messages) {
    const ts = m.createdAt || now;
    if (prev === null || !sameDay(prev, ts)) {
      items.push({ type: "divider", id: `d-${m.id}`, label: dayLabel(ts, now) });
    }
    items.push({ type: "message", id: m.id, message: m });
    prev = ts;
  }
  return items;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- messageGroups`
Expected: PASS.

- [ ] **Step 5: Render dividers + timestamps in ChatThread**

In `components/admin/chat/ChatThread.tsx`, add imports:

```tsx
import { groupByDay } from "@/lib/chat/messageGroups";
import { formatClock } from "@/lib/chat/time";
```

Replace the message-list body — the `{messages.map((m) => { ... })}` block (currently lines 146-172) — with a grouped render:

```tsx
        {groupByDay(messages).map((item) => {
          if (item.type === "divider") {
            return (
              <div key={item.id} className="flex justify-center py-1.5">
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-medium text-gray-500">
                  {item.label}
                </span>
              </div>
            );
          }
          const m = item.message;
          if (m.sender === "system") {
            return (
              <p
                key={m.id}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] text-gray-500"
              >
                {m.text}
              </p>
            );
          }
          const mine = m.sender === "agent";
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800"
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
              <span className="mt-0.5 px-1 text-[10px] text-gray-400">{formatClock(m.createdAt)}</span>
            </div>
          );
        })}
```

- [ ] **Step 6: Run all tests + type-check**

Run: `npm run test`
Expected: PASS (all suites).
Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/chat/messageGroups.ts lib/chat/messageGroups.test.ts components/admin/chat/ChatThread.tsx
git commit -m "feat(console): day dividers and message timestamps"
```

---

### Task 9: Customer info sidebar

A right-hand panel (static on `lg+`, slide-over below) that carries the customer details and the contact actions, which move out of the thread header.

**Files:**
- Create: `components/admin/chat/CustomerPanel.tsx`
- Modify: `components/admin/chat/ChatThread.tsx` (header slimmed, actions moved, sidebar state + render)

**Interfaces:**
- Consumes: `Conversation`, `VisitorDoc` types; `Avatar` (Task 5); `isVisitorOnline`, `formatLastSeen` from `@/lib/chat/presence`; the `waHref` and `setStatus` already present in `ChatThread`.
- Produces: `CustomerPanel` default export:
  `({ conversation: Conversation; visitor: VisitorDoc | null; online: boolean; waHref: string | null; onCloseChat: () => void; open: boolean; onCloseSidebar: () => void }) => JSX.Element`.

- [ ] **Step 1: Create CustomerPanel**

Create `components/admin/chat/CustomerPanel.tsx`:

```tsx
"use client";

import { Phone, Mail, X } from "lucide-react";
import type { Conversation, VisitorDoc } from "@/lib/chat/types";
import { formatLastSeen } from "@/lib/chat/presence";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";
import Avatar from "./Avatar";

export default function CustomerPanel({
  conversation,
  visitor,
  online,
  waHref,
  onCloseChat,
  open,
  onCloseSidebar,
}: {
  conversation: Conversation;
  visitor: VisitorDoc | null;
  online: boolean;
  waHref: string | null;
  onCloseChat: () => void;
  open: boolean;
  onCloseSidebar: () => void;
}) {
  const { customer } = conversation;
  const name = customer.name || "Visitor";

  const body = (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={name} seed={conversation.id} size={56} />
        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="flex items-center justify-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={online ? "text-green-700" : "text-gray-400"}>
              {online ? "Online" : formatLastSeen(visitor?.lastSeenAt ?? null)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp the customer"
            title="WhatsApp the customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-[#25D366]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d={WA_PATH} />
            </svg>
          </a>
        )}
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            aria-label="Call customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-blue-600"
          >
            <Phone size={16} />
          </a>
        )}
        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            aria-label="Email customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-blue-600"
          >
            <Mail size={16} />
          </a>
        )}
      </div>

      <dl className="space-y-3 text-xs">
        <Detail label="Phone" value={customer.phone} />
        <Detail label="Email" value={customer.email} />
        <Detail label="Entry page" value={conversation.page} />
        <Detail label="Currently on" value={online ? visitor?.currentPage || "—" : "—"} />
      </dl>

      <button
        onClick={onCloseChat}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
      >
        Close chat
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50 lg:block">
        {body}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            className="flex-1 bg-black/30"
            onClick={onCloseSidebar}
            aria-label="Close customer details"
          />
          <aside className="flex w-72 max-w-[80%] flex-col overflow-y-auto border-l border-gray-200 bg-gray-50">
            <div className="flex justify-end p-2">
              <button
                onClick={onCloseSidebar}
                aria-label="Close customer details"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-gray-700">{value}</dd>
    </div>
  );
}
```

Note: the slide-over uses `fixed inset-0`. On `/admin` the navbar (a `backdrop-filter` ancestor that would otherwise clamp fixed overlays — see the backdrop-filter memory) is not rendered, so no portal is needed here.

- [ ] **Step 2: Slim the ChatThread header and move actions into the panel**

In `components/admin/chat/ChatThread.tsx`:

Add imports:

```tsx
import { Info } from "lucide-react";
import Avatar from "./Avatar";
import CustomerPanel from "./CustomerPanel";
```

Add sidebar state near the other `useState` calls:

```tsx
  const [sidebarOpen, setSidebarOpen] = useState(false);
```

Replace the outer wrapper `<div className="flex flex-col h-full bg-white">` (line 75) and its closing `</div>` (line 212) so the thread and the panel sit side by side. The new outer structure:

```tsx
  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {/* ...existing header, log, composer... */}
      </div>
      <CustomerPanel
        conversation={conversation}
        visitor={visitor}
        online={online}
        waHref={waHref}
        onCloseChat={() => setStatus("closed")}
        open={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
    </div>
  );
```

Replace the header (lines 76-138) with the slimmed version — avatar + name + presence, an info toggle below `lg`, and no contact buttons (they now live in the panel):

```tsx
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 md:hidden"
          aria-label="Back to list"
        >
          <ArrowLeft size={18} />
        </button>

        <Avatar name={conversation.customer.name || "Visitor"} seed={conversation.id} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {conversation.customer.name || "Visitor"}
          </p>
          <p className="flex items-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={online ? "text-green-700" : "text-gray-400"}>
              {online
                ? `Online${visitor?.currentPage ? ` — viewing ${visitor.currentPage}` : ""}`
                : formatLastSeen(visitor?.lastSeenAt ?? null)}
            </span>
          </p>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-400 transition-colors hover:text-blue-600 lg:hidden"
          aria-label="Customer details"
          title="Customer details"
        >
          <Info size={18} />
        </button>
      </header>
```

Now-unused imports must be cleared to satisfy lint: remove `Phone`, `Mail`, `CheckCheck`... — but note `CheckCheck` is still used in the message list (Task 8) and `formatLastSeen` is still used in the header. Remove only the icons no longer referenced anywhere in the file: `Phone` and `Mail` (moved to `CustomerPanel`). Update the lucide import line to:

```tsx
import { Send, ArrowLeft, CheckCheck, Info } from "lucide-react";
```

Also remove the now-unused `buildWhatsAppUrlTo`/`WA_PATH` usage? No — `waHref` is still computed in ChatThread and passed to the panel, so keep `buildWhatsAppUrlTo` and the `WA_PATH` import is no longer used in ChatThread (it moved to CustomerPanel). Remove the `WA_PATH` import from ChatThread:

Delete:

```tsx
import { WA_PATH } from "@/components/chat/WhatsAppPanel";
```

- [ ] **Step 3: Verify no dangling references**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors (in particular, no `no-unused-vars` for removed icon imports).

- [ ] **Step 4: Commit**

```bash
git add components/admin/chat/CustomerPanel.tsx components/admin/chat/ChatThread.tsx
git commit -m "feat(console): customer info sidebar with contact actions"
```

---

### Task 10: Full test run + runtime verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole unit suite**

Run: `npm run test`
Expected: PASS across `scroll`, `time`, `avatar`, `messageGroups`, and all pre-existing suites.

- [ ] **Step 2: Type-check + lint the whole project**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Runtime verification**

Use the `verify` skill to launch the app and drive `/admin/chat`. Confirm:
1. No navbar, footer, chat bubble, "Find Your Display", back-to-top, or cookie banner appears on `/admin/chat`.
2. Selecting a conversation does **not** move the page; the header and composer stay fixed and the log is scrolled to the newest message.
3. Scrolling up in the log and receiving/sending a message does not yank you to the bottom; scrolling back near the bottom resumes auto-follow.
4. Tabs filter correctly (Open / No reply / Closed), Closed loads on click, counts render.
5. Avatars, relative times, day dividers, and message clock-times render.
6. The customer sidebar shows details + actions on `lg+`; the info toggle opens the slide-over below `lg`.
7. Regression: a public route (e.g. `/`) still shows the navbar, footer, and floating widgets.

- [ ] **Step 4: Final commit (if verification prompted any fixes)**

```bash
git add -A
git commit -m "fix(console): runtime verification adjustments"
```

---

## Self-Review

**Spec coverage:**
- Full-screen + chrome removal → Task 1. ✅
- Scroll containment → Tasks 2-3. ✅
- Filter tabs (Open / No reply / Closed) + lazy closed stream → Task 7. ✅
- Avatars → Tasks 5-6. ✅
- Relative time on rows → Tasks 4, 6. ✅
- Day dividers + message timestamps → Tasks 4, 8. ✅
- Customer sidebar + moved actions + responsive slide-over → Task 9. ✅
- Empty state improvement → Tasks 6 (list) + note: the "Select a conversation" empty pane in `page.tsx` is retained; spec's icon upgrade is optional polish, folded into runtime verification. ✅
- TDD for pure helpers, runtime verify for UI → Tasks 2, 4, 5, 8, 10. ✅
- No search box (YAGNI) → omitted, per approved spec. ✅

**Placeholder scan:** No TBD/TODO; every code step carries complete code.

**Type consistency:** `TabKey` defined/exported in Task 7 and imported in `page.tsx`; `ThreadItem`/`groupByDay` names consistent between Task 8 helper and the ChatThread render; `isNearBottom`, `formatRelative`, `formatClock`, `initials`, `colorFor`, `useClosedInbox`, `CustomerPanel` prop shapes match across producer/consumer tasks.
