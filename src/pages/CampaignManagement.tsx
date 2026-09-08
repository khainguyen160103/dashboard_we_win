import { useState } from "react";
import { Button, message, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import type { TabsProps } from 'antd';


import { CampaignFormModal } from "../components/campaign/CampaignFormModal";
import type {
  Campaign,
  CampaignFormValues,
} from "../components/campaign/types";

import {
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
} from "../hooks/query/useCampaignQuery";
import CampaignOverview from "../components/campaign/CampaignOverview";
import { CamPaignTableTab } from "../components/campaign/CamPaignTableTab";
import { CampaignInviteTab } from "../components/campaign/CampaignInvitePanel";
import {
  CampaignRosterTab,
  CampaignSampleTab,
  CampaignVideoTab,
} from "../components/campaign/CampaignExtraPanels";
export default function CampaignManagement() {
  const createCampaignMutation = useCreateCampaignMutation();
  const updateCampaignMutation = useUpdateCampaignMutation();

  // Modals & Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormModalOpen(true);
  };


  const handleSubmitForm = async (values: CampaignFormValues) => {
    const [startDate, endDate] = values.dateRange;
    const isoStart = new Date(startDate).toISOString();
    const isoEnd = new Date(endDate).toISOString();

    const payload = {
      name: values.name,
      code: values.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || `cmp-${Date.now()}`,
      description: values.description,
      brandName: values.brandName,
      category: values.category,
      startDate: isoStart,
      endDate: isoEnd,
      status: values.status === "Active" ? "ACTIVE" : values.status === "Draft" ? "DRAFT" : "COMPLETED",
    };

    try {
      if (editingCampaign) {
        await updateCampaignMutation.mutateAsync({
          id: String(editingCampaign.id),
          payload,
        });
        message.success(`Đã cập nhật chiến dịch "${values.name}" qua REST API!`);
      } else {
        await createCampaignMutation.mutateAsync(payload);
        message.success(`Đã tạo chiến dịch mới "${values.name}" qua REST API!`);
      }
      setFormModalOpen(false);
      setEditingCampaign(null);
    } catch {
      message.error("Có lỗi xảy ra khi tạo/cập nhật chiến dịch!");
    }
  };







  const onChange = (key: string) => {
    console.log(key);
  };



  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tổng quan',
      children: <CampaignOverview />,
    },
    {
      key: '2',
      label: 'Tất cả chiến dịch',
      children: <CamPaignTableTab />,
    },
    {
      key: '3',
      label: 'Danh sách mời KOC',
      children: <CampaignInviteTab />,
    },
    {
      key: '4',
      label: 'Danh sách KOC tham gia',
      children: <CampaignRosterTab />,
    },
    {
      key: '5',
      label: 'Nhãn hàng gửi hàng mẫu cho KOC',
      children: <CampaignSampleTab />,
    },
    {
      key: '6',
      label: 'Job & Duyệt Video',
      children: <CampaignVideoTab />,
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          className=""
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          loading={createCampaignMutation.isPending || updateCampaignMutation.isPending}
        >
          Tạo Chiến Dịch Mới
        </Button>
      </div>

      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />

      {/* Form Modal (Create / Edit Campaign) */}
      <CampaignFormModal
        open={formModalOpen}
        editingCampaign={editingCampaign}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitForm}
      />
    </>
  );
}
