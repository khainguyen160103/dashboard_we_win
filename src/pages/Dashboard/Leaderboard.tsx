import { useMemo, useState } from "react";
import { Modal } from "antd";
import { fmtVnd, PanelCard } from "./_shared";

// ── Hash ổn định để sinh chỉ số demo (giống demo gốc) ───────────────────────
function strHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function demoGmv(seed: string, minM: number, maxM: number) {
  const h = strHash(seed);
  const valM = minM + (h % (maxM - minM + 1)) + ((h >> 7) % 100) / 100;
  return Math.round((valM * 1e6) / 1e4) * 1e4;
}
type Metric = { value: number; delta: number };
function rankMetrics(seed: string, baseGmv: number): Record<string, Metric> {
  const h = strHash(seed);
  const commission = Math.round((baseGmv * (0.08 + (h % 6) / 100)) / 1e4) * 1e4;
  const orders = Math.max(1, Math.round(baseGmv / (120000 + (h % 12) * 15000)));
  const views = Math.round((baseGmv / 1000) * (2.5 + (h % 50) / 10));
  const deltaOf = (k: string) => ((strHash(seed + "_" + k) % 1200) / 10) - 60;
  return {
    gmv: { value: baseGmv, delta: deltaOf("gmv") },
    commission: { value: commission, delta: deltaOf("commission") },
    orders: { value: orders, delta: deltaOf("orders") },
    views: { value: views, delta: deltaOf("views") },
  };
}

const TABS = [
  { key: "gmv", label: "GMV nhà sáng tạo", fmt: (v: number) => fmtVnd(v) },
  { key: "commission", label: "Hoa hồng ước tính", fmt: (v: number) => fmtVnd(v) },
  { key: "orders", label: "Đơn hàng nhà sáng tạo", fmt: (v: number) => `${v.toLocaleString("vi-VN")} đơn` },
  {
    key: "views",
    label: "Lượt xem video",
    fmt: (v: number) =>
      `${v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : String(v)} lượt xem`,
  },
];

const CATEGORIES = [
  { key: "campaigns", title: "chiến dịch hàng đầu", icon: "🎯" },
  { key: "creators", title: "nhà sáng tạo hàng đầu", icon: null },
  { key: "products", title: "sản phẩm hàng đầu", icon: "📦" },
  { key: "shops", title: "cửa hàng cộng tác hàng đầu", icon: "🏬" },
  { key: "videos", title: "video hàng đầu", icon: "🎬" },
];

const PRODUCTS = [
  "Serum Vitamin C 30ml",
  "Kem chống nắng SPF50+",
  "Máy hút bụi cầm tay",
  "Tai nghe không dây Pro",
  "Sữa hạt óc chó 1L",
  "Nồi chiên không dầu 5L",
  "Bàn phím cơ RGB",
  "Bộ chăm sóc da 5 bước",
];
const VIDEOS = [
  "Review chân thực sau 30 ngày",
  "Unbox & first impression",
  "Trend dance x sản phẩm",
  "GRWM cùng skincare routine",
  "So sánh 3 sản phẩm hot",
  "Mẹo dùng đúng cách",
];

type Item = { name: string; initials?: string; metrics: Record<string, Metric> };

const initials = (name: string) => {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
};

