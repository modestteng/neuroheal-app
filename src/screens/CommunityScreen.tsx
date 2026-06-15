import {
  Award,
  Bell,
  CalendarCheck2,
  ChevronRight,
  Crown,
  Flame,
  Trophy,
} from "lucide-react";
import { Chip, Reveal, Track } from "../components/ui";
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
        <div className="row between">
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">闭环记录 · 成长归档</span>
            <span className="h1">个人记录</span>
          </div>
          <button
            className="avatar notice-trigger"
            style={{ width: 38, height: 38, background: "#fff", boxShadow: "var(--shadow-soft)" }}
            aria-label="成长档案"
            onClick={() => openSub("growth")}
          >
            <Bell size={17} color="var(--brand-deep)" />
          </button>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card record-hero">
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="col">
              <span className="tiny">当前 Valence 状态</span>
              <span className="title">{current.level} · Valence {current.score}</span>
              <span className="muted">已完成 {completedLoops} 次闭环反馈 · 连续打卡 {checkinInfo.streak} 天</span>
            </div>
            <Chip variant="teal"><Crown size={12} /> Lv.{user.level} · {user.levelName}</Chip>
          </div>
          <Track pct={checkinPct} color="var(--teal)" />
          <button className="btn btn-primary" onClick={() => openSub("growth")}><CalendarCheck2 size={15} /> 打开成长档案</button>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card">
          <div className="section-head">
            <span className="title">闭环记录时间轴</span>
          </div>
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
