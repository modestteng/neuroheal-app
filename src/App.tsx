import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import "./App.css";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import TrainScreen from "./screens/TrainScreen";
import CommunityScreen from "./screens/CommunityScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DeviceScreen from "./screens/sub/DeviceScreen";
import PrescriptionScreen from "./screens/sub/PrescriptionScreen";
import PlayerScreen from "./screens/sub/PlayerScreen";
import AiChatScreen from "./screens/sub/AiChatScreen";
import GrowthScreen from "./screens/sub/GrowthScreen";
import RaceScreen from "./screens/sub/RaceScreen";
import FocusSessionScreen from "./screens/sub/FocusSessionScreen";
import ProfileDetailScreen from "./screens/sub/ProfileDetailScreen";
import ProfileBundleScreen from "./screens/sub/ProfileBundleScreen";
import { NavProvider, type SubRoute } from "./nav";
import type { SubName, TabKey } from "./data/mock";
import { RaceSessionProvider } from "./game-session";
import { useClickSound } from "./hooks/useClickSound";
import { ValenceLoopProvider } from "./state/useValenceLoop";
import { LanguageProvider, useLanguage } from "./state/useLanguage";

const SCREENS = {
  home: HomeScreen,
  train: TrainScreen,
  community: CommunityScreen,
  profile: ProfileScreen,
} satisfies Record<TabKey, () => unknown>;

function renderSub(s: SubRoute) {
  const p = s.params ?? {};
  switch (s.name) {
    case "device": return <DeviceScreen />;
    case "prescription": return <PrescriptionScreen id={p.id as string | undefined} />;
    case "player": return <PlayerScreen from={p.from as string | undefined} actionId={p.actionId as string | undefined} actionTitle={p.actionTitle as string | undefined} />;
    case "aichat": return <AiChatScreen />;
    case "growth": return <GrowthScreen />;
    case "race": return <RaceScreen actionId={p.actionId as string | undefined} actionTitle={p.actionTitle as string | undefined} />;
    case "focusSession": return <FocusSessionScreen title={p.title as string | undefined} goal={p.goal as string | undefined} />;
    case "profileBundle": return <ProfileBundleScreen bundle={p.bundle as string | undefined} />;
    case "profileDetail": return <ProfileDetailScreen detail={p.detail as string | undefined} />;
  }
}

function AppContent() {
  useClickSound();
  const { isEnglish } = useLanguage();

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
    <ValenceLoopProvider>
      <RaceSessionProvider>
        <NavProvider value={{ goTab, openSub, closeSub }}>
          <div className="app-shell">
            <aside className="app-aside">
              <div className="brand-row">
                <div className="brand-mark"><Brain size={20} /></div>
                <h1>智愈莘莘 NeuroHeal</h1>
              </div>
              <span className="kicker" style={{ marginTop: 6 }}>
                {isEnglish ? "EEG emotion monitoring and intervention feedback system · V1.0" : "脑电情绪监测与干预反馈系统 · V1.0"}
              </span>
              <span className="tag">
                {isEnglish ? "EEG Monitoring · Valence Recognition · AI Feedback" : "EEG 监测 · Valence 识别 · AI 反馈"}
              </span>
              <p>
                {isEnglish
                  ? "Connect a portable EEG device, monitor brain signals continuously, recognize Valence, and let AI suggest calming or intervention actions in a real-time feedback loop."
                  : "连接便携式脑电头环，持续采集 EEG 脑电信号，识别 Valence 情绪效价，并由 AI 给出安抚或干预建议，形成实时反馈闭环。"}
              </p>
              <ul>
                <li>{isEnglish ? "Monitor · EEG waveform and Valence level" : "监测 · EEG 波形与 Valence 等级"}</li>
                <li>{isEnglish ? "Intervene · Breathing / Prescriptions / AI companion / Focus game" : "干预 · 呼吸训练 / 数字处方 / AI 陪伴 / 调节游戏"}</li>
                <li>{isEnglish ? "Record · Closed-loop logs and growth archive" : "记录 · 闭环记录与成长档案"}</li>
              </ul>
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
      </RaceSessionProvider>
    </ValenceLoopProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
