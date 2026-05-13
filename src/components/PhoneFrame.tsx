import type { ReactNode } from "react";
import { Signal, Wifi } from "lucide-react";

function BatteryGlyph() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 22,
        height: 11,
        borderRadius: 3.5,
        boxShadow: "inset 0 0 0 1.4px rgba(94,123,138,.6)",
        position: "relative",
      }}
    >
      <span style={{ position: "absolute", inset: "1.6px", width: "82%", borderRadius: 2, background: "var(--t-secondary)" }} />
      <span style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 1.2, width: 1.6, height: 4.5, borderRadius: 1, background: "rgba(94,123,138,.6)" }} />
    </span>
  );
}

function StatusBar() {
  return (
    <div className="statusbar">
      <span className="num">9:41</span>
      <div className="sb-right">
        <Signal size={15} strokeWidth={2.4} />
        <Wifi size={15} strokeWidth={2.4} />
        <span className="bat num">
          82%
          <BatteryGlyph />
        </span>
      </div>
    </div>
  );
}

export default function PhoneFrame({ children, nav, overlay }: { children: ReactNode; nav: ReactNode; overlay?: ReactNode }) {
  return (
    <div className="phone-stage">
      <div className="phone">
        <div className="phone-bg" />
        <div className="phone-island" />
        <StatusBar />
        <div className="viewport">{children}</div>
        {nav}
        <div className="home-indicator">
          <span />
        </div>
        {overlay}
      </div>
    </div>
  );
}
