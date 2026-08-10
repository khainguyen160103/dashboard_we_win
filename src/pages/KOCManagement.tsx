import React, { useState } from "react";
import dayjs from "dayjs";
import { Badge, Button, Flex, Space, Upload, message } from "antd";
import {
  ClockCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  MailOutlined,
  MessageOutlined,
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
  initialMockKOCs,
  loadScheduledMessages,
  saveScheduledMessages,
  isSent,
} from "../features/koc";

import type {
  KOCRecord,
  KOCFormValues,
  ScheduledMessage,
} from "../features/koc";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KOCManagement() {
  // ── KOC data ──
  const [kocsList, setKocsList] = useState<KOCRecord[]>(initialMockKOCs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKOC, setEditingKOC] = useState<KOCRecord | null>(null);

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

  // ── KOC CRUD handlers ──
  const handleOpenAdd = () => { setEditingKOC(null); setModalOpen(true); };
  const handleOpenEdit = (record: KOCRecord) => { setEditingKOC(record); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditingKOC(null); };

  const handleOpenHistory = (record: KOCRecord) => {
    setSelectedHistoryKOC(record);
    setHistoryModalOpen(true);
  };

  const handleSubmit = (values: KOCFormValues) => {
    if (editingKOC) {
      setKocsList((prev) => prev.map((item) => item.id === editingKOC.id ? { ...item, ...values } : item));
      message.success(`Đã cập nhật KOC "${values.name}"`);
    } else {
      const newKOC: KOCRecord = {
        id: Date.now(),
        ...values,
        totalPosts: 0,
        joinDate: new Date().toISOString().split("T")[0],
      };
      setKocsList((prev) => [newKOC, ...prev]);
      message.success(`Đã thêm KOC "${values.name}"`);
    }
    setModalOpen(false);
    setEditingKOC(null);
  };

  const handleDelete = (record: KOCRecord) => {
    setKocsList((prev) => prev.filter((item) => item.id !== record.id));
    message.success(`Đã xóa: ${record.name}`);
  };

  // ── Excel Import ──
  const uploadProps: UploadProps = {
    accept: ".xlsx, .xls, .csv",
    showUploadList: false,
    beforeUpload: (file) => {
      const imported: KOCRecord[] = [
        { id: Date.now() + 1, name: "KOC Import 01", email: `imported_${file.name.slice(0, 4)}1@gmail.com`, phone: "0988111222", platform: "TikTok", followers: 120000, engagementRate: 8.5, totalPosts: 45, status: "Active", tier: "Macro", joinDate: new Date().toISOString().split("T")[0] },
        { id: Date.now() + 2, name: "KOC Import 02", email: `imported_${file.name.slice(0, 4)}2@gmail.com`, phone: "0988333444", platform: "Instagram", followers: 45000, engagementRate: 6.2, totalPosts: 30, status: "Active", tier: "Micro", joinDate: new Date().toISOString().split("T")[0] },
      ];
      setKocsList((prev) => [...imported, ...prev]);
      message.success(`Đã import 2 KOC từ "${file.name}"!`);
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

  // ── Render ──
  return (
    <>
      <PageMeta title="Quản lý KOC" description="Trang quản lý KOC - Key Opinion Consumer" />
      <PageBreadcrumb pageTitle="Quản lý KOC" />

      {/* Toolbar */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <KOCSearchBar selectedCount={selectedRowKeys.length} />

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
          <Button type="primary" onClick={handleOpenAdd}>+ Thêm KOC</Button>
        </Space>
      </Flex>

      {/* KOC Table */}
      <KOCTable
        kocsList={kocsList}
        selectedRowKeys={selectedRowKeys}
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
    </>
  );
}
