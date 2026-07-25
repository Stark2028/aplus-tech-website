"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConversation } from "@/lib/chat/useConversation";
import type { ChatCustomer, ChatMessage, Conversation } from "@/lib/chat/types";

/**
 * Panel state for the chat widget.
 *
 * It lives in context because TWO components open the same panel: the desktop
 * launcher (components/chat/ChatLauncher.tsx) and the mobile sticky bar's Chat
 * button (components/MobileStickyCTA.tsx). Spec §3.1 is explicit that there is
 * exactly ONE door — duplicating the panel per opener is the bug we are fixing.
 *
 * #1 fix: useConversation (and therefore the 3-minute escalation timer) now
 * lives HERE, in the persistent ChatProvider, NOT inside LiveChat. LiveChat
 * renders only while the panel is open, so mounting the hook there meant the
 * timer was killed the moment the customer closed the widget. The hook now
 * survives for the full page lifetime regardless of panel state.
 *
 * #3 fix: setUnread is wired here, where we can observe new agent messages
 * even while the panel is closed. Previously setUnread was only ever called
 * with 0 (in openChat/toggleChat) so the badge was permanently dead code.
 */

/** "home" = the presence-aware fork (Chat now / Leave a message + WhatsApp). */
export type ChatView = "home" | "live" | "whatsapp";

interface StartInput {
  customer: ChatCustomer;
  message: string;
  page: string;
}

interface ChatContextValue {
  isOpen: boolean;
  view: ChatView;
  openChat: (view?: ChatView) => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Unread agent replies, shown on the launcher when the panel is closed. */
  unread: number;
  setUnread: (n: number) => void;

  // ── useConversation surface (formerly owned by LiveChat) ──────────────────
  ready: boolean;
  conversationId: string | null;
  conversation: Conversation | null;
  messages: ChatMessage[];
  error: string | null;
  resumeExpired: boolean;
  startConversation: (input: StartInput) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("home");
  const [unread, setUnread] = useState(0);
  // Defer creating an anonymous session until the visitor opens the panel at
  // least once (see useConversation(engaged)). Sticky: once true, stays true so
  // the conversation + timer survive later open/close cycles.
  const [hasEngaged, setHasEngaged] = useState(false);

  // Persistent conversation state — survives panel open/close cycles (fix #1).
  const {
    ready,
    conversationId,
    conversation,
    messages,
    error,
    resumeExpired,
    startConversation,
    sendMessage,
  } = useConversation(hasEngaged);

  // #3 fix: increment the launcher badge for agent replies that arrive while the
  // panel is closed. We track a high-water mark of the message count and only
  // count the delta.
  //
  // The baseline starts at 0 and the thread's existing history streams in as a
  // single 0 -> N jump on load. That first jump is the visitor's PRIOR thread,
  // not new unread replies, so it must not inflate the badge — we only begin
  // counting once a populated thread has already been observed
  // (`prevMessagesLength > 0`). New arrivals after that are real.
  const prevMessagesLength = useRef<number>(messages.length);

  useEffect(() => {
    const currentLen = messages.length;

    if (isOpen) {
      // Panel is open: everything visible is already seen. openChat/toggleChat
      // zero the badge on open, so here we only advance the baseline (a ref
      // write, not setState — avoids react-hooks/set-state-in-effect).
      prevMessagesLength.current = currentLen;
      return;
    }

    // Closed: incoming Firestore messages are an external-system update, so
    // reacting to them with setState is the sanctioned effect pattern.
    if (prevMessagesLength.current > 0 && currentLen > prevMessagesLength.current) {
      const newAgentCount = messages
        .slice(prevMessagesLength.current)
        .filter((m) => m.sender === "agent").length;
      if (newAgentCount > 0) setUnread((prev) => prev + newAgentCount);
    }
    prevMessagesLength.current = currentLen;
  }, [messages, isOpen]);

  const openChat = useCallback((next: ChatView = "home") => {
    // A default "home" open with an unread agent reply lands in the thread, not
    // the marketing menu — otherwise the reply the badge pointed at stays buried.
    // Explicit "live"/"whatsapp" picks are honored as-is.
    const target: ChatView = next === "home" && unread > 0 && conversationId ? "live" : next;
    setView(target);
    setUnread(0);
    setIsOpen(true);
    setHasEngaged(true);
  }, [unread, conversationId]);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    // Delegate the OPEN path to openChat so the "route to the reply" rule lives in
    // exactly one place; closing stays trivial. openChat also engages the session.
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    openChat("home");
  }, [isOpen, openChat]);

  const value = useMemo(
    () => ({
      isOpen,
      view,
      openChat,
      closeChat,
      toggleChat,
      unread,
      setUnread,
      // conversation surface
      ready,
      conversationId,
      conversation,
      messages,
      error,
      resumeExpired,
      startConversation,
      sendMessage,
    }),
    [
      isOpen,
      view,
      openChat,
      closeChat,
      toggleChat,
      unread,
      ready,
      conversationId,
      conversation,
      messages,
      error,
      resumeExpired,
      startConversation,
      sendMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
