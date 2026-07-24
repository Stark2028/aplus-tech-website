"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, CheckCheck, Info } from "lucide-react";
import type { ChatAttachment, ChatLink, Conversation } from "@/lib/chat/types";
import { useThread } from "@/lib/chat/useInbox";
import { isVisitorOnline, formatLastSeen } from "@/lib/chat/presence";
import { isSendable, MAX_MESSAGE_LEN } from "@/lib/chat/messages";
import { isNearBottom } from "@/lib/chat/scroll";
import { groupByDay } from "@/lib/chat/messageGroups";
import { formatClock } from "@/lib/chat/time";
import MessageAttachment from "@/components/chat/MessageAttachment";
import AttachmentPicker from "./AttachmentPicker";
import LinkPicker from "./LinkPicker";
import { buildWhatsAppUrlTo } from "@/lib/whatsapp";
import Avatar from "./Avatar";
import CustomerPanel from "./CustomerPanel";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  // Keep the log pinned to the bottom unless the agent scrolls up to read history.
  const stickToBottom = useRef(true);

  // #5 fix: include messages.length in deps so markRead re-fires whenever a new
  // customer message arrives while the agent is actively viewing the thread.
  useEffect(() => {
    void markRead();
  }, [conversation.id, markRead, messages.length]);

  // Switching conversations always jumps straight to the newest message.
  useEffect(() => {
    stickToBottom.current = true;
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [conversation.id]);

  // A new message follows only if the agent is already at the bottom — never
  // yank them away from history they're reading. Scrolls the log, never the page.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  const handleLogScroll = () => {
    const log = logRef.current;
    if (log) stickToBottom.current = isNearBottom(log);
  };

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
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 md:hidden"
            aria-label="Back to list"
          >
            <ArrowLeft size={18} />
          </button>

          <Avatar name={conversation.customer.name || "Visitor"} seed={conversation.id} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">
              {conversation.customer.name || "Visitor"}
            </p>
            <p className="flex items-center gap-1.5 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
              <span className={online ? "text-green-700" : "text-gray-400"}>
                {online
                  ? `Online${visitor?.currentPage ? ` — viewing ${visitor.currentPage}` : ""}`
                  : formatLastSeen(visitor?.lastSeenAt ?? null)}
              </span>
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 transition-colors hover:text-blue-600 lg:hidden"
            aria-label="Customer details"
            title="Customer details"
          >
            <Info size={18} />
          </button>
        </header>

        <div
          ref={logRef}
          onScroll={handleLogScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {groupByDay(messages).map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.id} className="flex justify-center py-1.5">
                  <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-medium text-gray-500">
                    {item.label}
                  </span>
                </div>
              );
            }
            const m = item.message;
            if (m.sender === "system") {
              return (
                <p
                  key={m.id}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] text-gray-500"
                >
                  {m.text}
                </p>
              );
            }
            const mine = m.sender === "agent";
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800"
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
                <span className="mt-0.5 px-1 text-[10px] text-gray-400">{formatClock(m.createdAt)}</span>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-gray-200">
          {threadError && (
            <p role="alert" className="bg-red-50 px-4 py-2 text-xs text-red-700">
              {threadError}
            </p>
          )}
          {uploadError && (
            <p role="alert" className="bg-red-50 px-4 py-2 text-xs text-red-700">
              {uploadError}
            </p>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2 p-3">
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
              className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!isSendable({ text: draft })}
              aria-label="Send reply"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <CustomerPanel
        conversation={conversation}
        visitor={visitor}
        online={online}
        waHref={waHref}
        onCloseChat={() => setStatus("closed")}
        open={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
    </div>
  );
}
