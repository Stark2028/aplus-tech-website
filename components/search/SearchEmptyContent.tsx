import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

const QUICK_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Video Walls", href: "/categories/video-wall" },
  { label: "Smart Signage", href: "/categories/digital-signage" },
  { label: "Hospitality TVs", href: "/categories/hospitality-tv" },
  { label: "Request a Quote", href: "/quote" },
];

interface Props {
  recent: string[];
  onClearRecent: () => void;
  onPickRecent: (term: string) => void;
  onLinkClick: () => void;
}

export default function SearchEmptyContent({
  recent,
  onClearRecent,
  onPickRecent,
  onLinkClick,
}: Props) {
  return (
    <div className="py-2">
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Recent
            </span>
            <button
              onClick={onClearRecent}
              className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
          {recent.map((term) => (
            <button
              key={term}
              onClick={() => onPickRecent(term)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <Clock size={13} className="text-gray-300 shrink-0" />
              <span className="text-sm text-gray-600">{term}</span>
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2" />
        </div>
      )}

      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Quick links
        </span>
      </div>
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <ArrowRight size={13} className="text-gray-300 shrink-0" />
          <span className="text-sm text-gray-600">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
