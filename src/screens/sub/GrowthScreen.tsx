import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Flame, CalendarCheck2, Lock, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import { checkinDays, checkinInfo, badges, weeklyReport } from "../../data/mock";

const RISK_STYLE: Record<string, { c: string; bg: string; t: string }> = {
  低: { c: "var(--teal-deep)", bg: "var(--teal-soft)", t: "心理状态平稳，无需特别关注" },
  中: { c: "var(--joy-deep)", bg: "var(--amber-soft)", t: "近期波动略大，建议增加放松训练" },
  高: { c: "var(--stress)", bg: "var(--pink-soft)", t: "建议尽快预约校心理中心老师" },
};

function MiniLine({ data, color, id }: { data: number[]; color: string; id: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: "100%", height: 40 }}>
      <ResponsiveContainer>
        <AreaChart data={d} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#${id})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GrowthScreen() {
  const [checkedToday, setCheckedToday] = useState(false);
  const set = new Set(checkinDays);
  if (checkedToday) set.add(checkinInfo.today);
  const cells = Array.from({ length: checkinInfo.totalDays }, (_, i) => i + 1);
  const r = RISK_STYLE[weeklyReport.risk];

  return (
    <SubScreen title="成长档案">
      {/* streak hero */}
      <Reveal i={0}>
        <div className="card hero g-purple">
          <div className="row between">
            <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>连续打卡</span>
            <Chip variant="glass"><Flame size={12} /> {checkinInfo.streak + (checkedToday ? 1 : 0)} 天</Chip>
          </div>
          <div className="row" style={{ gap: 14, alignItems: "baseline" }}>
            <span className="metric num">{checkinInfo.monthDone + (checkedToday ? 1 : 0)}</span>
            <span className="muted on-90">{checkinInfo.monthLabel}已打卡天数</span>
          </div>
          <span className="body on-90" style={{ fontSize: 12.5 }}>每一次「看见情绪」，都在让心理韧性更结实一点 🌱</span>
        </div>
      </Reveal>

      {/* calendar */}
      <Reveal i={1}>
        <div className="card">
          <div className="section-head">
            <span className="title">{checkinInfo.monthLabel}打卡日历</span>
            <span className="tiny">绿色为已打卡</span>
          </div>
          <div className="calendar">
            {["一", "二", "三", "四", "五", "六", "日"].map((w) => <span key={w} className="cal-w">{w}</span>)}
            {/* 简化：从周一开始排（示例 5/1 是周四 -> 前置 3 个空格）*/}
            {[0, 1, 2].map((k) => <span key={"pad" + k} />)}
            {cells.map((d) => {
              const on = set.has(d);
              const isToday = d === checkinInfo.today;
              return (
                <span key={d} className={`cal-d${on ? " on" : ""}${isToday ? " today" : ""}`}>{d}</span>
              );
            })}
          </div>
          <button className="btn btn-primary btn-block" disabled={checkedToday} style={checkedToday ? { opacity: 0.6 } : undefined} onClick={() => setCheckedToday(true)}>
            <CalendarCheck2 size={16} /> {checkedToday ? "今日已打卡 ✓" : "完成今日心情打卡"}
          </button>
        </div>
      </Reveal>

      {/* badges */}
      <Reveal i={2}>
        <div className="card">
          <div className="section-head">
            <span className="title">勋章墙</span>
            <span className="tiny">{badges.filter((b) => b.got).length} / {badges.length} 已点亮</span>
          </div>
          <div className="badge-grid">
            {badges.map((b) => (
              <div key={b.name} className={`badge${b.got ? "" : " locked"}`}>
                <div className="badge-emoji">{b.got ? b.emoji : <Lock size={18} color="var(--t-tertiary)" />}</div>
                <span className="badge-name">{b.name}</span>
                <span className="badge-desc">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* weekly report */}
      <Reveal i={3}>
        <div className="card">
          <div className="section-head">
            <span className="title">本周心理周报</span>
            <span className="tiny">{weeklyReport.range}</span>
          </div>
          <div className="report-trends">
            {[
              { label: "情绪指数", data: weeklyReport.mood, color: "var(--brand)", id: "g-mood" },
              { label: "专注度", data: weeklyReport.focus, color: "var(--focus)", id: "g-focus" },
              { label: "压力值", data: weeklyReport.stress, color: "var(--stress)", id: "g-stress" },
            ].map((t) => (
              <div className="report-trend" key={t.id}>
                <div className="row between">
                  <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.data[t.data.length - 1]}</span>
                </div>
                <MiniLine data={t.data} color={t.color} id={t.id} />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 10, background: r.bg, borderRadius: 12, padding: "10px 12px" }}>
            <ShieldCheck size={16} color={r.c} style={{ flex: "none" }} />
            <div className="col" style={{ gap: 1 }}>
              <span className="body" style={{ fontWeight: 700, color: r.c, fontSize: 13 }}>本周风险等级：{weeklyReport.risk}</span>
              <span className="tiny" style={{ color: r.c, opacity: 0.85 }}>{r.t}</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <TrendingUp size={15} color="var(--teal-deep)" style={{ flex: "none", marginTop: 2 }} />
            <span className="muted">{weeklyReport.summary}</span>
          </div>
        </div>
      </Reveal>

      <Reveal i={4}>
        <div className="card tint-blue" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Sparkles size={16} color="var(--brand-deep)" style={{ flex: "none" }} />
          <span className="muted">周报已同步到「学生心理健康数字档案」，仅你与你授权的辅导员/咨询师可见。</span>
        </div>
      </Reveal>
    </SubScreen>
  );
}
