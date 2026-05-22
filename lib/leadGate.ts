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

const STORAGE_KEY = "aplus_lead_gate";

export function getCachedLead(): GatedLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.name) return null;
    return parsed as GatedLead;
  } catch {
    return null;
  }
}

export function setCachedLead(lead: GatedLead): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {}
}

export function hasGated(): boolean {
  return getCachedLead() !== null;
}
