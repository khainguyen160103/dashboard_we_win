import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, Empty, Spin, Tabs, Typography } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useCampaign } from "../hook/useCampaignQuery";
import { useCampaignKocsQuery } from "../hook/useCampaignKocQuery";
import { useVideosQuery } from "../hook/useVideoQuery";
import { CampaignInvitePanel } from "../component/CampaignInvitePanel";
import {
  CampaignRosterPanel,
  CampaignSamplePanel,
  CampaignVideoPanel,
} from "../component/CampaignExtraPanels";
import { CampaignDetailOverview } from "../component/CampaignDetailOverview";
import { CampaignRegisterPanel } from "../component/CampaignRegisterPanel";
import { CampaignConfirmPanel } from "../component/CampaignConfirmPanel";
import { CampaignInviteFormPanel } from "../component/CampaignInviteFormPanel";
import { InviteFormBuilderModal } from "../component/InviteFormBuilderModal";
import { useInviteFormQuery } from "../hook/useInviteFormQuery";
import { StatusDot } from "../component/detailUi";
import {
  appNow,
  fmtVNDate,
  isAtRisk,
  isRegistered,
  videoCountsOf,
  type Tone,
} from "../utils/campaignFlow";
import type { Campaign } from "../model/Campaign";
import type { CampaignKocDto } from "../model/CampaignKoc";

const { Title, Text, Paragraph } = Typography;

/** Trường bổ sung (BE sẽ bổ sung sau) — đọc nếu có, không bắt buộc. */
type CampaignExtra = Campaign & {
  statusLabel?: string;
  progress?: number;
  pmName?: string;
  budgetUsed?: number;
  budgetTotal?: number;
  gmv?: number;
  roi?: number;
};

const STATUS_META: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Nháp", tone: "muted" },
  ACTIVE: { label: "Đang chạy", tone: "good" },
  COMPLETED: { label: "Hoàn thành", tone: "muted" },
  DONE: { label: "Hoàn thành", tone: "muted" },
  WARNING: { label: "Cần chú ý", tone: "warn" },
  CANCELLED: { label: "Đã huỷ", tone: "crit" },
};

const statusOf = (c: CampaignExtra): { label: string; tone: Tone } => {
  if (c.statusLabel === "Cần chú ý") return { label: c.statusLabel, tone: "warn" };
  if (c.statusLabel) return { label: c.statusLabel, tone: c.status === "ACTIVE" ? "good" : "muted" };
  return STATUS_META[c.status] ?? { label: c.status, tone: "muted" };
};

const DAY_MS = 86_400_000;

/** Thứ tự & nhãn 7 tab đúng artifact (chốt họp 17/09/2026). */
type ViewKey = "overview" | "form" | "invite" | "register" | "confirm" | "roster" | "sample" | "video";

export const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaignId = id ?? "";
  const { data, isLoading, isError, error } = useCampaign(campaignId);
  const campaign = data as CampaignExtra | undefined;

  const kocsQ = useCampaignKocsQuery(campaignId);
  const videosQ = useVideosQuery({ campaignId }, { enabled: Boolean(campaignId) });
  const rows: CampaignKocDto[] = useMemo(() => kocsQ.data ?? [], [kocsQ.data]);
  const video = useMemo(
    () => videoCountsOf(videosQ.data ?? []),
    [videosQ.data],
  );

  const inviteFormQ = useInviteFormQuery(campaignId);
  const [builderOpen, setBuilderOpen] = useState(false);

  // Mở 1 chiến dịch khác -> luôn reset về tab "Tổng quan".
  const [view, setView] = useState<ViewKey>("overview");
  useEffect(() => setView("overview"), [campaignId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin description="Đang tải chiến dịch..." />
      </div>
    );
  }
  if (isError || !campaign) {
    return <Empty description={error?.message ?? "Không tìm thấy chiến dịch"} className="py-16" />;
  }

  const now = appNow();
  const start = campaign.startTime ? new Date(campaign.startTime) : null;
  const end = campaign.endTime ? new Date(campaign.endTime) : null;
  const totalDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS)) : null;
  const daysLeft = end ? Math.max(0, Math.round((end.getTime() - now.getTime()) / DAY_MS)) : 0;
  const progress =
    campaign.progress ??
    (start && end && totalDays
      ? Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / (totalDays * DAY_MS)) * 100)))
      : 0);
  const status = statusOf(campaign);
  const risk = isAtRisk({
    completed: campaign.status === "COMPLETED" || campaign.status === "DONE",
    roi: campaign.roi,
    confirmed: rows.filter(isRegistered).length,
    total: rows.length,
    progress,
  });

  const items: { key: ViewKey; label: string; children: ReactNode }[] = [
    {
      key: "overview",
      label: "Tổng quan",
      children: <CampaignDetailOverview campaign={campaign} rows={rows} video={video} />,
    },
    {
      key: "form",
      label: "Form mời",
      children: <CampaignInviteFormPanel campaignId={campaignId} onEdit={() => setBuilderOpen(true)} />,
    },
    {
      key: "invite",
      label: "Danh sách mời KOC",
      children: <CampaignInvitePanel campaignId={campaignId} campaignName={campaign.name} />,
    },
    {
      key: "register",
      label: "Danh sách KOC Đăng ký",
      children: <CampaignRegisterPanel campaign={campaign} rows={rows} />,
    },
    {
      key: "confirm",
      label: "Xác nhận & Triển khai",
      children: <CampaignConfirmPanel campaign={campaign} rows={rows} />,
    },
    { key: "roster", label: "Danh sách KOC tham gia", children: <CampaignRosterPanel campaignId={campaignId} /> },
    { key: "sample", label: "Nhãn hàng gửi hàng mẫu cho KOC", children: <CampaignSamplePanel campaignId={campaignId} /> },
    { key: "video", label: "Duyệt Video", children: <CampaignVideoPanel campaignId={campaignId} /> },
  ];

  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button type="text" className="!px-2.5 font-semibold text-gray-700" onClick={() => navigate("/campaign")}>
          ← Quay lại danh sách chiến dịch
        </Button>
        <Button
          type="primary"
          icon={<FormOutlined />}
          loading={inviteFormQ.isLoading}
          onClick={() => setBuilderOpen(true)}
        >
          {inviteFormQ.data ? "Sửa form mời" : "Tạo form mời"}
        </Button>
      </div>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Title level={3} className="!mb-1 !text-[19px] !font-extrabold">
              {campaign.name}
            </Title>
            <Text type="secondary" className="text-[12.5px]">
              {[
                campaign.brandName,
                `${fmtVNDate(campaign.startTime)} – ${fmtVNDate(campaign.endTime)}`,
                `${daysLeft > 0 && progress < 100 ? `${daysLeft} ngày còn lại` : "đã kết thúc"}${totalDays ? ` (tổng ${totalDays} ngày)` : ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            {campaign.description && (
              <Paragraph className="!mb-0 !mt-2.5 max-w-[64ch] text-[13px] leading-normal text-gray-700">
                {campaign.description}
              </Paragraph>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusDot tone={status.tone}>{status.label}</StatusDot>
            {risk && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-red-600">
                ⚑ Cần chú ý
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 pb-4 shadow-md">
        <Tabs activeKey={view} onChange={(k) => setView(k as ViewKey)} items={items} />
      </div>

      <InviteFormBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        campaignId={campaignId}
        campaignName={campaign.name}
        form={inviteFormQ.data}
      />
    </div>
  );
};
