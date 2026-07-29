import { describe, it, expect } from "vitest";
import { captureLead, type LeadPayload } from "./leadCapture";

const payload: LeadPayload = {
  name: "Asha Menon",
  email: "asha@example.com",
  phone: "+91 90000 00000",
  message: "Need 12 QBC displays for a Noida office fit-out",
};

const ok = () => new Response('{"success":true}', { status: 200 });

describe("captureLead", () => {
  it("succeeds and reports no failure when the API accepts the lead", async () => {
    const failures: string[] = [];
    const result = await captureLead(payload, {
      fetchImpl: async () => ok(),
      onFailure: (reason) => failures.push(reason),
    });

    expect(result).toBe(true);
    expect(failures).toEqual([]);
  });

  // THE REGRESSION this module exists for. A 500 *resolves* the fetch promise, so
  // the old `void fetch(...).catch(() => {})` never noticed: res.ok was never
  // inspected and a dropped lead looked exactly like a delivered one. That is how
  // /api/contact stayed broken unnoticed while leads were being lost.
  it("treats a non-2xx response as a failure (the silent-drop regression)", async () => {
    const failures: string[] = [];
    const result = await captureLead(payload, {
      fetchImpl: async () => new Response('{"success":false}', { status: 500 }),
      onFailure: (reason) => failures.push(reason),
    });

    expect(result).toBe(false);
    expect(failures).toEqual(["http-500"]);
  });

  it("reports a network error instead of swallowing it", async () => {
    const failures: string[] = [];
    const result = await captureLead(payload, {
      fetchImpl: async () => {
        throw new TypeError("Failed to fetch");
      },
      onFailure: (reason) => failures.push(reason),
    });

    expect(result).toBe(false);
    expect(failures).toEqual(["network-error"]);
  });

  // The lead backup is best-effort: the customer's message is already in
  // Firestore. Throwing here would break startConversation and take the live
  // chat down with it — strictly worse than losing the email copy.
  it("never throws, even if the failure reporter itself throws", async () => {
    await expect(
      captureLead(payload, {
        fetchImpl: async () => {
          throw new Error("boom");
        },
        onFailure: () => {
          throw new Error("reporter exploded");
        },
      })
    ).resolves.toBe(false);
  });

  it("POSTs JSON to /api/contact carrying the chat's lead fields", async () => {
    let seenUrl = "";
    let seenInit: RequestInit | undefined;

    await captureLead(payload, {
      fetchImpl: async (url, init) => {
        seenUrl = String(url);
        seenInit = init;
        return ok();
      },
      onFailure: () => {},
    });

    expect(seenUrl).toBe("/api/contact");
    expect(seenInit?.method).toBe("POST");

    const body = JSON.parse(String(seenInit?.body));
    expect(body.name).toBe("Asha Menon");
    expect(body.email).toBe("asha@example.com");
    expect(body.inquiry_type).toBe("Website Live Chat");
    // Honeypot must be sent EMPTY — a non-empty value makes /api/contact
    // silently 200 and discard the lead as bot traffic.
    expect(body.company_website).toBe("");
  });
});
