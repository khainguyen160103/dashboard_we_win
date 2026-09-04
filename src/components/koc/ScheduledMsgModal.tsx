import dayjs from "dayjs";
import { Button, Modal, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MailOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { ScheduledMessage } from "./types";
import { isSent } from "./types";

interface ScheduledMsgModalProps {
  open: boolean;
  onClose: () => void;
  scheduledMessages: ScheduledMessage[];
  onEdit: (msg: ScheduledMessage) => void;
  onDelete: (id: string) => void;
}

export function ScheduledMsgModal({
  open,
  onClose,
  scheduledMessages,
  onEdit,
  onDelete,
}: ScheduledMsgModalProps) {
  const columns: TableColumnsType<ScheduledMessage> = [
    {
      title: "Kênh",
      dataIndex: "channel",
      key: "channel",
      width: 90,
      render: (ch: "Email" | "Zalo") => (
        <Tag color={ch === "Email" ? "blue" : "green"}>
          {ch === "Email" ? <MailOutlined /> : <MessageOutlined />} {ch}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề / Nội dung",
      key: "content",
      render: (_, record) => (
        <div>
          {record.subject && <div style={{ fontWeight: 600 }}>{record.subject}</div>}
          <div style={{ fontSize: 12, color: "#595959" }}>
            {record.content.length > 60 ? `${record.content.slice(0, 60)}...` : record.content}
          </div>
        </div>
      ),
    },
    {
      title: "Người nhận",
      key: "recipients",
      width: 120,
      render: (_, record) => (
        <Tooltip title={record.recipients.map((r) => r.name).join(", ")}>
          <Tag>{record.recipients.length} KOC</Tag>
        </Tooltip>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "scheduledAt",
      key: "scheduledAt",
      width: 160,
      render: (dt: string) => dayjs(dt).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 110,
      render: (_, record) =>
        isSent(record) ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Đã gửi</Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="processing">Chờ gửi</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          {isSent(record) ? (
            <Tooltip title="Tin đã gửi, không thể chỉnh sửa">
              <Button size="small" icon={<EyeOutlined />} onClick={() => onEdit(record)}>
                Xem
              </Button>
            </Tooltip>
          ) : (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
              Sửa
            </Button>
          )}
          {!isSent(record) && (
            <Popconfirm
              title="Xóa lịch gửi"
              description="Bạn có chắc muốn hủy lịch gửi này?"
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
              onConfirm={() => onDelete(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <span>Lịch gửi tin nhắn</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>Đóng</Button>]}
      width={860}
    >
      <Table<ScheduledMessage>
        columns={columns}
        dataSource={scheduledMessages}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        size="small"
        bordered
        style={{ marginTop: 16 }}
        locale={{ emptyText: "Chưa có lịch gửi nào được đặt" }}
      />
    </Modal>
  );
}
