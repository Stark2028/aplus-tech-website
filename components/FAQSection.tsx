"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What types of commercial displays do you offer?",
    a: "We offer a comprehensive range of Samsung commercial displays including Smart Signage (QET/QBC series), Video Walls, Interactive Flip Displays, Business TVs, Hospitality/Hotel TVs, and Touch Kiosks — covering every B2B display requirement from corporate boardrooms to hotel lobbies.",
  },
  {
    q: "Do you provide installation and integration services?",
    a: "Yes. Every purchase comes with access to our certified installation team. We handle mounting, cabling, content management software setup, and system integration. Our technicians are Samsung-certified and have completed 1,000+ installations across India.",
  },
  {
    q: "Which areas do you serve?",
    a: "We serve pan-India with warehousing hubs in Delhi-NCR, Mumbai, Bangalore, and Hyderabad. Standard delivery takes 3–5 business days; express options are available for urgent projects. Our installation teams operate in 50+ cities.",
  },
  {
    q: "Can we see a product demo before purchasing?",
    a: "Absolutely. We offer on-site demos at your location for orders above a certain threshold, and you can visit our demo center in Noida (Sector-94) to experience the full product range. Contact our sales team to schedule a session.",
  },
  {
    q: "What warranty and after-sales support do you provide?",
    a: "All products carry the official Samsung manufacturer warranty (1–3 years depending on the model). Additionally, we offer an extended AMC (Annual Maintenance Contract) for larger deployments, with guaranteed 24-hour on-site response time.",
  },
  {
    q: "Do you offer bulk B2B pricing?",
    a: "Yes. We have a structured B2B pricing model with volume discounts starting from 5 units. Corporate accounts receive dedicated account managers, priority support, and flexible payment terms. Request a quote to get a tailored pricing sheet.",
  },
  {
    q: "Are your products genuine Samsung products?",
    a: "100% yes. We are an Authorized Samsung Business Display Distributor. Every product comes with official Samsung packaging, valid serial numbers, and a manufacturer warranty. We do not deal in grey-market or refurbished stock.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-gray-900 text-base">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-blue-600 transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
