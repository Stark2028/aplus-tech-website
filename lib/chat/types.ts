/**
 * Chat domain model (spec §2).
 *
 * Timestamps are `number` (epoch ms) throughout the app. Firestore writes them
 * as `serverTimestamp()` and reads them back as `Timestamp`; `toMillis()` is the
 * single conversion point. Keeping the app model on plain numbers is what lets
 * presence and escalation logic stay pure and unit-testable.
 */

export type Sender = "customer" | "agent" | "system";
export type LinkKind = "product" | "specSheet" | "catalogue" | "category";

/** Quick-send link to an asset the site already produces (spec §4.1 A). */
export interface ChatLink {
  url: string;
  label: string;
  kind: LinkKind;
}

/** Agent-uploaded file in Firebase Storage (spec §4.1 B). */
export interface ChatAttachment {
  url: string;
  name: string;
  mime: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number;
  /** Set when this agent reply was emailed to an offline customer (spec §6.3). */
  emailedAt?: number;
  attachment?: ChatAttachment;
  link?: ChatLink;
}

export interface ChatCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Conversation {
  id: string;
  /** → visitors/{visitorId}: presence + (Phase 3) journey, beside the chat. */
  visitorId: string;
  /** The customer's anonymous auth uid. The ownership check in the rules. */
  ownerUid: string;
  customer: ChatCustomer;
  startedBy: "customer" | "agent";
  page: string;
  status: "open" | "closed";
  /** Set by /api/chat/escalate, cleared on the next agent reply (spec §6). */
  needsFollowUp: boolean;
  createdAt: number;
  lastMessageAt: number;
  lastPreview: string;
  lastSender: Sender;
  unreadForAgent: number;
}

export interface VisitorDoc {
  firstSeenAt: number;
  lastSeenAt: number;
  currentPage: string;
  /** Widget panel open ⇒ they are *watching the chat*, not just on the site. */
  chatOpen: boolean;
}

export const COL = {
  conversations: "conversations",
  messages: "messages",
  visitors: "visitors",
  status: "status",
  agentDevices: "agentDevices",
} as const;

/** status/team — the single public-read presence doc (spec §5). */
export const TEAM_STATUS_DOC = "team";

/** Firestore Timestamp | epoch-ms number | absent → epoch ms (0 when absent). */
export function toMillis(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    value !== null &&
    typeof value === "object" &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    const ms = (value as { toMillis: () => number }).toMillis();
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}
