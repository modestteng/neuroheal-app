import { Play, ChevronRight, Sparkles, Flame, GraduationCap, Activity, Clock } from "lucide-react";
import { Chip, SectionHeader, Track, Reveal } from "../components/ui";
import { useNav } from "../nav";
import { nowPlaying, prescriptions, trainStats } from "../data/mock";

export default function TrainScreen() {
  const { openSub } = useNav();
  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">冥想与个性化干预</span>
            <span className="h1">为你定制的今日训练</span>
          </div>
          <Chip variant="amber"><Flame size={13} /> 连续 {trainStats.streak} 天</Chip>
        </div>
      </Reveal>

      {/* now playing hero -> 播放器 */}
      <Reveal i={1}>
        <div className="card hero g-purple">
          <span className="row between">
            <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>个性化干预方案 · 正在播放</span>
            <span className="chip glass live">AI 推荐</span>
          </span>
          <div className="row between">
            <div className="col grow">
              <span className="h2">{nowPlaying.title}</span>
              <span className="muted on-80">{nowPlaying.subtitle}</span>
            </div>
            <button
              onClick={() => openSub("player", { from: nowPlaying.title })}
              className="avatar"
              style={{ width: 52, height: 52, background: "rgba(255,255,255,.22)", color: "#fff" }}
              aria-label="播放"
            >
              <Play size={22} fill="#fff" />
            </button>
          </div>
          <Track pct={nowPlaying.progress * 100} color="#fff" onGlass />
          <div className="row between">
            <span className="tiny" style={{ color: "rgba(255,255,255,.8)" }}>1′48″ / 5′00″</span>
            <span className="tiny" style={{ color: "rgba(255,255,255,.8)" }}>完成可得 +{nowPlaying.reward} 心灵积分</span>
          </div>
          <button className="btn btn-white btn-block" onClick={() => openSub("player", { from: nowPlaying.title })}>继续训练 <ChevronRight size={16} /></button>
        </div>
      </Reveal>

      {/* 数字处方包 (4 大核心课程) */}
      <Reveal i={2}>
        <SectionHeader title="个性化数字处方包" link="全部处方" />
      </Reveal>
      {prescriptions.map((c, idx) => (
        <Reveal i={3 + idx} key={c.id}>
          <button className={`card ${c.tone}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }} onClick={() => openSub("prescription", { id: c.id })}>
            <div className="icon-badge shadow" style={{ background: "#fff", width: 48, height: 48, fontSize: 22 }}>{c.emoji}</div>
            <div className="col grow" style={{ gap: 3 }}>
              <span className="body" style={{ fontWeight: 700 }}>{c.title}</span>
              <span className="tiny" style={{ color: "var(--t-secondary)" }}>{c.subtitle}</span>
              <span className="row" style={{ gap: 10, marginTop: 1 }}>
                <span className="tiny"><Activity size={10} style={{ verticalAlign: "-1px" }} /> {c.band}</span>
                <span className="tiny"><Clock size={10} style={{ verticalAlign: "-1px" }} /> {c.minutes} 分钟</span>
              </span>
            </div>
            <div className="col" style={{ alignItems: "flex-end", gap: 6 }}>
              <Chip>{c.tag}</Chip>
              <ChevronRight size={16} color="var(--t-tertiary)" />
            </div>
          </button>
        </Reveal>
      ))}

      {/* 心理科普短视频入口 */}
      <Reveal i={7}>
        <button className="card tint-blue" style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }} onClick={() => openSub("edu")}>
          <div className="icon-badge shadow" style={{ background: "#fff", width: 44, height: 44 }}><GraduationCap size={20} color="var(--brand-deep)" /></div>
          <div className="col grow" style={{ gap: 2 }}>
            <span className="body" style={{ fontWeight: 700 }}>心理科普 · 短视频</span>
            <span className="tiny" style={{ color: "var(--t-secondary)" }}>焦虑 / 拖延 / 睡眠 / 人际…用听得懂的方式聊脑科学</span>
          </div>
          <ChevronRight size={16} color="var(--brand-deep)" />
        </button>
      </Reveal>

      {/* stats */}
      <Reveal i={8}>
        <div className="card">
          <SectionHeader title="本月训练成效" />
          <div className="row between" style={{ textAlign: "center" }}>
            <div className="col grow" style={{ alignItems: "center", gap: 2 }}>
              <span className="metric-sm num" style={{ color: "var(--teal-deep)" }}>{trainStats.monthCount}</span>
              <span className="tiny">次完成</span>
            </div>
            <span className="divider-v" />
            <div className="col grow" style={{ alignItems: "center", gap: 2 }}>
              <span className="metric-sm num" style={{ color: "var(--brand-deep)" }}>{trainStats.monthMinutes}</span>
              <span className="tiny">分钟累计</span>
            </div>
            <span className="divider-v" />
            <div className="col grow" style={{ alignItems: "center", gap: 2 }}>
              <span className="metric-sm num" style={{ color: "var(--purple-deep)" }}>↓{trainStats.stressDrop}%</span>
              <span className="tiny">平均压力</span>
            </div>
          </div>
          <span className="row" style={{ gap: 6, justifyContent: "center" }}>
            <Sparkles size={13} color="var(--joy-deep)" />
            <span className="tiny">坚持得越久，情绪基线越稳 ✨</span>
          </span>
        </div>
      </Reveal>
    </div>
  );
}
