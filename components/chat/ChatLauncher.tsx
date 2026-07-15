"use client";

import { useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useTeamPresence } from "@/lib/chat/useTeamPresence";
import { useVisitorHeartbeat } from "@/lib/chat/useVisitorHeartbeat";
import ChatPanel from "./ChatPanel";

/**
 * THE single chat entry point (spec §3.1).
 *
 * Replaces the old ChatWidget's TWO desktop bubbles (a green WhatsApp one and a
 * blue chat one that opened the same panel on different tabs) with ONE launcher
 * carrying a real presence dot. Net: desktop bottom-right goes from 2 floating
 * buttons to 1.
 *
 * The bubble itself is desktop-only — on mobile, Chat lives in the existing
 * sticky bar (MobileStickyCTA), so we add NO new floating element on either
 * breakpoint. The PANEL, however, renders on both: it is portaled to <body> from
 * inside ChatPanel and opens from either trigger via ChatContext.
 */
export default function ChatLauncher() {
  const { isOpen, toggleChat, unread, openChat } = useChat();
  const { teamOnline } = useTeamPresence();

  // Tell the agent whether the customer is still watching (spec §5).
  useVisitorHeartbeat(isOpen);

  // Arriving from a "reply in the chat" email — open straight into the thread
  // instead of leaving them to notice the launcher bubble on their own.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat") === "resume") openChat("live");
  }, [openChat]);

  return (
    <>
      {/* md:flex — the bubble is desktop-only; mobile uses the sticky bar. */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        className="hidden md:flex fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full items-center justify-center shadow-xl shadow-blue-600/40 transition-all hover:scale-110"
      >
        {isOpen ? (
          <X className="text-white" size={22} />
        ) : (
          <>
            <MessageCircle className="text-white" size={24} />
            {/* Real presence, not a business-hours guess (spec §5). */}
            <span
              aria-hidden="true"
              className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                teamOnline ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      <ChatPanel teamOnline={teamOnline} />
    </>
  );
}
