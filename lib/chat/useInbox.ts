"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import {
  COL,
  toMillis,
  mapConversation,
  mapMessage,
  type ChatAttachment,
  type ChatLink,
  type ChatMessage,
  type Conversation,
  type VisitorDoc,
} from "./types";
import { buildPreview } from "./messages";

/**
 * The agent's inbox (spec §4). Streams every OPEN conversation, freshest first.
 *
 * Sort order is deliberate: needsFollowUp pins to the top (spec §4 — "pinned in
 * red"), then unread, then recency. A conversation the safety net has flagged is
 * the single most expensive thing in the list to miss, so it outranks everything.
 */
export function useInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(getDb(), COL.conversations),
      where("status", "==", "open"),
      orderBy("lastMessageAt", "desc"),
      limit(100)
    );

    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) =>
          mapConversation(d.id, d.data() as Record<string, unknown>)
        );

        rows.sort((a, b) => {
          if (a.needsFollowUp !== b.needsFollowUp) return a.needsFollowUp ? -1 : 1;
          const aUnread = a.unreadForAgent > 0;
          const bUnread = b.unreadForAgent > 0;
          if (aUnread !== bUnread) return aUnread ? -1 : 1;
          return b.lastMessageAt - a.lastMessageAt;
        });

        setConversations(rows);
      },
      (err) => {
        console.error("[useInbox]", err);
        setError("Could not load conversations. Check that this account has agent access.");
      }
    );
  }, []);

  return { conversations, error };
}

/** One conversation: its messages, the customer's presence, and the actions. */
export function useThread(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitor, setVisitor] = useState<VisitorDoc | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);

  // Reset the thread synchronously when the selected conversation changes. Doing
  // this in the streaming effect would let one render escape with the previous
  // conversation's messages under the new id (and a synchronous setState in an
  // effect is an ESLint error in this repo); adjusting state during render closes
  // that window. Mirrors lib/chat/useConversation.ts.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    setMessages([]);
    setVisitorId(null);
  }

  // Likewise clear the customer's presence the instant we point at a different
  // visitor, so a stale "Online" from the previous chat never bleeds through.
  const [prevVisitorId, setPrevVisitorId] = useState(visitorId);
  if (visitorId !== prevVisitorId) {
    setPrevVisitorId(visitorId);
    setVisitor(null);
  }

  useEffect(() => {
    if (!conversationId) return;

    const db = getDb();

    const unsubConv = onSnapshot(doc(db, COL.conversations, conversationId), (snap) => {
      setVisitorId(snap.data()?.visitorId ?? null);
    });

    const unsubMsgs = onSnapshot(
      query(
        collection(db, COL.conversations, conversationId, COL.messages),
        orderBy("createdAt", "asc"),
        limit(300)
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => mapMessage(d.id, d.data() as Record<string, unknown>))
        );
      }
    );

    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [conversationId]);

  // Is the customer still watching? (spec §5 — decides "keep typing" vs "call them")
  useEffect(() => {
    if (!visitorId) return;
    return onSnapshot(doc(getDb(), COL.visitors, visitorId), (snap) => {
      const data = snap.data();
      setVisitor(
        data
          ? {
              firstSeenAt: toMillis(data.firstSeenAt),
              lastSeenAt: toMillis(data.lastSeenAt),
              currentPage: data.currentPage ?? "",
              chatOpen: Boolean(data.chatOpen),
            }
          : null
      );
    });
  }, [visitorId]);

  const sendReply = useCallback(
    async (input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }) => {
      if (!conversationId) return;
      const db = getDb();
      const text = (input.text ?? "").trim();

      // Firestore rejects `undefined`. Build the doc from what is actually present.
      const payload: Record<string, unknown> = {
        sender: "agent",
        text,
        createdAt: serverTimestamp(),
      };
      if (input.attachment) payload.attachment = input.attachment;
      if (input.link) payload.link = input.link;

      const messageRef = await addDoc(
        collection(db, COL.conversations, conversationId, COL.messages),
        payload
      );

      await updateDoc(doc(db, COL.conversations, conversationId), {
        lastMessageAt: serverTimestamp(),
        lastPreview: buildPreview(input),
        lastSender: "agent",
        unreadForAgent: 0,
        // An agent reply IS the answer the safety net was waiting for (spec §6.1).
        needsFollowUp: false,
      });

      // Reach them even if they left (spec §6.3). Non-fatal: the reply is already
      // in the thread, and the console still offers the WhatsApp button.
      const idToken = await getAuthClient().currentUser?.getIdToken();
      void fetch("/api/chat/reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ conversationId, messageId: messageRef.id }),
      }).catch(() => {});
    },
    [conversationId]
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    await updateDoc(doc(getDb(), COL.conversations, conversationId), { unreadForAgent: 0 }).catch(
      () => {}
    );
  }, [conversationId]);

  const setStatus = useCallback(
    async (status: "open" | "closed") => {
      if (!conversationId) return;
      await updateDoc(doc(getDb(), COL.conversations, conversationId), { status });
    },
    [conversationId]
  );

  return { messages, visitor, sendReply, markRead, setStatus };
}
