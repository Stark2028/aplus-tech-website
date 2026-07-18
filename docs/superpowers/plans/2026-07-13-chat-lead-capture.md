# Desktop Chat Lead-Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the desktop chat widget capture a lead into the existing email + Zoho pipeline the moment the visitor hits send, so a desktop user without WhatsApp never loses their message; add WhatsApp Web + a scan-to-continue QR as bonus paths.

**Architecture:** Reuse the existing `POST /api/contact` route (Resend email + Zoho CRM) with no server changes — a chat message is contact-shaped. The `components/ChatWidget.tsx` desktop widget is rewritten: its "Leave a message" tab becomes a real capture form; its "WhatsApp" tab gains an "Open WhatsApp Web" button and a client-rendered QR code. A new `buildWhatsAppWebUrl` helper routes desktop clicks to WhatsApp Web instead of the `wa.me` interstitial.

**Tech Stack:** Next.js 16, React 19 client components, Tailwind v4, Vitest, `qrcode.react` (new), Resend + Zoho (existing, unchanged).

## Global Constraints

- Target files are `"use client"` React components; keep them client-only.
- Do **not** modify `app/api/contact/route.ts`, `lib/zoho.ts`, or `lib/leadGate.ts` — reuse them as-is.
- Chat submission payload MUST include `name`, `email`, `phone` (the route rejects a missing one with 400) and MUST set `inquiry_type: "Website Chat"` so the email + CRM lead are identifiable.
- Match the existing widget's Tailwind styling and brand voice; reuse the exact WhatsApp SVG path already in the file.
- No React component unit-test infrastructure exists (Vitest runs pure-logic tests only, e.g. `lib/productSort.test.ts`). Unit-test only the pure helper; verify the component via typecheck + build + the `verify` skill.
- QR must render client-side with no external network call (self-contained posture).
- Company phone/WhatsApp number comes only from `lib/contact.ts` / `lib/whatsapp.ts` — never hard-code digits.

---

### Task 1: `buildWhatsAppWebUrl` helper

**Files:**
- Modify: `lib/whatsapp.ts` (add one exported function after `buildWhatsAppUrl`)
- Test: `lib/whatsapp.test.ts` (create)

**Interfaces:**
- Consumes: `WHATSAPP_NUMBER` from `lib/contact.ts` (already imported in `lib/whatsapp.ts`).
- Produces: `buildWhatsAppWebUrl(message: string): string` → `https://web.whatsapp.com/send?phone=<WHATSAPP_NUMBER>&text=<encoded>`. Consumed by `ChatWidget` in Task 2.

- [ ] **Step 1: Write the failing test**

Create `lib/whatsapp.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppWebUrl, buildWhatsAppUrl } from "./whatsapp";
import { WHATSAPP_NUMBER } from "./contact";

describe("buildWhatsAppWebUrl", () => {
  it("builds a web.whatsapp.com/send URL with the canonical number", () => {
    const url = buildWhatsAppWebUrl("Hi there");
    expect(url).toBe(
      `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Hi%20there`
    );
  });

  it("URL-encodes special characters in the message", () => {
    const url = buildWhatsAppWebUrl("Q&A: pricing?");
    expect(url).toContain("text=Q%26A%3A%20pricing%3F");
    expect(url.startsWith("https://web.whatsapp.com/send?")).toBe(true);
  });

  it("still exposes wa.me via buildWhatsAppUrl (used for the QR payload)", () => {
    expect(buildWhatsAppUrl("Hi")).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi`);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/whatsapp.test.ts`
Expected: FAIL — `buildWhatsAppWebUrl is not a function` (not yet exported).

- [ ] **Step 3: Add the implementation**

In `lib/whatsapp.ts`, add immediately after the existing `buildWhatsAppUrl` function:

```ts
/** Build a WhatsApp Web deep link. Used on desktop so a click opens the
 *  in-browser WhatsApp Web client directly, skipping the wa.me "Continue to
 *  Chat" interstitial that looks broken to visitors without the desktop app. */
export function buildWhatsAppWebUrl(message: string): string {
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/whatsapp.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat(whatsapp): add buildWhatsAppWebUrl for desktop WhatsApp Web links

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Rewrite `ChatWidget` — capture form + WhatsApp Web + QR

**Files:**
- Modify: `package.json` (add `qrcode.react` dependency)
- Rewrite: `components/ChatWidget.tsx` (full replacement)

**Interfaces:**
- Consumes: `buildWhatsAppWebUrl` (Task 1), `buildWhatsAppUrl`, `getWhatsAppMessage`, `WHATSAPP_NUMBER` from `lib/whatsapp.ts`; `PHONE_DISPLAY`, `PHONE_TEL` from `lib/contact.ts`; `getCachedLead`, `setCachedLead` from `lib/leadGate.ts`; `trackEvent` from `lib/analytics.ts`; `QRCodeSVG` from `qrcode.react`.
- Produces: the mounted desktop chat widget. No exports consumed by other tasks.
- POSTs to `POST /api/contact` (unchanged) with body `{ name, email, phone, message, company_website, inquiry_type: "Website Chat", subject: "New Website Chat Message", from_name: "Aplus Website Chat" }`.

- [ ] **Step 1: Add the QR dependency**

Run: `npm install qrcode.react`
Expected: `package.json` gains `"qrcode.react": "^4.x"` under `dependencies`; `package-lock.json` updated. (v3+ ships its own TypeScript types — no `@types` needed.)

- [ ] **Step 2: Replace `components/ChatWidget.tsx` with the full implementation below**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  MessageCircle,
  X,
  Phone,
  Mail,
  Send,
  ChevronRight,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  getWhatsAppMessage,
  buildWhatsAppUrl,
  buildWhatsAppWebUrl,
} from "@/lib/whatsapp";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";
import { getCachedLead, setCachedLead } from "@/lib/leadGate";

