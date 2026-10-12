import { Button, Input, message, Select, Space, Spin } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react';
import {
    useCampaigns,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
} from '../hook/useCampaignQuery';
import type { CampaignPayload } from '../service/campaign.service';
import { CampaignTable } from './CampaignTable';
import { CampaignFormModal } from './CampaignFormModal';
import type { Campaign, CampaignFormValues } from '../model/types';

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "DRAFT", label: "Nháp" },
    { value: "ACTIVE", label: "Đang chạy" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

export const CamPaignTableTab = () => {
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState("");
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const { data: apiCampaigns, isLoading, isFetching } = useCampaigns({
        name: searchText,
        status: status || undefined,
    });
    const createCampaignMutation = useCreateCampaignMutation();
    const updateCampaignMutation = useUpdateCampaignMutation();

    const handleOpenCreate = () => {
        setEditingCampaign(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormModalOpen(true);
    };

    const handleSubmitForm = async (values: CampaignFormValues) => {
        const payload: CampaignPayload = {
            name: values.name,
            type: values.campaignType || "",
            status: values.status,
            description: values.description,
            brandName: values.brandName,
            category: values.category,
            startTime: values.startDate,
            endTime: values.endDate,
            targetTotalKoc: values.targetKocCount,
            tierKocRequire: values.requiredTier,
        };

        try {
            if (editingCampaign) {
                await updateCampaignMutation.mutateAsync({
                    id: String(editingCampaign.id),
                    payload,
                });
                message.success(`Đã cập nhật chiến dịch "${values.name}"`);
            } else {
                await createCampaignMutation.mutateAsync(payload);
                message.success(`Đã tạo chiến dịch mới "${values.name}"`);
            }
            setFormModalOpen(false);
            setEditingCampaign(null);
        } catch {
            message.error("Có lỗi xảy ra khi tạo/cập nhật chiến dịch!");
        }
    };

  return (
    <div>
          <Space className="mb-4" wrap style={{ width: "100%", justifyContent: "space-between" }}>
              <Space wrap>
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

              <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreate}
                  loading={createCampaignMutation.isPending || updateCampaignMutation.isPending}
              >
                  Tạo Chiến Dịch Mới
              </Button>
          </Space>
        <Spin spinning={isLoading || isFetching} tip="Đang tải dữ liệu chiến dịch từ REST API server...">
          <CampaignTable campaigns={apiCampaigns?.content} onEdit={handleOpenEdit} />
        </Spin>

        <CampaignFormModal
            open={formModalOpen}
            editingCampaign={editingCampaign}
            onClose={() => { setFormModalOpen(false); setEditingCampaign(null); }}
            onSubmit={handleSubmitForm}
        />
    </div>
  )
}
