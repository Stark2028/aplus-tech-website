/**
 * Attachment guards (spec §4.1, §9).
 *
 * The allow-list is a SECURITY control, not a convenience: an upload is the one
 * inbound file path in the product. Deny by default, and keep this list in exact
 * sync with storage.rules — the rules are what actually stop a crafted request;
 * this module only gives the agent a readable error before they wait on an upload.
 *
 * SVG is deliberately excluded despite being an image: it can carry script.
 */

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AllowedMime = (typeof ALLOWED_ATTACHMENT_MIME)[number];

/** `accept` attribute for the file input. Convenience only — never the control. */
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_MIME.join(",");

const IMAGE_MIME = new Set<string>(["image/png", "image/jpeg", "image/webp"]);

export type AttachmentCheck = { ok: true } | { ok: false; reason: string };

/** Strip any `; charset=…` parameter and normalise case before matching. */
function baseMime(type: string): string {
  return type.split(";")[0].trim().toLowerCase();
}

export function validateAttachment(file: { name: string; size: number; type: string }): AttachmentCheck {
  const mime = baseMime(file.type);

  if (!mime || !(ALLOWED_ATTACHMENT_MIME as readonly string[]).includes(mime)) {
    return { ok: false, reason: "Only PDF, PNG, JPEG and WebP files can be sent." };
  }
  if (file.size <= 0) {
    return { ok: false, reason: "That file is empty." };
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return { ok: false, reason: `Files must be under 10 MB — this one is ${formatBytes(file.size)}.` };
  }
  return { ok: true };
}

/** Images render inline in the thread; everything else renders as a card. */
export function isImageMime(mime: string): boolean {
  return IMAGE_MIME.has(baseMime(mime));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${round(bytes / 1024)} KB`;
  return `${round(bytes / (1024 * 1024))} MB`;
}

/** One decimal place, but no trailing ".0". */
function round(value: number): string {
  return String(Math.round(value * 10) / 10);
}
