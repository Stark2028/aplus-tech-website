"use client";

import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Phone, Mail, ChevronRight, Smartphone } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { getWhatsAppMessage, buildWhatsAppUrl, buildWhatsAppWebUrl } from "@/lib/whatsapp";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

/**
 * The WhatsApp path — "continue on your phone" (spec §3.1).
 *
 * Lifted VERBATIM out of the old ChatWidget: Web link, scan-to-continue QR,
 * quick-inquiry chips, phone/email fallbacks. The spec preserves this content
 * exactly and only changes where it sits (a labelled secondary path instead of
 * a tab). Do not redesign it here — the wa.me / Web-link logic is untouched.
 */

/** WhatsApp brand mark. Exported so the launcher and sticky bar share one copy. */
export const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const QUICK_ACTIONS = [
  { label: "Get a product quote", msg: "Hi, I need a quote for Samsung display products." },
  { label: "Video wall inquiry", msg: "Hi, I'd like to know more about Samsung video wall solutions." },
  { label: "Hotel TV solutions", msg: "Hi, I'm looking for Samsung hotel TV solutions for my property." },
];

export default function WhatsAppPanel() {
  const pathname = usePathname();
  const waLink = buildWhatsAppUrl(getWhatsAppMessage(pathname)); // wa.me — the QR payload opens the phone's app

  const openWhatsApp = (msg?: string) => {
    const text = msg ?? getWhatsAppMessage(pathname);
    trackEvent("whatsapp_click", { source: "chat_widget", page: pathname });
    // Desktop: WhatsApp Web skips the wa.me "Continue to Chat" interstitial,
    // which looks broken to visitors without the desktop app.
    window.open(buildWhatsAppWebUrl(text), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <p className="text-gray-500 text-xs text-center">Connect with our sales team on WhatsApp</p>

      <button
        onClick={() => openWhatsApp()}
        className="w-full flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-md shadow-green-500/20"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
          <path d={WA_PATH} />
        </svg>
        <span className="flex-1 text-left text-sm">Open WhatsApp Web</span>
        <ChevronRight size={16} />
      </button>

      {/* QR — scan to continue on phone (solves the no-app-on-desktop case) */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-white p-1.5 border border-gray-100">
          <QRCodeSVG value={waLink} size={72} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-1.5">
            <Smartphone size={13} className="text-blue-500" /> No WhatsApp on this computer?
          </p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
            Scan with your phone&apos;s camera to open this chat in WhatsApp on your mobile.
          </p>
        </div>
      </div>

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

      <div className="pt-2 border-t border-gray-100 space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Other ways to reach us</p>
        <a href={PHONE_TEL} className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
          <Phone size={15} className="text-blue-500 shrink-0" />
          {PHONE_DISPLAY}
        </a>
        <a href="mailto:info@aplustechsol.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1">
          <Mail size={15} className="text-blue-500 shrink-0" />
          info@aplustechsol.com
        </a>
      </div>
    </div>
  );
}
