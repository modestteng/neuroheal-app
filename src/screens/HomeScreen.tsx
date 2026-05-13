import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Bluetooth, Wind, ChevronRight, Activity, Sparkles } from "lucide-react";
import { Chip, GaugeRing, MetricCard, Reveal, useCountUp } from "../components/ui";
import { useNav } from "../nav";
import { user, device, todayMood, homeMetrics, todaySuggestion, eegLive } from "../data/mock";

function HeroMiniStat({ label, value, suffix = "%", note }: { label: string; value: number; suffix?: string; note?: string }) {
  const n = useCountUp(value, 900);
  return (
    <div>
      <div className="tiny on-70" style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 3 }}>
        <span className="num" style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>{n}{suffix}</span>
        {note && <span className="tiny" style={{ color: "rgba(255,255,255,.85)", fontWeight: 600 }}>{note}</span>}
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const { openSub } = useNav();
  const moodN = useCountUp(todayMood.moodIndex, 1100);
  return (
    <div className="screen">
      {/* header */}
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 4 }}>
            <span className="tiny" style={{ fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--brand-deep)" }}>NeuroHeal · AI 实时陪伴中</span>
            <span className="h1">{user.greeting}</span>
          </div>
          <button
            className="avatar ring home-profile-avatar"
            style={{ width: 44, height: 44 }}
            onClick={() => openSub("profile")}
            aria-label="查看个人资料"
          >
            <img src={user.avatar} alt={`${user.name}头像`} />
          </button>
        </div>
      </Reveal>

      {/* device status -> 设备页 */}
      <Reveal i={1}>
        <button className="card tint-teal" style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: "12px 14px", width: "100%", textAlign: "left" }} onClick={() => openSub("device")}>
          <div className="icon-badge shadow" style={{ background: "#fff", width: 34, height: 34, borderRadius: 999 }}>
            <Bluetooth size={16} color="var(--teal-deep)" />
          </div>
          <div className="col grow" style={{ gap: 1 }}>
            <span className="body" style={{ fontWeight: 700, fontSize: 13 }}>{device.name} 已连接</span>
            <span className="tiny">信号良好 · 采样 256Hz · 电量 {device.battery}%</span>
          </div>
          <span className="chip teal live">实时</span>
          <ChevronRight size={16} color="var(--teal-deep)" />
        </button>
      </Reveal>

      {/* hero gauge */}
      <Reveal i={2}>
        <div className="card hero g-hero">
          <div className="row between">
            <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>今日情绪状态</span>
            <Chip variant="glass">情绪平稳 · {todayMood.status}</Chip>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "2px 0 4px" }}>
            <GaugeRing value={todayMood.moodIndex} size={176}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>😌</span>
              <span className="num" style={{ fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: -1 }}>{moodN}</span>
              <span className="tiny on-90" style={{ fontWeight: 600, fontSize: 11 }}>综合情绪指数</span>
            </GaugeRing>
          </div>
          <span className="body" style={{ textAlign: "center", color: "rgba(255,255,255,.94)", fontSize: 13 }}>{todayMood.caption}</span>
          <div className="hero-mini-stats">
            <HeroMiniStat label="放松度" value={todayMood.relax} />
            <HeroMiniStat label="专注度" value={todayMood.focus} />
            <HeroMiniStat label="压力值" value={todayMood.stress} note="偏低" />
          </div>
        </div>
      </Reveal>

      {/* 7-day trend mini cards */}
      <Reveal i={3}><span className="kicker">近 7 日趋势</span></Reveal>
      <div className="row" style={{ gap: 10, alignItems: "stretch" }}>
        {homeMetrics.map((m, idx) => (
          <MetricCard key={m.key} i={4 + idx} label={m.label} value={m.value} note={"note" in m ? (m as { note?: string }).note : undefined} color={m.color} trend={[...m.trend]} />
        ))}
      </div>

      {/* live EEG */}
      <Reveal i={7}>
        <div className="card">
          <div className="row between">
            <span className="row" style={{ gap: 8 }}>
              <span className="icon-badge" style={{ width: 28, height: 28, borderRadius: 9, background: "var(--blue-soft)" }}><Activity size={15} color="var(--brand)" /></span>
              <span className="title">实时脑波 EEG</span>
            </span>
            <Chip variant="teal">α 波占优 · 放松态</Chip>
          </div>
          <div className="chart-box sm">
            <ResponsiveContainer>
              <AreaChart data={eegLive} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="eegGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="var(--brand)" strokeWidth={2.4} fill="url(#eegGrad)" isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span className="tiny">θ 4Hz · α 10Hz · β 18Hz · 持续监测中</span>
        </div>
      </Reveal>

      {/* today suggestion */}
      <Reveal i={8}>
        <div className="card tint-blue">
          <div className="row top" style={{ gap: 12 }}>
            <div className="icon-badge shadow" style={{ background: "#fff", borderRadius: 999, width: 44, height: 44 }}>
              <Wind size={20} color="var(--brand-deep)" />
            </div>
            <div className="col grow">
              <span className="row" style={{ gap: 6 }}>
                <span className="body" style={{ fontWeight: 700 }}>今日个性化建议</span>
                <Sparkles size={13} color="var(--joy-deep)" />
              </span>
              <span className="muted">{todaySuggestion.title}——{todaySuggestion.desc}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => openSub("player", { from: todaySuggestion.title })}>
            开始 {todaySuggestion.duration} 训练 <ChevronRight size={16} />
          </button>
        </div>
      </Reveal>
    </div>
  );
}
