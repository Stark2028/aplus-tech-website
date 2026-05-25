"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle,
  ChevronDown, ChevronUp,
  Building2, Timer, BadgeCheck, Linkedin, ChevronRight
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
    <div className="border-b border-slate-200/70 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-3.5 text-left gap-3 group"
        type="button"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-snug">{q}</span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-blue-500" />
          : <ChevronDown size={14} className="shrink-0 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-500 pb-3.5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LINKEDIN_URL = "https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd";
const MAX_MESSAGE_LENGTH = 500;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageLength, setMessageLength] = useState(0);

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

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0f1b3d 0%, #1e3a6e 40%, #2563eb 100%)" }} className="py-20 md:py-28 relative overflow-hidden">
        {/* Animated dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Glow orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-400/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-cyan-400/10 blur-[60px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
          >
            <motion.div variants={fadeUp} className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300 mb-4">Get in touch</p>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">Let&apos;s build your display solution.</h1>
              <p className="text-blue-200/80 text-base md:text-lg leading-relaxed">From consultation to installation — our team is ready to help you find the perfect Samsung display for your business.</p>
            </motion.div>
            
            {/* Quick stats */}
            <motion.div variants={fadeUp} className="flex gap-6 sm:gap-10 bg-white/[0.07] p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              {[
                { icon: Timer,      value: "4 hrs",  label: "Response Time" },
                { icon: BadgeCheck, value: "Samsung",label: "Certified Partner" },
                { icon: Building2,  value: "Noida",  label: "Headquarters" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2.5 bg-white/10 border border-white/10">
                    <Icon size={18} className="text-blue-200" />
                  </div>
                  <p className="text-white font-bold text-base">{value}</p>
                  <p className="text-blue-300/70 text-[10px] uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── INFO STRIP ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-lg shadow-gray-100/50 relative z-20 -mt-6 mx-4 sm:mx-6 lg:mx-auto max-w-6xl rounded-2xl">
        <div className="px-2">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Phone,  label: "Call Us",      value: "+91 93105 09909",       sub: "Mon – Sat, 10 AM – 6 PM",      href: "tel:+919310509909",         iconColor: "#2563eb", iconBg: "#eff6ff", accent: "#3b82f6" },
              { icon: Mail,   label: "Email",         value: "info@aplustechsol.com", sub: "Reply within 24 hours",        href: "mailto:info@aplustechsol.com",iconColor: "#7c3aed", iconBg: "#f5f3ff", accent: "#8b5cf6" },
              { icon: MapPin, label: "Office",        value: "Sector-94, Noida",      sub: "Supernova Astralis, 8th Fl.", href: "https://maps.google.com/?q=Aplus+Technology+Solutions+Private+Limited+Noida", iconColor: "#059669", iconBg: "#ecfdf5", accent: "#10b981" },
              { icon: Clock,  label: "Support",  value: "24 × 7",   sub: "Emergency assistance",    href: null,                          iconColor: "#d97706", iconBg: "#fffbeb", accent: "#f59e0b" },
            ].map(({ icon: Icon, label, value, sub, href, iconColor, iconBg, accent }) => {
              const inner = (
                <div className="flex items-center gap-3.5 px-4 lg:px-5 py-5 hover:bg-gray-50/80 transition-colors h-full group relative overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accent }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:shadow-md" style={{ background: iconBg, color: iconColor }}>
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              );
              return href ? (
                <motion.a variants={fadeUp} key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block">{inner}</motion.a>
              ) : <motion.div variants={fadeUp} key={label}>{inner}</motion.div>;
            })}
          </motion.div>
        </div>
      </div>

      {/* ── MAIN: FORM + SIDEBAR ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ── FORM (col-span-2) ──────────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent pointer-events-none" />

              {/* Form header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100/80 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                    <Send size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send Us a Message</h2>
                    <p className="text-gray-400 text-xs mt-0.5">We&apos;ll respond within one business day</p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-8 py-24 text-center flex flex-col items-center justify-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: "spring", damping: 15, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-50 shadow-inner"
                    >
                      <CheckCircle size={40} className="text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Received!</h3>
                    <p className="text-gray-500 text-base max-w-sm mx-auto mb-8">
                      Thank you for reaching out. Our team has received your message and will contact you shortly.
                    </p>
                    <button 
                      onClick={() => { setSubmitted(false); setMessageLength(0); }} 
                      type="button"
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} className="px-8 py-8 space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input required name="name" type="text" placeholder="Rahul Sharma"
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Company Name <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                        </label>
                        <input name="company" type="text" placeholder="Acme Hotels Pvt. Ltd."
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <input required name="email" type="email" placeholder="rahul@company.com"
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input required name="phone" type="tel" placeholder="+91 98765 43210"
                          className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                        Inquiry Type <span className="text-red-500">*</span>
                      </label>
                      <select required name="inquiry_type" defaultValue=""
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a topic…</option>
                        {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-[38px] text-gray-400 pointer-events-none" />
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
                      <textarea name="message" rows={5} maxLength={MAX_MESSAGE_LENGTH}
                        onChange={(e) => setMessageLength(e.target.value.length)}
                        placeholder="Please describe your requirements such as product type, quantity, installation site, timeline…"
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
                      />
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
                      <button type="submit" disabled={sending}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 text-white font-semibold px-10 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto">
                        {sending ? (
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
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── SIDEBAR (col-span-1) ───────────────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Contact info + Map */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group">
              <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-gray-100/60 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3.5 mb-4 relative">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">Aplus Technology Solutions</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Samsung Authorized Partner</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-0.5">
                  Office No. 855, 8th Floor,<br />Supernova Astralis, Sector-94,<br />Noida, UP — 201301
                </p>
              </div>
              <div className="relative h-56 w-full overflow-hidden">
                <iframe
                  title="Aplus Technology Solutions Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.5!2d77.3216431!3d28.5505377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce546a104a66d%3A0x735f3944b1574a06!2sAplus%20Technology%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1747344000000!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, display: "block", filter: "grayscale(15%) contrast(1.05) saturate(0.9)" }} allowFullScreen={false} loading="lazy"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 shadow-[inset_0_2px_16px_rgba(0,0,0,0.08)] pointer-events-none" />
              </div>
              <div className="px-6 py-4 bg-white hover:bg-blue-50/40 transition-colors flex items-center justify-between group/link">
                <a href="https://www.google.com/maps/place/Aplus+Technology+Solutions+Private+Limited/@28.5505377,77.3216431,17z"
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                  <MapPin size={14} />
                  Open in Google Maps
                </a>
                <ChevronRight size={14} className="text-blue-400 group-hover/link:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="rounded-3xl overflow-hidden shadow-xl shadow-green-700/25 bg-gradient-to-br from-[#064e45] via-[#075e54] to-[#128c7e] relative group">
              {/* Subtle grid texture */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)" }} />
              {/* Glow orb */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#25d366]/30 blur-2xl pointer-events-none" />
              <div className="px-6 pt-6 pb-4 flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/15 backdrop-blur-md border border-white/20 shadow-inner relative">
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-pulse" />
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-lg leading-tight">Chat on WhatsApp</p>
                  <p className="text-sm text-white/70 mt-0.5">Fastest way to reach our sales team</p>
                </div>
              </div>
              <div className="px-5 pb-6 relative z-10">
                <a href="https://wa.me/919310509909?text=Hi%2C%20I%20have%20an%20inquiry%20about%20your%20Samsung%20display%20products."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full text-sm font-bold py-4 rounded-2xl transition-all bg-[#25d366] hover:bg-[#20ba5a] text-white shadow-lg shadow-green-900/30 hover:shadow-xl hover:shadow-green-900/40 hover:-translate-y-0.5 active:translate-y-0">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Start a Conversation
                </a>
              </div>
            </div>

            {/* Social Media */}
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 p-5 flex items-center gap-4 hover:border-[#0a66c2]/30 hover:shadow-xl hover:shadow-[#0a66c2]/10 transition-all hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0a66c2] flex items-center justify-center shrink-0 shadow-lg shadow-[#0a66c2]/30 group-hover:scale-105 transition-transform">
                <Linkedin size={26} className="text-white" fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Connect With Us</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0a66c2] transition-colors">Follow on LinkedIn</p>
                <p className="text-xs text-gray-400 mt-0.5">Updates &amp; project showcases</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0a66c2] group-hover:translate-x-0.5 transition-all shrink-0" />
            </a>

            {/* FAQ */}
            <div className="relative rounded-[2rem] shadow-xl shadow-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-6 border border-slate-200/80 overflow-hidden">
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

          </motion.div>
        </div>
      </div>
      
      {/* ── TRUST SIGNALS BANNER ─────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Why choose us</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Your trusted display partner</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BadgeCheck, color: "blue",  bg: "bg-blue-50",  text: "text-blue-600",  shadow: "shadow-blue-100/60",  title: "Certified Expertise",   desc: "Authorized Samsung partners — authentic products with official warranties." },
              { icon: MapPin,     color: "green", bg: "bg-green-50", text: "text-green-600", shadow: "shadow-green-100/60", title: "Pan-India Support",     desc: "Nationwide logistics & installation network covering 50+ cities." },
              { icon: Timer,      color: "amber", bg: "bg-amber-50", text: "text-amber-600", shadow: "shadow-amber-100/60", title: "End-to-End Service",    desc: "Consultation, supply, installation & 24/7 AMC — one expert team." },
            ].map(({ icon: Icon, bg, text, shadow, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative bg-white rounded-2xl border border-gray-100 p-7 text-center shadow-lg ${shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className={`w-14 h-14 rounded-2xl ${bg} ${text} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}