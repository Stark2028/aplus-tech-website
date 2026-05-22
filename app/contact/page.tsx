"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle,
  MessageCircle, ChevronDown, ChevronUp,
  Building2, Timer, BadgeCheck, Linkedin
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
        type="button"
      >
        <span className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors leading-snug">{q}</span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-blue-300" />
          : <ChevronDown size={14} className="shrink-0 text-blue-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-blue-200/70 pb-3.5 leading-relaxed">{a}</p>
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
      <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #4338ca 100%)" }} className="py-16 md:py-20 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8"
          >
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-2">Contact Us</h1>
              
            </motion.div>
            
            {/* Quick stats */}
            <motion.div variants={fadeUp} className="flex gap-6 sm:gap-8 bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
              {[
                { icon: Timer,      value: "4 hrs",  label: "Response Time" },
                { icon: BadgeCheck, value: "Samsung",label: "Certified Partner" },
                { icon: Building2,  value: "Noida",  label: "Headquarters" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 bg-white/10 shadow-inner">
                    <Icon size={18} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm sm:text-base">{value}</p>
                  <p className="text-blue-200 text-[10px] sm:text-xs uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── INFO STRIP ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Phone,  label: "Call Us",      value: "+91 93105 09909",       sub: "Mon – Sat, 9 AM – 6 PM",      href: "tel:+919310509909",         iconColor: "#2563eb", iconBg: "#eff6ff" },
              { icon: Mail,   label: "Email",         value: "info@aplustechsol.com", sub: "Reply within 24 hours",        href: "mailto:info@aplustechsol.com",iconColor: "#7c3aed", iconBg: "#f5f3ff" },
              { icon: MapPin, label: "Office",        value: "Sector-94, Noida",      sub: "Supernova Astralis, 8th Fl.", href: "https://maps.google.com/?q=Aplus+Technology+Solutions+Private+Limited+Noida", iconColor: "#059669", iconBg: "#ecfdf5" },
              { icon: Clock,  label: "Support",  value: "24 × 7",   sub: "Emergency assistance",    href: null,                          iconColor: "#d97706", iconBg: "#fffbeb" },
            ].map(({ icon: Icon, label, value, sub, href, iconColor, iconBg }) => {
              const inner = (
                <div className="flex items-center gap-3 px-4 lg:px-6 py-5 hover:bg-gray-50 transition-colors h-full group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: iconBg, color: iconColor }}>
                    <Icon size={20} />
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
                  className="border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0 block">{inner}</motion.a>
              ) : <motion.div variants={fadeUp} key={label} className="border-b lg:border-b-0 border-gray-100">{inner}</motion.div>;
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
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">

              {/* Form header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900">Send Us a Message</h2>
                <p className="text-gray-500 text-sm mt-2">Fill out the form below and a specialist will get back to you within one business day.</p>
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
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 overflow-hidden group">
              <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <p className="text-base font-bold text-gray-900">Aplus Technology Solutions</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Office No. 855, 8th Floor,<br />Supernova Astralis, Sector-94,<br />Noida, UP — 201301
                </p>
              </div>
              <div className="relative h-50 w-full overflow-hidden">
                <iframe
                  title="Aplus Technology Solutions Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.5!2d77.3216431!3d28.5505377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce546a104a66d%3A0x735f3944b1574a06!2sAplus%20Technology%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sin!4v1747344000000!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, display: "block", filter: "grayscale(20%) contrast(1.1)" }} allowFullScreen={false} loading="lazy"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                {/* Inner shadow overlay for premium look */}
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
              </div>
              <div className="px-6 py-4 bg-white hover:bg-gray-50 transition-colors">
                <a href="https://www.google.com/maps/place/Aplus+Technology+Solutions+Private+Limited/@28.5505377,77.3216431,17z"
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold flex items-center justify-between text-blue-600">
                  Open in Google Maps <MapPin size={14} />
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="rounded-3xl overflow-hidden shadow-lg shadow-green-600/20 bg-gradient-to-br from-[#075e54] to-[#128c7e] relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="px-6 py-5 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md relative">
                  <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-50" />
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Chat on WhatsApp</p>
                  <p className="text-xs text-white/80 mt-0.5">Fastest way to reach our sales team</p>
                </div>
              </div>
              <div className="px-5 pb-5 relative z-10">
                <a href="https://wa.me/919310509909?text=Hi%2C%20I%20have%20an%20inquiry%20about%20your%20Samsung%20display%20products."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3.5 rounded-xl transition-all shadow-md bg-[#25d366] text-white hover:bg-[#20ba5a] hover:shadow-lg transform group-hover:-translate-y-0.5">
                  <MessageCircle size={16} />
                  Start a Conversation
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Connect With Us</p>
              <div className="flex items-center gap-3">
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white flex items-center justify-center transition-colors">
                  <Linkedin size={18} fill="currentColor" />
                </a>
                <div className="flex-1 text-sm text-gray-500 font-medium pl-3 border-l border-gray-100">
                  Follow us on LinkedIn for updates and project showcases.
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl shadow-lg p-6 bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-4">Quick Answers</p>
              <div>
                {FAQS.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
      
      {/* ── TRUST SIGNALS BANNER ─────────────────────────────────────── */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center p-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <BadgeCheck size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Certified Expertise</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">We are authorized Samsung partners, delivering authentic products with official warranties.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center p-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                <MapPin size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Pan-India Support</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">From local offices to nationwide rollouts, our logistics and installation network covers you.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center p-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Timer size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">End-to-End Service</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">Consultation, supply, installation, and 24/7 post-sale AMC all handled by one expert team.</p>
            </motion.div>
          </div>
        </div>
      </div>

    </main>
  );
}