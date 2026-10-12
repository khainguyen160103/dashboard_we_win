import type { ReactNode } from "react";
import { Card } from "antd";
import type { Tone } from "../utils/campaignFlow";

const DOT: Record<Tone, { dot: string; text: string }> = {
  good: { dot: "bg-green-600", text: "text-green-700" },
  warn: { dot: "bg-amber-400", text: "text-amber-700" },
  crit: { dot: "bg-red-600", text: "text-red-600" },
  muted: { dot: "bg-gray-300", text: "text-gray-500" },
};

export function StatusDot({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${DOT[tone].text}`}>
      <i className={`inline-block h-[7px] w-[7px] shrink-0 rounded-full ${DOT[tone].dot}`} />
      {children}
    </span>
  );
}

export type Stat = { t: string; v: ReactNode; note?: ReactNode; d?: ReactNode; dtone?: "good" | "warn" };

/** Ô chỉ số kiểu `.stat-tile` của artifact (t = tiêu đề, v = giá trị, d = delta, note = ghi chú). */
export function StatGrid({ items, cols }: { items: Stat[]; cols: 2 | 3 | 4 | 5 }) {
  const grid = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-3 lg:grid-cols-5",
  }[cols];
  return (
    <div className={`grid grid-cols-1 gap-3.5 ${grid}`}>
      {items.map((s) => (
        <Card key={s.t} size="small" className="rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">{s.t}</div>
          <div className="mt-1.5 font-mono text-[23px] font-semibold tabular-nums text-gray-900">{s.v}</div>
          {s.d && (
            <div className={`mt-1 font-mono text-[11.5px] ${s.dtone === "warn" ? "text-amber-700" : "text-green-700"}`}>
              {s.d}
            </div>
          )}
          {s.note && <div className="mt-1 text-[11px] text-gray-400">{s.note}</div>}
        </Card>
      ))}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <div className="p-6 text-center text-[13px] text-gray-500">{children}</div>;
}
