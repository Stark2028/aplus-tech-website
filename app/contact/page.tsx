"use client";

import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle,
  MessageCircle, ChevronDown, ChevronUp,
  Building2, Timer, BadgeCheck,
} from "lucide-react";

const INQUIRY_TYPES = [
  "Product Inquiry",
  "Request a Quote",
  "Technical Support",
  "Partnership / Dealership",
  "Bulk / Project Order",
  "Other",
];

const FAQS = [
  { q: "How quickly do you respond?", a: "Within 4 business hours for standard inquiries, same-day for urgent projects." },
  { q: "Do you offer on-site demos?", a: "Yes — at your office or our Noida showroom. Contact us to schedule." },
  { q: "What areas do you serve?", a: "Pan-India delivery and installation, with full logistics support for bulk orders." },
  { q: "Is installation included?", a: "Yes. We provide end-to-end supply, installation, and post-sale AMC for every project." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-3.5 text-left gap-3 group"
      >
        <span className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors leading-snug">{q}</span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-blue-300" />
          : <ChevronDown size={14} className="shrink-0 text-blue-400" />}
      </button>
      {open && <p className="text-sm text-blue-200/70 pb-3.5 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      subject: "New Contact Form Submission — Aplus Tech",
      from_name: "Aplus Tech Website",
    };
    fd.forEach((value, key) => { payload[key] = value as string; });
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) setSubmitted(true);
    else setError(data.message || "Something went wrong. Please try again.");
  }

  return (
    <main className="min-h-screen">

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #4338ca 100%)" }} className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white">Contact Us</h1>
              
            </div>
            {/* Quick stats */}
            <div className="flex gap-6">
              {[
                { icon: Timer,      value: "4 hrs",  label: "Response" },
                { icon: BadgeCheck, value: "Samsung",label: "Certified" },
                { icon: Building2,  value: "Noida",  label: "HQ" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{value}</p>
                  <p className="text-blue-300 text-[10px] uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO STRIP ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone,  label: "Call Us",      value: "+91 93105 09909",       sub: "Mon – Sat, 9 AM – 6 PM",      href: "tel:+919310509909",         iconColor: "#2563eb", iconBg: "#eff6ff" },
              { icon: Mail,   label: "Email",         value: "info@aplustechsol.com", sub: "Reply within 24 hours",        href: "mailto:info@aplustechsol.com",iconColor: "#7c3aed", iconBg: "#f5f3ff" },
              { icon: MapPin, label: "Office",        value: "Sector-94, Noida",      sub: "Supernova Astralis, 8th Fl.", href: "https://maps.google.com/?q=Aplus+Technology+Solutions+Private+Limited+Noida", iconColor: "#059669", iconBg: "#ecfdf5" },
              { icon: Clock,  label: "Office Hours",  value: "Mon–Sat: 9 AM–6 PM",   sub: "Emergency support 24 × 7",    href: null,                          iconColor: "#d97706", iconBg: "#fffbeb" },
            ].map(({ icon: Icon, label, value, sub, href, iconColor, iconBg }) => {
              const inner = (
                <div className="flex items-center gap-3 px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg, color: iconColor }}>
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0">{inner}</a>
              ) : <div key={label} className="border-b lg:border-b-0 border-gray-100">{inner}</div>;
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN: FORM + SIDEBAR ─────────────────────────────────────── */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── FORM (col-span-2) ──────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Form header */}
                <div className="px-8 pt-7 pb-5 border-b border-gray-50" style={{ borderTop: "3px solid #2563eb" }}>
                  <h2 className="text-xl font-bold text-gray-900">Send Us a Message</h2>
                  <p className="text-gray-500 text-sm mt-1">A specialist will respond within one business day.</p>
                </div>

                {submitted ? (
                  <div className="px-8 py-16 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#dcfce7" }}>
                      <CheckCircle size={30} style={{ color: "#16a34a" }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">Our team will contact you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-6 text-blue-600 text-sm font-medium hover:underline">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input required name="name" type="text" placeholder="Rahul Sharma"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition"
                          style={{ outlineColor: "#2563eb" }}
                          onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                          onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Company Name <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                        </label>
                        <input name="company" type="text" placeholder="Acme Hotels Pvt. Ltd."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition"
                          onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                          onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <input required name="email" type="email" placeholder="rahul@company.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition"
                          onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                          onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input required name="phone" type="tel" placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition"
                          onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                          onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Inquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select required name="inquiry_type" defaultValue=""
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition text-gray-700 appearance-none cursor-pointer"
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}>
                        <option value="" disabled>Select a topic…</option>
                        {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Message / Requirements <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                      </label>
                      <textarea name="message" rows={5}
                        placeholder="Product type, quantity, installation site, timeline…"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition resize-none"
                        onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <div className="flex items-center gap-5 pt-1">
                      <button type="submit" disabled={sending}
                        style={{ background: "#2563eb" }}
                        className="inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-50 text-white font-semibold px-8 py-3.5 rounded-xl transition-opacity">
                        <Send size={15} />
                        {sending ? "Sending…" : "Send Message"}
                      </button>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Your details are kept private.<br />We never spam.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ── SIDEBAR (col-span-1) ───────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Contact info + Map */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Our Office</p>
                  <p className="text-sm font-bold text-gray-900">Aplus Technology Solutions</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Office No. 855, 8th Floor,<br />Supernova Astralis, Sector-94,<br />Noida — 201301
                  </p>
                </div>
                <iframe
                  title="Aplus Technology Solutions Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.5!2d77.3216431!3d28.5505377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce546a104a66d%3A0x735f3944b1574a06!2sAplus%20Technology%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1747344000000!5m2!1sen!2sin"
                  width="100%" height="185" style={{ border: 0, display: "block" }} allowFullScreen={false} loading="lazy"
                />
                <div className="px-5 py-3 border-t border-gray-50">
                  <a href="https://www.google.com/maps/place/Aplus+Technology+Solutions+Private+Limited/@28.5505377,77.3216431,17z"
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#2563eb" }}>
                    <MapPin size={11} /> Get Directions →
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#075e54" }}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Chat on WhatsApp</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Fastest way to reach us</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <a href="https://wa.me/919310509909?text=Hi%2C%20I%20have%20an%20inquiry%20about%20your%20Samsung%20display%20products."
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3 rounded-xl transition-opacity hover:opacity-90"
                    style={{ background: "#25d366", color: "#fff" }}>
                    <MessageCircle size={15} />
                    Start a Conversation
                  </a>
                </div>
              </div>

              {/* Office hours */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Availability</p>
                <div className="space-y-3">
                  {[
                    { day: "Monday – Saturday", time: "9:00 AM – 6:00 PM", bg: "#f0fdf4", color: "#15803d" },
                    { day: "Sunday",             time: "Closed",             bg: "#fef2f2", color: "#dc2626" },
                    { day: "Emergency Support",  time: "24 × 7",             bg: "#eff6ff", color: "#1d4ed8" },
                  ].map(({ day, time, bg, color }) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl shadow-sm p-5" style={{ background: "#1e3a5f" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#93c5fd" }}>Quick Answers</p>
                <div>
                  {FAQS.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </main>
  );
}