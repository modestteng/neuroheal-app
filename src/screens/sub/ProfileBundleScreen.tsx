import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  LockKeyhole,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCircle2,
  Users,
  Volume2,
} from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import { user } from "../../data/mock";
import { useNav } from "../../nav";
import { useLanguage } from "../../state/useLanguage";
import { useValenceLoop } from "../../state/useValenceLoop";

type BundleKey = "identity" | "account" | "data" | "support";

type RowItem = {
  icon: ReactNode;
  bg: string;
  title: string;
  sub: string;
  chip?: string;
  danger?: boolean;
  onClick?: () => void;
  toggle?: {
    on: boolean;
    onToggle: () => void;
  };
};

const bundleKeys: BundleKey[] = ["identity", "account", "data", "support"];

function normalizeBundle(bundle?: string): BundleKey {
  return bundleKeys.includes(bundle as BundleKey) ? bundle as BundleKey : "identity";
}

function IconBadge({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <div className="icon-badge" style={{ width: 38, height: 38, background: bg }}>
      {children}
    </div>
  );
}

function Toggle({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return <button className={`profile-toggle ${on ? "on" : ""}`} onClick={onToggle} aria-label={label} type="button" />;
}

function BundleRow({ row }: { row: RowItem }) {
  const content = (
    <>
      <IconBadge bg={row.bg}>{row.icon}</IconBadge>
      <div className="col grow" style={{ gap: 3, minWidth: 0 }}>
        <span className="body" style={{ fontWeight: 700, color: row.danger ? "var(--stress)" : undefined }}>
          {row.title}
        </span>
        <span className="tiny">{row.sub}</span>
      </div>
      {row.toggle ? <Toggle on={row.toggle.on} label={row.title} onToggle={row.toggle.onToggle} /> : row.chip ? <span className="chip">{row.chip}</span> : null}
    </>
  );

  if (row.onClick) {
    return (
      <button className="list-row" onClick={row.onClick} type="button" style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}>
        {content}
      </button>
    );
  }

  return <div className="list-row">{content}</div>;
}

