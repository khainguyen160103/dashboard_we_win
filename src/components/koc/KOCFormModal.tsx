import { useEffect } from "react";
import { Flex, Form, Input, InputNumber, Modal, Select } from "antd";
import { Koc } from "../../model/User";

interface KOCFormModalProps {
  open: boolean;
  /** null / undefined => chế độ "Thêm mới" (form trống). Có giá trị => chế độ "Chỉnh sửa". */
  koc?: Koc | null;
  /** disable nút OK + hiện spinner trong lúc gọi API. */
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: Koc) => void | Promise<void>;
}

/** Giá trị rỗng cho tất cả field để reset sạch form khi mở ở chế độ "Thêm mới". */
const EMPTY_KOC: Partial<Koc> = {
  name: "",
  email: "",
  idTiktok: "",
  linkTiktok: "",
  facebook: "",
  zalo: "",
  kocType: "",
  productCategory: "",
  tier: undefined,
  status: undefined,
  followers: undefined,
  viewer: undefined,
  engagementRate: undefined,
  averageSellingPrice: undefined,
  gmv: undefined,
  revenue: undefined,
  livestreamTotalAmount: undefined,
  videoTotalAmount: undefined,
  gmvPerCustomer: undefined,
  gmvByProduct: undefined,
  gmvPerSaleChanel: undefined,
  followerFemale: undefined,
  followerMale: undefined,
  followerAge: undefined,
  topLocation: "",
  ageOfChildren: "",
  address: "",
  bankAccount: "",
  typeBank: "",
};

const thousands = (v: string | number | undefined) =>
  `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const parseThousands = (v: string | undefined) =>
  (v ?? "").toString().replace(/[^\d.]/g, "");

export function KOCFormModal({ open, koc = null, loading = false, onClose, onSubmit }: KOCFormModalProps) {
  const [form] = Form.useForm<Koc>();
  const isEditing = koc != null;

  // Mỗi lần mở modal: xoá lỗi validate cũ + nạp lại dữ liệu (trống nếu thêm mới).
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ ...EMPTY_KOC, ...(koc ?? {}) } as Koc);
  }, [open, koc, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch {
      /* validate lỗi hoặc submit thất bại -> giữ modal mở để user sửa */
    }
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa KOC" : "Thêm KOC mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      okText={isEditing ? "Lưu thay đổi" : "Thêm mới"}
      cancelText="Hủy"
      afterClose={() => form.resetFields()}
      width={720}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* ── Thông tin cơ bản ── */}
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Thông tin cơ bản</div>

        <Flex gap={16}>
          <Form.Item
            label="Tên nhà sáng tạo"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên KOC" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Nhập tên KOC / nhà sáng tạo" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: !isEditing, message: "Email bắt buộc khi tạo KOC mới" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            extra={isEditing ? "Không thể đổi email của KOC đã tạo" : undefined}
            style={{ flex: 1 }}
          >
            <Input placeholder="koc@example.com" disabled={isEditing} />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="ID TikTok" name="idTiktok" style={{ flex: 1 }}>
            <Input placeholder="@username" />
          </Form.Item>
          <Form.Item label="Link TikTok" name="linkTiktok" style={{ flex: 1 }}>
            <Input placeholder="https://tiktok.com/@..." />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Facebook" name="facebook" style={{ flex: 1 }}>
            <Input placeholder="fb.com/username" />
          </Form.Item>
          <Form.Item label="Zalo" name="zalo" style={{ flex: 1 }}>
            <Input placeholder="0901234567" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Loại KOC" name="kocType" style={{ flex: 1 }}>
            <Input placeholder="Làm đẹp, Công nghệ, Thời trang..." />
          </Form.Item>
          <Form.Item label="Danh mục sản phẩm" name="productCategory" style={{ flex: 1 }}>
            <Input placeholder="Mỹ phẩm & Chăm sóc da..." />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Tier" name="tier" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn tier">
              <Select.Option value="Nano">Nano (&lt; 10K)</Select.Option>
              <Select.Option value="Micro">Micro (10K–100K)</Select.Option>
              <Select.Option value="Macro">Macro (100K–1M)</Select.Option>
              <Select.Option value="Mega">Mega (&gt; 1M)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Ngừng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Flex>

        {/* ── Chỉ số hiệu suất ── */}
        <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>Chỉ số hiệu suất</div>

        <Flex gap={16}>
          <Form.Item label="Lượng theo dõi" name="followers" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={thousands}
              parser={parseThousands}
              placeholder="185,000"
            />
          </Form.Item>
          <Form.Item label="Lượt xem" name="viewer" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Tỷ lệ tương tác (%)" name="engagementRate" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={0} max={100} step={0.1} style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>
          <Form.Item label="Giá bán trung bình (₫)" name="averageSellingPrice" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="GMV (₫)" name="gmv" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
          <Form.Item label="Doanh thu (₫)" name="revenue" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="Doanh số Livestream (₫)" name="livestreamTotalAmount" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
          <Form.Item label="Doanh số Video (₫)" name="videoTotalAmount" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
        </Flex>

        <Flex gap={16}>
          <Form.Item label="GMV / Khách hàng (₫)" name="gmvPerCustomer" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
          <Form.Item label="GMV theo sản phẩm (₫)" name="gmvByProduct" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
          </Form.Item>
        </Flex>

        <Form.Item label="GMV theo kênh bán (₫)" name="gmvPerSaleChanel">
          <InputNumber min={0} style={{ width: "100%" }} formatter={thousands} parser={parseThousands} addonAfter="₫" />
        </Form.Item>

        {/* ── Nhân khẩu học follower ── */}
        <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>Nhân khẩu học follower</div>

        <Flex gap={16}>
          <Form.Item label="Follower Nữ (%)" name="followerFemale" style={{ flex: 1 }}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>
          <Form.Item label="Follower Nam (%)" name="followerMale" style={{ flex: 1 }}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>
          <Form.Item label="Độ tuổi Follower" name="followerAge" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Flex>

        {/* ── Thông tin cá nhân & vận chuyển ── */}
        <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>Thông tin cá nhân & vận chuyển</div>

        <Flex gap={16}>
          <Form.Item label="Khu vực hàng đầu" name="topLocation" style={{ flex: 1 }}>
            <Input placeholder="TP. Hồ Chí Minh, Hà Nội..." />
          </Form.Item>
          <Form.Item label="Độ tuổi của con" name="ageOfChildren" style={{ flex: 1 }}>
            <Input placeholder="5, 10... (số tuổi)" />
          </Form.Item>
        </Flex>

        <Form.Item label="Địa chỉ nhận hàng" name="address">
          <Input placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" />
        </Form.Item>

        <Flex gap={16}>
          <Form.Item label="Số tài khoản ngân hàng (nhận cast)" name="bankAccount" style={{ flex: 1 }}>
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item label="Ngân hàng" name="typeBank" style={{ flex: 1 }}>
            <Input placeholder="Vietcombank, Techcombank..." />
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
}
