"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * A small confirm modal for destructive, irreversible actions (deleting a whole
 * conversation). Portaled to <body> for the same reason as the CustomerPanel
 * slide-over: a transformed/backdrop-filtered ancestor can become the containing
 * block for `fixed` and clamp the overlay to less than the viewport. `mounted`
 * keeps createPortal off the server render.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  busy = false,
  error,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={busy ? undefined : onCancel}
        aria-label="Cancel"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{body}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
