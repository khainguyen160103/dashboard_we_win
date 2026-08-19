import { Button, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Campaign } from "./types";
import { getCampaignStatusColor, getCampaignStatusLabel } from "./campaign.utils";

interface CampaignTableProps {
  campaigns: Campaign[];
  onViewDetail: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: number | string) => void;
}

export function CampaignTable({
  campaigns,
  onViewDetail,
  onEdit,
  onDelete,
}: CampaignTableProps) {
  const columns: TableColumnsType<Campaign> = [
    {
      title: "Tên chiến dịch",
      key: "name",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1890ff", cursor: "pointer" }} onClick={() => onViewDetail(record)}>
            {record.name}
          </div>
          {record.brandName && (
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              Nhãn hàng: <strong>{record.brandName}</strong> {record.category && `• ${record.category}`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Campaign["status"]) => (
        <Tag color={getCampaignStatusColor(status)}>
          {getCampaignStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      key: "dates",
      width: 170,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {new Date(record.startDate).toLocaleDateString("vi-VN")} - {new Date(record.endDate).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
    {
      title: "KOC Tham Gia",
      key: "kocCount",
      width: 140,
      align: "center",
      render: (_, record) => {
        const total = record.kocs.length;
        const confirmed = record.kocs.filter((k) => k.status === "confirmed" || k.status === "thanked").length;
        return (
          <Tooltip title={`${confirmed} KOC đã xác nhận trên tổng số ${total} KOC đã mời`}>
            <Tag color={confirmed > 0 ? "blue" : "default"}>
              {confirmed}/{total} KOC
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xóa chiến dịch?"
            description={`Bạn có chắc muốn xóa "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => onDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<Campaign>
      columns={columns}
      dataSource={campaigns}
      rowKey="id"
      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} chiến dịch` }}
      bordered
      size="middle"
    />
  );
}
