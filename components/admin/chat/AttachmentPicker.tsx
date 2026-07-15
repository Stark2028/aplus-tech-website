"use client";

import { useRef, useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { ATTACHMENT_ACCEPT } from "@/lib/chat/attachments";
import { uploadAttachment } from "@/lib/chat/uploadAttachment";
import type { ChatAttachment } from "@/lib/chat/types";

export default function AttachmentPicker({
  conversationId,
  onUploaded,
  onError,
}: {
  conversationId: string;
  onUploaded: (attachment: ChatAttachment) => void;
  onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset immediately so picking the SAME file twice still fires a change event.
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      onUploaded(await uploadAttachment(conversationId, file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label="Attach a file"
        title="Attach a PDF or image (max 10 MB)"
        className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
      </button>
    </>
  );
}
