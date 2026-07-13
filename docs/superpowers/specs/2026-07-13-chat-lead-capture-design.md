# Chat never loses a lead (desktop) — Design

**Date:** 2026-07-13
**Status:** Approved (design), pending implementation plan
**Scope owner:** desktop `ChatWidget` + WhatsApp entry points

## Problem

A desktop visitor who wants to talk to us often does not have the WhatsApp
Desktop app installed. Every WhatsApp/chat entry point on the site currently
builds a `wa.me/<number>?text=…` link (via `lib/whatsapp.ts`). On desktop that
link dumps the visitor on WhatsApp's "Continue to Chat" interstitial, which for
anyone without the desktop app looks broken — they give up.

Critically, the chat widget's **"Message Us" tab collects a typed message but
its only delivery mechanism is opening WhatsApp**. If WhatsApp never opens, the
message is never recorded anywhere. That is the lead leak: the visitor typed
their intent and we captured nothing.

### Key constraint

There is **no way to use WhatsApp on a desktop without a phone that has
WhatsApp** — WhatsApp Web/Desktop are mirrors of the phone and require a QR
link. So the fix is not a WhatsApp trick. It is: **capture the lead on our
server first, then offer WhatsApp as a bonus.**

## What is already safe (do not rebuild)

Leads already flow reliably through an existing pipeline:

- Quote form and contact form → `POST /api/contact` → **Resend email + Zoho CRM
  lead** (`app/api/contact/route.ts`, `lib/zoho.ts`).
- The route branches on `items_list`: present → quote email; absent →
  `buildContactEmail`. A chat message is contact-shaped, so no route change is
  needed.
- `createZohoLead` already reads `body.inquiry_type` and `body.message` into the
  lead Description, so a tagged chat submission is a well-formed, identifiable
  CRM lead with **no backend change**.

**Out of scope (separate future brainstorm):** admin dashboard, message
database, live two-way chat, product enable/disable, visitor IP/page analytics,
SEO management. These require a datastore + auth and are their own project. This
spec deliberately reuses the email + Zoho pipeline so no such infrastructure is
introduced.

## Goal

On desktop, a visitor who wants to reach us is **captured server-side the moment
they hit send** — before WhatsApp is attempted — and is **never** left on the
`wa.me` interstitial with no alternative. WhatsApp becomes a bonus path
(WhatsApp Web link + a scan-to-continue QR), not the only path.

Mobile is untouched: `MobileStickyCTA`'s direct `wa.me` deep link works well on
phones and stays as-is.

## Approach (chosen)

**Capture-first, WhatsApp-as-bonus.** The desktop chat panel leads with a real
capture form into the existing pipeline; WhatsApp Web + QR sit alongside as
convenience paths.

## Components

### 1. `components/ChatWidget.tsx` (desktop-only) — primary change

**"Message Us" tab → capture form.**
- Fields (all required): **Name, Email, Phone, Message** — matches
  `QuoteSubmitForm` field contract exactly.
- Plain controlled/FormData submission with native `required` validation
  (matches the sibling quote form; not react-hook-form, to keep the widget
  consistent and the change focused).
- Includes the hidden honeypot field `company_website` (the API already drops
  submissions that fill it).
- Prefill from `getCachedLead()` on mount; on success call `setCachedLead({name,
  email, phone})` so later downloads/quote skip the lead gate.
- Submit → `POST /api/contact` with payload:
  `{ name, email, phone, message, inquiry_type: "Website Chat", subject: "New
  Website Chat Message", from_name: "Aplus Website Chat" }`.
- On success → success sub-state ("Message received — we'll reply shortly")
  that also surfaces the WhatsApp bonus block (Web link + QR) as an optional
  "want to talk right now too?" path. Styled after `QuoteSuccessState`.
- Emit `trackEvent("chat_lead_captured", { page })` on success.

**"WhatsApp" tab → desktop-graceful.**
- **"Open WhatsApp Web"** button → `web.whatsapp.com/send?phone=<num>&text=<enc>`
  (skips the `wa.me` interstitial). Best for visitors already using WhatsApp Web
  on that computer.
