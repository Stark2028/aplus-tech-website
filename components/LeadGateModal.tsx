"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { leadGateSchema, type LeadGateValues } from "@/lib/formSchemas";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-red-500">{message}</p>;
}

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
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<LeadGateValues>({ resolver: zodResolver(leadGateSchema) });

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
    reset({
      name: cached?.name ?? "",
      email: cached?.email ?? "",
      phone: cached?.phone ?? "",
      company: cached?.company ?? "",
    });
    setStatus("idle");
    setErrorMsg("");
    trackEvent(`${analyticsKey}_opened`, {});
  }, [isOpen, analyticsKey, reset]);

  // Close on Escape (ignored while submitting)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, status, onClose]);

  // Focus trap — keep keyboard focus inside the dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const el = dialogRef.current;
    // Move focus into the dialog on open
    const firstFocusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen) return null;

  const onSubmit = async (values: LeadGateValues) => {
    setStatus("submitting");
    setErrorMsg("");

    const lead: GatedLead = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
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
      toast.success("Resource unlocked! Downloading now...");
      setTimeout(() => {
        onUnlock(lead);
      }, 400);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMsg(msg);
      toast.error(msg);
      setStatus("error");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-gate-title"
    >
      {/* Backdrop — click to close, hidden from AT (visible close button handles keyboard) */}
      <div
        aria-hidden="true"
        onClick={() => status !== "submitting" && onClose()}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
      />

      <div
        ref={dialogRef}
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
            <div role="alert" className="text-center py-4">
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
                onClick={() => onUnlock({ name: getValues("name"), email: getValues("email"), phone: getValues("phone"), company: getValues("company") ?? "" })}
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

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm ${errors.name ? "border-red-400" : "border-gray-200"}`}
                    {...register("name")}
                  />
                  <FieldError message={errors.name?.message} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="john@company.com"
                    aria-invalid={!!errors.email}
                    className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm ${errors.email ? "border-red-400" : "border-gray-200"}`}
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      aria-invalid={!!errors.phone}
                      className={`w-full px-4 py-2.5 bg-white/70 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                      {...register("phone")}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      autoComplete="organization"
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      {...register("company")}
                    />
                  </div>
                </div>

                {status === "error" && errorMsg && (
                  <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  aria-label={status === "submitting" ? "Preparing your download…" : ctaLabel}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Preparing your download…
                    </>
                  ) : (
                    <>
                      <FileDown size={16} aria-hidden="true" /> {ctaLabel}
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
    </div>,
    document.body
  );
}
