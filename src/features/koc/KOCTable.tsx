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
import {
  UserOutlined,
  EyeOutlined,
  LockOutlined,
  ClockCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { KOCRecord, Platform } from "./types";
import { getTierColor, getStatusColor, getPlatformIcon, formatFollowers } from "./koc.utils";
import { formatVND } from "../campaign/campaign.utils";
import { useRBACStore } from "../../hooks/store/useRBACStore";
import { authStore } from "../../store/authStore";
import { getActiveUserRole, canViewPrivateKOCFields, isBrandRole } from "../../utils/rbac";

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
  const user = authStore((state) => state.user);
  const activeRole = React.useMemo(() => getActiveUserRole(user), [user]);

  const requestKocAccess = useRBACStore((state) => state.requestKocAccess);
  const isKocAccessApproved = useRBACStore((state) => state.isKocAccessApproved);
  const hasPendingRequest = useRBACStore((state) => state.hasPendingRequest);

  const isAdmin = canViewPrivateKOCFields(activeRole);
  const isBrand = isBrandRole(activeRole);

  // ── SHARED COLUMNS (Brand + Admin đều thấy) ─────────────────────────────────
  const sharedColumns: TableColumnsType<KOCRecord> = [
    {
      title: "Tên nhà sáng tạo",
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
              {/* Tài khoản TikTok / handle — show cho cả Brand */}
              {record.tiktokAccount && (
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  🎵 {record.tiktokAccount}
                </div>
              )}

              {/* Email & Phone display logic per RBAC Role — Admin only */}
              {isAdmin ? (
                <div style={{ fontSize: 12, color: "#595959", marginTop: 2 }}>
                  📧 {record.email}{record.phone ? ` | 📞 ${record.phone}` : ""}
                  {record.zalo ? ` | 💬 Zalo: ${record.zalo}` : ""}
                  {record.facebook ? ` | Facebook: ${record.facebook}` : ""}
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
      title: "Tier & Lượng theo dõi",
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
      title: "Doanh số (₫)",
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
      title: "Giá bán TB",
      dataIndex: "avgPrice",
      key: "avgPrice",
      align: "right",
      render: (v?: number) => (
        <span style={{ fontSize: 12 }}>{v ? formatVND(v) : "—"}</span>
      ),
    },
    {
      title: "Tỷ lệ tương tác",
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
      title: "DS Livestream",
      dataIndex: "livestreamRevenue",
      key: "livestreamRevenue",
      align: "right",
      render: (v?: number) => (
        <span style={{ fontSize: 12, color: "#fa541c" }}>
          {v ? formatVND(v) : "—"}
        </span>
      ),
    },
    {
      title: "DS Video",
      dataIndex: "videoRevenue",
      key: "videoRevenue",
      align: "right",
      render: (v?: number) => (
        <span style={{ fontSize: 12, color: "#1890ff" }}>
          {v ? formatVND(v) : "—"}
        </span>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "totalViews",
      key: "totalViews",
      align: "right",
      sorter: (a, b) => (a.totalViews || 0) - (b.totalViews || 0),
      render: (v?: number) => (
        <span style={{ fontSize: 12 }}>
          {v ? v.toLocaleString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Link TikTok",
      dataIndex: "tiktokLink",
      key: "tiktokLink",
      render: (link?: string) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> TikTok
          </a>
        ) : (
          <span style={{ color: "#bfbfbf" }}>—</span>
        ),
    },
  ];

  // ── ADMIN-ONLY COLUMNS (chỉ Admin thấy, ẩn với Brand) ──────────────────────
  const adminOnlyColumns: TableColumnsType<KOCRecord> = [
    {
      title: "GMV / Khách hàng",
      dataIndex: "gmvPerCustomer",
      key: "gmvPerCustomer",
      align: "right",
      render: (v?: number) => (
        <span style={{ fontSize: 12 }}>{v ? formatVND(v) : "—"}</span>
      ),
    },
    {
      title: "GPM (₫ / 1000 view)",
      dataIndex: "gpm",
      key: "gpm",
      align: "right",
      render: (v?: number) => (
        <span style={{ fontSize: 12 }}>{v ? formatVND(v) : "—"}</span>
      ),
    },
    {
      title: "GMV theo danh mục",
      dataIndex: "gmvByCategory",
      key: "gmvByCategory",
      render: (v?: string) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 11 }}>{v ? (v.length > 25 ? v.slice(0, 25) + "…" : v) : "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "GMV theo kênh",
      dataIndex: "gmvPerChannel",
      key: "gmvPerChannel",
      render: (v?: string) => (
        <span style={{ fontSize: 11 }}>{v || "—"}</span>
      ),
    },
    {
      title: "Giới tính Followers",
      key: "followersGender",
      render: (_, record) => {
        const g = record.followersGender;
        if (!g) return <span style={{ color: "#bfbfbf" }}>—</span>;
        return (
          <div style={{ fontSize: 11 }}>
            <div>👨 {g.male}%</div>
            <div>👩 {g.female}%</div>
          </div>
        );
      },
    },
    {
      title: "Độ tuổi Followers",
      key: "followersAge",
      render: (_, record) => {
        const a = record.followersAge;
        if (!a) return <span style={{ color: "#bfbfbf" }}>—</span>;
        const peak = Object.entries(a).sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0))[0];
        return (
          <Tooltip
            title={
              <div>
                {Object.entries(a).map(([k, v]) => (
                  <div key={k}>{k}: {v}%</div>
                ))}
              </div>
            }
          >
            <Tag color="geekblue" style={{ fontSize: 11 }}>
              {peak ? `${peak[0]}: ${peak[1]}%` : "—"}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Top 5 Tỉnh/TP",
      dataIndex: "top5Locations",
      key: "top5Locations",
      render: (locs?: string[]) =>
        locs && locs.length > 0 ? (
          <Tooltip title={locs.join(", ")}>
            <div style={{ fontSize: 11 }}>
              {locs.slice(0, 2).map((l, i) => (
                <div key={i}>📍 {l}</div>
              ))}
              {locs.length > 2 && <div style={{ color: "#8c8c8c" }}>+{locs.length - 2} nơi khác</div>}
            </div>
          </Tooltip>
        ) : (
          <span style={{ color: "#bfbfbf" }}>—</span>
        ),
    },
    {
      title: "Địa chỉ nhận hàng",
      dataIndex: "sampleAddress",
      key: "sampleAddress",
      render: (v?: string) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 11 }}>
            {v ? (v.length > 20 ? v.slice(0, 20) + "…" : v) : "—"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Tài khoản NH",
      dataIndex: "bankAccount",
      key: "bankAccount",
      render: (v?: string) => (
        <span style={{ fontSize: 11, fontFamily: "monospace" }}>{v || "—"}</span>
      ),
    },
    {
      title: "Độ tuổi con",
      dataIndex: "childrenAge",
      key: "childrenAge",
      render: (v?: string) => (
        <span style={{ fontSize: 11 }}>{v || "—"}</span>
      ),
    },
  ];

  // ── STATUS & CATEGORY (shared) ──────────────────────────────────────────────
  const statusCategoryColumns: TableColumnsType<KOCRecord> = [
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
  ];

  // ── ACTION COLUMN (không show cho Brand) ───────────────────────────────────
  const actionColumn: TableColumnsType<KOCRecord> = [
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

          {isAdmin && (
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

  // ── Compose final columns by role ───────────────────────────────────────────
  const columns: TableColumnsType<KOCRecord> = [
    ...sharedColumns,
    ...(isAdmin ? adminOnlyColumns : []),
    ...statusCategoryColumns,
    ...(!isBrand ? actionColumn : []),
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
      scroll={{ x: isAdmin ? 2000 : 1200 }}
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
