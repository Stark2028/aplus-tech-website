"use client";

import { AlertTriangle } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return <p className="p-6 text-sm text-gray-400 text-center">No open chats.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                selected ? "bg-blue-50" : "hover:bg-gray-50"
              } ${c.needsFollowUp ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 font-semibold text-sm text-gray-900 truncate">
                  {c.customer.name || "Visitor"}
                </span>
                {c.needsFollowUp && (
                  // The safety net fired and nobody answered. Loudest thing here.
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">
                    <AlertTriangle size={10} /> NO REPLY
                  </span>
                )}
                {c.unreadForAgent > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {c.unreadForAgent}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastPreview}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.page}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
