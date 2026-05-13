import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, PartyPopper, ShoppingBag, Sparkles } from "lucide-react";
import { useShopSession } from "../shop-session";

export default function PurchaseCelebration() {
  const { availablePoints, redeemedIds, purchase, clearPurchase } = useShopSession();

  return (
    <AnimatePresence>
      {purchase && (
        <motion.div
          className="purchase-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearPurchase}
        >
          <motion.div
            className="card purchase-modal"
            initial={{ scale: 0.88, y: 18, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.94, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="purchase-burst">
              <PartyPopper size={18} />
              <span />
              <Sparkles size={18} />
            </div>
            <div className="purchase-emoji">{purchase.emoji}</div>
            <span className="kicker">兑换成功</span>
            <span className="h2">{purchase.name}</span>
            <span className="muted">已扣除 {purchase.cost} 心灵积分，奖励已经放进彭同学的账户。</span>
            <div className="purchase-summary">
              <span><CheckCircle2 size={14} /> 余额 {availablePoints.toLocaleString()}</span>
              <span><ShoppingBag size={14} /> 已购 {redeemedIds.length} 件</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={clearPurchase}>
              收下这份奖励
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
