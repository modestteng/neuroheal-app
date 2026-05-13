import { BellRing, CheckCheck, MessageCircleHeart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import SubScreen from "../../components/SubScreen";
import { notifications } from "../../data/mock";

export default function NotificationsScreen() {
  const [readIds, setReadIds] = useState<string[]>(notifications.filter((item) => !item.unread).map((item) => item.id));
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;
  const unreadItems = useMemo(() => notifications.filter((item) => !readIds.includes(item.id)), [readIds]);
  const earlierItems = useMemo(() => notifications.filter((item) => readIds.includes(item.id)), [readIds]);

  const markAllRead = () => setReadIds(notifications.map((item) => item.id));

  return (
    <SubScreen
      title="消息中心"
      headRight={
        <button className="sub-icon-btn" onClick={markAllRead} aria-label="全部已读">
          <CheckCheck size={16} color="var(--brand-deep)" />
        </button>
      }
    >
      <div className="card notice-hero">
        <div className="row between">
          <div className="col">
            <span className="kicker">今天有回应</span>
            <span className="h2">{unreadCount} 条未读信息</span>
          </div>
          <div className="notice-orb">
            <BellRing size={20} />
          </div>
        </div>
        <span className="muted">这里会收到朋友互动、系统提醒、咨询建议和游戏挑战。</span>
      </div>

      <div className="card notice-group">
        <div className="section-head">
          <span className="title">最新提醒</span>
          <span className="tiny">{unreadItems.length} 条待查看</span>
        </div>
        {unreadItems.length === 0 ? (
          <div className="notice-empty">
            <Sparkles size={16} />
            <span>暂时没有未读消息，耳边终于安静了一会儿。</span>
          </div>
        ) : unreadItems.map((item) => (
          <button className="notice-item unread" key={item.id} onClick={() => setReadIds((ids) => [...ids, item.id])}>
            <div className={`icon-badge ${item.tone}`} style={{ width: 42, height: 42, fontSize: 20 }}>{item.emoji}</div>
            <div className="col grow">
              <div className="row between notice-title-row">
                <strong>{item.sender}</strong>
                <span className="notice-dot" />
              </div>
              <span className="body" style={{ fontWeight: 700 }}>{item.title}</span>
              <span className="muted">{item.text}</span>
              <span className="tiny">{item.meta}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="card notice-group">
        <div className="section-head">
          <span className="title">稍早一些</span>
          <span className="tiny">点开后自动归档</span>
        </div>
        {earlierItems.map((item) => (
          <div className="notice-item compact" key={item.id}>
            <div className={`icon-badge ${item.tone}`} style={{ width: 40, height: 40, fontSize: 18 }}>{item.emoji}</div>
            <div className="col grow">
              <div className="row" style={{ gap: 6 }}>
                <MessageCircleHeart size={13} color="var(--brand-deep)" />
                <strong>{item.sender}</strong>
              </div>
              <span className="muted">{item.title}</span>
              <span className="tiny">{item.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </SubScreen>
  );
}
