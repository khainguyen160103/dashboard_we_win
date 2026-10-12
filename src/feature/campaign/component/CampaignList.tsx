import { useMemo, useState } from "react";
import { Alert, Input, Select, Spin } from "antd";
import { useCampaigns } from "../hook/useCampaignQuery";
import { CampaignTable, campaignStatusOf } from "./CampaignTable";
import type { Campaign } from "../model/types";

const STATUS_FILTER = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Đang chạy", label: "Đang chạy" },
  { value: "Sắp xong", label: "Sắp xong" },
  { value: "Cần chú ý", label: "Cần chú ý" },
  { value: "Hoàn thành", label: "Hoàn thành" },
];

const norm = (s?: string | null) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export const CampaignList = () => {
  const { data, isLoading, isError, error } = useCampaigns({ size: 200 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");


  const campaigns = useMemo(
    () =>
      (data?.content ?? []).filter(
        (c: Campaign) =>
          (!q || norm(c.name).includes(norm(q)) || norm(c.brandName).includes(norm(q))) &&
          (!status || campaignStatusOf(c).label === status),
      ),
    [data, q, status],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search
          allowClear
          placeholder="Tìm theo tên chiến dịch hoặc nhãn hàng…"
          className="min-w-[220px] flex-1"
          onChange={(e) => setQ(e.target.value)}
        />
        <Select className="min-w-[180px]" value={status} onChange={setStatus} options={STATUS_FILTER} />
      </div>
      {isError && (
        <Alert type="error" showIcon className="mb-4" title="Không tải được danh sách chiến dịch" description={error?.message} />
      )}
      <div className="mb-2 text-xs text-gray-500">
        {campaigns.length}/{data?.content?.length ?? 0} chiến dịch
      </div>
      <Spin spinning={isLoading}>
        <CampaignTable campaigns={campaigns} />
      </Spin>
    </div>
  );
};
