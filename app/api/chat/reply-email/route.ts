import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { getResend, serverError } from "@/lib/apiErrors";
import { guardRequest, verifyOwner } from "@/lib/chat/apiGuards";
import { COL, toMillis } from "@/lib/chat/types";
import { shouldEmailReply } from "@/lib/chat/replyEmail";
import { buildResumeUrl } from "@/lib/chat/resumeToken";
import { safeHttpUrl } from "@/lib/chat/safeUrl";
import { esc } from "@/lib/chat/htmlEsc";

/**
 * Email an agent reply to a customer who has left (spec §6.3).
 *
 * Called by the console after each agent send. The DECISION (offline? recently
 * emailed? do we even have an address?) lives in lib/chat/replyEmail.ts and is
 * unit-tested; this route just gathers the facts and acts.
 *
 * The email carries a SIGNED RESUME LINK. Without it, a customer opening the
 * mail on their phone would have no anonymous session and the rules would
 * (correctly) refuse them their own thread.
 *
 * Failure is non-fatal (spec §11): the reply still lives in the thread, and the
 * console still offers the one-click WhatsApp button.
 */

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const blocked = guardRequest(req, "chat-reply-email", RATE_LIMIT, RATE_WINDOW_MS);
    if (blocked) return blocked;

    const body = (await req.json()) as { conversationId?: unknown; messageId?: unknown };
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const messageId = typeof body.messageId === "string" ? body.messageId : "";
    if (!conversationId || !messageId) {
      return NextResponse.json({ success: false, message: "Missing ids." }, { status: 400 });
    }

    const check = await verifyOwner(req, conversationId);
    if (!check.ok) return NextResponse.json({ success: false }, { status: check.status });

    // Only an agent's reply gets emailed to the customer. A customer calling this
    // route about their own conversation must not be able to mail themselves.
    if (!check.isAgent) return NextResponse.json({ success: false }, { status: 403 });

    const secret = process.env.CHAT_RESUME_SECRET;
    if (!secret) {
      console.error("[chat/reply-email] CHAT_RESUME_SECRET is not set");
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const db = getAdminDb();
    const conversation = check.conversation;
    const customerEmail: string = conversation.customer?.email ?? "";
    const customerName: string = conversation.customer?.name ?? "";

    // Is the customer still watching? (visitors/{visitorId}.lastSeenAt)
    const visitorSnap = await db.collection(COL.visitors).doc(conversation.visitorId).get();
    const customerLastSeenAt = visitorSnap.exists ? toMillis(visitorSnap.data()?.lastSeenAt) : null;

    // When did we last email them? Debounce so a burst of agent messages becomes
    // ONE email rather than three (spec §6.3). No `where` needed: `orderBy` on a
    // field already excludes documents missing it, and dropping the `where`
    // avoids a `!=`-index requirement.
    const lastEmailed = await db
      .collection(COL.conversations)
      .doc(conversationId)
      .collection(COL.messages)
      .orderBy("emailedAt", "desc")
      .limit(1)
      .get();
    const lastEmailedAt = lastEmailed.empty ? null : toMillis(lastEmailed.docs[0].data().emailedAt);

    const decision = shouldEmailReply({
      customerEmail,
      customerLastSeenAt: customerLastSeenAt || null,
      lastEmailedAt,
      now: Date.now(),
    });

    if (!decision) {
      return NextResponse.json({ success: true, emailed: false });
    }

    const messageRef = db
      .collection(COL.conversations)
      .doc(conversationId)
      .collection(COL.messages)
      .doc(messageId);
    const messageSnap = await messageRef.get();
    if (!messageSnap.exists) {
      return NextResponse.json({ success: false, message: "No such message." }, { status: 404 });
    }
    const message = messageSnap.data()!;

    // Only an agent's reply is emailable. The console is the intended caller, but
    // the browser is untrusted (spec §9) — a stale or buggy caller passing a
    // customer's own messageId must not mail it back under "our sales team replied".
    if (message.sender !== "agent") {
      return NextResponse.json({ success: false, message: "Not an agent reply." }, { status: 404 });
    }

    const resumeUrl = buildResumeUrl(conversationId, secret);
    // Scheme-check before the URL lands in an email href — the same safeUrl gate
    // MessageAttachment.tsx applies (SECURITY invariant: never render a message URL
    // raw). esc() escapes HTML but would NOT stop a javascript:/data: scheme, and an
    // email client is the one place this content leaves the app entirely. Unsafe →
    // undefined → the attachment card is simply omitted.
    const attachmentUrl: string | undefined = safeHttpUrl(message.attachment?.url ?? message.link?.url);
    const attachmentLabel: string | undefined = message.attachment?.name ?? message.link?.label;

    // #4 fix: Stamp emailedAt BEFORE calling Resend (optimistic) so that any
    // concurrent call for the same conversation reads a recent emailedAt from the
    // orderBy("emailedAt","desc").limit(1) query and correctly bails out early.
    // Without this, two agent messages firing within the Resend round-trip both
    // read lastEmailedAt === null and both pass shouldEmailReply — the customer
    // gets two emails, defeating the "burst → ONE email" invariant.
    // On Resend failure we clear the stamp so the next genuine attempt is not
    // permanently suppressed.
    await messageRef.update({ emailedAt: FieldValue.serverTimestamp() });

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: customerEmail,
      replyTo: process.env.CONTACT_TO_EMAIL ?? "info@aplustechsol.com",
      subject: "Re: your chat with Aplus Technology Solutions",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
        <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase">Aplus Technology Solutions</div>
        <div style="font-size:20px;font-weight:700;color:#fff;margin-top:4px">Our sales team replied</div>
      </td></tr>
      <tr><td style="padding:24px 32px">
        <p style="font-size:14px;color:#111827;margin:0 0 16px">Hi ${esc(customerName)},</p>
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-left:3px solid #2563eb;border-radius:8px;padding:16px;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${esc(message.text ?? "")}</div>
        ${
          attachmentUrl
            ? `<p style="margin:16px 0 0"><a href="${esc(attachmentUrl)}" style="font-size:13px;color:#2563eb;font-weight:600">&#128206; ${esc(attachmentLabel ?? "Attachment")}</a></p>`
            : ""
        }
        <p style="margin:24px 0 0">
          <a href="${resumeUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">Reply in the chat &#8594;</a>
        </p>
        <p style="font-size:12px;color:#9ca3af;margin:16px 0 0">Or just reply to this email — it reaches the same team.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    });

    if (error) {
      console.error("[chat/reply-email][resend]", error);
      // Roll back the optimistic stamp so the next attempt is not suppressed.
      await messageRef.update({ emailedAt: FieldValue.delete() }).catch(() => {});
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailed: true });
  } catch (err) {
    return serverError("api/chat/reply-email", err);
  }
}

