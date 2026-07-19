import dynamic from "next/dynamic";
import { breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { educationFaqs } from "@/data/education";
import EducationHero from "./EducationHero";
import AwardsStrip from "./AwardsStrip";
import ParticipationComparison from "./ParticipationComparison";
import HowItWorks from "./HowItWorks";
import EcosystemTabs from "./EcosystemTabs";
import EducationFaq from "./EducationFaq";
import ClosingCta from "./ClosingCta";

// Code-split the interactive islands so the landing stays light.
const ClickerSimulator = dynamic(() => import("./ClickerSimulator"));
const BlueprintLeadForm = dynamic(() => import("./BlueprintLeadForm"));

export default function EducationLanding() {
  const jsonLd = [
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Education", url: "/categories/education" },
    ]),
    faqPageLd(educationFaqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <EducationHero />
      <AwardsStrip />
      <ParticipationComparison />
      <HowItWorks />
      <EcosystemTabs />

      {/* The page's single dark band — the live clicker demo. */}
      <section id="simulator" className="scroll-mt-24 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Live simulator</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Try the clicker yourself</h2>
            <p className="mt-3 text-slate-400 text-sm md:text-base">
              Press a key, submit your answer, and watch the class results come in — exactly the loop students
              experience.
            </p>
          </div>
          <ClickerSimulator />
        </div>
      </section>

      {/* Lead capture */}
      <section id="lead-form" className="scroll-mt-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <BlueprintLeadForm />
        </div>
      </section>

      <EducationFaq />
      <ClosingCta />
    </main>
  );
}
