import { useMemo } from "react";
import { Alert, Spin, Table, Tag, Tooltip, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useCampaigns } from "../../hooks/query/useCampaignQuery";
import { useKoc } from "../../hooks/query/useKocQuery";
import { useBrandsQuery } from "../../hooks/query/useBrandQuery";
import { useJobsQuery } from "../../hooks/query/useJobQuery";
import { BarList, fmtNum, fmtVnd, PanelCard, StatTile } from "./_shared";
import {
  MOCK_BRANDS,
  MOCK_CAMPAIGNS,
  MOCK_JOBS,
  MOCK_KOCS,
  withFallback,
} from "./mockData";
import Leaderboard from "./Leaderboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  ChartTooltip,
  Legend,
);

const { Title, Text } = Typography;

const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];
const GMV_MONTH_SHARE = [0.1, 0.13, 0.16, 0.18, 0.21, 0.22];

const isActive = (s?: string) => String(s ?? "").toUpperCase() === "ACTIVE";
const vStatus = (j: any) => String(j.videoStatus || j.status || "").toUpperCase();

type CampaignRow = {
  id: string;
  name: string;
  brandName?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  targetTotalKoc?: number;
};

// ── Mock: Hiệu suất Team Vận hành (PM) — chưa có API workload PM ──────────────
type PmRow = {
  name: string;
  kocManaged: number;
  activeCampaigns: number;
  approved: number;
  rejected: number;
  sla: number;
  capacity: "overloaded" | "normal" | "spare";
  capacityLabel: string;
  schedule: "behind" | "watch" | "onTrack";
  scheduleLabel: string;
};
const MOCK_PM: PmRow[] = [
  { name: "Lan Anh", kocManaged: 62, activeCampaigns: 4, approved: 118, rejected: 12, sla: 6.4, capacity: "overloaded", capacityLabel: "128% TB team — quá tải, cân nhắc không giao thêm", schedule: "behind", scheduleLabel: "Comfort Mùa hè: -14 điểm % so với tiến độ · còn 7 ngày" },
  { name: "Minh Khoa", kocManaged: 41, activeCampaigns: 3, approved: 96, rejected: 8, sla: 5.1, capacity: "normal", capacityLabel: "92% TB team — tải vừa đủ", schedule: "watch", scheduleLabel: "Sữa rửa mặt X: -5 điểm % so với tiến độ · còn 12 ngày" },
  { name: "Thu Trang", kocManaged: 33, activeCampaigns: 2, approved: 74, rejected: 5, sla: 4.6, capacity: "spare", capacityLabel: "74% TB team — còn dư sức, có thể nhận thêm ~8 KOC", schedule: "onTrack", scheduleLabel: "Không có deadline trong 14 ngày tới" },
];

// ── Mock: Hiệu suất Team Account ─────────────────────────────────────────────
type AcRow = {
  name: string;
  new30d: number;
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
  gmv: number;
};
const MOCK_AC: AcRow[] = [
  { name: "Hải Yến", new30d: 3, total: 12, completed: 7, inProgress: 5, completionRate: 58, gmv: 4_200_000_000 },
  { name: "Đức Anh", new30d: 2, total: 9, completed: 6, inProgress: 3, completionRate: 67, gmv: 3_100_000_000 },
  { name: "Ngọc Diệp", new30d: 4, total: 14, completed: 5, inProgress: 9, completionRate: 36, gmv: 2_600_000_000 },
];

const capDot = (c: PmRow["capacity"]) =>
  c === "overloaded" ? "#d03b3b" : c === "spare" ? "#0ca30c" : "#fab219";
const schDot = (s: PmRow["schedule"]) =>
  s === "behind" ? "#d03b3b" : s === "watch" ? "#fab219" : "#0ca30c";

function Dot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-start gap-1.5 text-[13px] text-gray-700">
      <span className="mt-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span>{children}</span>
    </span>
  );
}

