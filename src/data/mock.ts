// ============ 智愈莘莘 NeuroHeal · mock 数据（无后端，纯演示） ============

export const user = {
  name: "唐同学",
  realName: "唐三",
  studentId: "24993039",
  major: "计算机科学与技术",
  className: "2班",
  faculty: "人工智能学院",
  greeting: "早上好，唐同学 ☀️",
  soulPoints: 1280,
  level: 4,
  levelName: "守护者",
  weekGained: 120,
  toNextLevel: 220,
};

export const device = {
  name: "NeuroBand 头环",
  connected: true,
  battery: 82,
};

// 今日核心指标
export const todayMood = {
  status: "平稳",
  moodIndex: 78, // 综合情绪指数
  relax: 78, // 放松度
  focus: 86, // 专注度
  stress: 32, // 压力值
  caption: "情绪平稳偏积极，状态不错，继续保持 🌱",
};

export const homeMetrics = [
  { key: "relax", label: "放松度", value: 78, color: "var(--calm)", trend: [56, 62, 60, 68, 72, 75, 78] },
  { key: "focus", label: "专注度", value: 86, color: "var(--focus)", trend: [70, 66, 74, 80, 78, 84, 86] },
  { key: "stress", label: "压力值", value: 32, color: "var(--stress)", trend: [48, 40, 44, 36, 38, 34, 32], note: "偏低" },
] as const;

export const todaySuggestion = {
  title: "进行 8 分钟 Alpha 波放松训练",
  desc: "你的放松度略低于平日，跟随光圈节奏调整呼吸，帮交感神经降一档。",
  duration: "8 分钟",
  tag: "Alpha 放松",
};

// 首页迷你 EEG 实时波形（最近若干采样点）
export const eegLive = Array.from({ length: 28 }, (_, i) => ({
  t: i,
  v: 50 + Math.round(28 * Math.sin(i / 1.7) + 8 * Math.sin(i / 0.6)),
}));

// ============ 报告页 ============
// 一天内（08:00 - 22:00 每 2 小时一点）的脑波频段强度
const hours = ["08", "10", "12", "14", "16", "18", "20", "22"];
export const eegTrend = hours.map((h, i) => ({
  time: `${h}:00`,
  Alpha: [42, 55, 48, 38, 60, 64, 58, 70][i],
  Beta: [50, 62, 70, 75, 66, 52, 44, 36][i],
  Theta: [30, 28, 26, 32, 40, 46, 52, 58][i],
}));

// 情绪波动曲线（情绪指数 0-100）
export const moodCurve = hours.map((h, i) => ({
  time: `${h}:00`,
  mood: [68, 74, 70, 55, 62, 72, 78, 76][i],
}));

export const reportStats = {
  focusMinutes: 42, // 专注时长（分钟）
  avgMood: 72,
  moodDelta: 5,
  calmShare: 45,
};

export const aiInterpretation = {
  title: "AI 报告解读",
  text: "今日整体情绪平稳偏积极。下午（14:00 前后）出现轻度压力波动，多与课程压力相关；建议在压力上行时做一次 4-7-8 呼吸训练，并把高强度学习安排到 Alpha 波活跃的午后时段。",
};

// ============ 训练页 ============
export const nowPlaying = {
  title: "Alpha 波放松训练",
  subtitle: "频段引导 · 5 分钟 · 已收听 1′48″",
  progress: 0.36,
  reward: 30, // 完成可获心灵积分
};

export const courses = [
  {
    id: "c1",
    title: "考研冲刺专注流",
    desc: "Beta 波强化 · 12 节 · 适合长时段自习",
    minutes: 15,
    tag: "专注",
    tone: "tint-blue",
    emoji: "📚",
  },
  {
    id: "c2",
    title: "失眠改善安睡曲",
    desc: "Theta/Delta 引导 · 8 节 · 睡前 30 分钟",
    minutes: 20,
    tag: "助眠",
    tone: "tint-teal",
    emoji: "🌙",
  },
  {
    id: "c3",
    title: "社交自信提升课",
    desc: "情绪复盘 + 正念 · 6 节 · 缓解社交焦虑",
    minutes: 12,
    tag: "情绪",
    tone: "tint-amber",
    emoji: "🤝",
  },
];

