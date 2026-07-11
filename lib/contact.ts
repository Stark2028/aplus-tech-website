/**
 * Single source of truth for the company phone number.
 *
 * Every call/WhatsApp/schema link on the site derives from the raw digits
 * below, so changing the number here updates the whole site — no more hunting
 * hardcoded copies across pages, PDFs, and structured data.
 */

/** Country calling code, digits only. */
const COUNTRY_CODE = "91";
/** National subscriber number, digits only (no code, no separators). */
const NATIONAL = "9310509909";

/** E.164 digits without '+', e.g. wa.me path segment: "919310509909". */
export const PHONE_E164_DIGITS = `${COUNTRY_CODE}${NATIONAL}`;
/** E.164 with leading '+', e.g. "+919310509909". */
export const PHONE_E164 = `+${PHONE_E164_DIGITS}`;
/** Human-readable display form, e.g. "+91 93105 09909". */
export const PHONE_DISPLAY = `+${COUNTRY_CODE} ${NATIONAL.slice(0, 5)} ${NATIONAL.slice(5)}`;
/** tel: href, e.g. "tel:+919310509909". */
export const PHONE_TEL = `tel:${PHONE_E164}`;
/** schema.org telephone form, e.g. "+91-9310509909". */
export const PHONE_SCHEMA = `+${COUNTRY_CODE}-${NATIONAL}`;
/** wa.me path segment (alias of PHONE_E164_DIGITS) used by WhatsApp deep links. */
export const WHATSAPP_NUMBER = PHONE_E164_DIGITS;

/** Public email address, kept here so contact details live in one module. */
export const CONTACT_EMAIL = "info@aplustechsol.com";
