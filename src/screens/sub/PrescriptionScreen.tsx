import { Play, CircleCheck, Activity, Clock, Sparkles, Headphones } from "lucide-react";
import { useMemo, useState } from "react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import { useNav } from "../../nav";
import { prescriptions } from "../../data/mock";

const focusGoals = [
  "数学错题整理 15 分钟",
  "英语阅读精读 1 篇",
  "政治知识点背诵 20 个",
];

export default function PrescriptionScreen({ id }: { id?: string }) {
  const { openSub } = useNav();
  const p = prescriptions.find((x) => x.id === id) ?? prescriptions[0];
  const isFocusPrescription = p.id === "p1";
  const [selectedGoal, setSelectedGoal] = useState(focusGoals[0]);
  const todayGoalOptions = useMemo(() => focusGoals, []);
  const done = p.chapters.filter((c) => c.done).length;

  const playChapter = (chapter: typeof p.chapters[number]) => {
    if (chapter.videoUrl) {
      window.open(chapter.videoUrl, "_blank", "noopener,noreferrer");
      return;
    }

    openSub("player", { from: p.title, chapter: chapter.name, actionId: "prescription-focus", actionTitle: p.title });
  };

  const startTodayTraining = () => {
    if (isFocusPrescription) {
      openSub("focusSession", { title: p.title, goal: selectedGoal });
      return;
    }

    openSub("player", { from: p.title, actionId: "prescription-focus", actionTitle: p.title });
  };

  return (
    <SubScreen title="个性化数字处方">
      <Reveal i={0}>
        <div className={`card ${p.tone}`} style={{ gap: 14 }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="icon-badge shadow" style={{ width: 56, height: 56, background: "#fff", fontSize: 28 }}>{p.emoji}</div>
            <div className="col grow">
              <span className="h1">{p.title}</span>
              <span className="muted">{p.subtitle}</span>
            </div>
          </div>
          <div className="pill-row">
            <Chip variant="solid-blue">{p.tag}</Chip>
            <Chip><Activity size={12} /> {p.band}</Chip>
            <Chip><Clock size={12} /> {p.minutes} 分钟/次</Chip>
            <Chip><Headphones size={12} /> {p.sessions} 节</Chip>
          </div>
        </div>
      </Reveal>

      {isFocusPrescription && (
        <Reveal i={1}>
          <div className="card focus-goal-card">
            <div className="section-head">
              <span className="title">今日学习目标</span>
              <span className="tiny">用于训练后复盘</span>
            </div>
            <div className="focus-goal-options">
              {todayGoalOptions.map((goal) => (
                <button
                  key={goal}
                  className={goal === selectedGoal ? "active" : ""}
                  onClick={() => setSelectedGoal(goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal i={1}>
        <div className="card">
          <span className="title">这套处方为谁而设</span>
          <span className="body" style={{ color: "var(--brand-deep)", fontWeight: 600 }}>{p.forWho}</span>
          <span className="muted">{p.desc}</span>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card">
          <div className="section-head">
            <span className="title">课程章节</span>
            <span className="tiny">{done} / {p.chapters.length} 已完成</span>
          </div>
          {p.chapters.map((c, idx) => (
            <div className="list-row" key={c.name}>
              {c.done
                ? <CircleCheck size={20} color="var(--calm)" style={{ flex: "none" }} />
                : <div className="icon-badge" style={{ width: 26, height: 26, borderRadius: 999, background: "var(--blue-soft)", fontSize: 11, fontWeight: 700, color: "var(--brand-deep)" }}>{idx + 1}</div>}
              <div className="col grow"><span className="body" style={{ fontWeight: 600 }}>{c.name}</span><span className="tiny">{c.min} 分钟</span></div>
              <button className="chip" onClick={() => playChapter(c)}><Play size={11} /> {c.videoUrl ? "B站" : "播放"}</button>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal i={3}>
        <div className="card tint-amber" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Sparkles size={16} color="var(--joy-deep)" style={{ flex: "none" }} />
          <span className="muted">完整跟完本套处方将解锁 <b style={{ color: "var(--joy-deep)" }}>「处方全勤」勋章</b>，并自动写入成长档案。</span>
        </div>
      </Reveal>

      <Reveal i={4}>
        <button className="btn btn-primary btn-block" onClick={startTodayTraining}>
          <Play size={16} /> {isFocusPrescription ? "开始番茄专注" : "开始今日训练"}
        </button>
      </Reveal>
    </SubScreen>
  );
}
