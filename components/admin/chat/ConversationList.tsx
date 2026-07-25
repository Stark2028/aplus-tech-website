"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";
import { formatRelative } from "@/lib/chat/time";
import Avatar from "./Avatar";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  presenceMap = {},
  emptyLabel = "No conversations.",
  onLongPressDelete,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  presenceMap?: Record<string, boolean>;
  emptyLabel?: string;
  /** When provided, long-pressing a row surfaces a "Delete" context menu. */
  onLongPressDelete?: (conversation: Conversation) => void;
}) {
  if (conversations.length === 0) {
    return <p className="p-6 text-sm text-gray-400 text-center">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        const name = c.customer.name || "Visitor";
        const isOnline = presenceMap[c.visitorId] ?? false;

        return (
          <ConversationRow
            key={c.id}
            conversation={c}
            name={name}
            selected={selected}
            isOnline={isOnline}
            onSelect={onSelect}
            onLongPressDelete={onLongPressDelete}
          />
        );
      })}
    </ul>
  );
}

/**
 * A single conversation row with long-press detection for the context menu.
 * The long-press fires after 500 ms of continuous press (touch or mouse).
 * A move beyond 10 px cancels the gesture so scrolling isn't hijacked.
 */
function ConversationRow({
  conversation: c,
  name,
  selected,
  isOnline,
  onSelect,
  onLongPressDelete,
}: {
  conversation: Conversation;
  name: string;
  selected: boolean;
  isOnline: boolean;
  onSelect: (id: string) => void;
  onLongPressDelete?: (conversation: Conversation) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [popup, setPopup] = useState<{ x: number; y: number } | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  /* ── touch ── */
  const onTouchStart = (e: React.TouchEvent) => {
    if (!onLongPressDelete) return;
    didLongPress.current = false;
    const t = e.touches[0];
    startPos.current = { x: t.clientX, y: t.clientY };
    clear();
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      // Haptic feedback on mobile if supported
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(20);
        } catch {
          /* ignore vibration restriction */
        }
      }
      setPopup({ x: t.clientX, y: t.clientY });
    }, 450);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const dx = t.clientX - startPos.current.x;
    const dy = t.clientY - startPos.current.y;
    if (dx * dx + dy * dy > 100) clear(); // moved > 10px, cancel
  };

  const onTouchEnd = () => {
    clear();
  };

  /* ── mouse (desktop fallback) ── */
  const onContextMenu = (e: React.MouseEvent) => {
    if (!onLongPressDelete) return;
    e.preventDefault();
    setPopup({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return; // long press already opened the popup; don't navigate
    }
    onSelect(c.id);
  };

  return (
    <li key={c.id} className="relative select-none" style={{ WebkitTouchCallout: "none" }}>
      <button
        onClick={handleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onContextMenu={onContextMenu}
        className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
          selected ? "bg-blue-50" : "hover:bg-gray-50 active:bg-gray-100"
        } ${c.needsFollowUp ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}
      >
        <Avatar name={name} seed={c.id} online={isOnline} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <span className="truncate">{name}</span>
              {isOnline && (
                <span
                  className="shrink-0 h-2 w-2 rounded-full bg-emerald-500"
                  title="Online now"
                />
              )}
            </span>
            <span className="shrink-0 text-[10px] text-gray-400">
              {formatRelative(c.lastMessageAt)}
            </span>
            {c.needsFollowUp && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                <AlertTriangle size={10} /> NO REPLY
              </span>
            )}
            {c.unreadForAgent > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {c.unreadForAgent}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">{c.lastPreview}</p>
          <p className="mt-0.5 truncate text-[10px] text-gray-400">{c.page}</p>
        </div>
      </button>

      {popup && (
        <ContextPopup
          x={popup.x}
          y={popup.y}
          onDelete={() => {
            setPopup(null);
            onLongPressDelete?.(c);
          }}
          onClose={() => setPopup(null)}
        />
      )}
    </li>
  );
}

/**
 * A tiny context menu portaled to <body> so it isn't clipped by overflow:hidden
 * ancestors. Shows a single "Delete conversation" action with a red trash icon.
 * Tapping the backdrop or scrolling dismisses it without ghost clicks.
 */
function ContextPopup({
  x,
  y,
  onDelete,
  onClose,
}: {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}) {
  // Clamp the popup safely within viewport boundaries
  const left = Math.max(16, Math.min(x, window.innerWidth - 200));
  const top = Math.max(16, Math.min(y, window.innerHeight - 70));

  const handleBackdrop = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdrop}
      onTouchStart={handleBackdrop}
    >
      <div
        className="absolute rounded-xl bg-white shadow-xl ring-1 ring-gray-200/80 py-1 min-w-[180px] animate-[slideUp_0.15s_ease-out]"
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <Trash2 size={15} />
          Delete conversation
        </button>
      </div>
    </div>,
    document.body
  );
}
