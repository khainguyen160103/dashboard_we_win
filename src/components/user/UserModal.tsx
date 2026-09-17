import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import type { User } from "../../model/User";
import { roleQuery } from "../../hooks/query/useRoleQuery";

export type UserFormValues = {
  name: string;
  email: string;
  role: string;
  status: string;
};

type Props = {
  open: boolean;
  editingUser: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
};

export function UserModal({ open, editingUser, loading, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<UserFormValues>();
  const { data: rolesData } = roleQuery.getRoles();

  useEffect(() => {
    if (!open) return;

    if (editingUser) {
      form.setFieldsValue({
        name: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.roleId,
        status: editingUser.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "ACTIVE" });
    }
  }, [open, editingUser, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch(() => {
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={editingUser ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Ví dụ: Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Ví dụ: user@example.com" />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select
            placeholder="Chọn vai trò"
            options={(rolesData ?? []).map((role) => ({
              label: role.name,
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select
            placeholder="Chọn trạng thái"
            options={[
              { label: "Đang hoạt động", value: "ACTIVE" },
              { label: "Không hoạt động", value: "INACTIVE" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UserModal;
