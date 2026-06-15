import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Info,
  LockKeyhole,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  UserCircle2,
  Users,
} from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import { badges, checkinInfo, user, weeklyReport } from "../../data/mock";
import { useNav } from "../../nav";
import { useLanguage, type AppLanguage } from "../../state/useLanguage";
import { useValenceLoop } from "../../state/useValenceLoop";

export type ProfileDetailKey =
  | "editProfile"
  | "teacher"
  | "account"
  | "studentId"
  | "phone"
  | "switchAccount"
  | "language"
  | "eegRecords"
  | "exportReport"
  | "agreement"
  | "privacyAuth"
  | "hotline"
  | "counseling"
  | "about"
  | "feedback";

type DetailRow = {
  icon: ReactNode;
  title: string;
  sub: string;
  chip?: string;
  language?: AppLanguage;
};

type DetailAction =
  | { label: string; kind: "growth" | "device" | "aichat" }
  | { label: string; kind: "tel"; href: string }
  | { label: string; kind: "noop" };

type DetailContent = {
  title: string;
  kicker: string;
  summary: string;
  chip: string;
  tone: "blue" | "teal" | "amber" | "purple" | "pink";
  rows: DetailRow[];
  action?: DetailAction;
};

const toneClass = {
  blue: "tint-blue",
  teal: "tint-teal",
  amber: "tint-amber",
  purple: "tint-purple",
  pink: "profile-support-card",
} satisfies Record<DetailContent["tone"], string>;

function makeRow(icon: ReactNode, title: string, sub: string, chip?: string): DetailRow {
  return { icon, title, sub, chip };
}

function iconWrap(children: ReactNode, bg = "var(--blue-soft)") {
  return (
    <div className="icon-badge" style={{ width: 38, height: 38, background: bg }}>
      {children}
    </div>
  );
}

