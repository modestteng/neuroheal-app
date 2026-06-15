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
  title: "平台概览",
  stateLabel: "模拟演示数据",
  note: "当前为模拟演示数据，后续可替换为应用商店、下载页、后台统计或试点机构记录。",
};

export const appMarketMetrics: AppMarketMetric[] = [
  {
    id: "downloads",
    label: "APP 下载量",
    value: "12860",
    unit: "次",
    description: "全平台累计下载安装量。",
    source: "模拟演示数据",
    status: "演示数据",
  },
  {
    id: "registered-users",
    label: "注册用户数",
    value: "4320",
    unit: "人",
    description: "完成注册并激活的用户总数。",
    source: "模拟演示数据",
    status: "演示数据",
  },
  {
    id: "training-sessions",
    label: "累计训练次数",
    value: "18750",
    unit: "次",
    description: "全平台呼吸训练、专注赛车等干预完成次数。",
    source: "模拟演示数据",
    status: "演示数据",
  },
  {
    id: "pilot-schools",
    label: "试点学校数",
    value: "6",
    unit: "所",
    description: "已接入心理中心并开展试点的高校数量。",
    source: "模拟演示数据",
    status: "演示数据",
  },
];

export function displayMarketValue(metric: AppMarketMetric) {
  if (!metric.value) return "待补充";
  return metric.unit ? `${metric.value} ${metric.unit}` : metric.value;
}
