import { useState } from "react";
import { Select } from "antd";
import { useCampaigns } from "../../hooks/query/useCampaignQuery";

/**
 * Bộ chọn chiến dịch dùng chung cho các tab ở Quản lý chiến dịch
 * (Danh sách mời KOC / KOC tham gia / Hàng mẫu / Job & Duyệt Video).
 * Trả về sẵn phần UI `picker` + id/tên chiến dịch đang chọn (mặc định chiến dịch đầu tiên).
 */
export function useCampaignPicker() {
  const { data, isLoading } = useCampaigns({ limit: 200 });
  const campaigns: { id: string | number; name: string }[] = data?.data?.content ?? [];

  const [selectedId, setSelectedId] = useState<string>();
  const campaignId = selectedId ?? (campaigns[0] ? String(campaigns[0].id) : undefined);
  const campaignName = campaigns.find((c) => String(c.id) === campaignId)?.name;

  const picker = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Chiến dịch:</span>
      <Select
        style={{ minWidth: 320 }}
        loading={isLoading}
        value={campaignId}
        onChange={setSelectedId}
        placeholder="Chọn chiến dịch"
        showSearch
        optionFilterProp="label"
        options={campaigns.map((c) => ({ value: String(c.id), label: c.name }))}
      />
    </div>
  );

  return { picker, campaignId, campaignName, isLoading };
}
