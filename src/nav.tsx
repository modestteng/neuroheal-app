import { createContext, useContext } from "react";
import type { SubName, TabKey } from "./data/mock";

export type SubRoute = { name: SubName; params?: Record<string, unknown> };

type NavCtx = {
  goTab: (t: TabKey) => void;
  openSub: (name: SubName, params?: Record<string, unknown>) => void;
  closeSub: () => void;
};

const Ctx = createContext<NavCtx | null>(null);

export const NavProvider = Ctx.Provider;

export function useNav(): NavCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNav must be used inside <NavProvider>");
  return v;
}
