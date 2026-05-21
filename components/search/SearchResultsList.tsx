import Link from "next/link";
import { ArrowRight, FileText, Package } from "lucide-react";
import type { SearchResult } from "@/lib/searchResults";

interface Props {
  results: SearchResult[];
  activeIndex: number;
  query: string;
  onSelect: (result: SearchResult) => void;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {children}
      </span>
    </div>
  );
}

function ResultRow({
  result,
  active,
  onSelect,
}: {
  result: SearchResult;
  active: boolean;
  onSelect: (r: SearchResult) => void;
}) {
  const isProduct = result.type === "product";
  const Icon = isProduct ? Package : FileText;
  const iconWrap = isProduct ? "bg-blue-100" : "bg-violet-100";
  const iconColor = isProduct ? "text-blue-600" : "text-violet-600";

  return (
    <Link
      href={result.href}
      onClick={() => onSelect(result)}
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        active ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg ${iconWrap} flex items-center justify-center shrink-0`}>
        <Icon size={14} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
      </div>
      <ArrowRight size={13} className="text-gray-300 shrink-0" />
    </Link>
  );
}

export default function SearchResultsList({
  results,
  activeIndex,
  query,
  onSelect,
}: Props) {
  const productResults = results.filter((r) => r.type === "product");
  const blogResults = results.filter((r) => r.type === "blog");

  if (query && results.length === 0) {
    return (
      <div className="py-14 text-center text-gray-400">
        <p className="text-sm font-medium text-gray-500">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-xs mt-1 text-gray-400">Try &quot;video wall&quot;, &quot;hotel TV&quot;, or &quot;4K&quot;</p>
      </div>
    );
  }

  return (
    <>
      {productResults.length > 0 && (
        <div>
          <SectionHeader>Products</SectionHeader>
          {productResults.map((result) => (
            <ResultRow
              key={result.id}
              result={result}
              active={activeIndex === results.indexOf(result)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {blogResults.length > 0 && (
        <div>
          <SectionHeader>Guides &amp; Articles</SectionHeader>
          {blogResults.map((result) => (
            <ResultRow
              key={result.id}
              result={result}
              active={activeIndex === results.indexOf(result)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}
