import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  ChevronRight,
  CircleAlert,
  Loader2,
  MessageCircleHeart,
  Radio,
  Sparkles,
  Waves,
} from "lucide-react";
import { Chip, GaugeRing, Reveal, Track, useCountUp } from "../components/ui";
import { useNav } from "../nav";
import { useValenceLoop } from "../state/useValenceLoop";
import {
  eegLive,
  interventionActions,
  loopSteps,
  type ValenceLevel,
} from "../data/mock";

const LEVEL_TO_STEP: Record<ValenceLevel, number> = {
  低效价: 0,
  较低效价: 1,
  较高效价: 2,
  高效价: 3,
};

type ValenceMood = {
  tone: "stable" | "warning" | "danger";
  ringFrom: string;
  ringTo: string;
  textColor: string;
  chartColor: string;
  trackColor: string;
  alertTitle?: string;
  alertText?: string;
};

function getValenceMood(level: ValenceLevel, score: number): ValenceMood {
  if (level === "低效价" || score < 35) {
    return {
      tone: "danger",
      ringFrom: "var(--stress)",
      ringTo: "#e17158",
      textColor: "var(--stress)",
      chartColor: "var(--stress)",
      trackColor: "var(--stress)",
      alertTitle: "低效价警示",
      alertText: "当前情绪效价明显偏低，建议先停止高强度任务，进入呼吸调节或 AI 陪伴；若不适持续，请联系老师、家人或专业支持。",
    };
  }

  if (level === "较低效价" || score < 50) {
    return {
      tone: "warning",
      ringFrom: "var(--joy)",
      ringTo: "var(--stress)",
      textColor: "var(--joy-deep)",
      chartColor: "var(--stress)",
      trackColor: "var(--joy)",
      alertTitle: "情绪波动提醒",
      alertText: "系统检测到情绪效价偏低，可先做一次短呼吸或轻量互动训练，把状态拉回稳定区间。",
    };
  }

  return {
    tone: "stable",
    ringFrom: "var(--teal)",
    ringTo: "var(--brand)",
    textColor: "var(--brand-deep)",
    chartColor: "var(--brand-deep)",
    trackColor: "var(--teal)",
  };
}

function LoopFlow({ activeStep }: { activeStep: number }) {
  return (
    <div className="loop-flow">
      {loopSteps.map((step, index) => (
        <span key={step} className={index === activeStep ? "active" : ""}>
          {step}
        </span>
      ))}
    </div>
  );
}

function TopStatusTicker({ signalQuality }: { signalQuality: number }) {
  return (
    <div className="market-ticker" aria-label="ExpandableEEG 硬件状态">
      {[0, 1].map((round) => (
        <div className="market-ticker-track" key={round} aria-hidden={round === 1}>
          <span>ExpandableEEG · 24bit · ADS1299</span>
          <strong>EEG 信号 {signalQuality}%</strong>
          <span>8 通道 · 最高 1000Hz</span>
          <strong>WiFi AP / BT 双模</strong>
          <span>ADS1299 · ≤1μVpp 噪声</span>
        </div>
      ))}
    </div>
  );
}

function eegForLevel(level: ValenceLevel, phase = 0) {
  const amplitude = level === "低效价" ? 36 : level === "较低效价" ? 28 : level === "较高效价" ? 18 : 12;
  return eegLive.map((point) => ({
    t: point.t,
    v: 50 + Math.round(amplitude * Math.sin((point.t + phase) / 1.7) + (amplitude / 3) * Math.sin((point.t + phase) / 0.6)),
  }));
}

