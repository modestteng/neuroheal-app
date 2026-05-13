import { HeartHandshake, Sparkles, Star } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import PurchaseCelebration from "../../components/PurchaseCelebration";
import { shopItems } from "../../data/mock";
import { useShopSession } from "../../shop-session";

export default function WishlistScreen() {
  const { availablePoints, redeemedIds, redeem, toggleWishlist, wishlistIds } = useShopSession();
  const wishlistItems = shopItems.filter((item) => wishlistIds.includes(item.id));
  const closestGift = wishlistItems.slice().sort((a, b) => a.cost - b.cost)[0];
  const gap = closestGift ? Math.max(0, closestGift.cost - availablePoints) : 0;

  return (
    <SubScreen title="心愿仓">
      <div className="card wishlist-hero">
        <div className="row" style={{ gap: 12 }}>
          <div className="wishlist-orb"><Star size={20} /></div>
          <div className="col grow">
            <span className="kicker">收藏计划</span>
            <span className="h2">先把想要的礼物放进来</span>
          </div>
        </div>
        <div className="wishlist-tip">
          <HeartHandshake size={16} />
          {closestGift ? (
            <span>{gap === 0 ? `现在就能兑换「${closestGift.name}」` : `距离「${closestGift.name}」还差 ${gap} 积分`}</span>
          ) : (
            <span>心愿仓空空的，去全部好礼里挑几个吧。</span>
          )}
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="card wishlist-empty">
          <span className="h2">暂时没有心愿</span>
          <span className="muted">已兑换或移出的礼物会离开心愿仓，这里更像一个小目标清单。</span>
        </div>
      ) : wishlistItems.map((item) => {
        const redeemed = redeemedIds.includes(item.id);
        const lackingPoints = item.cost > availablePoints;
        return (
          <div className={`card wishlist-item ${redeemed ? "redeemed" : ""}`} key={item.id}>
            <div className="row top" style={{ gap: 12 }}>
              <div className={`icon-badge ${item.tone}`} style={{ width: 48, height: 48, fontSize: 22 }}>{item.emoji}</div>
              <div className="col grow">
                <span className="body" style={{ fontWeight: 700 }}>{item.name}</span>
                <span className="muted">{item.left}</span>
              </div>
            </div>
            <div className="wishlist-footer">
              <span><Sparkles size={13} /> {item.cost}</span>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleWishlist(item.id)}>移出</button>
                <button className={`btn btn-sm ${redeemed ? "shop-btn-done" : "btn-primary"}`} disabled={redeemed || lackingPoints} onClick={() => redeem(item)}>
                  {redeemed ? "已兑" : lackingPoints ? "攒积分" : "马上兑换"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <PurchaseCelebration />
    </SubScreen>
  );
}
