import { describe, it, expect } from "vitest";
import { subPageCrumbs } from "./subPageCrumbs";
import { getCategoryById } from "@/data/categories";

describe("subPageCrumbs", () => {
  it("builds a 4-level trail matching the parent category page", () => {
    const crumbs = subPageCrumbs(getCategoryById("video-conferencing")!, {
      slug: "huddle-rooms",
      navLabel: "Huddle Rooms",
    });
    expect(crumbs).toEqual([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Video Conferencing", url: "/categories/video-conferencing" },
      { name: "Huddle Rooms", url: "/categories/video-conferencing/huddle-rooms" },
    ]);
  });

  it("uses the category navLabel, not the raw slug, at level three", () => {
    const crumbs = subPageCrumbs(getCategoryById("education")!, {
      slug: "k-12-schools",
      navLabel: "K-12 Schools",
    });
    expect(crumbs[2]).toEqual({ name: "Education", url: "/categories/education" });
    expect(crumbs[3].url).toBe("/categories/education/k-12-schools");
  });
});
