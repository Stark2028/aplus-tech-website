import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SAMSUNG_CREDENTIAL } from "@/lib/credentials";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("Samsung Service Partner credential on web surfaces", () => {
  it("names the credential on the About page", () => {
    expect(read("app/about/page.tsx")).toContain("SAMSUNG_CREDENTIAL");
  });

  it("names the credential in the footer", () => {
    expect(read("components/Footer.tsx")).toContain("SAMSUNG_CREDENTIAL");
  });

  it("never says Service Center anywhere in app or components", () => {
    for (const f of ["app/about/page.tsx", "components/Footer.tsx"]) {
      expect(read(f)).not.toMatch(/service cent(er|re)/i);
    }
  });

  it("keeps the approved wording", () => {
    expect(SAMSUNG_CREDENTIAL).toBe(
      "Authorized Samsung Commercial Display Distributor & Service Partner",
    );
  });
});
