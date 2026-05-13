import { Heart, Sparkles, Trophy } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import PurchaseCelebration from "../../components/PurchaseCelebration";
import { shopItems } from "../../data/mock";
import { useShopSession } from "../../shop-session";

export default function ShopCatalogScreen() {
  const { availablePoints, redeemableCount, redeemedIds, redeem, toggleWishlist, wishlistIds } = useShopSession();

  return (
    <SubScreen title="全部好礼">
      <div className="card catalog-hero">
        <div className="row between">
          <div className="col">
            <span className="kicker">积分礼遇</span>
            <span className="h2">给认真生活一点实物反馈</span>
          </div>
          <div className="catalog-orb"><Trophy size={20} /></div>
        </div>
        <div className="catalog-stat-grid">
          <div>
            <span>可用积分</span>
            <strong className="num">{availablePoints.toLocaleString()}</strong>
          </div>
          <div>
            <span>当前可兑</span>
            <strong>{redeemableCount} 件</strong>
          </div>
        </div>
      </div>

      {shopItems.map((item) => {
        const redeemed = redeemedIds.includes(item.id);
        const wishlisted = wishlistIds.includes(item.id);
        const lackingPoints = item.cost > availablePoints;
        return (
          <div className={`card catalog-item ${redeemed ? "redeemed" : ""}`} key={item.id}>
            <div className="row top" style={{ gap: 12 }}>
              <div className={`icon-badge ${item.tone}`} style={{ width: 50, height: 50, fontSize: 22 }}>{item.emoji}</div>
              <div className="col grow">
                <span className="body" style={{ fontWeight: 700 }}>{item.name}</span>
                <span className="muted">{redeemed ? "已兑换，已同步到账户" : item.left}</span>
              </div>
              <button className={`wishlist-heart ${wishlisted ? "active" : ""}`} onClick={() => toggleWishlist(item.id)} aria-label="加入心愿仓">
                <Heart size={16} />
              </button>
            </div>
            <div className="row between">
              <span className="catalog-price"><Sparkles size={13} /> {item.cost}</span>
              <button className={`btn btn-sm ${redeemed ? "shop-btn-done" : "btn-primary"}`} disabled={redeemed || lackingPoints} onClick={() => redeem(item)}>
                {redeemed ? "已兑" : lackingPoints ? "差一点" : "立即兑换"}
              </button>
            </div>
          </div>
        );
      })}

      <PurchaseCelebration />
    </SubScreen>
  );
}
