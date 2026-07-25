"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  limit,
  limitToLast,
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
import { COL, mapConversation, mapMessage, type ChatCustomer, type ChatMessage, type Conversation } from "./types";
import { buildPreview } from "./messages";
import { shouldEscalate, shouldStopEscalating } from "./escalation";
import { isConversationDeleted } from "./conversationLifecycle";

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
export function useConversation(engaged = false) {
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

  // Reset the thread when the identity changes. The uid transitions A→B on the
  // resume flow (signInWithCustomToken swaps the anonymous uid for the original
  // ownerUid). Without this, the previous uid's conversationId/conversation
  // stayed in state and the message stream kept reading A's thread under B —
  // which the rules deny — and the empty-snapshot guard below (keyed on the
  // ref) refused to clear the stale id, freezing a returning visitor on a dead
  // thread with no error. Clearing state here detaches the old stream; the ref
  // itself is uid-tagged (see conversationIdRef) so B's snapshot isn't blocked.
  const [prevUid, setPrevUid] = useState(uid);
  if (uid !== prevUid) {
    setPrevUid(uid);
    setConversationId(null);
    setConversation(null);
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
  // Ref guard so StrictMode's dev double-invoke doesn't strip the hash before
  // the async signInWithCustomToken resolves (see the resume effect below).
  const hasResumed = useRef(false);

  useEffect(() => {
    if (!resuming || !isFirebaseConfigured()) return;

    // #8 fix: StrictMode double-invoke guard.
    // React StrictMode intentionally runs effects twice in development. Without
    // this guard the second run sees resuming === true but the hash was already
    // stripped by the first run — signInWithCustomToken("") rejects and a valid
    // resume link appears as "expired".
    if (hasResumed.current) return;
    hasResumed.current = true;

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
    // A persisted anonymous session is ALWAYS reused (onAuthStateChanged above
    // picks it up), so a returning visitor lands back in their own thread — and
    // their unanswered timer resumes — on page load without any new account.
    // But we only MINT a fresh anonymous account once the visitor actually
    // ENGAGES (opens the panel). Signing in eagerly for every visitor would
    // create an anonymous user + a Firestore listener on every page view before
    // anyone touches the chat. Skipped while a resume token is being redeemed
    // above, so the two never race.
    if (engaged && !auth.currentUser && !resuming) {
      void signInAnonymously(auth).catch(() => {
        setError("Chat is unavailable right now.");
        setReady(true);
      });
    }
    return unsubscribe;
  }, [resuming, engaged]);

  // ── find this visitor's open conversation ───────────────────────────────────────────
  // This listener only ever RUNS ONCE per uid, and its sole job is to DISCOVER an
  // existing open thread on load (and keep its metadata fresh). It must never
  // DESTROY the active thread: a brand-new conversation is not immediately
  // returned by this compound (ownerUid, status, lastMessageAt) query — its
  // lastMessageAt serverTimestamp hasn't resolved on the server yet — so the
  // query emits an empty snapshot for a beat right after startConversation()
  // created the doc. Nulling conversationId there wiped the thread (the
  // reset-during-render guard clears `messages` and the stream detaches),
  // dropping the customer's own first message AND the agent's reply until a full
  // refresh re-ran the query against the now-settled doc. So: an empty snapshot
  // clears the id ONLY when we do not already hold one. A genuine close is driven
  // by the agent setting status:'closed', which the widget does not need to react
  // to mid-session.
  // Kept in sync manually at every setConversationId call site (all of them
  // are subscription/event callbacks) — refs must not be written during render.
  // Tagged with the uid it belongs to so the empty-snapshot guard below can tell
  // "I hold an id for THIS visitor" from "I hold a stale id from a previous uid"
  // (the resume A→B transition), and never suppresses the clear across identities.
  const conversationIdRef = useRef<{ uid: string; id: string } | null>(null);
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
          // Transient empty for a freshly-created (or just-written) thread —
          // ignore it while we already have one FOR THIS uid. Only a visitor who
          // genuinely has no open thread (never started one, or a fresh identity
          // after a resume) falls through to null.
          if (conversationIdRef.current?.uid === uid) return;
          conversationIdRef.current = null;
          setConversationId(null);
          setConversation(null);
          return;
        }
        conversationIdRef.current = { uid, id: first.id };
        setConversationId(first.id);
        setConversation(mapConversation(first.id, first.data() as Record<string, unknown>));
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
      // limitToLast, NOT limit: with an ascending order, limit(n) keeps the
      // OLDEST n, so once a thread crossed 200 messages it pinned to messages
      // 1–200 and stopped updating forever. limitToLast keeps the most recent
      // 200 while preserving ascending render order.
      limitToLast(200)
    );
    return onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => mapMessage(d.id, d.data() as Record<string, unknown>))
        );
      },
      () => setError("We lost the connection. Try WhatsApp or call us.")
    );
  }, [conversationId]);

  // ── recover when the conversation is deleted from the console ───────────────
  // An agent can wipe a whole conversation from the sales console. The compound
  // "find open conversation" query above cannot see that: it only emits an
  // ambiguous empty snapshot, which its guard deliberately ignores so a freshly
  // created thread survives its transient-empty beat. Watching THIS conversation
  // by id is unambiguous — the doc exists the instant startConversation writes it
  // (so this never trips on the flap), and reports a server-confirmed absence
  // only on a real delete. When that happens, drop the dead id so the widget
  // falls back to the pre-chat form; otherwise the visitor keeps typing into a
  // thread whose message writes the rules now silently reject (ownsThread() does
  // get() on the missing conversation), i.e. "the message isn't going" until a
  // full refresh clears the stale in-memory id.
  useEffect(() => {
    if (!conversationId) return;
    return onSnapshot(
      doc(getDb(), COL.conversations, conversationId),
      (snap) => {
        if (!isConversationDeleted({ exists: snap.exists(), fromCache: snap.metadata.fromCache })) return;
        if (conversationIdRef.current?.id === conversationId) conversationIdRef.current = null;
        setConversationId(null);
        setConversation(null);
      },
      // A listen error is already surfaced by the message stream's onError above.
      () => {}
    );
  }, [conversationId]);

  // ── the 3-minute unanswered timer (spec §6.1) ──────────────────────────────────
  // Runs in the WAITING CUSTOMER'S OWN BROWSER, which is exactly why the safety
  // net fires when no console is open anywhere: no cron, no paid plan.
  // Two SEPARATE guards, deliberately not one. `noticePosted` stops the "team is
  // tied up" apology being written to the thread more than once; `escalated`
  // stops re-escalating only AFTER the server has actually accepted the alert.
  // Collapsing them (the old single `escalating` latch) meant a transient 500
  // from /api/chat/escalate latched escalation shut with no email ever sent —
  // the client never retried because the guard was already flipped.
  const noticePosted = useRef(false);
  const escalated = useRef(false);
  // Bounds the retry loop: a failed escalation (500, network error, or a 429
  // from a tripped rate limit) must not retry every 20s forever. After
  // MAX_ESCALATE_ATTEMPTS failures — or immediately on a 429 — we back off.
  const escalateFailures = useRef(0);
  const escalationStopped = useRef(false);
  useEffect(() => {
    if (!conversationId || !conversation) return;

    // C4 fix: single backward scan instead of two reverse().find() calls.
    // Previously the array was cloned and reversed twice per effect run
    // (keyed on messages, so runs on every new message).
    let lastCustomerMessageAt: number | null = null;
    let lastAgentMessageAt: number | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (lastCustomerMessageAt === null && m.sender === "customer") lastCustomerMessageAt = m.createdAt;
      if (lastAgentMessageAt === null && m.sender === "agent") lastAgentMessageAt = m.createdAt;
      if (lastCustomerMessageAt !== null && lastAgentMessageAt !== null) break;
    }

    const check = async () => {
      const due = shouldEscalate({
        lastCustomerMessageAt,
        lastAgentMessageAt,
        needsFollowUp: conversation.needsFollowUp,
        now: Date.now(),
      });
      if (!due || escalated.current || escalationStopped.current) return;

      const db = getDb();
      // The apology lands in the thread even if the route below fails — but only
      // once, no matter how many times we retry the escalation.
      if (!noticePosted.current) {
        noticePosted.current = true;
        await addDoc(collection(db, COL.conversations, conversationId, COL.messages), {
          sender: "system",
          text: TIMEOUT_NOTICE,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }

      // Only latch `escalated` on a 2xx. A non-2xx (e.g. a transient Resend
      // failure surfaced as 500) leaves it false so the next 20s tick retries —
      // and the server no longer sets needsFollowUp before a successful send, so
      // the retry is genuinely re-attempted rather than short-circuited.
      try {
        const idToken = await getAuthClient().currentUser?.getIdToken();
        const res = await fetch("/api/chat/escalate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({ conversationId }),
        });
        if (res.ok) {
          escalated.current = true;
          trackEvent("chat_unanswered", { conversationId });
        } else {
          escalateFailures.current += 1;
          if (shouldStopEscalating(escalateFailures.current, res.status)) {
            escalationStopped.current = true;
          }
        }
      } catch {
        // Network error — non-fatal (spec §11): the notice is stored and the
        // chat-start email + Zoho lead already landed. Retry on the next tick,
        // but give up after MAX_ESCALATE_ATTEMPTS so a persistent outage can't
        // hammer the endpoint forever.
        escalateFailures.current += 1;
        if (shouldStopEscalating(escalateFailures.current, null)) {
          escalationStopped.current = true;
        }
      }
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
        pageTitle: typeof document !== "undefined" ? document.title : "",
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
      conversationIdRef.current = { uid, id: convRef.id };
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

      // A fresh customer message re-arms the timer: a new unanswered message may
      // post another apology and escalate again (the server de-dupes via
      // needsFollowUp, so a still-flagged thread just returns alreadyFlagged).
      noticePosted.current = false;
      escalated.current = false;
      trackEvent("chat_message_sent", { conversationId });
    },
    [conversationId]
  );

  return { ready, conversationId, conversation, messages, error, resumeExpired, startConversation, sendMessage };
}
