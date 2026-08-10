import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  FileTextOutlined,
  MailOutlined,
  MessageOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { CreateTemplateFormValues } from "./types";
import type { MessageTemplate } from "../../services/template.service";
import {
  useTemplatesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
} from "../../hooks/query";

interface TemplateManagerModalProps {
  open: boolean;
  onClose: () => void;
}

/** Inline form shown inside the modal to create a new template */
function CreateTemplateForm({ onDone }: { onDone: () => void }) {
  const [form] = Form.useForm<CreateTemplateFormValues>();
  const createTemplateMutation = useCreateTemplateMutation();
  const channelWatch = Form.useWatch("channel", form);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createTemplateMutation.mutateAsync(values);
      message.success(`Đã tạo mẫu "${values.name}"!`);
      form.resetFields();
      onDone();
    } catch {}
  };

  return (
    <Card
      title="Tạo mẫu tin nhắn mới"
      size="small"
      style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
      extra={
        <Button size="small" type="text" onClick={onDone}>
          Hủy
        </Button>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ channel: "Email" }}>
        <Flex gap={16}>
          <Form.Item label="Tên mẫu" name="name" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Thư mời hợp tác Tết 2026" />
          </Form.Item>
          <Form.Item label="Kênh gửi" name="channel" style={{ width: 200 }} rules={[{ required: true }]}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="Email">Email</Radio.Button>
              <Radio.Button value="Zalo">Zalo</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Flex>

        {channelWatch !== "Zalo" && (
          <Form.Item label="Tiêu đề Email" name="subject" rules={[{ required: true }]}>
            <Input placeholder="[WeWin Campaign] Lời mời hợp tác..." />
          </Form.Item>
        )}

        <Form.Item label="Nội dung mẫu" name="content" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Xin chào KOC, bên mình từ WeWin..." />
        </Form.Item>

        <Flex justify="end" gap={8}>
          <Button onClick={onDone}>Hủy</Button>
          <Button type="primary" loading={createTemplateMutation.isPending} onClick={handleCreate}>
            Lưu mẫu
          </Button>
        </Flex>
      </Form>
    </Card>
  );
}

export function TemplateManagerModal({ open, onClose }: TemplateManagerModalProps) {
  const { data: templates = [], isLoading } = useTemplatesQuery();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const columns: TableColumnsType<MessageTemplate> = [
    {
      title: "Tên mẫu",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {record.subject && (
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.subject}</div>
          )}
        </div>
      ),
    },
    {
      title: "Kênh",
      dataIndex: "channel",
      key: "channel",
      width: 100,
      render: (ch: "Email" | "Zalo") => (
        <Tag color={ch === "Email" ? "blue" : "green"}>
          {ch === "Email" ? <MailOutlined /> : <MessageOutlined />} {ch}
        </Tag>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <span style={{ fontSize: 13, color: "#595959" }}>
          {text.length > 80 ? `${text.slice(0, 80)}...` : text}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title="Xóa mẫu này?"
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
          onConfirm={() =>
            deleteTemplateMutation.mutate(record.id, {
              onSuccess: () => message.success("Đã xóa mẫu!"),
            })
          }
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <span>Quản lý mẫu tin nhắn</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>Đóng</Button>]}
      width={780}
    >
      <Flex justify="space-between" align="center" style={{ marginTop: 12, marginBottom: 16 }}>
        <span style={{ color: "#595959", fontSize: 13 }}>
          Tạo và quản lý các mẫu tin nhắn dùng chung cho toàn bộ chiến dịch.
        </span>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateFormOpen(true)}>
          Tạo mẫu mới
        </Button>
      </Flex>

      {createFormOpen && <CreateTemplateForm onDone={() => setCreateFormOpen(false)} />}

      <Table<MessageTemplate>
        columns={columns}
        dataSource={templates}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        size="small"
        bordered
      />
    </Modal>
  );
}