export const trainStats = {
  monthCount: 18,
  monthMinutes: 240,
  stressDrop: 23,
  streak: 7,
};

// ============ 游戏页 ============
export const game = {
  title: "意念赛车",
  subtitle: "脑控小游戏 · 用专注度驱动",
  currentFocus: 86,
  bestTime: "4′12″",
  rules: ["保持专注，赛车自动加速", "走神 / 分心，赛车减速", "专注度 > 80 触发「心流加速」"],
};

export const dailyTask = {
  title: "完成 10 分钟专注训练",
  doneMinutes: 6,
  totalMinutes: 10,
  reward: 50,
};

export const gameList = [
  { id: "g1", name: "意念赛车", dims: "专注 · 反应", best: "最佳 4′12″", tone: "tint-blue", emoji: "🏎️" },
  { id: "g2", name: "专注花园", dims: "专注 · 放松", best: "最高 920", tone: "tint-teal", emoji: "🌸" },
  { id: "g3", name: "冥想星河", dims: "放松 · 想象", best: "最高 1380", tone: "tint-amber", emoji: "🌌" },
  { id: "g4", name: "呼吸气球", dims: "呼吸 · 平静", best: "最高 540", tone: "tint-blue", emoji: "🎈" },
];

// ============ 社群页 ============
export const treeholePosts = [
  {
    id: "p1",
    avatar: "🌧️",
    tone: "var(--blue-soft)",
    nick: "匿名 · 树洞访客",
    meta: "3 小时前 · 商学院",
    text: "复习了一整天还是觉得没准备好，明天就要考了，有点慌…有人也这样吗",
    tags: ["#考试焦虑"],
    react: { heart: 28, hug: 15, reply: 9 },
  },
  {
    id: "p2",
    avatar: "🌱",
    tone: "var(--teal-soft)",
    nick: "匿名 · 一棵小树",
    meta: "昨天 · 文学院",
    text: "今天主动跟室友道歉了，原来说出口没有想象中难。给现在的自己一朵小红花 🌸",
    tags: ["#人际关系", "#小确幸"],
    react: { heart: 64, hug: 12, reply: 18 },
  },
  {
    id: "p3",
    avatar: "🌙",
    tone: "var(--purple-soft)",
    nick: "匿名 · 月亮邮局",
    meta: "2 天前 · 工学院",
    text: "最近总在凌晨三四点醒，戴着头环做了几次呼吸训练，好像真的有点用，记录一下",
    tags: ["#失眠", "#自助"],
    react: { heart: 41, hug: 20, reply: 7 },
  },
];

export type LeaderboardEntry = {
  id: string;
  faculty: string;
  alias: string;
  baseScore: number;
};

export const leaderboardEntries: LeaderboardEntry[] = [
  { id: "agri", faculty: "农学院", alias: "青禾", baseScore: 2340 },
  { id: "plant", faculty: "植物保护学院", alias: "叶盾", baseScore: 2292 },
  { id: "hort", faculty: "园艺学院", alias: "花序", baseScore: 2256 },
  { id: "forest", faculty: "林学与园林学院", alias: "林溪", baseScore: 2218 },
  { id: "animal", faculty: "动物科技学院", alias: "牧野", baseScore: 2186 },
  { id: "teafood", faculty: "茶与食品科技学院", alias: "茶岚", baseScore: 2144 },
  { id: "life", faculty: "生命科学学院", alias: "元胞", baseScore: 2112 },
  { id: "resource", faculty: "资源与环境学院", alias: "山岚", baseScore: 2084 },
  { id: "engineering", faculty: "工学院", alias: "机杼", baseScore: 2058 },
  { id: "material", faculty: "材料与化学学院", alias: "晶格", baseScore: 2026 },
  { id: "infoai", faculty: "信息与人工智能学院", alias: "数澜", baseScore: 1994 },
  { id: "ai", faculty: "人工智能学院", alias: "星链", baseScore: 1962 },
  { id: "econ", faculty: "经济管理学院", alias: "衡光", baseScore: 1930 },
  { id: "humanities", faculty: "人文社会科学学院", alias: "书屿", baseScore: 1898 },
  { id: "foreign", faculty: "外国语学院", alias: "远声", baseScore: 1868 },
  { id: "marx", faculty: "马克思主义学院", alias: "晨曦", baseScore: 1836 },
  { id: "rural", faculty: "乡村振兴学院 / 继续教育学院（职业技术学院）", alias: "田野", baseScore: 1802 },
  { id: "intl", faculty: "国际教育学院", alias: "行舟", baseScore: 1772 },
  { id: "sports", faculty: "体育部", alias: "跃场", baseScore: 1742 },
];

