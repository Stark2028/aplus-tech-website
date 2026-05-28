"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Phone,
  Mail,
  Send,
  ChevronRight,
  Clock,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { WHATSAPP_NUMBER, getWhatsAppMessage } from "@/lib/whatsapp";

const QUICK_ACTIONS = [
  { label: "Get a product quote", msg: "Hi, I need a quote for Samsung display products." },
  { label: "Video wall inquiry", msg: "Hi, I'd like to know more about Samsung video wall solutions." },
  { label: "Hotel TV solutions", msg: "Hi, I'm looking for Samsung hotel TV solutions for my property." },
  { label: "Schedule a demo", msg: "Hi, I'd like to schedule a product demo at your Noida center." },
];


export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "whatsapp">("whatsapp");
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(1);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  const openWhatsApp = (msg?: string) => {
    const text = encodeURIComponent(msg ?? getWhatsAppMessage(pathname));
    trackEvent("whatsapp_click", { source: "chat_widget", page: pathname });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    trackEvent("chat_widget_message_sent", { page: pathname });
    openWhatsApp(text);
  };

  const isOnline = () => {
    const h = new Date().getHours();
    const d = new Date().getDay(); // 0=Sun, 6=Sat
    return d !== 0 && h >= 9 && h < 18;
  };

  return (
    // Desktop-only. On mobile, the sticky bottom MobileStickyCTA bar provides
    // the same WhatsApp/Call entry points without competing with thumb area.
    <div className="hidden md:contents">
      {/* WhatsApp floating button (always visible) */}
      <div className="fixed bottom-24 right-5 z-50">
        {/* Online pulse ring */}
        {isOnline() && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
        )}
        <button
          onClick={() => openWhatsApp()}
          className="relative w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>

      {/* Main chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40 transition-all hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="text-white" size={22} />
        ) : (
          <>
            <MessageCircle className="text-white" size={24} />
            {unread > 0 && (
              <span aria-hidden="true" className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-90 max-w-[calc(100vw-24px)] bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass border border-white/40 overflow-hidden flex flex-col"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center gap-3">
            <div className="relative shrink-0">
              <Image
                src="/logo.png"
                alt="Aplus Technology"
                width={36}
                height={36}
                className="rounded-lg bg-white p-0.5 object-contain"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-600 ${isOnline() ? "bg-green-400" : "bg-gray-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm truncate">Aplus Technology Solutions</div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline() ? "bg-green-300" : "bg-gray-300"}`} />
                <span className="text-blue-100 text-xs">
                  {isOnline() ? "Online — replies in minutes" : "Away — replies next business day"}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["whatsapp", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t === "whatsapp" ? "💬 WhatsApp" : "✉️ Message Us"}
              </button>
            ))}
          </div>

          {/* WhatsApp tab */}
          {tab === "whatsapp" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-gray-500 text-xs text-center mb-4">
                Connect instantly with our sales team on WhatsApp
              </p>

              {/* Primary WhatsApp CTA */}
              <button
                onClick={() => openWhatsApp()}
                className="w-full flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-md shadow-green-500/20"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="flex-1 text-left text-sm">Chat on WhatsApp</span>
                <ChevronRight size={16} />
              </button>

              {/* Quick action chips */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick inquiries</p>
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => openWhatsApp(a.msg)}
                    className="w-full text-left text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 px-4 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2"
                  >
                    {a.label}
                    <ChevronRight size={14} className="shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>

              {/* Contact alternatives */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Other ways to reach us</p>
                <a href="tel:+919310509909" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
                  <Phone size={15} className="text-blue-500 shrink-0" />
                  +91 93105 09909
                </a>
                <a href="mailto:info@aplustechsol.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
                  <Mail size={15} className="text-blue-500 shrink-0" />
                  info@aplustechsol.com
                </a>
              </div>
            </div>
          )}

          {/* Message tab */}
          {tab === "chat" && (
            <>
              {/* Info */}
              <div className="flex-1 p-4 flex flex-col gap-4">
                <p className="text-xs text-gray-500 text-center">
                  Type your message below — it will open in WhatsApp so our team receives it instantly.
                </p>

                {/* Response time note */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <Clock size={13} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-700">
                    Mon–Sat, 9 AM – 6 PM · replies within minutes on WhatsApp
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message…"
                  className="flex-1 text-sm bg-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all"
                  aria-label="Send via WhatsApp"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
