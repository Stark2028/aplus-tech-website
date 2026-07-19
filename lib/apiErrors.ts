import "server-only";
import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Shared server-side error + secret plumbing for the API routes.
 *
 * Two jobs, both driven by the pre-launch hardening pass:
 *
 *  1. Fail LOUD on a missing critical secret. `new Resend(undefined)` does NOT
 *     throw at construction — the route would appear to work and then silently
 *     drop the business's lead. getResend() turns that into an explicit 500 with
 *     a logged reason, so a misconfigured deploy is caught on the first request
 *     instead of losing sales quietly.
 *
 *  2. Give every unexpected 500 a CORRELATION ID. The client only ever sees a
 *     generic message + the id; the full error (stack, query, etc.) goes to the
 *     server log tagged with the SAME id, so a user report ("I got error
 *     err_xxxx") maps to exactly one log line without leaking internals.
 */

/** Short, URL/print-safe correlation id, e.g. "err_l8f3k2p9qz". */
export function correlationId(): string {
  return `err_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Log `err` server-side against a fresh correlation id and return a generic
 * client response carrying only that id. Never serialises the error to the
 * client — no stack, no DB details, no file paths.
 */
export function serverError(tag: string, err: unknown, status = 500): NextResponse {
  const id = correlationId();
  console.error(`[${tag}][${id}]`, err);
  return NextResponse.json(
    { success: false, message: "Internal server error.", correlationId: id },
    { status }
  );
}

/**
 * Resend client, or a thrown error if RESEND_API_KEY is unset. Call inside a
 * route's try/catch so the missing-key case becomes a logged 500 via
 * serverError() rather than a silent no-op send.
 */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set — email delivery is unavailable.");
  }
  return new Resend(key);
}