export const myRank = { id: "ai", name: "你 · 唐同学", faculty: "人工智能学院" };

export const shopItems = [
  { id: "s1", name: "VIP 冥想课程月卡", cost: 800, emoji: "🧘", tone: "tint-teal", left: "限量 50 份" },
  { id: "s2", name: "解压文创盲盒", cost: 360, emoji: "🎁", tone: "tint-amber", left: "随机款式" },
  { id: "s3", name: "心理讲座门票", cost: 500, emoji: "🎫", tone: "tint-blue", left: "下周六 · 大学生活动中心" },
];

export const notifications = [
  {
    id: "n1",
    sender: "小舞",
    title: "给你发来一条轻提醒",
    text: "看到你下午压力有点波动，记得别把晚饭也拖成任务。",
    meta: "刚刚 · 私信关心",
    tone: "tint-purple",
    emoji: "🪽",
    unread: true,
  },
  {
    id: "n2",
    sender: "马红俊",
    title: "回应了你的树洞",
    text: "他说：'考前脑子打结太正常了，先做一题也算前进。'",
    meta: "6 分钟前 · 树洞回复",
    tone: "tint-amber",
    emoji: "🔥",
    unread: true,
  },
  {
    id: "n3",
    sender: "玉小刚",
    title: "建议你关注本周报告",
    text: "你的报告里 14:00 前后有轻度回落，可考虑固定一段短时放松。",
    meta: "18 分钟前 · 成长档案",
    tone: "tint-blue",
    emoji: "📘",
    unread: true,
  },
  {
    id: "n4",
    sender: "唐舞麟",
    title: "和你约了今晚专注挑战",
    text: "他发起了一次 30 秒意念赛车挑战，等你来接招。",
    meta: "42 分钟前 · 游戏互动",
    tone: "tint-teal",
    emoji: "🏎️",
    unread: false,
  },
  {
    id: "n5",
    sender: "大明",
    title: "给你的积分商城点了个心愿",
    text: "他觉得'心理讲座门票'很适合你，已加入推荐清单。",
    meta: "今天 12:10 · 心愿互动",
    tone: "tint-blue",
    emoji: "🌳",
    unread: false,
  },
  {
    id: "n6",
    sender: "二明",
    title: "送来一句笨拙但很实在的鼓励",
    text: "他说：'压力再大，也得先把水喝了。' 简单，但有用。",
    meta: "今天 09:26 · 朋友留言",
    tone: "tint-teal",
    emoji: "🪵",
    unread: false,
  },
];

