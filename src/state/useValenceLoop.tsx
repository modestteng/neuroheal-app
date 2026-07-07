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

export type EmotionRecordSource = "monitor" | "intervention" | "checkin";

export type EmotionRecord = {
  id: string;
  timestamp: string;
  time: string;
  score: number;
  level: ValenceLevel;
  confidence: number;
  signalQuality: number;
  eegSummary: string;
  source: EmotionRecordSource;
  action?: string;
  beforeScore?: number;
  afterScore?: number;
  delta?: number;
  aiMessage?: string;
};

type LoopState = {
  current: ValenceSnapshot;
  history: ValenceSnapshot[];
  emotionRecords: EmotionRecord[];
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
const ARCHIVE_LIMIT = 260;
const EMOTION_ARCHIVE_KEY = "neuroheal.emotionArchive.v1";
const LOOP_RECORDS_KEY = "neuroheal.loopRecords.v1";

function nowHHMM(): string {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function nowIso(): string {
  return new Date().toISOString();
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

function makeRecordId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timestampForDay(day: Date, hour: number, minute: number) {
  const value = new Date(day);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function toEmotionRecord(
  snapshot: ValenceSnapshot,
  source: EmotionRecordSource,
  extra: Partial<EmotionRecord> = {},
): EmotionRecord {
  const timestamp = extra.timestamp ?? nowIso();
  return {
    id: extra.id ?? makeRecordId(source),
    timestamp,
    time: snapshot.time,
    score: snapshot.score,
    level: snapshot.level,
    confidence: snapshot.confidence,
    signalQuality: snapshot.signalQuality,
    eegSummary: snapshot.eegSummary,
    source,
    action: extra.action,
    beforeScore: extra.beforeScore,
    afterScore: extra.afterScore,
    delta: extra.delta,
    aiMessage: extra.aiMessage,
  };
}

function addEmotionRecord(records: EmotionRecord[], record: EmotionRecord) {
  const exists = records.some((item) => item.id === record.id);
  const next = exists ? records : [record, ...records];
  return next
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, ARCHIVE_LIMIT);
}

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 本地隐私归档失败时不阻断实时监测演示。
  }
}

function makeDemoEmotionRecords(): EmotionRecord[] {
  const dailyScores = [
    [62, 68, 66],
    [58, 61, 71],
    [48, 56, 64],
    [70, 73, 75],
    [54, 66, 69],
    [63, 72, 76],
    [42, 57, 64],
  ];
  const labels = ["晨间基线", "午后再监测", "晚间复盘"];
  const hours = [8, 14, 21];
  const today = new Date();

  return dailyScores.flatMap((scores, dayIndex) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (dailyScores.length - 1 - dayIndex));

    return scores.map((score, pointIndex) => {
      const timestamp = timestampForDay(day, hours[pointIndex], pointIndex === 1 ? 26 : 12);
      const isInterventionPoint = (dayIndex === 2 || dayIndex === dailyScores.length - 1) && pointIndex === 1;
      const level = scoreToLevel(score);
      return {
        id: `seed-${dayIndex}-${pointIndex}-${timestamp.slice(0, 10)}`,
        timestamp,
        time: `${String(hours[pointIndex]).padStart(2, "0")}:${pointIndex === 1 ? "26" : "12"}`,
        score,
        level,
        confidence: 88 + ((dayIndex + pointIndex) % 8),
        signalQuality: 90 + ((dayIndex + pointIndex) % 6),
        eegSummary: isInterventionPoint
          ? "干预后 Alpha 波占比回升，Valence 较干预前明显改善。"
          : `${labels[pointIndex]}显示 Valence 处于${level}区间，已写入个人情绪轨迹。`,
        source: isInterventionPoint ? "intervention" : "monitor",
        action: isInterventionPoint
          ? (dayIndex === dailyScores.length - 1 ? "3 分钟 Alpha 呼吸调节" : "意念赛车专注调节")
          : undefined,
        beforeScore: isInterventionPoint ? score - (dayIndex === dailyScores.length - 1 ? 15 : 8) : undefined,
        afterScore: isInterventionPoint ? score : undefined,
        delta: isInterventionPoint ? (dayIndex === dailyScores.length - 1 ? 15 : 8) : undefined,
        aiMessage: isInterventionPoint ? "系统已完成一次干预前后对比，并将结果纳入本周情绪报告。" : undefined,
      } satisfies EmotionRecord;
    });
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function loadEmotionRecords() {
  const stored = readStorage<EmotionRecord[]>(EMOTION_ARCHIVE_KEY);
  if (Array.isArray(stored) && stored.length > 0) return stored.slice(0, ARCHIVE_LIMIT);
  return makeDemoEmotionRecords();
}

function loadLoopRecords() {
  const stored = readStorage<ClosedLoopRecord[]>(LOOP_RECORDS_KEY);
  return Array.isArray(stored) ? stored.slice(0, 12) : [];
}

export function ValenceLoopProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastAiReply, setLastAiReply] = useState<string | null>(null);
  const [currentOverride, setCurrentOverride] = useState<ValenceSnapshot | null>(null);
  const [activeIntervention, setActiveIntervention] = useState<ActiveIntervention | null>(null);
  const [dynamicRecords, setDynamicRecords] = useState<ClosedLoopRecord[]>(loadLoopRecords);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>(loadEmotionRecords);
  const historyRef = useRef<ValenceSnapshot[]>([]);
  const activeRef = useRef<ActiveIntervention | null>(null);
  const lastRecordedRef = useRef<string | null>(null);
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

    const recordKey = `${current.id}-${current.time}-${current.score}-${current.level}`;
    if (lastRecordedRef.current === recordKey) return;
    lastRecordedRef.current = recordKey;
    setEmotionRecords((records) => addEmotionRecord(records, toEmotionRecord(current, "monitor")));
  }, [current]);

  useEffect(() => {
    writeStorage(EMOTION_ARCHIVE_KEY, emotionRecords);
  }, [emotionRecords]);

  useEffect(() => {
    writeStorage(LOOP_RECORDS_KEY, dynamicRecords);
  }, [dynamicRecords]);

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
    const completedAt = nowIso();

    const record: ClosedLoopRecord = {
      id: `loop-dynamic-${Date.now()}`,
      createdAt: completedAt,
      startTime: active?.startedAt ?? nowHHMM(),
      beforeLevel: before.level,
      beforeScore: before.score,
      action: actionTitle,
      aiMessage,
      afterLevel,
      afterScore,
      delta,
      durationSec: input.durationSec,
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
    lastRecordedRef.current = `${snapshot.id}-${snapshot.time}-${snapshot.score}-${snapshot.level}`;
    setEmotionRecords((records) => addEmotionRecord(records, toEmotionRecord(snapshot, "intervention", {
      id: `emotion-${record.id}`,
      timestamp: completedAt,
      action: actionTitle,
      beforeScore: before.score,
      afterScore,
      delta,
      aiMessage,
    })));
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
      emotionRecords,
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
      emotionRecords,
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
