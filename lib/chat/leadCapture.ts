/**
 * The durable half of a live-chat lead (spec §6.1: "the lead exists before
 * anyone replies").
 *
 * When a visitor starts a chat, their details go two places: Firestore (the
 * live thread) and POST /api/contact (email + Zoho lead). The second is what
 * survives a Firebase outage, an agent who never opens the console, or a
 * visitor who closes the tab — so losing it silently loses the lead.
 *
 * This module exists because it DID fail silently. The original call was
 * `void fetch("/api/contact", …).catch(() => {})`, which has two holes:
 *
 *   1. A non-2xx response RESOLVES the promise. `.catch()` never ran, so an
 *      HTTP 500 was indistinguishable from a delivered lead. /api/contact was
 *      returning 500 for days while chat leads were dropped with no symptom.
 *   2. Genuine network errors were caught and discarded.
 *
 * Reporting goes through an injected `onFailure` rather than `console.error`
 * on purpose: `next.config.ts` sets `compiler.removeConsole` in production, so
 * every console call is stripped from the production bundle. A console-only
 * fix would be invisible in exactly the environment that matters. The hook
 * wires `onFailure` to `trackEvent`, which survives the production build.
 */

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface CaptureDeps {
  /** Injected for tests; defaults to the platform fetch. */
  fetchImpl?: typeof fetch;
  /** Called with a short machine-readable reason when the lead did not land. */
  onFailure: (reason: string) => void;
}

/**
 * Send the chat lead to /api/contact. Resolves `true` only when the API
 * actually accepted it.
 *
 * Never throws and never rejects: the visitor's message is already in
 * Firestore by this point, so breaking `startConversation` over a failed
 * email copy would take the live chat down with it — strictly worse than
 * losing the backup.
 */
export async function captureLead(
  payload: LeadPayload,
  { fetchImpl = fetch, onFailure }: CaptureDeps
): Promise<boolean> {
  let reason: string;

  try {
    const res = await fetchImpl("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        // Honeypot must be EMPTY: /api/contact silently 200s and discards any
        // submission that fills it, so a stray value would drop the lead.
        company_website: "",
        inquiry_type: "Website Live Chat",
        subject: "New Website Live Chat",
        from_name: "Aplus Website Live Chat",
      }),
    });

    if (res.ok) return true;
    reason = `http-${res.status}`;
  } catch {
    reason = "network-error";
  }

  // A broken reporter must not be able to break the chat either.
  try {
    onFailure(reason);
  } catch {
    /* deliberately ignored */
  }
  return false;
}