export default function ProfileBundleScreen({ bundle }: { bundle?: string }) {
  const key = normalizeBundle(bundle);
  const { openSub } = useNav();
  const { isEnglish } = useLanguage();
  const { loopRecords } = useValenceLoop();
  const [notifOn, setNotifOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [eegSensOn, setEegSensOn] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const completedLoops = loopRecords.filter((record) => record.status === "已完成").length;
  const displayName = isEnglish ? user.nameEn : user.name;
  const displaySchool = isEnglish ? user.schoolNameEn : user.schoolName;
  const displayCollege = isEnglish ? user.collegeEn : user.college;
  const displayAdvisor = isEnglish ? user.advisorNameEn : user.advisorName;
  const displayInstitution = isEnglish ? user.affiliatedInstitutionEn : user.affiliatedInstitution;

  const openDetail = (detail: string) => openSub("profileDetail", { detail });
  const clearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const meta = {
    identity: {
      title: isEnglish ? "Identity & Institution" : "身份与机构",
      kicker: isEnglish ? "Campus Verification" : "校园认证",
      chip: isEnglish ? "Verified" : "已认证",
      summary: isEnglish
        ? "School, student ID, advisor and authorized institution are grouped here."
        : "学校、学号、指导老师和授权机构都集中在这里管理。",
      className: "tint-teal",
    },
    account: {
      title: isEnglish ? "Account & Preferences" : "账号与偏好",
      kicker: isEnglish ? "Account Settings" : "账号设置",
      chip: isEnglish ? "Settings" : "设置",
      summary: isEnglish
        ? "Account identity, phone binding and basic reminder preferences are packaged together."
        : "账号身份、手机号绑定和基础提醒偏好统一封装管理。",
      className: "tint-blue",
    },
    data: {
      title: isEnglish ? "Data & Privacy" : "数据与隐私",
      kicker: isEnglish ? "Privacy Control" : "隐私控制",
      chip: isEnglish ? "Protected" : "受保护",
      summary: isEnglish
        ? "EEG history, report export, user agreement and authorization scope stay in one place."
        : "EEG 历史、报告导出、用户协议和授权范围都放在同一个入口里。",
      className: "tint-purple",
    },
    support: {
      title: isEnglish ? "Support & About" : "支持与关于",
      kicker: isEnglish ? "Help Center" : "帮助中心",
      chip: isEnglish ? "Help" : "支持",
      summary: isEnglish
        ? "Hotline, campus counseling, product information and feedback are collected here."
        : "热线、校内咨询、产品说明和反馈入口集中在这里。",
      className: "tint-amber",
    },
  }[key];

  const rows: Record<BundleKey, RowItem[]> = {
    identity: [
      {
        icon: <GraduationCap size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Student ID" : "学号认证",
        sub: `${user.studentId} · ${displayCollege}`,
        chip: isEnglish ? "Verified" : "已认证",
        onClick: () => openDetail("studentId"),
      },
      {
        icon: <ShieldCheck size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "School" : "学校信息",
        sub: displaySchool,
        chip: isEnglish ? "Official" : "官网标识",
        onClick: () => openDetail("editProfile"),
      },
      {
        icon: <Users size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Advisor" : "指导老师",
        sub: displayAdvisor,
        chip: isEnglish ? "Linked" : "已关联",
        onClick: () => openDetail("teacher"),
      },
      {
        icon: <LockKeyhole size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "Authorized Institution" : "关联机构",
        sub: displayInstitution,
        chip: isEnglish ? "Authorized" : "已授权",
        onClick: () => openDetail("privacyAuth"),
      },
    ],
    account: [
      {
        icon: <UserCircle2 size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "Current Account" : "当前账号",
        sub: `${displayName} · ${user.studentId}`,
        chip: isEnglish ? "Primary" : "主账号",
        onClick: () => openDetail("account"),
      },
      {
        icon: <Smartphone size={17} color="var(--joy-deep)" />,
        bg: "var(--amber-soft)",
        title: isEnglish ? "Phone Binding" : "手机号绑定",
        sub: isEnglish ? "138****5678 · Linked" : "138****5678 · 已绑定",
        chip: isEnglish ? "Linked" : "已绑定",
        onClick: () => openDetail("phone"),
      },
      {
        icon: <Bell size={17} color="var(--joy-deep)" />,
        bg: "var(--amber-soft)",
        title: isEnglish ? "Push Notifications" : "消息推送",
        sub: isEnglish ? "Intervention reminders and daily check-ins" : "干预提醒与每日打卡提示",
        toggle: { on: notifOn, onToggle: () => setNotifOn((value) => !value) },
      },
      {
        icon: <Volume2 size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Sound Feedback" : "声音反馈",
        sub: isEnglish ? "Tap sounds and breathing guidance audio" : "点击音效与呼吸提示音",
        toggle: { on: soundOn, onToggle: () => setSoundOn((value) => !value) },
      },
      {
        icon: <ShieldCheck size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "EEG Anonymization" : "EEG 数据脱敏",
        sub: isEnglish ? "Blur raw EEG data before upload" : "上传时对脑电原始数据进行模糊化",
        toggle: { on: eegSensOn, onToggle: () => setEegSensOn((value) => !value) },
      },
      {
        icon: <RefreshCcw size={17} color="var(--purple-deep)" />,
        bg: "var(--purple-soft)",
        title: isEnglish ? "Switch Account" : "切换账号",
        sub: isEnglish ? "Use another account or guest mode" : "登录其他账号或访客模式",
        onClick: () => openDetail("switchAccount"),
      },
    ],
    data: [
      {
        icon: <BarChart3 size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "My EEG Records" : "我的 EEG 记录",
        sub: isEnglish ? `${completedLoops} completed feedback loops` : `已完成 ${completedLoops} 次闭环`,
        chip: isEnglish ? "Traceable" : "可追踪",
        onClick: () => openDetail("eegRecords"),
      },
      {
        icon: <Download size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Export Report" : "导出数据报告",
        sub: isEnglish ? "CSV / PDF emotion records" : "CSV / PDF 情绪记录",
        chip: "CSV/PDF",
        onClick: () => openDetail("exportReport"),
      },
      {
        icon: <FileText size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Privacy Policy & Terms" : "隐私政策与用户协议",
        sub: isEnglish ? "Data usage rules" : "了解数据使用规范",
        onClick: () => openDetail("agreement"),
      },
      {
        icon: <LockKeyhole size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "Privacy & Authorization" : "隐私与授权",
        sub: isEnglish ? "Visibility and institution access" : "数据可见范围与机构授权",
        chip: isEnglish ? "Authorized" : "已授权",
        onClick: () => openDetail("privacyAuth"),
      },
      {
        icon: <Trash2 size={17} color={cacheCleared ? "var(--teal-deep)" : "#c05a7a"} />,
        bg: cacheCleared ? "var(--teal-soft)" : "var(--pink-soft)",
        title: isEnglish ? "Clear Local Cache" : "清除本地缓存",
        sub: cacheCleared ? (isEnglish ? "Cache cleared" : "缓存已清除") : (isEnglish ? "32.4 MB used" : "占用 32.4 MB"),
        chip: cacheCleared ? "✓" : "32.4 MB",
        onClick: clearCache,
      },
    ],
    support: [
      {
        icon: <Phone size={17} color="var(--joy-deep)" />,
        bg: "var(--amber-soft)",
        title: isEnglish ? "24h Hotline" : "24h 心理援助热线",
        sub: isEnglish ? "400-161-9995" : "全国通用 · 400-161-9995",
        chip: isEnglish ? "Call" : "拨打",
        danger: true,
        onClick: () => openDetail("hotline"),
      },
      {
        icon: <Users size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Campus Counseling" : "校内心理咨询中心",
        sub: isEnglish ? "Book in-person support" : "预约咨询老师，面对面支持",
        onClick: () => openDetail("counseling"),
      },
      {
        icon: <Info size={17} color="var(--brand-deep)" />,
        bg: "var(--blue-soft)",
        title: isEnglish ? "About NeuroHeal" : "关于智愈莘莘",
        sub: isEnglish ? "Product intro and team" : "产品介绍与研究团队",
        chip: "V1.0.0",
        onClick: () => openDetail("about"),
      },
      {
        icon: <HelpCircle size={17} color="var(--purple-deep)" />,
        bg: "var(--purple-soft)",
        title: isEnglish ? "Help & Feedback" : "帮助与反馈",
        sub: isEnglish ? "Guide and suggestions" : "使用指南与问题建议",
        onClick: () => openDetail("feedback"),
      },
      {
        icon: <CheckCircle2 size={17} color="var(--teal-deep)" />,
        bg: "var(--teal-soft)",
        title: isEnglish ? "Version" : "当前版本",
        sub: isEnglish ? "NeuroHeal · V1.0.0 · Official release" : "智愈莘莘 NeuroHeal · V1.0.0 · 正式版本",
        chip: isEnglish ? "Ready" : "可展示",
      },
    ],
  };

  return (
    <SubScreen title={meta.title}>
      <Reveal i={0}>
        <div className={`card ${meta.className}`}>
          <div className="row between">
            <span className="kicker">{meta.kicker}</span>
            <Chip variant={key === "account" ? "blue" : key === "support" ? "amber" : "teal"}>{meta.chip}</Chip>
          </div>
          <span className="h2">{meta.title}</span>
          <span className="muted">{meta.summary}</span>
        </div>
      </Reveal>

      {key === "identity" && (
        <Reveal i={1}>
          <div className="profile-school-identity-card">
            <img src={user.schoolLogo} alt={displaySchool} />
            <div className="col" style={{ gap: 3, minWidth: 0 }}>
              <span>{displaySchool}</span>
              <small>{displayCollege} · {user.studentId}</small>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal i={key === "identity" ? 2 : 1}>
        <div className="card profile-group-card">
          <div className="section-head">
            <span className="title">{isEnglish ? "Included Entries" : "已打包入口"}</span>
            <span className="tiny">{isEnglish ? "Tap a row to view details" : "点击查看对应详情"}</span>
          </div>
          {rows[key].map((row) => <BundleRow key={row.title} row={row} />)}
        </div>
      </Reveal>
    </SubScreen>
  );
}
