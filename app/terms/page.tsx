import { Metadata } from "next";
import Link from "next/link";

const TERMS_URL = "https://www.aplustechsol.com/terms";

export const metadata: Metadata = {
  title: "Terms & Conditions | Aplus Technology Solutions",
  description:
    "Terms and conditions governing the use of aplustechsol.com and the purchase of Samsung commercial display products from Aplus Technology Solutions Pvt. Ltd.",
  alternates: { canonical: TERMS_URL },
  robots: { index: true, follow: false },
  openGraph: {
    type: "website",
    url: TERMS_URL,
    title: "Terms & Conditions | Aplus Technology Solutions",
    description:
      "Terms governing purchases, delivery, warranty, and use of services from Aplus Technology Solutions Pvt. Ltd.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Terms & Conditions — Aplus Technology Solutions" }],
  },
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using this website, requesting a quote, or placing an order with Aplus Technology Solutions Pvt. Ltd. ("Aplus", "we", "us"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this website or our services.

These terms apply to all visitors, customers, and business partners who interact with our website or sales team.`,
  },
  {
    title: "Products and Services",
    content: `Aplus Technology Solutions is an authorized distributor of Samsung commercial display products in India. Our offerings include:
• Samsung Smart Signage & Digital Displays
• Video Wall systems (indoor and outdoor)
• Interactive Flat Panel Displays
• Hospitality and Commercial TVs
• Installation, configuration, and Annual Maintenance Contract (AMC) services

Product availability and specifications are subject to change without prior notice. All products are genuine Samsung merchandise sourced through authorized channels.`,
  },
  {
    title: "Pricing and Quotations",
    content: `All prices displayed or quoted are in Indian Rupees (INR) and exclusive of applicable GST unless stated otherwise. Prices are valid at the time of quotation and may vary based on:
• Quantity and project size
• Delivery location and installation complexity
• Current Samsung pricing revisions

A formal quotation is valid for 15 days from the date of issue unless otherwise specified. Aplus reserves the right to revise pricing before a purchase order is confirmed.`,
  },
  {
    title: "Orders and Payment",
    content: `All orders are subject to written acceptance by Aplus. An order is confirmed only upon receipt of a signed Purchase Order and advance payment as agreed. Standard payment terms are:
• 50% advance on order confirmation
• Balance 50% before dispatch or as mutually agreed in writing

Aplus issues a formal GST tax invoice for every transaction. For large or project-based orders, milestone-based payment schedules may be agreed separately.`,
  },
  {
    title: "Delivery and Installation",
    content: `Aplus provides pan-India delivery and installation services. Estimated delivery timelines are provided at the time of order confirmation and are subject to stock availability and logistics conditions.

• Risk of damage passes to the buyer upon delivery unless installation is included in the scope.
• Installation timelines are scheduled after site readiness confirmation from the buyer.
• Any delays caused by incomplete site preparation, restricted access, or pending civil work are not the responsibility of Aplus.

Aplus is not liable for delays caused by force majeure events, including natural disasters, government restrictions, or supply chain disruptions.`,
  },
  {
    title: "Warranty and Returns",
    content: `All Samsung products are covered by Samsung India's standard commercial warranty. Warranty terms vary by product category and are communicated at the time of purchase.

• Warranty claims must be raised through Aplus or Samsung's authorized service network.
• Products must not be tampered with or repaired by unauthorized parties — doing so voids the warranty.
• Returns are accepted only for products with manufacturing defects verified by Samsung-authorized engineers.
• Change-of-mind returns are not accepted after delivery and installation.

Aplus provides AMC services post-warranty for continued support.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website — including text, images, product descriptions, logos, and design — is the property of Aplus Technology Solutions Pvt. Ltd. or its licensors (including Samsung India Electronics Pvt. Ltd.) and is protected under applicable intellectual property laws.

You may not reproduce, distribute, or use any content from this website for commercial purposes without prior written permission from Aplus.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, Aplus Technology Solutions shall not be liable for:
• Indirect, incidental, or consequential damages arising from product use
• Loss of business, data, revenue, or profits
• Delays in delivery due to circumstances beyond our control

Our total liability to any customer shall not exceed the invoice value of the specific products or services in dispute.`,
  },
  {
    title: "Governing Law and Disputes",
    content: `These Terms & Conditions are governed by the laws of India. Any disputes arising from or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh, India.

We encourage resolution of disputes through good-faith discussion before initiating legal proceedings. Contact us at info@aplustechsol.com for any grievances.`,
  },
  {
    title: "Changes to These Terms",
    content: `Aplus reserves the right to update these Terms & Conditions at any time. Material changes will be communicated via a notice on our website. Continued use of our website or services after such changes constitutes acceptance of the revised terms.

The effective date at the top of this page reflects the most recent revision.`,
  },
];

export default function TermsPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-500 text-sm">
            <strong>Effective date:</strong> January 1, 2025 &nbsp;·&nbsp;
            <strong>Last updated:</strong> May 2026
          </p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            These terms govern your use of aplustechsol.com and any purchase of products or services from Aplus Technology Solutions Pvt. Ltd. Please read them carefully before placing an order or using our services.
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
          <h3 className="text-xl font-bold mb-2">Questions About These Terms?</h3>
          <p className="text-blue-100 text-sm mb-6">
            Reach our team for any clarifications before placing your order.
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
