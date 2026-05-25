import Link from "next/link";
import {
  ArrowRight,
  Monitor,
  LayoutGrid,
  MousePointerClick,
  Tv,
} from "lucide-react";
import { products } from "@/data/products";
import AnimatedSection from "@/components/AnimatedSection";

const CATEGORY_CARDS = [
  {
    id: "digital-signage",
    Icon: Monitor,
    title: "Digital Signage",
    tagline: "Lobbies, retail & campuses",
    href: "/products?category=digital-signage",
    iconColor: "#2563eb",
    iconColorLight: "rgba(37, 99, 235, 0.1)",
    count: products.filter((p) => p.category === "Digital Signage").length,
  },
  {
    id: "video-walls",
    Icon: LayoutGrid,
    title: "Video Walls",
    tagline: "Seamless large-format impact",
    href: "/products?category=video-walls",
    iconColor: "#4f46e5",
    iconColorLight: "rgba(79, 70, 229, 0.1)",
    count: products.filter((p) => p.category === "Video Wall").length,
  },
  {
    id: "interactive",
    Icon: MousePointerClick,
    title: "Interactive Displays",
    tagline: "Collaboration & smart classrooms",
    href: "/products?category=interactive",
    iconColor: "#7c3aed",
    iconColorLight: "rgba(124, 58, 237, 0.1)",
    count: products.filter((p) => p.category === "Interactive Display").length,
  },
  {
    id: "commercial-tv",
    Icon: Tv,
    title: "Commercial & Hotel TV",
    tagline: "Hotel rooms, offices & lobbies",
    href: "/products?category=commercial-tv",
    iconColor: "#0891b2",
    iconColorLight: "rgba(8, 145, 178, 0.1)",
    count: products.filter((p) => p.category === "Commercial TV").length,
  },
];

export default function CategoryGrid() {
  return (
    <section className="pt-14 pb-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shop by Category
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="h-1" style={{ backgroundColor: cat.iconColor }} />

              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: cat.iconColorLight }}
                  >
                    <cat.Icon size={26} style={{ color: cat.iconColor }} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">{cat.title}</h3>

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                  <span
                    className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                    style={{ color: cat.iconColor }}
                  >
                    Browse <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
