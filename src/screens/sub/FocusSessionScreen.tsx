import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, CircleAlert, Pause, Play, RotateCcw, Target, Timer, X } from "lucide-react";
import { type ClosedLoopRecord } from "../../data/mock";
import { useNav } from "../../nav";
import { useValenceLoop } from "../../state/useValenceLoop";

type FocusPhase = "setup" | "running" | "paused" | "summary";

const TOTAL_SEC = 15 * 60;
const DEMO_TICK_SEC = 10;
const DEMO_INTERVAL_MS = 300;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function focusFromState(elapsed: number, distractions: number) {
  return clamp(72 + Math.round((elapsed / TOTAL_SEC) * 18) - distractions * 7, 45, 96);
}

export default function FocusSessionScreen({ title, goal }: { title?: string; goal?: string }) {
  const { closeSub } = useNav();
  const { startIntervention, completeIntervention, resume } = useValenceLoop();
  const resolvedTitle = title ?? "考研冲刺专注流";
  const resolvedGoal = goal ?? "数学错题整理 15 分钟";
  const [phase, setPhase] = useState<FocusPhase>("setup");
  const [remaining, setRemaining] = useState(TOTAL_SEC);
  const [distractions, setDistractions] = useState(0);
  const [focusScore, setFocusScore] = useState(72);
  const [loopRecord, setLoopRecord] = useState<ClosedLoopRecord | null>(null);
  const [review, setReview] = useState<{ averageFocus: number; finalScore: number; practicedSec: number; distractions: number } | null>(null);
  const finishedRef = useRef(false);
  const elapsedRef = useRef(0);
  const distractionsRef = useRef(0);
  const focusScoreRef = useRef(72);
  const focusTotalRef = useRef(0);
  const sampleCountRef = useRef(0);

  useEffect(() => () => resume(), [resume]);

  const resetSession = useCallback(() => {
    finishedRef.current = false;
    elapsedRef.current = 0;
    distractionsRef.current = 0;
    focusScoreRef.current = 72;
    focusTotalRef.current = 0;
    sampleCountRef.current = 0;
    setRemaining(TOTAL_SEC);
    setDistractions(0);
    setFocusScore(72);
    setLoopRecord(null);
    setReview(null);
    setPhase("setup");
  }, []);

  const finishSession = useCallback((manual = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const practicedSec = manual ? Math.max(180, elapsedRef.current) : TOTAL_SEC;
    const averageFocus = Math.round(focusTotalRef.current / Math.max(1, sampleCountRef.current)) || focusScoreRef.current;
    const finalScore = clamp(averageFocus + Math.round((practicedSec / TOTAL_SEC) * 8) - distractionsRef.current * 4, 0, 100);
    const record = completeIntervention({
      actionId: "prescription-focus",
      actionTitle: resolvedTitle,
      durationSec: practicedSec,
      metrics: {
        averageFocus,
        distractions: distractionsRef.current,
        finalScore,
      },
      afterScoreDelta: Math.max(4, Math.round((averageFocus - 50) / 4) - distractionsRef.current * 2 + 5),
      aiMessage: `${resolvedTitle}已完成，目标「${resolvedGoal}」已进入复盘，平均专注 ${averageFocus}%，走神 ${distractionsRef.current} 次。`,
    });

    setLoopRecord(record);
    setReview({ averageFocus, finalScore, practicedSec, distractions: distractionsRef.current });
    setPhase("summary");
  }, [completeIntervention, resolvedGoal, resolvedTitle]);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        const next = Math.max(0, current - DEMO_TICK_SEC);
        const elapsed = TOTAL_SEC - next;
        const nextFocus = focusFromState(elapsed, distractionsRef.current);
        elapsedRef.current = elapsed;
        focusScoreRef.current = nextFocus;
        focusTotalRef.current += nextFocus;
        sampleCountRef.current += 1;
        setFocusScore(nextFocus);

        if (next === 0) {
          window.setTimeout(() => finishSession(false), 0);
        }

        return next;
      });
    }, DEMO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [finishSession, phase]);

  const start = () => {
    resetSession();
    startIntervention("prescription-focus", resolvedTitle);
    setPhase("running");
  };

  const markDistraction = () => {
    distractionsRef.current += 1;
    setDistractions(distractionsRef.current);
    setFocusScore((current) => {
      const next = clamp(current - 8, 45, 96);
      focusScoreRef.current = next;
      return next;
    });
  };

  const progress = ((TOTAL_SEC - remaining) / TOTAL_SEC) * 100;

  return (
    <div className="sub-screen focus-session-screen">
      <div className="sub-header" style={{ background: "transparent", borderBottom: "none" }}>
        <button className="sub-back" onClick={closeSub} aria-label="关闭">
          <X size={20} color="var(--t-primary)" />
        </button>
        <span className="sub-title">番茄专注训练</span>
        <div className="sub-head-right"><Timer size={18} color="var(--brand-deep)" /></div>
      </div>

      <div className="focus-session-body">
        <div className="card focus-session-hero">
          <div className="row between top">
            <div className="col grow">
              <span className="kicker">今日目标</span>
              <span className="h2">{resolvedGoal}</span>
              <span className="muted">训练中可记录走神，结束后生成专注画像并写入闭环记录。</span>
            </div>
            <div className="focus-session-mark">
              <Target size={21} />
            </div>
          </div>

          <div className="focus-timer-panel">
            <motion.div
              className="focus-timer-ring"
              animate={{ background: `conic-gradient(var(--teal) ${progress * 3.6}deg, rgba(255,255,255,.62) 0deg)` }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <strong className="num">{fmt(remaining)}</strong>
                <span>{phase === "summary" ? "已完成" : phase === "paused" ? "已暂停" : "专注中"}</span>
              </div>
            </motion.div>
          </div>

          <div className="focus-stat-grid">
            <div>
              <span>专注稳定度</span>
              <strong className="num">{focusScore}%</strong>
            </div>
            <div>
              <span>走神记录</span>
              <strong className="num">{distractions}</strong>
            </div>
            <div>
              <span>已专注</span>
              <strong className="num">{fmt(TOTAL_SEC - remaining)}</strong>
            </div>
          </div>
        </div>

        {phase === "setup" && (
          <div className="card focus-guide-card">
            <div className="row top" style={{ gap: 12 }}>
              <div className="icon-badge" style={{ background: "var(--blue-soft)" }}>
                <BookOpen size={18} color="var(--brand-deep)" />
              </div>
              <div className="col grow" style={{ gap: 3 }}>
                <span className="body" style={{ fontWeight: 800 }}>准备进入 15 分钟番茄专注</span>
                <span className="muted">把当前任务放在眼前，手机保持静音。开始后如果发现走神，点一次“我走神了”即可。</span>
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={start}>
              <Play size={16} /> 开始计时
            </button>
          </div>
        )}

        {(phase === "running" || phase === "paused") && (
          <div className="card focus-control-card">
            <button className="focus-distraction-btn" onClick={markDistraction}>
              <CircleAlert size={18} />
              我走神了
            </button>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost grow" onClick={() => setPhase(phase === "running" ? "paused" : "running")}>
                {phase === "running" ? <Pause size={16} /> : <Play size={16} />}
                {phase === "running" ? "暂停" : "继续"}
              </button>
              <button className="btn btn-primary grow" onClick={() => finishSession(true)}>
                <CheckCircle2 size={16} /> 完成复盘
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {phase === "summary" && review && (
            <motion.div className="card focus-review-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="row between">
                <div className="col" style={{ gap: 2 }}>
                  <span className="kicker">今日专注画像</span>
                  <span className="h2">完成目标复盘</span>
                </div>
                <div className="focus-score-badge num">{review.finalScore}</div>
              </div>

              <div className="focus-review-grid">
                <div><span>完成目标</span><strong>{resolvedGoal}</strong></div>
                <div><span>有效专注</span><strong className="num">{fmt(review.practicedSec)}</strong></div>
                <div><span>平均专注</span><strong className="num">{review.averageFocus}%</strong></div>
                <div><span>走神次数</span><strong className="num">{review.distractions}</strong></div>
              </div>

              <div className="focus-ai-note">
                建议下一轮先做 3 分钟脑波热身，再进入 25 分钟番茄钟；若走神超过 3 次，优先缩短任务颗粒度。
              </div>

              {loopRecord && (
                <div className="before-after-grid">
                  <div>
                    <span>干预前</span>
                    <strong>{loopRecord.beforeScore}</strong>
                    <em>{loopRecord.beforeLevel}</em>
                  </div>
                  <div>
                    <span>干预后</span>
                    <strong>{loopRecord.afterScore}</strong>
                    <em>{loopRecord.afterLevel} · {loopRecord.delta >= 0 ? "+" : ""}{loopRecord.delta}</em>
                  </div>
                </div>
              )}

              <div className="row" style={{ gap: 10 }}>
                <button className="btn btn-ghost grow" onClick={start}><RotateCcw size={16} /> 再来一轮</button>
                <button className="btn btn-primary grow" onClick={closeSub}>写入档案</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
