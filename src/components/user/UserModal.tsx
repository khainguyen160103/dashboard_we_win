import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import type { User } from "../../model/User";
import { roleQuery } from "../../hooks/query/useRoleQuery";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, } from "react-hook-form";

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email("Email không hợp lệ"),
  role: z.string().uuid("Vai trò không hợp lệ"),
  status: z.string().max(20, "Trạng thái không hợp lệ"),
});

export type updateUserRequest = z.infer<typeof updateUserSchema>;


type Props = {
  open: boolean;
  editingUser: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: updateUserRequest) => void;
};

export function UserModal({ open, editingUser, loading, onClose, onSubmit }: Props) {

  const { handleSubmit, control, reset } = useForm<updateUserRequest>({
    resolver: zodResolver(updateUserSchema),

  });
  const { data: rolesData } = roleQuery.getRoles();

  const handleOk = () => {
    handleSubmit((values) => {
      onSubmit(values);
    })();
  };

  useEffect(() => {
    if (editingUser) {

      reset({
        name: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.roleId || "",
        status: editingUser.status,
      })
    }
  }, [editingUser, reset]);


  const handleCancel = () => {
    onClose();
    reset({
      name: "",
      email: "",
      role: "",
      status: "",
    });
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

    >
      <form className="flex flex-col gap-4">

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Họ và tên"

              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input {...field} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
          )}
        />


        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input {...field} placeholder="Ví dụ: user@example.com" />
            </Form.Item>
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Vai trò"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select
                {...field}
                value={field.value}
                onChange={field.onChange}
                placeholder="Chọn vai trò"
                options={(rolesData ?? []).map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
              />
            </Form.Item>
          )}
        >
        </Controller>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select
                {...field}
                placeholder="Chọn trạng thái"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                options={[
                  { label: "Đang hoạt động", value: "ACTIVE" },
                  { label: "Không hoạt động", value: "INACTIVE" },
                ]}
              />
            </Form.Item>
          )}
        >
        </Controller>
      </form>
    </Modal>
  );
}

export default UserModal;
