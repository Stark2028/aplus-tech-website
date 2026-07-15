import "server-only";
import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COL } from "./types";

/**
 * Shared entry checks for every chat API route (spec §9: "escalate/notify/
 * reply-email all verify conversation ownership").
 *
 * The Origin allow-list mirrors app/api/contact/route.ts: reject a
 * present-but-wrong Origin (blocks browser-driven cross-site abuse), allow a
 * missing one (non-browser clients legitimately omit it, and they are still
 * covered by the rate limit and the ID-token check).
 */

const ALLOWED_ORIGINS = new Set([
  "https://www.aplustechsol.com",
  "https://aplustechsol.com",
]);

const ALLOW_LOCALHOST = process.env.NODE_ENV !== "production";

const VERCEL_ORIGINS = new Set(
  [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter((host): host is string => Boolean(host))
    .map((host) => `https://${host.toLowerCase()}`)
);

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_ORIGINS.has(origin.toLowerCase())) return true;
  if (ALLOW_LOCALHOST && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

/** Content-type + Origin + per-IP rate limit. Returns a response, or null to proceed. */
export function guardRequest(
  req: Request,
  bucket: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ success: false, message: "Unsupported content type." }, { status: 415 });
  }

  const origin = req.headers.get("origin");
  if (origin && !isOriginAllowed(origin)) {
    return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
  }

  const result = rateLimit(`${bucket}:${clientIp(req)}`, limit, windowMs);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
    );
  }

  return null;
}

type OwnerCheck =
  | { ok: true; uid: string; isAgent: boolean; conversation: FirebaseFirestore.DocumentData }
  | { ok: false; status: number };

/**
 * Verify the caller holds a valid Firebase ID token AND owns the conversation
 * (or is an agent). This is THE check — the browser sending the request is
 * untrusted, and without it anyone could flag or email any conversation on the
 * site by guessing an id.
 */
export async function verifyOwner(req: Request, conversationId: string): Promise<OwnerCheck> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401 };

  let uid: string;
  let isAgent = false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
    isAgent = decoded.agent === true;
  } catch {
    return { ok: false, status: 401 };
  }

  const snap = await getAdminDb().collection(COL.conversations).doc(conversationId).get();
  if (!snap.exists) return { ok: false, status: 404 };

  const conversation = snap.data()!;
  if (!isAgent && conversation.ownerUid !== uid) return { ok: false, status: 403 };

  return { ok: true, uid, isAgent, conversation };
}
