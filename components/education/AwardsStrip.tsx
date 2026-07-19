import { Award } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { educationAwards, educationTrustLine, type EducationAward } from "@/data/education";

// Split the verified trust line around its number so AnimatedCounter can
// count it up without touching the data string.
function splitTrustLine() {
  const m = educationTrustLine.match(/^(.*?)([\d,]+\+?)(.*)$/);
  return m ? { pre: m[1], num: m[2], post: m[3] } : { pre: educationTrustLine, num: "", post: "" };
}

function MedallionCard({ award, dup = false }: { award: EducationAward; dup?: boolean }) {
  return (
    <div
      aria-hidden={dup || undefined}
      className={`${dup ? "edu-marquee-dup " : ""}flex items-center gap-4 w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4`}
    >
      <div className="w-11 h-11 shrink-0 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
        <Award size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{award.title}</p>
        <p className="edu-mono text-[10px] uppercase tracking-wider text-gray-400 mt-1">
          {award.issuer} · {award.year}
        </p>
      </div>
    </div>
  );
}

export default function AwardsStrip() {
  const { pre, num, post } = splitTrustLine();
  return (
    <section className="bg-white border-b border-gray-100 overflow-hidden" aria-label="Class Saathi awards and recognition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-16">
        <p className="edu-eyebrow text-center text-gray-400">Recognised across global education technology</p>
        <p className="edu-display text-center text-3xl md:text-4xl font-bold text-gray-900 mt-3">
          {pre}
          <span className="text-emerald-600">
            <AnimatedCounter value={num} />
          </span>
          {post}
        </p>
      </div>
      {/* Slow auto-scrolling medallion marquee; pauses on hover. Cards render
          twice for the seamless loop; reduced motion collapses to a static
          wrapped grid (education.css hides the duplicate set). */}
      <div className="edu-marquee py-12 md:py-14">
        <div className="edu-marquee-track px-4">
          {educationAwards.map((a) => (
            <MedallionCard key={a.title} award={a} />
          ))}
          {educationAwards.map((a) => (
            <MedallionCard key={`${a.title}-dup`} award={a} dup />
          ))}
        </div>
      </div>
    </section>
  );
}
