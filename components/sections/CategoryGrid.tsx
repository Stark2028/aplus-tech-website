import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  MonitorIcon,
  LayoutGridIcon,
  InteractiveIcon,
  TvIcon,
  LedIcon,
  IconTile,
} from "@/components/icons";
import { products } from "@/data/products";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import AnimatedSection from "@/components/AnimatedSection";
import MobileProductScroller from "@/components/MobileProductScroller";

// Desktop shows all five categories in a single horizontal row
// (lg:grid-cols-5). On sm (2-col) the last card spans full width so no
// card sits orphaned.
const CATEGORY_CARDS: {
  id: CategorySlug;
  Icon: typeof MonitorIcon;
  // Split across two lines so every card title occupies the same two-line
  // height, matching how "Interactive Displays" / "Commercial & Hotel TV" wrap.
  title: [string, string];
  iconColor: string;
  accentClass: string;
  span: string;
}[] = [
  {
    id: "digital-signage",
    Icon: MonitorIcon,
    title: ["Digital", "Signage"],
    iconColor: "#2563eb",
    accentClass: "text-blue-600",
    span: "",
  },
  {
    id: "video-walls",
    Icon: LayoutGridIcon,
    title: ["Video", "Walls"],
    iconColor: "#4f46e5",
    accentClass: "text-indigo-600",
    span: "",
  },
  {
    id: "interactive",
    Icon: InteractiveIcon,
    title: ["Interactive", "Displays"],
    iconColor: "#7c3aed",
    accentClass: "text-violet-600",
    span: "",
  },
  {
    id: "commercial-tv",
    Icon: TvIcon,
    title: ["Commercial &", "Hotel TV"],
    iconColor: "#0e7490",
    accentClass: "text-cyan-700",
    span: "",
  },
  {
    id: "led-signage",
    Icon: LedIcon,
    title: ["LED", "Signage"],
    iconColor: "#0891b2",
    accentClass: "text-cyan-600",
    span: "sm:col-span-2 lg:col-span-1",
  },
];

export default function CategoryGrid() {
  return (
    <section className="pt-8 pb-3 md:pt-14 md:pb-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-6 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shop by Category
          </h2>
        </AnimatedSection>

        <MobileProductScroller gridCols="sm:grid-cols-2 lg:grid-cols-5" autoPlay={true} autoPlayInterval={3200} initialDelay={1800}>
          {CATEGORY_CARDS.map((card) => {
            const category = getCategoryById(card.id);
            const count = category
              ? products.filter((p) => p.category === category.name).length
              : 0;
            return (
              <Link
                key={card.id}
                href={`/products?category=${card.id}`}
                className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 block h-full ${card.span}`}
              >
                <div className="h-1" style={{ backgroundColor: card.iconColor }} />

                <div className="p-6 flex flex-col h-full">
                  <IconTile size="lg" className="mb-5">
                    <card.Icon
                      size={26}
                      className="text-current"
                      accentClassName={card.accentClass}
                    />
                  </IconTile>

                  {/* Every title spans two lines so all taglines start level. */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5">
                    {card.title[0]}
                    <br />
                    {card.title[1]}
                  </h3>
                  {category && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">
                      {category.tagline}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-sm font-medium text-gray-400">
                      {count} {count === 1 ? "product" : "products"}
                    </span>
                    <span
                      className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                      style={{ color: card.iconColor }}
                    >
                      Browse <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </MobileProductScroller>
      </div>
    </section>
  );
}
