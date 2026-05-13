import { Play, CircleCheck, Activity, Clock, Sparkles, Headphones } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import { useNav } from "../../nav";
import { prescriptions } from "../../data/mock";

export default function PrescriptionScreen({ id }: { id?: string }) {
  const { openSub } = useNav();
  const p = prescriptions.find((x) => x.id === id) ?? prescriptions[0];
  const done = p.chapters.filter((c) => c.done).length;
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
              <button className="chip" onClick={() => openSub("player", { from: p.title, chapter: c.name })}><Play size={11} /> 播放</button>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal i={3}>
        <div className="card tint-amber" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Sparkles size={16} color="var(--joy-deep)" style={{ flex: "none" }} />
          <span className="muted">完整跟完本套处方可获 <b style={{ color: "var(--joy-deep)" }}>+{p.reward} 心灵积分</b> 与「处方全勤」勋章。</span>
        </div>
      </Reveal>

      <Reveal i={4}>
        <button className="btn btn-primary btn-block" onClick={() => openSub("player", { from: p.title })}>
          <Play size={16} /> 开始今日训练
        </button>
      </Reveal>
    </SubScreen>
  );
}
