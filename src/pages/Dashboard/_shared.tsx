import type { ReactNode } from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

/** Chuẩn hoá response về mảng (các service trả nguyên envelope `{data:{content}}`). */
export function asArray<T = unknown>(x: unknown): T[] {
  if (Array.isArray(x)) return x as T[];
  const o = x as Record<string, unknown> | null | undefined;
  const c = o?.data as Record<string, unknown> | undefined;
  if (Array.isArray(c?.content)) return c!.content as T[];
  if (Array.isArray(o?.content)) return o!.content as T[];
  if (Array.isArray(o?.data)) return o!.data as T[];
  return [];
}

/** "21Bđ" · "720trđ" — định dạng tiền gọn cho dashboard. */
export function fmtVnd(amount?: number | null): string {
  const n = amount ?? 0;
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${v >= 10 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)}Bđ`;
  }
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}trđ`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}kđ`;
  return `${n}đ`;
}

export function fmtNum(n?: number | null): string {
  return new Intl.NumberFormat("vi-VN").format(n ?? 0);
}

export function StatTile({
  label,
  value,
  sub,
  tone,
  delta,
  deltaTone = "good",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: string;
  delta?: ReactNode;
  deltaTone?: "good" | "warn" | "crit";
}) {
  const deltaCls =
    deltaTone === "warn"
      ? "text-amber-600"
      : deltaTone === "crit"
        ? "text-red-500"
        : "text-emerald-600";
  return (
    <Card size="small" className="rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-[13px] font-medium text-gray-500">{label}</div>
      <div className={`mt-1.5 text-[26px] font-bold leading-tight text-gray-900 ${tone ?? ""}`}>
        {value}
      </div>
      {delta && <div className={`mt-1.5 text-xs font-semibold ${deltaCls}`}>{delta}</div>}
      {sub && <div className="mt-1.5 text-xs text-gray-400">{sub}</div>}
    </Card>
  );
}

export function PanelCard({
  title,
  subtitle,
  extra,
  children,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Title level={5} className="!mb-0">
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" className="text-xs">
              {subtitle}
            </Text>
          )}
        </div>
        {extra}
      </div>
      {children}
    </Card>
  );
}

/** Barlist ngang đơn giản (label · thanh · giá trị). */
export function BarList({
  rows,
}: {
  rows: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[140px_1fr_92px] items-center gap-3">
          <div className="truncate text-[13px] font-medium text-gray-700">{r.label}</div>
          <div className="h-4 overflow-hidden rounded bg-gray-100">
            <div
              className="h-full rounded bg-[#2a78d6]"
              style={{ width: `${Math.round((r.value / max) * 100)}%` }}
            />
          </div>
          <div className="text-right font-mono text-xs text-gray-600">{r.display}</div>
        </div>
      ))}
      {rows.length === 0 && <div className="py-4 text-center text-xs text-gray-400">Chưa có dữ liệu</div>}
    </div>
  );
}
