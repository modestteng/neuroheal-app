import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ChevronDown, ChevronUp, Flag, Gauge, RotateCcw, Timer, X } from "lucide-react";
import { type ClosedLoopRecord } from "../../data/mock";
import { useRaceSession, type RaceRoundResult } from "../../game-session";
import { useNav } from "../../nav";
import { useValenceLoop } from "../../state/useValenceLoop";
import { Chip } from "../../components/ui";

type RacePhase = "ready" | "countdown" | "running" | "summary";
type MarkerType = "focus" | "boost" | "noise";

type TrackMarker = {
  id: number;
  distance: number;
  lane: number;
  type: MarkerType;
  handled?: boolean;
};

type SummaryStats = {
  collected: number;
  hits: number;
  avoids: number;
  maxCombo: number;
};

const ROUND_SECONDS = 30;
const START_FOCUS = 58;
const FINISH_DISTANCE = 420;
const VISIBLE_DISTANCE = 150;
const CAR_X = 22;
const LANE_TOP = [42, 96, 150];

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

function createMarkers(): TrackMarker[] {
  return Array.from({ length: 22 }, (_, index) => {
    const type: MarkerType = index % 6 === 4 ? "boost" : index % 4 === 2 ? "noise" : "focus";
    return {
      id: index,
      distance: 54 + index * 17 + (index % 3) * 4,
      lane: (index * 2 + (type === "noise" ? 1 : 0)) % 3,
      type,
    };
  });
}

function markerText(type: MarkerType) {
  if (type === "boost") return "冲";
  if (type === "noise") return "扰";
  return "专";
}

