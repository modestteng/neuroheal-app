export type HardwareAssetType = "image" | "video" | "document" | "signal";

export type HardwareAssetSlot = {
  id: string;
  title: string;
  type: HardwareAssetType;
  description: string;
  src: string | null;
  thumbnail?: string | null;
  duration?: string | null;
  required: boolean;
};

export type HardwareSpecSlot = {
  id: string;
  label: string;
  value: string | null;
  unit?: string;
  note?: string;
};

export const hardwareMaterialStatus = {
  title: "硬件资料接口",
  stateLabel: "待补充",
  description: "这里预留真实硬件图片、参数、采集证明和演示视频。后续拿到材料后，只需要补充本文件里的 src 与 value 字段。",
};

export const hardwareAssetSlots: HardwareAssetSlot[] = [
  {
    id: "main-product-image",
    title: "硬件主图",
    type: "image",
    description: "建议放设备正面或 45 度实拍图，用于设备页首屏展示。",
    src: null,
    thumbnail: null,
    required: true,
  },
  {
    id: "wearing-scene-image",
    title: "佩戴场景",
    type: "image",
    description: "建议放学生佩戴硬件并使用 App 的真实场景图。",
    src: null,
    thumbnail: null,
    required: true,
  },
  {
    id: "eeg-signal-proof",
    title: "采集证明",
    type: "signal",
    description: "建议放原始 EEG 波形、采集软件截图或设备连接截图。",
    src: null,
    thumbnail: null,
    required: true,
  },
  {
    id: "hardware-demo-video",
    title: "演示视频",
    type: "video",
    description: "建议放 10-30 秒连接、佩戴或采集演示视频。",
    src: null,
    thumbnail: null,
    duration: null,
    required: false,
  },
];

export const hardwareSpecSlots: HardwareSpecSlot[] = [
  { id: "device-name", label: "设备名称", value: null },
  { id: "model", label: "型号", value: null },
  { id: "sample-rate", label: "采样率", value: null, unit: "Hz" },
  { id: "electrode-count", label: "电极数量", value: null, unit: "路" },
  { id: "connection", label: "连接方式", value: null },
  { id: "battery-life", label: "续航时间", value: null },
  { id: "weight", label: "重量", value: null, unit: "g" },
  { id: "charging", label: "充电方式", value: null },
];

export function displaySpecValue(slot: HardwareSpecSlot) {
  if (!slot.value) return "待补充";
  return slot.unit ? `${slot.value} ${slot.unit}` : slot.value;
}
