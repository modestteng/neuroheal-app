import { BadgeCheck, GraduationCap, IdCard, Layers3, Sparkles, UserRound } from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { device, user } from "../../data/mock";

const BASIC_INFO = [
  { label: "姓名", value: user.realName, icon: UserRound },
  { label: "学号", value: user.studentId, icon: IdCard },
  { label: "专业", value: user.major, icon: GraduationCap },
  { label: "班级", value: user.className, icon: Layers3 },
  { label: "学院", value: user.faculty, icon: BadgeCheck },
];

export default function ProfileScreen() {
  return (
    <SubScreen title="个人资料">
      <div className="card profile-hero">
        <div className="row" style={{ gap: 14 }}>
          <div className="profile-avatar">
            <img src="/profile-avatar.png" alt={`${user.realName}头像`} />
          </div>
          <div className="col grow" style={{ gap: 3 }}>
            <span className="kicker">学生档案</span>
            <span className="h2">{user.realName}</span>
            <span className="muted">{user.name} · {user.faculty}</span>
          </div>
        </div>
        <div className="profile-meta-row">
          <span>Lv.{user.level} · {user.levelName}</span>
          <span>{user.soulPoints.toLocaleString()} 心灵积分</span>
        </div>
      </div>

      <div className="card profile-info-card">
        <span className="body" style={{ fontWeight: 700 }}>基础信息</span>
        <div className="profile-info-list">
          {BASIC_INFO.map(({ label, value, icon: Icon }) => (
            <div className="profile-info-row" key={label}>
              <div className="profile-info-icon">
                <Icon size={16} />
              </div>
              <span className="tiny">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card tint-blue profile-extra-card">
        <div className="row" style={{ gap: 8 }}>
          <Sparkles size={16} color="var(--brand-deep)" />
          <span className="body" style={{ fontWeight: 700 }}>其他个人信息</span>
        </div>
        <div className="profile-extra-grid">
          <div>
            <span>常用称呼</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>绑定设备</span>
            <strong>{device.name}</strong>
          </div>
          <div>
            <span>本周成长</span>
            <strong>+{user.weekGained}</strong>
          </div>
          <div>
            <span>学院榜单身份</span>
            <strong>人工智能学院代表</strong>
          </div>
        </div>
      </div>
    </SubScreen>
  );
}
