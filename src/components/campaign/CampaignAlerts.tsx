import { useMemo } from "react";
import { Card, Empty, Tooltip } from "antd";
import {
  WarningOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { Campaign } from "./types";
import { getCampaignMetrics, formatDateVN } from "./campaign.metrics.ts";

interface CampaignAlertsProps {
  campaigns: Campaign[];
  onSelect?: (campaign: Campaign) => void;
}

interface AlertCardProps {
  tone: "danger" | "success";
  icon: React.ReactNode;
  title: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}

function AlertCard({ tone, icon, title, hint, count, children }: AlertCardProps) {
  const toneCls =
    tone === "danger"
      ? "border-red-200 bg-red-50/60"
      : "border-emerald-200 bg-emerald-50/60";
  const titleCls = tone === "danger" ? "text-red-600" : "text-emerald-700";

  return (
    <Card
      size="small"
      className={`flex-1 min-w-[320px] rounded-2xl border ${toneCls} [&_.ant-card-body]:p-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 font-semibold ${titleCls}`}>
          {icon}
          <span>{title}</span>
          <Tooltip title={hint}>
            <QuestionCircleOutlined className="text-xs text-gray-400" />
          </Tooltip>
        </div>
        <span className="text-sm font-bold text-gray-500">{count}</span>
      </div>

      <div className="mt-3 divide-y divide-black/5">{children}</div>
    </Card>
  );
}

export function CampaignAlerts({ campaigns, onSelect }: CampaignAlertsProps) {
  const { atRisk, dueSoon } = useMemo(() => {
    const rows = campaigns.map((c) => ({ c, m: getCampaignMetrics(c) }));
    return {
      atRisk: rows.filter((r) => r.m.atRisk),
      dueSoon: rows
        .filter(
          (r) =>
            r.c.status !== "Completed" &&
            r.m.daysLeft > 0 &&
            r.m.daysLeft <= 14
        )
        .sort((a, b) => a.m.daysLeft - b.m.daysLeft),
    };
  }, [campaigns]);

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <AlertCard
        tone="danger"
        icon={<WarningOutlined />}
        title="Chiến dịch cần chú ý (đang chạy, ít KOC)"
        hint='Đang chạy, đã trôi qua >10% thời gian nhưng tỷ lệ KOC xác nhận < 50% mục tiêu (at_risk_flag).'
        count={atRisk.length}
      >
        {atRisk.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có chiến dịch rủi ro"
            className="!my-2"
          />
        )}
        {atRisk.map(({ c, m }) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c)}
            className="flex w-full items-start justify-between gap-3 py-2 text-left hover:bg-black/[0.03]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-800">
                {c.name}
              </div>
              <div className="truncate text-xs text-gray-500">{c.brandName}</div>
            </div>
            <div className="whitespace-nowrap text-xs font-semibold text-red-500">
              ROI {m.roi.toFixed(1)}x · {m.confirmedKocs}/{m.targetKocs} KOC
            </div>
          </button>
        ))}
      </AlertCard>

      <AlertCard
        tone="success"
        icon={<ClockCircleOutlined />}
        title="Deadline sắp tới (7–14 ngày)"
        hint="Chiến dịch chưa hoàn thành, còn ≤ 14 ngày là tới ngày kết thúc."
        count={dueSoon.length}
      >
        {dueSoon.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có deadline gần"
            className="!my-2"
          />
        )}
        {dueSoon.map(({ c, m }) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c)}
            className="flex w-full items-start justify-between gap-3 py-2 text-left hover:bg-black/[0.03]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-800">
                {c.name}
              </div>
              <div className="truncate text-xs text-gray-500">{c.brandName}</div>
            </div>
            <div className="whitespace-nowrap text-right text-xs">
              <div className="font-semibold text-emerald-600">
                còn {m.daysLeft} ngày
              </div>
              <div className="text-gray-400">{formatDateVN(c.endDate)}</div>
            </div>
          </button>
        ))}
      </AlertCard>
    </div>
  );
}

export default CampaignAlerts;
