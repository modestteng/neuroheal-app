/* eslint-disable react-refresh/only-export-components */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

/* ---------- count-up hook ---------- */
export function useCountUp(target: number, duration = 900, deps: unknown[] = []) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, ...deps]);
  return val;
}

/* ---------- stagger reveal ---------- */
export function Reveal({
  children, i = 0, className, style,
}: { children: ReactNode; i?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: 0.03 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- chip ---------- */
export function Chip({ children, variant = "" }: { children: ReactNode; variant?: string }) {
  return <span className={`chip ${variant}`}>{children}</span>;
}

/* ---------- section header ---------- */
export function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-head">
      <span className="title">{title}</span>
      {link && (
        <span className="link">
          {link} <ChevronRight size={13} />
        </span>
      )}
  </div>
  );
}

/* ---------- mini bar chart ---------- */
export function Bars({ data, color, animate = true }: { data: number[]; color: string; animate?: boolean }) {
  const max = Math.max(...data);
  return (
    <div className="bars">
      {data.map((v, idx) => {
        const h = Math.max(4, (v / max) * 20);
        const active = idx === data.length - 1;
        return (
          <motion.i
            key={idx}
            initial={animate ? { height: 4 } : false}
            animate={{ height: h }}
            transition={{ duration: 0.5, delay: 0.12 + idx * 0.045, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: color, opacity: active ? 1 : 0.3 }}
          />
        );
      })}
    </div>
  );
}

/* ---------- progress track ---------- */
export function Track({ pct, color, onGlass = false }: { pct: number; color: string; onGlass?: boolean }) {
  return (
    <div className={`track ${onGlass ? "on-glass" : ""}`}>
      <motion.i
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: color }}
      />
    </div>
  );
}

/* ---------- gauge ring (gradient stroke + glow) ---------- */
export function GaugeRing({
  value, size = 168, stroke = 14,
  trackColor = "rgba(255,255,255,.26)",
  from = "#ffffff", to = "rgba(255,255,255,.78)",
  glow = true, children,
}: {
  value: number; size?: number; stroke?: number; trackColor?: string;
  from?: string; to?: string; glow?: boolean; children?: ReactNode;
}) {
  const gid = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      {glow && <span className="gauge-glow" />}
      <svg viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#g${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, value / 100)) }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          style={glow ? { filter: "drop-shadow(0 2px 7px rgba(255,255,255,.5))" } : undefined}
        />
      </svg>
      <div className="gauge-center">{children}</div>
    </div>
  );
}

/* ---------- metric mini card ---------- */
export function MetricCard({
  label, value, suffix = "%", note, color, trend, i = 0,
}: { label: string; value: number; suffix?: string; note?: string; color: string; trend: number[]; i?: number }) {
  const n = useCountUp(value, 850);
  return (
    <Reveal i={i} className="grow" style={{ display: "flex" }}>
      <div className="metric-card" style={{ ["--mc-color" as string]: color, width: "100%" }}>
        <div className="mc-top">
          <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
        </div>
        <div className="mc-val">
          <span className="metric-sm num">{n}{suffix}</span>
          {note && <span className="tiny" style={{ color, fontWeight: 700 }}>{note}</span>}
        </div>
        <Bars data={trend} color={color} />
      </div>
    </Reveal>
  );
}

/* ---------- segmented control ---------- */
export function Segmented({ items, value, onChange }: { items: { key: string; label: string }[]; value: string; onChange: (k: string) => void }) {
  const idx = Math.max(0, items.findIndex((it) => it.key === value));
  return (
    <div className="segmented">
      <motion.span
        className="seg-pill"
        animate={{ left: `calc(${(idx / items.length) * 100}% + 4px)`, width: `calc(${100 / items.length}% - 6px)` }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      />
      {items.map((it) => (
        <button key={it.key} className={it.key === value ? "active" : ""} onClick={() => onChange(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}
