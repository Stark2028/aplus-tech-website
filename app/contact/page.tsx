"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin, Send, CheckCircle,
  ChevronDown, ChevronUp,
  ChevronRight
} from "lucide-react";
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  TimerIcon,
  BadgeCheckIcon,
  BuildingIcon,
  SendIcon,
  IconTile,
} from "@/components/icons";
import { contactFormSchema, type ContactFormValues } from "@/lib/formSchemas";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs text-red-500">{message}</p>;
}

const INQUIRY_TYPES = [
  "Product Inquiry",
  "Request a Quote",
  "Technical Support",
  "Partnership / Dealership",
  "Bulk / Project Order",
  "Other",
];

const FAQS = [
  { q: "How quickly do you respond?", a: "Within 1 business day for standard inquiries, same-day for urgent projects." },
  { q: "What areas do you serve?", a: "Pan-India delivery and installation, with full logistics support for bulk orders." },
  { q: "Is installation included?", a: "Yes. We provide end-to-end supply, installation, and post-sale AMC for every project." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (open) {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.maxHeight = "0";
      el.style.opacity = "0";
    }
  }, [open]);

  return (
    <div className="border-b border-slate-200/70 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-3.5 text-left gap-3 group"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-snug">{q}</span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-blue-500" aria-hidden="true" />
          : <ChevronDown size={14} className="shrink-0 text-slate-400" aria-hidden="true" />}
      </button>
      <div
        ref={bodyRef}
        id={panelId}
        role="region"
        style={{ maxHeight: 0, opacity: 0, overflow: "hidden", transition: "max-height 0.25s ease, opacity 0.2s ease" }}
      >
        <p className="text-sm text-slate-500 pb-3.5 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

const MAX_MESSAGE_LENGTH = 500;

