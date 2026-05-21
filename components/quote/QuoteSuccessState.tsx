import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Send,
  MessageCircle,
} from "lucide-react";
import ProgressStepper from "./ProgressStepper";

const WHATSAPP_NUMBER = "919310509909";

const NEXT_STEPS = [
  {
    icon: Clock,
    color: "bg-blue-100 text-blue-600",
    title: "We review your request",
    desc: "Our sales team will review your product list within 1–2 business hours.",
  },
  {
    icon: FileText,
    color: "bg-indigo-100 text-indigo-600",
    title: "Custom PDF quote prepared",
    desc: "A formal quote with itemised pricing, GST details, and delivery timeline is prepared.",
  },
  {
    icon: Send,
    color: "bg-green-100 text-green-600",
    title: "Quote delivered within 24 hours",
    desc: "You receive the PDF via email. Our team may also follow up on WhatsApp.",
  },
];

export default function QuoteSuccessState({ submittedName }: { submittedName: string }) {
  const waMsg = encodeURIComponent(
    `Hi! I just submitted a quote request on your website${submittedName ? ` (${submittedName})` : ""}. Can you confirm receipt?`
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-10">
          <ProgressStepper current={3} />
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-blue-500 to-cyan-400" />

          <div className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6 ring-8 ring-green-50/50">
              <CheckCircle size={40} className="text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Quote Request Received!
            </h1>
            {submittedName && (
              <p className="text-gray-500 mb-2">
                Thank you, <span className="font-semibold text-gray-700">{submittedName}</span>.
              </p>
            )}
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
              We&apos;ve received your enquiry and will send a formal PDF proposal
              with itemised pricing to your email.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                What happens next
              </p>
              <div className="space-y-5">
                {NEXT_STEPS.map(({ icon: Icon, color, title, desc }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              >
                <MessageCircle size={16} />
                Follow up on WhatsApp
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              >
                Browse More Products
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