// 底部导航
export type TabKey = "home" | "report" | "train" | "game" | "community";
export const TABS: { key: TabKey; label: string }[] = [
  { key: "home", label: "首页" },
  { key: "report", label: "报告" },
  { key: "train", label: "训练" },
  { key: "game", label: "游戏" },
  { key: "community", label: "社群" },
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
  band: string; minutes: number; sessions: number; reward: number; forWho: string;
  desc: string; chapters: { name: string; min: number; done?: boolean }[];
};
export const prescriptions: Prescription[] = [
  {
    id: "p1", title: "考研冲刺专注流", subtitle: "Beta 波强化 · 长时段自习", tag: "专注", tone: "tint-blue", emoji: "📚",
    band: "Beta 13–30Hz", minutes: 15, sessions: 12, reward: 30, forWho: "考研党 / 备考期大学生",
    desc: "针对备考期注意力涣散、易走神，用 Beta 波节律引导 + 番茄工作法，逐步拉长你的「心流窗口」。",
    chapters: [
      { name: "01 · 进入专注：3 分钟脑波热身", min: 3, done: true },
      { name: "02 · 心流维持：12 分钟节律引导", min: 12 },
      { name: "03 · 走神唤醒训练", min: 8 },
      { name: "04 · 收尾复盘：今日专注画像", min: 4 },
    ],
  },
  {
    id: "p2", title: "失眠改善安睡曲", subtitle: "Theta / Delta 引导 · 睡前 30 分钟", tag: "助眠", tone: "tint-teal", emoji: "🌙",
    band: "Theta 4–8Hz / Delta", minutes: 20, sessions: 8, reward: 30, forWho: "失眠群体 / 宿舍噪音干扰",
    desc: "睡前用渐慢的 Theta→Delta 频段引导 + 粉噪音，把交感神经「降档」，配合呼吸节律帮助入睡。",
    chapters: [
      { name: "01 · 身体扫描放松", min: 8 },
      { name: "02 · Theta 渐入引导", min: 10 },
      { name: "03 · Delta 深睡铺垫 + 粉噪音", min: 12 },
    ],
  },
  {
    id: "p3", title: "情感创伤疗愈包", subtitle: "正念 + 情绪复盘 · 温和陪伴", tag: "疗愈", tone: "tint-purple", emoji: "🫶",
    band: "Alpha 8–13Hz", minutes: 18, sessions: 10, reward: 40, forWho: "经历分手 / 失落 / 低谷期",
    desc: "用 Alpha 波放松配合书写式情绪复盘与自我关怀练习，温和地「看见、接纳、放下」，不评判、不催促。",
    chapters: [
      { name: "01 · 安全着陆：此刻的呼吸", min: 4 },
      { name: "02 · 命名情绪：它在身体哪里", min: 6 },
      { name: "03 · 给过去的自己写一封信", min: 8 },
      { name: "04 · 自我关怀冥想", min: 8 },
    ],
  },
  {
    id: "p4", title: "社交自信提升课", subtitle: "认知重构 + 暴露练习 · 缓解社恐", tag: "成长", tone: "tint-amber", emoji: "💬",
    band: "Alpha / Beta 混合", minutes: 12, sessions: 6, reward: 35, forWho: "社交焦虑 / 怯场 / 内耗型",
    desc: "针对社交场合心跳加速、脑子空白，用脑波放松 + 微暴露想象 + 认知重构，把「灾难化预期」一点点拆掉。",
    chapters: [
      { name: "01 · 社交前的 90 秒平复", min: 3 },
      { name: "02 · 想象暴露：一次小对话", min: 5 },
      { name: "03 · 拆解「他会怎么看我」", min: 6 },
      { name: "04 · 自信锚点冥想", min: 4 },
    ],
  },
];

/* ============ 子页面：呼吸 / 冥想引导播放器 ============ */
export const breathPlayer = {
  title: "Alpha 波放松训练",
  subtitle: "4-7-8 呼吸法 · 引导音轨",
  totalSec: 300,
  reward: 30,
  // 一个 4-7-8 周期（秒）
  cycle: { inhale: 4, hold: 7, exhale: 8 },
};

/* ============ 子页面：AI 心理陪伴对话 ============ */
export const aiQuickAsks = ["最近压力好大 😮‍💨", "晚上总是睡不着", "考研有点焦虑", "和室友闹矛盾了"];
export const aiOpening =
  "你好呀，我是「小愈」🌱 —— 一个会一直在的小伙伴。今天过得怎么样？有什么想说的，都可以慢慢讲，我在听。";
