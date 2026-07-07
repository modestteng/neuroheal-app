import { useMemo, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  CalendarCheck2,
  ChevronRight,
  Crown,
  Database,
  FileText,
  Flame,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Chip, Reveal, Segmented } from "../components/ui";
import {
  badges,
  checkinInfo,
  user,
} from "../data/mock";
import { useNav } from "../nav";
import { useValenceLoop, type EmotionRecord } from "../state/useValenceLoop";

const DAY_MS = 24 * 60 * 60 * 1000;

type TrendPoint = {
  key: string;
  label: string;
  score: number;
  count: number;
  lows: number;
  interventions: number;
};

type AdaptiveEffect = {
  action: string;
  avgDelta: number;
  count: number;
};

function dateKey(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateLabel(key: string) {
  const date = new Date(`${key}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatClock(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getLastSevenKeys() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today.getTime() - (6 - index) * DAY_MS);
    return dateKey(day);
  });
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRecentRecords(records: EmotionRecord[], days: number) {
  const since = Date.now() - days * DAY_MS;
  return records.filter((record) => new Date(record.timestamp).getTime() >= since);
}

function buildTrend(records: EmotionRecord[]): TrendPoint[] {
  return getLastSevenKeys().map((key) => {
    const dayRecords = records.filter((record) => dateKey(record.timestamp) === key);
    return {
      key,
      label: dateLabel(key),
      score: average(dayRecords.map((record) => record.score)),
      count: dayRecords.length,
      lows: dayRecords.filter((record) => record.level.includes("低")).length,
      interventions: dayRecords.filter((record) => record.source === "intervention").length,
    };
  });
}

function sourceLabel(record: EmotionRecord) {
  if (record.source === "intervention") return "干预后再监测";
  if (record.source === "checkin") return "心情打卡";
  return "实时监测";
}

function sourceTone(record: EmotionRecord) {
  if (record.source === "intervention") return "teal";
  if (record.level.includes("低")) return "amber";
  return "";
}

function buildAdaptiveProfile(records: EmotionRecord[], currentScore: number) {
  const scores = records.map((record) => record.score);
  const baseline = average(scores);
  const variance = scores.length > 0
    ? scores.reduce((sum, score) => sum + Math.pow(score - baseline, 2), 0) / scores.length
    : 0;
  const band = clamp(Math.round(Math.sqrt(variance) * 0.85), 6, 14);
  const stableLow = clamp(baseline - band, 0, 100);
  const stableHigh = clamp(baseline + band, 0, 100);
  const deviation = currentScore - baseline;
  const deviationLabel = deviation >= 0 ? `高于个人基线 +${deviation}` : `低于个人基线 ${deviation}`;
  const stateLabel = deviation <= -12
    ? "明显低于个人基线"
    : deviation <= -6
      ? "轻度低于个人基线"
      : deviation >= 10
        ? "高于个人稳定水平"
        : "处于个人稳定区间";

  const lowBuckets = records
    .filter((record) => record.level.includes("低"))
    .reduce<Record<string, number>>((bucket, record) => {
      const hour = new Date(record.timestamp).getHours();
      const start = Math.floor(hour / 2) * 2;
      const key = `${String(start).padStart(2, "0")}:00-${String(start + 2).padStart(2, "0")}:00`;
      bucket[key] = (bucket[key] ?? 0) + 1;
      return bucket;
    }, {});
  const lowPeriod = Object.entries(lowBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "暂无明显低谷";

  const effectMap = records
    .filter((record) => record.source === "intervention" && record.action && typeof record.delta === "number")
    .reduce<Record<string, { sum: number; count: number }>>((map, record) => {
      const action = record.action!;
      const current = map[action] ?? { sum: 0, count: 0 };
      map[action] = { sum: current.sum + (record.delta ?? 0), count: current.count + 1 };
      return map;
    }, {});
  const effects: AdaptiveEffect[] = Object.entries(effectMap)
    .map(([action, value]) => ({ action, avgDelta: Math.round(value.sum / value.count), count: value.count }))
    .sort((a, b) => b.avgDelta - a.avgDelta)
    .slice(0, 3);
  const best = effects[0];

  return {
    baseline,
    stableLow,
    stableHigh,
    deviation,
    deviationLabel,
    stateLabel,
    lowPeriod,
    effects,
    recommendation: best
      ? `优先推荐「${best.action}」：该用户历史平均回升 ${best.avgDelta} 分，匹配当前个人基线偏离。`
      : "当前干预样本较少，系统会继续记录不同训练后的回升效果，再动态调整推荐策略。",
  };
}

function buildWeeklyReport(records: EmotionRecord[], trend: TrendPoint[]) {
  const scores = records.map((record) => record.score);
  const avgScore = average(scores);
  const lowCount = records.filter((record) => record.level.includes("低")).length;
  const interventions = records.filter((record) => record.source === "intervention");
  const avgDelta = average(interventions.map((record) => record.delta ?? 0).filter((value) => value !== 0));
  const bestDay = trend.reduce((best, point) => point.score > best.score ? point : best, trend[0]);
  const waveDay = trend.reduce((worst, point) => {
    if (point.count === 0) return worst;
    if (worst.count === 0) return point;
    return point.score < worst.score ? point : worst;
  }, trend[0]);
  const risk = lowCount >= 8 ? "中" : "低";

  return {
    avgScore,
    lowCount,
    avgDelta,
    risk,
    summary: `本周平均 Valence 为 ${avgScore}，共记录 ${records.length} 条情绪轨迹；${waveDay.label} 出现较明显波动，${bestDay.label} 状态最稳定。`,
    suggestion: interventions.length > 0
      ? `已完成 ${interventions.length} 次干预闭环，平均回升 ${avgDelta} 分，建议继续保留呼吸训练和短时专注任务作为低效价时的首选调节。`
      : "本周暂未形成干预闭环，建议在出现较低效价时完成一次呼吸训练或 AI 陪伴，建立可复盘记录。",
  };
}

export default function CommunityScreen() {
  const { openSub } = useNav();
  const { current, emotionRecords, loopRecords } = useValenceLoop();
  const [analysisView, setAnalysisView] = useState("trajectory");
  const [reportGeneratedAt, setReportGeneratedAt] = useState(() => formatClock(new Date()));
  const ownedBadges = badges.filter((badge) => badge.got).slice(0, 4);

  const trendData = useMemo(() => buildTrend(emotionRecords), [emotionRecords]);
  const sevenDayRecords = useMemo(() => getRecentRecords(emotionRecords, 7), [emotionRecords]);
  const todayRecords = useMemo(() => {
    const today = dateKey(new Date());
    return emotionRecords
      .filter((record) => dateKey(record.timestamp) === today)
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [emotionRecords]);
  const interventionRecords = sevenDayRecords.filter((record) => record.source === "intervention");
  const positiveInterventions = interventionRecords.filter((record) => (record.delta ?? 0) > 0).length;
  const effectiveRate = interventionRecords.length > 0 ? Math.round((positiveInterventions / interventionRecords.length) * 100) : 0;
  const weeklyAvg = average(sevenDayRecords.map((record) => record.score));
  const weeklyReport = useMemo(() => buildWeeklyReport(sevenDayRecords, trendData), [sevenDayRecords, trendData]);
  const adaptiveProfile = useMemo(
    () => buildAdaptiveProfile(sevenDayRecords, current.score),
    [current.score, sevenDayRecords],
  );

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="col" style={{ gap: 3 }}>
          <span className="kicker">个人情绪轨迹 · 本地持久化</span>
          <span className="h1">个人记录</span>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-hero emotion-archive-hero">
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.68)", fontWeight: 700 }}>当前 Valence 状态</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{current.level}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.72)" }}>Valence {current.score} · {current.time}</span>
            </div>
            <Chip variant="glass"><Crown size={12} /> Lv.{user.level} · {user.levelName}</Chip>
          </div>

          <div className="hero-mini-stats">
            <div>
              <div className="tiny on-70" style={{ fontWeight: 700 }}>已归档轨迹</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{emotionRecords.length}</div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 700 }}>7 天均值</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{weeklyAvg}</div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 700 }}>干预有效率</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{effectiveRate}<span style={{ fontSize: 12, fontWeight: 700, opacity: .8 }}>%</span></div>
            </div>
          </div>

          <div className="emotion-proof-row">
            <span><Activity size={13} /> 能采集</span>
            <span><Database size={13} /> 能记录</span>
            <span><TrendingUp size={13} /> 能分析</span>
            <span><ShieldCheck size={13} /> 能复盘</span>
          </div>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card personal-analysis-card">
          <div className="section-head">
            <span className="title">个人档案分析</span>
            <Chip variant={analysisView === "adaptive" ? "purple" : "teal"}>
              {analysisView === "adaptive" ? <TrendingUp size={12} /> : <BarChart3 size={12} />}
              {analysisView === "adaptive" ? "个体自适应" : "情绪轨迹"}
            </Chip>
          </div>

          <Segmented
            items={[
              { key: "trajectory", label: "情绪轨迹" },
              { key: "adaptive", label: "自适应画像" },
            ]}
            value={analysisView}
            onChange={setAnalysisView}
          />

          {analysisView === "trajectory" ? (
            <div className="analysis-panel">
              <div className="emotion-chart compact">
                <ResponsiveContainer>
                  <AreaChart data={trendData} margin={{ top: 8, right: 2, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="emotionTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--hairline)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--t-tertiary)" }} />
                    <YAxis hide domain={[0, 100]} />
                    <Area type="monotone" dataKey="score" stroke="var(--brand)" strokeWidth={2.5} fill="url(#emotionTrendFill)" dot={{ r: 3, fill: "var(--brand)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="emotion-day-strip compact">
                {trendData.map((point) => (
                  <div className="emotion-day-pill" key={point.key}>
                    <strong>{point.score || "-"}</strong>
                    <span>{point.label}</span>
                    <small>{point.interventions > 0 ? `${point.interventions} 次干预` : `${point.count} 条`}</small>
                  </div>
                ))}
              </div>

              <div className="analysis-subgrid">
                <div className="analysis-subcard">
                  <div className="section-head">
                    <span className="title">今日时间线</span>
                    <span className="tiny">{todayRecords.length} 条</span>
                  </div>
                  {todayRecords.length === 0 ? (
                    <div className="compact-empty">
                      <RefreshCw size={17} color="var(--brand-deep)" />
                      <span>等待下一次监测写入</span>
                    </div>
                  ) : (
                    <div className="compact-record-list">
                      {todayRecords.slice(0, 3).map((record) => (
                        <div className="compact-record-row" key={record.id}>
                          <div>
                            <strong>{formatClock(record.timestamp)} · {record.score}</strong>
                            <span>{record.action ?? sourceLabel(record)}</span>
                          </div>
                          <Chip variant={sourceTone(record)}>{record.level}</Chip>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="analysis-subcard">
                  <div className="section-head">
                    <span className="title">干预闭环</span>
                    <span className="tiny">{loopRecords.length} 条</span>
                  </div>
                  <div className="compact-loop-list">
                    {loopRecords.slice(0, 2).map((record) => (
                      <div className="compact-loop-item" key={record.id}>
                        <span>{record.action}</span>
                        <strong className={record.delta >= 0 ? "up" : "down"}>{record.delta >= 0 ? "+" : ""}{record.delta}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analysis-report-card">
                <FileText size={16} color="var(--brand-deep)" style={{ flex: "none", marginTop: 2 }} />
                <div className="col grow" style={{ gap: 4 }}>
                  <span>{weeklyReport.summary}{weeklyReport.suggestion}</span>
                  <div className="row between" style={{ gap: 8 }}>
                    <small>生成时间 {reportGeneratedAt}</small>
                    <button className="link" onClick={() => setReportGeneratedAt(formatClock(new Date()))}>重新生成</button>
                  </div>
                </div>
              </div>

              <div className="privacy-scope-grid compact">
                <div>
                  <ShieldCheck size={15} color="var(--teal-deep)" />
                  <span>可授权老师查看趋势摘要</span>
                </div>
                <div>
                  <LockKeyhole size={15} color="var(--joy-deep)" />
                  <span>不共享原始 EEG 和聊天原文</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="analysis-panel">
              <div className="adaptive-baseline-grid">
                <div>
                  <span>近 7 天个人基线</span>
                  <strong>{adaptiveProfile.baseline}</strong>
                  <small>不是全体统一阈值</small>
                </div>
                <div>
                  <span>个人稳定区间</span>
                  <strong>{adaptiveProfile.stableLow}-{adaptiveProfile.stableHigh}</strong>
                  <small>由历史波动自动生成</small>
                </div>
                <div>
                  <span>常见低谷时段</span>
                  <strong>{adaptiveProfile.lowPeriod}</strong>
                  <small>按低效价记录聚合</small>
                </div>
              </div>

              <div className="adaptive-deviation-panel">
                <div className="adaptive-score-ring">
                  <span>当前</span>
                  <strong>{current.score}</strong>
                </div>
                <div className="col grow" style={{ gap: 5 }}>
                  <div className="row between">
                    <span className="body" style={{ fontWeight: 800 }}>{adaptiveProfile.stateLabel}</span>
                    <span className={`adaptive-delta ${adaptiveProfile.deviation < 0 ? "down" : "up"}`}>
                      {adaptiveProfile.deviationLabel}
                    </span>
                  </div>
                  <span className="muted">同样的 Valence 分数会结合该学生自己的基线判断，避免“一把尺子量所有人”。</span>
                </div>
              </div>

              <div className="adaptive-effect-list">
                {adaptiveProfile.effects.length > 0 ? adaptiveProfile.effects.map((effect, index) => (
                  <div className="adaptive-effect-card" key={effect.action}>
                    <span>#{index + 1} 干预响应</span>
                    <strong>{effect.action}</strong>
                    <small>平均回升 +{effect.avgDelta} · {effect.count} 次样本</small>
                  </div>
                )) : (
                  <div className="adaptive-effect-card empty">
                    <span>干预响应</span>
                    <strong>继续采样中</strong>
                    <small>完成干预后自动形成排行</small>
                  </div>
                )}
              </div>

              <div className="adaptive-recommend-note">
                <ShieldCheck size={16} color="var(--teal-deep)" style={{ flex: "none", marginTop: 2 }} />
                <span>{adaptiveProfile.recommendation}</span>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      <Reveal i={3}>
        <div className="card">
          <div className="section-head">
            <span className="title">成长档案 · 本月概览</span>
            <button className="link" onClick={() => openSub("growth")}>查看全部 <ChevronRight size={13} /></button>
          </div>
          <div className="growth-grid">
            <div className="growth-stat">
              <Flame size={16} color="var(--stress)" />
              <strong>{checkinInfo.streak}</strong>
              <span>连续打卡天</span>
            </div>
            <div className="growth-stat">
              <Trophy size={16} color="var(--joy-deep)" />
              <strong>{checkinInfo.monthDone}/{checkinInfo.totalDays}</strong>
              <span>本月打卡</span>
            </div>
            <div className="growth-stat">
              <Award size={16} color="var(--purple-deep)" />
              <strong>{ownedBadges.length}/{badges.length}</strong>
              <span>已获勋章</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => openSub("growth")}>
            <CalendarCheck2 size={15} /> 打开成长档案
          </button>
        </div>
      </Reveal>
    </div>
  );
}
