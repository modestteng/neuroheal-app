export type MetricStatus = "待补充" | "演示数据" | "已核验";

export type AppMarketMetricId =
  | "downloads"
  | "registered-users"
  | "training-sessions"
  | "pilot-schools";

export type AppMarketMetric = {
  id: AppMarketMetricId;
  label: string;
  value: string | null;
  unit?: string;
  description: string;
  source: string | null;
  status: MetricStatus;
};

export const appMarketOverview = {
  appName: "智愈 APP",
  title: "市场接受度",
  stateLabel: "模拟展示数据",
  note: "当前为比赛演示用模拟数据，后续可替换为应用商店、下载页、后台统计或试点机构记录。",
};

export const appMarketMetrics: AppMarketMetric[] = [
  {
    id: "downloads",
    label: "APP 下载量",
    value: "12860",
    unit: "次",
    description: "用于证明产品触达规模。",
    source: "模拟展示数据",
    status: "演示数据",
  },
  {
    id: "registered-users",
    label: "注册用户数",
    value: "4320",
    unit: "人",
    description: "用于证明用户转化和注册意愿。",
    source: "模拟展示数据",
    status: "演示数据",
  },
  {
    id: "training-sessions",
    label: "累计训练次数",
    value: "18750",
    unit: "次",
    description: "用于证明用户使用深度。",
    source: "模拟展示数据",
    status: "演示数据",
  },
  {
    id: "pilot-schools",
    label: "试点学校数",
    value: "6",
    unit: "所",
    description: "用于证明校园落地情况。",
    source: "模拟展示数据",
    status: "演示数据",
  },
];

export function displayMarketValue(metric: AppMarketMetric) {
  if (!metric.value) return "待补充";
  return metric.unit ? `${metric.value} ${metric.unit}` : metric.value;
}
