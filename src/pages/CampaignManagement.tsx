import { useState, useMemo } from "react";
import { Button, Flex, Input, Spin, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { CardCampaign } from "../components/campaign/CardCampaign";
import { CampaignAlerts } from "../components/campaign/CampaignAlerts";
import CampaignDetailPage from "./CampaignDetailPage";

import { CampaignTable } from "../components/campaign/CampaignTable";
import { CampaignFormModal } from "../components/campaign/CampaignFormModal";
import { initialMockCampaigns } from "../components/campaign/campaign.data";

import type {
  Campaign,
  CampaignFormValues,
} from "../components/campaign/types";

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

  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

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

    if (apiCampaigns !== undefined) {
      const mappedApiList: Campaign[] = rawList.map((c) => {
        const rawStatus = (c.status || "ACTIVE").toString().toUpperCase();
        const status: "Active" | "Draft" | "Completed" =
          rawStatus === "DRAFT" || rawStatus === "INACTIVE"
            ? "Draft"
            : rawStatus === "COMPLETED"
            ? "Completed"
            : "Active";

        return {
          id: c.id,
          name: c.name || "N/A",
          description: c.description || "",
          brandName: c.brandName || "Cocoon Vietnam",
          category: c.category || "Mỹ phẩm & Làm đẹp",
          status,
          startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "2026-06-01",
          endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "2026-06-30",
          kocs: Array.isArray(c.kocs) ? c.kocs : [],
        };
      });

      // Show API campaigns, and append initial mock campaigns if API returns empty database
      if (mappedApiList.length === 0) {
        return initialMockCampaigns;
      }
      return mappedApiList;
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
    setDetailCampaign(campaign);
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

  const handleDeleteCampaign = async (id: number | string) => {
    try {
      await deleteCampaignMutation.mutateAsync(String(id));
      message.success("Đã xóa chiến dịch qua REST API!");
    } catch {
      message.error("Có lỗi xảy ra khi xóa chiến dịch!");
    }
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
  const totalCampaigns = campaignsList.length;
  const activeCount = campaignsList.filter((c) => c.status === "Active").length;
  const totalKocsInvited = campaignsList.reduce((sum, c) => sum + c.kocs.length, 0);

  // Demo GMV / budget figures (không có trong data model hiện tại)
  const totalGmvLabel = "53Bđ";
  const budgetUsed = 13;
  const budgetTotal = 21;
  const budgetPct = Math.round((budgetUsed / budgetTotal) * 100);

  // Tỷ lệ lấp đầy KOC trung bình: KOC tham gia / mục tiêu (giả định 45 KOC/chiến dịch)
  const kocTargetPerCampaign = 45;
  const avgKocFillRate = totalCampaigns
    ? Math.round(
        (totalKocsInvited / (totalCampaigns * kocTargetPerCampaign)) * 100
      )
    : 0;

  if (detailCampaign) {
    return (
      <CampaignDetailPage
        campaign={detailCampaign}
        onBack={() => setDetailCampaign(null)}
      />
    );
  }

  return (
    <>

      <Spin spinning={isLoading || isFetching} tip="Đang tải dữ liệu chiến dịch từ REST API server...">
        {/* Overview Cards */}
        <Flex gap={16} wrap="wrap" style={{ marginBottom: 24 }}>
          <CardCampaign
            title="Tổng chiến dịch"
            value={totalCampaigns}
            description='Toàn bộ chiến dịch trong hệ thống demo — bấm "Xem thêm" cuối bảng để xem hết'
          />
          <CardCampaign
            title="Đang hoạt động"
            value={activeCount}
            valueClassName="text-green-600"
            description="khớp với Dashboard Tổng quan"
          />
          <CardCampaign
            title="Tổng GMV / Ngân sách"
            value={totalGmvLabel}
            description={`Ngân sách đã dùng ${budgetUsed}Bđ / ${budgetTotal}Bđ (${budgetPct}%)`}
          />
          <CardCampaign
            title="Tỷ lệ lấp đầy KOC TB"
            value={`${avgKocFillRate}%`}
            description={`KOC xác nhận / mục tiêu, TB ${totalCampaigns} chiến dịch`}
          />
        </Flex>





        <CampaignAlerts campaigns={campaignsList} onSelect={handleOpenDetail} />

        {/* Toolbar */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 16 }}>
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
            Tạo Chiến Dịch Mới
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
    </>
  );
}
