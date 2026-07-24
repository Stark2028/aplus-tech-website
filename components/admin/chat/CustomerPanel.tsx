"use client";

import { Phone, Mail, X } from "lucide-react";
import type { Conversation, VisitorDoc } from "@/lib/chat/types";
import { formatLastSeen } from "@/lib/chat/presence";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";
import Avatar from "./Avatar";

export default function CustomerPanel({
  conversation,
  visitor,
  online,
  waHref,
  onCloseChat,
  open,
  onCloseSidebar,
}: {
  conversation: Conversation;
  visitor: VisitorDoc | null;
  online: boolean;
  waHref: string | null;
  onCloseChat: () => void;
  open: boolean;
  onCloseSidebar: () => void;
}) {
  const { customer } = conversation;
  const name = customer.name || "Visitor";

  const body = (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={name} seed={conversation.id} size={56} />
        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="flex items-center justify-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
            <span className={online ? "text-green-700" : "text-gray-400"}>
              {online ? "Online" : formatLastSeen(visitor?.lastSeenAt ?? null)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp the customer"
            title="WhatsApp the customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-[#25D366]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d={WA_PATH} />
            </svg>
          </a>
        )}
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            aria-label="Call customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-blue-600"
          >
            <Phone size={16} />
          </a>
        )}
        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            aria-label="Email customer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-blue-600"
          >
            <Mail size={16} />
          </a>
        )}
      </div>

      <dl className="space-y-3 text-xs">
        <Detail label="Phone" value={customer.phone} />
        <Detail label="Email" value={customer.email} />
        <Detail label="Entry page" value={conversation.page} />
        <Detail label="Currently on" value={online ? visitor?.currentPage || "—" : "—"} />
      </dl>

      <button
        onClick={onCloseChat}
        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900"
      >
        Close chat
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50 lg:block">
        {body}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            className="flex-1 bg-black/30"
            onClick={onCloseSidebar}
            aria-label="Close customer details"
          />
          <aside className="flex w-72 max-w-[80%] flex-col overflow-y-auto border-l border-gray-200 bg-gray-50">
            <div className="flex justify-end p-2">
              <button
                onClick={onCloseSidebar}
                aria-label="Close customer details"
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-gray-700">{value}</dd>
    </div>
  );
}
