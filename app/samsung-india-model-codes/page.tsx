import { Metadata } from "next";
import Link from "next/link";
import { modelCodeRows } from "@/lib/modelCodeTable";
import { formatSize } from "@/lib/formatSize";
import { breadcrumbLd, jsonLdString, SITE } from "@/lib/jsonLd";

const PAGE_URL = `${SITE}/samsung-india-model-codes`;

export const metadata: Metadata = {
  title: "Samsung India Model Codes",
  description:
    "Samsung commercial display model codes for India, by series — with available " +
    "screen sizes. India order codes differ from global codes and typically end in XL.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Samsung India Model Codes | Aplus Technology Solutions",
    description:
      "Samsung India order codes by series, with available screen sizes.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Samsung India model codes" }],
  },
};

export default function SamsungIndiaModelCodesPage() {
  const rows = modelCodeRows();
  const jsonLd = [
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Samsung India Model Codes", url: "/samsung-india-model-codes" },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {/* No <main> here — app/layout.tsx already wraps every page in one. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Samsung India Model Codes
        </h1>

        <p className="text-slate-600 leading-relaxed mb-3 max-w-3xl">
          Samsung sells its commercial displays in India under order codes that differ
          from the global ones. An India code normally ends in <strong>XL</strong> — the
          43&quot; Crystal UHD QMC signage panel, for example, is
          <strong> LH43QMCEBGCLXL</strong>. Quoting the India code is what gets you the
          right SKU from a distributor.
        </p>
        <p className="text-slate-600 leading-relaxed mb-10 max-w-3xl">
          The table lists one representative code per series — the smallest size sold in
          India. Larger sizes in the same series follow the same pattern with the size
          digits changed. Codes are checked against samsung.com/in/business where a
          product page exists.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-left">
                <th className="py-3 pr-4 font-semibold text-slate-700">Category</th>
                <th className="py-3 pr-4 font-semibold text-slate-700">Product</th>
                <th className="py-3 pr-4 font-semibold text-slate-700">Series</th>
                <th className="py-3 pr-4 font-semibold text-slate-700">India order code</th>
                <th className="py-3 font-semibold text-slate-700">Sizes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-600">{r.category}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/products/${r.id}`} className="text-blue-600 hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{r.series}</td>
                  <td className="py-3 pr-4 font-mono text-slate-900">{r.code}</td>
                  <td className="py-3 text-slate-600">
                    {r.sizes.map(formatSize).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