const OFFICES = [
  { tier: "Corporate Office",   cities: "Noida, Uttar Pradesh",   dotColor: "#2563eb" },
  { tier: "Regional Office",    cities: "Kolkata, West Bengal",   dotColor: "#6366f1" },
  { tier: "Operational Offices", cities: "Guwahati · Patna · Bhubaneswar", dotColor: "#10b981" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const [messageLength, setMessageLength] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { message: "" },
  });

  // Register the message field once so the textarea can compose RHF's onChange
  // with the local character-count update (instead of re-calling register() per
  // keystroke). messageLength is kept as state — not derived via watch() — so
  // the React Compiler can still optimize this component.
  const messageField = register("message");

  const onSubmit = async (values: ContactFormValues) => {
    setServerError("");
    const payload: Record<string, string> = {
      subject: "New Contact Form Submission — Aplus Tech",
      from_name: "Aplus Tech Website",
      ...values,
      message: values.message ?? "",
      company: values.company ?? "",
      // Honeypot: not in the Zod schema, read directly from the form. Humans
      // leave it empty; bots that fill it are silently dropped server-side.
      company_website: (getValues() as Record<string, string>).company_website ?? "",
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        // Friendly, non-technical message (never the raw API string).
        setServerError(
          res.status === 429
            ? "Too many requests. Please wait a few minutes and try again."
            : "Something went wrong. Please try again, or email us directly at info@aplustechsol.com."
        );
      }
    } catch {
      setServerError(
        "We couldn't reach our server. Check your connection and try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0f1b3d 0%, #1e3a6e 40%, #2563eb 100%)" }} className="py-20 md:py-28 relative overflow-hidden">
        {/* Animated dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Glow orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-400/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-cyan-400/10 blur-[60px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 animate-page-enter">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300 mb-4">Get in touch</p>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">Let&apos;s build your display solution.</h1>
              <p className="text-blue-200/80 text-base md:text-lg leading-relaxed">From consultation to installation — our team is ready to help you find the perfect Samsung display for your business.</p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 sm:gap-10 bg-white/[0.07] p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              {[
                { icon: TimerIcon,      value: "1 day",  label: "Response Time" },
                { icon: BadgeCheckIcon, value: "Samsung",label: "Certified Partner" },
                { icon: BuildingIcon,   value: "Noida",  label: "Headquarters" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2.5 bg-white/5 border border-white/10">
                    <Icon size={18} className="text-slate-200" accentClassName="text-blue-400" />
                  </div>
                  <p className="text-white font-bold text-base">{value}</p>
                  <p className="text-blue-300/70 text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO STRIP ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-lg shadow-gray-100/50 relative z-20 -mt-6 mx-4 sm:mx-6 lg:mx-auto max-w-6xl rounded-2xl">
        <div className="px-2">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PhoneIcon,  label: "Call Us",  value: PHONE_DISPLAY,       sub: "Mon – Sat, 10 AM – 6 PM",      href: PHONE_TEL,         accentClass: "text-blue-600",    accent: "#3b82f6" },
              { icon: MailIcon,   label: "Email",    value: "info@aplustechsol.com", sub: "Reply within 24 hours",        href: "mailto:info@aplustechsol.com", accentClass: "text-violet-600", accent: "#8b5cf6" },
              { icon: MapPinIcon, label: "Office",   value: "Sector-94, Noida",      sub: "Supernova Astralis, 8th Fl.", href: "https://maps.google.com/?q=Aplus+Technology+Solutions+Private+Limited+Noida", accentClass: "text-emerald-600", accent: "#10b981" },
              { icon: TimerIcon,  label: "Support",  value: "Dedicated",   sub: "Pre & post-sale assistance",    href: null,      accentClass: "text-amber-600",   accent: "#f59e0b" },
            ].map(({ icon: Icon, label, value, sub, href, accentClass, accent }) => {
              const inner = (
                <div className="flex items-center gap-3.5 px-4 lg:px-5 py-5 hover:bg-gray-50/80 transition-colors h-full group relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accent }} />
                  <IconTile className="shrink-0">
                    <Icon size={22} className="text-current" accentClassName={accentClass} />
                  </IconTile>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block">{inner}</a>
              ) : <div key={label}>{inner}</div>;
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN: FORM + SIDEBAR ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ── FORM (col-span-2) ──────────────────────────────────── */}
          <div className="lg:col-span-2 animate-page-enter flex flex-col gap-12 lg:gap-16">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-blue-50 to-transparent pointer-events-none" />

              {/* Form header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100/80 relative">
                <div className="flex items-center gap-3 mb-3">
                  <IconTile size="md">
                    <SendIcon size={20} className="text-current" />
                  </IconTile>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send Us a Message</h2>
                    <p className="text-gray-400 text-xs mt-0.5">We&apos;ll respond within one business day</p>
                  </div>
                </div>
              </div>

              <>
                {submitted ? (
                  <div className="px-8 py-24 text-center flex flex-col items-center justify-center animate-page-enter">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-50 shadow-inner">
                      <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Received!</h3>
                    <p className="text-gray-500 text-base max-w-sm mx-auto mb-8">
                      Thank you for reaching out. Our team has received your message and will contact you shortly.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); reset(); setMessageLength(0); }}
                      type="button"
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-8 space-y-6">
                    {/* Honeypot — hidden from users; bots that fill it are silently dropped */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="sr-only"
                      {...register("company_website" as keyof ContactFormValues)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" autoComplete="name" placeholder="Rahul Sharma"
                          aria-invalid={!!errors.name}
                          className={`w-full px-4 py-3.5 border rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                          {...register("name")}
                        />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Company Name <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                        </label>
                        <input type="text" autoComplete="organization" placeholder="Acme Hotels Pvt. Ltd."
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                          {...register("company")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <input type="email" autoComplete="email" placeholder="rahul@company.com"
                          aria-invalid={!!errors.email}
                          className={`w-full px-4 py-3.5 border rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 ${errors.email ? "border-red-400" : "border-gray-200"}`}
                          {...register("email")}
                        />
                        <FieldError message={errors.email?.message} />
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                          aria-invalid={!!errors.phone}
                          className={`w-full px-4 py-3.5 border rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                          {...register("phone")}
                        />
                        <FieldError message={errors.phone?.message} />
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                        Inquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        aria-invalid={!!errors.inquiry_type}
                        className={`w-full px-4 py-3.5 border rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-700 appearance-none cursor-pointer ${errors.inquiry_type ? "border-red-400" : "border-gray-200"}`}
                        defaultValue=""
                        {...register("inquiry_type")}
                      >
                        <option value="" disabled>Select a topic…</option>
                        {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[38px] text-gray-400 pointer-events-none" />
                      <FieldError message={errors.inquiry_type?.message} />
                    </div>

                    <div className="relative group">
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700 transition-colors group-focus-within:text-blue-600">
                          Message / Requirements <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                        </label>
                        <span className={`text-[10px] font-medium ${messageLength >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                          {messageLength}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <textarea rows={5} maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Please describe your requirements such as product type, quantity, installation site, timeline…"
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
                        {...messageField}
                        onChange={(e) => {
                          messageField.onChange(e);
                          setMessageLength(e.target.value.length);
                        }}
                      />
                    </div>

                    {serverError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 flex items-center gap-2 animate-page-enter">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {serverError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
                      <button type="submit" disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 text-white font-semibold px-10 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto">
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-left">
                        By submitting this form, you agree to our privacy policy.<br />Your details are secure.
                      </p>
                    </div>
                  </form>
                )}
              </>
            </div>

            {/* ── TRUST SIGNALS BANNER ─────────────────────────────────────── */}
            <div className="px-2">
              <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Why choose us</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Your trusted display partner</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: BadgeCheckIcon, accentClass: "text-blue-600",    shadow: "shadow-blue-100/60",  title: "Certified Expertise",   desc: "Authorized Samsung partners — authentic products with official warranties." },
                  { icon: MapPinIcon,     accentClass: "text-emerald-600", shadow: "shadow-green-100/60", title: "Pan-India Support",     desc: "Nationwide logistics & installation network covering 50+ cities." },
                  { icon: TimerIcon,      accentClass: "text-amber-600",   shadow: "shadow-amber-100/60", title: "End-to-End Service",    desc: "Consultation, supply, installation & AMC support — one expert team." },
                ].map(({ icon: Icon, accentClass, shadow, title, desc }) => (
                  <div
                    key={title}
                    className={`relative bg-white rounded-2xl border border-gray-100 p-6 text-center sm:text-left shadow-lg ${shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                  >
                    <IconTile className="mx-auto sm:mx-0 mb-4">
                      <Icon size={22} className="text-current" accentClassName={accentClass} />
                    </IconTile>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SIDEBAR (col-span-1) ───────────────────────────────── */}
          {/* self-start so the column sizes to its own content instead of
              stretching to match the taller form column — otherwise the extra
              height lands as dead space in/under the FAQ card. */}
          <div className="flex flex-col gap-6 lg:self-start">
            {/* Two office maps, stacked. On lg+ the pair is locked to the form
                card's height (≈741px) and split evenly, so the two map boxes
                together read as exactly as tall as the request form. */}
            <div className="flex flex-col gap-6 lg:h-[741px]">
              {/* Noida HQ — address + Map */}
              <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
                <div className="px-6 pt-6 pb-5 bg-linear-to-br from-slate-50 via-white to-blue-50/30 border-b border-gray-100/60 relative shrink-0">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-blue-50 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3.5 mb-4 relative">
                    <IconTile size="md">
                      <BuildingIcon size={20} className="text-current" />
                    </IconTile>
                    <div>
                      <p className="text-base font-bold text-gray-900">Noida Corporate Office</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Samsung Authorized Partner</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-0.5">
                    Supernova Astralis, Sector-94,<br />Noida, UP — 201301
                  </p>
                </div>
                <div className="relative flex-1 min-h-[8rem] w-full overflow-hidden">
                  <iframe
                    title="Aplus Technology Solutions Office"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.5!2d77.3216431!3d28.5505377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce546a104a66d%3A0x735f3944b1574a06!2sAplus%20Technology%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1747344000000!5m2!1sen!2sin"
                    width="100%" height="100%" style={{ border: 0, display: "block", filter: "grayscale(15%) contrast(1.05) saturate(0.9)" }} allowFullScreen={false} loading="lazy"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_2px_16px_rgba(0,0,0,0.08)] pointer-events-none" />
                </div>
                <div className="px-6 py-4 bg-white hover:bg-blue-50/40 transition-colors flex items-center justify-between group/link shrink-0">
                  <a href="https://www.google.com/maps/place/Aplus+Technology+Solutions+Private+Limited/@28.5505377,77.3216431,17z"
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                    <MapPin size={14} />
                    Open in Google Maps
                  </a>
                  <ChevronRight size={14} className="text-blue-400 group-hover/link:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Kolkata Regional Office — address + Map */}
              <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
                <div className="px-6 pt-6 pb-5 bg-linear-to-br from-slate-50 via-white to-indigo-50/30 border-b border-gray-100/60 relative shrink-0">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-indigo-50 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3.5 mb-4 relative">
                    <IconTile size="md">
                      <BuildingIcon size={20} className="text-current" />
                    </IconTile>
                    <div>
                      <p className="text-base font-bold text-gray-900">Kolkata Regional Office</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Eastern India</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-0.5">
                    Webel Tower-I, Sector-V,<br />Salt Lake, Kolkata — 700091
                  </p>
                </div>
                <div className="relative flex-1 min-h-[8rem] w-full overflow-hidden">
                  <iframe
                    title="Aplus Technology Solutions — Kolkata Office"
                    src="https://www.google.com/maps?q=Webel+Tower+I,+Sector+V,+Salt+Lake,+Kolkata+700091&output=embed"
                    width="100%" height="100%" style={{ border: 0, display: "block", filter: "grayscale(15%) contrast(1.05) saturate(0.9)" }} allowFullScreen={false} loading="lazy"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_2px_16px_rgba(0,0,0,0.08)] pointer-events-none" />
                </div>
                <div className="px-6 py-4 bg-white hover:bg-indigo-50/40 transition-colors flex items-center justify-between group/link shrink-0">
                  <a href="https://www.google.com/maps/search/?api=1&query=Webel+Tower+I,+Sector+V,+Salt+Lake,+Kolkata+700091"
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold flex items-center gap-2 text-indigo-600">
                    <MapPin size={14} />
                    Open in Google Maps
                  </a>
                  <ChevronRight size={14} className="text-indigo-400 group-hover/link:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="relative rounded-[2rem] shadow-xl shadow-slate-200/60 bg-linear-to-br from-white via-slate-50 to-blue-50/40 p-6 border border-slate-200/80 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.08),transparent_50%)]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 rounded-full bg-blue-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Quick Answers</p>
                </div>
                <div>
                  {FAQS.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── OFFICE NETWORK ───────────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center md:text-left mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Our Offices</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">A growing presence across India</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFICES.map(({ tier, cities, dotColor }) => (
              <div
                key={tier}
                className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute top-6 left-6 w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} aria-hidden="true" />
                <div className="pl-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{tier}</p>
                  <p className="text-base font-bold text-gray-900 mt-1.5 leading-snug">{cities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}