import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CirclePlay, Eye, Clock, X, GraduationCap } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Reveal } from "../../components/ui";
import { eduCategories, eduVideos, eduVideoDesc } from "../../data/mock";

export default function EduScreen() {
  const [cat, setCat] = useState("全部");
  const [open, setOpen] = useState<(typeof eduVideos)[number] | null>(null);
  const list = cat === "全部" ? eduVideos : eduVideos.filter((v) => v.cat === cat);

  return (
    <SubScreen title="心理科普 · 短视频" headRight={<GraduationCap size={16} color="var(--brand)" />}>
      <Reveal i={0}>
        <div className="card tint-blue" style={{ gap: 8 }}>
          <span className="title">看见情绪，从「听得懂」开始</span>
          <span className="muted">{eduVideoDesc}</span>
        </div>
      </Reveal>

      <div className="cat-row">
        {eduCategories.map((c) => (
          <button key={c} className={`cat-chip${c === cat ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="col" style={{ gap: 12 }}>
        {list.map((v, i) => (
          <Reveal i={i} key={v.id}>
            <button className="video-card" onClick={() => setOpen(v)}>
              <div className={`video-thumb ${v.tone}`}>
                <span className="video-emoji">{v.emoji}</span>
                <span className="video-play"><CirclePlay size={26} color="#fff" fill="rgba(0,0,0,.18)" /></span>
                <span className="video-dur"><Clock size={10} /> {v.min}</span>
              </div>
              <div className="col grow" style={{ gap: 4, textAlign: "left" }}>
                <span className="body" style={{ fontWeight: 700, lineHeight: 1.4 }}>{v.title}</span>
                <span className="tiny">{v.author}</span>
                <span className="row" style={{ gap: 10 }}>
                  <span className="tiny"><Eye size={11} style={{ verticalAlign: "-1px" }} /> {v.views}</span>
                  <span className="chip" style={{ fontSize: 10, padding: "3px 8px" }}>#{v.cat}</span>
                </span>
              </div>
            </button>
          </Reveal>
        ))}
        {list.length === 0 && <span className="muted" style={{ textAlign: "center", padding: 16 }}>这个栏目还在更新中，先看看别的吧 🌿</span>}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="player-done-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="card video-modal" initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className={`video-thumb big ${open.tone}`}>
                <span style={{ fontSize: 52 }}>{open.emoji}</span>
                <button className="video-close" onClick={() => setOpen(null)} aria-label="关闭"><X size={16} /></button>
              </div>
              <span className="title">{open.title}</span>
              <span className="tiny">{open.author} · {open.views} 次播放 · {open.min}</span>
              <div className="track" style={{ marginTop: 4 }}><motion.i initial={{ width: "0%" }} animate={{ width: "38%" }} transition={{ duration: 1.2 }} style={{ background: "var(--grad-btn)" }} /></div>
              <span className="muted">演示用占位播放器——正式版接入 NeuroHeal 科普视频库 / B 站・抖音「智愈莘莘」官方矩阵。</span>
              <button className="btn btn-primary btn-block" onClick={() => setOpen(null)}>知道了</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SubScreen>
  );
}
