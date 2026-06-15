import {
  Award,
  CalendarCheck2,
  ChevronRight,
  Crown,
  Flame,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { Chip, Reveal } from "../components/ui";
import {
  badges,
  checkinInfo,
  user,
} from "../data/mock";
import { useNav } from "../nav";
import { useValenceLoop } from "../state/useValenceLoop";

export default function CommunityScreen() {
  const { openSub } = useNav();
  const { current, loopRecords } = useValenceLoop();
  const completedLoops = loopRecords.filter((record) => record.status === "已完成").length;
  const ownedBadges = badges.filter((badge) => badge.got).slice(0, 4);
  const checkinPct = Math.round((checkinInfo.monthDone / checkinInfo.totalDays) * 100);

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="col" style={{ gap: 3 }}>
          <span className="kicker">闭环记录 · 成长归档</span>
          <span className="h1">个人记录</span>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-hero" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", fontWeight: 600, letterSpacing: ".4px", textTransform: "uppercase" }}>当前 Valence 状态</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{current.level}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.68)" }}>Valence {current.score} · {current.time}</span>
            </div>
            <Chip variant="glass"><Crown size={12} /> Lv.{user.level} · {user.levelName}</Chip>
          </div>
          <div className="hero-mini-stats">
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>闭环完成</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{completedLoops}</div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>连续打卡</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{checkinInfo.streak}<span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>天</span></div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>本月完成率</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{checkinPct}<span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>%</span></div>
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,.22)" }}>
            <div style={{ height: "100%", borderRadius: 999, background: "#fff", width: `${checkinPct}%`, opacity: .85 }} />
          </div>
          <button
            className="btn"
            style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.28)", backdropFilter: "blur(6px)" }}
            onClick={() => openSub("growth")}
          >
            <CalendarCheck2 size={15} /> 打开成长档案
          </button>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card">
          <div className="section-head">
            <span className="title">闭环记录时间轴</span>
            <span className="tiny">{loopRecords.length} 条记录</span>
          </div>
          {loopRecords.length === 0 ? (
            <div className="col" style={{ alignItems: "center", gap: 8, padding: "20px 0 8px", textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCw size={20} color="var(--brand-deep)" />
              </div>
              <span className="body" style={{ fontWeight: 700, color: "var(--t-secondary)" }}>暂无闭环记录</span>
              <span className="tiny" style={{ color: "var(--t-tertiary)", maxWidth: 220 }}>完成一次干预训练后，前后 Valence 对比将显示在这里</span>
            </div>
          ) : (
            <div className="loop-timeline">
              {loopRecords.map((record) => {
                const isPositive = record.delta >= 0;
                return (
                  <div className="loop-timeline-row" key={record.id}>
                    <div className="loop-timeline-dot" data-status={record.status} />
                    <div className="loop-timeline-body">
                      <div className="row between">
                        <span className="body" style={{ fontWeight: 700 }}>{record.startTime} · {record.action}</span>
                        <span className={`loop-delta ${isPositive ? "up" : "down"}`}>
                          {isPositive ? "+" : ""}{record.delta}
                        </span>
                      </div>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <Chip variant={record.beforeLevel.includes("低") ? "amber" : "teal"}>
                          干预前 {record.beforeLevel} · {record.beforeScore}
                        </Chip>
                        <ChevronRight size={13} color="var(--t-tertiary)" />
                        <Chip variant={record.afterLevel.includes("低") ? "amber" : "teal"}>
                          干预后 {record.afterLevel} · {record.afterScore}
                        </Chip>
                        <span className="chip" style={{ background: record.status === "已完成" ? "var(--teal-soft)" : "var(--blue-soft)", color: record.status === "已完成" ? "var(--teal-deep)" : "var(--brand-deep)" }}>{record.status}</span>
                      </div>
                      <span className="muted">{record.aiMessage}</span>
                    </div>
                  </div>
                );
              })}
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
        </div>
      </Reveal>
    </div>
  );
}
