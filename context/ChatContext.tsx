"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Panel state for the chat widget.
 *
 * It lives in context because TWO components open the same panel: the desktop
 * launcher (components/chat/ChatLauncher.tsx) and the mobile sticky bar's Chat
 * button (components/MobileStickyCTA.tsx). Spec §3.1 is explicit that there is
 * exactly ONE door — duplicating the panel per opener is the bug we are fixing.
 */

/** "home" = the presence-aware fork (Chat now / Leave a message + WhatsApp). */
export type ChatView = "home" | "live" | "whatsapp";

interface ChatContextValue {
  isOpen: boolean;
  view: ChatView;
  openChat: (view?: ChatView) => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Unread agent replies, shown on the launcher when the panel is closed. */
  unread: number;
  setUnread: (n: number) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("home");
  const [unread, setUnread] = useState(0);

  const openChat = useCallback((next: ChatView = "home") => {
    setView(next);
    setUnread(0);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      setView("home");
      setUnread(0);
      return true;
    });
  }, []);

  const value = useMemo(
    () => ({ isOpen, view, openChat, closeChat, toggleChat, unread, setUnread }),
    [isOpen, view, openChat, closeChat, toggleChat, unread]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
