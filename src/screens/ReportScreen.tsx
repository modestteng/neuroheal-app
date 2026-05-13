import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BellRing,
  Brain,
  CalendarDays,
  ChevronRight,
  FileDown,
  MessageCircleHeart,
  Wind,
} from "lucide-react";
import { SectionHeader, Segmented, Reveal, useCountUp } from "../components/ui";
import { useNav } from "../nav";
import { eegTrend, moodCurve, reportStats, aiInterpretation } from "../data/mock";

const RANGES = [
  { key: "day", label: "今日" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
];

export default function ReportScreen() {
  const { openSub } = useNav();
  const [range, setRange] = useState("day");
  const [reminderSet, setReminderSet] = useState(false);
  const focusN = useCountUp(reportStats.focusMinutes, 900, [range]);

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="col" style={{ gap: 3 }}>
          <span className="kicker">脑电数据报告</span>
          <span className="h1">今日 · 状态总览</span>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-teal-blue" style={{ gap: 14, padding: 18 }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="col">
              <span className="tiny on-70" style={{ fontWeight: 600 }}>平均情绪指数</span>
              <span className="num" style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
                {reportStats.avgMood} <span style={{ fontSize: 13 }}>↑{reportStats.moodDelta}</span>
              </span>
            </div>
            <span className="divider-v" style={{ background: "rgba(255,255,255,.3)" }} />
            <div className="col">
              <span className="tiny on-70" style={{ fontWeight: 600 }}>今日专注时长</span>
              <span className="num" style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
                {focusN}<span style={{ fontSize: 13 }}> 分钟</span>
              </span>
            </div>
            <span className="divider-v" style={{ background: "rgba(255,255,255,.3)" }} />
            <div className="col">
              <span className="tiny on-70" style={{ fontWeight: 600 }}>平静占比</span>
              <span className="num" style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{reportStats.calmShare}%</span>
            </div>
          </div>
          <span className="body on-90" style={{ fontSize: 12.5 }}>较昨日专注 +8 分钟，情绪平稳偏积极。</span>
        </div>
      </Reveal>

      <Reveal i={2}>
        <Segmented items={RANGES} value={range} onChange={setRange} />
      </Reveal>

      {/* EEG bands trend */}
      <Reveal i={3}>
        <div className="card">
          <SectionHeader title="脑波频段趋势" link="原始数据" />
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={eegTrend} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10.5, fill: "var(--t-tertiary)" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10.5, fill: "var(--t-tertiary)" }} axisLine={false} tickLine={false} width={32} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="Alpha" stroke="var(--teal)" strokeWidth={2.6} dot={false} />
                <Line type="monotone" dataKey="Beta" stroke="var(--focus)" strokeWidth={2.6} dot={false} />
                <Line type="monotone" dataKey="Theta" stroke="var(--purple)" strokeWidth={2.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            <span><i className="dot" style={{ background: "var(--teal)" }} />Alpha 波 · 放松</span>
            <span><i className="dot" style={{ background: "var(--focus)" }} />Beta 波 · 专注</span>
            <span><i className="dot" style={{ background: "var(--purple)" }} />Theta 波 · 想象</span>
          </div>
        </div>
      </Reveal>

      {/* mood curve */}
      <Reveal i={4}>
        <div className="card">
          <SectionHeader title="情绪波动曲线" link="按日对比" />
          <div className="chart-box" style={{ height: 140 }}>
            <ResponsiveContainer>
              <AreaChart data={moodCurve} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10.5, fill: "var(--t-tertiary)" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10.5, fill: "var(--t-tertiary)" }} axisLine={false} tickLine={false} width={32} domain={[40, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="mood" stroke="var(--brand-deep)" strokeWidth={2.6} fill="url(#moodGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span className="tiny">情绪指数（0–100）· 下午 14:00 前后出现轻度回落</span>
        </div>
      </Reveal>

      {/* AI interpretation */}
      <Reveal i={5}>
        <div className="card tint-blue report-ai-card">
          <div className="row top" style={{ gap: 12 }}>
            <div className="icon-badge" style={{ background: "#fff", borderRadius: 999, width: 44, height: 44 }}>
              <Brain size={20} color="var(--brand-deep)" />
            </div>
            <div className="col grow">
              <div className="row between report-ai-title-row">
                <span className="body" style={{ fontWeight: 700 }}>{aiInterpretation.title}</span>
                <span className="report-risk-pill">轻度波动</span>
              </div>
              <span className="muted">{aiInterpretation.text}</span>
            </div>
          </div>

          <div className="report-insight-grid">
            <div className="report-insight">
              <span>情绪拐点</span>
              <strong>14:00</strong>
              <em>轻度回落</em>
            </div>
            <div className="report-insight">
              <span>压力信号</span>
              <strong>Beta +12%</strong>
              <em>课程期更明显</em>
            </div>
            <div className="report-insight">
              <span>可恢复性</span>
              <strong>8 分钟</strong>
              <em>适合短训练</em>
            </div>
          </div>

          <div className="report-action-grid">
            <button className="report-action primary" onClick={() => openSub("aichat")}>
              <MessageCircleHeart size={18} />
              <span>
                <strong>找小愈聊聊</strong>
                <small>先说说 14:00 前后的压力</small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button className="report-action" onClick={() => openSub("player", { from: "4-7-8 呼吸训练" })}>
              <Wind size={18} />
              <span>
                <strong>开始呼吸训练</strong>
                <small>做一次 4-7-8 调节</small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button className="report-action" onClick={() => setReminderSet(true)}>
              <BellRing size={18} />
              <span>
                <strong>{reminderSet ? "今晚提醒已设好" : "设睡前提醒"}</strong>
                <small>{reminderSet ? "22:30 做放松收尾" : "防止压力延续到夜里"}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          </div>

          {reminderSet && <div className="report-reminder-note">今晚 22:30 的放松提醒已加入本页演示状态。</div>}

          <div className="row report-ai-footer" style={{ gap: 10 }}>
            <button className="btn btn-ghost grow" onClick={() => openSub("report-export")}><FileDown size={15} />导出 PDF</button>
            <button className="btn btn-primary grow" onClick={() => openSub("report-share")}>分享给咨询师 <ChevronRight size={15} /></button>
          </div>
        </div>
      </Reveal>

      <Reveal i={6}>
        <button className="card tint-blue" style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }} onClick={() => openSub("growth")}>
          <div className="icon-badge shadow" style={{ background: "#fff", width: 40, height: 40 }}><CalendarDays size={18} color="var(--brand-deep)" /></div>
          <div className="col grow" style={{ gap: 2 }}>
            <span className="body" style={{ fontWeight: 700 }}>本周心理周报 · 成长档案</span>
            <span className="tiny" style={{ color: "var(--t-secondary)" }}>打卡日历 / 勋章墙 / 三维趋势 / 风险等级</span>
          </div>
          <ChevronRight size={16} color="var(--brand-deep)" />
        </button>
      </Reveal>
    </div>
  );
}
