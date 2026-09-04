import { Avatar, Button, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Brand } from "./types";
import { INDUSTRY_COLORS, TIER_COLORS, STATUS_COLORS, STATUS_LABELS, formatVND } from "./brand.data";

interface BrandTableProps {
  brands: Brand[];
  onViewDetail: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brandId: string | number) => void;
}

function BrandAvatar({ brand }: { brand: Brand }) {
  const initials = brand.name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const colorMap: Record<string, string> = {
    Gold: "#faad14",
    Silver: "#8c8c8c",
    Bronze: "#d46b08",
    New: "#52c41a",
  };

  return (
    <Avatar
      size={40}
      style={{
        backgroundColor: colorMap[brand.tier] ?? "#1890ff",
        fontWeight: 700,
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {initials}
    </Avatar>
  );
}

export function BrandTable({ brands, onViewDetail, onEdit, onDelete }: BrandTableProps) {
  const columns: TableColumnsType<Brand> = [
    {
      title: "Nhãn hàng",
      key: "name",
      minWidth: 220,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandAvatar brand={record} />
          <div>
            <div
              style={{ fontWeight: 600, color: "#1890ff", cursor: "pointer", fontSize: 14 }}
              onClick={() => onViewDetail(record)}
            >
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              Liên hệ: <strong>{record.contactName}</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ngành hàng",
      dataIndex: "industry",
      key: "industry",
      width: 160,
      filters: [
        { text: "Beauty & Skincare", value: "Beauty & Skincare" },
        { text: "F&B", value: "F&B" },
        { text: "Fashion & Lifestyle", value: "Fashion & Lifestyle" },
        { text: "Technology", value: "Technology" },
        { text: "Healthcare", value: "Healthcare" },
        { text: "FMCG", value: "FMCG" },
        { text: "Travel & Tourism", value: "Travel & Tourism" },
        { text: "Automotive", value: "Automotive" },
      ],
      onFilter: (value, record) => record.industry === value,
      render: (industry: string) => (
        <Tag color={INDUSTRY_COLORS[industry] ?? "default"}>{industry}</Tag>
      ),
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      width: 100,
      filters: [
        { text: "Gold", value: "Gold" },
        { text: "Silver", value: "Silver" },
        { text: "Bronze", value: "Bronze" },
        { text: "New", value: "New" },
      ],
      onFilter: (value, record) => record.tier === value,
      render: (tier: string) => (
        <Tag
          style={{
            color: "#fff",
            backgroundColor: TIER_COLORS[tier],
            borderColor: TIER_COLORS[tier],
            fontWeight: 600,
          }}
        >
          ★ {tier}
        </Tag>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 190,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>📧 {record.contactEmail}</div>
          <div>📞 {record.contactPhone}</div>
          {record.website && (
            <a href={record.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11 }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              Website
            </a>
          )}
        </div>
      ),
    },
    {
      title: "Chiến dịch",
      key: "campaigns",
      width: 130,
      align: "center",
      sorter: (a, b) => a.totalCampaigns - b.totalCampaigns,
      render: (_, record) => (
        <Tooltip title={`${record.activeCampaigns} đang chạy / ${record.totalCampaigns} tổng`}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1890ff" }}>{record.totalCampaigns}</div>
            <div style={{ fontSize: 11, color: "#52c41a" }}>▶ {record.activeCampaigns} đang chạy</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Tổng chi tiêu",
      key: "totalSpent",
      width: 130,
      align: "right",
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (_, record) => (
        <div style={{ textAlign: "right", fontWeight: 600, color: record.totalSpent >= 1_000_000_000 ? "#cf1322" : "#1890ff" }}>
          {formatVND(record.totalSpent)} ₫
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      filters: [
        { text: "Đang hoạt động", value: "Active" },
        { text: "Ngừng hoạt động", value: "Inactive" },
        { text: "Chờ xác nhận", value: "Pending" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa nhãn hàng?"
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
    <Table<Brand>
      columns={columns}
      dataSource={brands}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (t) => `Tổng ${t} nhãn hàng`,
      }}
      bordered
      size="middle"
      scroll={{ x: 1200 }}
    />
  );
}
