"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import type { Product } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import LeadGateModal from "@/components/LeadGateModal";
import { hasGated } from "@/lib/leadGate";

interface Props {
  product: Product;
}

export default function SpecSheetButton({ product }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    // Smart gate: skip the modal if the visitor has already submitted any Aplus form
    if (hasGated()) {
      trackEvent("spec_sheet_downloaded_cached", { product_id: product.id });
      triggerPdf(product);
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center justify-center gap-2.5 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all bg-white"
      >
        <FileDown size={16} />
        Download Spec Sheet (PDF)
      </button>

      <LeadGateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUnlock={() => {
          setIsOpen(false);
          trackEvent("spec_sheet_downloaded", {
            product_id: product.id,
            product_name: product.name,
          });
          triggerPdf(product);
        }}
        title={`Download the ${product.series} Spec Sheet`}
        subtitle={`Enter your details to instantly download the full technical specification PDF for the ${product.name}.`}
        subject={`Spec Sheet Download — ${product.name}`}
        itemDescription={`• ${product.name} (${product.series}) — Spec Sheet Requested`}
        ctaLabel="Download Spec Sheet"
        privacyNote={`We'll only use this to send you pricing for the ${product.series}. No spam, ever.`}
        analyticsKey="spec_sheet_gate"
      />
    </>
  );
}

