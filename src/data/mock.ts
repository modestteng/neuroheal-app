// ============ 智愈莘莘 NeuroHeal · mock 数据（无后端，纯演示） ============

export const user = {
  name: "测试用户",
  level: 4,
  levelName: "守护者",
};

export const device = {
  name: "NeuroBand 头环",
  connected: true,
  battery: 82,
};

export type ValenceLevel = "高效价" | "较高效价" | "较低效价" | "低效价";

export type ValenceSnapshot = {
  id: string;
  time: string;
  score: number;
  level: ValenceLevel;
  confidence: number;
  signalQuality: number;
  eegSummary: string;
  aiFeedback: string;
  recommendedActionId: string;
};

export type InterventionAction = {
  id: string;
  title: string;
  type: "呼吸训练" | "数字处方" | "调节游戏" | "AI陪伴" | "成长记录";
  duration: string;
  target: string;
  reason: string;
  route: SubName;
  params?: Record<string, string>;
};

export type ClosedLoopRecord = {
  id: string;
  startTime: string;
  beforeLevel: ValenceLevel;
  beforeScore: number;
  action: string;
  aiMessage: string;
  afterLevel: ValenceLevel;
  afterScore: number;
  delta: number;
  status: "已完成" | "进行中";
};

export const interventionActions: InterventionAction[] = [
  {
    id: "breath-alpha",
    title: "3 分钟 Alpha 呼吸调节",
    type: "呼吸训练",
    duration: "3 分钟",
    target: "稳定较低效价状态",
    reason: "当前 EEG 显示 Alpha 波回升空间较大，适合先用短时呼吸降低紧张感。",
    route: "player",
    params: { from: "Valence 闭环呼吸调节" },
  },
  {
    id: "race-focus",
    title: "意念赛车专注调节",
    type: "调节游戏",
    duration: "30 秒",
    target: "用轻量互动恢复专注",
    reason: "当效价偏低且注意力下降时，短时游戏可作为非压迫式干预入口。",
    route: "race",
  },
  {
    id: "ai-care",
    title: "与小愈进行 AI 陪伴",
    type: "AI陪伴",
    duration: "即时",
    target: "获得安抚与下一步建议",
    reason: "AI 根据当前 Valence 等级生成温和反馈，帮助用户把感受说清楚。",
    route: "aichat",
  },
  {
    id: "prescription-focus",
    title: "考研冲刺专注流",
    type: "数字处方",
    duration: "15 分钟",
    target: "延长稳定专注窗口",
    reason: "当前状态已回升，可进入结构化专注训练巩固效果。",
    route: "prescription",
    params: { id: "p1" },
  },
];

export const valenceSnapshots: ValenceSnapshot[] = [
  {
    id: "v1",
    time: "09:20",
    score: 42,
    level: "较低效价",
    confidence: 88,
    signalQuality: 92,
    eegSummary: "Alpha 波偏弱，Beta 波短时升高，提示用户可能存在轻度紧张。",
    aiFeedback: "我注意到你现在有一点紧绷。先不用急着解决所有事，我们可以从一次短呼吸开始，让身体先稳下来。",
    recommendedActionId: "breath-alpha",
  },
  {
    id: "v2",
    time: "09:26",
    score: 57,
    level: "较高效价",
    confidence: 90,
    signalQuality: 94,
    eegSummary: "Alpha 波占比回升，Beta 波波动降低，状态较上一轮更稳定。",
    aiFeedback: "刚才的调节已经让状态回升了一些。你可以保持这个节奏，继续做一个轻量专注任务。",
    recommendedActionId: "prescription-focus",
  },
  {
    id: "v3",
    time: "09:32",
    score: 64,
    level: "较高效价",
    confidence: 91,
    signalQuality: 95,
    eegSummary: "脑波节律趋于平稳，情绪效价维持在较积极区间。",
    aiFeedback: "现在的状态比较稳定，适合进入学习或记录今天的训练感受。",
    recommendedActionId: "prescription-focus",
  },
];

export const loopSteps = [
  "EEG 采集",
  "Valence 识别",
  "AI 反馈",
  "干预推荐",
  "再监测",
];

export const closedLoopRecords: ClosedLoopRecord[] = [
  {
    id: "loop-1",
    startTime: "09:20",
    beforeLevel: "较低效价",
    beforeScore: 42,
    action: "3 分钟 Alpha 呼吸调节",
    aiMessage: "先把呼吸放慢，让身体从紧绷里退出来一点。",
    afterLevel: "较高效价",
    afterScore: 57,
    delta: 15,
    status: "已完成",
  },
  {
    id: "loop-2",
    startTime: "09:32",
    beforeLevel: "较高效价",
    beforeScore: 64,
    action: "考研冲刺专注流",
    aiMessage: "当前状态适合进入短时专注训练，保持稳定节奏即可。",
    afterLevel: "较高效价",
    afterScore: 67,
    delta: 3,
    status: "进行中",
  },
];

