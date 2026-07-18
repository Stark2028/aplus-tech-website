import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { verifyResumeToken } from "@/lib/chat/resumeToken";
import { COL } from "@/lib/chat/types";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { siteUrl } from "@/lib/chat/links";

/**
 * Resume a chat from an emailed link (spec §6.3).
 *
 * A GET from an email client, so it cannot use the JSON/Origin guards — the HMAC
 * IS the authentication. verifyResumeToken is constant-time and is bound to the
 * conversation id, so a token for one thread cannot open another.
 *
 * The minted custom token is returned in the URL FRAGMENT, not the query string:
 * fragments are never sent to the server and stay out of access logs, Referer
 * headers, and analytics. It is short-lived (Firebase custom tokens expire an
 * hour after minting), and redeeming it is idempotent — it only ever signs the
 * caller back in as the same ownerUid, so a replay grants nothing new.
 */

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("c") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const secret = process.env.CHAT_RESUME_SECRET;

  const fail = () => NextResponse.redirect(`${siteUrl()}/?chat=expired`, 302);

  // Brute-forcing a 256-bit HMAC is not realistic, but an unauthenticated GET
  // that mints tokens still deserves a throttle.
  const limit = rateLimit(`chat-resume:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) return fail();

  if (!secret) {
    console.error("[chat/resume] CHAT_RESUME_SECRET is not set");
    return fail();
  }
  if (!conversationId || !verifyResumeToken(conversationId, token, secret)) return fail();

  try {
    const snap = await getAdminDb().collection(COL.conversations).doc(conversationId).get();
    if (!snap.exists) return fail();

    const ownerUid: string = snap.data()!.ownerUid;
    if (!ownerUid) return fail();

    const customToken = await getAdminAuth().createCustomToken(ownerUid);

    return NextResponse.redirect(
      `${siteUrl()}/?chat=resume#t=${encodeURIComponent(customToken)}`,
      302
    );
  } catch (err) {
    console.error("[api/chat/resume]", err);
    return fail();
  }
}
