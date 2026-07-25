"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, FileText, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { WHATSAPP_NUMBER, getWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { WA_PATH } from "@/components/chat/WhatsAppPanel";
import { useChat } from "@/context/ChatContext";

/**
 * Mobile-only sticky CTA bar.
 *
 * Chat joins the bar rather than adding a floating bubble (spec §3.1): mobile
 * gains live chat with NO new floating element. Four buttons at 3/12 each keep
 * tap targets ≈80px wide on a 360px phone — comfortably over the 44px minimum.
 *
 * On /quote the bar used to hide entirely, because that page already has its own
 * WhatsApp/Call/Submit affordances. That is still true of those three — but live
 * chat is a capability /quote does NOT otherwise have, so there we render Chat
 * alone rather than nothing.
 */
export default function MobileStickyCTA() {
  const pathname = usePathname();
  const { openChat, unread } = useChat();

  const isQuote = pathname.startsWith("/quote");

  const waMessage = getWhatsAppMessage(pathname);
  const waHref = buildWhatsAppUrl(waMessage);

  const openLiveChat = () => {
    trackEvent("chat_open", { source: "mobile_sticky", page: pathname });
    openChat("home");
  };

  return (
    <div
      // md:hidden — mobile only. The pb safe-area value handles iOS home-indicator devices.
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      role="region"
      aria-label="Quick contact"
    >
      <div className="grid grid-cols-12 gap-2 px-3 py-2.5">
        {/* Chat — 3/12 on a normal page, full width on /quote */}
        <button
          type="button"
          onClick={openLiveChat}
          aria-label={
            unread > 0
              ? `Chat with sales, ${unread} new ${unread === 1 ? "message" : "messages"}`
              : "Chat with sales"
          }
          className={`${
            isQuote ? "col-span-12" : "col-span-3"
          } relative flex items-center justify-center gap-1.5 bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors`}
        >
          <MessageCircle size={15} aria-hidden="true" />
          Chat
          {/* Unread agent replies — the desktop launcher badge has no mobile twin,
              so without this a salesperson's reply is counted but never shown on
              phones. ring (not border) keeps the box size stable. */}
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            >
              {unread}
            </span>
          )}
        </button>

        {!isQuote && (
          <>
            {/* WhatsApp — 3/12 */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat on WhatsApp at +${WHATSAPP_NUMBER}`}
              onClick={() => trackEvent("whatsapp_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-[#25D366] active:bg-[#1ea758] text-gray-900 font-semibold text-sm rounded-xl py-3 transition-colors shadow-sm shadow-green-600/20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-900 shrink-0" aria-hidden="true">
                <path d={WA_PATH} />
              </svg>
              <span className="sr-only sm:not-sr-only">WhatsApp</span>
            </a>

            {/* Call — 3/12 */}
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              aria-label="Call sales"
              onClick={() => trackEvent("call_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl py-3 transition-colors"
            >
              <Phone size={15} aria-hidden="true" />
              Call
            </a>

            {/* Quote — 3/12. Indigo (not blue) so it reads as distinct from the
                blue Chat button at the other end of the bar. */}
            <Link
              href="/quote"
              aria-label="Request a quote"
              onClick={() => trackEvent("quote_click", { source: "mobile_sticky", page: pathname })}
              className="col-span-3 flex items-center justify-center gap-1.5 bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl py-3 transition-colors"
            >
              <FileText size={15} aria-hidden="true" />
              Quote
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
