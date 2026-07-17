"use client";

import { useCallback, useReducer } from "react";

export const CHANNEL_COUNT = 4;

export type StageChannelState = { manualIndex: number | null };
export type StageChannelAction =
  | { type: "select"; index: number }
  | { type: "resume" };

export function stageChannelReducer(
  state: StageChannelState,
  action: StageChannelAction,
): StageChannelState {
  switch (action.type) {
    case "select": {
      if (!Number.isInteger(action.index) || action.index < 0 || action.index >= CHANNEL_COUNT) {
        return state;
      }
      return { manualIndex: action.index };
    }
    case "resume":
      return state.manualIndex === null ? state : { manualIndex: null };
  }
}

/** Channel state for the hero display stage. `manualIndex === null` = the pure-CSS
 *  20s auto loop is running; a number = that channel is pinned via the chips. */
export function useStageChannel() {
  const [state, dispatch] = useReducer(stageChannelReducer, { manualIndex: null });
  const select = useCallback((index: number) => dispatch({ type: "select", index }), []);
  const resumeAuto = useCallback(() => dispatch({ type: "resume" }), []);
  return { manualIndex: state.manualIndex, select, resumeAuto };
}
