"use client";

import { FileText, ExternalLink, Download } from "lucide-react";
import type { ChatAttachment, ChatLink } from "@/lib/chat/types";
import { isImageMime, formatBytes } from "@/lib/chat/attachments";
import { safeHttpUrl } from "@/lib/chat/safeUrl";

/**
 * Renders the non-text payload of a message (spec §4.1). Shared by the customer
 * widget and the sales console so a spec sheet looks the same on both sides.
 *
 * Images render inline; PDFs and quick-send links render as cards. The MIME
 * check is isImageMime(), NOT `mime.startsWith("image/")` — SVG would pass that
 * and is excluded on purpose.
 *
 * A plain <img> is used rather than next/image: Storage URLs are signed, remote,
 * and one-off, so the optimizer would add a round-trip and a remotePatterns
 * entry for no benefit.
 */
export default function MessageAttachment({
  attachment,
  link,
}: {
  attachment?: ChatAttachment;
  link?: ChatLink;
}) {
  if (!attachment && !link) return null;

  // Never render an untrusted scheme into href/src. A visitor can write to their
  // own thread with the Firebase SDK directly, and the salesperson reads that
  // thread in the console while holding an `agent: true` token — so a
  // `javascript:` URI here would execute in the console, not just in the sender's
  // own tab. An unsafe URL degrades to an inert card rather than a live link.
  const attachmentUrl = safeHttpUrl(attachment?.url);
  const linkUrl = safeHttpUrl(link?.url);

  return (
    <div className="mt-2 space-y-2">
      {attachment &&
        (isImageMime(attachment.mime) ? (
          attachmentUrl ? (
            <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachmentUrl}
                alt={attachment.name}
                className="max-w-full max-h-64 rounded-xl border border-black/10 object-contain bg-white"
              />
            </a>
          ) : null
        ) : (
          <a
            {...(attachmentUrl
              ? { href: attachmentUrl, target: "_blank", rel: "noopener noreferrer", download: attachment.name }
              : {})}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500">
              <FileText size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-gray-800 truncate">
                {attachment.name}
              </span>
              <span className="block text-[11px] text-gray-400">{formatBytes(attachment.size)}</span>
            </span>
            <Download size={15} className="shrink-0 text-gray-400" />
          </a>
        ))}

      {link && (
        <a
          {...(linkUrl ? { href: linkUrl, target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2.5 hover:bg-blue-50 transition-colors"
        >
          <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white text-blue-600">
            <FileText size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-gray-800 truncate">{link.label}</span>
            <span className="block text-[11px] text-blue-500 capitalize">
              {link.kind === "specSheet" ? "Spec sheet" : link.kind}
            </span>
          </span>
          <ExternalLink size={15} className="shrink-0 text-blue-400" />
        </a>
      )}
    </div>
  );
}
