import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bluetooth,
  BluetoothSearching,
  CircleCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import SubScreen from "../../components/SubScreen";
import { Chip, Reveal } from "../../components/ui";
import {
  displaySpecValue,
  hardwareAssetSlots,
  hardwareMaterialStatus,
  hardwareSpecSlots,
} from "../../data/hardware";
import { otherDevices, electrodes, calibrationSteps } from "../../data/mock";

function qColor(q: number) {
  return q >= 85 ? "var(--calm)" : q >= 70 ? "var(--joy)" : "var(--stress)";
}

export default function DeviceScreen() {
  // 信号质量轻微跳动
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const live = electrodes.map((e, i) => ({
    ...e,
    q: Math.max(58, Math.min(98, e.quality + Math.round(Math.sin(tick + i) * 4))),
  }));
  // 校准流程
  const [calibrating, setCalibrating] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!calibrating) return;
    if (step >= calibrationSteps.length - 1) {
      const t = setTimeout(() => setCalibrating(false), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [calibrating, step]);
  const startCalib = () => { setStep(0); setCalibrating(true); };

  return (
    <SubScreen title="设备与脑电校准">
      <Reveal i={0}>
        <div className="card hero g-hero">
          <div className="row between">
            <span className="kicker" style={{ color: "rgba(255,255,255,.78)" }}>ExpandableEEG 脑电采集系统</span>
            <Chip variant="glass">ADS1299</Chip>
          </div>
          <div className="row" style={{ gap: 14 }}>
            <div className="avatar" style={{ width: 54, height: 54, background: "rgba(255,255,255,.22)", overflow: "hidden", borderRadius: 16 }}>
              <img src="/hardware/wearing-face.jpg" alt="佩戴图" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="col grow">
              <span className="h2">24bit · 最高1000Hz · 10h续航</span>
              <span className="muted on-80">8/16/32 通道模块化扩展 · WiFi/蓝牙双模 · 可离线采集</span>
            </div>
          </div>
          <div className="hero-mini-stats">
            <div><div className="tiny on-70" style={{ fontWeight: 600 }}>通道数</div><div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>8-32</div></div>
            <div><div className="tiny on-70" style={{ fontWeight: 600 }}>采样率</div><div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>1000Hz</div></div>
            <div><div className="tiny on-70" style={{ fontWeight: 600 }}>续航</div><div className="num" style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>10h</div></div>
          </div>
        </div>
      </Reveal>

      {/* 佩戴图与参数 */}
      <Reveal i={1}>
        <div className="card hardware-material-card">
          <div className="row between top">
            <div className="col grow">
              <span className="title">{hardwareMaterialStatus.title}</span>
              <span className="muted">{hardwareMaterialStatus.description}</span>
            </div>
            <Chip variant="teal">{hardwareMaterialStatus.stateLabel}</Chip>
          </div>

          {/* 佩戴实拍图 */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {hardwareAssetSlots.filter((s) => s.src && s.type === "image").map((slot) => (
              <div key={slot.id} style={{ flex: 1, borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", background: "var(--blue-soft)" }}>
                <img src={slot.src!} alt={slot.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>

          <div className="hardware-spec-grid">
            {hardwareSpecSlots.map((slot) => (
              <div className="hardware-spec" key={slot.id}>
                <span>{slot.label}</span>
                <strong>{displaySpecValue(slot)}</strong>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="tiny" style={{ fontWeight: 700, color: "var(--t-secondary)" }}>电极覆盖（8 通道）</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["FP1", "FP2", "F3", "F4", "C3", "C4", "P3", "P4"].map((ch) => (
                <span key={ch} className="chip" style={{ background: "var(--brand-soft, var(--blue-soft))", color: "var(--brand-deep)", fontWeight: 700, fontSize: 12 }}>{ch}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="tiny" style={{ color: "var(--teal-deep)" }}>额叶：FP1/FP2/F3/F4 → 情绪与决策</span>
              <span className="tiny" style={{ color: "var(--brand-deep)" }}>中央：C3/C4 → 专注与运动意象</span>
              <span className="tiny" style={{ color: "var(--t-secondary)" }}>顶叶：P3/P4 → 感知与整合</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 通信方式 */}
      <Reveal i={2}>
        <div className="card">
          <span className="title">通信方式</span>
          <span className="muted">支持三种通信模式，使用配置工具一键切换，无需烧录代码。</span>
          <div className="col" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <div className="icon-badge" style={{ background: "var(--teal-soft)", width: 36, height: 36, flex: "none" }}>
                <Wifi size={16} color="var(--teal-deep)" />
              </div>
              <div className="col grow" style={{ gap: 2 }}>
                <span className="body" style={{ fontWeight: 700 }}>WiFi AP 模式</span>
                <span className="tiny">出厂默认。采集板充当热点（SSID: ExpandableEEG AP），采样率最高 1000Hz，适合实验室场景。</span>
              </div>
            </div>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <div className="icon-badge" style={{ background: "var(--blue-soft)", width: 36, height: 36, flex: "none" }}>
                <Wifi size={16} color="var(--brand-deep)" />
              </div>
              <div className="col grow" style={{ gap: 2 }}>
                <span className="body" style={{ fontWeight: 700 }}>WiFi Client 模式</span>
                <span className="tiny">接入现有路由器，设备与手机在同一局域网内通信，适合移动场景。</span>
              </div>
            </div>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <div className="icon-badge" style={{ background: "var(--calm-soft, #eaf5f0)", width: 36, height: 36, flex: "none" }}>
                <Bluetooth size={16} color="var(--calm-deep, #1a7a5e)" />
              </div>
              <div className="col grow" style={{ gap: 2 }}>
                <span className="body" style={{ fontWeight: 700 }}>蓝牙 BT 模式</span>
                <span className="tiny">数据稳定性更优、续航更长，采样率 250Hz，适合日常佩戴场景。</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 电极信号质量 */}
      <Reveal i={3}>
        <div className="card">
          <div className="row between">
            <span className="row" style={{ gap: 8 }}>
              <span className="icon-badge" style={{ width: 28, height: 28, borderRadius: 9, background: "var(--blue-soft)" }}><Activity size={15} color="var(--brand)" /></span>
              <span className="title">电极信号质量</span>
            </span>
            <Chip variant="teal">实时信号</Chip>
          </div>
          {live.map((e) => (
            <div className="row" key={e.name} style={{ gap: 10 }}>
              <span className="muted" style={{ width: 92, fontSize: 11.5 }}>{e.name}</span>
              <div className="track grow"><motion.i animate={{ width: `${e.q}%` }} transition={{ duration: 0.8 }} style={{ background: qColor(e.q) }} /></div>
              <span className="num" style={{ width: 36, textAlign: "right", fontSize: 12, fontWeight: 700, color: qColor(e.q) }}>{e.q}</span>
            </div>
          ))}
          <span className="tiny">佩戴时确保电极与皮肤良好接触，信号质量 &gt; 85 时识别效果最佳。</span>
        </div>
      </Reveal>

      {/* 校准 */}
      <Reveal i={4}>
        <div className="card">
          <span className="title">情绪模型校准</span>
          <span className="muted">采集 90 秒静息基线，让情绪识别更贴合你本人。建议每周或更换佩戴位置后做一次。</span>
          <AnimatePresence mode="wait">
            {calibrating ? (
              <motion.div key="calib" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col" style={{ gap: 12, alignItems: "center", padding: "8px 0" }}>
                <div className="gauge" style={{ width: 96, height: 96 }}>
                  <svg viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="41" fill="none" stroke="#e9f1f6" strokeWidth="8" />
                    <motion.circle cx="48" cy="48" r="41" fill="none" stroke="var(--brand)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 41}
                      animate={{ strokeDashoffset: 2 * Math.PI * 41 * (1 - (step + 1) / calibrationSteps.length) }}
                      transition={{ duration: 0.9 }} />
                  </svg>
                  <div className="gauge-center"><span className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--brand-deep)" }}>{Math.round(((step + 1) / calibrationSteps.length) * 100)}%</span></div>
                </div>
                <div className="col" style={{ gap: 6, width: "100%" }}>
                  {calibrationSteps.map((s, i) => (
                    <div className="row" key={s} style={{ gap: 8 }}>
                      {i < step || (i === calibrationSteps.length - 1 && step === calibrationSteps.length - 1)
                        ? <CircleCheck size={16} color="var(--calm)" />
                        : i === step ? <RefreshCw size={16} color="var(--brand)" className="spin" />
                        : <span style={{ width: 16, height: 16, borderRadius: 999, border: "2px solid var(--hairline)" }} />}
                      <span className="body" style={{ color: i <= step ? "var(--t-primary)" : "var(--t-tertiary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="btn btn-primary btn-block" onClick={startCalib}>
                <RefreshCw size={16} /> 开始校准（约 90 秒）
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Reveal>

      {/* 其他设备 */}
      <Reveal i={5}>
        <div className="card">
          <span className="title">我的设备</span>
          {otherDevices.map((d) => (
            <div className="list-row" key={d.name}>
              <div className="icon-badge" style={{ width: 40, height: 40, background: "var(--blue-soft)", fontSize: 18 }}>{d.emoji}</div>
              <div className="col grow"><span className="body" style={{ fontWeight: 600 }}>{d.name}</span><span className="tiny">{d.note}</span></div>
              <span className="chip"><BluetoothSearching size={12} /> 连接</span>
            </div>
          ))}
          <button className="btn btn-ghost btn-block"><Plus size={16} /> 添加新设备</button>
        </div>
      </Reveal>

      <Reveal i={6}>
        <div className="card tint-teal" style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <ShieldCheck size={18} color="var(--teal-deep)" style={{ marginTop: 2, flex: "none" }} />
          <span className="muted">采集到的脑电数据全程端侧加密，仅你本人与你授权的校心理中心可见，绝不对外共享。</span>
        </div>
      </Reveal>
    </SubScreen>
  );
}