function RankRow({
  item,
  rank,
  metricKey,
  total,
  catKey,
  catIcon,
}: {
  item: Item;
  rank: number;
  metricKey: string;
  total: number;
  catKey: string;
  catIcon: string | null;
}) {
  const m = item.metrics[metricKey];
  const share = total > 0 ? (m.value / total) * 100 : 0;
  const up = m.delta >= 0;
  const tab = TABS.find((t) => t.key === metricKey)!;
  return (
    <div className="flex items-center gap-3 border-t border-gray-100 py-2.5 first:border-t-0">
      <div
        className={`w-5 text-center font-mono font-bold ${rank === 1 ? "text-base" : "text-xs text-gray-400"}`}
      >
        {rank === 1 ? "🏆" : rank}
      </div>
      {catKey === "creators" ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500">
          {item.initials}
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
          {catIcon ?? "•"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-gray-900" title={item.name}>
          {item.name}
        </div>
        <div className="text-[11px] text-gray-400">{share.toFixed(2)}% tổng nhóm</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[13px] font-bold text-gray-900">{tab.fmt(m.value)}</div>
        <div className={`text-[11px] font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
          {up ? "▲" : "▼"} {Math.abs(m.delta).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard({
  campaigns,
  creators,
  brands,
}: {
  campaigns: { name: string; gmv?: number }[];
  creators: { name: string; gmv?: number }[];
  brands: { name: string; gmv?: number }[];
}) {
  const [metric, setMetric] = useState("gmv");
  const [modalCat, setModalCat] = useState<string | null>(null);

  const data = useMemo<Record<string, Item[]>>(
    () => ({
      campaigns: campaigns.map((c) => ({
        name: c.name,
        metrics: rankMetrics("camp_" + c.name, c.gmv || demoGmv("camp_" + c.name, 200, 4000)),
      })),
      creators: creators.map((k) => ({
        name: k.name,
        initials: initials(k.name),
        metrics: rankMetrics("creator_" + k.name, k.gmv || demoGmv("creator_" + k.name, 30, 900)),
      })),
      products: PRODUCTS.map((p) => ({
        name: p,
        metrics: rankMetrics("prod_" + p, demoGmv("prod_" + p, 3, 40)),
      })),
      shops: brands.map((b) => ({
        name: b.name,
        metrics: rankMetrics("shop_" + b.name, b.gmv || demoGmv("shop_" + b.name, 100, 3000)),
      })),
      videos: VIDEOS.map((v) => ({
        name: v,
        metrics: rankMetrics("video_" + v, demoGmv("video_" + v, 2, 38)),
      })),
    }),
    [campaigns, creators, brands],
  );

  const sorted = (catKey: string) => {
    const list = [...(data[catKey] ?? [])].sort(
      (a, b) => b.metrics[metric].value - a.metrics[metric].value,
    );
    const total = list.reduce((s, it) => s + it.metrics[metric].value, 0) || 1;
    return { list, total };
  };

  return (
    <PanelCard
      title="Bảng xếp hạng"
      subtitle="Top hiệu suất theo từng nhóm đối tượng trong kỳ"
    >
      <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMetric(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[12.5px] font-bold ${
              metric === t.key
                ? "border-[#1c64f2] text-[#1c64f2]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const { list, total } = sorted(cat.key);
          return (
            <div
              key={cat.key}
              className={`rounded-xl border border-gray-100 p-4 ${cat.key === "videos" ? "lg:col-span-2" : ""}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="text-[13.5px] font-extrabold text-gray-900">
                  Top {list.length} {cat.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setModalCat(cat.key)}
                  className="whitespace-nowrap text-xs font-bold text-[#1c64f2] hover:underline"
                >
                  Xem tất cả ›
                </button>
              </div>
              {list.slice(0, 4).map((item, i) => (
                <RankRow
                  key={item.name}
                  item={item}
                  rank={i + 1}
                  metricKey={metric}
                  total={total}
                  catKey={cat.key}
                  catIcon={cat.icon}
                />
              ))}
              {list.length === 0 && (
                <div className="py-4 text-center text-xs text-gray-400">Chưa có dữ liệu</div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={modalCat !== null}
        onCancel={() => setModalCat(null)}
        footer={null}
        width={640}
        title={
          modalCat
            ? `Top ${sorted(modalCat).list.length} ${CATEGORIES.find((c) => c.key === modalCat)?.title}`
            : ""
        }
      >
        {modalCat && (
          <div className="max-h-[70vh] overflow-y-auto">
            {sorted(modalCat).list.map((item, i) => (
              <RankRow
                key={item.name}
                item={item}
                rank={i + 1}
                metricKey={metric}
                total={sorted(modalCat).total}
                catKey={modalCat}
                catIcon={CATEGORIES.find((c) => c.key === modalCat)?.icon ?? null}
              />
            ))}
          </div>
        )}
      </Modal>
    </PanelCard>
  );
}
