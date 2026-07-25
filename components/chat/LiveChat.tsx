"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Send, Phone, Loader2 } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { isSendable, MAX_MESSAGE_LEN } from "@/lib/chat/messages";
import { formatClock, formatShortDate } from "@/lib/chat/time";
import { resolvePageLabel } from "@/lib/chat/pageLabel";
import type { Conversation } from "@/lib/chat/types";
import MessageAttachment from "./MessageAttachment";
import { getCachedLead } from "@/lib/leadGate";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const FIELDS = [
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Company Email", type: "email", placeholder: "you@company.com" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 99999 99999" },
] as const;

/**
 * The live-chat path (spec §3.2). Two states in one component:
 *
 *   no conversation yet → the PRE-CHAT FORM. Same contract as today's capture
 *     form (same fields, same honeypot, same getCachedLead prefill) because it
 *     still produces the same email + Zoho lead — that is the durable backup
 *     that makes §6 safe. It just now ALSO opens a live thread.
 *
 *   conversation exists → the THREAD. Streams over onSnapshot; resumes across
 *     pages and visits via the persisted anonymous uid.
 */
export default function LiveChat({ onWhatsApp }: { onWhatsApp: () => void }) {
  const pathname = usePathname();
  const { ready, conversationId, conversation, messages, error, resumeExpired, startConversation, sendMessage } = useChat();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState("");
  // Lazy initializer, not an Effect: ChatLauncher (Task 17) loads this component
  // via `dynamic(..., { ssr: false })`, so it only ever mounts client-side —
  // reading localStorage here is safe. Computing it up front means the very
  // first render already shows the prefilled values (no extra render, no
  // react-hooks/set-state-in-effect violation, no need to force-remount the
  // inputs afterwards the way an effect-driven prefill would).
  const [prefill] = useState<Record<string, string>>((): Record<string, string> => {
    const cached = getCachedLead();
    if (!cached) return {};
    return { name: cached.name, email: cached.email, phone: cached.phone };
  });

  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const fd = new FormData(e.currentTarget);
    const name = ((fd.get("name") as string) ?? "").trim();
    const email = ((fd.get("email") as string) ?? "").trim();
    const phone = ((fd.get("phone") as string) ?? "").trim();
    const message = ((fd.get("message") as string) ?? "").trim();

    // Whitespace-only values satisfy `required` but make junk CRM leads.
    if (!name || !email || !phone || !message) {
      setFormError("Please fill in your name, email, phone, and message.");
      setSubmitting(false);
      return;
    }
    // The honeypot is never read here: /api/contact drops filled ones server-side
    // (it 200s silently so bots don't learn the field is a trap). We just forward
    // it, which useConversation does.
    try {
      await startConversation({ customer: { name, email, phone }, message, page: pathname });
    } catch {
      setFormError("We couldn't start the chat. Try WhatsApp or call us below.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!isSendable({ text })) return;
    setDraft("");
    await sendMessage(text).catch(() => setDraft(text)); // put it back if it failed
  }

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 size={20} className="animate-spin text-gray-300" />
      </div>
    );
  }

  // Firebase unreachable ⇒ never a dead end (spec §11).
  if (error && !conversationId) {
    return (
      <div className="flex-1 p-4 space-y-3">
        <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          {error} Please use WhatsApp or call us — we&apos;ll reply right away.
        </div>
        <Fallbacks onWhatsApp={onWhatsApp} />
      </div>
    );
  }

  // ── pre-chat form ────────────────────────────────────────────────────────
  if (!conversationId) {
    return (
      <form onSubmit={handleStart} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* A resume link that couldn't be redeemed (spec §6.3) — the session is
            still usable, so we invite them to start fresh rather than dead-end. */}
        {resumeExpired && (
          <div role="alert" className="space-y-2.5 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <p className="text-xs">
              That chat link has expired. Start a new chat below, or reach us on WhatsApp.
            </p>
            <Fallbacks onWhatsApp={onWhatsApp} />
          </div>
        )}
        <p className="text-xs text-gray-500 text-center">
          Tell us who you are and we&apos;ll start chatting right away.
        </p>

        {/* Honeypot — hidden from users; bots that fill it are dropped by /api/contact */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />

        {FIELDS.map(({ id, label, type, placeholder }) => (
          <div key={id}>
            <label htmlFor={`chat-${id}`} className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {label}
            </label>
            <input
              required
              id={`chat-${id}`}
              name={id}
              type={type}
              placeholder={placeholder}
              // prefill is fixed for this mount (lazy-initialized once, never
              // re-set), so — unlike ChatWidget's version of this form — there is
              // no later value for defaultValue to miss and no need to force a
              // remount to pick it up.
              defaultValue={prefill[id] ?? ""}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm"
            />
          </div>
        ))}

        <div>
          <label htmlFor="chat-message" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Message
          </label>
          <textarea
            required
            id="chat-message"
            name="message"
            rows={3}
            maxLength={MAX_MESSAGE_LEN}
            placeholder="How can we help?"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900 text-sm resize-none"
          />
        </div>

        {formError && (
          <div role="alert" className="space-y-2.5 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <p className="text-xs">{formError}</p>
            <Fallbacks onWhatsApp={onWhatsApp} />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting…" : (<><Send size={15} /> Start chatting</>)}
        </button>
      </form>
    );
  }

  // ── live thread ──────────────────────────────────────────────────────────
  return (
    <>
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {conversation && <OriginChip conversation={conversation} />}
        {messages.map((m, i) => {
          if (m.sender === "system") {
            return (
              <div key={m.id} className="space-y-2">
                <p className="text-[11px] text-center text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 leading-relaxed">
                  {m.text}
                </p>
                {/* §6.2 — every away/timeout state offers a route to a human. */}
                <Fallbacks onWhatsApp={onWhatsApp} />
              </div>
            );
          }
          const mine = m.sender === "customer";
          // Show the "Aplus Sales" header only on the FIRST bubble of an agent
          // run — any customer/system message breaks the run.
          const prev = messages[i - 1];
          const showAgentHeader = m.sender === "agent" && (!prev || prev.sender !== "agent");
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {showAgentHeader && (
                <div className="flex items-center gap-1.5 mb-1 ml-0.5">
                  <Image
                    src="/logo.png"
                    alt="Aplus"
                    width={16}
                    height={16}
                    className="rounded bg-white object-contain"
                  />
                  <span className="text-[11px] font-semibold text-gray-600">Aplus Sales</span>
                  {formatClock(m.createdAt) && (
                    <span className="text-[10px] text-gray-400">{formatClock(m.createdAt)}</span>
                  )}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                <MessageAttachment attachment={m.attachment} link={m.link} />
              </div>
            </div>
          );
        })}
        <div ref={threadEnd} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="Type a message…"
          aria-label="Type a message"
          className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900 placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={!isSendable({ text: draft })}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </>
  );
}

/** Origin chip: where and when the chat began (design §3). */
function OriginChip({ conversation }: { conversation: Conversation }) {
  const label = resolvePageLabel({ pageTitle: conversation.pageTitle, page: conversation.page });
  const date = formatShortDate(conversation.createdAt);
  const text =
    conversation.startedBy === "agent"
      ? "Aplus Sales started this chat"
      : `You started this chat from ${label}`;
  return (
    <div className="text-center">
      <span className="inline-block text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
        {text}
        {date ? ` · ${date}` : ""}
      </span>
    </div>
  );
}

/** Never a dead end (spec §6.2): WhatsApp + phone, wherever things go wrong. */
function Fallbacks({ onWhatsApp }: { onWhatsApp: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onWhatsApp}
        className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-all"
      >
        WhatsApp
      </button>
      <a
        href={PHONE_TEL}
        className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-2 py-2 rounded-lg font-semibold text-xs transition-all"
      >
        {/* Keep the icon fixed and the number on one line — it was wrapping
            mid-number ("09909" dropping to a second row) in the narrow button. */}
        <Phone size={13} className="shrink-0" />
        <span className="whitespace-nowrap">Call {PHONE_DISPLAY}</span>
      </a>
    </div>
  );
}
