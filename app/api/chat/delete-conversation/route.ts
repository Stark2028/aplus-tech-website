import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { serverError } from "@/lib/apiErrors";
import { guardRequest, verifyOwner } from "@/lib/chat/apiGuards";
import { COL } from "@/lib/chat/types";

/**
 * Permanently delete a whole conversation from the sales console (agent housekeeping).
 *
 * Runs on the server for one concrete reason: deleting a Firestore document does
 * NOT delete its subcollections. A client-side deleteDoc on the conversation would
 * leave every message doc orphaned — invisible in the app but still stored and
 * billed. recursiveDelete (Admin SDK) removes the conversation doc AND its whole
 * `messages` subcollection in a single operation, at any message count.
 *
 * The Admin SDK bypasses security rules, so the ownership/agent check here is the
 * only gate — it mirrors the escalate/reply-email routes.
 */

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const blocked = guardRequest(req, "chat-delete-conversation", RATE_LIMIT, RATE_WINDOW_MS);
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

    // Deleting the entire shared thread is an AGENT-ONLY power. verifyOwner also
    // accepts the conversation's customer-owner (that check exists for escalate/
    // reply-email), but a customer must never be able to erase the record a
    // salesperson relies on — so require the agent claim explicitly here.
    if (!check.isAgent) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const db = getAdminDb();
    await db.recursiveDelete(db.collection(COL.conversations).doc(conversationId));

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("api/chat/delete-conversation", err);
  }
}
