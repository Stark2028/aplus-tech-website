import { describe, it, expect } from "vitest";
import { specLabels } from "./vcSpecLabels";

describe("specLabels", () => {
  it("returns default Samsung labels for non-VC categories", () => {
    expect(specLabels({ category: "Digital Signage" })).toEqual({
      resolution: "Resolution", brightness: "Brightness", operation: "Operation",
    });
  });

  it("uses Field of View for VC cameras/bars", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Cameras" });
    expect(l.brightness).toBe("Field of View");
    expect(l.resolution).toBe("Video");
  });

  it("uses Panel/Display for VC touch controllers", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Controllers & Scheduling" });
    expect(l.brightness).toBe("Panel");
    expect(l.resolution).toBe("Display");
  });

  it("uses Platform/Video Out for room compute", () => {
    const l = specLabels({ category: "Video Conferencing", subCategory: "Room Compute" });
    expect(l.brightness).toBe("Platform");
    expect(l.resolution).toBe("Video Out");
  });
});
