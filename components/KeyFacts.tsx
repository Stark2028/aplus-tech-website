import type { Product } from "@/data/products";
import { modelCodeFor } from "@/lib/modelCodes";
import { formatSize } from "@/lib/formatSize";

export interface KeyFact {
  label: string;
  value: string;
}

/**
 * The extractable summary of a product, as label/value pairs.
 *
 * Pure and exported separately from the component so it can be unit-tested and
 * reused. Every value traces to existing product data — nothing is invented.
 */
export function keyFactRows(product: Product): KeyFact[] {
  const code = modelCodeFor(product.id);
  const rows: KeyFact[] = [];
  if (code) rows.push({ label: "India model code", value: code });
  rows.push({ label: "Category", value: product.category });
  rows.push({ label: "Series", value: product.series });
  rows.push({ label: "Resolution", value: product.specs.resolution });
  rows.push({ label: "Brightness", value: product.specs.brightness });
  rows.push({
    label: "Screen sizes",
    value: product.specs.screenSizes.map(formatSize).join(", "),
  });
  rows.push({ label: "Rated operation", value: product.specs.operationTime });
  return rows.filter((r) => r.value && r.value.trim().length > 0);
}

/**
 * Answer-first facts block. A server component on purpose — no "use client", so
 * the content lands in the static HTML that AI crawlers actually read.
 */
export default function KeyFacts({ product }: { product: Product }) {
  const rows = keyFactRows(product);
  return (
    // Card treatment matches the sibling blocks on the product page rather than
    // the plan's bare `mb-8`, so it does not read as an unstyled orphan.
    <section
      aria-labelledby="key-facts-heading"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7"
    >
      <h2 id="key-facts-heading" className="sr-only">
        Key facts
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-slate-500">{r.label}</dt>
            <dd className="text-slate-900 font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