export default function HomeScreen() {
  const { openSub } = useNav();
  const { current, loading, lastAiReply, requestAiFeedback } = useValenceLoop();
  const score = useCountUp(current.score, 700, [current.id, current.score]);
  const intervention = useMemo(
    () => interventionActions.find((item) => item.id === current.recommendedActionId) ?? interventionActions[0],
    [current.recommendedActionId],
  );
  const [eegPhase, setEegPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setEegPhase((p) => p + 0.35), 80);
    return () => clearInterval(id);
  }, []);
  const eegData = useMemo(() => eegForLevel(current.level, eegPhase), [current.level, eegPhase]);
  const activeStep = loading ? 2 : LEVEL_TO_STEP[current.level];
  const mood = useMemo(() => getValenceMood(current.level, current.score), [current.level, current.score]);

  const handleAiFeedback = () => {
    void requestAiFeedback().catch(() => undefined);
  };

  return (
    <div className={`screen home-monitor-screen mood-${mood.tone}`}>
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 4 }}>
            <span className="kicker">实时闭环监测</span>
            <span className="h1">EEG-Valence 控制台</span>
          </div>
          <Chip variant={mood.tone === "stable" ? "teal" : "alert"}><Radio size={13} /> {mood.tone === "stable" ? "实时" : "提醒"}</Chip>
        </div>
      </Reveal>

      <Reveal i={1}>
        <TopStatusTicker signalQuality={current.signalQuality} />
      </Reveal>

      <Reveal i={2}>
        <div className={`card monitor-hero mood-${mood.tone}`}>
          <div className="row between top">
            <div className="col" style={{ gap: 4 }}>
              <span className="tiny">当前情绪效价</span>
              <span className="monitor-level">{current.level}</span>
              <span className="muted">Valence 分数 {current.score}/100 · {current.time}</span>
            </div>
            <GaugeRing
              value={current.score}
              size={118}
              stroke={11}
              trackColor="#dcecf2"
              from={mood.ringFrom}
              to={mood.ringTo}
              glow={false}
            >
              <span className="num" style={{ fontSize: 28, fontWeight: 700, color: mood.textColor }}>{score}</span>
              <span className="tiny">Valence</span>
            </GaugeRing>
          </div>

          {mood.alertTitle && (
            <div className={`valence-alert mood-${mood.tone}`}>
              <CircleAlert size={18} />
              <div className="col grow" style={{ gap: 2 }}>
                <strong>{mood.alertTitle}</strong>
                <span>{mood.alertText}</span>
              </div>
            </div>
          )}

          <div className="monitor-signal-grid">
            <div>
              <span>模型置信度</span>
              <strong>{current.confidence}%</strong>
              <Track pct={current.confidence} color="var(--brand)" />
            </div>
            <div>
              <span>信号质量</span>
              <strong>{current.signalQuality}%</strong>
              <Track pct={current.signalQuality} color={mood.trackColor} />
            </div>
          </div>

          <div className="compact-loop-panel">
            <LoopFlow activeStep={activeStep} />
          </div>
        </div>
      </Reveal>

      <Reveal i={3}>
        <div className="card">
          <div className="monitor-eeg-panel" style={{ borderTop: "none", paddingTop: 0 }}>
            <div className="row between">
              <span className="row" style={{ gap: 8 }}>
                <Waves size={16} color={mood.chartColor} />
                <span className="body" style={{ fontWeight: 700 }}>实时 EEG 波形</span>
              </span>
              <button
                className="chip"
                style={{ background: "var(--teal-soft)", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                onClick={() => openSub("device")}
                aria-label="打开设备与校准"
              >
                ExpandableEEG · 查看硬件 <ChevronRight size={12} />
              </button>
            </div>
            <div className="chart-box sm">
              <ResponsiveContainer>
                <AreaChart data={eegData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="homeEegGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={mood.chartColor} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={mood.chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={mood.chartColor} strokeWidth={2.2} fill="url(#homeEegGrad)" isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <span className="tiny">{current.eegSummary}</span>
          </div>

          <div className={`inline-ai-panel mood-${mood.tone}`}>
            <div className="row top" style={{ gap: 10 }}>
              <div className="icon-badge" style={{ background: "var(--blue-soft)", width: 34, height: 34 }}>
                <MessageCircleHeart size={17} color="var(--brand-deep)" />
              </div>
              <div className="col grow">
                <span className="title">AI 当前反馈</span>
                <span className="body">{lastAiReply ?? current.aiFeedback}</span>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleAiFeedback}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              {loading ? "请求中" : lastAiReply ? "再次反馈" : "请求反馈"}
            </button>
          </div>

          <div className="recommended-action">
            <div className="col grow">
              <span className="tiny">推荐干预</span>
              <strong>{intervention.title}</strong>
              <small>{intervention.reason}</small>
            </div>
            <button className="btn btn-primary" onClick={() => openSub(intervention.route, { ...(intervention.params ?? {}), actionId: intervention.id, actionTitle: intervention.title })}>
              开始 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
