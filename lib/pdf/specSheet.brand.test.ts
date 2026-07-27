import { describe, it, expect } from "vitest";
import { trustCardsFor, distributorLineFor } from "./specSheet";
import type { Product } from "@/data/products";

const samsung: Pick<Product, "brand"> = {};
const logitech: Pick<Product, "brand"> = { brand: "Logitech" };

describe("trustCardsFor", () => {
  it("Samsung keeps the 'Samsung Authorized' trust card", () => {
    const cards = trustCardsFor(samsung);
    expect(cards.some(([t]) => /Samsung Authorized/i.test(t))).toBe(true);
  });

  it("Samsung trust card states authorized service, not just warranty", () => {
    const [, body] = trustCardsFor(samsung).find(([t]) =>
      /Samsung Authorized/i.test(t)
    ) ?? ["", ""];
    expect(body).toMatch(/authorized service/i);
  });

  it("Logitech has no authorized/partner/certified/Samsung wording", () => {
    const cards = trustCardsFor(logitech);
    const blob = JSON.stringify(cards);
    expect(blob).not.toMatch(/authoriz|partner|certif|samsung/i);
  });

  it("Logitech still surfaces supply / installation / AMC", () => {
    const blob = JSON.stringify(trustCardsFor(logitech)).toLowerCase();
    expect(blob).toMatch(/install/);
    expect(blob).toMatch(/amc|support/);
  });

  it("always returns exactly three cards (layout depends on it)", () => {
    expect(trustCardsFor(samsung)).toHaveLength(3);
    expect(trustCardsFor(logitech)).toHaveLength(3);
  });
});

describe("distributorLineFor", () => {
  it("Samsung names both the distribution and the service authorization", () => {
    expect(distributorLineFor(samsung)).toMatch(
      /Authorized Samsung Commercial Display Distributor & Service Partner/
    );
  });

  it("Samsung line says 'Service Partner', never 'Service Center'", () => {
    expect(distributorLineFor(samsung)).not.toMatch(/service cent(er|re)/i);
  });

  it("Logitech line has no authorized/partner/certified/Samsung wording", () => {
    expect(distributorLineFor(logitech)).not.toMatch(/authoriz|partner|certif|samsung/i);
  });
});
