import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X, Sparkles, RotateCw, Volume2 } from "lucide-react";
import { useNav } from "../../nav";
import { breathPlayer } from "../../data/mock";

type Phase = "inhale" | "hold" | "exhale";
const LABEL: Record<Phase, string> = { inhale: "吸 气", hold: "屏 息", exhale: "呼 气" };
const SEQ: [Phase, number][] = [["inhale", 4000], ["hold", 7000], ["exhale", 8000]];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function PlayerScreen({ from }: { from?: string }) {
  const { closeSub } = useNav();
  const total = breathPlayer.totalSec;
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const phaseIdx = useRef(0);

  // progress (accelerated for demo: ~22s to finish)
  useEffect(() => {
    if (!playing || done) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const n = e + total * 0.011;
        if (n >= total) { setDone(true); return total; }
        return n;
      });
    }, 240);
    return () => clearInterval(id);
  }, [playing, done, total]);

  // breathing phase cycle (real 4-7-8 timing)
  useEffect(() => {
    if (!playing || done) return;
    let timer: number;
    const run = () => {
      setPhase(SEQ[phaseIdx.current][0]);
      timer = window.setTimeout(() => {
        phaseIdx.current = (phaseIdx.current + 1) % SEQ.length;
        run();
      }, SEQ[phaseIdx.current][1]);
    };
    run();
    return () => clearTimeout(timer);
  }, [playing, done]);

  const relax = Math.round(62 + 26 * (elapsed / total));
  const scale = phase === "inhale" ? 1.18 : phase === "exhale" ? 0.72 : 1.18;
  const dur = phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.2;

  const restart = () => { setElapsed(0); setDone(false); setPlaying(true); phaseIdx.current = 0; };

  return (
    <div className="sub-screen player-screen">
      <div className="sub-header" style={{ background: "transparent", borderBottom: "none" }}>
        <button className="sub-back" onClick={closeSub} aria-label="关闭"><X size={20} color="var(--t-primary)" /></button>
        <span className="sub-title">{from ?? breathPlayer.title}</span>
        <div className="sub-head-right"><Volume2 size={18} color="var(--t-tertiary)" /></div>
      </div>

      <div className="player-body">
        <span className="kicker" style={{ textAlign: "center" }}>{breathPlayer.subtitle}</span>

        <div className="breath-wrap">
          <motion.span className="breath-ring r1" animate={{ scale, opacity: phase === "exhale" ? 0.3 : 0.55 }} transition={{ duration: dur, ease: "easeInOut" }} />
          <motion.span className="breath-ring r2" animate={{ scale: scale * 0.86 }} transition={{ duration: dur, ease: "easeInOut" }} />
          <motion.div className="breath-core" animate={{ scale: scale * 0.72 }} transition={{ duration: dur, ease: "easeInOut" }}>
            <span className="breath-label">{LABEL[phase]}</span>
          </motion.div>
        </div>

        <div className="player-stats">
          <div className="col" style={{ alignItems: "center", gap: 2 }}>
            <span className="tiny">已练习</span>
            <span className="num metric-sm" style={{ color: "var(--brand-deep)" }}>{fmt(elapsed)}</span>
          </div>
          <span className="divider-v" />
          <div className="col" style={{ alignItems: "center", gap: 2 }}>
            <span className="tiny">实时放松度</span>
            <span className="num metric-sm" style={{ color: "var(--teal-deep)" }}>{relax}%</span>
          </div>
          <span className="divider-v" />
          <div className="col" style={{ alignItems: "center", gap: 2 }}>
            <span className="tiny">总时长</span>
            <span className="num metric-sm" style={{ color: "var(--t-secondary)" }}>{fmt(total)}</span>
          </div>
        </div>

        <div className="track" style={{ width: "100%", maxWidth: 300 }}>
          <i style={{ width: `${(elapsed / total) * 100}%`, background: "var(--grad-btn)" }} />
        </div>

        <div className="row" style={{ gap: 16, marginTop: 4 }}>
          <button className="player-btn ghost" onClick={restart}><RotateCw size={18} /></button>
          <button className="player-btn main" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" />}</button>
          <button className="player-btn ghost" onClick={() => setDone(true)}><span style={{ fontSize: 11, fontWeight: 700 }}>结束</span></button>
        </div>
        <span className="tiny" style={{ textAlign: "center", maxWidth: 260 }}>跟随光圈：慢慢吸气 4 秒、屏息 7 秒、缓缓呼气 8 秒。把注意力放在呼吸上就好。</span>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div className="player-done-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="card player-done" initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
              <div style={{ fontSize: 40 }}>🌟</div>
              <span className="h1">训练完成！</span>
              <span className="muted" style={{ textAlign: "center" }}>放松度提升 <b style={{ color: "var(--teal-deep)" }}>↑26</b>，副交感神经更活跃了。</span>
              <div className="chip amber" style={{ fontSize: 13, padding: "8px 14px" }}><Sparkles size={14} /> +{breathPlayer.reward} 心灵积分</div>
              <div className="row" style={{ gap: 10, width: "100%" }}>
                <button className="btn btn-ghost grow" onClick={restart}>再来一组</button>
                <button className="btn btn-primary grow" onClick={closeSub}>完成</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
