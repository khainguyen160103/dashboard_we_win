import { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Flex,
  Input,
  Popconfirm,
  Space,
  Statistic,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  MailOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import type { Campaign, CampaignKOC, KOCPipelineStatus } from "./types";
import { getCampaignStatusColor, getCampaignStatusLabel, formatVND } from "./campaign.utils";
import { KOCPipelineTable } from "./KOCPipelineTable";
import { InviteKOCModal } from "./InviteKOCModal";
import { DealPriceModal } from "./DealPriceModal";
import type { KOCRecord } from "../koc/types";

interface CampaignDetailDrawerProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onUpdateCampaign: (updated: Campaign) => void;
}

export function CampaignDetailDrawer({
  open,
  campaign,
  onClose,
  onUpdateCampaign,
}: CampaignDetailDrawerProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedKocForDeal, setSelectedKocForDeal] = useState<CampaignKOC | null>(null);
  const [searchKocText, setSearchKocText] = useState("");

  if (!campaign) return null;

  const isCompleted = campaign.status === "Completed";

  // Pipeline stats
  const totalInvited = campaign.kocs.length;
  const confirmedCount = campaign.kocs.filter(
    (k) => k.status === "confirmed" || k.status === "thanked"
  ).length;
  const rejectedCount = campaign.kocs.filter((k) => k.status === "rejected").length;
  const inProgressCount = totalInvited - confirmedCount - rejectedCount;

  // Calculate total final cast cost
  const totalCastSpent = campaign.kocs.reduce((sum, k) => sum + (k.finalCast || 0), 0);

  // Filter KOC list inside drawer
  const displayedKocs = campaign.kocs.filter(
    (k) =>
      !searchKocText ||
      k.kocName.toLowerCase().includes(searchKocText.toLowerCase()) ||
      k.kocEmail.toLowerCase().includes(searchKocText.toLowerCase())
  );

  // Handlers for pipeline transitions
  const handleUpdateStatus = (
    kocId: number,
    nextStatus: KOCPipelineStatus,
    reason?: string
  ) => {
    const updatedKocs = campaign.kocs.map((k) => {
      if (k.kocId === kocId) {
        return {
          ...k,
          status: nextStatus,
          rejectReason: reason || k.rejectReason,
          statusUpdatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return k;
    });

    onUpdateCampaign({
      ...campaign,
      kocs: updatedKocs,
    });
  };

  const handleInviteKocs = (
    toInvite: { koc: KOCRecord; hasCast: boolean }[]
  ) => {
    const newKocs: CampaignKOC[] = toInvite.map(({ koc, hasCast }) => ({
      kocId: koc.id,
      kocName: koc.name,
      kocEmail: koc.email,
      kocPhone: koc.phone,
      platform: koc.platform,
      tier: koc.tier,
      followers: koc.followers,
      status: "invited",
      hasCast,
      invitedAt: new Date().toISOString().split("T")[0],
      statusUpdatedAt: new Date().toISOString().split("T")[0],
    }));

    onUpdateCampaign({
      ...campaign,
      kocs: [...campaign.kocs, ...newKocs],
    });

    message.success(`Đã mời ${newKocs.length} KOC vào chiến dịch "${campaign.name}"!`);
  };

  const handleOpenDealModal = (koc: CampaignKOC) => {
    setSelectedKocForDeal(koc);
    setDealModalOpen(true);
  };

  const handleSaveDeal = (
    desiredCast: number | undefined,
    finalCast: number | undefined,
    notes?: string
  ) => {
    if (!selectedKocForDeal) return;

    const updatedKocs = campaign.kocs.map((k) => {
      if (k.kocId === selectedKocForDeal.kocId) {
        return {
          ...k,
          desiredCast,
          finalCast,
          notes,
          status: "dealing" as KOCPipelineStatus,
          statusUpdatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return k;
    });

    onUpdateCampaign({
      ...campaign,
      kocs: updatedKocs,
    });

    message.success(`Đã cập nhật giá deal cho KOC ${selectedKocForDeal.kocName}!`);
    setDealModalOpen(false);
    setSelectedKocForDeal(null);
  };

  const handleRemoveKOC = (kocId: number) => {
    const updatedKocs = campaign.kocs.filter((k) => k.kocId !== kocId);
    onUpdateCampaign({
      ...campaign,
      kocs: updatedKocs,
    });
    message.success("Đã xóa KOC khỏi chiến dịch!");
  };

  const handleBatchSendThankYou = () => {
    const updatedKocs = campaign.kocs.map((k) => {
      if (k.status === "confirmed") {
        return {
          ...k,
          status: "thanked" as KOCPipelineStatus,
          statusUpdatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return k;
    });

    onUpdateCampaign({
      ...campaign,
      kocs: updatedKocs,
    });

    message.success("Đã gửi thư cảm ơn cho tất cả KOC đã tham gia chiến dịch!");
  };

  return (
    <Drawer
      title={
        <Flex align="center" justify="space-between" style={{ width: "100%", paddingRight: 24 }}>
          <Space>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{campaign.name}</span>
            <Tag color={getCampaignStatusColor(campaign.status)}>
              {getCampaignStatusLabel(campaign.status)}
            </Tag>
          </Space>
        </Flex>
      }
      placement="right"
      width={1000}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {/* Campaign Details Header Card */}
      <Card size="small" style={{ marginBottom: 20, backgroundColor: "#fafafa" }}>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 4 }}>
          <Descriptions.Item label="Nhãn hàng">
            <strong>{campaign.brandName || "N/A"}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngành hàng">
            <Tag>{campaign.category || "General"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian">
            {new Date(campaign.startDate).toLocaleDateString("vi-VN")} -{" "}
            {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Ngân sách">
            <strong>{formatVND(campaign.budget)}</strong>
          </Descriptions.Item>
        </Descriptions>

        {campaign.description && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#595959" }}>
            <strong>Mô tả: </strong> {campaign.description}
          </div>
        )}
      </Card>

      {/* Metric Cards Row */}
      <Flex gap={12} style={{ marginBottom: 20 }}>
        <Card size="small" style={{ flex: 1, textAlign: "center" }}>
          <Statistic title="KOC Đã Mời" value={totalInvited} prefix={<UsergroupAddOutlined />} />
        </Card>
        <Card size="small" style={{ flex: 1, textAlign: "center" }}>
          <Statistic
            title="Đã Xác Nhận"
            value={confirmedCount}
            valueStyle={{ color: "#52c41a" }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1, textAlign: "center" }}>
          <Statistic
            title="Đang Duyệt / Deal"
            value={inProgressCount}
            valueStyle={{ color: "#fa8c16" }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1, textAlign: "center" }}>
          <Statistic
            title="Bị Từ Chối"
            value={rejectedCount}
            valueStyle={{ color: "#ff4d4f" }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
        <Card size="small" style={{ flex: 1.2, textAlign: "center" }}>
          <Statistic
            title="Tổng Chi Tiền Cast"
            value={formatVND(totalCastSpent)}
            valueStyle={{ color: "#1890ff", fontSize: 18 }}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Flex>

      {/* Toolbar for KOC list inside campaign */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm KOC trong chiến dịch..."
          style={{ width: 280 }}
          value={searchKocText}
          onChange={(e) => setSearchKocText(e.target.value)}
          allowClear
        />

        <Space size={10}>
          {isCompleted && confirmedCount > 0 && (
            <Popconfirm
              title="Gửi thư cảm ơn tất cả KOC?"
              description="Hệ thống sẽ tự động gửi email cảm ơn đến tất cả KOC đã hoàn thành chiến dịch."
              okText="Gửi ngay"
              cancelText="Hủy"
              onConfirm={handleBatchSendThankYou}
            >
              <Button
                icon={<MailOutlined />}
                style={{ backgroundColor: "#d4b106", borderColor: "#d4b106", color: "#fff" }}
              >
                Gửi thư cảm ơn tất cả
              </Button>
            </Popconfirm>
          )}

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setInviteModalOpen(true)}
          >
            + Mời KOC từ kho Data
          </Button>
        </Space>
      </Flex>

      {/* KOC Pipeline Table */}
      <KOCPipelineTable
        kocs={displayedKocs}
        isCampaignCompleted={isCompleted}
        onUpdateStatus={handleUpdateStatus}
        onOpenDealModal={handleOpenDealModal}
        onRemoveKOC={handleRemoveKOC}
      />

      {/* Modals */}
      <InviteKOCModal
        open={inviteModalOpen}
        alreadyInvitedKocIds={campaign.kocs.map((k) => k.kocId)}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteKocs}
      />

      <DealPriceModal
        open={dealModalOpen}
        koc={selectedKocForDeal}
        onClose={() => {
          setDealModalOpen(false);
          setSelectedKocForDeal(null);
        }}
        onSave={handleSaveDeal}
      />
    </Drawer>
  );
}
