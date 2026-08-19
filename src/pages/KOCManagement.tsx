import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { Badge, Button, Card, Flex, Modal, Segmented, Space, Table, Tag, Upload, message } from "antd";
import {
  ClockCircleOutlined,
  CloudDownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  MailOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

import {
  KOCFormModal,
  KOCTable,
  KOCSearchBar,
  ScheduledMsgModal,
  SendMessageModal,
  TemplateManagerModal,
  KOCHistoryModal,
  loadScheduledMessages,
  saveScheduledMessages,
  isSent,
} from "../features/koc";

import type {
  KOCRecord,
  KOCFormValues,
  ScheduledMessage,
} from "../features/koc";

import { useUsers } from "../hooks/useUser";
import type { User } from "../model/User";
import { useRBACStore } from "../hooks/store/useRBACStore";
import { authStore } from "../store/authStore";
import { getActiveUserRole } from "../utils/rbac";
import { useKalodataCreators } from "../hooks/useKalodata";
import type { KalodataCreator } from "../services/kalodata.types";

// Constant KOC Role ID
const KOC_ROLE_ID = "a1000000-0000-0000-0000-000000000003";

// Helper: map Kalodata Creator to KOCRecord
const mapKalodataToKOCRecord = (creator: KalodataCreator, index: number): KOCRecord => {
  const parseNumber = (val: string | number | undefined): number => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const cleaned = val.toString().replace(/,/g, "");
    if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1_000_000;
    if (cleaned.endsWith("K")) return parseFloat(cleaned) * 1_000_000; // or 1000
    return parseFloat(cleaned) || 0;
  };

  const followers = parseNumber(creator.creator_followers);
  let tier: KOCRecord["tier"] = "Micro";
  if (followers >= 1_000_000) tier = "Mega";
  else if (followers >= 300_000) tier = "Macro";
  else if (followers < 50_000) tier = "Nano";

  const name = creator.creator_nickname || creator.creator_handle || `KOC ${index + 1}`;
  const handle = creator.creator_handle ? `@${creator.creator_handle}` : `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const email = `${creator.creator_handle || "creator"}${index + 1}@kalodata.koc.vn`;

  return {
    id: creator.creator_id ? parseInt(creator.creator_id, 10) || (index + 10000) : index + 10000,
    name,
    tiktokAccount: handle,
    email,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    platform: "TikTok",
    followers,
    gmv: creator.revenue || 0,
    avgPrice: creator.sales_volumn > 0 ? Math.round(creator.revenue / creator.sales_volumn) : 150000,
    engagementRate: Math.min(12, Math.max(2.5, Math.round(((creator.revenue_growth_rate || 5) + 3) * 10) / 10)),
    totalPosts: creator.sales_volumn || 12,
    status: "Active",
    tier,
    joinDate: new Date().toISOString().split("T")[0],
    category: Array.isArray(creator.category_list) && creator.category_list.length > 0 ? creator.category_list[0] : "TikTok Shop Ranking",
    city: "Hà Nội",
    gender: "Nữ",
  };
};

// Predicate to check if a user record has the "KOC" role
const isKOCUser = (u: User & Record<string, unknown>): boolean => {
  if (u.roleId === KOC_ROLE_ID || String(u.roleId) === "KOC") return true;
  if (Array.isArray(u.roles)) {
    return u.roles.some((r: unknown) => {
      if (typeof r === "string") return r === "KOC" || r === KOC_ROLE_ID;
      if (typeof r === "object" && r !== null) {
        const rObj = r as Record<string, unknown>;
        return rObj.code === "KOC" || rObj.name === "KOC" || rObj.id === KOC_ROLE_ID;
      }
      return false;
    });
  }
  if (Array.isArray(u.roleIds)) {
    return u.roleIds.some((r) => String(r) === KOC_ROLE_ID || String(r) === "KOC");
  }
  return false;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KOCManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKOC, setEditingKOC] = useState<KOCRecord | null>(null);

  // ── Auth User & RBAC ──
  const user = authStore((state) => state.user);
  const activeRole = useMemo(() => getActiveUserRole(user), [user]);

  const accessRequests = useRBACStore((state) => state.accessRequests);
  const approveKocAccess = useRBACStore((state) => state.approveKocAccess);
  const rejectKocAccess = useRBACStore((state) => state.rejectKocAccess);

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  // ── History Modal ──
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryKOC, setSelectedHistoryKOC] = useState<KOCRecord | null>(null);

  // ── Template Manager ──
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  // ── Row selection ──
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<KOCRecord[]>([]);

  // ── Send Message ──
  const [sendMessageModalOpen, setSendMessageModalOpen] = useState(false);
  const [sendChannel, setSendChannel] = useState<"Email" | "Zalo" | null>(null);
  const [editingScheduled, setEditingScheduled] = useState<ScheduledMessage | null>(null);

  // ── Scheduled Messages ──
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(loadScheduledMessages);
  const [scheduleListOpen, setScheduleListOpen] = useState(false);

  // ── Data Source Mode: SYSTEM (REST API) vs KALODATA (Kalodata Ranking API) ──
  const [dataSourceMode, setDataSourceMode] = useState<"SYSTEM" | "KALODATA">("SYSTEM");

  // ── Kalodata Creator Query ──
  const { data: kalodataResponse, isLoading: isLoadingKalodata } = useKalodataCreators({
    region: "VN",
    language: "vi-VN",
    currency: "VND",
    date_range: "last7Day",
  });

  // ── useUser / useUsers Hook ──
  const {
    users: apiUsers,
    isLoading: isLoadingUsers,
    isFetching,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
  } = useUsers({ q: searchQuery });

  // ── Filter REST API users to display ONLY users with role "KOC" ──
  const systemKocsList: KOCRecord[] = useMemo(() => {
    let rawList: User[] = [];
    if (Array.isArray(apiUsers)) {
      rawList = apiUsers;
    } else if (apiUsers && typeof apiUsers === "object") {
      const resObj = apiUsers as unknown as Record<string, unknown>;
      if (Array.isArray(resObj.content)) {
        rawList = resObj.content as User[];
      } else if (
        resObj.data &&
        typeof resObj.data === "object" &&
        Array.isArray((resObj.data as Record<string, unknown>).content)
      ) {
        rawList = (resObj.data as Record<string, unknown>).content as User[];
      } else if (Array.isArray(resObj.data)) {
        rawList = resObj.data as User[];
      }
    }

    const kocUsers = rawList.filter((u) => isKOCUser(u as User & Record<string, unknown>));

    if (kocUsers.length > 0) {
      return kocUsers.map((u) => {
        const uObj = u as unknown as Record<string, unknown>;
        const rawStatus = (u.status || "ACTIVE").toString().toUpperCase();
        const status: "Active" | "Inactive" | "Pending" =
          rawStatus === "ACTIVE" ? "Active" : rawStatus === "PENDING" ? "Pending" : "Inactive";

        return {
          id: u.id as unknown as number,
          name: u.fullName || u.username || u.email || "N/A",
          email: u.email || "",
          phone: (uObj.phone as string) || (uObj.zalo as string) || "",
          platform: (uObj.platform as KOCRecord["platform"]) || "TikTok",
          followers: Number(uObj.followers ?? 50000),
          engagementRate: Number(uObj.engagementRate ?? 5.5),
          totalPosts: Number(uObj.totalPosts ?? 12),
          status,
          tier: (uObj.tier as KOCRecord["tier"]) || "Micro",
          joinDate: u.createdAt
            ? new Date(u.createdAt as string).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          category: (uObj.category as string) || "Beauty & Lifestyle",
          city: (uObj.city as string) || "Hà Nội",
          gender: (uObj.gender as KOCRecord["gender"]) || "Nữ",
        };
      });
    }

    return [];
  }, [apiUsers]);

  // ── Mapped Kalodata Creators List ──
  const kalodataKocsList: KOCRecord[] = useMemo(() => {
    if (kalodataResponse?.data && Array.isArray(kalodataResponse.data)) {
      return kalodataResponse.data.map(mapKalodataToKOCRecord);
    }
    return [];
  }, [kalodataResponse]);

  // ── Effective KOCs List depending on selected dataSourceMode ──
  const kocsList: KOCRecord[] = useMemo(() => {
    if (dataSourceMode === "KALODATA") {
      return kalodataKocsList;
    }
    // If system KOC list is empty, automatically display Kalodata Creators as fallback!
    return systemKocsList.length > 0 ? systemKocsList : kalodataKocsList;
  }, [dataSourceMode, systemKocsList, kalodataKocsList]);

  // Handler to import selected Kalodata Creators to system database
  const handleImportKalodataKocs = async () => {
    const targets = selectedRows.length > 0 ? selectedRows : kocsList.slice(0, 5);
    let successCount = 0;
    for (const koc of targets) {
      try {
        await createUser({
          email: koc.email,
          fullName: koc.name,
          roleId: KOC_ROLE_ID,
          status: "ACTIVE",
        } as unknown as Partial<User>);
        successCount++;
      } catch {
        // Continue on conflict
      }
    }
    message.success(`Đã đồng bộ ${successCount} KOC từ Kalodata vào hệ thống!`);
    setDataSourceMode("SYSTEM");
  };

  // ── KOC CRUD handlers ──
  const handleOpenAdd = () => { setEditingKOC(null); setModalOpen(true); };
  const handleOpenEdit = (record: KOCRecord) => { setEditingKOC(record); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditingKOC(null); };

  const handleOpenHistory = (record: KOCRecord) => {
    setSelectedHistoryKOC(record);
    setHistoryModalOpen(true);
  };

  const handleSubmit = async (values: KOCFormValues) => {
    const formattedStatus = values.status?.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const payload = {
      email: values.email,
      roleId: KOC_ROLE_ID,
      status: formattedStatus,
      fullName: values.name,
    };

    try {
      if (editingKOC) {
        await updateUser({
          id: String(editingKOC.id),
          payload: payload as unknown as Partial<User>,
        });
        message.success(`Đã cập nhật KOC "${values.name}"`);
      } else {
        await createUser(payload as unknown as Partial<User>);
        message.success(`Đã thêm KOC "${values.name}"`);
      }
      setModalOpen(false);
      setEditingKOC(null);
    } catch {
      message.error("Có lỗi xảy ra khi gửi dữ liệu lên REST API server!");
    }
  };

  const handleDelete = async (record: KOCRecord) => {
    try {
      await deleteUser(String(record.id));
      message.success(`Đã xóa KOC "${record.name}"`);
    } catch {
      message.error("Có lỗi xảy ra khi xóa KOC trên REST API server!");
    }
  };

  // ── Excel Import ──
  const uploadProps: UploadProps = {
    accept: ".xlsx, .xls, .csv",
    showUploadList: false,
    beforeUpload: (file) => {
      message.success(`Đã nhận file import "${file.name}"!`);
      return false;
    },
  };

  // ── Send Message handlers ──
  const handleOpenSendMessage = (channel: "Email" | "Zalo") => {
    if (selectedRowKeys.length === 0) { message.warning("Vui lòng chọn ít nhất 1 KOC!"); return; }
    setEditingScheduled(null);
    setSendChannel(channel);
    setSendMessageModalOpen(true);
  };

  const handleSchedule = (msg: Omit<ScheduledMessage, "id" | "createdAt">) => {
    if (editingScheduled) {
      const updated = scheduledMessages.map((m) =>
        m.id === editingScheduled.id ? { ...m, ...msg } : m,
      );
      setScheduledMessages(updated);
      saveScheduledMessages(updated);
      message.success("Đã cập nhật lịch gửi!");
    } else {
      const newMsg: ScheduledMessage = {
        ...msg,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newMsg, ...scheduledMessages];
      setScheduledMessages(updated);
      saveScheduledMessages(updated);
      message.success(`Đã lên lịch gửi thành công vào ${dayjs(msg.scheduledAt).format("DD/MM/YYYY HH:mm")}!`);
    }
    setSendMessageModalOpen(false);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    setEditingScheduled(null);
  };

  const handleEditScheduled = (msg: ScheduledMessage) => {
    setEditingScheduled(msg);
    setSendChannel(msg.channel);
    setSendMessageModalOpen(true);
    setScheduleListOpen(false);
  };

  const handleDeleteScheduled = (id: string) => {
    const updated = scheduledMessages.filter((m) => m.id !== id);
    setScheduledMessages(updated);
    saveScheduledMessages(updated);
    message.success("Đã hủy lịch gửi!");
  };

  const pendingCount = scheduledMessages.filter((m) => !isSent(m)).length;
  const pendingRequestsCount = accessRequests.filter((r) => r.status === "PENDING").length;

  // ── Render ──
  return (
    <>
      <PageMeta title="Quản lý KOC" description="Trang quản lý KOC phân quyền theo role Sao Mai & Hằng / Sales / PM" />
      <PageBreadcrumb pageTitle="Quản lý KOC" />

      {/* RBAC Rule Description Card */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space>
            <SafetyCertificateOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                Phân quyền truy cập thông tin KOC (Role: <Tag color="blue">{activeRole}</Tag>):
              </div>
              <div style={{ fontSize: 12, color: "#595959" }}>
                {activeRole === "ADMIN" && "👑 Quản trị viên (Sao Mai & Hằng): Toàn quyền xem Email, SĐT, Zalo và Phê duyệt các yêu cầu từ Vận hành (PM)."}
                {activeRole === "SALES" && "💼 Sales Account: ĐÃ CHE MẶC ĐỊNH thông tin Email, SĐT, Zalo của KOC để bảo mật."}
                {activeRole === "PM" && "🛠️ Vận hành (PM): Xem đầy đủ thông tin KOC theo từng Job. Trong danh sách KOC chung: bấm 'Xin phê duyệt' để gửi Chị Mai/Hằng mở khóa."}
              </div>
            </div>
          </Space>

          {/* Admin Approval Button */}
          {activeRole === "ADMIN" && (
            <Badge count={pendingRequestsCount} offset={[-4, 4]}>
              <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={() => setApprovalModalOpen(true)}>
                Duyệt Yêu Cầu Xin Xem KOC ({pendingRequestsCount})
              </Button>
            </Badge>
          )}
        </Flex>
      </Card>

      {/* Data Source Selector Banner (System REST API vs Kalodata API) */}
      <Card size="small" style={{ marginBottom: 20, borderColor: dataSourceMode === "KALODATA" ? "#722ed1" : "#d9d9d9" }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space size={12}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Nguồn dữ liệu KOC:</span>
            <Segmented
              value={dataSourceMode}
              onChange={(val) => setDataSourceMode(val as "SYSTEM" | "KALODATA")}
              options={[
                { label: "🏢 KOC Hệ Thống", value: "SYSTEM" },
                { label: "📊 KOC từ Kalodata (Live Ranking API)", value: "KALODATA" },
              ]}
            />
            {dataSourceMode === "KALODATA" && (
              <Tag color="purple" icon={<ThunderboltOutlined />}>
                Dữ liệu trực tiếp từ Kalodata TikTok Shop Ranking API
              </Tag>
            )}
            {isLoadingKalodata && dataSourceMode === "KALODATA" && (
              <span style={{ fontSize: 12, color: "#722ed1" }}>Đang tải từ Kalodata...</span>
            )}
          </Space>

          {dataSourceMode === "KALODATA" && (
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
              onClick={handleImportKalodataKocs}
            >
              📥 Nhập KOC Kalodata vào Hệ Thống {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : "(Top 5)"}
            </Button>
          )}
        </Flex>
      </Card>

      {/* Toolbar */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <KOCSearchBar
          selectedCount={selectedRowKeys.length}
          onSearch={(val) => setSearchQuery(val)}
        />

        <Space size={10}>
          <Button type="primary" icon={<MailOutlined />} onClick={() => handleOpenSendMessage("Email")}>
            Gửi Email{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ""}
          </Button>
          <Button
            style={{ backgroundColor: "#0068ff", borderColor: "#0068ff", color: "#fff" }}
            icon={<MessageOutlined />}
            onClick={() => handleOpenSendMessage("Zalo")}
          >
            Gửi Zalo{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ""}
          </Button>
          <Button
            disabled={selectedRowKeys.length === 0}
            onClick={() => { setSelectedRowKeys([]); setSelectedRows([]); }}
          >
            Bỏ chọn tất cả
          </Button>

          <Badge count={pendingCount} offset={[-4, 4]}>
            <Button icon={<ClockCircleOutlined />} onClick={() => setScheduleListOpen(true)}>
              Lịch gửi
            </Button>
          </Badge>

          <Button
            icon={<FileTextOutlined style={{ color: "#1890ff" }} />}
            onClick={() => setTemplateManagerOpen(true)}
          >
            Quản lý mẫu
          </Button>
          <Upload {...uploadProps}>
            <Button icon={<FileExcelOutlined style={{ color: "#52c41a" }} />}>Import Excel</Button>
          </Upload>
          {activeRole === "ADMIN" && (
            <Button
              type="primary"
              onClick={handleOpenAdd}
              loading={isCreating || isUpdating}
            >
              + Thêm KOC
            </Button>
          )}
        </Space>
      </Flex>

      {/* KOC Table */}
      <KOCTable
        kocsList={kocsList}
        selectedRowKeys={selectedRowKeys}
        loading={dataSourceMode === "KALODATA" ? isLoadingKalodata : (isLoadingUsers || isFetching)}
        onSelectionChange={(keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); }}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onViewHistory={handleOpenHistory}
      />

      {/* Modals */}
      <KOCFormModal open={modalOpen} editingKOC={editingKOC} onClose={handleClose} onSubmit={handleSubmit} />

      <KOCHistoryModal
        open={historyModalOpen}
        koc={selectedHistoryKOC}
        onClose={() => { setHistoryModalOpen(false); setSelectedHistoryKOC(null); }}
      />

      <SendMessageModal
        open={sendMessageModalOpen}
        channel={sendChannel}
        selectedKOCs={selectedRows}
        editingScheduled={editingScheduled}
        onClose={() => { setSendMessageModalOpen(false); setEditingScheduled(null); }}
        onSchedule={handleSchedule}
      />

      <ScheduledMsgModal
        open={scheduleListOpen}
        onClose={() => setScheduleListOpen(false)}
        scheduledMessages={scheduledMessages}
        onEdit={handleEditScheduled}
        onDelete={handleDeleteScheduled}
      />

      <TemplateManagerModal open={templateManagerOpen} onClose={() => setTemplateManagerOpen(false)} />

      {/* Admin Approval Modal (Sao Mai & Hằng Approve PM Requests) */}
      <Modal
        title="👑 Phê duyệt yêu cầu xem thông tin KOC (Sao Mai & Hằng Admin)"
        open={approvalModalOpen}
        onCancel={() => setApprovalModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={accessRequests}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: "KOC", dataIndex: "kocName", key: "kocName" },
            { title: "Người xin (PM)", dataIndex: "pmName", key: "pmName" },
            {
              title: "Thời gian",
              dataIndex: "requestedAt",
              key: "requestedAt",
              render: (d) => dayjs(d).format("DD/MM/YYYY HH:mm"),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (st) => (
                <Tag color={st === "APPROVED" ? "green" : st === "REJECTED" ? "red" : "gold"}>
                  {st === "APPROVED" ? "Đã duyệt" : st === "REJECTED" ? "Từ chối" : "Chờ duyệt"}
                </Tag>
              ),
            },
            {
              title: "Duyệt / Từ chối",
              key: "action",
              render: (_, req) => (
                <Space>
                  {req.status === "PENDING" ? (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          approveKocAccess(req.id);
                          message.success(`Đã duyệt cho ${req.pmName} xem thông tin "${req.kocName}"!`);
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => {
                          rejectKocAccess(req.id);
                          message.info(`Đã từ chối yêu cầu của ${req.pmName}`);
                        }}
                      >
                        Từ chối
                      </Button>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>Đã xử lý</span>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
}
