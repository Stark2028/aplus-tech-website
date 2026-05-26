const TOKEN_URL = "https://accounts.zoho.in/oauth/v2/token";
const LEADS_URL = "https://www.zohoapis.in/crm/v2/Leads";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

async function getAccessToken(): Promise<string> {
  const res = await fetchWithRetry(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    // Only surface the OAuth error code — never the full response, which can
    // echo back client_id / client_secret and other sensitive identifiers.
    throw new Error(`Zoho token refresh failed: ${data.error ?? "unknown_error"}`);
  }
  return data.access_token;
}

export async function createZohoLead(body: Record<string, string>): Promise<void> {
  const accessToken = await getAccessToken();

  const nameParts = (body.name ?? "").trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts[0] : "";

  const description = [
    body.items_list ? `Products Requested:\n${body.items_list}` : "",
    body.requirements ? `Notes: ${body.requirements}` : "",
    body.subject ? `Ref: ${body.subject}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const lead = {
    Last_Name: lastName || "Unknown",
    First_Name: firstName,
    Email: body.email,
    Phone: body.phone,
    Company: body.company || "Not provided",
    Description: description,
    Lead_Source: "Web Site",
    Lead_Status: "New",
  };

  const res = await fetchWithRetry(LEADS_URL, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: [lead] }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoho lead creation failed (${res.status}): ${err}`);
  }
}
