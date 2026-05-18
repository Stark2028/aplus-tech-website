import { Metadata } from "next";
import Link from "next/link";

const PRIVACY_URL = "https://www.aplustechsol.com/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Aplus Technology Solutions",
  description:
    "Read the privacy policy of Aplus Technology Solutions Pvt. Ltd. — how we collect, use, and protect your data in compliance with India's DPDP Act.",
  alternates: { canonical: PRIVACY_URL },
  robots: { index: true, follow: false },
  openGraph: {
    type: "website",
    url: PRIVACY_URL,
    title: "Privacy Policy | Aplus Technology Solutions",
    description:
      "How Aplus Technology Solutions collects, uses, and protects your personal data — in compliance with India's Digital Personal Data Protection Act.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Privacy Policy — Aplus Technology Solutions" }],
  },
};

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `When you use our website, request a quote, or contact us, we may collect:
• Name, job title, and company name
• Business email address and phone number
• Shipping / installation address
• Product inquiry details and usage requirements
• Browser and device information (via cookies) for site analytics`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information collected to:
• Respond to quote requests and sales inquiries
• Process orders and coordinate installation scheduling
• Provide post-sales technical support
• Send product updates and relevant B2B offers (you may opt out at any time)
• Improve our website and services based on usage analytics`,
  },
  {
    title: "Data Sharing",
    content: `We do not sell, rent, or trade your personal information. We may share data with:
• Samsung India Electronics Pvt. Ltd. for warranty registration and support
• Authorized logistics partners for order fulfilment and delivery
• Service technicians for installation coordination
• Payment processors for transaction security (no card data is stored by us)

All third parties are bound by confidentiality obligations.`,
  },
  {
    title: "Cookies",
    content: `Our website uses cookies to:
• Remember your session preferences
• Measure site performance and traffic (Google Analytics)
• Improve navigation and user experience

You can disable cookies through your browser settings. Disabling cookies will not affect your ability to contact us or request a quote.`,
  },
  {
    title: "Data Security",
    content: `We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. All form submissions are transmitted over HTTPS encryption. We retain your data only as long as necessary to fulfil the purpose for which it was collected, or as required by applicable law.`,
  },
  {
    title: "Your Rights",
    content: `Under applicable Indian data protection law, you have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data (subject to legal retention requirements)
• Opt out of marketing communications at any time

To exercise any of these rights, contact us at info@aplustechsol.com`,
  },
  {
    title: "Third-Party Links",
    content: `Our website may contain links to third-party websites (e.g., Samsung.com). We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. Material changes will be communicated via a notice on our website. The date at the top of this page reflects the most recent revision.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            <strong>Effective date:</strong> January 1, 2024 &nbsp;·&nbsp;
            <strong>Last updated:</strong> May 2025
          </p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Aplus Technology Solutions Pvt. Ltd. (&ldquo;Aplus&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
            committed to protecting your personal information. This policy explains
            what data we collect, how we use it, and your rights in relation to it.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Questions About This Policy?</h3>
          <p className="text-blue-100 text-sm mb-6">
            Contact our Data Protection Officer at:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
            <a
              href="mailto:info@aplustechsol.com"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-medium transition-all"
            >
              info@aplustechsol.com
            </a>
            <Link
              href="/contact"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
