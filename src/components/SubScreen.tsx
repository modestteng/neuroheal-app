import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNav } from "../nav";

export default function SubScreen({
  title, accent, children, headRight, bodyClassName,
}: { title: string; accent?: string; children: ReactNode; headRight?: ReactNode; bodyClassName?: string }) {
  const { closeSub } = useNav();
  return (
    <div className="sub-screen">
      <div className="sub-header">
        <button className="sub-back" onClick={closeSub} aria-label="返回">
          <ArrowLeft size={20} color="var(--t-primary)" />
        </button>
        <span className="sub-title" style={accent ? { color: accent } : undefined}>{title}</span>
        <div className="sub-head-right">{headRight}</div>
      </div>
      <div className={`sub-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>{children}</div>
    </div>
  );
}
