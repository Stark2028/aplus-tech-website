import type { ChatAttachment, ChatLink, ChatMessage, Sender } from "./types";

/** Hard cap on message text. Enforced here AND in firestore.rules — the rule is
 *  the real control; this one is just a kinder failure. */
export const MAX_MESSAGE_LEN = 2000;

/** Length of `lastPreview` (the inbox list line). */
export const PREVIEW_LEN = 80;

interface MessageBody {
  text?: string;
  attachment?: ChatAttachment;
  link?: ChatLink;
}

/**
 * One-line summary for the console inbox and (Phase 2) the push payload.
 * Text wins; otherwise name the attachment or the link, so a file-only message
 * never shows as a blank row.
 */
export function buildPreview({ text, attachment, link }: MessageBody): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean) {
    return clean.length > PREVIEW_LEN ? `${clean.slice(0, PREVIEW_LEN - 1)}…` : clean;
  }
  if (attachment) return `📎 ${attachment.name}`;
  if (link) return `🔗 ${link.label}`;
  return "";
}

/** Is there anything worth sending? Guards the composer's send button. */
export function isSendable({ text, attachment, link }: MessageBody): boolean {
  const clean = (text ?? "").trim();
  if (clean.length > MAX_MESSAGE_LEN) return false;
  return Boolean(clean || attachment || link);
}

/**
 * The inbox-row fields (`lastPreview`, `lastSender`, `lastMessageAt`) recomputed
 * from a thread's remaining messages. Used after an agent deletes the newest
 * message, whose text/time would otherwise linger on the conversation doc and
 * the inbox list line. Returns `null` for an empty thread — the caller decides
 * what an emptied conversation should show. Picks the newest by `createdAt`
 * rather than trusting array position, so it is order-independent.
 */
export function summaryFromMessages(
  messages: ChatMessage[]
): { lastPreview: string; lastSender: Sender; lastMessageAt: number } | null {
  if (messages.length === 0) return null;
  const last = messages.reduce((newest, m) => (m.createdAt > newest.createdAt ? m : newest));
  return {
    lastPreview: buildPreview({ text: last.text, attachment: last.attachment, link: last.link }),
    lastSender: last.sender,
    lastMessageAt: last.createdAt,
  };
}
