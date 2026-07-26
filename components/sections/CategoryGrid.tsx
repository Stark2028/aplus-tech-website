import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  MonitorIcon,
  LayoutGridIcon,
  InteractiveIcon,
  TvIcon,
  LedIcon,
  UsersIcon,
  CloudIcon,
  GraduationCapIcon,
  IconTile,
} from "@/components/icons";
import { getCategoryById, type CategorySlug } from "@/data/categories";
import AnimatedSection from "@/components/AnimatedSection";
import MobileProductScroller from "@/components/MobileProductScroller";

interface CategoryCard {
  id: CategorySlug;
  Icon: typeof MonitorIcon;
  // Split across two lines so every card title occupies the same two-line
  // height, matching how "Interactive Displays" / "Commercial & Hotel TV" wrap.
  title: [string, string];
  iconColor: string;
  accentClass: string;
  // Full-bleed gradient wash behind the tile content, in the category accent.
  gradient: string;
  // The single non-Samsung category (Logitech VC) reads as a muted outlier:
  // neutral gray wash + slate accent, no Samsung-adjacent styling.
  muted?: boolean;
  /**
   * Overrides the default /products?category={id} link. Required for Education:
   * it has zero catalog products, so the filtered-catalog URL is a no-op.
   */
  href?: string;
}

// Eight equal tiles in a 2×4 grid (lg): the seven Samsung/Logitech categories
// plus Education (Class Saathi). Order = reading order.
const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: "digital-signage",
    Icon: MonitorIcon,
    title: ["Digital", "Signage"],
    iconColor: "#2563eb",
    accentClass: "text-blue-600",
    gradient: "from-blue-50 via-blue-50/40 to-transparent",
  },
  {
    id: "video-walls",
    Icon: LayoutGridIcon,
    title: ["Video", "Walls"],
    iconColor: "#4f46e5",
    accentClass: "text-indigo-600",
    gradient: "from-indigo-50 via-indigo-50/40 to-transparent",
  },
  {
    id: "interactive",
    Icon: InteractiveIcon,
    title: ["Interactive", "Displays"],
    iconColor: "#7c3aed",
    accentClass: "text-violet-600",
    gradient: "from-violet-50 via-violet-50/40 to-transparent",
  },
  {
    id: "commercial-tv",
    Icon: TvIcon,
    title: ["Commercial &", "Hotel TV"],
    iconColor: "#0e7490",
    accentClass: "text-cyan-700",
    gradient: "from-cyan-50 via-cyan-50/40 to-transparent",
  },
  {
    id: "led-signage",
    Icon: LedIcon,
    title: ["LED", "Signage"],
    iconColor: "#0891b2",
    accentClass: "text-cyan-600",
    gradient: "from-sky-50 via-sky-50/40 to-transparent",
  },
  {
    id: "software",
    Icon: CloudIcon,
    title: ["Software", "Solutions"],
    iconColor: "#0284c7",
    accentClass: "text-sky-600",
    gradient: "from-sky-50 via-sky-50/40 to-transparent",
  },
  {
    id: "video-conferencing",
    Icon: UsersIcon,
    title: ["Video", "Conferencing"],
    // Muted outlier: neutral slate accent + gray wash, no teal brand color.
    iconColor: "#64748b",
    accentClass: "text-slate-500",
    gradient: "from-slate-100 via-slate-50/50 to-transparent",
    muted: true,
  },
  {
    id: "education",
    href: "/categories/education",
    Icon: GraduationCapIcon, // already exists in components/icons — do not add a new one
    title: ["Class Saathi", "Education"],
    iconColor: "#059669",
    accentClass: "text-emerald-600",
    gradient: "from-emerald-50 via-emerald-50/40 to-transparent",
  },
];

/**
 * One category tile. Full-bleed gradient wash (decorative, behind content) in
 * the accent color, icon chip, two-line title, tagline, and Browse CTA. All
 * tiles are the same size — the 2×4 grid stays uniform.
 */
function CategoryTile({ card }: { card: CategoryCard }) {
  const category = getCategoryById(card.id);
  return (
    <Link
      href={card.href ?? `/products?category=${card.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 block h-full"
    >
      <div className="h-1" style={{ backgroundColor: card.iconColor }} />

      {/* Decorative gradient wash — sits behind the content, so text contrast
          is validated against the white card, not the wash. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient}`}
      />

      <div className="relative p-6 flex flex-col h-full">
        <IconTile size="lg" className="mb-5">
          <card.Icon
            size={26}
            className="text-current"
            accentClassName={card.accentClass}
          />
        </IconTile>

        {/* Every title spans two lines so all taglines start level. The <br/>
            would otherwise join the two words into one accessible name
            ("DigitalSignage"), so aria-label restores the spaced form. */}
        <h3
          aria-label={`${card.title[0]} ${card.title[1]}`}
          className="text-xl font-bold text-gray-900 mb-1.5"
        >
          {card.title[0]}
          <br />
          {card.title[1]}
        </h3>
        {category && (
          <p
            className={`text-sm leading-relaxed mb-5 ${card.muted ? "text-gray-400" : "text-gray-500"}`}
          >
            {category.tagline}
          </p>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-auto">
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
}

export default function CategoryGrid() {
  return (
    <section className="pt-8 pb-3 md:pt-14 md:pb-4 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-6 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shop by Category
          </h2>
        </AnimatedSection>

        {/* ── MOBILE (< md): swipe carousel ─────────────────────────────
            MobileProductScroller with breakpoint="md" hides its own rail at
            md+, and renderGrid={false} suppresses its built-in desktop grid
            entirely — the uniform grid below is the single desktop layout, so
            the tiles are no longer rendered a third time into a dead subtree. */}
        <MobileProductScroller
          breakpoint="md"
          renderGrid={false}
          label="Category carousel"
          gridCols=""
          autoPlay={true}
          autoPlayInterval={3200}
          initialDelay={1800}
        >
          {CATEGORY_CARDS.map((card) => (
            <CategoryTile key={card.id} card={card} />
          ))}
        </MobileProductScroller>

        {/* ── DESKTOP / TABLET (md+): uniform grid ──────────────────────
            md: 2 columns (4 rows).  lg: 4 columns (2 rows).  Eight equal
            category tiles. */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {CATEGORY_CARDS.map((card) => (
            <CategoryTile key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
