import type { ReactNode } from "react";
import {
  BarChart3,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  LockKeyhole,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { Chip, Reveal } from "../components/ui";
import { badges, checkinInfo, user } from "../data/mock";
import { useNav } from "../nav";
import { useLanguage } from "../state/useLanguage";
import { useValenceLoop } from "../state/useValenceLoop";

const RING_R = 33;
const RING_CIRC = 2 * Math.PI * RING_R;
const XP = { current: 60, max: 120 };

type QuickItem = {
  icon: ReactNode;
  bg: string;
  label: string;
  sub: string;
  onClick: () => void;
};

type BundleKey = "identity" | "account" | "data" | "support";

type BundleItem = {
  key: BundleKey;
  icon: ReactNode;
  bg: string;
  title: string;
  sub: string;
  chip: string;
};

function IconBadge({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <div className="icon-badge" style={{ width: 36, height: 36, background: bg }}>
      {children}
    </div>
  );
}

function ProfileGroup({
  title,
  chip,
  children,
}: {
  title: string;
  chip?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card profile-group-card">
      <div className="section-head">
        <span className="title">{title}</span>
        {chip}
      </div>
      {children}
    </div>
  );
}


function QuickActionGrid({ items }: { items: QuickItem[] }) {
  return (
    <div className="profile-quick-grid">
      {items.map((item) => (
        <button key={item.label} className="profile-quick-action" onClick={item.onClick} type="button">
          <IconBadge bg={item.bg}>{item.icon}</IconBadge>
          <span>{item.label}</span>
          <small>{item.sub}</small>
        </button>
      ))}
    </div>
  );
}

function BundleCard({ item, onClick }: { item: BundleItem; onClick: () => void }) {
  return (
    <button className="profile-bundle-card" onClick={onClick} type="button">
      <IconBadge bg={item.bg}>{item.icon}</IconBadge>
      <div className="col grow" style={{ gap: 3, minWidth: 0 }}>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          <span className="body" style={{ fontWeight: 760 }}>{item.title}</span>
          <span className="chip teal">{item.chip}</span>
        </div>
        <span className="tiny">{item.sub}</span>
      </div>
      <ChevronRight size={16} color="var(--t-tertiary)" />
    </button>
  );
}

export default function ProfileScreen() {
  const { openSub } = useNav();
  const { isEnglish, language, setLanguage } = useLanguage();
  const { loopRecords } = useValenceLoop();

  const completedLoops = loopRecords.filter((r) => r.status === "已完成").length;
  const avgDelta =
    completedLoops > 0
      ? Math.round(
          loopRecords.filter((r) => r.status === "已完成").reduce((sum, record) => sum + record.delta, 0) /
            completedLoops,
        )
      : 8;
  const earnedBadges = badges.filter((b) => b.got);
  const lockedBadges = badges.filter((b) => !b.got).slice(0, 2);
  const xpPct = XP.current / XP.max;

  const openDetail = (detail: string) => openSub("profileDetail", { detail });
  const openBundle = (bundle: BundleKey) => openSub("profileBundle", { bundle });

  const displayName = isEnglish ? user.nameEn : user.name;
  const displaySchool = isEnglish ? user.schoolNameEn : user.schoolName;
  const displayCollege = isEnglish ? user.collegeEn : user.college;
  const displayAdvisor = isEnglish ? user.advisorNameEn : user.advisorName;
  const displayInstitution = isEnglish ? user.affiliatedInstitutionEn : user.affiliatedInstitution;
  const displayLevel = isEnglish ? user.levelNameEn : user.levelName;

  const badgeNames: Record<string, string> = {
    初探内心: "First Insight",
    "7 日专注": "7-Day Focus",
    闭环新手: "Loop Starter",
    晨型选手: "Morning Starter",
    心流大师: "Flow Master",
    安睡达人: "Sleep Keeper",
    处方全勤: "Prescription Finisher",
    破冰勇士: "Icebreaker",
  };
  const badgeLabel = (name: string) => isEnglish ? badgeNames[name] ?? name : name;

  const quickActions: QuickItem[] = [
    {
      icon: <FileText size={16} color="var(--brand-deep)" />,
      bg: "var(--blue-soft)",
      label: isEnglish ? "Archive" : "成长档案",
      sub: isEnglish ? "Report" : "周报",
      onClick: () => openSub("growth"),
    },
    {
      icon: <BarChart3 size={16} color="var(--brand-deep)" />,
      bg: "var(--blue-soft)",
      label: isEnglish ? "EEG" : "脑电记录",
      sub: isEnglish ? "History" : "历史",
      onClick: () => openDetail("eegRecords"),
    },
    {
      icon: <Users size={16} color="var(--teal-deep)" />,
      bg: "var(--teal-soft)",
      label: isEnglish ? "Advisor" : "指导老师",
      sub: isEnglish ? "Linked" : "已关联",
      onClick: () => openDetail("teacher"),
    },
    {
      icon: <Headphones size={16} color="var(--joy-deep)" />,
      bg: "var(--amber-soft)",
      label: isEnglish ? "Hardware" : "硬件接入",
      sub: isEnglish ? "Device" : "设备",
      onClick: () => openSub("device"),
    },
  ];

  const bundleItems: BundleItem[] = [
    {
      key: "identity",
      icon: <GraduationCap size={16} color="var(--teal-deep)" />,
      bg: "var(--teal-soft)",
      title: isEnglish ? "Identity & Institution" : "身份与机构",
      sub: isEnglish
        ? `${displaySchool} · ${displayCollege} · ${displayAdvisor}`
        : `${displaySchool} · ${displayCollege} · ${displayAdvisor}`,
      chip: isEnglish ? "Verified" : "已认证",
    },
    {
      key: "account",
      icon: <UserCircle2 size={16} color="var(--brand-deep)" />,
      bg: "var(--blue-soft)",
      title: isEnglish ? "Account & Preferences" : "账号与偏好",
      sub: isEnglish ? "Account, phone, notification and sound settings" : "账号、手机号、消息提醒、声音反馈统一管理",
      chip: isEnglish ? "Settings" : "设置",
    },
    {
      key: "data",
      icon: <LockKeyhole size={16} color="var(--teal-deep)" />,
      bg: "var(--teal-soft)",
      title: isEnglish ? "Data & Privacy" : "数据与隐私",
      sub: isEnglish ? "EEG records, export reports and authorization scope" : "EEG 记录、报告导出、授权范围集中查看",
      chip: isEnglish ? "Protected" : "受保护",
    },
    {
      key: "support",
      icon: <HelpCircle size={16} color="var(--purple-deep)" />,
      bg: "var(--purple-soft)",
      title: isEnglish ? "Support & About" : "支持与关于",
      sub: isEnglish ? "Hotline, campus counseling, about and feedback" : "热线、校内咨询、产品说明、帮助反馈",
      chip: isEnglish ? "Help" : "支持",
    },
  ];

  return (
    <div className="screen">
      <Reveal i={0}>
        <div className="row between" style={{ alignItems: "flex-end" }}>
          <div className="col" style={{ gap: 3 }}>
            <span className="kicker">{isEnglish ? "Personal Center" : "个人中心"}</span>
            <span className="h1">{isEnglish ? "Profile" : "我的"}</span>
          </div>
          <div className="profile-language-buttons" role="group" aria-label={isEnglish ? "Language switch" : "语言切换"} style={{ marginBottom: 4 }}>
            <button className={language === "zh-CN" ? "active" : ""} onClick={() => setLanguage("zh-CN")} type="button">中文</button>
            <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
          </div>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card hero g-hero" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="row" style={{ gap: 14, alignItems: "center", minWidth: 0 }}>
              <div className="profile-avatar-ring-wrap">
                <svg width="76" height="76" viewBox="0 0 76 76" className="profile-level-ring">
                  <circle cx="38" cy="38" r={RING_R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="4.5" />
                  <circle
                    cx="38"
                    cy="38"
                    r={RING_R}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={RING_CIRC * (1 - xpPct)}
                    transform="rotate(-90 38 38)"
                  />
                </svg>
                <div className="profile-avatar-inner">
                  <span style={{ fontSize: isEnglish ? 17 : 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1, userSelect: "none" }}>
                    {isEnglish
                      ? user.nameEn.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                      : user.name[0]}
                  </span>
                </div>
              </div>
              <div className="col" style={{ gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{displayName}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}>
                  {isEnglish ? `Student · ${displayCollege}` : `在校学生 · ${displayCollege}`}
                </span>
                <Chip variant="glass">Lv.{user.level} · {displayLevel}</Chip>
              </div>
            </div>
            <button
              className="btn btn-outline-white btn-sm"
              style={{ padding: "5px 12px", fontSize: 12 }}
              onClick={() => openDetail("editProfile")}
              type="button"
            >
              {isEnglish ? "Edit" : "编辑"}
            </button>
          </div>

          <div className="row" style={{ gap: 8, alignItems: "center", background: "rgba(255,255,255,.14)", borderRadius: 12, padding: "8px 12px" }}>
            <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{displaySchool}</span>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.65)" }}>{displayCollege} · {user.studentId}</span>
            </div>
            <ShieldCheck size={14} color="rgba(255,255,255,.75)" />
          </div>

          <div className="col" style={{ gap: 5 }}>
            <div className="row between">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", fontWeight: 600 }}>
                {isEnglish ? `To Lv.${user.level + 1}` : `距离 Lv.${user.level + 1}`}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.85)", fontWeight: 700 }}>
                {XP.current} / {XP.max} XP
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,.22)" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "#fff", width: `${xpPct * 100}%`, opacity: 0.9 }} />
            </div>
          </div>

          <div className="hero-mini-stats">
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>{isEnglish ? "Loops" : "闭环"}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{completedLoops}</div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>{isEnglish ? "Streak" : "打卡"}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{checkinInfo.streak}{isEnglish ? "d" : " 天"}</div>
            </div>
            <div>
              <div className="tiny on-70" style={{ fontWeight: 600 }}>{isEnglish ? "Valence" : "效价提升"}</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>+{avgDelta}</div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal i={2}>
        <div className="card profile-quick-card">
          <div className="section-head">
            <span className="title">{isEnglish ? "Frequently Used" : "常用入口"}</span>
            <span className="tiny">{isEnglish ? "Core pages" : "核心功能"}</span>
          </div>
          <QuickActionGrid items={quickActions} />
        </div>
      </Reveal>

      <Reveal i={3}>
        <ProfileGroup
          title={isEnglish ? "Growth & Achievements" : "成长与成就"}
          chip={
            <button className="link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => openSub("growth")} type="button">
              {isEnglish ? "View all" : "查看全部"} <ChevronRight size={13} />
            </button>
          }
        >
          <div className="profile-badge-shelf">
            {[...earnedBadges, ...lockedBadges].map((b) => (
              <div key={b.name} className={`profile-badge-item${b.got ? "" : " locked"}`}>
                <span className="profile-badge-emoji">{b.emoji}</span>
                <span className="profile-badge-name">{badgeLabel(b.name)}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 6, marginTop: 2 }}>
            <span className="tiny" style={{ color: "var(--teal-deep)", fontWeight: 700 }}>
              {isEnglish ? `${earnedBadges.length} earned` : `已获 ${earnedBadges.length} 个`}
            </span>
            <span className="tiny">{isEnglish ? `· ${badges.length} badges total` : `· 共 ${badges.length} 个勋章`}</span>
          </div>
        </ProfileGroup>
      </Reveal>

      <Reveal i={4}>
        <ProfileGroup
          title={isEnglish ? "Function Packages" : "功能包"}
        >
          <div className="profile-bundle-list">
            {bundleItems.map((item) => (
              <BundleCard key={item.key} item={item} onClick={() => openBundle(item.key)} />
            ))}
          </div>
          <span className="profile-bundle-note">
            {isEnglish ? displayInstitution : `授权机构：${displayInstitution}`}
          </span>
        </ProfileGroup>
      </Reveal>
    </div>
  );
}
