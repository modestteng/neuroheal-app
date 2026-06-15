import { useMemo } from "react";
import { ChevronRight, Clock, Gamepad2, MessageCircleHeart, Sparkles, Wind, Zap } from "lucide-react";
import { Chip, Reveal, SectionHeader } from "../components/ui";
import { useNav } from "../nav";
import { interventionActions, prescriptions } from "../data/mock";
import { useValenceLoop } from "../state/useValenceLoop";

export default function TrainScreen() {
  const { openSub } = useNav();
  const { current } = useValenceLoop();
  const recommendedIntervention = useMemo(
    () => interventionActions.find((item) => item.id === current.recommendedActionId) ?? interventionActions[0],
    [current.recommendedActionId],
  );
  const quickActions = useMemo(
    () => interventionActions.filter((action) => action.id === "breath-alpha" || action.id === "race-focus"),
    [],
  );
  const aiCompanionAction = useMemo(
    () => interventionActions.find((action) => action.id === "ai-care"),
    [],
  );

  const quickActionMeta = {
    "breath-alpha": {
      icon: <Wind size={23} color="var(--teal-deep)" />,
      tone: "breath",
      badge: "呼吸训练",
      cta: "开始呼吸",
      metricLabel: "节律",
      metricValue: "4-7-8",
      steps: ["吸气", "停留", "呼气"],
    },
    "race-focus": {
      icon: <Gamepad2 size={23} color="var(--brand-deep)" />,
      tone: "race",
      badge: "调节游戏",
      cta: "进入赛车",
      metricLabel: "玩法",
      metricValue: "换道",
      steps: ["蓄力", "收集", "避障"],
    },
  } as const;

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="row between">
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">AI 干预中心</span>
            <span className="h1">根据 Valence 推荐行动</span>
          </div>
          <Chip variant="teal"><Sparkles size={13} /> AI 推荐</Chip>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card intervention-hero">
          <div className="row between top">
            <div className="col grow">
              <span className="tiny">当前状态</span>
              <span className="title">{current.level} · Valence {current.score}</span>
              <span className="muted">{current.aiFeedback}</span>
            </div>
            <div className="intervention-score num">{current.score}</div>
          </div>
          <div className="recommended-action highlight">
            <div className="icon-badge" style={{ background: "var(--teal-soft)" }}>
              <Wind size={19} color="var(--teal-deep)" />
            </div>
            <div className="col grow">
              <span className="tiny">优先建议</span>
              <strong>{recommendedIntervention.title}</strong>
              <small>{recommendedIntervention.target} · {recommendedIntervention.duration}</small>
            </div>
            <button className="btn btn-primary" onClick={() => openSub(recommendedIntervention.route, { ...(recommendedIntervention.params ?? {}), actionId: recommendedIntervention.id, actionTitle: recommendedIntervention.title })}>
              开始 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal i={2}>
        <SectionHeader title="快速调节" />
      </Reveal>

      <div className="intervention-feature-list">
        {quickActions.map((action, index) => (
          <Reveal i={3 + index} key={action.id}>
            <button
              className={`intervention-feature-card ${quickActionMeta[action.id as keyof typeof quickActionMeta].tone}`}
              onClick={() => openSub(action.route, { ...(action.params ?? {}), actionId: action.id, actionTitle: action.title })}
            >
              <div className="feature-card-main">
                <div className="feature-icon-wrap">
                  {quickActionMeta[action.id as keyof typeof quickActionMeta].icon}
                </div>
                <div className="feature-card-copy">
                  <span className="feature-card-kicker">
                    <Clock size={12} />
                    {action.duration} · {quickActionMeta[action.id as keyof typeof quickActionMeta].badge}
                  </span>
                  <strong>{action.title}</strong>
                  <span>{action.target}</span>
                </div>
                <div className="feature-card-arrow">
                  <ChevronRight size={17} />
                </div>
              </div>

              <div className="feature-card-bottom">
                <div className="feature-mini-metric">
                  <span>{quickActionMeta[action.id as keyof typeof quickActionMeta].metricLabel}</span>
                  <strong>{quickActionMeta[action.id as keyof typeof quickActionMeta].metricValue}</strong>
                </div>
                <div className="feature-step-row">
                  {quickActionMeta[action.id as keyof typeof quickActionMeta].steps.map((step) => (
                    <span key={step}>{step}</span>
                  ))}
                </div>
                <span className="feature-cta">
                  <Zap size={13} />
                  {quickActionMeta[action.id as keyof typeof quickActionMeta].cta}
                </span>
              </div>
            </button>
          </Reveal>
        ))}

        {aiCompanionAction && (
          <Reveal i={5}>
            <button
              className="ai-character-entry"
              onClick={() => openSub(aiCompanionAction.route, { ...(aiCompanionAction.params ?? {}), actionId: aiCompanionAction.id, actionTitle: aiCompanionAction.title })}
            >
              <div className="ai-character-avatar">
                <MessageCircleHeart size={20} />
              </div>
              <div className="col grow" style={{ gap: 3 }}>
                <span className="body" style={{ fontWeight: 800 }}>{aiCompanionAction.title}</span>
                <span className="tiny">{aiCompanionAction.target} · {aiCompanionAction.duration}</span>
              </div>
              <span className="ai-character-action">
                进入对话 <ChevronRight size={15} />
              </span>
            </button>
          </Reveal>
        )}
      </div>

      <Reveal i={6}>
        <SectionHeader title="数字处方" />
      </Reveal>
      <div className="prescription-compact-grid">
        {prescriptions.map((course, idx) => (
          <Reveal i={7 + idx} key={course.id}>
            <button className={`prescription-compact-card ${course.tone}`} onClick={() => openSub("prescription", { id: course.id })}>
              <div className="icon-badge shadow" style={{ background: "#fff", width: 42, height: 42, fontSize: 19 }}>{course.emoji}</div>
              <div className="col grow" style={{ gap: 3 }}>
                <span className="body" style={{ fontWeight: 700 }}>{course.title}</span>
                <span className="tiny" style={{ color: "var(--t-secondary)" }}>{course.tag} · {course.minutes} 分钟</span>
              </div>
              <ChevronRight size={15} color="var(--t-tertiary)" />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
