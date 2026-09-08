import { useNavigate, useParams } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Spin, Tag, Typography } from "antd";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useCampaign } from "../hooks/query/useCampaignQuery";
import { formatDate } from "../utils/formatDate";
import { CampaignInvitePanel } from "../components/campaign/CampaignInvitePanel";
import {
  CampaignRosterPanel,
  CampaignSamplePanel,
  CampaignVideoPanel,
} from "../components/campaign/CampaignExtraPanels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
);

const { Title, Paragraph, Text } = Typography;

// ─── Mock chart data (thay bằng dữ liệu backend khi có) ──────────────────────
const WEEKLY_GMV_LABELS = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6"];
const WEEKLY_GMV_CUMULATIVE = [
  400_000_000, 1_100_000_000, 2_000_000_000, 3_100_000_000, 4_100_000_000, 4_800_000_000,
];

const BUDGET_BREAKDOWN = [
  { label: "Phí KOC", value: 720, color: "#2a78d6" },
  { label: "Media / Boost ads", value: 300, color: "#eb6834" },
  { label: "Sản xuất nội dung", value: 120, color: "#1baf7a" },
  { label: "Dự phòng", value: 60, color: "#eda100" },
];

const formatShortVnd = (value: number) =>
  value >= 1_000_000_000
    ? `${(value / 1_000_000_000).toFixed(1)}B₫`
    : `${Math.round(value / 1_000_000)}tr₫`;

const MILESTONES = [
  "Brief duyệt",
  "KOC xác nhận tham gia",
  "Nội dung nháp",
  "Duyệt nội dung",
  "Đăng bài",
  "Báo cáo kết quả",
];

type MilestoneState = "done" | "current" | "upcoming";

function milestoneState(index: number, progress: number): MilestoneState {
  const start = (index / MILESTONES.length) * 100;
  const end = ((index + 1) / MILESTONES.length) * 100;
  if (progress >= end) return "done";
  if (progress >= start) return "current";
  return "upcoming";
}

const MILESTONE_META: Record<MilestoneState, { label: string; className: string }> = {
  done: { label: "✓ Hoàn tất", className: "text-green-600" },
  current: { label: "● Đang thực hiện", className: "text-blue-600" },
  upcoming: { label: "Chưa tới", className: "text-gray-400" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Nháp", color: "default" },
  ACTIVE: { label: "Đang chạy", color: "green" },
  DONE: { label: "Hoàn thành", color: "blue" },
  WARNING: { label: "Cần chú ý", color: "orange" },
  CANCELLED: { label: "Đã huỷ", color: "red" },
};

const DAY_MS = 1000 * 60 * 60 * 24;

function diffInDays(from?: string | Date | null, to?: string | Date | null): number | null {
  if (!from || !to) return null;
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / DAY_MS);
}

type Metric = {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  percent?: number;
};

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card size="small" className="rounded-2xl border border-gray-100 shadow-sm">
      <Text type="secondary" className="text-xs">
        {metric.label}
      </Text>
      <div className="mt-1 flex items-baseline gap-2">
        {metric.percent !== undefined && (
          <span className="text-2xl font-semibold text-gray-900">{metric.percent}%</span>
        )}
        <span
          className={
            metric.percent !== undefined
              ? "text-sm text-gray-500"
              : "text-2xl font-semibold text-gray-900"
          }
        >
          {metric.value}
        </span>
      </div>
      {metric.sub && <div className="mt-1 text-xs text-gray-400">{metric.sub}</div>}
      {metric.trend && (
        <div className="mt-1 text-xs font-medium text-green-600">▲ {metric.trend}</div>
      )}
    </Card>
  );
}

