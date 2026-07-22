"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Phone, Mail, ArrowLeft, CheckCheck } from "lucide-react";
import type { ChatAttachment, ChatLink, Conversation } from "@/lib/chat/types";
import { useThread } from "@/lib/chat/useInbox";
import { isVisitorOnline, formatLastSeen } from "@/lib/chat/presence";
import { isSendable, MAX_MESSAGE_LEN } from "@/lib/chat/messages";
import MessageAttachment from "@/components/chat/MessageAttachment";
import AttachmentPicker from "./AttachmentPicker";
import LinkPicker from "./LinkPicker";
import { buildWhatsAppUrlTo } from "@/lib/whatsapp";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";

export default function ChatThread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const { messages, visitor, error: threadError, sendReply, markRead, setStatus } = useThread(conversation.id);
  const [draft, setDraft] = useState("");
  const [uploadError, setUploadError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  // #5 fix: include messages.length in deps so markRead re-fires whenever a new
  // customer message arrives while the agent is actively viewing the thread.
  // Previously the deps were [conversation.id, markRead] — both stable while a
  // thread is open — so the unread badge never cleared on new arrivals.
  useEffect(() => {
    void markRead();
  }, [conversation.id, markRead, messages.length]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const online = isVisitorOnline(visitor?.lastSeenAt ?? null);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!isSendable({ text })) return;
    setDraft("");
    await sendReply({ text }).catch(() => setDraft(text));
  }

  // Pickers send IMMEDIATELY on pick — an attachment or link does not wait for the
  // agent to also type. Any draft already typed rides along, then the box clears.
  const sendAttachment = async (attachment: ChatAttachment) => {
    setUploadError("");
    await sendReply({ text: draft.trim(), attachment }).catch(() =>
      setUploadError("Could not send that file.")
    );
    setDraft("");
  };

  const sendLink = async (link: ChatLink) => {
    await sendReply({ text: draft.trim(), link }).catch(() => {});
    setDraft("");
  };

  // "Hi Rahul, following up on your chat about…" — the context line is the whole
  // point: a bare "hi" from an unknown number gets ignored.
  const firstName = (conversation.customer.name || "").trim().split(/\s+/)[0];
  const waHref = buildWhatsAppUrlTo(
    conversation.customer.phone,
    `Hi${firstName ? ` ${firstName}` : ""}, following up on your chat with Aplus Technology Solutions about ${
      conversation.lastPreview || "your enquiry"
    }`
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-gray-700" aria-label="Back to list">
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">
            {conversation.customer.name || "Visitor"}
          </p>
          {/* Is he talking to someone who is still there? (spec §5) */}
          <p className="flex items-center gap-1.5 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={online ? "text-green-700" : "text-gray-400"}>
              {online
                ? `Online${visitor?.currentPage ? ` — viewing ${visitor.currentPage}` : ""}`
                : formatLastSeen(visitor?.lastSeenAt ?? null)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* null when the phone cannot be normalised — hide rather than open a
              broken wa.me link (lib/whatsapp.ts: buildWhatsAppUrlTo). */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp the customer"
              title="WhatsApp the customer"
              className="p-2 text-gray-400 hover:text-[#25D366] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d={WA_PATH} />
              </svg>
            </a>
          )}
          {conversation.customer.phone && (
            <a
              href={`tel:${conversation.customer.phone}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Call customer"
            >
              <Phone size={16} />
            </a>
          )}
          {conversation.customer.email && (
            <a
              href={`mailto:${conversation.customer.email}`}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Email customer"
            >
              <Mail size={16} />
            </a>
          )}
          <button
            onClick={() => setStatus("closed")}
            className="ml-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 transition-colors"
          >
            Close
          </button>
        </div>
      </header>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((m) => {
          if (m.sender === "system") {
            return (
              <p key={m.id} className="text-[11px] text-center text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                {m.text}
              </p>
            );
          }
          const mine = m.sender === "agent";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                <MessageAttachment attachment={m.attachment} link={m.link} />
                {m.emailedAt && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-blue-100">
                    <CheckCheck size={11} /> Emailed
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      <div className="border-t border-gray-200 shrink-0">
        {threadError && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 px-4 py-2">
            {threadError}
          </p>
        )}
        {uploadError && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 px-4 py-2">
            {uploadError}
          </p>
        )}
        <form onSubmit={handleSend} className="p-3 flex items-center gap-2">
          <LinkPicker onPick={sendLink} />
          <AttachmentPicker
            conversationId={conversation.id}
            onUploaded={sendAttachment}
            onError={setUploadError}
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_MESSAGE_LEN}
            placeholder="Reply…"
            aria-label="Reply"
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
          />
          <button
            type="submit"
            disabled={!isSendable({ text: draft })}
            aria-label="Send reply"
            className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
