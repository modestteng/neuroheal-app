import { useState } from "react";
import { CheckCircle2, FileDown, ShieldCheck, Sparkles } from "lucide-react";
import SubScreen from "../../components/SubScreen";

const FORMATS = ["今日脑电摘要", "完整周趋势", "咨询沟通版"];

export default function ReportExportScreen() {
  const [format, setFormat] = useState(FORMATS[0]);
  const [includeAi, setIncludeAi] = useState(true);
  const [anonymous, setAnonymous] = useState(true);
  const [generated, setGenerated] = useState(false);

  return (
    <SubScreen title="导出报告">
      <div className="card export-hero">
        <div className="row between">
          <div className="col">
            <span className="kicker">PDF 导出</span>
            <span className="title">把今日状态整理成一份清楚的报告</span>
          </div>
          <div className="export-doc-mark">
            <FileDown size={22} />
          </div>
        </div>
        <span className="muted">适合自己留档、课程展示，或后续转发给咨询师继续沟通。</span>
      </div>

      <div className="card export-card">
        <span className="body" style={{ fontWeight: 700 }}>选择导出模板</span>
        <div className="export-choice-grid">
          {FORMATS.map((item) => (
            <button
              key={item}
              className={`export-choice${format === item ? " active" : ""}`}
              onClick={() => setFormat(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button className={`export-toggle${includeAi ? " on" : ""}`} onClick={() => setIncludeAi((value) => !value)}>
          <span>
            <strong>附带 AI 报告解读</strong>
            <small>保留风险提示与建议动作</small>
          </span>
          <i />
        </button>

        <button className={`export-toggle${anonymous ? " on" : ""}`} onClick={() => setAnonymous((value) => !value)}>
          <span>
            <strong>默认匿名化</strong>
            <small>隐藏昵称，仅保留关键趋势</small>
          </span>
          <i />
        </button>
      </div>

      <div className="card tint-blue export-preview">
        <div className="row" style={{ gap: 8 }}>
          <Sparkles size={16} color="var(--brand-deep)" />
          <span className="body" style={{ fontWeight: 700 }}>本次会导出</span>
        </div>
        <div className="export-preview-list">
          <span>模板：{format}</span>
          <span>AI 解读：{includeAi ? "已包含" : "不包含"}</span>
          <span>隐私处理：{anonymous ? "匿名化" : "保留原样"}</span>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => setGenerated(true)}>
        <FileDown size={16} /> 生成 PDF
      </button>

      {generated && (
        <div className="card export-result">
          <div className="row" style={{ gap: 8 }}>
            <CheckCircle2 size={18} color="var(--teal-deep)" />
            <span className="body" style={{ fontWeight: 700 }}>PDF 已生成</span>
          </div>
          <span className="muted">演示页中已完成导出流程，后续可接浏览器下载或后端文件生成。</span>
          <div className="row" style={{ gap: 8 }}>
            <ShieldCheck size={15} color="var(--teal-deep)" />
            <span className="tiny">匿名化导出更适合公开展示和路演场景。</span>
          </div>
        </div>
      )}
    </SubScreen>
  );
}
