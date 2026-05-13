import { motion } from "framer-motion";
import { ChevronRight, CircleCheck, Gamepad2, Medal, Target } from "lucide-react";
import { getCurrentFocusValue, useRaceSession } from "../game-session";
import { Chip, Reveal, SectionHeader, Track, useCountUp } from "../components/ui";
import { dailyTask, game, gameList } from "../data/mock";
import { useNav } from "../nav";

export default function GameScreen() {
  const { openSub } = useNav();
  const { bestDistance, dailyDoneMinutes, lastAverageFocus } = useRaceSession();
  const currentFocus = getCurrentFocusValue(lastAverageFocus);
  const focusN = useCountUp(currentFocus, 1000, [currentFocus]);
  const taskPct = (dailyDoneMinutes / dailyTask.totalMinutes) * 100;

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">脑控游戏 · 心流挑战</span>
            <span className="h1">边玩边训练，越玩越专注</span>
          </div>
          <Chip variant="amber"><Medal size={13} /> 本周第 18 名</Chip>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-teal-blue">
          <span className="row between">
            <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>本周主打 · 脑机交互游戏</span>
            <span className="chip glass live">脑控中</span>
          </span>
          <div className="row between">
            <div className="col grow">
              <span className="h2">意念赛车 🏎️</span>
              <span className="muted on-80">{game.subtitle}</span>
            </div>
            <div className="avatar" style={{ width: 56, height: 56, background: "rgba(255,255,255,.22)", fontSize: 28 }}>🏎️</div>
          </div>
          <div className="race-track">
            {[18, 36, 54].map((top) => <span key={top} className="lane" style={{ top }} />)}
            <motion.span
              className="race-car"
              initial={{ left: "8%" }}
              animate={{ left: `${10 + currentFocus * 0.8}%` }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              🏎️
            </motion.span>
            <span style={{ position: "absolute", right: 10, bottom: 8, fontSize: 20 }}>🏁</span>
          </div>
          <div className="row between">
            <div className="col" style={{ gap: 2 }}>
              <span className="tiny" style={{ color: "rgba(255,255,255,.8)" }}>当前专注度</span>
              <span className="metric-sm num" style={{ color: "#fff" }}>{focusN}%</span>
            </div>
            <button className="btn btn-white" onClick={() => openSub("race")}>开始挑战 <ChevronRight size={16} /></button>
          </div>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card">
          <SectionHeader title="玩法规则" />
          {game.rules.map((rule, index) => (
            <div className="list-row" key={index} style={{ padding: "8px 0" }}>
              <CircleCheck size={18} color="var(--teal)" />
              <span className="body">{rule}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal i={3}>
        <div className="card tint-amber flat">
          <div className="row top" style={{ gap: 12 }}>
            <div className="icon-badge" style={{ background: "#fff", width: 40, height: 40 }}><Target size={18} color="var(--joy-deep)" /></div>
            <div className="col grow">
              <span className="body" style={{ fontWeight: 600 }}>今日任务 · {dailyTask.title}</span>
              <span className="muted">进度 {dailyDoneMinutes.toFixed(1)} / {dailyTask.totalMinutes} 分钟 · 完成 +{dailyTask.reward} 心灵积分</span>
            </div>
            <span className="metric-sm num" style={{ color: "var(--joy-deep)" }}>{dailyDoneMinutes.toFixed(1)}/{dailyTask.totalMinutes}</span>
          </div>
          <Track pct={taskPct} color="var(--joy)" />
        </div>
      </Reveal>

      <Reveal i={4}>
        <SectionHeader title="全部脑控游戏" link="9 款" />
      </Reveal>
      <div className="col" style={{ gap: 12 }}>
        {[0, 1].map((rowIndex) => (
          <div className="row" style={{ gap: 12, alignItems: "stretch" }} key={rowIndex}>
            {gameList.slice(rowIndex * 2, rowIndex * 2 + 2).map((entry, itemIndex) => {
              const bestLabel = entry.id === "g1" ? `最佳 ${Math.round(bestDistance)} m` : entry.best;
              return (
                <Reveal i={5 + rowIndex * 2 + itemIndex} key={entry.id} className="grow" style={{ display: "flex" }}>
                  <div className="card soft" style={{ padding: 0, overflow: "hidden", gap: 0, width: "100%" }}>
                    <div className={`${entry.tone}`} style={{ height: 84, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>{entry.emoji}</div>
                    <div className="col" style={{ padding: 12, gap: 3 }}>
                      <span className="body" style={{ fontWeight: 600 }}>{entry.name}</span>
                      <span className="tiny" style={{ color: "var(--t-tertiary)" }}>{entry.dims}</span>
                      <span className="row" style={{ gap: 5 }}><Gamepad2 size={12} color="var(--brand)" /><span className="tiny" style={{ color: "var(--t-secondary)" }}>{bestLabel}</span></span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
