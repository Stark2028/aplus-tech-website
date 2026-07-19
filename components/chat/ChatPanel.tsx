"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, MessageCircle, Phone, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useChat, type ChatView } from "@/context/ChatContext";
import LiveChat from "./LiveChat";
import WhatsAppPanel, { WA_PATH } from "./WhatsAppPanel";
import { PHONE_TEL } from "@/lib/contact";
import { getWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

/**
 * The panel behind the single launcher (spec §3.1) — desktop popover, mobile
 * bottom sheet, one component.
 *
 * PORTALED TO <body> ON PURPOSE. The panel uses backdrop-blur, and any
 * `backdrop-filter` ancestor becomes the containing block for `fixed` children —
 * so a bottom sheet rendered inside the blurred tree gets clamped to it instead
 * of the viewport. Do not "simplify" the portal away.
 *
 * Layering (spec §3.1): panel z-[60], above the mobile sticky bar (z-40) and
 * below the cookie banner (z-300).
 */
/**
 * Touch-primary devices (phones/tablets) have the WhatsApp app installed, so a
 * wa.me deep link opens the real conversation instantly. The in-widget WhatsApp
 * panel (QR to scan, "WhatsApp Web" link) only earns its keep on desktop, where
 * there may be no app. `pointer: coarse` is the standard signal for a
 * touchscreen-primary device and cleanly separates the two.
 */
function isTouchPrimary(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
}

export default function ChatPanel({ teamOnline }: { teamOnline: boolean }) {
  const { isOpen, view, openChat, closeChat } = useChat();
  const pathname = usePathname();

  // WhatsApp pick from the home fork: on mobile/tablet jump straight into the
  // installed app; on desktop fall back to the in-widget WhatsApp panel.
  const handleWhatsAppPick = () => {
    if (isTouchPrimary()) {
      trackEvent("whatsapp_click", { source: "chat_widget_home", page: pathname });
      window.open(buildWhatsAppUrl(getWhatsAppMessage(pathname)), "_blank", "noopener,noreferrer");
      closeChat();
      return;
    }
    openChat("whatsapp");
  };
  // Lazy initializer, not an Effect: ChatLauncher (Task 17) loads this component
  // via `dynamic(..., { ssr: false })`, so ChatPanel only ever mounts
  // client-side — `document` is already available on the very first render.
  // That makes the portal ready immediately (no extra render), and — unlike an
  // effect that calls setState synchronously — doesn't trip
  // react-hooks/set-state-in-effect (ERROR-level in this repo).
  const [mounted] = useState(() => typeof document !== "undefined");

  // Escape closes — a fixed overlay with no keyboard exit is a trap.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeChat]);

  if (!mounted || !isOpen) return null;

  const panel = (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Aplus Technology Solutions"
      className={[
        "fixed z-[60] flex flex-col overflow-hidden bg-white/90 backdrop-blur-xl shadow-glass border border-white/40",
        // Mobile: bottom sheet, full width, above the sticky bar.
        "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]",
        // Desktop: anchored popover above the launcher.
        "md:inset-x-auto md:right-5 md:bottom-24 md:w-90 md:max-w-[calc(100vw-24px)] md:rounded-2xl md:max-h-[560px]",
      ].join(" ")}
    >
      <Header teamOnline={teamOnline} onClose={closeChat} />

      {view === "home" && <HomeFork teamOnline={teamOnline} onPick={openChat} onWhatsApp={handleWhatsAppPick} />}
      {view === "live" && <LiveChat onWhatsApp={() => openChat("whatsapp")} />}
      {view === "whatsapp" && <WhatsAppPanel />}
    </div>
  );

  return createPortal(panel, document.body);
}

function Header({ teamOnline, onClose }: { teamOnline: boolean; onClose: () => void }) {
  return (
    <div className="bg-blue-600 px-5 py-4 flex items-center gap-3 shrink-0">
      <div className="relative shrink-0">
        <Image
          src="/logo.png"
          alt="Aplus Technology"
          width={36}
          height={36}
          className="rounded-lg bg-white p-0.5 object-contain"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-blue-600 ${
            teamOnline ? "bg-green-400" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-sm truncate">Aplus Technology Solutions</div>
        {/* Presence is already shown by the dot on the avatar above — a second
            inline dot here was redundant, so the status is text-only. */}
        <div className="text-blue-100 text-xs">
          {teamOnline
            ? "Sales team is online — replies in minutes"
            : "Team is away — we'll reply on WhatsApp/email"}
        </div>
      </div>
      <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors" aria-label="Close chat">
        <X size={18} />
      </button>
    </div>
  );
}

/**
 * The explicit fork (spec §3.1). The two paths are genuinely different products,
 * so we NAME the difference instead of hiding it behind identical bubbles:
 *
 *   online → live chat is the hero, because it is genuinely the best path.
 *   away   → say so, and give WhatsApp/Call equal weight, because a live chat
 *            cannot be answered live.
 */
function HomeFork({
  teamOnline,
  onPick,
  onWhatsApp,
}: {
  teamOnline: boolean;
  onPick: (view: ChatView) => void;
  onWhatsApp: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {teamOnline ? (
        <>
          <button
            onClick={() => onPick("live")}
            className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-md shadow-blue-600/20"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span className="flex-1 text-left">
              <span className="block text-sm">Chat now</span>
              <span className="block text-[11px] font-medium text-blue-100">
                Talk to us right here, right now.
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0" />
          </button>

          <button
            onClick={onWhatsApp}
            className="w-full flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-3 rounded-xl font-semibold transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] shrink-0">
              <path d={WA_PATH} />
            </svg>
            <span className="flex-1 text-left">
              <span className="block text-sm">Continue on WhatsApp</span>
              <span className="block text-[11px] font-medium text-gray-400">
                The thread lives in WhatsApp.
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
          </button>

          <div className="flex gap-2 pt-1">
            <a
              href={PHONE_TEL}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 py-2"
            >
              <Phone size={13} /> Call
            </a>
            <a
              href="mailto:info@aplustechsol.com"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 py-2"
            >
              ✉ Email
            </a>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => onPick("live")}
            className="w-full flex items-center gap-3 bg-gray-900 hover:bg-blue-600 text-white px-4 py-4 rounded-xl font-bold transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={20} className="shrink-0" />
            <span className="flex-1 text-left text-sm">Leave a message</span>
            <ChevronRight size={16} className="shrink-0" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
                <path d={WA_PATH} />
              </svg>
              WhatsApp
            </button>
            <a
              href={PHONE_TEL}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Phone size={14} /> Call
            </a>
          </div>

          <p className="text-[11px] text-center text-gray-500 leading-relaxed">
            We&apos;ll reply by WhatsApp or email.
          </p>
        </>
      )}
    </div>
  );
}
