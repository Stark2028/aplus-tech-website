import Link from "next/link";
import { ArrowRight, Building2, Monitor, GraduationCap, Store } from "lucide-react";
import MobileProductScroller from "@/components/MobileProductScroller";

const SOLUTIONS = [
  {
    icon: Building2,
    title: "Hospitality",
    desc: "Guest-room TVs, lobby video walls, and digital concierge displays for hotels and resorts.",
    link: "/solutions/hospitality",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Monitor,
    title: "Corporate",
    desc: "Interactive whiteboards, boardroom displays, and operations center video walls.",
    link: "/solutions/corporate",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: GraduationCap,
    title: "Education",
    desc: "Smart classroom displays, campus signage, and hybrid learning solutions.",
    link: "/solutions/education",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: Store,
    title: "Retail",
    desc: "Window displays, digital menu boards, and in-store visual merchandising.",
    link: "/solutions/retail",
    color: "from-blue-500 to-violet-500",
  },
];

export default function IndustrySolutions() {
  return (
    <section className="py-10 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0d1526]">
        <div className="absolute inset-0 bg-linear-to-b from-[#0d1526] via-[#0d1526] to-blue-950/60" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Built for Your Industry
          </h2>
        </div>

        <MobileProductScroller gridCols="sm:grid-cols-2 lg:grid-cols-4" autoPlay={true} autoPlayInterval={3700} initialDelay={600}>
          {SOLUTIONS.map((s) => (
            <Link
              key={s.title}
              href={s.link}
              className="group bg-white/5 backdrop-blur-md border border-white/10 p-7 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 block h-full"
            >
              <div
                className={`w-12 h-12 bg-linear-to-br ${s.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}
              >
                <s.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">{s.desc}</p>
              <span className="inline-flex items-center gap-1 text-blue-400 group-hover:text-blue-300 text-sm font-semibold transition">
                Learn more <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </MobileProductScroller>
      </div>
    </section>
  );
}
