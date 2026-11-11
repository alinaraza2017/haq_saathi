import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Analysis, ChatMsg, ComplaintDraft } from "./types";

/** Everything about the current case lives here and in sessionStorage only (cleared by Quick Exit). */
export interface CaseState {
  narrative: string; // redacted text (or "[voice note]")
  analysis: Analysis | null;
  complaint: ComplaintDraft | null;
  chat: ChatMsg[];
  offline: boolean;
}
const EMPTY: CaseState = { narrative: "", analysis: null, complaint: null, chat: [], offline: false };
const KEY = "hs_case";

interface Ctx {
  state: CaseState;
  update: (patch: Partial<CaseState>) => void;
  reset: () => void;
}
const CaseCtx = createContext<Ctx>(null!);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaseState>(() => {
    try {
      return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") };
    } catch {
      return EMPTY;
    }
  });
  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);
  return (
    <CaseCtx.Provider
      value={{
        state,
        update: (patch) => setState((s) => ({ ...s, ...patch })),
        reset: () => setState(EMPTY),
      }}
    >
      {children}
    </CaseCtx.Provider>
  );
}
export const useCase = () => useContext(CaseCtx);