export const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading, isError } = useCampaign(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin tip="Đang tải chiến dịch..." />
      </div>
    );
  }

  if (isError || !campaign) {
    return <Empty description="Không tìm thấy chiến dịch" className="py-16" />;
  }

  const campaignId = id ?? String(campaign.id ?? "");
  const status = STATUS_META[campaign.status] ?? { label: campaign.status, color: "default" };

  const totalDays = diffInDays(campaign.startTime, campaign.endTime);
  const remainingDays = diffInDays(new Date(), campaign.endTime);
  const elapsedDays = diffInDays(campaign.startTime, new Date());
  const timeProgress =
    totalDays && totalDays > 0 && elapsedDays !== null
      ? Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)))
      : 0;

  const metrics: Metric[] = [
    { label: "Ngân sách đã dùng", value: "1.2B₫ / 1.5B₫", percent: 80 },
    { label: "GMV tạo ra", value: "4.8B₫" },
    { label: "ROI", value: "4.0x", trend: "vượt mục tiêu 3.5x" },
    {
      label: "Tiến độ thời gian",
      value: "",
      percent: timeProgress,
      sub: "% thời gian đã trôi qua, không phải % hiệu quả",
    },
    { label: "KOC xác nhận", value: "16/20", sub: "80% đã xác nhận tham gia" },
    { label: "Video đã duyệt", value: "10/11", sub: "trên tổng 12 video giao" },
  ];

  const remainingLabel =
    remainingDays === null
      ? null
      : remainingDays > 0
        ? `${remainingDays} ngày còn lại`
        : remainingDays === 0
          ? "Kết thúc hôm nay"
          : `Đã kết thúc ${Math.abs(remainingDays)} ngày`;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="!px-0"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
      </div>

      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Title level={3} className="!mb-1">
              {campaign.name}
            </Title>
            <Text type="secondary">
              {[
                campaign.brandName,
                `${formatDate(campaign.startTime)} – ${formatDate(campaign.endTime)}`,
                remainingLabel && totalDays !== null
                  ? `${remainingLabel} (tổng ${totalDays} ngày)`
                  : remainingLabel,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </div>
          <Tag color={status.color} className="shrink-0">
            {status.label}
          </Tag>
        </div>

        {campaign.description && (
          <Paragraph className="!mt-4 !mb-0 text-gray-700">{campaign.description}</Paragraph>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Title level={5} className="!mb-0">
            GMV theo tuần
          </Title>
          <Text type="secondary" className="text-xs">
            Tích lũy trong vòng đời chiến dịch
          </Text>
          <div className="mt-3 h-72">
            <Bar
              data={{
                labels: WEEKLY_GMV_LABELS,
                datasets: [
                  {
                    label: "GMV (₫)",
                    data: WEEKLY_GMV_CUMULATIVE,
                    backgroundColor: "#2a78d6",
                    borderRadius: 6,
                    maxBarThickness: 40,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "top" },
                  tooltip: {
                    callbacks: {
                      label: (ctx: TooltipItem<"bar">) =>
                        ` ${formatShortVnd(Number(ctx.parsed.y))}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => formatShortVnd(Number(value)) },
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Title level={5} className="!mb-0">
            Ngân sách theo hạng mục
          </Title>
          <Text type="secondary" className="text-xs">
            Phân bổ ngân sách đã dùng
          </Text>
          <div className="mt-3 h-72">
            <Doughnut
              data={{
                labels: BUDGET_BREAKDOWN.map((b) => b.label),
                datasets: [
                  {
                    label: "Ngân sách (triệu ₫)",
                    data: BUDGET_BREAKDOWN.map((b) => b.value),
                    backgroundColor: BUDGET_BREAKDOWN.map((b) => b.color),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: (ctx: TooltipItem<"doughnut">) =>
                        ` ${ctx.label}: ${Number(ctx.parsed)}tr₫`,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Title level={5} className="!mb-0">
          Tiến trình chiến dịch
        </Title>
        <Text type="secondary" className="text-xs">
          {MILESTONES.length} mốc chuẩn — trạng thái tính theo % tiến độ thời gian
        </Text>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MILESTONES.map((label, index) => {
            const meta = MILESTONE_META[milestoneState(index, timeProgress)];
            return (
              <div key={label} className="rounded-xl border border-gray-100 p-3">
                <div className="text-sm font-medium text-gray-900">{label}</div>
                <div className={`mt-1 text-xs font-medium ${meta.className}`}>{meta.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tầng 3–6: nối API thật (campaign-koc / jobs) */}
      <CampaignInvitePanel campaignId={campaignId} campaignName={campaign.name} />
      <CampaignRosterPanel campaignId={campaignId} />
      <CampaignSamplePanel campaignId={campaignId} />
      <CampaignVideoPanel campaignId={campaignId} />
    </div>
  );
};