export default function RaceScreen({ actionId, actionTitle }: { actionId?: string; actionTitle?: string }) {
  const { closeSub } = useNav();
  const { recordRound } = useRaceSession();
  const { startIntervention, completeIntervention, resume, current } = useValenceLoop();
  const resolvedActionId = actionId ?? "race-focus";
  const resolvedTitle = actionTitle ?? "意念赛车专注调节";

  const [phase, setPhase] = useState<RacePhase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [focus, setFocus] = useState(START_FOCUS);
  const [distance, setDistance] = useState(0);
  const [remainingMs, setRemainingMs] = useState(ROUND_SECONDS * 1000);
  const [lane, setLane] = useState(1);
  const [markers, setMarkers] = useState<TrackMarker[]>(() => createMarkers());
  const [result, setResult] = useState<RaceRoundResult | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loopRecord, setLoopRecord] = useState<ClosedLoopRecord | null>(null);
  const [holding, setHolding] = useState(false);
  const [combo, setCombo] = useState(0);

  const holdRef = useRef(false);
  const focusRef = useRef(START_FOCUS);
  const distanceRef = useRef(0);
  const remainingRef = useRef(ROUND_SECONDS * 1000);
  const laneRef = useRef(1);
  const markersRef = useRef<TrackMarker[]>(createMarkers());
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const collectedRef = useRef(0);
  const hitsRef = useRef(0);
  const avoidsRef = useRef(0);
  const peakFocusRef = useRef(START_FOCUS);
  const focusTotalRef = useRef(0);
  const samplesRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => () => resume(), [resume]);

  const moveLane = useCallback((delta: number) => {
    setLane((current) => {
      const next = clamp(current + delta, 0, 2);
      laneRef.current = next;
      return next;
    });
  }, []);

  const setHoldingState = useCallback((value: boolean) => {
    holdRef.current = value;
    setHolding(value);
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      const startTimer = window.setTimeout(() => {
        setPhase("running");
        lastTickRef.current = performance.now();
      }, 0);
      return () => window.clearTimeout(startTimer);
    }

    const timeout = window.setTimeout(() => setCountdown((value) => value - 1), 800);
    return () => window.clearTimeout(timeout);
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "running") return;

    let frame = 0;
    const finishRound = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      window.setTimeout(() => {
        const averageFocus = Math.round(focusTotalRef.current / Math.max(1, samplesRef.current));
        const finalDistance = Math.round(distanceRef.current);
        const round = recordRound({
          distance: finalDistance,
          averageFocus,
          peakFocus: Math.round(peakFocusRef.current),
        });
        const scoreDelta = Math.max(5, Math.round((averageFocus - 42) / 3) + collectedRef.current - hitsRef.current * 2);
        const record = completeIntervention({
          actionId: resolvedActionId,
          actionTitle: resolvedTitle,
          durationSec: Math.round((ROUND_SECONDS * 1000 - remainingRef.current) / 1000),
          metrics: {
            averageFocus,
            distance: finalDistance,
            peakFocus: Math.round(peakFocusRef.current),
            collected: collectedRef.current,
            hits: hitsRef.current,
          },
          afterScoreDelta: scoreDelta,
          aiMessage: `${resolvedTitle}已完成，平均专注 ${averageFocus}%，收集 ${collectedRef.current} 个专注点，系统将继续观察 Valence 变化。`,
        });

        setHoldingState(false);
        setResult(round);
        setSummaryStats({
          collected: collectedRef.current,
          hits: hitsRef.current,
          avoids: avoidsRef.current,
          maxCombo: maxComboRef.current,
        });
        setLoopRecord(record);
        setPhase("summary");
      }, 0);
    };

    const tick = (now: number) => {
      const previous = lastTickRef.current ?? now;
      const deltaMs = Math.min(80, now - previous);
      const deltaSeconds = deltaMs / 1000;
      lastTickRef.current = now;

      const focusDelta = holdRef.current ? 23 : -13;
      let nextFocus = clamp(focusRef.current + (focusDelta + Math.min(8, comboRef.current * 0.35)) * deltaSeconds, 18, 100);
      const speed = 6.4 + nextFocus / 6.2 + (holdRef.current ? 1.8 : 0);
      const nextDistance = distanceRef.current + speed * deltaSeconds;
      let markerChanged = false;

      const nextMarkers = markersRef.current.map((marker) => {
        if (marker.handled || marker.distance > nextDistance + 8) return marker;

        markerChanged = true;
        const sameLane = marker.lane === laneRef.current;

        if (sameLane && marker.type === "noise") {
          hitsRef.current += 1;
          comboRef.current = 0;
          nextFocus = clamp(nextFocus - 18, 18, 100);
          return { ...marker, handled: true };
        }

        if (sameLane) {
          const gain = marker.type === "boost" ? 15 : 8;
          collectedRef.current += marker.type === "boost" ? 2 : 1;
          comboRef.current = Math.min(24, comboRef.current + 1);
          maxComboRef.current = Math.max(maxComboRef.current, Math.round(comboRef.current));
          nextFocus = clamp(nextFocus + gain, 18, 100);
          return { ...marker, handled: true };
        }

        if (marker.type === "noise") {
          avoidsRef.current += 1;
          comboRef.current = Math.min(24, comboRef.current + 0.4);
          nextFocus = clamp(nextFocus + 2, 18, 100);
        } else {
          comboRef.current = Math.max(0, comboRef.current - 0.6);
          nextFocus = clamp(nextFocus - 3, 18, 100);
        }

        return { ...marker, handled: true };
      });

      if (markerChanged) {
        markersRef.current = nextMarkers;
        setMarkers(nextMarkers);
      }

      const nextRemaining = Math.max(0, remainingRef.current - deltaMs);
      remainingRef.current = nextRemaining;
      focusRef.current = nextFocus;
      distanceRef.current = nextDistance;
      peakFocusRef.current = Math.max(peakFocusRef.current, nextFocus);
      focusTotalRef.current += nextFocus;
      samplesRef.current += 1;

      setFocus(nextFocus);
      setDistance(nextDistance);
      setRemainingMs(nextRemaining);
      setCombo(Math.round(comboRef.current));

      if (nextRemaining === 0 || nextDistance >= FINISH_DISTANCE) {
        finishRound();
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [completeIntervention, phase, recordRound, resolvedActionId, resolvedTitle, setHoldingState]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (phase !== "running") return;
      if (event.code === "ArrowUp") {
        event.preventDefault();
        if (!event.repeat) moveLane(-1);
        return;
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        if (!event.repeat) moveLane(1);
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setHoldingState(true);
      }
    };

    const up = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      setHoldingState(false);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [moveLane, phase, setHoldingState]);

  const beginCountdown = () => {
    const freshMarkers = createMarkers();
    holdRef.current = false;
    focusRef.current = START_FOCUS;
    distanceRef.current = 0;
    remainingRef.current = ROUND_SECONDS * 1000;
    laneRef.current = 1;
    markersRef.current = freshMarkers;
    comboRef.current = 0;
    maxComboRef.current = 0;
    collectedRef.current = 0;
    hitsRef.current = 0;
    avoidsRef.current = 0;
    peakFocusRef.current = START_FOCUS;
    focusTotalRef.current = 0;
    samplesRef.current = 0;
    lastTickRef.current = null;
    finishedRef.current = false;
    setHolding(false);
    setFocus(START_FOCUS);
    setDistance(0);
    setRemainingMs(ROUND_SECONDS * 1000);
    setLane(1);
    setMarkers(freshMarkers);
    setCombo(0);
    setResult(null);
    setSummaryStats(null);
    setLoopRecord(null);
    setCountdown(3);
    startIntervention(resolvedActionId, resolvedTitle);
    setPhase("countdown");
  };

  const focusLabel = focus >= 84 ? "心流冲刺 · α↑β↑" : focus >= 62 ? "稳定推进 · α 活跃" : "调整呼吸 · 信号波动";
  const focusColor = focus >= 80 ? "var(--teal)" : focus >= 60 ? "var(--brand)" : focus >= 42 ? "var(--joy)" : "var(--stress)";
  const progressPct = clamp((distance / FINISH_DISTANCE) * 100, 0, 100);
  const rivalProgress = clamp(20 + ((ROUND_SECONDS * 1000 - remainingMs) / (ROUND_SECONDS * 1000)) * 64, 20, 84);
  const activeMarkers = useMemo(
    () => markers.filter((marker) => !marker.handled && marker.distance > distance - 12 && marker.distance < distance + VISIBLE_DISTANCE),
    [distance, markers],
  );

  return (
    <div className="sub-screen race-screen">
      <div className="sub-header" style={{ background: "transparent", borderBottom: "none" }}>
        <button className="sub-back" onClick={closeSub} aria-label="关闭">
          <X size={20} color="var(--t-primary)" />
        </button>
        <span className="sub-title">意念赛车 · 专注换道赛</span>
        <div className="sub-head-right"><Chip variant="teal"><Activity size={12} /> EEG 驱动</Chip></div>
      </div>

      <div className="race-body">
        <div className="card race-status-card race-game-card">
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
              <span className={`race-rush-pill${focus >= 84 ? " active" : ""}`}>连击 x{Math.max(0, combo)}</span>
            </div>
          </div>

          <div className="race-track live game">
            <span className="speed-lines" />
            {LANE_TOP.map((top, index) => <span key={index} className="lane" style={{ top }} />)}
            <span className="race-crowd">专注赛道</span>
            <span className="race-finish"><Flag size={18} /></span>
            <motion.span
              className="race-rival game"
              animate={{ left: `${rivalProgress}%` }}
              transition={{ duration: 0.2, ease: "linear" }}
            >
              🏁
            </motion.span>

            {activeMarkers.map((marker) => {
              const x = CAR_X + ((marker.distance - distance) / VISIBLE_DISTANCE) * 74;
              return (
                <motion.span
                  key={marker.id}
                  className={`race-marker ${marker.type}`}
                  animate={{ left: `${clamp(x, 4, 96)}%`, top: LANE_TOP[marker.lane] - 16 }}
                  transition={{ duration: 0.12, ease: "linear" }}
                >
                  {markerText(marker.type)}
                </motion.span>
              );
            })}

            <motion.span
              className={`race-player-car${holding ? " charging" : ""}`}
              animate={{ left: `${CAR_X}%`, top: LANE_TOP[lane] - 17 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              🏎️
            </motion.span>
          </div>

          <div className="race-progress-row">
            <span>赛程</span>
            <div className="race-focus-bar"><i style={{ width: `${progressPct}%`, background: focusColor }} /></div>
            <strong className="num" style={{ color: focusColor }}>{Math.round(progressPct)}%</strong>
          </div>

          <div className="race-metrics">
            <div className="race-metric">
              <span className="tiny">专注稳定度</span>
              <strong className="num" style={{ color: focusColor }}>{Math.round(focus)}%</strong>
            </div>
            <div className="race-metric">
              <span className="tiny">脑波置信度</span>
              <strong className="num">{current.confidence}%</strong>
            </div>
            <div className="race-metric">
              <span className="tiny">已行驶</span>
              <strong className="num">{formatDistance(distance)}</strong>
            </div>
          </div>
        </div>

        {phase === "ready" && (
          <div className="card race-panel">
            <div className="row top" style={{ gap: 12 }}>
              <div className="icon-badge" style={{ background: "var(--teal-soft)", width: 44, height: 44, flex: "none" }}>
                <Gauge size={20} color="var(--teal-deep)" />
              </div>
              <div className="col grow" style={{ gap: 4 }}>
                <span className="body" style={{ fontWeight: 800 }}>用注意力驾驶赛车</span>
                <span className="muted">上/下换道，按住蓄力。EEG Alpha/Beta 信号驱动专注度，专注越高赛车跑越远。</span>
              </div>
            </div>
            <div className="race-rule-grid">
              <span className="rule-focus">
                <strong style={{ fontSize: 16 }}>专</strong>
                专注 +8
              </span>
              <span className="rule-boost">
                <strong style={{ fontSize: 16 }}>冲</strong>
                加速奖励
              </span>
              <span className="rule-noise">
                <strong style={{ fontSize: 16 }}>扰</strong>
                干扰下降
              </span>
            </div>
            <button className="btn btn-primary btn-block" onClick={beginCountdown}>开始 30 秒挑战</button>
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
            <div className="race-control-grid">
              <div className="race-lane-controls">
                <button onClick={() => moveLane(-1)} aria-label="向上换道" disabled={lane === 0}>
                  <ChevronUp size={20} />
                </button>
                <span>换道</span>
                <button onClick={() => moveLane(1)} aria-label="向下换道" disabled={lane === 2}>
                  <ChevronDown size={20} />
                </button>
              </div>
              <button
                className={`race-hold-button${holding ? " active" : ""}`}
                onPointerDown={() => setHoldingState(true)}
                onPointerUp={() => setHoldingState(false)}
                onPointerCancel={() => setHoldingState(false)}
                onPointerLeave={() => setHoldingState(false)}
              >
                <span>{holding ? "专注蓄力中" : "按住蓄力"}</span>
                <small>{holding ? "维持节律，避开干扰点" : "手机长按 / 桌面按住空格"}</small>
              </button>
            </div>
          </div>
        )}

        {phase === "summary" && result && summaryStats && (
          <div className="card race-summary">
            <div className="row between">
              <div className="col" style={{ gap: 2 }}>
                <span className="kicker">本局完成</span>
                <span className="h2">{result.isNewBest ? "刷新本会话最佳" : "完成一次专注干预"}</span>
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

            <div className="race-summary-grid race-summary-grid-four">
              <div><span className="tiny">专注点</span><strong className="num">{summaryStats.collected}</strong></div>
              <div><span className="tiny">最大连击</span><strong className="num">{summaryStats.maxCombo}</strong></div>
              <div><span className="tiny">避开干扰</span><strong className="num">{summaryStats.avoids}</strong></div>
              <div><span className="tiny">干扰命中</span><strong className="num">{summaryStats.hits}</strong></div>
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
              <button className="btn btn-ghost grow" onClick={beginCountdown}><RotateCcw size={16} /> 再来一局</button>
              <button className="btn btn-primary grow" onClick={closeSub}>返回并继续监测</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
