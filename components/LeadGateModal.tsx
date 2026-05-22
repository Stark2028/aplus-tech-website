"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileDown,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  getCachedLead,
  setCachedLead,
  type GatedLead,
} from "@/lib/leadGate";
import { trackEvent } from "@/lib/analytics";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Fired once the lead has been captured (or skipped via cache). Should perform the actual download. */
  onUnlock: (lead: GatedLead) => void;

  title: string;
  subtitle: string;
  /** Subject line sent to /api/contact — describes what was downloaded */
  subject: string;
  /** Short summary used in the email body / Zoho lead description */
  itemDescription: string;
  /** Eyebrow chip above the title */
  eyebrow?: string;
  /** Button label */
  ctaLabel?: string;
  /** Privacy line at the bottom of the form */
  privacyNote?: string;
  /** Analytics event names */
  analyticsKey?: string;
}

export default function LeadGateModal({
  isOpen,
  onClose,
  onUnlock,
  title,
  subtitle,
  subject,
  itemDescription,
  eyebrow = "Architect Resource",
  ctaLabel = "Download",
  privacyNote = "We'll only use this to follow up with pricing. No spam, ever.",
  analyticsKey = "lead_gate",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Lock scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Prefill from cache when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const cached = getCachedLead();
    if (cached) {
      setName(cached.name);
      setEmail(cached.email);
      setPhone(cached.phone);
      setCompany(cached.company ?? "");
    }
    setStatus("idle");
    setErrorMsg("");
    trackEvent(`${analyticsKey}_opened`, {});
  }, [isOpen, analyticsKey]);

  // Close on Escape (ignored while submitting)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const lead: GatedLead = { name, email, phone, company };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          subject,
          inquiry_type: "Lead Gate Download",
          message: itemDescription,
          items_list: itemDescription,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Submission failed");

      setCachedLead(lead);
      trackEvent(`${analyticsKey}_submitted`, {});

      setStatus("success");
      setTimeout(() => {
        onUnlock(lead);
      }, 400);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-gate-title"
    >
      <button
        aria-label="Close"
        onClick={() => status !== "submitting" && onClose()}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
      />

      <div
        className="relative w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow:
            "0 20px 60px -10px rgba(37,99,235,0.25), 0 8px 24px -8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
          }}
        />

        <button
          onClick={onClose}
          disabled={status === "submitting"}
          className="absolute top-4 right-4 z-10 w-8 h-8 inline-flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="relative p-7 sm:p-8">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="text-green-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Your download is starting
              </h3>
              <p className="text-sm text-gray-500">
                A copy has been logged with our sales team — we&apos;ll follow up
                with pricing within 24 hours.
              </p>
              <button
                onClick={() => onUnlock({ name, email, phone, company })}
                className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Didn&apos;t download? Click here →
              </button>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full mb-3">
                <FileDown size={11} /> {eyebrow}
              </div>
              <h3
                id="lead-gate-title"
                className="text-xl font-bold text-gray-900 mb-1.5 leading-tight"
              >
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {subtitle}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Work Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                    placeholder="john@company.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {status === "error" && errorMsg && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Preparing your
                      download…
                    </>
                  ) : (
                    <>
                      <FileDown size={16} /> {ctaLabel}
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-500">
                  <ShieldCheck size={13} className="text-gray-400 flex-shrink-0" />
                  <span>{privacyNote}</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
