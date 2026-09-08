import { Input, Select, Space, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react';
import { useCampaigns } from '../../hooks/query/useCampaignQuery';
import { CampaignTable } from './CampaignTable';

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "DRAFT", label: "Nháp" },
    { value: "ACTIVE", label: "Đang chạy" },
    { value: "DONE", label: "Hoàn thành" },
    { value: "WARNING", label: "Cần chú ý" },
];

export const CamPaignTableTab = () => {
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState("");
    const { data: apiCampaigns, isLoading, isFetching } = useCampaigns({
        name: searchText,
        status: status || undefined,
    });
    console.log("API Campaigns:", apiCampaigns);
  return (
    <div>
          <Space className="mb-4" wrap>
              <Input
                  placeholder="Tìm kiếm chiến dịch theo tên, nhãn hàng, ngành hàng..."
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  style={{ width: 340 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
              />

              <Select
                  style={{ width: 200 }}
                  value={status}
                  onChange={(value) => setStatus(value ?? "")}
                  options={STATUS_OPTIONS}
                  placeholder="Trạng thái chiến dịch"
              />
          </Space>
        <Spin spinning={isLoading || isFetching} tip="Đang tải dữ liệu chiến dịch từ REST API server...">
          <CampaignTable campaigns={apiCampaigns?.data.content} />
        </Spin>
    </div>
  )
}