const QUICK_ACTIONS = [
  { label: "Get a product quote", msg: "Hi, I need a quote for Samsung display products." },
  { label: "Video wall inquiry", msg: "Hi, I'd like to know more about Samsung video wall solutions." },
  { label: "Hotel TV solutions", msg: "Hi, I'm looking for Samsung hotel TV solutions for my property." },
];

const FIELDS = [
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Company Email", type: "email", placeholder: "you@company.com" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
] as const;

// WhatsApp brand mark — reused for the floating button and the Web CTA.
const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

/** Business hours: Mon–Sat, 9 AM–6 PM. Used to set expectations and pick the
 *  default tab (WhatsApp when we can reply instantly; capture form when away). */
function isOnline(): boolean {
  const h = new Date().getHours();
  const d = new Date().getDay(); // 0=Sun, 6=Sat
  return d !== 0 && h >= 9 && h < 18;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"whatsapp" | "message">("whatsapp");
  const [unread, setUnread] = useState(1);

  // Capture-form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<Record<string, string>>({});

  const online = isOnline();
  const waLink = buildWhatsAppUrl(getWhatsAppMessage(pathname)); // wa.me — QR opens the phone's app

  // Open the panel: clear the unread badge, reset the form, prefill from any
  // earlier gated lead, and default the tab by availability.
  const openPanel = (forceTab?: "whatsapp" | "message") => {
    setUnread(0);
    setSubmitError("");
    setSubmittedName(null);
    setTab(forceTab ?? (online ? "whatsapp" : "message"));
    const cached = getCachedLead();
    setPrefill(cached ? { name: cached.name, email: cached.email, phone: cached.phone } : {});
    setIsOpen(true);
  };

  const openWhatsApp = (msg?: string) => {
    const text = msg ?? getWhatsAppMessage(pathname);
    trackEvent("whatsapp_click", { source: "chat_widget", page: pathname });
    // Desktop: route to WhatsApp Web, which skips the wa.me interstitial.
    window.open(buildWhatsAppWebUrl(text), "_blank", "noopener,noreferrer");
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string) ?? "";
    const email = (fd.get("email") as string) ?? "";
    const phone = (fd.get("phone") as string) ?? "";
    const message = (fd.get("message") as string) ?? "";
    const company_website = (fd.get("company_website") as string) ?? "";

    const payload: Record<string, string> = {
      name,
      email,
      phone,
      message,
      company_website, // honeypot — API silently drops if filled
      inquiry_type: "Website Chat",
      subject: "New Website Chat Message",
      from_name: "Aplus Website Chat",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Cache so later downloads/quote skip the lead gate.
        setCachedLead({ name, email, phone });
        trackEvent("chat_lead_captured", { page: pathname });
        setSubmittedName(name);
      } else {
        setSubmitError(
          res.status === 429
            ? "Too many requests. Please wait a few minutes and try again."
            : res.status === 413
            ? "Your message is too long. Please shorten it and try again."
            : "Something went wrong. Please try again, or reach us on WhatsApp above."
        );
        trackEvent("chat_lead_failed", { page: pathname, status: res.status });
      }
    } catch (err) {
      console.error("Chat submission failed", err);
      setSubmitError(
        "We couldn't reach our server. Check your connection and try again, or use WhatsApp above."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Desktop-only. On mobile, MobileStickyCTA provides WhatsApp/Call/Quote.
    <div className="hidden md:contents">
      {/* Floating WhatsApp button — opens the panel on the WhatsApp tab */}
      <div className="fixed bottom-24 right-5 z-50">
        {online && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
        )}
        <button
          onClick={() => openPanel("whatsapp")}
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d={WA_PATH} />
          </svg>
        </button>
      </div>

      {/* Main chat toggle button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40 transition-all hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="text-white" size={22} />
        ) : (
          <>
            <MessageCircle className="text-white" size={24} />
            {unread > 0 && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-50 w-90 max-w-[calc(100vw-24px)] bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass border border-white/40 overflow-hidden flex flex-col"
          style={{ maxHeight: "560px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center gap-3">
            <div className="relative shrink-0">
              <Image
                src="/logo.png"
                alt="Aplus Technology"
                width={36}
                height={36}
                className="rounded-lg bg-white p-0.5 object-contain"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-600 ${online ? "bg-green-400" : "bg-gray-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm truncate">Aplus Technology Solutions</div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-300" : "bg-gray-300"}`} />
                <span className="text-blue-100 text-xs">
                  {online ? "Online — replies in minutes" : "Away — replies next business day"}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition-colors" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["whatsapp", "message"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t === "whatsapp" ? "💬 WhatsApp" : "✉️ Leave a message"}
              </button>
            ))}
          </div>

          {/* WhatsApp tab */}
          {tab === "whatsapp" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-gray-500 text-xs text-center">
                Connect with our sales team on WhatsApp
              </p>

              {/* Open WhatsApp Web */}
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
                    Scan with your phone's camera to open this chat in WhatsApp on your mobile.
                  </p>
                </div>
              </div>

              {/* Quick action chips */}
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

              {/* Contact alternatives */}
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
          )}

          {/* Message tab — capture form (or success state) */}
          {tab === "message" &&
            (submittedName !== null ? (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center text-center gap-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full ring-8 ring-green-50/50">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Message received!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Thanks{submittedName ? `, ${submittedName}` : ""} — our sales team will reply
                    {online ? " within minutes." : " the next business day."}
                  </p>
                </div>
                <div className="w-full pt-2 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Want to talk right now?</p>
                  <button
                    onClick={() => openWhatsApp()}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    Open WhatsApp Web
                  </button>
                  <a href={PHONE_TEL} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-semibold text-sm transition-all">
                    <Phone size={15} /> Call {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  {online
                    ? "Send us a message — we'll reply within minutes."
                    : "We're away right now. Leave your details and we'll reply the next business day."}
                </p>

                {/* Honeypot — hidden from users; bots that fill it are dropped */}
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
                    placeholder="How can we help?"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm resize-none"
                  />
                </div>

                {submitError && (
                  <div role="alert" className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send size={15} /> Send message
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-gray-400">
                  Prefer WhatsApp? Switch to the WhatsApp tab above.
                </p>
              </form>
            ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (If `tsc` reports unused imports, remove them — the list above is already pruned.)

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors for `components/ChatWidget.tsx`.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds; `qrcode.react` resolves in the client bundle.

- [ ] **Step 6: Runtime verification**

Use the `verify` skill to launch the dev server and drive the widget on a desktop viewport. Confirm:
- Clicking the green floating button opens the panel on the **WhatsApp** tab (during business hours) showing "Open WhatsApp Web", the QR code, quick chips, and phone/email.
- The QR renders as an SVG and encodes the `wa.me` link for the current page.
- Clicking the blue button opens the panel; the default tab is **WhatsApp** in hours / **Leave a message** when away.
- On the message tab, submitting with an empty field is blocked by native validation; a full submit hits `POST /api/contact` (inspect the Network tab) and shows the "Message received!" success state.
- With the network throttled/offline, submit shows the inline error and the WhatsApp/phone options remain reachable (no dead end).

Note: `/api/contact` needs `RESEND_API_KEY` in `.env.local` to fully succeed; if it's absent locally, verify the request is sent and the error path renders gracefully instead.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json components/ChatWidget.tsx
git commit -m "feat(chat): capture desktop chat leads + graceful WhatsApp fallback

The 'Leave a message' tab now posts to /api/contact (email + Zoho) so a
desktop visitor without WhatsApp never loses their message. The WhatsApp
tab gains an 'Open WhatsApp Web' button and a scan-to-continue QR. Default
tab follows business hours; form prefills/caches via the lead gate.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Capture-first Message tab → Task 2 (form + `POST /api/contact`). ✅
- `inquiry_type: "Website Chat"` tag → Task 2 payload. ✅
- Prefill + `setCachedLead` → Task 2. ✅
- Honeypot field → Task 2. ✅
- WhatsApp Web button + `buildWhatsAppWebUrl` → Task 1 + Task 2. ✅
- Scan-to-continue QR (`qrcode.react`, `wa.me` payload) → Task 2. ✅
- Time-aware default tab via `isOnline()` → Task 2 `openPanel`. ✅
- Two floating buttons retained → Task 2. ✅
- Error handling never a dead end → Task 2 `handleSubmit` + Step 6 verification. ✅
- Unit test for `buildWhatsAppWebUrl` → Task 1. ✅
- Route/Zoho/leadGate unchanged → no task modifies them (constraint). ✅
- Mobile untouched → no task touches `MobileStickyCTA`. ✅

**Placeholder scan:** No TBD/TODO; all code blocks are complete. ✅

**Type consistency:** `buildWhatsAppWebUrl(message: string): string` defined in Task 1 and consumed with a string arg in Task 2. `getCachedLead()` returns `{name,email,phone,company?}`; Task 2 reads `name/email/phone` only. `setCachedLead({name,email,phone})` matches `GatedLead`. `trackEvent(name, params)` matches `lib/analytics.ts`. ✅

**Out of scope (confirmed not built):** admin dashboard, message DB, product on/off, analytics/SEO managers, other desktop WhatsApp buttons (PDP/ShareButtons/LeadGateModal).