// 关键词 → 回复（按命中顺序匹配；都不命中走 default）
export const aiReplies: { keys: string[]; text: string }[] = [
  { keys: ["压力", "累", "顶不住", "崩溃", "焦虑", "慌"], text: "听起来这阵子真的挺紧绷的，先深呼吸一下 🌬️。压力本身不是敌人，它说明你在乎。要不要我陪你做一个 3 分钟的呼吸调节？或者我们先聊聊——是哪件事最压在心上？" },
  { keys: ["睡不着", "失眠", "熬夜", "凌晨", "睡眠"], text: "睡不着的夜晚最难熬了。试试把灯调暗、手机放远一点，跟着「失眠改善安睡曲」做 10 分钟的 Theta 引导；如果脑子停不下来，可以把烦心事写到情绪日记里「寄存」一晚。需要我现在帮你打开助眠引导吗？" },
  { keys: ["考研", "考试", "复习", "上岸", "保研"], text: "备考期的焦虑太常见了，几乎每个考研人都经历过。它往往来自「还没准备好」的不确定感。可以试试把大目标拆成今天能完成的一两件小事；也可以用「考研冲刺专注流」帮你进入心流。你现在距离考试还有多久呀？" },
  { keys: ["室友", "朋友", "同学", "吵架", "矛盾", "社交", "孤独"], text: "和身边人有摩擦，会特别消耗情绪能量。先照顾好自己的感受是对的。如果愿意，可以说说当时发生了什么——有时候把事情讲出来，自己也会更清楚下一步想怎么做。需要的话，「社交自信提升课」里也有处理人际冲突的小练习。" },
  { keys: ["分手", "失恋", "喜欢", "暗恋", "难过", "想哭"], text: "抱抱你 🫂。难过的时候不用急着「走出来」，允许自己慢一点。你现在的感受都是合理的。要不要试试「情感创伤疗愈包」，里面有一个「给过去的自己写一封信」的练习，很多人说写完会轻一些。我也一直在这儿。" },
];
export const aiDefaultReply =
  "嗯，我在听 🌿。你可以再多说一点吗？比如这件事让你最难受/最在意的是哪一点？如果你愿意，我也可以帮你做个呼吸练习，或者帮你预约学校心理中心的老师——你来决定，不着急。";

/* ============ 子页面：成长档案（打卡 / 勋章 / 周报） ============ */
// 本月（示例 30 天）：哪些日子已打卡
export const checkinDays = [1,2,3,5,6,7,8,9,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27];
export const checkinInfo = { monthLabel: "5 月", totalDays: 30, today: 28, streak: 7, monthDone: 24 };
export const badges = [
  { name: "初探内心", desc: "完成首次脑电监测", emoji: "🧠", got: true },
  { name: "7 日专注", desc: "连续打卡 7 天", emoji: "🔥", got: true },
  { name: "树洞暖心人", desc: "在树洞收到 50 次「抱抱」", emoji: "🫂", got: true },
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

/* ============ 子页面：心理科普短视频栏目 ============ */
export const eduCategories = ["全部", "焦虑", "拖延", "睡眠", "人际", "正念", "脑科学"];
export const eduVideos = [
  { id: "v1", title: "为什么越焦虑越拖延？3 分钟讲透", cat: "拖延", min: "3:42", views: "8.2 万", author: "心理学 · 周教授", tone: "tint-blue", emoji: "🌀" },
  { id: "v2", title: "考前慌到手抖？一个动作快速平复", cat: "焦虑", min: "2:18", views: "12.6 万", author: "脑科学科普官", tone: "tint-amber", emoji: "🫨" },
  { id: "v3", title: "凌晨三点睡不着，大脑在干什么", cat: "睡眠", min: "5:06", views: "9.4 万", author: "睡眠实验室", tone: "tint-purple", emoji: "🌙" },
  { id: "v4", title: "和室友处不好？先搞懂「边界感」", cat: "人际", min: "4:31", views: "6.7 万", author: "校园心理委员说", tone: "tint-teal", emoji: "🤝" },
  { id: "v5", title: "Alpha 波到底是什么？看完就懂", cat: "脑科学", min: "3:55", views: "5.1 万", author: "NeuroHeal 研究院", tone: "tint-blue", emoji: "🧠" },
  { id: "v6", title: "3 分钟正念呼吸，跟着做就行", cat: "正念", min: "3:00", views: "15.3 万", author: "冥想引导师 · 阿元", tone: "tint-teal", emoji: "🫧" },
];
export const eduVideoDesc =
  "本期由合作高校心理中心 & NeuroHeal 研究院共同出品，用大学生听得懂的方式聊脑科学与情绪。来自 B 站 / 抖音「智愈莘莘」官方科普矩阵。";

/* ============ 子页面路由名 ============ */
export type SubName =
  | "device"
  | "prescription"
  | "player"
  | "aichat"
  | "growth"
  | "edu"
  | "leaderboard"
  | "race"
  | "report-export"
  | "report-share"
  | "profile"
  | "shop-catalog"
  | "wishlist"
  | "notifications";
