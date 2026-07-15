"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorageClient } from "@/lib/firebase/client";
import { validateAttachment } from "./attachments";
import type { ChatAttachment } from "./types";

/**
 * Upload an agent attachment (spec §4.1 B).
 *
 * The validate() call here is a KINDNESS, not the control: it fails fast with a
 * readable message instead of making the agent wait on an upload that Storage
 * will reject anyway. storage.rules is the actual boundary — it re-checks the
 * size and the MIME allow-list, and it refuses non-agents outright.
 *
 * Path is scoped per conversation so the read rule can authorise the owner:
 *   chat-attachments/{conversationId}/{messageId}/{filename}
 * We do not have the messageId yet (the message is written after the upload), so
 * a random segment stands in — the rules only care about the conversationId.
 */
export async function uploadAttachment(conversationId: string, file: File): Promise<ChatAttachment> {
  const check = validateAttachment({ name: file.name, size: file.size, type: file.type });
  if (!check.ok) throw new Error(check.reason);

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const key = crypto.randomUUID();
  const path = `chat-attachments/${conversationId}/${key}/${safeName}`;

  const storageRef = ref(getStorageClient(), path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  return { url, name: file.name, mime: file.type, size: file.size };
}
