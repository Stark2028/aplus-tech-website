/**
 * Shared lead-gate storage for download/email gates across the site.
 *
 * Once a visitor submits ANY gate (spec sheet, quote PDF, comparison Excel),
 * we cache their contact info and skip the gate on subsequent downloads.
 * This avoids double-friction for high-intent users who would otherwise be
 * asked for the same fields twice.
 */

export interface GatedLead {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface StoredLead extends GatedLead {
  /** Epoch ms when this lead was captured — used to expire stale PII. */
  capturedAt: number;
}

const STORAGE_KEY = "aplus_lead_gate";

// Data-minimisation: don't retain visitor PII indefinitely. Expire the
// cached lead after 30 days so it isn't held longer than the prefill UX needs.
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function getCachedLead(): GatedLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLead>;
    if (!parsed?.email || !parsed?.name) return null;
    // Expire stale entries (and legacy entries written before capturedAt existed).
    if (typeof parsed.capturedAt !== "number" || Date.now() - parsed.capturedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { name, email, phone, company } = parsed;
    return { name, email, phone: phone ?? "", company };
  } catch {
    return null;
  }
}

export function setCachedLead(lead: GatedLead): void {
  if (typeof window === "undefined") return;
  try {
    const stored: StoredLead = { ...lead, capturedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}

export function hasGated(): boolean {
  return getCachedLead() !== null;
}