function buildDetail(detail: ProfileDetailKey, completedLoops: number, isEnglish: boolean): DetailContent {
  const displayName = isEnglish ? user.nameEn : user.name;
  const displayCollege = isEnglish ? user.collegeEn : user.college;
  const displayAdvisor = isEnglish ? user.advisorNameEn : user.advisorName;
  const displayInstitution = isEnglish ? user.affiliatedInstitutionEn : user.affiliatedInstitution;

  const details: Record<ProfileDetailKey, DetailContent> = {
    editProfile: {
      title: isEnglish ? "Edit Profile" : "编辑个人资料",
      kicker: isEnglish ? "Personal Info" : "个人信息",
      summary: isEnglish ? "Update your avatar, name, college, grade and emergency contact information." : "支持头像、昵称、学校、年级与紧急联系人等字段的查看与更新。",
      chip: isEnglish ? "Profile" : "个人资料",
      tone: "blue",
      rows: [
        makeRow(iconWrap(<UserCircle2 size={17} color="var(--brand-deep)" />), isEnglish ? "Name" : "昵称", displayName, isEnglish ? "Editable" : "可编辑"),
        makeRow(iconWrap(<GraduationCap size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Identity" : "身份", isEnglish ? `Student · ${displayCollege}` : `在校学生 · ${displayCollege}`, isEnglish ? "Verified" : "已认证"),
        makeRow(iconWrap(<FileText size={17} color="var(--brand-deep)" />), isEnglish ? "Student ID" : "学号", user.studentId, isEnglish ? "Linked" : "已绑定"),
        makeRow(iconWrap(<Users size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Advisor" : "指导老师", displayAdvisor, isEnglish ? "Linked" : "已关联"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Growth Level" : "成长等级", `Lv.${user.level} · ${isEnglish ? user.levelNameEn : user.levelName}`, isEnglish ? "Synced" : "同步"),
      ],
      action: { label: isEnglish ? "Open Growth Archive" : "查看成长档案", kind: "growth" },
    },
    teacher: {
      title: isEnglish ? "Advisor" : "指导老师",
      kicker: isEnglish ? "Linked Institution" : "关联机构",
      summary: isEnglish ? "The authorized advisor can only view trend summaries, risk level, and intervention completion. Raw EEG data is not shared externally." : "授权老师只能查看情绪趋势、风险等级和干预完成情况，原始 EEG 数据不会外传。",
      chip: isEnglish ? "Authorized" : "已授权",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<Users size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), displayAdvisor, isEnglish ? "Focus: emotion regulation and EEG intervention" : "方向：情绪调节与脑电干预", isEnglish ? "Campus" : "校内"),
        makeRow(iconWrap(<CalendarCheck2 size={17} color="var(--brand-deep)" />), isEnglish ? "Latest Sync" : "最近同步", isEnglish ? "Weekly mental health report · low risk" : "本周心理周报 · 风险等级低", isEnglish ? "Low" : weeklyReport.risk),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Authorized Scope" : "授权范围", isEnglish ? "Valence trends, check-ins, intervention completion" : "Valence 趋势、打卡记录、干预完成情况", isEnglish ? "No raw EEG" : "不含原始脑电"),
      ],
      action: { label: isEnglish ? "Open Growth Archive" : "打开成长档案", kind: "growth" },
    },
    account: {
      title: "当前账号",
      kicker: "账号管理",
      summary: "账号用于同步训练记录、设备绑定状态和授权机构信息。",
      chip: "已登录",
      tone: "blue",
      rows: [
        makeRow(iconWrap(<UserCircle2 size={17} color="var(--brand-deep)" />), isEnglish ? "Account ID" : "账号标识", `${displayName} · ${user.studentId}`, isEnglish ? "Primary" : "主账号"),
        makeRow(iconWrap(<CheckCircle2 size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "登录状态", "账号状态正常，数据已同步", "正常"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "数据同步", "闭环记录、勋章与周报已本地保存", `${completedLoops} 条闭环`),
      ],
    },
    studentId: {
      title: "学号绑定",
      kicker: "校园认证",
      summary: "学号认证用于关联校心理健康中心与班级/年级维度的匿名统计。",
      chip: "已认证",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<GraduationCap size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Student ID" : "学号", user.studentId, isEnglish ? "Verified" : "已认证"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--brand-deep)" />), isEnglish ? "Verified By" : "认证机构", displayInstitution, isEnglish ? "Connected" : "已接入"),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "隐私说明", "老师仅可见趋势汇总，不可查看原始脑电", "脱敏"),
      ],
      action: { label: "查看授权设置", kind: "noop" },
    },
    phone: {
      title: "手机号绑定",
      kicker: "账号安全",
      summary: "手机号用于重要提醒、紧急联系和账号找回，短信通知可在提醒设置中随时关闭。",
      chip: "已绑定",
      tone: "amber",
      rows: [
        makeRow(iconWrap(<Smartphone size={17} color="var(--joy-deep)" />, "var(--amber-soft)"), "手机号", "138****5678", "已绑定"),
        makeRow(iconWrap(<Bell size={17} color="var(--joy-deep)" />, "var(--amber-soft)"), "提醒用途", "危机支持、打卡提醒、预约通知", "可关闭"),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "安全策略", "仅用于账号验证与必要通知", "受保护"),
      ],
    },
    switchAccount: {
      title: "切换账号",
      kicker: "登录方式",
      summary: "支持学生、老师和访客三种身份模式，切换后界面与数据视图随身份更新。",
      chip: "身份切换",
      tone: "purple",
      rows: [
        makeRow(iconWrap(<RefreshCcw size={17} color="var(--purple-deep)" />, "var(--purple-soft)"), isEnglish ? "Current Role" : "当前身份", isEnglish ? `Student · ${displayName}` : `学生端 · ${displayName}`, isEnglish ? "Current" : "当前"),
        makeRow(iconWrap(<Users size={17} color="var(--brand-deep)" />), "老师端", "查看授权学生趋势与预警汇总", "即将上线"),
        makeRow(iconWrap(<UserCircle2 size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "访客模式", "体验基础监测与干预功能", "即将上线"),
      ],
    },
    language: {
      title: isEnglish ? "Language" : "语言",
      kicker: isEnglish ? "Preferences" : "偏好设置",
      summary: isEnglish ? "The interface is now in English mode. You can switch back to Simplified Chinese at any time." : "当前界面语言为中文简体，也可切换到英文模式，方便国际交流与展示。",
      chip: isEnglish ? "English" : "中文简体",
      tone: "purple",
      rows: [
        { ...makeRow(iconWrap(<Globe size={17} color="var(--purple-deep)" />, "var(--purple-soft)"), isEnglish ? "Chinese (Simplified)" : "中文（简体）", isEnglish ? "Switch to Chinese interface" : "当前使用语言", ""), language: "zh-CN" },
        { ...makeRow(iconWrap(<Globe size={17} color="var(--brand-deep)" />), "English", isEnglish ? "Current interface language" : "国际化界面语言", ""), language: "en" },
      ],
    },
    eegRecords: {
      title: "我的 EEG 记录",
      kicker: "脑电数据",
      summary: "汇总 EEG 信号质量、Valence 识别结果与干预前后变化，支持按日期筛选与导出。",
      chip: "可追踪",
      tone: "blue",
      rows: [
        makeRow(iconWrap(<BarChart3 size={17} color="var(--brand-deep)" />), "闭环记录", `已完成 ${completedLoops} 次闭环`, "同步"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "原始数据", "默认仅保存在授权范围内，不向机构外传", "脱敏"),
        makeRow(iconWrap(<FileText size={17} color="var(--brand-deep)" />), "记录字段", "时间、Valence、置信度、信号质量、干预类型", "结构化"),
      ],
      action: { label: "打开设备与校准", kind: "device" },
    },
    exportReport: {
      title: "导出数据报告",
      kicker: "数据报告",
      summary: "支持生成 CSV/PDF 格式的情绪趋势与干预记录，导出前需本人确认授权。",
      chip: "CSV / PDF",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<Download size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "CSV 数据", "用于科研分析和后台统计", "可导出"),
        makeRow(iconWrap(<FileText size={17} color="var(--brand-deep)" />), "PDF 周报", `${weeklyReport.range} 心理周报`, "可预览"),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "导出权限", "导出前需要本人确认", "安全"),
      ],
      action: { label: "查看成长档案", kind: "growth" },
    },
    agreement: {
      title: "隐私政策与用户协议",
      kicker: "合规说明",
      summary: "遵循最小必要原则，采集仅限情绪识别所需字段，授权可随时撤回，原始脑电不向机构外传输。",
      chip: "正式协议",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<FileText size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "数据用途", "情绪趋势识别、干预推荐、成长记录", "限定"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--brand-deep)" />), "共享边界", "校心理中心仅看授权后的趋势汇总", "受控"),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "撤回授权", "用户可随时关闭机构共享", "可撤回"),
      ],
    },
    privacyAuth: {
      title: "隐私与授权",
      kicker: "授权管理",
      summary: "你可以查看当前授权机构、共享字段和数据脱敏策略。",
      chip: "已授权",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<Users size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), isEnglish ? "Authorized Institution" : "授权机构", displayInstitution, isEnglish ? "Authorized" : "已授权"),
        makeRow(iconWrap(<BarChart3 size={17} color="var(--brand-deep)" />), "共享字段", "情绪趋势、风险等级、干预完成度", "汇总"),
        makeRow(iconWrap(<LockKeyhole size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "不共享字段", "原始 EEG、聊天原文、个人隐私文本", "保护"),
      ],
    },
    hotline: {
      title: "24h 心理援助热线",
      kicker: "危机支持",
      summary: "当你持续低落、恐慌或有伤害自己的想法时，请优先联系现实中的专业支持。",
      chip: "立即支持",
      tone: "pink",
      rows: [
        makeRow(iconWrap(<Phone size={17} color="var(--joy-deep)" />, "var(--amber-soft)"), "全国通用热线", "400-161-9995", "24h"),
        makeRow(iconWrap(<HeartHandshake size={17} color="var(--stress)" />, "var(--pink-soft)"), "支持原则", "先保证安全，再慢慢处理问题", "优先"),
      ],
      action: { label: "拨打 400-161-9995", kind: "tel", href: "tel:4001619995" },
    },
    counseling: {
      title: "校内心理咨询中心",
      kicker: "预约咨询",
      summary: "可在线预约校内咨询老师，面对面支持，预约信息全程保密。",
      chip: "可预约",
      tone: "teal",
      rows: [
        makeRow(iconWrap(<Users size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "服务对象", "在校学生", "免费"),
        makeRow(iconWrap(<CalendarCheck2 size={17} color="var(--brand-deep)" />), "建议时间", "周一至周五 09:00-17:00", "工作日"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "预约隐私", "预约信息仅咨询老师可见", "保密"),
      ],
      action: { label: "让小愈帮我预约", kind: "aichat" },
    },
    about: {
      title: "关于智愈莘莘",
      kicker: "产品介绍",
      summary: "智愈莘莘 NeuroHeal 是面向高校学生的脑电情绪监测与干预反馈系统。",
      chip: "V1.0.0",
      tone: "blue",
      rows: [
        makeRow(iconWrap(<Info size={17} color="var(--brand-deep)" />), "核心闭环", "EEG 采集 -> Valence 识别 -> AI 反馈 -> 数字干预 -> 成长记录", "创新点"),
        makeRow(iconWrap(<ShieldCheck size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "硬件支撑", "ExpandableEEG 脑电采集系统", "已接入"),
        makeRow(iconWrap(<FileText size={17} color="var(--brand-deep)" />), "版本", "NeuroHeal · V1.0.0 · 正式版本", "V1.0.0"),
      ],
    },
    feedback: {
      title: "帮助与反馈",
      kicker: "使用支持",
      summary: "遇到连接、训练或记录问题，可以从这里提交反馈，团队将及时跟进处理。",
      chip: "可反馈",
      tone: "purple",
      rows: [
        makeRow(iconWrap(<HelpCircle size={17} color="var(--purple-deep)" />, "var(--purple-soft)"), "常见问题", "设备连接、课程播放、AI 对话、成长档案", "指南"),
        makeRow(iconWrap(<Bell size={17} color="var(--joy-deep)" />, "var(--amber-soft)"), "反馈状态", "提交后由团队记录并跟进", "跟进中"),
        makeRow(iconWrap(<Users size={17} color="var(--teal-deep)" />, "var(--teal-soft)"), "联系团队", "NeuroHeal 项目组", "校内"),
      ],
      action: { label: "进入 AI 陪伴说明问题", kind: "aichat" },
    },
  };

  return details[detail];
}

