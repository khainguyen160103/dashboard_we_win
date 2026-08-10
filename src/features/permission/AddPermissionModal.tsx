/**
 * AddPermissionModal
 *
 * Modal để thêm một quyền (permission) mới vào hệ thống
 * Nhập: tên, mã code, resource, action và mô tả
 */

import { Flex, Form, Input, Modal } from "antd";
import type { PermissionCol } from "./types";

type FormValues = {
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPermission: Omit<PermissionCol, "id">) => void;
};

export function AddPermissionModal({ open, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<FormValues>();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          name: values.name.trim(),
          code: values.code.trim().toUpperCase().replace(/\s+/g, "_"),
          resource: values.resource.trim().toLowerCase(),
          action: values.action.trim().toLowerCase(),
        });
        form.resetFields();
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm quyền mới"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tạo quyền"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Tên quyền"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên quyền" }]}
        >
          <Input placeholder="Ví dụ: Duyệt Video, Xem Báo cáo..." />
        </Form.Item>

        <Form.Item
          label="Mã quyền (Code)"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã code" }]}
          tooltip="Tự động chuyển thành chữ HOA, ví dụ: video approve → VIDEO_APPROVE"
        >
          <Input placeholder="Ví dụ: JOB_APPROVE, CAMPAIGN_EDIT..." />
        </Form.Item>

        {/* Resource và Action đặt cạnh nhau cho gọn */}
        <Flex gap={12}>
          <Form.Item
            label="Resource (Tài nguyên)"
            name="resource"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Nhập resource" }]}
          >
            <Input placeholder="campaign, job, user..." />
          </Form.Item>

          <Form.Item
            label="Action (Hành động)"
            name="action"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Nhập action" }]}
          >
            <Input placeholder="read, write, delete, approve..." />
          </Form.Item>
        </Flex>

        <Form.Item label="Mô tả (không bắt buộc)" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả phạm vi của quyền này..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
