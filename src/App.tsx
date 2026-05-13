import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import "./App.css";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import ReportScreen from "./screens/ReportScreen";
import TrainScreen from "./screens/TrainScreen";
import GameScreen from "./screens/GameScreen";
import CommunityScreen from "./screens/CommunityScreen";
import DeviceScreen from "./screens/sub/DeviceScreen";
import PrescriptionScreen from "./screens/sub/PrescriptionScreen";
import PlayerScreen from "./screens/sub/PlayerScreen";
import AiChatScreen from "./screens/sub/AiChatScreen";
import GrowthScreen from "./screens/sub/GrowthScreen";
import EduScreen from "./screens/sub/EduScreen";
import LeaderboardScreen from "./screens/sub/LeaderboardScreen";
import RaceScreen from "./screens/sub/RaceScreen";
import ReportExportScreen from "./screens/sub/ReportExportScreen";
import ReportShareScreen from "./screens/sub/ReportShareScreen";
import ProfileScreen from "./screens/sub/ProfileScreen";
import ShopCatalogScreen from "./screens/sub/ShopCatalogScreen";
import WishlistScreen from "./screens/sub/WishlistScreen";
import NotificationsScreen from "./screens/sub/NotificationsScreen";
import { NavProvider, type SubRoute } from "./nav";
import type { SubName, TabKey } from "./data/mock";
import { RaceSessionProvider } from "./game-session";
import { ShopSessionProvider } from "./shop-session";
import { useClickSound } from "./hooks/useClickSound";

const SCREENS = {
  home: HomeScreen,
  report: ReportScreen,
  train: TrainScreen,
  game: GameScreen,
  community: CommunityScreen,
} satisfies Record<TabKey, () => unknown>;

function renderSub(s: SubRoute) {
  const p = s.params ?? {};
  switch (s.name) {
    case "device": return <DeviceScreen />;
    case "prescription": return <PrescriptionScreen id={p.id as string | undefined} />;
    case "player": return <PlayerScreen from={p.from as string | undefined} />;
    case "aichat": return <AiChatScreen />;
    case "growth": return <GrowthScreen />;
    case "edu": return <EduScreen />;
    case "leaderboard": return <LeaderboardScreen />;
    case "race": return <RaceScreen />;
    case "report-export": return <ReportExportScreen />;
    case "report-share": return <ReportShareScreen />;
    case "profile": return <ProfileScreen />;
    case "shop-catalog": return <ShopCatalogScreen />;
    case "wishlist": return <WishlistScreen />;
    case "notifications": return <NotificationsScreen />;
  }
}

export default function App() {
  useClickSound();

  const [tab, setTab] = useState<TabKey>("home");
  const [sub, setSub] = useState<SubRoute | null>(null);
  const Screen = SCREENS[tab];

  const openSub = useCallback((name: SubName, params?: Record<string, unknown>) => setSub({ name, params }), []);
  const closeSub = useCallback(() => setSub(null), []);
  const goTab = useCallback((t: TabKey) => { setSub(null); setTab(t); }, []);

  const overlay = (
    <AnimatePresence>
      {sub && (
        <motion.div
          key={sub.name}
          className="phone-overlay"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderSub(sub)}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <RaceSessionProvider>
      <ShopSessionProvider>
        <NavProvider value={{ goTab, openSub, closeSub }}>
          <div className="app-shell">
        <aside className="app-aside">
          <div className="brand-row">
            <div className="brand-mark"><Brain size={20} /></div>
            <h1>智愈莘莘 NeuroHeal</h1>
          </div>
          <span className="tag">脑电情绪监测 · 心理健康干预</span>
          <p>
            连接便携式脑电头环，实时感知情绪 / 专注 / 压力，提供脑电报告、个性化数字处方、冥想引导、脑控游戏、AI 心理陪伴、匿名树洞、校园排行榜与成长档案。
          </p>
          <ul>
            <li>首页 · 情绪仪表盘（→ 设备配对）</li>
            <li>报告 · 脑电数据报告</li>
            <li>训练 · 数字处方 + 冥想引导（→ 科普短视频）</li>
            <li>游戏 · 心流挑战（意念赛车）</li>
            <li>社群 · 树洞 / 排行榜 / 积分（→ AI 陪伴 · 成长档案）</li>
          </ul>
          <p style={{ fontSize: 12, color: "var(--t-tertiary)" }}>演示数据均为 mock · 适合双创比赛答辩展示</p>
        </aside>

        <PhoneFrame nav={<BottomNav active={tab} onChange={setTab} />} overlay={overlay}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>
          </div>
        </NavProvider>
      </ShopSessionProvider>
    </RaceSessionProvider>
  );
}