- **QR code** encoding the page-aware `wa.me` link (from
  `getWhatsAppMessage(pathname)`), rendered via `qrcode.react`'s `<QRCodeSVG>`.
  Labelled: *"No WhatsApp on this computer? Scan with your phone to chat."* This
  is the direct answer to the phone-only visitor.
- Existing quick-inquiry chips: keep, but route via WhatsApp Web on desktop.
- Existing phone/email fallbacks: keep.

**Time-aware default tab.** Use the existing `isOnline()` helper:
- Online (Mon–Sat, 9–18): open panel on the **WhatsApp** tab (instant reply).
- Away: open panel on the **Message** (capture) tab, with an "we're away —
  leave a message and we'll reply next business day" note. WhatsApp gets no
  instant reply when away, so capturing the lead is strictly better.

**Floating buttons.** Keep both existing floating buttons (the green WhatsApp
badge is a trust signal). Both open the unified panel; green selects the
WhatsApp tab, blue selects the Message tab. No layout regression.

### 2. `lib/whatsapp.ts` — new helper

Add `buildWhatsAppWebUrl(message: string)` →
`https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${enc}` for the
desktop "Open WhatsApp Web" button and quick-inquiry chips. Keep the existing
`buildWhatsAppUrl` (`wa.me`) for the QR payload, since scanning a phone should
open the phone's WhatsApp app.

### 3. Dependency

Add `qrcode.react` (renders an inline SVG QR synchronously; ~5KB gzipped; no
external network calls, consistent with the site's self-contained posture).
`ChatWidget` is already a client component; the QR renders only when the
WhatsApp tab/bonus block is shown.

### 4. `app/api/contact/route.ts` — unchanged

A chat submission is contact-shaped (no `items_list`) and carries the required
`name`/`email`/`phone`, so `buildContactEmail` + `createZohoLead` handle it with
no code change. The `inquiry_type: "Website Chat"` tag makes the resulting email
and CRM lead identifiable.

## Data flow

```
Green WhatsApp button ─▶ panel (WhatsApp tab)
   ├─ Open WhatsApp Web ─▶ web.whatsapp.com/send?…       (no desktop app needed)
   ├─ QR ─▶ scan w/ phone ─▶ phone's WhatsApp opens chat (phone-only case ✓)
   └─ "leave a message" ─▶ Message tab
Blue chat button ─▶ panel (Message tab, or default per isOnline())
   └─ Name/Email/Phone/Message ─▶ POST /api/contact
          ├─▶ Resend email (buildContactEmail)
          └─▶ Zoho lead (inquiry_type "Website Chat")  ──▶ success state (+ WhatsApp bonus)
```

## Error handling — never a dead end

- Submit fails (network / 429 / 413 / 500): show a friendly inline error
  (reuse the quote form's status-specific messages) **and** keep the WhatsApp
  Web / QR / phone / email options visible so there is always another path.
- QR fails to render: silently hide the QR; keep the "Open WhatsApp Web" button
  and phone/email.
- Spam/abuse: the honeypot field and the per-IP rate limit already enforced by
  `/api/contact` now also cover chat submissions.

## Testing

- **Unit (Vitest):** `buildWhatsAppWebUrl` produces the correct
  `web.whatsapp.com/send` URL with an encoded message. (Follows
  `lib/productSort.test.ts` pattern.)
- **Runtime (`verify` skill):**
  - Panel opens; default tab follows `isOnline()`.
  - Message tab enforces all four required fields; submit hits `/api/contact`
    (inspect network); success sub-state renders; `setCachedLead` written.
  - "Open WhatsApp Web" opens the correct URL; QR renders and encodes the right
    `wa.me` link.
  - Kill the network → inline error shows *and* WhatsApp/phone fallbacks remain.
  - Confirm mobile (`MobileStickyCTA`) is unchanged.

## Non-goals / parked

- Other desktop WhatsApp buttons (PDP, `ShareButtons`, `LeadGateModal`) could be
  routed to WhatsApp Web for consistency, but their pages already have
  captured-form CTAs, so the leak there is minor. **Parked** to keep this change
  focused.
- Admin console (messages dashboard, product on/off, analytics, SEO) — separate
  brainstorm; leads remain visible via email inbox + Zoho CRM.
