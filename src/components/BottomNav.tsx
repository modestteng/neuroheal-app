import { motion } from "framer-motion";
import { Activity, ClipboardList, Flower2 } from "lucide-react";
import { TABS, type TabKey } from "../data/mock";

const ICONS: Record<TabKey, typeof Activity> = {
  home: Activity,
  train: Flower2,
  community: ClipboardList,
};

export default function BottomNav({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => {
        const Icon = ICONS[t.key];
        const isActive = t.key === active;
        return (
          <button key={t.key} className={`nav-tab ${isActive ? "active" : ""}`} onClick={() => onChange(t.key)}>
            {isActive && <motion.span layoutId="navIndic" className="nav-indic" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <motion.span className="nav-icon-wrap" animate={{ scale: isActive ? 1.04 : 0.92 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </motion.span>
            <span className="nav-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
