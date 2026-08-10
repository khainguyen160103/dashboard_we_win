import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  MessageOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Select } from "antd";
import type { KOCRecord, MessageChannel, ScheduledMessage } from "./types";
import { isSent } from "./types";
import { useTemplatesQuery, useCreateTemplateMutation, useDeleteTemplateMutation } from "../../hooks/query";

// ─── Types ────────────────────────────────────────────────────────────────────
type SendFormValues = {
  subject?: string;
  content: string;
  scheduledAt: Dayjs;
};

interface SendMessageModalProps {
  open: boolean;
  channel: MessageChannel | null;
  /** KOCs selected on the table (used when creating a new schedule) */
  selectedKOCs: KOCRecord[];
  /** When set, the modal is in edit/view mode for an existing scheduled message */
  editingScheduled: ScheduledMessage | null;
  onClose: () => void;
  onSchedule: (msg: Omit<ScheduledMessage, "id" | "createdAt">) => void;
}

// ─── Recipient List ───────────────────────────────────────────────────────────
function RecipientList({
  recipients,
  isEmail,
}: {
  recipients: ScheduledMessage["recipients"];
  isEmail: boolean;
}) {
  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: "#595959", marginBottom: 6 }}>
        <strong>Người nhận ({recipients.length} KOC):</strong>
      </div>
      <div style={{ maxHeight: 72, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {recipients.map((r) => (
          <Tag key={r.id} color="blue">
            {r.name} ({isEmail ? r.email : r.phone || r.email})
          </Tag>
        ))}
      </div>
    </div>
  );
}

// ─── Read-only (sent) View ────────────────────────────────────────────────────
function SentMessageView({ msg }: { msg: ScheduledMessage }) {
  return (
    <div>
      {msg.subject && (
        <div style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Tiêu đề</Typography.Text>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{msg.subject}</div>
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>Nội dung</Typography.Text>
        <div
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 2,
            padding: "10px 14px",
            background: "#f5f5f5",
            borderRadius: 6,
          }}
        >
          {msg.content}
        </div>
      </div>
      <Flex gap={24}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Thời gian gửi</Typography.Text>
          <div style={{ fontWeight: 600 }}>{dayjs(msg.scheduledAt).format("DD/MM/YYYY HH:mm")}</div>
        </div>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Trạng thái</Typography.Text>
          <div>
            <Tag color="success" icon={<CheckCircleOutlined />}>Đã gửi</Tag>
          </div>
        </div>
      </Flex>
    </div>
  );
}

