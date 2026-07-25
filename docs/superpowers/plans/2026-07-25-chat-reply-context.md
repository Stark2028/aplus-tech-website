# Chat Reply Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a salesperson replies, a customer who opens the widget lands in the thread (not the marketing menu), sees the reply attributed to "Aplus Sales", and sees where/when the chat began.

**Architecture:** Three independent pieces in the customer widget: (1) a routing rule centralized in `openChat` so opening with an unread reply shows the live thread; (2) a per-agent-run header on message bubbles; (3) an origin chip at the top of the thread, whose label comes from a new `pageTitle` field captured at conversation start and cleaned by a pure helper. Pure logic (`pageLabel`, `formatShortDate`) is unit-tested; the React wiring is verified at runtime.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Firebase Firestore (client SDK), Vitest, Tailwind.

## Global Constraints

- Company-level identity only — the agent label is the fixed string **"Aplus Sales"**. No per-salesperson name/photo (out of scope; not in the data model).
- **No Firestore rules change / no deploy.** The conversation `create` rule validates only `ownerUid` and `status`, so the extra `pageTitle` field is already permitted.
- No admin/console change and no data migration. Old conversations lacking `pageTitle` fall back to a path-derived label.
- Follow the repo's `lib/chat/*.test.ts` convention: `import { describe, it, expect } from "vitest"`.
- The badge-counting logic in `context/ChatContext.tsx` is unchanged.
- Test command: `npx vitest run <path>`.

---

### Task 1: `pageLabel` pure helper

**Files:**
- Create: `lib/chat/pageLabel.ts`
- Test: `lib/chat/pageLabel.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `cleanTitle(title: string): string` — label from a page `<title>`, or `""` if unusable.
  - `labelFromPath(path: string): string` — label from a URL path, or `""` for root/empty.
  - `resolvePageLabel(input: { pageTitle?: string; page?: string }): string` — the final chip label, always non-empty (falls back to `"our website"`).

- [ ] **Step 1: Write the failing test**

```ts
// lib/chat/pageLabel.test.ts
import { describe, it, expect } from "vitest";
import { cleanTitle, labelFromPath, resolvePageLabel } from "./pageLabel";

describe("cleanTitle", () => {
  it("takes the segment before the brand suffix", () => {
    expect(cleanTitle("Samsung QB55C | Aplus Technology Solutions")).toBe("Samsung QB55C");
  });
  it("strips a trailing model code in parentheses", () => {
    expect(cleanTitle("Samsung QB55C (LH55QBCEBGCXXL) | Aplus Technology Solutions")).toBe("Samsung QB55C");
  });
  it("returns '' for the home default (brand at the front)", () => {
    expect(cleanTitle("Aplus Technology Solutions | Authorized Samsung Business Display Distributor")).toBe("");
  });
  it("returns '' for a brand-only title", () => {
    expect(cleanTitle("Aplus Technology Solutions")).toBe("");
  });
  it("returns '' for empty/whitespace", () => {
    expect(cleanTitle("")).toBe("");
    expect(cleanTitle("   ")).toBe("");
  });
  it("passes a title through when there is no brand suffix", () => {
    expect(cleanTitle("Contact Us")).toBe("Contact Us");
  });
});

describe("labelFromPath", () => {
  it("title-cases the last segment", () => {
    expect(labelFromPath("/products/samsung-qb55c")).toBe("Samsung Qb55c");
  });
  it("ignores query and hash", () => {
    expect(labelFromPath("/displays?ref=x#top")).toBe("Displays");
  });
  it("returns '' for root", () => {
    expect(labelFromPath("/")).toBe("");
    expect(labelFromPath("")).toBe("");
  });
});

