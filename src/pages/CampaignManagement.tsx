import { useState, useMemo } from "react";
import { Button, Card, Flex, Input, Statistic, Spin, message } from "antd";
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

import {
  useCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from "../hooks/query/useCampaignQuery";

export default function CampaignManagement() {
  const [searchText, setSearchText] = useState("");

  // REST API hooks
  const { data: apiCampaigns, isLoading, isFetching } = useCampaignsQuery({ q: searchText });
  const createCampaignMutation = useCreateCampaignMutation();
  const updateCampaignMutation = useUpdateCampaignMutation();
  const deleteCampaignMutation = useDeleteCampaignMutation();


  // Modals & Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Map API response to Campaign format
  const campaignsList: Campaign[] = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(apiCampaigns)) {
      rawList = apiCampaigns;
    } else if (apiCampaigns && typeof apiCampaigns === "object") {
      const resObj = apiCampaigns as any;
      if (Array.isArray(resObj.content)) rawList = resObj.content;
      else if (Array.isArray(resObj.data)) rawList = resObj.data;
    }

    if (rawList.length > 0) {
      return rawList.map((c) => ({
        id: c.id,
        name: c.name || "N/A",
        description: c.description || "",
        brandName: c.brandName || "Cocoon Vietnam",
        category: c.category || "Mỹ phẩm & Làm đẹp",
        budget: Number(c.budget ?? 50000000),
        spent: Number(c.spent ?? 0),
        status: c.status?.toUpperCase() === "INACTIVE" ? "Draft" : c.status?.toUpperCase() === "COMPLETED" ? "Completed" : "Active",
        startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "2026-06-01",
        endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "2026-06-30",
        kocs: Array.isArray(c.kocs) ? c.kocs : [],
      }));
    }

    return initialMockCampaigns;
  }, [apiCampaigns]);

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

  const handleSubmitForm = async (values: CampaignFormValues) => {
    const [startDate, endDate] = values.dateRange;
    const isoStart = new Date(startDate).toISOString();
    const isoEnd = new Date(endDate).toISOString();

    const payload = {
      name: values.name,
      description: values.description,
      brandName: values.brandName,
      category: values.category,
      startDate: isoStart,
      endDate: isoEnd,
      budget: Number(values.budget),
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

  const handleDeleteCampaign = async (id: number | string) => {
    try {
      await deleteCampaignMutation.mutateAsync(String(id));
      message.success("Đã xóa chiến dịch qua REST API!");
    } catch {
      message.error("Có lỗi xảy ra khi xóa chiến dịch!");
    }
  };


  const handleUpdateCampaignInDrawer = (updated: Campaign) => {
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
      <PageMeta title="Quản lý chiến dịch" description="Trang quản lý chiến dịch tích hợp REST API" />
      <PageBreadcrumb pageTitle="Quản lý chiến dịch" />

      <Spin spinning={isLoading || isFetching} tip="Đang tải dữ liệu chiến dịch từ REST API server...">
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

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            loading={createCampaignMutation.isPending || updateCampaignMutation.isPending}
          >
            + Tạo Chiến Dịch Mới
          </Button>
        </Flex>

        {/* Main Campaign Table */}
        <CampaignTable
          campaigns={filteredCampaigns}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={(id) => handleDeleteCampaign(id)}
        />
      </Spin>

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
