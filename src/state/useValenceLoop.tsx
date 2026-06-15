/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  closedLoopRecords,
  interventionActions,
  valenceSnapshots,
  type ClosedLoopRecord,
  type ValenceLevel,
  type ValenceSnapshot,
} from "../data/mock";

export type ActiveIntervention = {
  actionId: string;
  actionTitle: string;
  startedAt: string;
  before: ValenceSnapshot;
};

export type CompleteInterventionInput = {
  actionId?: string;
  actionTitle?: string;
  afterScore?: number;
  afterScoreDelta?: number;
  durationSec?: number;
  metrics?: Record<string, number>;
  aiMessage?: string;
};

type LoopState = {
  current: ValenceSnapshot;
  history: ValenceSnapshot[];
  loopRecords: ClosedLoopRecord[];
  activeIntervention: ActiveIntervention | null;
  isLive: boolean;
  loading: boolean;
  lastAiReply: string | null;
  pause: () => void;
  resume: () => void;
  startIntervention: (actionId: string, actionTitle?: string) => ActiveIntervention;
  completeIntervention: (input?: CompleteInterventionInput) => ClosedLoopRecord;
  requestAiFeedback: () => Promise<string>;
};

const Ctx = createContext<LoopState | null>(null);

const TICK_MS = 9000;
const HISTORY_LIMIT = 8;

function nowHHMM(): string {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function jitter(snapshot: ValenceSnapshot, salt: number): ValenceSnapshot {
  const delta = ((salt * 53) % 7) - 3;
  const score = Math.max(0, Math.min(100, snapshot.score + delta));
  return { ...snapshot, score, time: nowHHMM() };
}

function scoreToLevel(score: number): ValenceLevel {
  if (score >= 75) return "高效价";
  if (score >= 50) return "较高效价";
  if (score >= 35) return "较低效价";
  return "低效价";
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ValenceLoopProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastAiReply, setLastAiReply] = useState<string | null>(null);
  const [currentOverride, setCurrentOverride] = useState<ValenceSnapshot | null>(null);
  const [activeIntervention, setActiveIntervention] = useState<ActiveIntervention | null>(null);
  const [dynamicRecords, setDynamicRecords] = useState<ClosedLoopRecord[]>([]);
  const historyRef = useRef<ValenceSnapshot[]>([]);
  const activeRef = useRef<ActiveIntervention | null>(null);
  const [history, setHistory] = useState<ValenceSnapshot[]>([]);

  useEffect(() => {
    if (!isLive) return;
    const timer = window.setInterval(() => {
      setCurrentOverride(null);
      setTick((value) => value + 1);
      setIndex((value) => (value + 1) % valenceSnapshots.length);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [isLive]);

  const liveCurrent = useMemo(() => jitter(valenceSnapshots[index], tick), [index, tick]);
  const current = currentOverride ?? liveCurrent;
  const loopRecords = useMemo(() => [...dynamicRecords, ...closedLoopRecords], [dynamicRecords]);

  useEffect(() => {
    historyRef.current = [current, ...historyRef.current].slice(0, HISTORY_LIMIT);
    setHistory(historyRef.current);
  }, [current]);

  const pause = useCallback(() => setIsLive(false), []);
  const resume = useCallback(() => setIsLive(true), []);

  const startIntervention = useCallback((actionId: string, actionTitle?: string) => {
    const action = interventionActions.find((item) => item.id === actionId);
    const session: ActiveIntervention = {
      actionId,
      actionTitle: actionTitle ?? action?.title ?? "调节干预",
      startedAt: nowHHMM(),
      before: current,
    };

    activeRef.current = session;
    setActiveIntervention(session);
    setIsLive(false);
    return session;
  }, [current]);

  const completeIntervention = useCallback((input: CompleteInterventionInput = {}) => {
    const active = activeRef.current;
    const actionId = input.actionId ?? active?.actionId ?? current.recommendedActionId;
    const action = interventionActions.find((item) => item.id === actionId);
    const before = active?.before ?? current;
    const actionTitle = input.actionTitle ?? active?.actionTitle ?? action?.title ?? "调节干预";
    const afterScore = clampScore(input.afterScore ?? before.score + (input.afterScoreDelta ?? 10));
    const afterLevel = scoreToLevel(afterScore);
    const delta = afterScore - before.score;
    const metricNote = input.metrics?.averageFocus
      ? `平均专注 ${Math.round(input.metrics.averageFocus)}%，`
      : input.metrics?.relax
        ? `放松度 ${Math.round(input.metrics.relax)}%，`
        : "";
    const durationNote = input.durationSec ? `用时 ${Math.round(input.durationSec)} 秒，` : "";
    const aiMessage = input.aiMessage
      ?? `${actionTitle}已完成，${durationNote}${metricNote}系统将继续进行 EEG 再监测。`;

    const record: ClosedLoopRecord = {
      id: `loop-dynamic-${Date.now()}`,
      startTime: active?.startedAt ?? nowHHMM(),
      beforeLevel: before.level,
      beforeScore: before.score,
      action: actionTitle,
      aiMessage,
      afterLevel,
      afterScore,
      delta,
      status: "已完成",
    };

    const snapshot: ValenceSnapshot = {
      ...before,
      id: `after-${record.id}`,
      time: nowHHMM(),
      score: afterScore,
      level: afterLevel,
      confidence: Math.min(98, before.confidence + 1),
      eegSummary: delta >= 0
        ? "干预后 Alpha 波占比回升，脑波节律较干预前更平稳。"
        : "干预后状态仍有波动，建议继续进行轻量调节或联系可信支持。",
      aiFeedback: aiMessage,
      recommendedActionId: action?.id ?? before.recommendedActionId,
    };

    activeRef.current = null;
    setActiveIntervention(null);
    setDynamicRecords((records) => [record, ...records].slice(0, 12));
    setCurrentOverride(snapshot);
    setLastAiReply(aiMessage);
    setIsLive(true);
    return record;
  }, [current]);

  const requestAiFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `[Valence 上下文] 等级=${current.level}；score=${current.score}/100；置信度=${current.confidence}%；信号质量=${current.signalQuality}%；EEG 摘要=${current.eegSummary}`,
            },
            {
              role: "user",
              content: "请基于以上 Valence 上下文，用 2 到 3 句中文给我一段温和反馈与一个具体可执行的下一步建议，不要做医学诊断。",
            },
          ],
        }),
      });

      const data: { reply?: string; error?: string } = await response.json();
      const reply = data.reply?.trim();

      if (!response.ok || !reply) {
        throw new Error(data.error || "AI 反馈暂时不可用。");
      }

      setLastAiReply(reply);
      return reply;
    } catch (error) {
      const fallback = "AI 反馈暂时无法连接。你可以先做一次短呼吸，等会儿再试。";
      setLastAiReply(fallback);
      throw error instanceof Error ? error : new Error(fallback);
    } finally {
      setLoading(false);
    }
  }, [current]);

  const value: LoopState = useMemo(
    () => ({
      current,
      history,
      loopRecords,
      activeIntervention,
      isLive,
      loading,
      lastAiReply,
      pause,
      resume,
      startIntervention,
      completeIntervention,
      requestAiFeedback,
    }),
    [
      current,
      history,
      loopRecords,
      activeIntervention,
      isLive,
      loading,
      lastAiReply,
      pause,
      resume,
      startIntervention,
      completeIntervention,
      requestAiFeedback,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useValenceLoop(): LoopState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useValenceLoop must be used inside <ValenceLoopProvider>");
  return value;
}
