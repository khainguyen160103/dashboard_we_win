import { useState } from "react";
import { Button, Card, Flex, Input, Statistic, message } from "antd";
import { PlusOutlined, SearchOutlined, RocketOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

import {
  CampaignTable,
  CampaignFormModal,
  CampaignDetailDrawer,
  initialMockCampaigns,
  formatVND,
} from "../features/campaign";

import type {
  Campaign,
  CampaignFormValues,
} from "../features/campaign";

export default function CampaignManagement() {
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(initialMockCampaigns);
  const [searchText, setSearchText] = useState("");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormModalOpen(true);
  };

  const handleOpenDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailDrawerOpen(true);
  };

  const handleSubmitForm = (values: CampaignFormValues) => {
    const [startDate, endDate] = values.dateRange;

    if (editingCampaign) {
      const updatedList = campaignsList.map((c) =>
        c.id === editingCampaign.id
          ? {
              ...c,
              name: values.name,
              description: values.description,
              brandName: values.brandName,
              category: values.category,
              budget: values.budget,
              status: values.status,
              startDate,
              endDate,
            }
          : c
      );
      setCampaignsList(updatedList);
      message.success(`Đã cập nhật chiến dịch "${values.name}"!`);
    } else {
      const newCampaign: Campaign = {
        id: Date.now(),
        name: values.name,
        description: values.description,
        brandName: values.brandName,
        category: values.category,
        budget: values.budget,
        spent: 0,
        status: values.status,
        startDate,
        endDate,
        kocs: [],
      };
      setCampaignsList([newCampaign, ...campaignsList]);
      message.success(`Đã tạo chiến dịch mới "${values.name}"!`);
    }

    setFormModalOpen(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (id: number) => {
    setCampaignsList((prev) => prev.filter((c) => c.id !== id));
    message.success("Đã xóa chiến dịch!");
  };

  const handleUpdateCampaignInDrawer = (updated: Campaign) => {
    setCampaignsList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCampaign(updated);
  };

  // Filtered campaigns
  const filteredCampaigns = campaignsList.filter(
    (c) =>
      !searchText ||
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.brandName && c.brandName.toLowerCase().includes(searchText.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Top summary metrics
  const activeCount = campaignsList.filter((c) => c.status === "Active").length;
  const totalBudget = campaignsList.reduce((sum, c) => sum + c.budget, 0);
  const totalKocsInvited = campaignsList.reduce((sum, c) => sum + c.kocs.length, 0);

  return (
    <>
      <PageMeta title="Quản lý chiến dịch" description="Trang quản lý chiến dịch và quy trình mời KOC" />
      <PageBreadcrumb pageTitle="Quản lý chiến dịch" />

      {/* Overview Cards */}
      <Flex gap={16} style={{ marginBottom: 24 }}>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic title="Tổng Chiến Dịch" value={campaignsList.length} prefix={<RocketOutlined />} />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic
            title="Đang Hoạt Động"
            value={activeCount}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1 }}>
          <Statistic title="Tổng KOC Tham Gia" value={totalKocsInvited} prefix={<ClockCircleOutlined />} />
        </Card>
        <Card size="small" style={{ flex: 1.2 }}>
          <Statistic
            title="Tổng Ngân Sách"
            value={formatVND(totalBudget)}
            valueStyle={{ color: "#1890ff", fontSize: 18 }}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Flex>

      {/* Toolbar */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm kiếm chiến dịch theo tên, nhãn hàng, ngành hàng..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ width: 340 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          + Tạo Chiến Dịch Mới
        </Button>
      </Flex>

      {/* Main Campaign Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        onViewDetail={handleOpenDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCampaign}
      />

      {/* Form Modal (Create / Edit Campaign) */}
      <CampaignFormModal
        open={formModalOpen}
        editingCampaign={editingCampaign}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitForm}
      />

      {/* Detail & KOC Pipeline Drawer */}
      <CampaignDetailDrawer
        open={detailDrawerOpen}
        campaign={selectedCampaign}
        onClose={() => setDetailDrawerOpen(false)}
        onUpdateCampaign={handleUpdateCampaignInDrawer}
      />
    </>
  );
}
