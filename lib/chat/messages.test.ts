import { describe, it, expect } from "vitest";
import { buildPreview, isSendable, summaryFromMessages, MAX_MESSAGE_LEN, PREVIEW_LEN } from "./messages";
import { toMillis, type ChatMessage } from "./types";

function msg(partial: Partial<ChatMessage> & Pick<ChatMessage, "id" | "sender" | "createdAt">): ChatMessage {
  return { text: "", ...partial };
}

describe("buildPreview", () => {
  it("uses the text when present", () => {
    expect(buildPreview({ text: "Need pricing for a QB65" })).toBe("Need pricing for a QB65");
  });

  it("collapses whitespace and newlines into single spaces", () => {
    expect(buildPreview({ text: "Need\n\n  pricing   now" })).toBe("Need pricing now");
  });

  it("truncates with an ellipsis at PREVIEW_LEN", () => {
    const preview = buildPreview({ text: "x".repeat(200) });
    expect(preview).toHaveLength(PREVIEW_LEN);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("falls back to the attachment name when there is no text", () => {
    expect(
      buildPreview({ attachment: { url: "u", name: "QB65.pdf", mime: "application/pdf", size: 10 } })
    ).toBe("📎 QB65.pdf");
  });

  it("falls back to the link label when there is no text", () => {
    expect(buildPreview({ link: { url: "u", label: "QB65 — spec sheet", kind: "specSheet" } })).toBe(
      "🔗 QB65 — spec sheet"
    );
  });

  it("prefers text over an attachment when both are present", () => {
    expect(
      buildPreview({
        text: "Here you go",
        attachment: { url: "u", name: "QB65.pdf", mime: "application/pdf", size: 10 },
      })
    ).toBe("Here you go");
  });

  it("returns an empty string for an empty message", () => {
    expect(buildPreview({})).toBe("");
    expect(buildPreview({ text: "   " })).toBe("");
  });
});

describe("isSendable", () => {
  it("accepts non-empty text", () => {
    expect(isSendable({ text: "hi" })).toBe(true);
  });

  it("rejects blank or whitespace-only text with no attachment or link", () => {
    expect(isSendable({ text: "   " })).toBe(false);
    expect(isSendable({})).toBe(false);
  });

  it("rejects text over MAX_MESSAGE_LEN", () => {
    expect(isSendable({ text: "x".repeat(MAX_MESSAGE_LEN + 1) })).toBe(false);
    expect(isSendable({ text: "x".repeat(MAX_MESSAGE_LEN) })).toBe(true);
  });

  it("accepts an attachment or a link with no text", () => {
    expect(
      isSendable({ attachment: { url: "u", name: "a.pdf", mime: "application/pdf", size: 1 } })
    ).toBe(true);
    expect(isSendable({ link: { url: "u", label: "QB65", kind: "product" } })).toBe(true);
  });
});

describe("summaryFromMessages", () => {
  it("returns null when the thread is empty", () => {
    expect(summaryFromMessages([])).toBeNull();
  });

  it("summarises the newest message by createdAt", () => {
    const result = summaryFromMessages([
      msg({ id: "a", sender: "customer", text: "First", createdAt: 100 }),
      msg({ id: "b", sender: "agent", text: "Latest reply", createdAt: 200 }),
    ]);
    expect(result).toEqual({ lastPreview: "Latest reply", lastSender: "agent", lastMessageAt: 200 });
  });

  it("finds the newest by timestamp, not array position", () => {
    const result = summaryFromMessages([
      msg({ id: "b", sender: "agent", text: "Newest", createdAt: 200 }),
      msg({ id: "a", sender: "customer", text: "Older", createdAt: 100 }),
    ]);
    expect(result).toEqual({ lastPreview: "Newest", lastSender: "agent", lastMessageAt: 200 });
  });

  it("previews a file-only newest message by its attachment name", () => {
    const result = summaryFromMessages([
      msg({
        id: "a",
        sender: "agent",
        createdAt: 100,
        attachment: { url: "u", name: "QB65.pdf", mime: "application/pdf", size: 10 },
      }),
    ]);
    expect(result).toEqual({ lastPreview: "📎 QB65.pdf", lastSender: "agent", lastMessageAt: 100 });
  });
});

describe("toMillis", () => {
  it("passes an epoch-ms number through", () => {
    expect(toMillis(1_700_000_000_000)).toBe(1_700_000_000_000);
  });

  it("unwraps a Firestore Timestamp via toMillis()", () => {
    expect(toMillis({ toMillis: () => 42 })).toBe(42);
  });

  it("returns 0 for null, undefined, or an unrecognised shape", () => {
    expect(toMillis(null)).toBe(0);
    expect(toMillis(undefined)).toBe(0);
    expect(toMillis("nonsense")).toBe(0);
  });
});
