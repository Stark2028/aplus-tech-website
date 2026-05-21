const SITE = "https://www.aplustechsol.com";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE}/#organization`,
    name: "Aplus Technology Solutions Pvt. Ltd.",
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/assets/img/logo.webp`,
    },
    telephone: "+91-9310509909",
    email: "info@aplustechsol.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office No. 855, 8th Floor, Supernova Astralis, Sector-94",
      addressLocality: "Noida",
      addressRegion: "Uttar Pradesh",
      postalCode: "201301",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9310509909",
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: "en",
    },
    openingHours: "Mo-Sa 09:00-18:00",
    sameAs: [
      "https://in.linkedin.com/company/aplus-technology-solutions-pvt-ltd",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE,
    name: "Aplus Technology Solutions",
    description:
      "Authorized Samsung Business Display distributor serving enterprises across India.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
