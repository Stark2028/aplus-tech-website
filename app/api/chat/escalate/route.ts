import { NextResponse } from "next/server";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { guardRequest, verifyOwner } from "@/lib/chat/apiGuards";
import { COL } from "@/lib/chat/types";
import { siteUrl } from "@/lib/chat/links";

/**
 * "Nobody replied" (spec §6.1).
 *
 * Fired by the WAITING CUSTOMER'S browser 3 minutes after their message goes
 * unanswered — which is precisely why it still works when no console is open
 * anywhere. The browser only decides *when*; everything privileged happens here,
 * behind an ownership check, because the caller is untrusted.
 *
 * Phase 1: flag the conversation + email info@. Phase 2 adds the push fan-out to
 * every agent device at this same choke point.
 *
 * The customer has ALREADY been captured (email + Zoho lead fired at chat start),
 * so a failure here loses a convenience, not the lead.
 */

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@aplustechsol.com";
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const blocked = guardRequest(req, "chat-escalate", RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) return blocked;

    const body = (await req.json()) as { conversationId?: unknown };
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    if (!conversationId) {
      return NextResponse.json({ success: false, message: "Missing conversationId." }, { status: 400 });
    }

    const check = await verifyOwner(req, conversationId);
    if (!check.ok) {
      return NextResponse.json({ success: false }, { status: check.status });
    }
    const { conversation } = check;

    // Idempotent: a re-fired timer must not re-email.
    if (conversation.needsFollowUp === true) {
      return NextResponse.json({ success: true, alreadyFlagged: true });
    }

    await getAdminDb().collection(COL.conversations).doc(conversationId).update({
      needsFollowUp: true,
      escalatedAt: FieldValue.serverTimestamp(),
    });

    const customer = conversation.customer ?? {};
    const consoleUrl = `${siteUrl()}/admin/chat?c=${encodeURIComponent(conversationId)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: TO_EMAIL,
      subject: `⚠️ Unanswered chat — ${esc(customer.name ?? "a visitor")}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:#b91c1c;padding:24px 32px">
        <div style="font-size:20px;font-weight:700;color:#fff">⚠️ Unanswered live chat</div>
        <div style="font-size:13px;color:#fecaca;margin-top:4px">Waiting 3+ minutes with no reply</div>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="font-size:14px;color:#111827;margin:0 0 8px"><strong>${esc(customer.name ?? "")}</strong></p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px">${esc(customer.email ?? "")} · ${esc(customer.phone ?? "")}</p>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px">On page: ${esc(conversation.page ?? "")}</p>
        <p style="font-size:13px;color:#374151;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 20px">${esc(conversation.lastPreview ?? "")}</p>
        <a href="${consoleUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:8px">Open the chat →</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    });

    if (error) console.error("[chat/escalate][resend]", error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/chat/escalate]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

/** Escape user-supplied text before interpolating into the HTML email body. */
function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
