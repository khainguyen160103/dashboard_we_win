import { useMemo, useState } from "react";
import { Button, Card, Table, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import { CardCampaign } from "../components/campaign/CardCampaign";
import type { Campaign } from "../components/campaign/types";
import {
  getCampaignMetrics,
  getCampaignRowStatus,
  getCampaignSteps,
  getWeeklyGmv,
  getBudgetBreakdown,
  getKocContributions,
  getVideoAggregate,
  getSampleRows,
  getSampleStats,
  formatVndShort,
  formatDateVN,
  totalDays,
  STEP_COLORS,
  type SampleRow,
} from "../components/campaign/campaign.metrics.ts";
import type { CampaignKocDto } from "../model/CampaignKoc";
import {
  CAMPAIGN_KOC_STATUS_COLOR,
  CAMPAIGN_KOC_STATUS_LABEL,
} from "../model/CampaignKoc";
import { useCampaignKocsQuery } from "../hooks/query/useCampaignKocQuery";
import { getCampaignKocStats } from "../components/campaign/campaignKoc.metrics";
import { CampaignInviteListModal } from "../components/campaign/CampaignInviteListModal";
import { CampaignParticipantsModal } from "../components/campaign/CampaignParticipantsModal";
import { KocInfoModal } from "../components/campaign/KocInfoModal";
import { getTierColor } from "../components/koc/koc.utils";

interface CampaignDetailPageProps {
  campaign: Campaign;
  onBack: () => void;
}

/* ── small building blocks ─────────────────────────────────────────────── */

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ background: color }}
    />
  );
}

