import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { dailyTask, game } from "./data/mock";

export type RaceRoundResult = {
  distance: number;
  averageFocus: number;
  peakFocus: number;
  isNewBest: boolean;
};

export type RaceSessionState = {
  lastAverageFocus: number | null;
  bestDistance: number;
  dailyDoneMinutes: number;
};

type RaceSessionContextValue = RaceSessionState & {
  recordRound: (result: Omit<RaceRoundResult, "isNewBest">) => RaceRoundResult;
};

const INITIAL_SESSION_STATE: RaceSessionState = {
  lastAverageFocus: null,
  bestDistance: 412,
  dailyDoneMinutes: dailyTask.doneMinutes,
};

const RaceSessionContext = createContext<RaceSessionContextValue | null>(null);

export function RaceSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RaceSessionState>(INITIAL_SESSION_STATE);

  const value = useMemo<RaceSessionContextValue>(() => ({
    ...state,
    recordRound: (round) => {
      const isNewBest = round.distance > state.bestDistance;
      const result: RaceRoundResult = { ...round, isNewBest };

      setState((current) => ({
        lastAverageFocus: round.averageFocus,
        bestDistance: Math.max(current.bestDistance, round.distance),
        dailyDoneMinutes: Math.min(dailyTask.totalMinutes, current.dailyDoneMinutes + 0.5),
      }));

      return result;
    },
  }), [state]);

  return <RaceSessionContext.Provider value={value}>{children}</RaceSessionContext.Provider>;
}

export function useRaceSession() {
  const context = useContext(RaceSessionContext);
  if (!context) throw new Error("useRaceSession must be used inside <RaceSessionProvider>");
  return context;
}

export function getCurrentFocusValue(lastAverageFocus: number | null) {
  return lastAverageFocus ?? game.currentFocus;
}
