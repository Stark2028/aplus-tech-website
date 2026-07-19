import { describe, it, expect } from "vitest";
import { buildZohoLead } from "./zoho";

describe("buildZohoLead", () => {
  const base = { name: "Priya Sharma", email: "p@school.edu", phone: "+91 99999 99999" };

  it("defaults Lead_Source to Web Site", () => {
    expect(buildZohoLead(base).Lead_Source).toBe("Web Site");
  });

  it("passes lead_source through as the Zoho segment", () => {
    const lead = buildZohoLead({ ...base, lead_source: "Class Saathi", company: "Sunrise Public School" });
    expect(lead.Lead_Source).toBe("Class Saathi");
    expect(lead.Company).toBe("Sunrise Public School");
  });

  it("splits first/last name as before", () => {
    const lead = buildZohoLead(base);
    expect(lead.First_Name).toBe("Priya");
    expect(lead.Last_Name).toBe("Sharma");
  });
});