// 首页迷你 EEG 实时波形（最近若干采样点）
export const eegLive = Array.from({ length: 28 }, (_, i) => ({
  t: i,
  v: 50 + Math.round(28 * Math.sin(i / 1.7) + 8 * Math.sin(i / 0.6)),
}));

// ============ 调节小游戏（被 game-session 共享，作为干预入口数据）============
export const game = {
  title: "意念赛车",
  subtitle: "调节小游戏 · 用专注度驱动",
  currentFocus: 86,
  bestTime: "4′12″",
  rules: ["保持专注，赛车自动加速", "分心时赛车减速，系统记录状态变化", "完成后回到 EEG 再监测，更新 Valence 结果"],
};

export const dailyTask = {
  title: "完成 10 分钟专注训练",
  doneMinutes: 6,
  totalMinutes: 10,
  reward: 50,
};

// 底部导航
export type TabKey = "home" | "train" | "community";
export const TABS: { key: TabKey; label: string }[] = [
  { key: "home", label: "监测" },
  { key: "train", label: "干预" },
  { key: "community", label: "记录" },
];

/* ============ 子页面：设备配对与脑电校准 ============ */
export const pairedDevice = {
  name: "NeuroBand 头环",
  model: "NH-Band 2 · 基础版",
  battery: 82,
  sampleRate: "256 Hz",
  firmware: "v2.4.1",
  connected: true,
  sinceMin: 47,
};
export const otherDevices = [
  { name: "NeuroHeal VR 一体机", note: "未连接", emoji: "🥽" },
  { name: "NeuroHeal 助眠眼罩", note: "未连接", emoji: "🌙" },
];
export const electrodes = [
  { name: "Fp1 · 左前额", quality: 92 },
  { name: "Fp2 · 右前额", quality: 88 },
  { name: "TP9 · 左耳后", quality: 76 },
  { name: "TP10 · 右耳后", quality: 81 },
];
export const calibrationSteps = ["检测电极接触", "采集静息基线", "校准情绪模型", "完成"];

/* ============ 子页面：数字处方包（4 大核心课程） ============ */
export type Prescription = {
  id: string; title: string; subtitle: string; tag: string; tone: string; emoji: string;
  band: string; minutes: number; sessions: number; forWho: string;
  desc: string; chapters: { name: string; min: number; done?: boolean; videoUrl?: string }[];
};
export const prescriptions: Prescription[] = [
  {
    id: "p1", title: "考研冲刺专注流", subtitle: "Beta 波强化 · 长时段自习", tag: "专注", tone: "tint-blue", emoji: "📚",
    band: "Beta 13–30Hz", minutes: 15, sessions: 12, forWho: "考研党 / 备考期大学生",
    desc: "针对备考期注意力涣散、易走神，用 Beta 波节律引导 + 番茄工作法，逐步拉长你的「心流窗口」。",
    chapters: [
      { name: "01 · 进入专注：3 分钟脑波热身", min: 3, done: true, videoUrl: "https://www.bilibili.com/video/BV1eT4y157M8/" },
      { name: "02 · 心流维持：12 分钟节律引导", min: 12, videoUrl: "https://www.bilibili.com/video/BV1EF41147Vy/" },
      { name: "03 · 走神唤醒训练", min: 8, videoUrl: "https://www.bilibili.com/video/BV1gPijBHEVi/" },
      { name: "04 · 收尾复盘：今日专注画像", min: 4, videoUrl: "https://www.bilibili.com/video/BV1xcPQzEE1D/" },
    ],
  },
  {
    id: "p2", title: "失眠改善安睡曲", subtitle: "Theta / Delta 引导 · 睡前 30 分钟", tag: "助眠", tone: "tint-teal", emoji: "🌙",
    band: "Theta 4–8Hz / Delta", minutes: 20, sessions: 8, forWho: "失眠群体 / 宿舍噪音干扰",
    desc: "睡前用渐慢的 Theta→Delta 频段引导 + 粉噪音，把交感神经「降档」，配合呼吸节律帮助入睡。",
    chapters: [
      { name: "01 · 身体扫描放松", min: 8 },
      { name: "02 · Theta 渐入引导", min: 10 },
      { name: "03 · Delta 深睡铺垫 + 粉噪音", min: 12 },
    ],
  },
  {
    id: "p3", title: "情感创伤疗愈包", subtitle: "正念 + 情绪复盘 · 温和陪伴", tag: "疗愈", tone: "tint-purple", emoji: "🫶",
    band: "Alpha 8–13Hz", minutes: 18, sessions: 10, forWho: "经历分手 / 失落 / 低谷期",
    desc: "用 Alpha 波放松配合书写式情绪复盘与自我关怀练习，温和地「看见、接纳、放下」，不评判、不催促。",
    chapters: [
      { name: "01 · 安全着陆：此刻的呼吸", min: 4, videoUrl: "https://www.bilibili.com/video/BV1GT4y1D7CK/" },
      { name: "02 · 命名情绪：它在身体哪里", min: 6, videoUrl: "https://www.bilibili.com/video/BV1z54y1B7ZE/?p=15" },
      { name: "03 · 给过去的自己写一封信", min: 8, videoUrl: "https://www.bilibili.com/video/BV1FrSgY8EiC/" },
      { name: "04 · 自我关怀冥想", min: 8, videoUrl: "https://www.bilibili.com/video/BV1J9yjB4EH1/" },
    ],
  },
  {
    id: "p4", title: "社交自信提升课", subtitle: "认知重构 + 暴露练习 · 缓解社恐", tag: "成长", tone: "tint-amber", emoji: "💬",
    band: "Alpha / Beta 混合", minutes: 12, sessions: 6, forWho: "社交焦虑 / 怯场 / 内耗型",
    desc: "针对社交场合心跳加速、脑子空白，用脑波放松 + 微暴露想象 + 认知重构，把「灾难化预期」一点点拆掉。",
    chapters: [
      { name: "01 · 社交前的 90 秒平复", min: 3, videoUrl: "https://www.bilibili.com/video/BV16J411H77X/" },
      { name: "02 · 想象暴露：一次小对话", min: 5, videoUrl: "https://www.bilibili.com/video/BV1gt42157B3/" },
      { name: "03 · 拆解「他会怎么看我」", min: 6, videoUrl: "https://www.bilibili.com/video/BV18v411C7MV/" },
      { name: "04 · 自信锚点冥想", min: 4, videoUrl: "https://www.bilibili.com/video/BV1tqNoekE3L/" },
    ],
  },
];