function AlertCard({
  tone,
  title,
  count,
  rows,
  empty,
}: {
  tone: "risk" | "deadline";
  title: string;
  count: number;
  rows: { name: string; meta: string; metric: string; sub?: string }[];
  empty: string;
}) {
  const cls = tone === "risk" ? "border-red-200 bg-red-50/60" : "border-cyan-200 bg-cyan-50/60";
  const titleCls = tone === "risk" ? "text-red-600" : "text-cyan-700";
  return (
    <div className={`flex-1 rounded-2xl border p-4 ${cls}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`font-semibold ${titleCls}`}>
          {tone === "risk" ? "⚠ " : "⏱ "}
          {title}
        </div>
        <span className="text-sm font-bold text-gray-500">{count}</span>
      </div>
      <div className="mt-3 divide-y divide-black/5">
        {rows.length === 0 && <div className="py-2 text-xs text-gray-500">{empty}</div>}
        {rows.map((r) => (
          <div key={r.name} className="flex items-start justify-between gap-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-800">{r.name}</div>
              <div className="text-xs text-gray-400">{r.meta}</div>
            </div>
            <div className="whitespace-nowrap text-right text-xs font-semibold text-gray-700">
              {r.metric}
              {r.sub && <div className="font-normal text-gray-400">{r.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const progressOf = (c: CampaignRow) => {
  const a = c.startTime ? new Date(c.startTime).getTime() : NaN;
  const b = c.endTime ? new Date(c.endTime).getTime() : NaN;
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - a) / (b - a)) * 100)));
};

export default function AgencyOverview() {
  const campaignsQ = useCampaigns({ limit: 200 });
  const kocsQ = useKoc(undefined, { enabled: true });
  const brandsQ = useBrandsQuery();
  const jobsQ = useJobsQuery(undefined, { enabled: true });

  const c = useMemo(() => withFallback<CampaignRow>(campaignsQ, MOCK_CAMPAIGNS), [campaignsQ.data, campaignsQ.isError, campaignsQ.isLoading]);
  const k = useMemo(() => withFallback<any>(kocsQ, MOCK_KOCS), [kocsQ.data, kocsQ.isError, kocsQ.isLoading]);
  const b = useMemo(() => withFallback<any>(brandsQ, MOCK_BRANDS), [brandsQ.data, brandsQ.isError, brandsQ.isLoading]);
  const j = useMemo(() => withFallback<any>(jobsQ, MOCK_JOBS), [jobsQ.data, jobsQ.isError, jobsQ.isLoading]);

  const campaigns = c.rows;
  const kocs = k.rows;
  const brands = b.rows;
  const jobs = j.rows;
  const usingMock = c.usingMock || k.usingMock || b.usingMock || j.usingMock;

  const loading = campaignsQ.isLoading || kocsQ.isLoading || brandsQ.isLoading || jobsQ.isLoading;

  const totalGmv =
    brands.reduce((s, b) => s + (b.gmv ?? 0), 0) || kocs.reduce((s, k) => s + (k.gmv ?? 0), 0);
  const avgRoi = (() => {
    const r = brands.map((b) => b.roi ?? 0).filter((x) => x > 0);
    return r.length ? r.reduce((s, x) => s + x, 0) / r.length : 4.2;
  })();
  const commissionPaid = Math.round(totalGmv * 0.114);
  const activeCampaigns = campaigns.filter((c) => isActive(c.status)).length;
  const videoPending = jobs.filter((j) => ["CHO_PM_DUYET", "PENDING"].includes(vStatus(j))).length;
  const videoDone = jobs.filter((j) => ["DA_PHE_DUYET", "APPROVED"].includes(vStatus(j))).length;
  const kocPending = kocs.filter((k) => {
    const s = String(k.status ?? "").toUpperCase();
    return s.includes("PENDING") || s.includes("CHO") || s === "WARN";
  }).length;

  const gmvLine = useMemo(() => {
    let acc = 0;
    const data = GMV_MONTH_SHARE.map((w) => {
      acc += w;
      return Math.round(totalGmv * acc);
    });
    return {
      labels: MONTHS,
      datasets: [
        {
          label: "GMV (₫)",
          data,
          borderColor: "#2a78d6",
          backgroundColor: "rgba(42,120,214,0.15)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    };
  }, [totalGmv]);

  const brandBars = useMemo(
    () =>
      [...brands]
        .sort((a, b) => (b.gmv ?? 0) - (a.gmv ?? 0))
        .slice(0, 5)
        .map((b) => ({ label: b.name, value: b.gmv ?? 0, display: fmtVnd(b.gmv) })),
    [brands],
  );

  const tierDonut = useMemo(() => {
    const order = ["Mega", "Macro", "Micro", "Nano"];
    const map = new Map<string, number>();
    kocs.forEach((k) => {
      const t = k.tier || k.kocType || "Khác";
      map.set(t, (map.get(t) ?? 0) + 1);
    });
    const labels = [
      ...order.filter((o) => map.has(o)),
      ...[...map.keys()].filter((t) => !order.includes(t)),
    ];
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => map.get(l) ?? 0),
          backgroundColor: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"],
          borderWidth: 2,
        },
      ],
    };
  }, [kocs]);

  const campaignColumns: TableColumnsType<CampaignRow> = [
    {
      title: "Chiến dịch",
      key: "name",
      render: (_, r) => (
        <div>
          <div className="font-medium text-gray-900">{r.name}</div>
          <div className="text-xs text-gray-400">{r.brandName || "—"}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: string) => <Tag color={isActive(s) ? "green" : "default"}>{s || "—"}</Tag>,
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 180,
      render: (_, r) => {
        const p = progressOf(r);
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${p}%` }} />
            </div>
            <span className="w-9 text-right font-mono text-xs text-gray-500">{p}%</span>
          </div>
        );
      },
    },
    {
      title: "KPI KOC",
      dataIndex: "targetTotalKoc",
      key: "kpi",
      width: 110,
      align: "center",
      render: (v: number) => (v ? `mục tiêu ${v}` : "—"),
    },
  ];

  const pmColumns: TableColumnsType<PmRow> = [
    { title: "PM", dataIndex: "name", key: "name", width: 120, render: (v) => <span className="font-medium">{v}</span> },
    { title: "KOC phụ trách", dataIndex: "kocManaged", key: "koc", width: 120, align: "right", render: fmtNum },
    { title: "Chiến dịch đang chạy", dataIndex: "activeCampaigns", key: "ac", width: 150, align: "right" },
    {
      title: "Video đã duyệt / Từ chối",
      key: "vid",
      width: 170,
      align: "right",
      render: (_, r) => `${fmtNum(r.approved)} / ${fmtNum(r.rejected)}`,
    },
    { title: "SLA xử lý TB", dataIndex: "sla", key: "sla", width: 110, align: "right", render: (v) => `${v}h` },
    {
      title: "Tải công việc & dự báo",
      key: "cap",
      width: 320,
      render: (_, r) => <Dot color={capDot(r.capacity)}>{r.capacityLabel}</Dot>,
    },
    {
      title: "Tiến độ so với deadline",
      key: "sch",
      width: 320,
      render: (_, r) => <Dot color={schDot(r.schedule)}>{r.scheduleLabel}</Dot>,
    },
  ];

  const acColumns: TableColumnsType<AcRow> = [
    { title: "Account", dataIndex: "name", key: "name", width: 130, render: (v) => <span className="font-medium">{v}</span> },
    { title: "Chiến dịch mới (30 ngày)", dataIndex: "new30d", key: "n", width: 170, align: "right" },
    { title: "Tổng chiến dịch phụ trách", dataIndex: "total", key: "t", width: 180, align: "right" },
    { title: "Hoàn thành 100%", dataIndex: "completed", key: "c", width: 140, align: "right" },
    { title: "Chưa hoàn thành", dataIndex: "inProgress", key: "i", width: 140, align: "right" },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completionRate",
      key: "r",
      width: 140,
      render: (v: number) => (
        <Dot color={v >= 50 ? "#0ca30c" : "#fab219"}>{v}%</Dot>
      ),
    },
    { title: "GMV mang về", dataIndex: "gmv", key: "g", width: 140, align: "right", render: fmtVnd },
  ];

  const pmNeedsAttention = MOCK_PM.filter((r) => r.capacity === "overloaded" || r.schedule === "behind").length;
  const avgKocPerPm = Math.round(MOCK_PM.reduce((s, r) => s + r.kocManaged, 0) / MOCK_PM.length);
  const avgSla = (MOCK_PM.reduce((s, r) => s + r.sla, 0) / MOCK_PM.length).toFixed(1);
  const totalNew30d = MOCK_AC.reduce((s, r) => s + r.new30d, 0);
  const avgCompletion = Math.round(MOCK_AC.reduce((s, r) => s + r.completionRate, 0) / MOCK_AC.length);
  const totalGmvAc = MOCK_AC.reduce((s, r) => s + r.gmv, 0);

  return (
    <Spin spinning={loading}>
      <div className="flex flex-col gap-6">
        <div>
          <Title level={3} className="!mb-0">
            Tổng quan
          </Title>
          <Text type="secondary">Kết quả kinh doanh &amp; vận hành toàn hệ thống</Text>
        </div>

        {usingMock && (
          <Alert
            type="warning"
            showIcon
            message="Đang hiển thị dữ liệu mẫu — chưa kết nối được máy chủ."
          />
        )}

        {/* Tier 1 · Kết quả kinh doanh */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Tổng GMV" value={fmtVnd(totalGmv)} delta="▲ +12% so với tháng trước" />
          <StatTile
            label="ROI / ROAS"
            value={`${avgRoi.toFixed(1)}x`}
            delta="Mục tiêu 3.5x — vượt mục tiêu"
          />
          <StatTile
            label="Hoa hồng đã trả"
            value={fmtVnd(commissionPaid)}
            sub={totalGmv ? `≈ ${((commissionPaid / totalGmv) * 100).toFixed(1)}% GMV` : undefined}
          />
          <StatTile label="Đơn hàng · AOV" value="3.842 đơn" sub="AOV 4,79trđ/đơn" />
          <StatTile label="Tỷ lệ chuyển đổi" value="3.8%" delta="▲ +0.4 điểm %" />
        </div>

        {/* Tier 2 · Xu hướng & hiệu suất */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PanelCard title="GMV theo tháng" subtitle="Doanh số KOC tạo ra cho toàn bộ nhãn hàng">
              <div className="h-52">
                <Line
                  data={gmvLine}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, ticks: { callback: (v) => fmtVnd(Number(v)) } },
                    },
                  }}
                />
              </div>
            </PanelCard>
          </div>
          <PanelCard title="Hiệu suất theo Brand" subtitle="Top 5 theo GMV tạo ra">
            <BarList rows={brandBars} />
          </PanelCard>
        </div>

        {/* Tier 3 · Vận hành nội bộ */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Campaign đang chạy" value={activeCampaigns} delta="▲ +2 chiến dịch" />
          <StatTile label="Hồ sơ KOC chờ duyệt" value={kocPending} delta="cần rà soát" deltaTone="warn" />
          <StatTile label="Video chờ duyệt" value={videoPending} delta="cần xử lý" deltaTone="warn" />
          <StatTile label="Video đã hoàn thành" value={fmtNum(videoDone)} delta="▲ tiến độ tốt" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PanelCard title="Chiến dịch nổi bật" subtitle="Tiến độ &amp; KPI theo chiến dịch">
              <Table<CampaignRow>
                columns={campaignColumns}
                dataSource={campaigns.slice(0, 8)}
                rowKey="id"
                size="middle"
                pagination={false}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Chưa có chiến dịch" }}
              />
            </PanelCard>
          </div>
          <PanelCard title="Phân bổ KOC theo Tier" subtitle={`${kocs.length} KOC đang quản lý`}>
            <div className="h-52">
              <Doughnut
                data={tierDonut}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                  cutout: "62%",
                }}
              />
            </div>
          </PanelCard>
        </div>

        {/* Tier 4 · Hiệu suất Team Vận hành (PM) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="PM đang phụ trách" value={MOCK_PM.length} />
          <StatTile label="KOC trung bình / PM" value={avgKocPerPm} sub="trên KOC đã xác nhận tham gia" />
          <StatTile
            label="PM cần chú ý"
            value={pmNeedsAttention}
            delta={pmNeedsAttention > 0 ? "quá tải hoặc chậm tiến độ" : "✓ không có cảnh báo"}
            deltaTone={pmNeedsAttention > 0 ? "warn" : "good"}
          />
          <StatTile label="SLA xử lý TB toàn team" value={`${avgSla}h`} />
        </div>
        <PanelCard
          title="Hiệu suất & tải công việc theo PM"
          subtitle="Khối lượng KOC phụ trách, tốc độ xử lý video và tiến độ so với mốc kết thúc chiến dịch"
          extra={
            <Tooltip title="Suy diễn từ khối lượng KOC phụ trách + SLA duyệt video (dữ liệu minh hoạ, chưa có API workload PM)">
              <QuestionCircleOutlined className="text-gray-300" />
            </Tooltip>
          }
        >
          <Table<PmRow>
            columns={pmColumns}
            dataSource={MOCK_PM}
            rowKey="name"
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </PanelCard>
        <div className="flex flex-wrap gap-4">
          <AlertCard
            tone="risk"
            title="PM quá tải — cân nhắc giãn bớt job"
            count={MOCK_PM.filter((r) => r.capacity === "overloaded").length}
            rows={MOCK_PM.filter((r) => r.capacity === "overloaded").map((r) => ({
              name: r.name,
              meta: `${r.kocManaged} KOC đang phụ trách`,
              metric: r.capacityLabel.split(" — ")[0],
            }))}
            empty="Không có PM nào quá tải."
          />
          <AlertCard
            tone="deadline"
            title="Chiến dịch có dấu hiệu chậm tiến độ"
            count={MOCK_PM.filter((r) => r.schedule !== "onTrack").length}
            rows={MOCK_PM.filter((r) => r.schedule !== "onTrack").map((r) => ({
              name: r.scheduleLabel.split(":")[0],
              meta: `PM: ${r.name}`,
              metric: r.scheduleLabel.split("·")[0].split(":")[1]?.trim() ?? "chậm tiến độ",
              sub: r.scheduleLabel.split("·")[1]?.trim(),
            }))}
            empty="Không có chiến dịch nào chậm tiến độ đáng kể."
          />
        </div>

        {/* Tier 5 · Hiệu suất Team Account */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Account đang hoạt động" value={MOCK_AC.length} />
          <StatTile label="Chiến dịch mới (30 ngày)" value={totalNew30d} sub="theo ngày bắt đầu chiến dịch" />
          <StatTile label="Tỷ lệ hoàn thành TB" value={`${avgCompletion}%`} sub="trên tổng chiến dịch phụ trách" />
          <StatTile label="GMV mang về (tất cả Account)" value={fmtVnd(totalGmvAc)} />
        </div>
        <PanelCard
          title="Hiệu suất theo Account"
          subtitle="Số chiến dịch mang về trong 30 ngày gần nhất và tỷ lệ hoàn thành trên tổng chiến dịch đang phụ trách"
        >
          <Table<AcRow>
            columns={acColumns}
            dataSource={MOCK_AC}
            rowKey="name"
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
          />
        </PanelCard>

        {/* Tier 6 · Bảng xếp hạng */}
        <Leaderboard
          campaigns={campaigns.map((c) => ({ name: c.name }))}
          creators={kocs.map((k) => ({ name: k.name, gmv: k.gmv }))}
          brands={brands.map((b) => ({ name: b.name, gmv: b.gmv }))}
        />
      </div>
    </Spin>
  );
}
