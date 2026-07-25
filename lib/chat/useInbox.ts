"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
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
import { buildPreview, summaryFromMessages } from "./messages";
import { isVisitorOnline } from "./presence";

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

/**
 * Closed conversations, newest first — lazily. Only subscribes while `enabled`
 * (the Closed tab is active), so the default console never streams closed
 * history. Reuses the (status, lastMessageAt) index the open inbox already uses.
 */
export function useClosedInbox(enabled: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clear the closed list the instant the tab is switched off (reset during render,
  // not in the effect — a synchronous setState in an effect body is an ESLint error
  // in this repo). Mirrors the prevConversationId pattern in useThread.
  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (!enabled) {
      setConversations([]);
      // Drop any stale error so it never lingers on the banner after the tab is left.
      setError(null);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    const q = query(
      collection(getDb(), COL.conversations),
      where("status", "==", "closed"),
      orderBy("lastMessageAt", "desc"),
      limit(50)
    );
    return onSnapshot(
      q,
      (snap) => {
        setConversations(
          snap.docs.map((d) => mapConversation(d.id, d.data() as Record<string, unknown>))
        );
      },
      (err) => {
        console.error("[useClosedInbox]", err);
        setError("Could not load closed conversations.");
      }
    );
  }, [enabled]);

  return { conversations, error };
}

/**
 * Real-time presence map for a list of visitor IDs.
 * Listens to visitors/{visitorId} for all unique IDs in the array and re-evaluates
 * isVisitorOnline periodically so stale presence decays to offline after 90s.
 */
export function useVisitorsPresence(visitorIds: string[]) {
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const uniqueIdsKey = Array.from(new Set(visitorIds.filter(Boolean))).sort().join(",");

  // When the visible set empties, clear presence during render rather than in the
  // effect — a synchronous setState in an effect body is an ESLint error in this
  // repo. Mirrors the prevConversationId guard in useThread and prevEnabled in
  // useClosedInbox above.
  const [prevIdsKey, setPrevIdsKey] = useState(uniqueIdsKey);
  if (uniqueIdsKey !== prevIdsKey) {
    setPrevIdsKey(uniqueIdsKey);
    if (!uniqueIdsKey) setPresenceMap({});
  }

  useEffect(() => {
    if (!uniqueIdsKey) return;
    const ids = uniqueIdsKey.split(",");

    const db = getDb();
    const lastSeenMap: Record<string, number> = {};

    const updatePresence = () => {
      const now = Date.now();
      const next: Record<string, boolean> = {};
      for (const id of ids) {
        next[id] = isVisitorOnline(lastSeenMap[id], now);
      }
      setPresenceMap(next);
    };

    const unsubs = ids.map((id) =>
      onSnapshot(
        doc(db, COL.visitors, id),
        (snap) => {
          const data = snap.data();
          if (data?.lastSeenAt) {
            lastSeenMap[id] = toMillis(data.lastSeenAt);
          } else {
            delete lastSeenMap[id];
          }
          updatePresence();
        },
        () => {
          delete lastSeenMap[id];
          updatePresence();
        }
      )
    );

    // Periodically re-evaluate so presence decays after 90s without waiting for snapshot
    const interval = setInterval(updatePresence, 15_000);

    return () => {
      unsubs.forEach((unsub) => unsub());
      clearInterval(interval);
    };
  }, [uniqueIdsKey]);

  return presenceMap;
}

/** One conversation: its messages, the customer's presence, and the actions. */
export function useThread(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitor, setVisitor] = useState<VisitorDoc | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    setMessages([]);
    setVisitorId(null);
    setError(null);
  }

  const [prevVisitorId, setPrevVisitorId] = useState(visitorId);
  if (visitorId !== prevVisitorId) {
    setPrevVisitorId(visitorId);
    setVisitor(null);
  }

  useEffect(() => {
    if (!conversationId) return;

    const db = getDb();

    const onError = (err: unknown) => {
      console.error("[useThread]", err);
      setError("Lost the live connection to this chat. Reload to reconnect.");
    };

    const unsubConv = onSnapshot(
      doc(db, COL.conversations, conversationId),
      (snap) => setVisitorId(snap.data()?.visitorId ?? null),
      onError
    );

    const unsubMsgs = onSnapshot(
      query(
        collection(db, COL.conversations, conversationId, COL.messages),
        orderBy("createdAt", "asc"),
        limitToLast(300)
      ),
      (snap) => {
        setMessages(
          snap.docs.map((d) => mapMessage(d.id, d.data() as Record<string, unknown>))
        );
      },
      onError
    );

    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!visitorId) return;
    return onSnapshot(
      doc(getDb(), COL.visitors, visitorId),
      (snap) => {
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
      },
      () => setVisitor(null)
    );
  }, [visitorId]);

  const sendReply = useCallback(
    async (input: { text?: string; attachment?: ChatAttachment; link?: ChatLink }) => {
      if (!conversationId) return;
      const db = getDb();
      const text = (input.text ?? "").trim();

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
        needsFollowUp: false,
      });

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

  // Hard-delete one message. The Firestore rule already allows an agent to delete
  // any message (firestore.rules — messages `allow update, delete: if isAgent()`),
  // and the live snapshot removes the bubble from BOTH this console and the
  // customer's open widget, since they render the same doc.
  const deleteMessage = useCallback(
    async (message: ChatMessage) => {
      if (!conversationId) return;
      const db = getDb();
      await deleteDoc(doc(db, COL.conversations, conversationId, COL.messages, message.id));

      // If the deleted message was the newest, the conversation's inbox summary
      // (lastPreview / lastSender / lastMessageAt) still describes a message that
      // no longer exists. Recompute it from what remains so the list line and the
      // inbox ordering stay honest. Only the newest message feeds the summary, so
      // deleting an older one needs no write. lastMessageAt is written as a
      // Timestamp (not a raw number): Firestore orders numbers before all
      // timestamps, so a number here would drop the row beneath every other
      // conversation in the inbox's orderBy("lastMessageAt").
      const wasNewest = messages.every(
        (m) => m.id === message.id || m.createdAt <= message.createdAt
      );
      if (!wasNewest) return;

      const summary = summaryFromMessages(messages.filter((m) => m.id !== message.id));
      await updateDoc(
        doc(db, COL.conversations, conversationId),
        summary
          ? {
              lastPreview: summary.lastPreview,
              lastSender: summary.lastSender,
              lastMessageAt: Timestamp.fromMillis(summary.lastMessageAt),
            }
          : { lastPreview: "" }
      ).catch(() => {});
    },
    [conversationId, messages]
  );

  // Permanently delete the whole conversation. Goes through the Admin-SDK route
  // (not a client write) because deleting the conversation doc does NOT remove
  // its `messages` subcollection — recursiveDelete on the server wipes the whole
  // tree in one call, regardless of message count. Throws on failure so the
  // caller keeps the thread on screen and surfaces an error.
  const deleteConversation = useCallback(async () => {
    if (!conversationId) return;
    const idToken = await getAuthClient().currentUser?.getIdToken();
    const res = await fetch("/api/chat/delete-conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ conversationId }),
    });
    if (!res.ok) throw new Error("delete-conversation-failed");
  }, [conversationId]);

  return { messages, visitor, error, sendReply, markRead, setStatus, deleteMessage, deleteConversation };
}
