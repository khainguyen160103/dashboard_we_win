import { Button, Card, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { Campaign } from "../model/types";
import { formatDate } from "../../../utils/formatDate";
import { useNavigate } from "react-router";
import { appNow, fmtVND, isAtRisk, type Tone } from "../utils/campaignFlow";
import { StatusDot } from "./detailUi";

/** Trường bổ sung (BE sẽ bổ sung sau) — đọc nếu có. */
type CampaignRow = Campaign & {
  statusLabel?: string;
  progress?: number;
  budgetUsed?: number;
  budgetTotal?: number;
  /** BE `/campaigns/overview`: tổng commission của campaign. */
  budget?: number;
  gmv?: number;
  roi?: number;
  kocConfirmed?: number;
  kocTotal?: number;
};

interface CampaignTableProps {
  campaigns?: Campaign[];
  onEdit?: (campaign: Campaign) => void;
}

const STATUS_OPTIONS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Nháp", tone: "muted" },
  ACTIVE: { label: "Đang chạy", tone: "good" },
  COMPLETED: { label: "Hoàn thành", tone: "muted" },
  CANCELLED: { label: "Đã hủy", tone: "crit" },
};

export const campaignStatusOf = (c: CampaignRow): { label: string; tone: Tone } => {
  if (c.statusLabel === "Cần chú ý") return { label: c.statusLabel, tone: "warn" };
  if (c.statusLabel) return { label: c.statusLabel, tone: c.status === "ACTIVE" ? "good" : "muted" };
  return STATUS_OPTIONS[c.status] ?? { label: c.status, tone: "muted" };
};

/** % thời gian đã trôi qua (không phải % hiệu quả) — ưu tiên số BE trả về nếu có. */
export const campaignProgressOf = (c: CampaignRow): number => {
  if (c.progress != null) return c.progress;
  const a = c.startTime ? new Date(c.startTime).getTime() : NaN;
  const b = c.endTime ? new Date(c.endTime).getTime() : NaN;
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.min(100, Math.max(0, Math.round(((appNow().getTime() - a) / (b - a)) * 100)));
};

export function CampaignTable({ campaigns, onEdit }: CampaignTableProps) {
  const navigate = useNavigate();
  const columns: TableColumnsType<CampaignRow> = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 240,
      fixed: "left",
      render: (_, r) => {
        const risk = isAtRisk({
          completed: r.status === "COMPLETED",
          roi: r.roi,
          confirmed: r.kocConfirmed ?? 0,
          total: r.kocTotal ?? 0,
          progress: campaignProgressOf(r),
        });
        return (
          <div className="font-bold">
            {r.name}
            {risk && (
              <span className="ml-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10.5px] font-bold text-red-600">
                ⚑ Cần chú ý
              </span>
            )}
          </div>
        );
      },
    },
    { title: "Nhãn hàng", dataIndex: "brandName", key: "brandName", width: 150 },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, r) => {
        const s = campaignStatusOf(r);
        return <StatusDot tone={s.tone}>{s.label}</StatusDot>;
      },
    },
    {
      title: "% Tiến độ",
      key: "progress",
      width: 170,
      render: (_, r) => {
        const p = campaignProgressOf(r);
        return (
          <div className="flex min-w-[120px] items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-gray-200">
              <span className="block h-full rounded bg-blue-600" style={{ width: `${p}%` }} />
            </div>
            <span className="w-[34px] text-right font-mono text-[11.5px] text-gray-500">{p}%</span>
          </div>
        );
      },
    },
    {
      title: "Ngân sách",
      key: "budget",
      width: 160,
      render: (_, r) =>
        r.budgetTotal ? (
          <span className="font-mono">
            {fmtVND(r.budgetUsed)} / {fmtVND(r.budgetTotal)}
          </span>
        ) : r.budget != null ? (
          <span className="font-mono">{fmtVND(r.budget)}</span>
        ) : (
          "—"
        ),
    },
    {
      title: "GMV",
      key: "gmv",
      width: 100,
      render: (_, r) => <span className="font-mono">{r.gmv != null ? fmtVND(r.gmv) : "—"}</span>,
    },
    {
      title: "Thời gian",
      key: "dates",
      width: 200,
      render: (_, r) => `${formatDate(r.startTime)} – ${formatDate(r.endTime)}`,
    },
    {
      title: "KOC tham gia",
      key: "koc",
      width: 120,
      align: "center",
      render: (_, r) =>
        r.kocTotal != null ? (
          <span className="font-mono">
            {r.kocConfirmed}/{r.kocTotal}
          </span>
        ) : (
          (r.targetTotalKoc ?? "—")
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/campaign/${record.id}`)} type="primary">
            Chi tiết
          </Button>
          {onEdit && <Button onClick={() => onEdit(record)}>Sửa</Button>}
        </Space>
      ),
    },
  ];

  return (
    <Card size="small" className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-4">
      <Table<CampaignRow>
        columns={columns}
        dataSource={campaigns}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={{ showTotal: (t) => `Tổng ${t} chiến dịch` }}
        size="middle"
      />
    </Card>
  );
}
