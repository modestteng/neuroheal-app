import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { shopItems, user } from "./data/mock";

export type ShopItem = (typeof shopItems)[number];

type PurchaseState = {
  name: string;
  cost: number;
  emoji: string;
};

type ShopSession = {
  availablePoints: number;
  redeemedIds: string[];
  wishlistIds: string[];
  purchase: PurchaseState | null;
  redeemableCount: number;
  spentPoints: number;
  redeem: (item: ShopItem) => boolean;
  toggleWishlist: (id: string) => void;
  clearPurchase: () => void;
};

const DEFAULT_WISHLIST = shopItems.map((item) => item.id);
const ShopCtx = createContext<ShopSession | null>(null);

export function ShopSessionProvider({ children }: { children: ReactNode }) {
  const [availablePoints, setAvailablePoints] = useState(user.soulPoints);
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(DEFAULT_WISHLIST);
  const [purchase, setPurchase] = useState<PurchaseState | null>(null);

  const redeemableCount = shopItems.filter((item) => item.cost <= availablePoints && !redeemedIds.includes(item.id)).length;
  const spentPoints = user.soulPoints - availablePoints;

  const value = useMemo<ShopSession>(() => ({
    availablePoints,
    redeemedIds,
    wishlistIds,
    purchase,
    redeemableCount,
    spentPoints,
    redeem: (item) => {
      if (redeemedIds.includes(item.id) || item.cost > availablePoints) return false;

      setAvailablePoints((points) => points - item.cost);
      setRedeemedIds((ids) => [...ids, item.id]);
      setWishlistIds((ids) => ids.filter((id) => id !== item.id));
      setPurchase({ name: item.name, cost: item.cost, emoji: item.emoji });
      return true;
    },
    toggleWishlist: (id) => {
      setWishlistIds((ids) => ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id]);
    },
    clearPurchase: () => setPurchase(null),
  }), [availablePoints, purchase, redeemedIds, redeemableCount, spentPoints, wishlistIds]);

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShopSession() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error("useShopSession must be used inside ShopSessionProvider");
  return ctx;
}
