import { ShieldCheck, Headphones, Truck, Award } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import RandomAccentImage from "@/components/RandomAccentImage";

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Authorized Distributor",
    desc: "Official Samsung partner. Every unit is genuine, warranty-valid, and fully supported.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated account managers and technical support available around the clock.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    desc: "Warehouses in 4 cities with express delivery to 100+ locations nationwide.",
  },
  {
    icon: Award,
    title: "Certified Installation",
    desc: "Samsung-certified install teams with 10,000+ completed projects and zero-compromise quality.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-6 md:mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            Why Aplus
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            The Aplus Advantage
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Accent image: real teams collaborating around a display we supply.
              Rotates to a random image on each page load (see RandomAccentImage). */}
          <AnimatedSection className="relative aspect-3/2 rounded-2xl overflow-hidden shadow-lg">
            <RandomAccentImage />
          </AnimatedSection>

          {/* MOBILE: Infinite slow scrolling marquee */}
          <div className="sm:hidden relative overflow-hidden w-full pb-4">
            <div className="flex gap-4 animate-marquee-slow whitespace-nowrap">
              {[...ADVANTAGES, ...ADVANTAGES].map(({ icon: Icon, title, desc }, index) => (
                <div
                  key={`${title}-${index}`}
                  className="inline-flex flex-col bg-white border border-gray-200/80 rounded-2xl p-6 w-[250px] shrink-0 shadow-sm whitespace-normal group"
                >
                  <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <Icon
                      className="text-blue-600 group-hover:text-white transition-colors"
                      size={20}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP/TABLET: Standard static 2x2 grid */}
          <div className="hidden sm:grid grid-cols-2 gap-6">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-blue-100 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <Icon
                    className="text-blue-600 group-hover:text-white transition-colors"
                    size={24}
                  />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
