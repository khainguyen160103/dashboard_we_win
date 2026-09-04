/**
 * AddRoleModal
 *
 * Modal để thêm một vai trò mới vào hệ thống
 * Nhập: tên, mã code và mô tả
 */

import { Form, Input, Modal } from "antd";
import type { RoleRow } from "./types";

type FormValues = {
  name: string;
  code: string;
  description: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (newRole: Omit<RoleRow, "id">) => void;
};

export function AddRoleModal({ open, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<FormValues>();

  // Khi bấm OK: validate rồi gọi onSubmit
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          name: values.name.trim(),
          code: values.code.trim().toUpperCase().replace(/\s+/g, "_"),
          description: values.description.trim(),
        });
        form.resetFields();
      })
      .catch(() => {
        // Lỗi validation, antd tự hiển thị — không cần làm gì thêm
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Thêm vai trò mới"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tạo vai trò"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Tên vai trò"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
        >
          <Input placeholder="Ví dụ: PM / Vận hành, Sales Account..." />
        </Form.Item>

        <Form.Item
          label="Mã role (Code)"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã code" }]}
          tooltip="Mã sẽ được tự động chuyển thành chữ HOA, ví dụ: pm → PM"
        >
          <Input placeholder="Ví dụ: PM, SALES, KOC..." />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea
            rows={2}
            placeholder="Mô tả ngắn về vai trò này..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
