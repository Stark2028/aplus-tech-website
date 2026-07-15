"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getAuthClient, getDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { trackEvent } from "@/lib/analytics";
import { setCachedLead } from "@/lib/leadGate";
import { COL, toMillis, type ChatCustomer, type ChatMessage, type Conversation } from "./types";
import { buildPreview } from "./messages";
import { shouldEscalate } from "./escalation";

const TIMEOUT_NOTICE =
  "Sorry — our team is tied up. We have your details and will reply on WhatsApp/email shortly.";

interface StartInput {
  customer: ChatCustomer;
  message: string;
  page: string;
}

/**
 * The customer's whole side of the chat (spec §3.2).
 *
 * Signs in anonymously (the uid IS the visitor id and the conversation's
 * ownerUid — never the IP, spec §7), resumes the visitor's existing open thread
 * across pages and visits, streams messages, and runs the 3-minute unanswered
 * timer.
 *
 * Ordering note on startConversation: the durable capture (/api/contact → Resend
 * email + Zoho lead) is fired even if the Firestore write fails. The whole point
 * of §6 is that the LEAD EXISTS BEFORE ANYONE REPLIES — a Firebase outage must
 * cost us the live chat, not the customer.
 */
export function useConversation() {
  // isFirebaseConfigured() reads build-time env, so it never changes across
  // renders — deciding "unavailable" via a lazy initializer (rather than an
  // effect that calls setState) is both correct and avoids a wasted render.
  const [ready, setReady] = useState(() => !isFirebaseConfigured());
  const [uid, setUid] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(() =>
    isFirebaseConfigured() ? null : "Chat is unavailable right now."
  );

  // Reset the thread synchronously when the conversation changes. Doing this in
  // an effect would let one render escape with the previous conversation's
  // messages under the new id; adjusting state during render closes that window.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    setMessages([]);
  }

  // ── resume from an emailed link (spec §6.3) ───────────────────────────────
  // /api/chat/resume lands us on /?chat=resume#t=<customToken>; exchange it for
  // a session as the ORIGINAL ownerUid, so the rules let them back into their
  // own thread even in a browser that has never seen this site. This must run
  // BEFORE the anonymous-identity effect below, so a resume token wins over
  // minting a fresh anonymous uid.
  const [resuming, setResuming] = useState(() =>
    typeof window !== "undefined" && window.location.hash.startsWith("#t=")
  );
  // A failed redemption is NOT the Firebase-unreachable dead end: the anonymous
  // effect below still mints a working session, so the customer can just start a
  // fresh chat. This flag drives an inline "that link expired" notice ABOVE the
  // pre-chat form rather than the blocking `error` screen (spec §6.2 — a resume
  // that fails must never strand them on a WhatsApp-only fallback).
  const [resumeExpired, setResumeExpired] = useState(false);

  useEffect(() => {
    if (!resuming || !isFirebaseConfigured()) return;

    const customToken = decodeURIComponent(window.location.hash.slice(3));
    // Strip the token from the URL immediately — it must not survive into a
    // bookmark, a shared link, or the back/forward history.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    signInWithCustomToken(getAuthClient(), customToken)
      .catch(() => setResumeExpired(true))
      .finally(() => setResuming(false));
  }, [resuming]);

  // ── anonymous identity ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getAuthClient();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setReady(true);
    });
    // Anonymous sign-in is idempotent — an existing session is reused, which is
    // what lets a returning visitor land back in their own thread. Skipped
    // while a resume token is being redeemed above, so the two never race.
    if (!auth.currentUser && !resuming) {
      void signInAnonymously(auth).catch(() => {
        setError("Chat is unavailable right now.");
        setReady(true);
      });
    }
    return unsubscribe;
  }, [resuming]);

  // ── find this visitor's open conversation ─────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(getDb(), COL.conversations),
      where("ownerUid", "==", uid),
      where("status", "==", "open"),
      orderBy("lastMessageAt", "desc"),
      limit(1)
    );
    return onSnapshot(
      q,
      (snap) => {
        const first = snap.docs[0];
        if (!first) {
          setConversationId(null);
          setConversation(null);
          return;
        }
        const data = first.data();
        setConversationId(first.id);
        setConversation({
          id: first.id,
          visitorId: data.visitorId,
          ownerUid: data.ownerUid,
          customer: data.customer,
          startedBy: data.startedBy,
          page: data.page,
          status: data.status,
          needsFollowUp: Boolean(data.needsFollowUp),
          createdAt: toMillis(data.createdAt),
          lastMessageAt: toMillis(data.lastMessageAt),
          lastPreview: data.lastPreview ?? "",
          lastSender: data.lastSender ?? "customer",
          unreadForAgent: data.unreadForAgent ?? 0,
        });
      },
      () => setError("Chat is unavailable right now.")
    );
  }, [uid]);

  // ── stream the thread ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(getDb(), COL.conversations, conversationId, COL.messages),
      orderBy("createdAt", "asc"),
      limit(200)
    );
    return onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sender: data.sender,
              text: data.text ?? "",
              createdAt: toMillis(data.createdAt),
              emailedAt: data.emailedAt ? toMillis(data.emailedAt) : undefined,
              attachment: data.attachment,
              link: data.link,
            };
          })
        );
      },
      () => setError("We lost the connection. Try WhatsApp or call us.")
    );
  }, [conversationId]);

  // ── the 3-minute unanswered timer (spec §6.1) ─────────────────────────────
  // Runs in the WAITING CUSTOMER'S OWN BROWSER, which is exactly why the safety
  // net fires when no console is open anywhere: no cron, no paid plan.
  const escalating = useRef(false);
  useEffect(() => {
    if (!conversationId || !conversation) return;

    const lastCustomerMessageAt =
      [...messages].reverse().find((m) => m.sender === "customer")?.createdAt ?? null;
    const lastAgentMessageAt =
      [...messages].reverse().find((m) => m.sender === "agent")?.createdAt ?? null;

    const check = async () => {
      const due = shouldEscalate({
        lastCustomerMessageAt,
        lastAgentMessageAt,
        needsFollowUp: conversation.needsFollowUp,
        now: Date.now(),
      });
      if (!due || escalating.current) return;
      escalating.current = true;

      const db = getDb();
      // The apology lands in the thread even if the route below fails.
      await addDoc(collection(db, COL.conversations, conversationId, COL.messages), {
        sender: "system",
        text: TIMEOUT_NOTICE,
        createdAt: serverTimestamp(),
      }).catch(() => {});

      const idToken = await getAuthClient().currentUser?.getIdToken();
      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {
        // Non-fatal (spec §11): the message is stored, and the chat-start email
        // + Zoho lead already landed. The flag is a convenience, not the record.
      });

      trackEvent("chat_unanswered", { conversationId });
    };

    void check();
    const id = setInterval(check, 20_000);
    return () => clearInterval(id);
  }, [conversationId, conversation, messages]);

  // ── actions ───────────────────────────────────────────────────────────────

  const startConversation = useCallback(
    async ({ customer, message, page }: StartInput) => {
      if (!uid) throw new Error("not-ready");
      const db = getDb();
      const preview = buildPreview({ text: message });

      const convRef = await addDoc(collection(db, COL.conversations), {
        visitorId: uid,
        ownerUid: uid,
        customer,
        startedBy: "customer",
        page,
        status: "open",
        needsFollowUp: false,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastPreview: preview,
        lastSender: "customer",
        unreadForAgent: 1,
      });

      await addDoc(collection(db, COL.conversations, convRef.id, COL.messages), {
        sender: "customer",
        text: message,
        createdAt: serverTimestamp(),
      });

      // The durable backup — email + Zoho lead — fires regardless of what the
      // live chat does next (spec §6.1: "the lead exists before anyone replies").
      void fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          message,
          company_website: "",
          inquiry_type: "Website Live Chat",
          subject: "New Website Live Chat",
          from_name: "Aplus Website Live Chat",
        }),
      }).catch(() => {});

      setCachedLead({ name: customer.name, email: customer.email, phone: customer.phone });
      trackEvent("chat_started", { page });
      setConversationId(convRef.id);
    },
    [uid]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) throw new Error("no-conversation");
      const db = getDb();

      await addDoc(collection(db, COL.conversations, conversationId, COL.messages), {
        sender: "customer",
        text,
        createdAt: serverTimestamp(),
      });

      // needsFollowUp is deliberately untouched — the rules forbid the customer
      // from writing it (only /api/chat/escalate and the agent console may).
      await updateDoc(doc(db, COL.conversations, conversationId), {
        lastMessageAt: serverTimestamp(),
        lastPreview: buildPreview({ text }),
        lastSender: "customer",
        unreadForAgent: increment(1),
      });

      // A fresh customer message re-arms the timer.
      escalating.current = false;
      trackEvent("chat_message_sent", { conversationId });
    },
    [conversationId]
  );

  return { ready, conversationId, conversation, messages, error, resumeExpired, startConversation, sendMessage };
}
