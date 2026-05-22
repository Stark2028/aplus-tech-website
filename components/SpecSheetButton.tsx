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
