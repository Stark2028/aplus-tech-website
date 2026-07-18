/**
 * WhatsApp deep-linking utilities.
 *
 * One canonical phone number + a route-aware pre-filled message generator
 * shared by every WhatsApp entry point on the site (mobile sticky bar,
 * desktop chat widget, PDP inline button, etc).
 */

import { WHATSAPP_NUMBER } from "@/lib/contact";

/** Country code + number, no '+'. Used as wa.me path segment. Re-exported so
 *  existing `@/lib/whatsapp` imports keep resolving to the canonical value. */
export { WHATSAPP_NUMBER };

const DEFAULT_MSG =
  "Hi! I'm interested in Samsung display solutions for my business. Could you help?";

/** Pick a sensible pre-filled WhatsApp message based on the current path. */
export function getWhatsAppMessage(pathname: string): string {
  if (pathname.startsWith("/products/")) {
    const slug = pathname.replace("/products/", "").replace(/-/g, " ");
    return `Hi! I'm interested in the ${slug} and would like pricing details. Could you help?`;
  }
  if (pathname.startsWith("/categories/digital-signage"))
    return "Hi! I'm looking for Samsung digital signage solutions for my business. Could you share more details?";
  if (
    pathname.startsWith("/categories/video-wall") ||
    pathname.startsWith("/categories/video-walls")
  )
    return "Hi! I'm interested in Samsung video wall solutions. Could you help me with specifications and pricing?";
  if (pathname.startsWith("/categories/interactive"))
    return "Hi! I'm looking for Samsung interactive display solutions for meeting rooms or classrooms. Could you help?";
  if (pathname.startsWith("/categories/commercial-tv"))
    return "Hi! I'm looking for Samsung hospitality or commercial TV solutions. Could you share more details?";
  if (pathname.startsWith("/solutions/hospitality"))
    return "Hi! I need Samsung display solutions for my hospitality property. Could you help?";
  if (pathname.startsWith("/solutions/corporate"))
    return "Hi! I'm looking for Samsung display solutions for our corporate offices. Could you assist?";
  if (pathname.startsWith("/solutions/education"))
    return "Hi! I'm interested in Samsung display solutions for our educational institution. Could you help?";
  if (pathname.startsWith("/solutions/retail"))
    return "Hi! I need Samsung digital signage for our retail spaces. Could you share options and pricing?";
  if (pathname.startsWith("/quote"))
    return "Hi! I've submitted a quote request and would like to discuss it further. Could you help?";
  if (pathname.startsWith("/contact"))
    return "Hi! I'd like to speak with your sales team about Samsung display solutions.";
  return DEFAULT_MSG;
}

/** Build the full wa.me deep link for a given message. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Build a WhatsApp Web deep link. Used on desktop so a click opens the
 *  in-browser WhatsApp Web client directly, skipping the wa.me "Continue to
 *  Chat" interstitial that looks broken to visitors without the desktop app. */
export function buildWhatsAppWebUrl(message: string): string {
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

/**
 * Normalise a customer-entered phone number to E.164 ("+919310509909").
 *
 * Every helper above targets the BUSINESS number; this is the other direction —
 * the sales console messaging the customer (spec §6.3). Numbers arrive from a
 * free-text form field, so assume nothing: "9310509909", "093105 09909",
 * "+91 93105-09909" must all land on the same value, and junk must return null
 * so the caller can hide the button rather than open a broken wa.me link.
 *
 * Returns null rather than throwing: an unusable phone is an expected input.
 */
export function normalizeE164(phone: string, defaultCountryCode = "91"): string | null {
  const raw = phone.trim();
  if (!raw) return null;

  const hasPlus = raw.startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (!hasPlus) {
    // A leading 0 is India's trunk prefix, not part of the subscriber number.
    digits = digits.replace(/^0+/, "");
    // Exactly 10 digits ⇒ a national number missing its country code.
    if (digits.length === 10) digits = `${defaultCountryCode}${digits}`;
  }

  // E.164 allows at most 15 digits; anything under 10 is not a mobile number.
  if (digits.length < 10 || digits.length > 15) return null;

  return `+${digits}`;
}

/** wa.me deep link addressed TO the customer, pre-filled with context. */
export function buildWhatsAppUrlTo(phone: string, message: string): string | null {
  const e164 = normalizeE164(phone);
  if (!e164) return null;
  // wa.me takes the digits without the leading '+'.
  return `https://wa.me/${e164.slice(1)}?text=${encodeURIComponent(message)}`;
}
