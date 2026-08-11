import React from "react";
import {
  Avatar,
  Button,
  Flex,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { UserOutlined, EyeOutlined, LockOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { KOCRecord, Platform } from "./types";
import { getTierColor, getStatusColor, getPlatformIcon, formatFollowers } from "./koc.utils";
import { formatVND } from "../campaign/campaign.utils";
import { useRBACStore } from "../../hooks/store/useRBACStore";
import { useAuthStore } from "../../hooks/store/useAuthStore";
import { getActiveUserRole } from "../../utils/rbac";

interface KOCTableProps {
  kocsList: KOCRecord[];
  selectedRowKeys: React.Key[];
  loading?: boolean;
  onSelectionChange: (keys: React.Key[], rows: KOCRecord[]) => void;
  onEdit: (record: KOCRecord) => void;
  onDelete: (record: KOCRecord) => void;
  onViewHistory?: (record: KOCRecord) => void;
}

export function KOCTable({
  kocsList,
  selectedRowKeys,
  loading,
  onSelectionChange,
  onEdit,
  onDelete,
  onViewHistory,
}: KOCTableProps) {
  const user = useAuthStore((state) => state.user);
  const activeRole = React.useMemo(() => getActiveUserRole(user), [user]);

  const requestKocAccess = useRBACStore((state) => state.requestKocAccess);
  const isKocAccessApproved = useRBACStore((state) => state.isKocAccessApproved);
  const hasPendingRequest = useRBACStore((state) => state.hasPendingRequest);

  const columns: TableColumnsType<KOCRecord> = [
    {
      title: "KOC & Liên hệ",
      key: "koc",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => {
        const isApproved = isKocAccessApproved(record.id);
        const isPending = hasPendingRequest(record.id);

        return (
          <Flex
            align="center"
            gap={10}
            style={{ cursor: onViewHistory ? "pointer" : "default" }}
          >
            <Avatar icon={<UserOutlined />} size={36} />
            <div>
              <div
                style={{ fontWeight: 600, color: onViewHistory ? "#1890ff" : "inherit" }}
                onClick={() => onViewHistory && onViewHistory(record)}
              >
                {record.name} {record.gender && <Tag style={{ fontSize: 10 }}>{record.gender}</Tag>}
              </div>

              {/* Email & Phone display logic per RBAC Role */}
              {activeRole === "ADMIN" ? (
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  📧 {record.email} {record.phone ? `| 📞 ${record.phone}` : ""}
                </div>
              ) : activeRole === "SALES" ? (
                <Tooltip title="Sales Account không được phép xem Email, SĐT, Zalo của KOC">
                  <Tag icon={<LockOutlined />} color="error" style={{ fontSize: 11, margin: 0, marginTop: 2 }}>
                    Contact bị khóa (Quyền Sales)
                  </Tag>
                </Tooltip>
              ) : activeRole === "PM" ? (
                isApproved ? (
                  <div style={{ fontSize: 12, color: "#52c41a" }}>
                    ✅ 📧 {record.email} {record.phone ? `| 📞 ${record.phone}` : ""}
                  </div>
                ) : isPending ? (
                  <Tag icon={<ClockCircleOutlined />} color="warning" style={{ fontSize: 11, margin: 0, marginTop: 2 }}>
                    Chờ chị Mai/Hằng duyệt
                  </Tag>
                ) : (
                  <Space size={4} style={{ marginTop: 2 }}>
                    <Tag icon={<LockOutlined />} color="default" style={{ fontSize: 11, margin: 0 }}>
                      Liên hệ ẩn
                    </Tag>
                    <Button
                      type="link"
                      size="small"
                      style={{ fontSize: 11, padding: 0, height: "auto" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        requestKocAccess(record.id, record.name, "Vận hành PM");
                        message.info(`Đã gửi yêu cầu xem thông tin "${record.name}" tới Chị Mai/Hằng!`);
                      }}
                    >
                      Xin phê duyệt
                    </Button>
                  </Space>
                )
              ) : (
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>📧 {record.email}</div>
              )}
            </div>
          </Flex>
        );
      },
    },
    {
      title: "Nền Tảng",
      dataIndex: "platform",
      key: "platform",
      filters: [
        { text: "Instagram", value: "Instagram" },
        { text: "TikTok",    value: "TikTok"    },
        { text: "YouTube",   value: "YouTube"   },
      ],
      onFilter: (value, record) => record.platform === value,
      render: (platform: Platform) => (
        <Space>
          {getPlatformIcon(platform)}
          <span>{platform}</span>
        </Space>
      ),
    },
    {
      title: "Tier & Follow",
      key: "tierFollow",
      sorter: (a, b) => a.followers - b.followers,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={getTierColor(record.tier)} style={{ margin: 0 }}>
            {record.tier}
          </Tag>
          <Tooltip title={record.followers.toLocaleString("vi-VN")}>
            <span style={{ fontWeight: 600, fontSize: 12 }}>
              {formatFollowers(record.followers)}
            </span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Đặc điểm & Địa chỉ",
      key: "nicheCity",
      render: (_, record) => (
        <div>
          {record.category && <Tag color="blue">{record.category}</Tag>}
          <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>
            📍 {record.city || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "Doanh số GMV",
      dataIndex: "gmv",
      key: "gmv",
      align: "right",
      sorter: (a, b) => (a.gmv || 0) - (b.gmv || 0),
      render: (gmv?: number) => (
        <strong style={{ color: "#52c41a", fontSize: 12 }}>
          {gmv ? formatVND(gmv) : "0 ₫"}
        </strong>
      ),
    },
    {
      title: "ER (%)",
      dataIndex: "engagementRate",
      key: "engagementRate",
      align: "center",
      sorter: (a, b) => a.engagementRate - b.engagementRate,
      render: (er: number) => (
        <Tag color={er >= 10 ? "green" : er >= 5 ? "blue" : "orange"}>
          {er.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active",   value: "Active"   },
        { text: "Pending",  value: "Pending"  },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Space size={6}>
          {onViewHistory && (
            <Tooltip title="Xem lịch sử chiến dịch & job đã tham gia">
              <Button size="small" icon={<EyeOutlined />} onClick={() => onViewHistory(record)}>
                Chi tiết
              </Button>
            </Tooltip>
          )}

          {activeRole === "ADMIN" && (
            <>
              <Button type="primary" size="small" onClick={() => onEdit(record)}>
                Sửa
              </Button>
              <Popconfirm
                title="Xóa KOC"
                description={`Bạn có chắc muốn xóa "${record.name}"?`}
                okText="Xóa"
                cancelText="Hủy"
                okType="danger"
                onConfirm={() => onDelete(record)}
              >
                <Button type="primary" size="small" danger>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<KOCRecord>
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
      }}
      columns={columns}
      dataSource={kocsList}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} KOC`,
      }}
      bordered
      size="middle"
    />
  );
}

// ─── Search bar helper — co-located since tightly coupled to the table view ───
interface KOCSearchBarProps {
  selectedCount: number;
  onSearch?: (value: string) => void;
}

export function KOCSearchBar({ selectedCount, onSearch }: KOCSearchBarProps) {
  return (
    <Space size={12}>
      <Input.Search
        placeholder="Tìm kiếm KOC theo tên..."
        style={{ width: 260 }}
        allowClear
        onSearch={onSearch}
      />
      {selectedCount > 0 && (
        <Tag color="processing" style={{ fontSize: 13, padding: "4px 10px", margin: 0 }}>
          Đã chọn <strong>{selectedCount}</strong> KOC
        </Tag>
      )}
    </Space>
  );
}
