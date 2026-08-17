import { Flex, Form, Input, InputNumber, Modal, Select } from "antd";
import type { KOCFormValues, KOCRecord } from "./types";

interface KOCFormModalProps {
  open: boolean;
  editingKOC: KOCRecord | null;
  onClose: () => void;
  onSubmit: (values: KOCFormValues) => void;
}

export function KOCFormModal({ open, editingKOC, onClose, onSubmit }: KOCFormModalProps) {
  const [form] = Form.useForm<KOCFormValues>();
  const isEditing = editingKOC !== null;

  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingKOC) form.setFieldsValue(editingKOC);
    if (!isOpen) form.resetFields();
  };

  const handleOk = () =>
    form
      .validateFields()
      .then((values) => { onSubmit(values); form.resetFields(); })
      .catch(() => {});

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa KOC" : "Thêm KOC mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
      afterOpenChange={handleAfterOpen}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* ── SECTION 1: Thông tin cơ bản (Shared) ── */}
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#1890ff" }}>
          📋 Thông tin cơ bản (Brand & Admin đều xem)
        </div>

        <Form.Item label="Tên nhà sáng tạo" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nhập tên KOC / nhà sáng tạo" />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item label="Tài khoản NST (handle)" name="tiktokAccount" style={{ flex: 1 }}>
            <Input placeholder="@username" />
          </Form.Item>
          <Form.Item label="Link TikTok" name="tiktokLink" style={{ flex: 1 }}>
            <Input placeholder="https://tiktok.com/@..." />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Nền tảng" name="platform" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn nền tảng">
              <Select.Option value="Instagram">Instagram</Select.Option>
              <Select.Option value="TikTok">TikTok</Select.Option>
              <Select.Option value="YouTube">YouTube</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Tier" name="tier" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn tier">
              <Select.Option value="Nano">Nano (&lt; 10K)</Select.Option>
              <Select.Option value="Micro">Micro (10K–100K)</Select.Option>
              <Select.Option value="Macro">Macro (100K–1M)</Select.Option>
              <Select.Option value="Mega">Mega (&gt; 1M)</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Lượng theo dõi" name="followers" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              placeholder="2,500,000"
            />
          </Form.Item>
          <Form.Item label="Tỷ lệ tương tác (%)" name="engagementRate" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Doanh số (₫)" name="gmv" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
          <Form.Item label="Giá bán trung bình (₫)" name="avgPrice" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="DS Livestream (₫)" name="livestreamRevenue" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
          <Form.Item label="DS Video (₫)" name="videoRevenue" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Lượt xem" name="totalViews" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        {/* ── SECTION 2: Thông tin cá nhân (Admin only) ── */}
        <div style={{ fontWeight: 600, margin: "16px 0 8px", color: "#ff4d4f" }}>
          🔒 Thông tin riêng tư (Chỉ Admin xem — ẩn với Brand)
        </div>

        <Flex gap={16}>
          <Form.Item
            label="Email"
            name="email"
            style={{ flex: 1 }}
            rules={[{ required: true }, { type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="example@gmail.com" disabled={isEditing} />
          </Form.Item>
          <Form.Item label="Facebook" name="facebook" style={{ flex: 1 }}>
            <Input placeholder="fb.com/username" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Số điện thoại" name="phone" style={{ flex: 1 }}>
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item label="Zalo" name="zalo" style={{ flex: 1 }}>
            <Input placeholder="0901234567" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Họ tên đầy đủ" name="name" style={{ flex: 1 }}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item label="Giới tính" name="gender" style={{ flex: 1 }}>
            <Select placeholder="Chọn giới tính">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="GMV / Khách hàng (₫)" name="gmvPerCustomer" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
          <Form.Item label="GPM (₫ / 1000 views)" name="gpm" style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              addonAfter="₫"
            />
          </Form.Item>
        </Flex>

        <Form.Item label="Địa chỉ nhận hàng mẫu" name="sampleAddress">
          <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item label="Số tài khoản ngân hàng (nhận cast)" name="bankAccount" style={{ flex: 1 }}>
            <Input placeholder="1234567890 – Ngân hàng" />
          </Form.Item>
          <Form.Item label="Độ tuổi của con" name="childrenAge" style={{ flex: 1 }}>
            <Input placeholder="5 tuổi, Chưa có con..." />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Đặc điểm kênh" name="category" style={{ flex: 1 }}>
            <Select placeholder="Chọn chủ đề">
              <Select.Option value="Beauty">Beauty</Select.Option>
              <Select.Option value="Fashion">Fashion</Select.Option>
              <Select.Option value="Tech">Tech</Select.Option>
              <Select.Option value="F&B">F&B</Select.Option>
              <Select.Option value="Travel">Travel</Select.Option>
              <Select.Option value="Lifestyle">Lifestyle</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Thành phố" name="city" style={{ flex: 1 }}>
            <Select placeholder="Chọn tỉnh/TP">
              <Select.Option value="Hà Nội">Hà Nội</Select.Option>
              <Select.Option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Select.Option>
              <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
              <Select.Option value="Cần Thơ">Cần Thơ</Select.Option>
              <Select.Option value="Hải Phòng">Hải Phòng</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
}
