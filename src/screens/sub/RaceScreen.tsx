import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Gauge, RotateCcw, Sparkles, Timer, X } from "lucide-react";
import { useRaceSession, type RaceRoundResult } from "../../game-session";
import { useNav } from "../../nav";

type RacePhase = "ready" | "countdown" | "running" | "summary";

const ROUND_SECONDS = 30;
const START_FOCUS = 52;
const FOCUS_GAIN_PER_SECOND = 42;
const FOCUS_DECAY_PER_SECOND = 28;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDistance(distance: number) {
  return `${Math.round(distance)} m`;
}

export default function RaceScreen() {
  const { closeSub } = useNav();
  const { recordRound } = useRaceSession();
  const [phase, setPhase] = useState<RacePhase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [focus, setFocus] = useState(START_FOCUS);
  const [distance, setDistance] = useState(0);
  const [remainingMs, setRemainingMs] = useState(ROUND_SECONDS * 1000);
  const [result, setResult] = useState<RaceRoundResult | null>(null);
  const [holding, setHolding] = useState(false);
  const [streak, setStreak] = useState(0);
  const holdRef = useRef(false);
  const focusRef = useRef(START_FOCUS);
  const distanceRef = useRef(0);
  const streakRef = useRef(0);
  const peakFocusRef = useRef(START_FOCUS);
  const focusTotalRef = useRef(0);
  const samplesRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("running");
      lastTickRef.current = performance.now();
      return;
    }

    const timeout = window.setTimeout(() => setCountdown((value) => value - 1), 800);
    return () => window.clearTimeout(timeout);
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "running") return;

    let frame = 0;
    const tick = (now: number) => {
      const previous = lastTickRef.current ?? now;
      const deltaMs = Math.min(80, now - previous);
      const deltaSeconds = deltaMs / 1000;
      lastTickRef.current = now;

      const focusDelta = holdRef.current ? FOCUS_GAIN_PER_SECOND : -FOCUS_DECAY_PER_SECOND;
      const nextFocus = clamp(focusRef.current + focusDelta * deltaSeconds, 0, 100);
      const nextDistance = distanceRef.current + (3 + nextFocus / 8) * deltaSeconds;

      focusRef.current = nextFocus;
      distanceRef.current = nextDistance;
      streakRef.current = holdRef.current ? Math.min(99, streakRef.current + deltaSeconds * 2.6) : Math.max(0, streakRef.current - deltaSeconds * 4);
      peakFocusRef.current = Math.max(peakFocusRef.current, nextFocus);
      focusTotalRef.current += nextFocus;
      samplesRef.current += 1;

      setFocus(nextFocus);
      setDistance(nextDistance);
      setStreak(Math.floor(streakRef.current));

      setRemainingMs((current) => {
        const next = Math.max(0, current - deltaMs);
        if (next === 0 && !finishedRef.current) {
          finishedRef.current = true;
          window.setTimeout(() => {
            const averageFocus = Math.round(focusTotalRef.current / Math.max(1, samplesRef.current));
            const round = recordRound({
              distance: Math.round(distanceRef.current),
              averageFocus,
              peakFocus: Math.round(peakFocusRef.current),
            });
            holdRef.current = false;
            setHolding(false);
            setResult(round);
            setPhase("summary");
          }, 0);
        }
        return next;
      });

      if (!finishedRef.current) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, recordRound]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      if (phase === "running") {
        holdRef.current = true;
        setHolding(true);
      }
    };

    const up = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      holdRef.current = false;
      setHolding(false);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  const beginCountdown = () => {
    holdRef.current = false;
    setHolding(false);
    finishedRef.current = false;
    peakFocusRef.current = START_FOCUS;
    focusRef.current = START_FOCUS;
    distanceRef.current = 0;
    streakRef.current = 0;
    focusTotalRef.current = 0;
    samplesRef.current = 0;
    lastTickRef.current = null;
    setFocus(START_FOCUS);
    setDistance(0);
    setStreak(0);
    setRemainingMs(ROUND_SECONDS * 1000);
    setResult(null);
    setCountdown(3);
    setPhase("countdown");
  };

  const carProgress = useMemo(() => clamp(distance / 420, 0.06, 0.94), [distance]);
  const focusLabel = focus >= 82 ? "心流加速" : focus >= 60 ? "稳定推进" : "继续聚焦";
  const rivalProgress = clamp(0.16 + ((ROUND_SECONDS * 1000 - remainingMs) / (ROUND_SECONDS * 1000)) * 0.64, 0.16, 0.84);
  const turboMode = focus >= 82;
  const leadMeters = Math.round(distance - rivalProgress * 420);

  return (
    <div className="sub-screen race-screen">
      <div className="sub-header" style={{ background: "transparent", borderBottom: "none" }}>
        <button className="sub-back" onClick={closeSub} aria-label="关闭">
          <X size={20} color="var(--t-primary)" />
        </button>
        <span className="sub-title">意念赛车 · 专注蓄力赛</span>
        <div className="sub-head-right"><Sparkles size={17} color="var(--brand-deep)" /></div>
      </div>

      <div className="race-body">
        <div className="card race-status-card">
          <div className="row between race-headline">
            <div className="col" style={{ gap: 3 }}>
              <span className="kicker">30 秒挑战</span>
              <span className="h2">{focusLabel}</span>
            </div>
            <div className="race-hud-stack">
              <div className="race-count-pill">
                <Timer size={14} />
                {formatTimer(remainingMs)}
              </div>
              <span className={`race-rush-pill${turboMode ? " active" : ""}`}>{turboMode ? "冲刺!" : "蓄势"}</span>
            </div>
          </div>

          <div className="race-track live">
            {[18, 36, 54].map((top) => <span key={top} className="lane" style={{ top }} />)}
            <span className="race-crowd">专注赛道</span>
            <motion.span className="race-rival" animate={{ left: `${rivalProgress * 100}%` }} transition={{ duration: 0.24, ease: "linear" }}>🚙</motion.span>
            <span className="race-finish"><Flag size={18} /></span>
            <motion.span
              className={`race-car live${turboMode ? " turbo" : ""}`}
              animate={{ left: `${carProgress * 100}%` }}
              transition={{ duration: 0.18, ease: "linear" }}
            >
              🏎️
            </motion.span>
            {turboMode && <span className="race-burst" style={{ left: `${Math.max(8, carProgress * 100 - 4)}%` }}>⚡</span>}
          </div>

          <div className="race-metrics">
            <div className="race-metric">
              <span className="tiny">当前专注</span>
              <strong className="num">{Math.round(focus)}%</strong>
            </div>
            <div className="race-metric">
              <span className="tiny">{leadMeters >= 0 ? "领先对手" : "落后对手"}</span>
              <strong className="num">{Math.abs(leadMeters)} m</strong>
            </div>
          </div>

          <div className="race-drive-row">
            <div className="race-focus-bar">
              <i style={{ width: `${focus}%` }} />
            </div>
            <span className="race-streak-pill">连击 x{Math.max(1, streak)}</span>
          </div>
        </div>

        {phase === "ready" && (
          <div className="card race-panel">
            <div className="row top">
              <div className="icon-badge shadow" style={{ background: "#fff", width: 44, height: 44 }}>
                <Gauge size={20} color="var(--brand-deep)" />
              </div>
              <div className="col grow" style={{ gap: 3 }}>
                <span className="body" style={{ fontWeight: 700 }}>按住控制区维持专注</span>
                <span className="muted">长按会蓄力，松开会回落。专注越稳，赛车推进越快。</span>
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={beginCountdown}>开始挑战</button>
          </div>
        )}

        {phase === "countdown" && (
          <div className="card race-countdown">
            <span className="kicker">准备开始</span>
            <span className="race-countdown-number num">{countdown > 0 ? countdown : "GO"}</span>
          </div>
        )}

        {phase === "running" && (
          <div className="card race-control-panel">
            <button
              className={`race-hold-button${holding ? " active" : ""}`}
              onPointerDown={() => { holdRef.current = true; setHolding(true); }}
              onPointerUp={() => { holdRef.current = false; setHolding(false); }}
              onPointerCancel={() => { holdRef.current = false; setHolding(false); }}
              onPointerLeave={() => { holdRef.current = false; setHolding(false); }}
            >
              <span>{holding ? "松手会掉速" : "按住冲刺"}</span>
              <small>{holding ? "能量稳定增长中" : "手机长按 / 桌面按住空格"}</small>
            </button>
          </div>
        )}

        {phase === "summary" && result && (
          <div className="card race-summary">
            <div className="row between">
              <div className="col" style={{ gap: 2 }}>
                <span className="kicker">本局完成</span>
                <span className="h2">{result.isNewBest ? "刷新本会话最佳" : "完成一次稳定训练"}</span>
              </div>
              <div className="icon-badge shadow" style={{ background: "#fff", width: 46, height: 46 }}>
                <Flag size={20} color="var(--joy-deep)" />
              </div>
            </div>

            <div className="race-summary-grid">
              <div><span className="tiny">本局里程</span><strong className="num">{formatDistance(result.distance)}</strong></div>
              <div><span className="tiny">平均专注</span><strong className="num">{result.averageFocus}%</strong></div>
              <div><span className="tiny">峰值专注</span><strong className="num">{result.peakFocus}%</strong></div>
            </div>

            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-ghost grow" onClick={beginCountdown}><RotateCcw size={16} /> 再来一局</button>
              <button className="btn btn-primary grow" onClick={closeSub}>返回游戏页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
