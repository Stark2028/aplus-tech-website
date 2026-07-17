const CLIENT_SECTORS = [
  { name: "Marriott Hotels", sector: "Hospitality" },
  { name: "ITC Hotels", sector: "Hospitality" },
  { name: "Radisson Group", sector: "Hospitality" },
  { name: "TCS Campus", sector: "Corporate" },
  { name: "DLF Office Spaces", sector: "Corporate" },
  { name: "Infosys Park", sector: "Corporate" },
  { name: "Delhi Public School", sector: "Education" },
  { name: "Ryan International", sector: "Education" },
  { name: "Reliance Retail", sector: "Retail" },
  { name: "Phoenix Mall", sector: "Retail" },
  { name: "Shoppers Stop", sector: "Retail" },
  { name: "AIIMS Delhi", sector: "Healthcare" },
  { name: "TATA Advanced Systems", sector: "Defense" },
  { name: "Asian Paints", sector: "Manufacturing" },
  { name: "Godrej & Boyce", sector: "Manufacturing" },
  { name: "Essar", sector: "Enterprise" },
  { name: "Atlas Copco", sector: "Industrial" },
  { name: "Ministry of Home Affairs", sector: "Government" },
  { name: "Ministry of Defence", sector: "Government" },
  { name: "St. Xavier's College, Calcutta", sector: "Education" },
  { name: "Tamralipta Mahavidyalaya", sector: "Education" },
  { name: "Directorate of AYUSH, Chandigarh", sector: "Government" },
  { name: "Banchharam's", sector: "Retail" },
  { name: "Actis", sector: "Enterprise" },
  { name: "Hathway", sector: "Telecom" },
  { name: "IIT Guwahati", sector: "Education" },
  { name: "Indogulf Group", sector: "Enterprise" },
  { name: "EbixCash", sector: "Fintech" },
];

export default function ClientLogoStrip() {
  return (
    <section className="py-12 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Trusted by Leading Enterprises Across India
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...CLIENT_SECTORS, ...CLIENT_SECTORS].map((c, i) => (
            <div
              key={i}
              // Second copy exists only for the seamless marquee loop —
              // hide it from assistive tech so names aren't announced twice.
              aria-hidden={i >= CLIENT_SECTORS.length || undefined}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm shrink-0"
            >
              <span className="text-gray-800 font-semibold text-sm">{c.name}</span>
              <span className="text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {c.sector}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