/** Open the enhanced spec-sheet PDF in a new window and trigger the print dialog. */
function triggerPdf(product: Product) {
  const html = buildSpecSheetHtml(product);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function buildSpecSheetHtml(product: Product): string {
  const additionalSpecRows = product.additionalSpecs
    ? Object.entries(product.additionalSpecs)
        .map(
          ([label, value]) => `
      <tr>
        <td class="spec-label">${label}</td>
        <td class="spec-value">${value}</td>
      </tr>`
        )
        .join("")
    : "";

  const featureItems = product.features
    .map((f) => `<li>${f}</li>`)
    .join("");

  const heroImage = product.images?.[0] ?? "";

  const docDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${product.name} — Spec Sheet | Aplus Technology Solutions</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #fff;
      color: #111;
      font-size: 10pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      max-width: 210mm;
      margin: 0 auto;
      padding: 18mm 16mm;
      background: #fff;
    }

    /* HEADER */
    .head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 1px solid #111;
    }
    .head .brand {
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: .18em;
      color: #111;
      text-transform: uppercase;
    }
    .head .brand-sub {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 3px;
      letter-spacing: .02em;
    }
    .head .meta {
      text-align: right;
      font-size: 8pt;
      color: #6b7280;
      line-height: 1.6;
    }
    .head .meta strong { color: #111; font-weight: 600; }

    /* TITLE BLOCK */
    .title-block { padding: 22px 0 18px; }
    .title-block .eyebrow {
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: .18em;
      color: #2563eb;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .title-block h1 {
      font-size: 22pt;
      font-weight: 700;
      color: #111;
      line-height: 1.15;
      letter-spacing: -.02em;
      margin-bottom: 6px;
    }
    .title-block .subtitle {
      font-size: 10pt;
      color: #6b7280;
      font-weight: 400;
    }

    /* HERO IMAGE */
    .hero {
      padding: 4px 0 22px;
    }
    .hero-frame {
      border: 1px solid #e5e7eb;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      overflow: hidden;
    }
    .hero-frame img {
      max-width: 78%;
      max-height: 86%;
      object-fit: contain;
    }
    .hero-frame .ph {
      font-size: 9pt;
      color: #9ca3af;
    }

    /* DESCRIPTION */
    .desc {
      font-size: 10pt;
      color: #374151;
      line-height: 1.7;
      max-width: 600px;
      margin-bottom: 22px;
    }

    /* HEADLINE STATS */
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 14px 0;
      margin-bottom: 26px;
    }
    .stat {
      padding: 0 14px;
      border-right: 1px solid #e5e7eb;
    }
    .stat:last-child { border-right: none; }
    .stat-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #9ca3af;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 11pt;
      font-weight: 600;
      color: #111;
      letter-spacing: -.01em;
    }

    /* SECTION */
    .section { margin-bottom: 24px; }
    .section h2 {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .16em;
      color: #111;
      padding-bottom: 8px;
      border-bottom: 1px solid #111;
      margin-bottom: 12px;
    }

    /* FEATURES */
    .features {
      list-style: none;
      columns: 2;
      column-gap: 28px;
    }
    .features li {
      font-size: 9.5pt;
      color: #1f2937;
      padding: 5px 0 5px 14px;
      position: relative;
      break-inside: avoid;
      line-height: 1.55;
    }
    .features li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 12px;
      width: 6px;
      height: 1px;
      background: #2563eb;
    }

    /* SPEC TABLE */
    .spec-table {
      width: 100%;
      border-collapse: collapse;
    }
    .spec-table td {
      padding: 9px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 9.5pt;
      vertical-align: top;
    }
    .spec-table tr:last-child td { border-bottom: none; }
    .spec-label {
      width: 42%;
      color: #6b7280;
      font-weight: 400;
      padding-right: 16px;
    }
    .spec-value {
      color: #111;
      font-weight: 500;
    }

    /* CONTACT STRIP */
    .contact {
      margin-top: 14px;
      padding: 18px 0 14px;
      border-top: 1px solid #111;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }
    .contact-left .label {
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .contact-left .lead {
      font-size: 10.5pt;
      font-weight: 600;
      color: #111;
      letter-spacing: -.01em;
    }
    .contact-right {
      text-align: right;
      font-size: 9pt;
      color: #374151;
      line-height: 1.7;
    }
    .contact-right .phone {
      font-size: 10.5pt;
      font-weight: 600;
      color: #111;
      letter-spacing: -.01em;
    }

    /* FOOTER */
    .footer {
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      font-size: 7.5pt;
      color: #9ca3af;
      line-height: 1.6;
    }
    .footer .legal { letter-spacing: .04em; }
    .footer .legal .label {
      color: #6b7280;
      font-weight: 600;
      margin-right: 4px;
    }
    .footer .copy { text-align: right; }

    /* PRINT */
    @media print {
      body { background: #fff; }
      .sheet { padding: 0; max-width: 100%; }
      .head, .title-block, .hero, .stats, .section, .contact, .footer { break-inside: avoid; }
      @page { size: A4; margin: 14mm 14mm 12mm; }
    }
  </style>
</head>
<body>
<div class="sheet">

  <!-- HEADER -->
  <div class="head">
    <div>
      <div class="brand">Aplus Technology Solutions</div>
      <div class="brand-sub">Authorized Samsung Commercial Display Distributor · Noida, India</div>
    </div>
    <div class="meta">
      <div><strong>Spec Sheet</strong></div>
      <div>${product.series}</div>
      <div>${docDate}</div>
    </div>
  </div>

  <!-- TITLE -->
  <div class="title-block">
    <div class="eyebrow">${product.category}${
      product.subCategory ? ` · ${product.subCategory}` : ""
    }</div>
    <h1>${product.name}</h1>
    <div class="subtitle">${product.series} Series</div>
  </div>

  <!-- HERO IMAGE -->
  <div class="hero">
    <div class="hero-frame">
      ${
        heroImage
          ? `<img src="${heroImage}" alt="${product.name}" onerror="this.parentNode.innerHTML='<div class=&quot;ph&quot;>Product Image</div>'" />`
          : `<div class="ph">Product Image</div>`
      }
    </div>
  </div>

  <!-- DESCRIPTION -->
  <p class="desc">${product.description}</p>

  <!-- HEADLINE STATS -->
  <div class="stats">
    <div class="stat">
      <div class="stat-label">Resolution</div>
      <div class="stat-value">${product.specs.resolution
        .split("(")[0]
        .trim()}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Brightness</div>
      <div class="stat-value">${product.specs.brightness}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Operation</div>
      <div class="stat-value">${product.specs.operationTime}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Sizes</div>
      <div class="stat-value">${product.specs.screenSizes
        .map((s) => `${s}"`)
        .join(" · ")}</div>
    </div>
  </div>

  ${
    product.features.length > 0
      ? `
  <div class="section">
    <h2>Key Features</h2>
    <ul class="features">${featureItems}</ul>
  </div>`
      : ""
  }

  <div class="section">
    <h2>Technical Specifications</h2>
    <table class="spec-table"><tbody>
      <tr>
        <td class="spec-label">Resolution</td>
        <td class="spec-value">${product.specs.resolution}</td>
      </tr>
      <tr>
        <td class="spec-label">Brightness</td>
        <td class="spec-value">${product.specs.brightness}</td>
      </tr>
      <tr>
        <td class="spec-label">Available Sizes</td>
        <td class="spec-value">${product.specs.screenSizes
          .map((s) => `${s}"`)
          .join(" · ")}</td>
      </tr>
      <tr>
        <td class="spec-label">Operation Hours</td>
        <td class="spec-value">${product.specs.operationTime}</td>
      </tr>
      <tr>
        <td class="spec-label">Series</td>
        <td class="spec-value">${product.series}</td>
      </tr>
      <tr>
        <td class="spec-label">Category</td>
        <td class="spec-value">${product.category}${
    product.subCategory ? ` — ${product.subCategory}` : ""
  }</td>
      </tr>
      ${additionalSpecRows}
    </tbody></table>
  </div>

  <!-- CONTACT -->
  <div class="contact">
    <div class="contact-left">
      <div class="label">Contact Sales</div>
      <div class="lead">Bulk pricing · GST invoice · Pan-India installation</div>
    </div>
    <div class="contact-right">
      <div class="phone">+91 93105 09909</div>
      <div>sales@aplustechsol.com</div>
      <div>aplustechsol.com</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="legal">
      <div><span class="label">CIN</span>U72900DL2020PTC374888</div>
      <div><span class="label">GSTIN</span>07AAUCA5631L1Z6</div>
    </div>
    <div class="copy">
      <div>© ${new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd.</div>
      <div>All specifications subject to change without notice.</div>
    </div>
  </div>

</div>
<script>
  window.onload = function(){
    setTimeout(function(){ window.print(); }, 300);
  };
</script>
</body>
</html>`;
}
