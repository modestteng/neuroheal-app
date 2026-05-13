import { useMemo, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { myRank } from "../../data/mock";
import { buildLeaderboard } from "../../lib/leaderboard";

export default function LeaderboardScreen() {
  const [seed, setSeed] = useState(() => Date.now());
  const ranking = useMemo(() => buildLeaderboard(seed), [seed]);

  return (
    <SubScreen
      title="校园专注力完整榜单"
      headRight={
        <button className="sub-icon-btn" onClick={() => setSeed(Date.now())} aria-label="刷新榜单">
          <RefreshCw size={16} color="var(--brand-deep)" />
        </button>
      }
    >
      <div className="card leaderboard-hero">
        <div className="row between">
          <div className="col" style={{ gap: 4 }}>
            <span className="kicker">本周动态排名</span>
            <span className="h2">分值会有轻微浮动</span>
          </div>
          <div className="icon-badge shadow" style={{ background: "#fff", width: 48, height: 48 }}>
            <Trophy size={21} color="var(--joy-deep)" />
          </div>
        </div>
        <span className="muted">榜单按当前专注力积分重新排序，轻微波动用于模拟周内实时变化。</span>
      </div>

      <div className="card leaderboard-group">
        <div className="section-head">
          <span className="title">学院总榜</span>
          <span className="tiny">{ranking.length} 个学院</span>
        </div>
        {ranking.map((entry) => {
          const currentUser = entry.id === myRank.id;
          return (
            <div className={`leaderboard-full-row${currentUser ? " me" : ""}`} key={entry.id}>
              <div className="leaderboard-rank num">{entry.rank}</div>
              <div className="col grow" style={{ gap: 2 }}>
                <span className="body" style={{ fontWeight: 700 }}>{entry.faculty}</span>
                <span className="tiny">{currentUser ? "唐同学所在学院" : entry.alias} · 专注力积分</span>
              </div>
              <div className="col" style={{ alignItems: "flex-end", gap: 2 }}>
                <span className="body num" style={{ fontWeight: 700, color: "var(--brand-deep)" }}>{entry.score.toLocaleString()}</span>
                <span className={`leaderboard-delta${entry.delta >= 0 ? " up" : " down"}`}>
                  {entry.delta >= 0 ? "+" : ""}{entry.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SubScreen>
  );
}
