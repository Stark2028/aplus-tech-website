import { NextResponse } from "next/server";
import { createZohoLead } from "@/lib/zoho";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getResend, serverError } from "@/lib/apiErrors";

// Delivery address for all form submissions.
// Set CONTACT_TO_EMAIL in .env.local (or your hosting platform's env vars).
// Never hard-code a personal or dev address here.
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@aplustechsol.com";

// Abuse throttle: 5 submissions per IP per 10 minutes.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// Anti-CSRF: browsers stamp a non-forgeable Origin on cross-site requests.
// We reject a *present-but-wrong* Origin (blocks browser-driven cross-site
// abuse) while allowing a missing Origin through, since non-browser clients
// (and some same-origin contexts) legitimately omit it — those are still
// covered by the per-IP rate limit and honeypot.
const ALLOWED_ORIGINS = new Set([
  "https://www.aplustechsol.com",
  "https://aplustechsol.com",
]);

// Allow local dev origins ONLY outside production, so forms are testable on
// localhost. This branch is dead in production builds — localhost is never
// accepted when NODE_ENV === "production".
const ALLOW_LOCALHOST = process.env.NODE_ENV !== "production";

// Vercel deployment URLs (per-commit preview, branch alias, and the project's
// production .vercel.app alias), taken from Vercel's own env vars rather than
// a *.vercel.app wildcard — anyone can deploy an unrelated project to
// some-name.vercel.app, so a wildcard would let any Vercel-hosted page pass
// the Origin gate. These env vars are absent off-Vercel, leaving only the
// custom domains above.
const VERCEL_ORIGINS = new Set(
  [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host.toLowerCase()}`)
);

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_ORIGINS.has(origin.toLowerCase())) return true;
  if (ALLOW_LOCALHOST && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

// Defensive caps so a single request can't carry an unbounded payload.
const MAX_FIELD_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Single-line, length-capped value safe to place in an email header. */
function headerSafe(value: string, max = 200): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

/** Escape user-supplied text before interpolating into the HTML email body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;width:140px">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600">${esc(value)}</td>
    </tr>`;
}

function buildQuoteEmail(b: Record<string, string>) {
  const items = (b.items_list ?? "")
    .split("\n")
    .map((l) => `<div style="font-size:13px;color:#374151;line-height:1.7">${esc(l)}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
            <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Aplus Technology Solutions</div>
            <div style="font-size:22px;font-weight:700;color:#fff">New Quote Request</div>
            <div style="font-size:13px;color:#bfdbfe;margin-top:4px">${esc(b.subject ?? "")}</div>
          </td>
        </tr>

        <!-- Contact details -->
        <tr><td style="padding:24px 32px 0">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Contact Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            ${row("Name", b.name ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Email", b.email ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Phone", b.phone ?? "")}
            ${b.requirements ? `<tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>${row("Notes", b.requirements)}` : ""}
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:24px 32px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Products Requested</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px">
            ${items}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;font-size:11px;color:#9ca3af;text-align:center">
            Reply directly to this email to respond to ${esc(b.name ?? "the customer")}.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildContactEmail(b: Record<string, string>) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
            <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Aplus Technology Solutions</div>
            <div style="font-size:22px;font-weight:700;color:#fff">New Contact Inquiry</div>
            <div style="font-size:13px;color:#bfdbfe;margin-top:4px">${esc(b.inquiry_type ?? "General")}</div>
          </td>
        </tr>

        <!-- Details -->
        <tr><td style="padding:24px 32px 0">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Contact Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            ${row("Name", b.name ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${b.company ? `${row("Company", b.company)}<tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>` : ""}
            ${row("Email", b.email ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Phone", b.phone ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Inquiry Type", b.inquiry_type ?? "")}
          </table>
        </td></tr>

        <!-- Message -->
        ${b.message ? `
        <tr><td style="padding:24px 32px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Message</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap">${esc(b.message)}</div>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;font-size:11px;color:#9ca3af;text-align:center">
            Reply directly to this email to respond to ${esc(b.name ?? "the customer")}.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    // Reject anything that isn't a JSON submission.
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ success: false, message: "Unsupported content type." }, { status: 415 });
    }

    // Reject cross-site browser requests (present-but-disallowed Origin).
    const origin = req.headers.get("origin");
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    // Per-IP rate limit to throttle spam / quota abuse.
    const limit = rateLimit(`contact:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!limit.ok) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const parsed: unknown = await req.json();

    // Body must be a plain JSON object. A parseable-but-wrong-shape body
    // (null, an array, a string, a number) would otherwise throw on the first
    // property access below and surface as a noisy 500; reject it as a clean
    // 400 instead. (typeof null === "object", so the null check is explicit.)
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
    }

    // Every field must be a string. The email builder interpolates values via
    // esc(), which calls String.prototype.replace — a non-string value (object,
    // array, number) would throw there and abort with a 500. Rejecting up front
    // keeps the contract (Record<string, string>) honest and the failure clean.
    for (const value of Object.values(parsed)) {
      if (typeof value !== "string") {
        return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
      }
    }
    const body = parsed as Record<string, string>;

    // Honeypot: bots fill hidden fields; humans leave them empty.
    // Silently accept (200) so bots don't learn the field is a trap.
    if (body.company_website || body.fax) {
      return NextResponse.json({ success: true });
    }

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    // Validate email shape and cap field lengths.
    if (!EMAIL_RE.test(body.email) || body.email.length > 320) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }
    for (const value of Object.values(body)) {
      if (typeof value === "string" && value.length > MAX_FIELD_LEN) {
        return NextResponse.json({ success: false, message: "Submission too large." }, { status: 413 });
      }
    }

    const resend = getResend();
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const isQuote = Boolean(body.items_list);
    const html = isQuote ? buildQuoteEmail(body) : buildContactEmail(body);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: headerSafe(body.email, 320),
      subject: headerSafe(body.subject ?? "New Inquiry — Aplus Technology Solutions"),
      html,
    });

    if (error) {
      console.error("[resend]", error);
      return NextResponse.json({ success: false, message: "Failed to send email." }, { status: 500 });
    }

    // Every submission becomes a CRM lead — quote carts, lead-gate downloads,
    // per-product quote requests, and contact inquiries alike. Zoho failure is
    // deliberately non-fatal: the email above already delivered the lead.
    if (process.env.ZOHO_REFRESH_TOKEN) {
      await createZohoLead(body).catch((err) => console.error("[zoho]", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("api/contact", err);
  }
}
