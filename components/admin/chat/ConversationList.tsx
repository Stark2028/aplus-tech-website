"use client";

import { AlertTriangle } from "lucide-react";
import type { Conversation } from "@/lib/chat/types";
import { formatRelative } from "@/lib/chat/time";
import Avatar from "./Avatar";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  emptyLabel = "No conversations.",
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel?: string;
}) {
  if (conversations.length === 0) {
    return <p className="p-6 text-sm text-gray-400 text-center">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const selected = c.id === selectedId;
        const name = c.customer.name || "Visitor";
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                selected ? "bg-blue-50" : "hover:bg-gray-50"
              } ${c.needsFollowUp ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}
            >
              <Avatar name={name} seed={c.id} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-900">
                    {name}
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
          </li>
        );
      })}
    </ul>
  );
}