describe("resolvePageLabel", () => {
  it("prefers a cleaned page title", () => {
    expect(resolvePageLabel({ pageTitle: "Video Walls | Aplus Technology Solutions", page: "/x" })).toBe("Video Walls");
  });
  it("falls back to the path when the title is unusable", () => {
    expect(resolvePageLabel({ pageTitle: "Aplus Technology Solutions", page: "/products/samsung-qb55c" })).toBe("Samsung Qb55c");
  });
  it("falls back to 'our website' when nothing is usable", () => {
    expect(resolvePageLabel({ pageTitle: "", page: "/" })).toBe("our website");
    expect(resolvePageLabel({})).toBe("our website");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/chat/pageLabel.test.ts`
Expected: FAIL — `pageLabel` module / exports not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/chat/pageLabel.ts
/**
 * Origin-chip labels for the chat widget.
 *
 * The site title template is `%s | Aplus Technology Solutions` (app/layout.tsx),
 * so most page titles read "Page Name | Aplus Technology Solutions". The home
 * default is "Aplus Technology Solutions | Authorized …" — brand at the FRONT —
 * so we split on the separator and take the first segment rather than stripping a
 * trailing suffix (which would mangle the home title).
 */
const BRAND = "Aplus Technology Solutions";

/** Label from a page <title>, or "" when only the brand (or nothing) remains. */
export function cleanTitle(title: string): string {
  const first = (title ?? "").split(" | ")[0]?.trim() ?? "";
  const withoutCode = first.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!withoutCode || withoutCode === BRAND) return "";
  return withoutCode;
}

/** Label from a URL path: last segment, hyphens → spaces, title-cased. */
export function labelFromPath(path: string): string {
  const clean = (path ?? "").split("?")[0].split("#")[0];
  const seg = clean.split("/").filter(Boolean).pop() ?? "";
  if (!seg) return "";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The chip label: cleaned title → path-derived → "our website". Never empty. */
export function resolvePageLabel({ pageTitle, page }: { pageTitle?: string; page?: string }): string {
  const fromTitle = cleanTitle(pageTitle ?? "");
  if (fromTitle) return fromTitle;
  const fromPath = labelFromPath(page ?? "");
  if (fromPath) return fromPath;
  return "our website";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/chat/pageLabel.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/chat/pageLabel.ts lib/chat/pageLabel.test.ts
git commit -m "feat(chat): pageLabel helper for the origin chip"
```

---

### Task 2: `formatShortDate` in `time.ts`

**Files:**
- Modify: `lib/chat/time.ts` (append a new export)
- Test: `lib/chat/time.test.ts` (append a `describe`)

**Interfaces:**
- Consumes: nothing.
- Produces: `formatShortDate(ts: number): string` — "24 Jul" style; `""` for `0`.

- [ ] **Step 1: Write the failing test** (append to `lib/chat/time.test.ts`)

```ts
// add formatShortDate to the existing import at the top of the file:
//   import { formatRelative, formatClock, sameDay, dayLabel, formatShortDate } from "./time";

describe("formatShortDate", () => {
  it("returns empty string for 0", () => {
    expect(formatShortDate(0)).toBe("");
  });
  it("renders a short day + month with no year", () => {
    const out = formatShortDate(new Date("2026-07-24T06:00:00Z").getTime());
    expect(out).toMatch(/^\d{1,2} \w{3}$/); // e.g. "24 Jul" — locale/TZ tolerant
    expect(out).not.toMatch(/\d{4}/); // no year
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/chat/time.test.ts`
Expected: FAIL — `formatShortDate` is not exported.

- [ ] **Step 3: Write minimal implementation** (append to `lib/chat/time.ts`)

```ts
/** Short absolute date for the origin chip: "24 Jul". Empty for a missing ts. */
export function formatShortDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/chat/time.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/chat/time.ts lib/chat/time.test.ts
git commit -m "feat(chat): formatShortDate for the origin chip"
```

---

### Task 3: Capture `pageTitle` on the conversation model

**Files:**
- Modify: `lib/chat/types.ts` (add field to `Conversation` + `mapConversation`)
- Modify: `lib/chat/useConversation.ts` (write `pageTitle` in `startConversation`)

**Interfaces:**
- Consumes: nothing.
- Produces: `Conversation.pageTitle?: string`, populated by `mapConversation` (defaults to `""`).

- [ ] **Step 1: Add the field to the `Conversation` interface** (`lib/chat/types.ts`)

Add inside `export interface Conversation { … }`, after the `page: string;` line:

```ts
  /** The page <title> captured when the chat began — source for the origin chip. */
  pageTitle?: string;
```

- [ ] **Step 2: Map it in `mapConversation`** (`lib/chat/types.ts`)

Add inside the object returned by `mapConversation`, after `page: (data.page ?? "") as string,`:

```ts
    pageTitle: (data.pageTitle ?? "") as string,
```

- [ ] **Step 3: Capture it at creation** (`lib/chat/useConversation.ts`, inside `startConversation`)

In the `addDoc(collection(db, COL.conversations), { … })` call, add after `page,`:

```ts
        pageTitle: typeof document !== "undefined" ? document.title : "",
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add lib/chat/types.ts lib/chat/useConversation.ts
git commit -m "feat(chat): capture pageTitle at conversation start"
```

---

### Task 4: Route into the thread on open

**Files:**
- Modify: `context/ChatContext.tsx` (`openChat`, `toggleChat`)

**Interfaces:**
- Consumes: `unread`, `conversationId`, `isOpen` (already in `ChatProvider` scope).
- Produces: unchanged public API (`openChat`, `toggleChat`, `closeChat`); only behavior changes.

- [ ] **Step 1: Rewrite `openChat` to redirect the default view** (`context/ChatContext.tsx`)

Replace the existing `openChat`:

```ts
  const openChat = useCallback((next: ChatView = "home") => {
    setView(next);
    setUnread(0);
    setIsOpen(true);
    setHasEngaged(true);
  }, []);
```

with:

```ts
  const openChat = useCallback((next: ChatView = "home") => {
    // A default "home" open with an unread agent reply lands in the thread, not
    // the marketing menu — otherwise the reply the badge pointed at stays buried.
    // Explicit "live"/"whatsapp" picks are honored as-is.
    const target: ChatView = next === "home" && unread > 0 && conversationId ? "live" : next;
    setView(target);
    setUnread(0);
    setIsOpen(true);
    setHasEngaged(true);
  }, [unread, conversationId]);
```

- [ ] **Step 2: Rewrite `toggleChat` to delegate to `openChat`** (`context/ChatContext.tsx`)

Replace the existing `toggleChat`:

```ts
  const toggleChat = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      setView("home");
      setUnread(0);
      return true;
    });
    // Any toggle implies the visitor reached for the widget — engage so a fresh
    // anonymous session is minted (no-op once already engaged).
    setHasEngaged(true);
  }, []);
```

with:

```ts
  const toggleChat = useCallback(() => {
    // Delegate the OPEN path to openChat so the "route to the reply" rule lives in
    // exactly one place; closing stays trivial.
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    openChat("home");
  }, [isOpen, openChat]);
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. (`closeChat` and the `value` memo already list `openChat`/`toggleChat` in deps — no change needed there.)

- [ ] **Step 4: Commit**

```bash
git add context/ChatContext.tsx
git commit -m "feat(chat): open into the thread when there is an unread reply"
```

---

### Task 5: Agent attribution + origin chip in the thread

**Files:**
- Modify: `components/chat/LiveChat.tsx`

**Interfaces:**
- Consumes: `resolvePageLabel` (Task 1), `formatClock` + `formatShortDate` (Task 2), `Conversation.pageTitle`/`startedBy`/`createdAt` (Task 3), `conversation` from `useChat()`.
- Produces: nothing downstream.

- [ ] **Step 1: Add imports and pull `conversation` from context** (`components/chat/LiveChat.tsx`)

At the top, add:

```ts
import Image from "next/image";
import { formatClock, formatShortDate } from "@/lib/chat/time";
import { resolvePageLabel } from "@/lib/chat/pageLabel";
import type { Conversation } from "@/lib/chat/types";
```

Change the `useChat()` destructure (currently missing `conversation`):

```ts
  const { ready, conversationId, conversation, messages, error, resumeExpired, startConversation, sendMessage } = useChat();
```

- [ ] **Step 2: Render the origin chip + agent header in the thread** (`components/chat/LiveChat.tsx`)

In the `// ── live thread ──` return, replace the message `<div role="log" …>` block's children. Insert the chip as the first child of the log, and give each message the agent header on the first of an agent run. Replace:

```tsx
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
```

with:

```tsx
        {conversation && <OriginChip conversation={conversation} />}
        {messages.map((m, i) => {
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
          // Show the "Aplus Sales" header only on the FIRST bubble of an agent
          // run — any customer/system message breaks the run.
          const prev = messages[i - 1];
          const showAgentHeader = m.sender === "agent" && (!prev || prev.sender !== "agent");
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {showAgentHeader && (
                <div className="flex items-center gap-1.5 mb-1 ml-0.5">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={16}
                    height={16}
                    className="rounded bg-white object-contain"
                  />
                  <span className="text-[11px] font-semibold text-gray-600">Aplus Sales</span>
                  {formatClock(m.createdAt) && (
                    <span className="text-[10px] text-gray-400">{formatClock(m.createdAt)}</span>
                  )}
                </div>
              )}
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
```

- [ ] **Step 3: Add the `OriginChip` component** (`components/chat/LiveChat.tsx`, beside the existing `Fallbacks` helper at the bottom)

```tsx
/** Origin chip: where and when the chat began (design §3). */
function OriginChip({ conversation }: { conversation: Conversation }) {
  const label = resolvePageLabel({ pageTitle: conversation.pageTitle, page: conversation.page });
  const date = formatShortDate(conversation.createdAt);
  const text =
    conversation.startedBy === "agent"
      ? "Aplus Sales started this chat"
      : `You started this chat from ${label}`;
  return (
    <div className="text-center">
      <span className="inline-block text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
        {text}
        {date ? ` · ${date}` : ""}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint components/chat/LiveChat.tsx`
Expected: no errors. (`alt=""` on a decorative logo is intentional; if the repo's a11y lint flags empty alt, use `alt="Aplus"`.)

- [ ] **Step 5: Commit**

```bash
git add components/chat/LiveChat.tsx
git commit -m "feat(chat): Aplus Sales attribution + origin chip in the thread"
```

---

### Task 6: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit suite**

Run: `npx vitest run`
Expected: PASS, including the new `pageLabel` and `formatShortDate` cases.

- [ ] **Step 2: Typecheck + lint the whole project**

Run: `npx tsc --noEmit && npm run lint`
Expected: no new errors.

- [ ] **Step 3: Runtime-verify via the `verify` skill**

Use the `verify` skill to launch the site. Confirm:
1. Open the widget with no conversation → still the **home fork** (unchanged).
2. Start a chat, then (simulating an agent reply) with the panel closed, an `agent` message arrives → the red badge shows.
3. Tap the launcher → it opens **into the thread** (not the home menu), the reply is visible, the agent bubble shows the **"Aplus Sales · <time>"** header, and the **origin chip** sits at the top ("You started this chat from <label> · <date>").
4. Close and reopen with no new unread → **home fork** again.

- [ ] **Step 4: Final commit (if the verify step required any tweak)**

```bash
git add -A
git commit -m "chore(chat): verification tweaks for reply context"
```

---

## Self-Review

**Spec coverage:**
- Design §1 (route on open) → Task 4. ✓
- Design §2 (Aplus Sales attribution) → Task 5 (agent header). ✓
- Design §3 (origin chip, label source, date, startedBy copy) → Task 1 (`pageLabel`), Task 2 (`formatShortDate`), Task 5 (`OriginChip`). ✓
- Design §4 (`pageTitle` field, no rules deploy) → Task 3. ✓
- Files-touched table (all six files) → Tasks 1–5. ✓
- Testing (unit + runtime) → Task 6. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. ✓

**Type consistency:** `resolvePageLabel({ pageTitle, page })` signature matches its call in `OriginChip` (Task 5) and its definition (Task 1). `formatShortDate(ts)` / `formatClock(ts)` match. `Conversation.pageTitle?: string` (Task 3) is consumed as `conversation.pageTitle` in Task 5. `conversation` added to the `useChat()` destructure in Task 5 exists on the context value (already exported by `ChatContext`). ✓