function normalizeDetail(detail?: string): ProfileDetailKey {
  const keys: ProfileDetailKey[] = [
    "editProfile",
    "teacher",
    "account",
    "studentId",
    "phone",
    "switchAccount",
    "language",
    "eegRecords",
    "exportReport",
    "agreement",
    "privacyAuth",
    "hotline",
    "counseling",
    "about",
    "feedback",
  ];
  return keys.includes(detail as ProfileDetailKey) ? detail as ProfileDetailKey : "editProfile";
}

export default function ProfileDetailScreen({ detail }: { detail?: string }) {
  const { openSub } = useNav();
  const { language, setLanguage, isEnglish } = useLanguage();
  const { loopRecords } = useValenceLoop();
  const completedLoops = loopRecords.filter((record) => record.status === "已完成").length;
  const detailKey = normalizeDetail(detail);
  const content = buildDetail(detailKey, completedLoops, isEnglish);

  const runAction = (action?: DetailAction) => {
    if (!action) return;
    if (action.kind === "growth") openSub("growth");
    if (action.kind === "device") openSub("device");
    if (action.kind === "aichat") openSub("aichat");
    if (action.kind === "tel") window.location.href = action.href;
  };

  return (
    <SubScreen title={content.title}>
      <Reveal i={0}>
        <div className={`card ${toneClass[content.tone]}`}>
          <div className="row between">
            <span className="kicker">{content.kicker}</span>
            <Chip variant={content.tone === "amber" ? "amber" : "teal"}>{content.chip}</Chip>
          </div>
          <span className="h2">{content.title}</span>
          <span className="muted">{content.summary}</span>
        </div>
      </Reveal>

      <Reveal i={1}>
        <div className="card">
          <span className="title">{isEnglish ? "Details" : "详情"}</span>
          {content.rows.map((row) => (
            <button
              className="list-row"
              key={row.title}
              onClick={row.language ? () => setLanguage(row.language!) : undefined}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: row.language ? "pointer" : "default",
              }}
            >
              {row.icon}
              <div className="col grow">
                <span className="body" style={{ fontWeight: 700 }}>{row.title}</span>
                <span className="tiny">{row.sub}</span>
              </div>
              {row.language ? (
                <span className="chip">
                  {row.language === language ? (isEnglish ? "Enabled" : "已启用") : (isEnglish ? "Available" : "可切换")}
                </span>
              ) : row.chip ? <span className="chip">{row.chip}</span> : null}
            </button>
          ))}
        </div>
      </Reveal>

      {content.action && (
        <Reveal i={2}>
          <button className="btn btn-primary btn-block" onClick={() => runAction(content.action)}>
            {content.action.label}
          </button>
        </Reveal>
      )}

      <Reveal i={3}>
        <div className="card tint-teal" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <CalendarCheck2 size={17} color="var(--teal-deep)" style={{ flex: "none" }} />
          <span className="muted">
            {isEnglish
              ? `${checkinInfo.streak}-day streak, ${badges.filter((badge) => badge.got).length} badges unlocked.`
              : `连续打卡 ${checkinInfo.streak} 天，已点亮 ${badges.filter((badge) => badge.got).length} 个勋章。`}
          </span>
        </div>
      </Reveal>
    </SubScreen>
  );
}
