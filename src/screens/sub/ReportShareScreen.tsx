import { useState } from "react";
import { CheckCircle2, MessageSquareHeart, Send, ShieldCheck, UserRoundCheck } from "lucide-react";
import SubScreen from "../../components/SubScreen";

const TARGETS = ["校心理中心", "我的咨询师"];
const SCOPES = ["仅本次 AI 解读", "近 7 天趋势"];

export default function ReportShareScreen() {
  const [target, setTarget] = useState(TARGETS[0]);
  const [scope, setScope] = useState(SCOPES[0]);
  const [note, setNote] = useState("最近下午会有一点压力回落，想请老师帮我看看是否需要继续关注。");
  const [sent, setSent] = useState(false);

  return (
    <SubScreen title="分享给咨询师">
      <div className="card share-hero">
        <div className="row" style={{ gap: 12 }}>
          <div className="share-orb">
            <MessageSquareHeart size={22} />
          </div>
          <div className="col grow">
            <span className="kicker">授权分享</span>
            <span className="title">把报告交给真正能继续接住你的人</span>
          </div>
        </div>
        <span className="muted">这里是产品演示流，重点展示“确认对象、确认范围、确认附言”的完整链路。</span>
      </div>

      <div className="card share-card">
        <span className="body" style={{ fontWeight: 700 }}>分享给谁</span>
        <div className="share-chip-row">
          {TARGETS.map((item) => (
            <button key={item} className={`share-chip${target === item ? " active" : ""}`} onClick={() => setTarget(item)}>
              {item}
            </button>
          ))}
        </div>

        <span className="body" style={{ fontWeight: 700 }}>分享范围</span>
        <div className="share-scope-list">
          {SCOPES.map((item) => (
            <button key={item} className={`share-scope${scope === item ? " active" : ""}`} onClick={() => setScope(item)}>
              <span>{item}</span>
              {scope === item && <CheckCircle2 size={16} />}
            </button>
          ))}
        </div>

        <label className="share-note">
          <span>附言</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
        </label>
      </div>

      <div className="card tint-blue share-summary">
        <div className="row" style={{ gap: 8 }}>
          <UserRoundCheck size={16} color="var(--brand-deep)" />
          <span className="body" style={{ fontWeight: 700 }}>确认分享内容</span>
        </div>
        <span className="muted">对象：{target}</span>
        <span className="muted">范围：{scope}</span>
        <span className="muted">附言：{note || "无"}</span>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => setSent(true)}>
        <Send size={16} /> 确认分享
      </button>

      {sent && (
        <div className="card share-result">
          <div className="row" style={{ gap: 8 }}>
            <CheckCircle2 size={18} color="var(--teal-deep)" />
            <span className="body" style={{ fontWeight: 700 }}>已发给 {target}</span>
          </div>
          <span className="muted">演示状态已完成分享确认，后续可以继续接真实预约、消息或授权记录。</span>
          <div className="row" style={{ gap: 8 }}>
            <ShieldCheck size={15} color="var(--teal-deep)" />
            <span className="tiny">默认只分享你确认过的内容范围。</span>
          </div>
        </div>
      )}
    </SubScreen>
  );
}