// ─── Editable Message Form ────────────────────────────────────────────────────
function MessageForm({
  form,
  channel,
  isEmail,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onClearTemplate,
  onDeleteTemplate,
  onSaveTemplate,
}: {
  form: ReturnType<typeof Form.useForm<SendFormValues>>[0];
  channel: MessageChannel;
  isEmail: boolean;
  templates: ReturnType<typeof useTemplatesQuery>["data"];
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onClearTemplate: () => void;
  onDeleteTemplate: (e: React.MouseEvent, id: string) => void;
  onSaveTemplate: () => void;
}) {
  return (
    <Form form={form} layout="vertical">
      {/* Template Selector */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Form.Item label="Chọn mẫu tin nhắn" style={{ marginBottom: 0, flex: 1, marginRight: 12 }}>
          <Select
            placeholder="-- Áp dụng mẫu có sẵn --"
            value={selectedTemplateId}
            onChange={onSelectTemplate}
            allowClear
            onClear={onClearTemplate}
          >
            {(templates ?? []).map((tpl) => (
              <Select.Option key={tpl.id} value={tpl.id}>
                <Flex justify="space-between" align="center">
                  <span>📋 {tpl.name}</span>
                  <DeleteOutlined
                    style={{ color: "#ff4d4f", marginLeft: 8 }}
                    onClick={(e) => onDeleteTemplate(e, tpl.id)}
                  />
                </Flex>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Button
          type="dashed"
          icon={<SaveOutlined />}
          style={{ marginTop: 29 }}
          onClick={onSaveTemplate}
        >
          Lưu mẫu
        </Button>
      </Flex>

      {isEmail && (
        <Form.Item
          label="Tiêu đề Email"
          name="subject"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        >
          <Input placeholder="[Hợp tác Campaign] Lời mời tham gia chiến dịch..." />
        </Form.Item>
      )}

      <Form.Item
        label={`Nội dung ${channel}`}
        name="content"
        rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
      >
        <Input.TextArea rows={6} placeholder="Xin chào KOC, bên mình từ WeWin muốn gửi lời mời hợp tác..." />
      </Form.Item>

      <Form.Item
        label={
          <Space>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <span>Ngày &amp; Giờ gửi</span>
          </Space>
        }
        name="scheduledAt"
        rules={[{ required: true, message: "Vui lòng chọn ngày giờ gửi" }]}
      >
        <DatePicker
          showTime={{ format: "HH:mm" }}
          format="DD/MM/YYYY HH:mm"
          style={{ width: "100%" }}
          placeholder="Chọn ngày và giờ muốn gửi tin nhắn"
          disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
        />
      </Form.Item>

      <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: -12, marginBottom: 4 }}>
        ⚠️ Tin nhắn có thể chỉnh sửa cho đến trước giờ gửi. Sau khi hệ thống gửi xong, nội dung sẽ bị khóa.
      </div>
    </Form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SendMessageModal({
  open,
  channel,
  selectedKOCs,
  editingScheduled,
  onClose,
  onSchedule,
}: SendMessageModalProps) {
  const [form] = Form.useForm<SendFormValues>();
  const { data: templates = [] } = useTemplatesQuery(channel ?? undefined);
  const createTemplateMutation = useCreateTemplateMutation();
  const deleteTemplateMutation = useDeleteTemplateMutation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const isEmail = channel === "Email";
  const isReadOnly = editingScheduled !== null && isSent(editingScheduled);

  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingScheduled) {
      form.setFieldsValue({
        subject: editingScheduled.subject,
        content: editingScheduled.content,
        scheduledAt: dayjs(editingScheduled.scheduledAt),
      });
    }
    if (!isOpen) {
      form.resetFields();
      setSelectedTemplateId(null);
    }
  };

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = templates.find((t) => t.id === tplId);
    if (found) {
      form.setFieldsValue({ subject: found.subject ?? "", content: found.content });
      message.info(`Đã áp dụng mẫu: "${found.name}"`);
    }
  };

  const handleDeleteTemplate = (e: React.MouseEvent, tplId: string) => {
    e.stopPropagation();
    deleteTemplateMutation.mutate(tplId, {
      onSuccess: () => {
        if (selectedTemplateId === tplId) setSelectedTemplateId(null);
        message.success("Đã xóa mẫu!");
      },
    });
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) { message.error("Vui lòng nhập tên mẫu"); return; }
    const vals = form.getFieldsValue();
    if (!vals.content?.trim()) { message.error("Nội dung không được để trống"); return; }
    try {
      await createTemplateMutation.mutateAsync({
        name: newTemplateName.trim(),
        channel: channel ?? "Email",
        subject: vals.subject,
        content: vals.content,
      });
      setNewTemplateName("");
      setSaveModalOpen(false);
      message.success(`Đã lưu mẫu "${newTemplateName.trim()}"!`);
    } catch {
      message.error("Không thể lưu mẫu");
    }
  };

  const handleOk = () => {
    if (isReadOnly) { onClose(); return; }
    form.validateFields().then((values) => {
      onSchedule({
        channel: channel ?? "Email",
        subject: values.subject,
        content: values.content,
        scheduledAt: values.scheduledAt.toISOString(),
        recipients: selectedKOCs.map((k) => ({
          id: k.id,
          name: k.name,
          email: k.email,
          phone: k.phone,
        })),
        sendStatus: "pending",
      });
      form.resetFields();
    }).catch(() => {});
  };

  const recipients =
    editingScheduled?.recipients ??
    selectedKOCs.map((k) => ({ id: k.id, name: k.name, email: k.email, phone: k.phone }));

  return (
    <>
      <Modal
        title={
          <Space>
            {isEmail
              ? <MailOutlined style={{ color: "#1890ff" }} />
              : <MessageOutlined style={{ color: "#52c41a" }} />}
            <span>
              {isReadOnly
                ? "Xem tin nhắn đã gửi"
                : editingScheduled
                ? "Chỉnh sửa lịch gửi"
                : `Lên lịch gửi qua ${channel}`}
            </span>
            {isReadOnly && <Tag color="success" icon={<CheckCircleOutlined />}>Đã gửi</Tag>}
          </Space>
        }
        open={open}
        onCancel={() => { onClose(); setSelectedTemplateId(null); }}
        onOk={handleOk}
        okText={isReadOnly ? "Đóng" : editingScheduled ? "Cập nhật lịch gửi" : "Lên lịch gửi"}
        cancelButtonProps={{ style: { display: isReadOnly ? "none" : "inline-flex" } }}
        cancelText="Hủy"
        afterOpenChange={handleAfterOpen}
        destroyOnClose
        width={660}
      >
        <RecipientList recipients={recipients} isEmail={isEmail} />
        <Divider style={{ margin: "12px 0" }} />

        {isReadOnly && editingScheduled ? (
          <SentMessageView msg={editingScheduled} />
        ) : (
          <MessageForm
            form={form}
            channel={channel ?? "Email"}
            isEmail={isEmail}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onClearTemplate={() => setSelectedTemplateId(null)}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveTemplate={() => setSaveModalOpen(true)}
          />
        )}
      </Modal>

      {/* Save-template sub-modal */}
      <Modal
        title="Lưu mẫu tin nhắn mới"
        open={saveModalOpen}
        onCancel={() => setSaveModalOpen(false)}
        onOk={handleSaveTemplate}
        okText="Lưu mẫu"
        cancelText="Hủy"
        width={440}
      >
        <Form layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Tên mẫu tin nhắn" required>
            <Input
              placeholder="Ví dụ: Thư mời Campaign Tết..."
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
