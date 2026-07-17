import { describe, expect, it } from "vitest";
import { stageChannelReducer, type StageChannelState } from "./useStageChannel";

const auto: StageChannelState = { manualIndex: null };

describe("stageChannelReducer", () => {
  it("selecting a channel from auto enters manual mode on that channel", () => {
    expect(stageChannelReducer(auto, { type: "select", index: 2 })).toEqual({ manualIndex: 2 });
  });

  it("selecting another channel while manual switches channels", () => {
    expect(stageChannelReducer({ manualIndex: 2 }, { type: "select", index: 0 })).toEqual({ manualIndex: 0 });
  });

  it("ignores out-of-range channel indexes", () => {
    expect(stageChannelReducer(auto, { type: "select", index: -1 })).toBe(auto);
    expect(stageChannelReducer(auto, { type: "select", index: 4 })).toBe(auto);
  });

  it("resume returns to auto", () => {
    expect(stageChannelReducer({ manualIndex: 3 }, { type: "resume" })).toEqual({ manualIndex: null });
  });

  it("resume while already in auto returns the same state object", () => {
    expect(stageChannelReducer(auto, { type: "resume" })).toBe(auto);
  });
});
