/**
 * Single source of truth for how Aplus states its Samsung authorization.
 *
 * Aplus is authorized for BOTH distribution and service. The service credential
 * is "Service Partner" — never "Service Center". Wording is mirrored from
 * lib/pdf/specSheet.ts so the PDF, the page copy and the JSON-LD cannot drift.
 */
export const SAMSUNG_CREDENTIAL =
  "Authorized Samsung Commercial Display Distributor & Service Partner";

/** The spec-sheet footer tagline, including region. */
export const CREDENTIAL_TAGLINE = `${SAMSUNG_CREDENTIAL} · India`;
