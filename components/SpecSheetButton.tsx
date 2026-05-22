"use client";

import { useEffect, useState } from "react";
import { FileDown, X, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import type { Product } from "@/data/products";
import { trackEvent } from "@/lib/analytics";

interface Props {
  product: Product;
}

const STORAGE_KEY = "aplus_spec_gate_email";

export default function SpecSheetButton({ product }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Lock scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape (ignored while submitting)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, status]);

  const openModal = () => {
    // Prefill if we've already gated this visitor before
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setName(parsed.name ?? "");
        setEmail(parsed.email ?? "");
        setPhone(parsed.phone ?? "");
        setCompany(parsed.company ?? "");
      }
    } catch {}
    setStatus("idle");
    setErrorMsg("");
    setIsOpen(true);
    trackEvent("spec_sheet_gate_opened", { product_id: product.id });
  };

  const closeModal = () => {
    if (status === "submitting") return;
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          subject: `Spec Sheet Download — ${product.name}`,
          inquiry_type: "Spec Sheet Download",
          message: `Visitor downloaded the spec sheet for ${product.name} (${product.series}).`,
          items_list: `• ${product.name} (${product.series}) — Spec Sheet Requested`,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Submission failed");
      }

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name, email, phone, company })
        );
      } catch {}

      trackEvent("spec_sheet_downloaded", {
        product_id: product.id,
        product_name: product.name,
      });

      setStatus("success");
      // Trigger the PDF after the success state has rendered
      setTimeout(() => {
        triggerPdf(product);
      }, 400);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStatus("error");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center justify-center gap-2.5 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all bg-white"
      >
        <FileDown size={16} />
        Download Spec Sheet (PDF)
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spec-gate-title"
        >
          {/* Backdrop */}
          <button
            aria-label="Close"
            onClick={closeModal}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
          />

          {/* Glassmorphism card */}
          <div
            className="relative w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              boxShadow:
                "0 20px 60px -10px rgba(37,99,235,0.25), 0 8px 24px -8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Decorative gradient */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-32 w-72 h-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-32 w-72 h-72 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
              }}
            />

            {/* Close button */}
            <button
              onClick={closeModal}
              disabled={status === "submitting"}
              className="absolute top-4 right-4 z-10 w-8 h-8 inline-flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="relative p-7 sm:p-8">
              {status === "success" ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Your spec sheet is downloading
                  </h3>
                  <p className="text-sm text-gray-500">
                    A copy has been logged with our sales team — we&apos;ll
                    follow up with pricing within 24 hours.
                  </p>
                  <button
                    onClick={() => triggerPdf(product)}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Didn&apos;t download? Click here →
                  </button>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full mb-3">
                    <FileDown size={11} /> Architect Resource
                  </div>
                  <h3
                    id="spec-gate-title"
                    className="text-xl font-bold text-gray-900 mb-1.5 leading-tight"
                  >
                    Download the {product.series} Spec Sheet
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    Enter your details to instantly download the full technical
                    specification PDF for the{" "}
                    <span className="font-semibold text-gray-800">
                      {product.name}
                    </span>
                    .
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                        Work Email
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Phone
                        </label>
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {status === "error" && errorMsg && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />{" "}
                          Preparing your PDF…
                        </>
                      ) : (
                        <>
                          <FileDown size={16} /> Download Spec Sheet
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-500">
                      <ShieldCheck
                        size={13}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span>
                        We&apos;ll only use this to send you pricing for the{" "}
                        {product.series}. No spam, ever.
                      </span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
    ...(product.subCategory
      ? [{ label: "Sub-category", value: product.subCategory }]
      : []),
    ...(product.additionalSpecs
      ? Object.entries(product.additionalSpecs).map(([l, v]) => ({
          label: l,
          value: v,
        }))
      : []),
  ];

  const specRows = allSpecs
    .map(
      ({ label, value }) => `
      <tr>
        <td class="spec-label">${label}</td>
        <td class="spec-value">${value}</td>
      </tr>`
    )
    .join("");

  const featureItems = product.features
    .map(
      (f) => `
      <li>
        <span class="feat-dot"></span>
        <span>${f}</span>
      </li>`
    )
    .join("");

  const quickSpecs = [
    {
      label: "Resolution",
      value: product.specs.resolution.split("(")[0].trim(),
    },
    { label: "Brightness", value: product.specs.brightness },
    { label: "Operation", value: product.specs.operationTime },
    {
      label: "Sizes",
      value: product.specs.screenSizes.map((s) => `${s}"`).join(" · "),
    },
  ]
    .map(
      ({ label, value }) => `
      <div class="quickspec">
        <div class="quickspec-label">${label}</div>
        <div class="quickspec-value">${value}</div>
      </div>`
    )
    .join("");

  const heroImage = product.images?.[0] ?? "";

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
      background: #f4f6fb;
      color: #111;
      font-size: 10.5pt;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .page { padding: 16mm 14mm; }

    /* HEADER */
    .header {
      position: relative;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #4338ca 100%);
      color: #fff;
      padding: 22px 14mm 26px;
      overflow: hidden;
    }
    .header::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 90% -30%, rgba(255,255,255,0.18), transparent 50%),
        radial-gradient(circle at -10% 110%, rgba(99,102,241,0.5), transparent 55%);
      pointer-events: none;
    }
    .header-inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand-mark {
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: .14em;
      color: #c7d2fe;
      text-transform: uppercase;
    }
    .brand-name {
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: -.01em;
      margin-top: 2px;
    }
    .brand-sub {
      font-size: 8.5pt;
      color: #bfdbfe;
      margin-top: 4px;
    }
    .stamp {
      text-align: right;
      font-size: 8pt;
      color: #c7d2fe;
    }
    .stamp .ref {
      display: inline-block;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      padding: 3px 10px;
      font-weight: 600;
      letter-spacing: .04em;
    }
    .stamp .date { margin-top: 6px; }

    /* HERO */
    .hero {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
      align-items: center;
      padding: 22px 14mm 8px;
    }
    .hero-text .series-tag {
      display: inline-block;
      background: #eff6ff;
      color: #2563eb;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 8px;
    }
    .hero-text h1 {
      font-size: 19pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      letter-spacing: -.015em;
      margin-bottom: 8px;
    }
    .hero-text p {
      font-size: 9.5pt;
      color: #475569;
      line-height: 1.65;
    }
    .hero-image {
      background: linear-gradient(135deg, #f8fafc, #eef2ff);
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      aspect-ratio: 4 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .hero-image img {
      max-width: 92%;
      max-height: 92%;
      object-fit: contain;
    }
    .hero-image .ph {
      font-size: 9pt;
      color: #9ca3af;
      font-weight: 600;
    }

    /* QUICK SPECS */
    .quickspecs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 14px 14mm 4px;
    }
    .quickspec {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px 12px;
      background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
    }
    .quickspec-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #94a3b8;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .quickspec-value {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -.01em;
    }

    /* SECTION */
    .section {
      padding: 16px 14mm 0;
    }
    .section-title {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #1e3a8a;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 3px;
      height: 14px;
      background: linear-gradient(180deg, #2563eb, #4338ca);
      border-radius: 2px;
    }
    .section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, #e5e7eb, transparent);
    }

    /* FEATURES */
    .features {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 18px;
    }
    .features li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 9pt;
      color: #1e293b;
      line-height: 1.55;
    }
    .feat-dot {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      margin-top: 2px;
      background: #eff6ff;
      border-radius: 50%;
      position: relative;
    }
    .feat-dot::after {
      content: "";
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 5px; height: 5px;
      background: #2563eb;
      border-radius: 50%;
    }

    /* SPEC TABLE */
    .spec-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .spec-table tr:nth-child(even) { background: #f8fafc; }
    .spec-table td {
      padding: 8px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 9pt;
    }
    .spec-table tr:last-child td { border-bottom: none; }
    .spec-label {
      width: 38%;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: .04em;
    }
    .spec-value { color: #0f172a; font-weight: 600; }

    /* CTA */
    .cta {
      margin: 18px 14mm 0;
      padding: 16px 18px;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #fff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }
    .cta-title {
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: -.01em;
    }
    .cta-sub {
      font-size: 8.5pt;
      color: #bfdbfe;
      margin-top: 2px;
    }
    .cta-contact {
      text-align: right;
      font-size: 9pt;
      line-height: 1.55;
    }
    .cta-contact strong { font-weight: 800; }

    /* FOOTER */
    .footer {
      margin-top: 18px;
      padding: 14px 14mm 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94a3b8;
    }
    .footer .ftr-brand { font-weight: 700; color: #475569; }

    /* PRINT */
    @media print {
      body { background: #fff; }
      .sheet { box-shadow: none; max-width: 100%; }
      .page { padding: 0; }
      .header, .hero, .quickspecs, .section, .cta, .footer { break-inside: avoid; }
      @page { size: A4; margin: 8mm; }
    }
  </style>
</head>
<body>
<div class="sheet">

  <!-- HEADER -->
  <div class="header">
    <div class="header-inner">
      <div>
        <div class="brand-mark">Aplus Technology Solutions</div>
        <div class="brand-name">Product Specification Sheet</div>
        <div class="brand-sub">Authorized Samsung Commercial Display Distributor · Noida, India</div>
      </div>
      <div class="stamp">
        <div class="ref">${product.series}</div>
        <div class="date">${new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}</div>
      </div>
    </div>
  </div>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-text">
      <div class="series-tag">${product.category}</div>
      <h1>${product.name}</h1>
      <p>${product.description}</p>
    </div>
    <div class="hero-image">
      ${
        heroImage
          ? `<img src="${heroImage}" alt="${product.name}" onerror="this.parentNode.innerHTML='<div class=&quot;ph&quot;>Product Image</div>' " />`
          : `<div class="ph">Product Image</div>`
      }
    </div>
  </div>

  <!-- QUICK SPECS -->
  <div class="quickspecs">${quickSpecs}</div>

  ${
    product.features.length > 0
      ? `
  <div class="section">
    <div class="section-title">Key Highlights</div>
    <ul class="features">${featureItems}</ul>
  </div>`
      : ""
  }

  <!-- FULL SPECS -->
  <div class="section">
    <div class="section-title">Technical Specifications</div>
    <table class="spec-table"><tbody>${specRows}</tbody></table>
  </div>

  <!-- CTA -->
  <div class="cta">
    <div>
      <div class="cta-title">Ready to deploy the ${product.series}?</div>
      <div class="cta-sub">Bulk B2B pricing, GST invoice & pan-India installation.</div>
    </div>
    <div class="cta-contact">
      <strong>+91 93105 09909</strong><br />
      sales@aplustechsol.com<br />
      aplustechsol.com
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <span class="ftr-brand">© ${new Date().getFullYear()} Aplus Technology Solutions Pvt. Ltd.</span>
      &nbsp;·&nbsp; All specifications subject to change without notice.
    </div>
    <div>aplustechsol.com</div>
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
