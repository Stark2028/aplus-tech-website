"use client";

import { FileDown } from "lucide-react";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
}

export default function SpecSheetButton({ product }: Props) {
  const handleDownload = () => {
    const allSpecs = [
      { label: "Resolution", value: product.specs.resolution },
      { label: "Brightness", value: product.specs.brightness },
      {
        label: "Available Sizes",
        value: product.specs.screenSizes.map((s) => `${s}"`).join(" · "),
      },
      { label: "Operation Hours", value: product.specs.operationTime },
      { label: "Series", value: product.series },
      { label: "Category", value: product.category },
      ...(product.subCategory ? [{ label: "Sub-category", value: product.subCategory }] : []),
      ...(product.additionalSpecs
        ? Object.entries(product.additionalSpecs).map(([l, v]) => ({ label: l, value: v }))
        : []),
    ];

    const specRows = allSpecs
      .map(
        ({ label, value }) => `
        <tr>
          <td style="width:160px;padding:6px 10px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#6b7280;font-size:9pt;">${label}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6;color:#111;font-weight:500;font-size:9pt;">${value}</td>
        </tr>`
      )
      .join("");

    const featureItems = product.features
      .map(
        (f) => `
        <div style="display:flex;align-items:flex-start;gap:6px;font-size:9pt;color:#374151;margin-bottom:4px;">
          <div style="width:14px;height:14px;background:#eff6ff;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;">
            <div style="width:5px;height:5px;background:#2563eb;border-radius:50%;"></div>
          </div>
          <span>${f}</span>
        </div>`
      )
      .join("");

    const quickSpecs = [
      { label: "Resolution", value: product.specs.resolution.split("(")[0].trim() },
      { label: "Brightness", value: product.specs.brightness },
      { label: "Operation", value: product.specs.operationTime },
      { label: "Sizes", value: product.specs.screenSizes.map((s) => `${s}"`).join(" ") },
    ]
      .map(
        ({ label, value }) => `
        <div style="border:1px solid #e5e7eb;border-radius:6px;padding:8px 10px;background:#f9fafb;">
          <div style="font-size:7pt;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;font-weight:700;margin-bottom:3px;">${label}</div>
          <div style="font-size:10pt;font-weight:700;color:#111;">${value}</div>
        </div>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${product.name} — Spec Sheet | Aplus Technology Solutions</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #111; font-size: 11pt; }
    .page { max-width: 210mm; margin: 0 auto; padding: 16mm 14mm; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    tr:nth-child(even) { background: #f9fafb; }
    @media print {
      body { background: white; }
      .page { padding: 8mm 10mm; max-width: 100%; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:12px;border-bottom:2px solid #2563eb;margin-bottom:18px;">
    <div>
      <div style="font-size:10pt;color:#2563eb;font-weight:700;letter-spacing:.05em;">APLUS TECHNOLOGY SOLUTIONS</div>
      <div style="font-size:8pt;color:#6b7280;margin-top:2px;">Authorized Samsung Commercial Display Distributor · Noida, India</div>
    </div>
    <div style="font-size:8pt;color:#6b7280;text-align:right;">
      <div>Product Specification Sheet</div>
      <div style="margin-top:2px;">aplustechsol.com</div>
    </div>
  </div>

  <!-- Product header -->
  <div style="margin-bottom:18px;">
    <div style="display:inline-block;background:#eff6ff;color:#2563eb;font-size:8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:20px;margin-bottom:6px;">${product.series}</div>
    <h1 style="font-size:16pt;font-weight:800;color:#111;line-height:1.25;margin-bottom:6px;">${product.name}</h1>
    <p style="font-size:9.5pt;color:#4b5563;line-height:1.6;max-width:520px;">${product.description}</p>
  </div>

  <!-- Quick specs -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;">
    ${quickSpecs}
  </div>

  <!-- Key Highlights -->
  ${
    product.features.length > 0
      ? `<div style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#374151;margin-bottom:8px;padding-left:8px;border-left:3px solid #2563eb;">Key Highlights</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:20px;">${featureItems}</div>`
      : ""
  }

  <!-- Full Specifications -->
  <div style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#374151;margin-bottom:8px;padding-left:8px;border-left:3px solid #2563eb;">Technical Specifications</div>
  <table><tbody>${specRows}</tbody></table>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:10px;margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:8pt;color:#6b7280;">
      <div>© ${new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd.</div>
      <div>All specifications subject to change without notice.</div>
    </div>
    <div style="font-size:8pt;color:#6b7280;text-align:right;">
      <div style="font-size:8.5pt;font-weight:600;color:#2563eb;">+91 93105 09909</div>
      <div>sales@aplustechsol.com</div>
    </div>
  </div>

</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2.5 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all bg-white"
    >
      <FileDown size={16} />
      Download Spec Sheet (PDF)
    </button>
  );
}
