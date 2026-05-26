import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createZohoLead } from "@/lib/zoho";

const TO_EMAIL = "iit2023134@iiita.ac.in";

/** Escape user-supplied text before interpolating into the HTML email body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;width:140px">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600">${esc(value)}</td>
    </tr>`;
}

function buildQuoteEmail(b: Record<string, string>) {
  const items = (b.items_list ?? "")
    .split("\n")
    .map((l) => `<div style="font-size:13px;color:#374151;line-height:1.7">${esc(l)}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
            <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Aplus Technology Solutions</div>
            <div style="font-size:22px;font-weight:700;color:#fff">New Quote Request</div>
            <div style="font-size:13px;color:#bfdbfe;margin-top:4px">${esc(b.subject ?? "")}</div>
          </td>
        </tr>

        <!-- Contact details -->
        <tr><td style="padding:24px 32px 0">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Contact Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            ${row("Name", b.name ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Email", b.email ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Phone", b.phone ?? "")}
            ${b.requirements ? `<tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>${row("Notes", b.requirements)}` : ""}
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:24px 32px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Products Requested</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px">
            ${items}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;font-size:11px;color:#9ca3af;text-align:center">
            Reply directly to this email to respond to ${esc(b.name ?? "the customer")}.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildContactEmail(b: Record<string, string>) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af,#4338ca);padding:28px 32px">
            <div style="font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px">Aplus Technology Solutions</div>
            <div style="font-size:22px;font-weight:700;color:#fff">New Contact Inquiry</div>
            <div style="font-size:13px;color:#bfdbfe;margin-top:4px">${esc(b.inquiry_type ?? "General")}</div>
          </td>
        </tr>

        <!-- Details -->
        <tr><td style="padding:24px 32px 0">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Contact Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            ${row("Name", b.name ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${b.company ? `${row("Company", b.company)}<tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>` : ""}
            ${row("Email", b.email ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Phone", b.phone ?? "")}
            <tr><td colspan="2" style="height:1px;background:#f3f4f6;padding:0"></td></tr>
            ${row("Inquiry Type", b.inquiry_type ?? "")}
          </table>
        </td></tr>

        <!-- Message -->
        ${b.message ? `
        <tr><td style="padding:24px 32px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px">Message</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap">${esc(b.message)}</div>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;font-size:11px;color:#9ca3af;text-align:center">
            Reply directly to this email to respond to ${esc(b.name ?? "the customer")}.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const body: Record<string, string> = await req.json();

    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const isQuote = Boolean(body.items_list);
    const html = isQuote ? buildQuoteEmail(body) : buildContactEmail(body);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: body.email,
      subject: body.subject ?? "New Inquiry — Aplus Technology Solutions",
      html,
    });

    if (error) {
      console.error("[resend]", error);
      return NextResponse.json({ success: false, message: "Failed to send email." }, { status: 500 });
    }

    if (isQuote && process.env.ZOHO_REFRESH_TOKEN) {
      await createZohoLead(body).catch((err) => console.error("[zoho]", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