/* ============ 子页面：呼吸 / 冥想引导播放器 ============ */
export const breathPlayer = {
  title: "Alpha 波放松训练",
  subtitle: "4-7-8 呼吸法 · 引导音轨",
  totalSec: 300,
  // 一个 4-7-8 周期（秒）
  cycle: { inhale: 4, hold: 7, exhale: 8 },
};

/* ============ 子页面：AI 心理陪伴对话 ============ */
export const aiQuickAsks = ["为什么是较低效价", "先做什么调节", "我想慢慢说一下", "帮我进入呼吸训练"];
export const aiOpening =
  "你好，我是「小愈」。系统刚刚识别到你的 Valence 状态有些波动，我们可以先从一句话说起，也可以直接进入一次短时调节。";

/* ============ 子页面：成长档案（打卡 / 勋章 / 周报） ============ */
// 本月（示例 30 天）：哪些日子已打卡
export const checkinDays = [1,2,3,5,6,7,8,9,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27];
export const checkinInfo = { monthLabel: "5 月", totalDays: 30, today: 28, streak: 7, monthDone: 24 };
export const badges = [
  { name: "初探内心", desc: "完成首次脑电监测", emoji: "🧠", got: true },
  { name: "7 日专注", desc: "连续打卡 7 天", emoji: "🔥", got: true },
  { name: "闭环新手", desc: "完成首次「干预前后」闭环记录", emoji: "🔁", got: true },
  { name: "晨型选手", desc: "连续 5 天 7 点前打卡", emoji: "🌅", got: true },
  { name: "心流大师", desc: "单次专注 > 30 分钟 ×10", emoji: "🏆", got: false },
  { name: "安睡达人", desc: "睡眠评分 ≥ 85 连续 7 天", emoji: "😴", got: false },
  { name: "处方全勤", desc: "完整跟完一套数字处方", emoji: "📜", got: false },
  { name: "破冰勇士", desc: "完成社交自信全部练习", emoji: "💫", got: false },
];
export const weeklyReport = {
  range: "5/6 – 5/12",
  mood: [68, 74, 70, 55, 62, 72, 78],
  focus: [70, 66, 74, 80, 78, 84, 86],
  stress: [48, 40, 44, 36, 38, 34, 32],
  days: ["一", "二", "三", "四", "五", "六", "日"],
  risk: "低" as "低" | "中" | "高",
  summary:
    "本周情绪整体平稳偏积极，专注度持续上行；周三下午出现一次明显压力峰值（与课程相关），已通过呼吸训练回落。建议保持睡前正念习惯，把高强度学习放在午后 Alpha 活跃时段。",
};

/* ============ 子页面路由名 ============ */
export type SubName =
  | "device"
  | "prescription"
  | "player"
  | "aichat"
  | "growth"
  | "race"
  | "focusSession";
