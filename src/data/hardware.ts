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
  title: "硬件资料",
  stateLabel: "ExpandableEEG",
  description: "基于 ADS1299 芯片的高精度脑电采集板，支持 8/16/32 通道模块化扩展，兼容 OpenBCI GUI 与 BrainFlow。",
};

export const hardwareAssetSlots: HardwareAssetSlot[] = [
  {
    id: "main-product-image",
    title: "佩戴正面图",
    type: "image",
    description: "佩戴 ExpandableEEG 脑电帽正面实拍，可见 AF3/AF4/FP1/FP2 等额叶电极位置。",
    src: "/hardware/wearing-face.jpg",
    thumbnail: "/hardware/wearing-face.jpg",
    required: true,
  },
  {
    id: "wearing-scene-image",
    title: "实验场景图",
    type: "image",
    description: "实验室中佩戴脑电帽并配合上位机进行信号采集，屏幕显示脑地形图。",
    src: "/hardware/wearing-lab-side.jpg",
    thumbnail: "/hardware/wearing-lab-side.jpg",
    required: true,
  },
  {
    id: "eeg-signal-proof",
    title: "采集证明",
    type: "signal",
    description: "原始 EEG 波形或 OpenBCI GUI 采集截图。后续可补充实际采集记录。",
    src: null,
    thumbnail: null,
    required: true,
  },
  {
    id: "hardware-demo-video",
    title: "演示视频",
    type: "video",
    description: "硬件接入、佩戴与信号采集的短视频演示（10-30 秒）。",
    src: null,
    thumbnail: null,
    duration: null,
    required: false,
  },
];

export const hardwareSpecSlots: HardwareSpecSlot[] = [
  { id: "device-name", label: "设备名称", value: "ExpandableEEG" },
  { id: "model", label: "型号", value: "ExpandableEEG-8/16/32（模块化）" },
  { id: "chip", label: "核心芯片", value: "ADS1299（德州仪器）" },
  { id: "precision", label: "采集精度", value: "24", unit: "bit" },
  { id: "sample-rate", label: "采样率", value: "250 / 500 / 1000（WiFi）· 250（蓝牙）", unit: "Hz" },
  { id: "electrode-count", label: "通道数", value: "8 / 16 / 32（无需烧录，自动扩展）" },
  { id: "noise", label: "噪声水平", value: "≤1 μVpp · 共模抑制比 ≥110 dB" },
  { id: "connection", label: "通信方式", value: "WiFi AP / WiFi Client / 蓝牙 BT" },
  { id: "battery-life", label: "续航", value: "10 小时（充电约 2 小时）" },
  { id: "charging", label: "充电接口", value: "USB Type-C" },
];

export function displaySpecValue(slot: HardwareSpecSlot) {
  if (!slot.value) return "待补充";
  return slot.unit ? `${slot.value} ${slot.unit}` : slot.value;
}