function PanelCard({
  title,
  subtitle,
  children,
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <Card
      size="small"
      className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-5"
    >
      <div className="mb-4">
        <div className="text-base font-semibold text-gray-800">{title}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}

/* ── page ──────────────────────────────────────────────────────────────── */

export default function CampaignDetailPage({
  campaign,
  onBack,
}: CampaignDetailPageProps) {
  const campaignId = String(campaign.id);

  // Live campaign-KOC data (GET /campaigns/:id/kocs)
  const { data: campaignKocs = [], isLoading: kocsLoading } =
    useCampaignKocsQuery(campaignId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [infoKoc, setInfoKoc] = useState<{ id: string; name?: string } | null>(null);

  const m = useMemo(() => getCampaignMetrics(campaign), [campaign]);
  const status = getCampaignRowStatus(campaign, m);
  const steps = useMemo(() => getCampaignSteps(m), [m]);
  const weekly = useMemo(() => getWeeklyGmv(campaign, m), [campaign, m]);
  const budget = useMemo(() => getBudgetBreakdown(campaign, m), [campaign, m]);
  const inviteStats = useMemo(() => getCampaignKocStats(campaignKocs), [campaignKocs]);
  const contributions = useMemo(
    () => getKocContributions(campaign, m),
    [campaign, m]
  );
  const videoAgg = useMemo(() => getVideoAggregate(contributions), [contributions]);
  const sampleRows = useMemo(() => getSampleRows(campaign), [campaign]);
  const sampleStats = useMemo(() => getSampleStats(sampleRows), [sampleRows]);

  const budgetPct = m.budgetTotal
    ? Math.round((m.budgetUsed / m.budgetTotal) * 100)
    : 0;
  const confirmPct = m.targetKocs
    ? Math.round((m.confirmedKocs / m.targetKocs) * 100)
    : 0;
  const days = totalDays(campaign);

  const gmvChartOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#2f6bff"],
    stroke: { curve: "straight", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f0f0f0", strokeDashArray: 4 },
    markers: { size: 4, strokeColors: "#fff", strokeWidth: 2 },
    xaxis: {
      categories: weekly.map((w) => w.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (v) => formatVndShort(v),
        style: { colors: "#9ca3af", fontSize: "11px" },
      },
    },
    tooltip: { y: { formatter: (v) => formatVndShort(v) } },
  };

  /* Bảng KOC pipeline (live) */
  const inviteColumns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      dataIndex: "kocName",
      key: "kocName",
      width: 220,
      render: (v?: string) => v || "—",
    },
    {
      title: "Tier",
      dataIndex: "kocTier",
      key: "kocTier",
      width: 100,
      render: (v?: string) => (v ? <Tag color={getTierColor(v)}>{v}</Tag> : "—"),
    },
    {
      title: "Trạng thái mời",
      key: "inviteStatus",
      width: 170,
      render: (_, r) => (
        <span
          className="inline-flex items-center gap-1.5 font-medium"
          style={{ color: CAMPAIGN_KOC_STATUS_COLOR[r.status] }}
        >
          <Dot color={CAMPAIGN_KOC_STATUS_COLOR[r.status]} />
          {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      title: "Người phụ trách",
      dataIndex: "pmUserId",
      key: "owner",
      width: 150,
      render: (v?: string | null) => v || "—",
    },
    {
      title: "Hành động",
      key: "action",
      width: 110,
      render: (_, r) => (
        <span
          className="cursor-pointer text-[#1890ff]"
          onClick={() => setInfoKoc({ id: r.kocUserId, name: r.kocName })}
        >
          Chi tiết →
        </span>
      ),
    },
  ];

  /* Bảng KOC tham gia (live) */
  const contribColumns: TableColumnsType<CampaignKocDto> = [
    {
      title: "KOC",
      key: "koc",
      width: 240,
      render: (_, r) => (
        <div>
          <div className="text-sm text-gray-800">{r.kocName || "—"}</div>
          {r.rejectReason && (
            <div className="text-xs text-gray-400">{r.rejectReason}</div>
          )}
        </div>
      ),
    },
    {
      title: "Tier",
      dataIndex: "kocTier",
      key: "kocTier",
      width: 100,
      render: (v?: string) => (v ? <Tag color={getTierColor(v)}>{v}</Tag> : "—"),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 170,
      render: (_, r) => (
        <span
          className="inline-flex items-center gap-1.5 font-medium"
          style={{ color: CAMPAIGN_KOC_STATUS_COLOR[r.status] }}
        >
          <Dot color={CAMPAIGN_KOC_STATUS_COLOR[r.status]} />
          {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
        </span>
      ),
    },
    {
      title: "Video giao/nộp/duyệt",
      key: "videos",
      width: 180,
      render: () => <span className="text-sm text-gray-300">— / — / —</span>,
    },
    {
      title: "GMV đóng góp",
      key: "gmv",
      width: 140,
      render: (_, r) => (r.kocGmv ? formatVndShort(r.kocGmv) : "—"),
    },
    {
      title: "Hoa hồng",
      key: "commission",
      width: 120,
      render: () => <span className="text-gray-300">—</span>,
    },
  ];

  /* Bảng nghiệm thu hàng mẫu */
  const sampleColumns: TableColumnsType<SampleRow> = [
    { title: "KOC", dataIndex: "name", key: "name", width: 200 },
    { title: "Casting", dataIndex: "casting", key: "casting", width: 110 },
    { title: "Phân loại hàng mẫu", dataIndex: "sampleType", key: "sampleType", width: 160 },
    {
      title: "Ngày gửi hàng",
      key: "sentDate",
      width: 130,
      render: (_, r) => (r.sentDate ? formatDateVN(r.sentDate) : "—"),
    },
    {
      title: "Ngày nhận hàng",
      key: "receivedDate",
      width: 130,
      render: (_, r) => (r.receivedDate ? formatDateVN(r.receivedDate) : "—"),
    },
    {
      title: "Hình thức nhận",
      key: "receiveMethod",
      width: 140,
      render: (_, r) => r.receiveMethod || "—",
    },
    {
      title: "Tình trạng",
      key: "status",
      width: 220,
      render: (_, r) => (
        <span
          className="inline-flex items-center gap-1.5 font-medium"
          style={{ color: r.statusColor }}
        >
          <Dot color={r.statusColor} />
          {r.statusLabel}
        </span>
      ),
    },
  ];

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#1890ff]"
      >
        <ArrowLeftOutlined /> Quay lại danh sách chiến dịch
      </button>

      {/* Header */}
      <Card
        size="small"
        className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="mt-1 text-sm text-gray-400">
              {campaign.brandName} · {formatDateVN(campaign.startDate)} –{" "}
              {formatDateVN(campaign.endDate)} ·{" "}
              {m.daysLeft > 0
                ? `${m.daysLeft} ngày còn lại`
                : "đã kết thúc"}{" "}
              (tổng {days} ngày)
            </div>
            {campaign.description && (
              <p className="mt-3 text-sm text-gray-700">{campaign.description}</p>
            )}
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold"
            style={{ color: status.color }}
          >
            <Dot color={status.color} />
            {status.label}
          </span>
        </div>
      </Card>

      <div className="flex flex-wrap gap-4">
        <CardCampaign
          title="Ngân sách đã dùng"
          value={`${budgetPct}%`}
          description={`${formatVndShort(m.budgetUsed)} / ${formatVndShort(m.budgetTotal)}`}
        />
        <CardCampaign title="GMV tạo ra" value={formatVndShort(m.gmv)} />
        <CardCampaign
          title="ROI"
          value={`${m.roi.toFixed(1)}x`}
          description="▲ so với mục tiêu 3.5x"
          valueClassName="text-emerald-600"
        />
        <CardCampaign
          title="Tiến độ thời gian"
          value={`${m.progress}%`}
          description="% thời gian đã trôi qua, không phải % hiệu quả"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <CardCampaign
          title="KOC xác nhận"
          value={`${m.confirmedKocs}/${m.targetKocs}`}
          description={`${confirmPct}% đã xác nhận tham gia`}
        />
        <CardCampaign
          title="Video đã duyệt"
          value={`${videoAgg.approved}/${videoAgg.submitted}`}
          description={`trên tổng ${videoAgg.assigned} video giao`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelCard title="GMV theo tuần" subtitle="Tích lũy trong vòng đời chiến dịch">
          <Chart
            options={gmvChartOptions}
            series={[{ name: "GMV", data: weekly.map((w) => w.value) }]}
            type="area"
            height={260}
          />
        </PanelCard>

        <PanelCard
          title="Ngân sách theo hạng mục"
          subtitle="Phân bổ ngân sách đã dùng"
        >
          <div className="space-y-4 py-2">
            {budget.map((b) => {
              const pct = m.budgetUsed
                ? Math.round((b.amount / m.budgetUsed) * 100)
                : 0;
              return (
                <div
                  key={b.label}
                  className="grid grid-cols-[140px_1fr_80px] items-center gap-3"
                >
                  <span className="text-sm text-gray-600">{b.label}</span>
                  <span className="h-2 rounded-full bg-gray-100">
                    <span
                      className="block h-2 rounded-full"
                      style={{ width: `${pct}%`, background: b.color }}
                    />
                  </span>
                  <span className="text-right text-sm text-gray-500">
                    {formatVndShort(b.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </div>

      <PanelCard
        title="Tiến trình chiến dịch"
        subtitle="6 mốc chuẩn — trạng thái tính theo % tiến độ thời gian"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((s) => (
            <div key={s.label}>
              <span
                className="block h-1.5 rounded-full"
                style={{ background: STEP_COLORS[s.state] }}
              />
              <div className="mt-2 text-sm font-semibold text-gray-800">
                {s.label}
              </div>
              <div
                className="text-xs"
                style={{
                  color:
                    s.state === "done"
                      ? "#16a34a"
                      : s.state === "active"
                      ? "#ea580c"
                      : "#9ca3af",
                }}
              >
                {s.statusText}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>


      <PanelCard
        title="Danh sách mời KOC"
        subtitle='Theo dõi tiến độ mời từng KOC như một CRM — từ lúc gửi lời mời đến khi xác nhận tham gia. Bấm "Chi tiết" để xem đầy đủ mốc liên hệ.'
      >
        <div className="mb-4 flex flex-wrap gap-4">
          <CardCampaign title="Tổng lời mời đã gửi" value={inviteStats.total} />
          <CardCampaign
            title="Đã xác nhận"
            value={inviteStats.confirmed}
            description={
              inviteStats.total
                ? `${Math.round(
                    (inviteStats.confirmed / inviteStats.total) * 100
                  )}% tổng lời mời`
                : undefined
            }
          />
          <CardCampaign title="Đang chờ phản hồi" value={inviteStats.inProgress} />
          <CardCampaign title="Từ chối" value={inviteStats.rejected} />
        </div>

        <Table
          columns={inviteColumns}
          dataSource={campaignKocs.slice(0, 5)}
          loading={kocsLoading}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
        <div className="mt-3 text-right text-sm">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="cursor-pointer font-medium text-[#1890ff] hover:underline"
          >
            Chi tiết (xem toàn bộ {campaignKocs.length} KOC) →
          </button>
        </div>
      </PanelCard>


      <PanelCard
        title="Danh sách KOC tham gia"
        subtitle="Trạng thái tham gia, video giao/nộp/duyệt và GMV đóng góp theo từng KOC"
      >
        <Table
          columns={contribColumns}
          dataSource={campaignKocs.slice(0, 5)}
          loading={kocsLoading}
          rowKey="id"
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
        <div className="mt-3 text-right text-sm">
          <button
            type="button"
            onClick={() => setParticipantsOpen(true)}
            className="cursor-pointer font-medium text-[#1890ff] hover:underline"
          >
            Chi tiết (xem toàn bộ {campaignKocs.length} KOC) →
          </button>
        </div>
      </PanelCard>

      <PanelCard
        title="Nhãn hàng gửi hàng mẫu cho KOC"
        subtitle='Theo đúng luồng Sheet vận hành thật (tab "DS đi hàng ngoài" / "Nghiệm thu hàng mẫu") — điều kiện tiên quyết trước khi KOC quay demo.'
      >
        <div className="mb-4 flex flex-wrap gap-4">
          <CardCampaign title="KOC cần gửi hàng mẫu" value={sampleStats.needSend} />
          <CardCampaign title="Đã gửi hàng" value={sampleStats.sent} />
          <CardCampaign title="Đã nhận & nghiệm thu" value={sampleStats.received} />
          <CardCampaign title="Chưa gửi hàng" value={sampleStats.notSent} />
        </div>

        <Table
          columns={sampleColumns}
          dataSource={sampleRows.slice(0, 6)}
          rowKey="kocId"
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
      </PanelCard>


      <PanelCard
        title="Video của chiến dịch"
        subtitle="Liên kết trực tiếp tới Job & Duyệt Video theo campaign_id"
      >
        <div className="rounded-xl border border-dashed border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
          Chưa có job video nào của chiến dịch này trong dữ liệu mock — khi kết nối
          thật, bảng này lấy từ <code>GET /api/video-jobs?campaign_id=</code> (xem Dev
          Guide mục 3.5).
        </div>
      </PanelCard>

      <div className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-400">
        WEWIN Dashboard Demo · Bản dựng minh họa cho BOD &amp; đội phát triển · Dữ liệu
        giả lập
      </div>

      <div className="mt-6">
        <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
          Quay lại danh sách chiến dịch
        </Button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CampaignInviteListModal
        open={inviteModalOpen}
        campaignId={campaignId}
        campaignName={campaign.name}
        onClose={() => setInviteModalOpen(false)}
      />
      <CampaignParticipantsModal
        open={participantsOpen}
        campaignId={campaignId}
        campaignName={campaign.name}
        onClose={() => setParticipantsOpen(false)}
      />
      <KocInfoModal
        open={Boolean(infoKoc)}
        kocUserId={infoKoc?.id}
        fallbackName={infoKoc?.name}
        onClose={() => setInfoKoc(null)}
      />
    </div>
  );
}
