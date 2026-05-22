import { FAQS } from "@/data/faqs";
import { SITE, organizationLd, faqPageLd } from "@/lib/jsonLd";

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE,
  name: "Aplus Technology Solutions",
  description:
    "Authorized Samsung Business Display distributor serving enterprises across India.",
  publisher: { "@id": `${SITE}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/products?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const faqLd = faqPageLd(FAQS.map((f) => ({ question: f.q, answer: f.a })));

const jsonLd = [organizationLd(), websiteLd, faqLd];

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
