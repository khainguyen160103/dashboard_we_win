import { DatePicker, Form, Input, InputNumber, Modal, Row, Col, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Campaign, CampaignFormValues } from "./types";
import { CATEGORY_OPTIONS } from "./campaign.utils";

interface CampaignFormModalProps {
  open: boolean;
  editingCampaign: Campaign | null;
  onClose: () => void;
  onSubmit: (values: CampaignFormValues) => void;
}

const CAMPAIGN_TYPE_OPTIONS = [
  { value: "tap_optimize", label: "Tối ưu TAP" },
  { value: "brand_awareness", label: "Tăng nhận diện thương hiệu" },
  { value: "gmv_push", label: "Đẩy doanh số (GMV)" },
  { value: "product_launch", label: "Ra mắt sản phẩm mới" },
];

const BRAND_OPTIONS = [
  "Cocoon Vietnam",
  "Samsung Vietnam",
  "Unilever",
  "La Roche-Posay",
  "Highlands Coffee",
  "Vietjet Air",
  "Uniqlo Vietnam",
].map((b) => ({ value: b, label: b }));

const STATUS_OPTIONS = [
  { value: "Draft", label: "Nháp" },
  { value: "Active", label: "Đang chạy" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
];

const TIER_OPTIONS = [
  { value: "any", label: "Không giới hạn" },
  { value: "Nano", label: "Nano" },
  { value: "Micro", label: "Micro" },
  { value: "Macro", label: "Macro" },
  { value: "Mega", label: "Mega" },
];

const CAST_MODE_OPTIONS = [
  { value: "no_cast", label: "Không Cast" },
  { value: "paid_cast", label: "Trả phí Cast" },
  { value: "free_cast", label: "Cast miễn phí" },
];

const PM_OPTIONS = [
  { value: "pm_anh", label: "Anh Nguyễn (PM)" },
  { value: "pm_thu", label: "Thu Hà (PM)" },
  { value: "pm_khoi", label: "Khôi Trần (PM)" },
];

const ACCOUNT_OPTIONS = [
  { value: "acc_linh", label: "Linh Phạm (Account)" },
  { value: "acc_minh", label: "Minh Lê (Account)" },
  { value: "acc_trang", label: "Trang Đỗ (Account)" },
];

const labelWithHint = (text: string, hint: string) => (
  <span className="inline-flex items-center gap-1">
    {text}
    <Tooltip title={hint}>
      <InfoCircleOutlined className="text-gray-400" />
    </Tooltip>
  </span>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-4 rounded-xl border border-gray-200 px-4 pb-0 pt-1">
      <legend className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function CampaignFormModal({
  open,
  editingCampaign,
  onClose,
  onSubmit,
}: CampaignFormModalProps) {
  const [form] = Form.useForm<CampaignFormValues>();
  const isEditing = editingCampaign !== null;

  const handleAfterOpen = (isOpen: boolean) => {
    if (isOpen && editingCampaign) {
      form.setFieldsValue({
        name: editingCampaign.name,
        description: editingCampaign.description,
        brandName: editingCampaign.brandName,
        category: editingCampaign.category,
        status: editingCampaign.status,
        startDate: editingCampaign.startDate
          ? (dayjs(editingCampaign.startDate) as any)
          : undefined,
        endDate: editingCampaign.endDate
          ? (dayjs(editingCampaign.endDate) as any)
          : undefined,
      });
    }
    if (!isOpen) {
      form.resetFields();
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const start = values.startDate ? dayjs(values.startDate as any) : null;
        const end = values.endDate ? dayjs(values.endDate as any) : null;

        onSubmit({
          ...values,
          startDate: start ? start.toISOString() : undefined,
          endDate: end ? end.toISOString() : undefined,
          dateRange: [
            start ? start.toISOString() : "",
            end ? end.toISOString() : "",
          ],
        });
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEditing ? "Lưu thay đổi" : "Tạo chiến dịch"}
      cancelText="Hủy"
      afterOpenChange={handleAfterOpen}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto", paddingRight: 8 } }}
    >
      <p className="mb-4 mt-2 text-xs leading-relaxed text-gray-500">
        Biểu mẫu minh hoạ <strong>đầy đủ trường dữ liệu cần thu thập</strong> khi tạo
        chiến dịch — giúp đội dev chốt schema trước khi code. Form-inputs mang tính tham
        khảo, submit chưa kết nối API trong bản demo.
      </p>

      <Form form={form} layout="vertical" requiredMark="optional">
        {/* ── Thông tin cơ bản ─────────────────────────────────────────── */}
        <Section title="Thông tin cơ bản">
          <Form.Item
            label="Tên chiến dịch"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên chiến dịch" }]}
          >
            <Input placeholder="VD: Comfort - Mùa hè 2026" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={labelWithHint("Loại chiến dịch", "Định hướng chính của chiến dịch")}
                name="campaignType"
              >
                <Select placeholder="Chọn loại chiến dịch..." options={CAMPAIGN_TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Nhãn hàng" name="brandName">
                <Select
                  placeholder="Chọn nhãn hàng..."
                  options={BRAND_OPTIONS}
                  showSearch
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Chủ đề / Ngành hàng" name="category">
                <Select placeholder="Chọn ngành hàng..." options={CATEGORY_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                initialValue="Draft"
                rules={[{ required: true }]}
              >
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả chiến dịch" name="description">
            <Input.TextArea
              rows={3}
              placeholder="VD: Tăng nhận diện dòng sản phẩm mới, mục tiêu GMV 4.5Bđ"
            />
          </Form.Item>
        </Section>

        {/* ── Thời gian ────────────────────────────────────────────────── */}
        <Section title="Thời gian">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                dependencies={["startDate"]}
                rules={[
                  { required: true, message: "Chọn ngày kết thúc" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue("startDate");
                      if (!value || !start || dayjs(value).isAfter(dayjs(start))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
                    },
                  }),
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        {/* ── Hoa hồng affiliate ───────────────────────────────────────── */}
        <Section title="Hoa hồng affiliate">
          <div className="mb-1 text-[13px] font-semibold text-gray-700">Hoa hồng KOC</div>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Tự nhiên (%)" name="kocCommissionOrganic">
                <InputNumber min={0} max={100} placeholder="VD: 10" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Quảng cáo (%)" name="kocCommissionAds">
                <InputNumber min={0} max={100} placeholder="VD: 5" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-1 text-[13px] font-semibold text-gray-700">Hoa hồng TAP</div>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Tự nhiên (%)" name="tapCommissionOrganic">
                <InputNumber min={0} max={100} placeholder="VD: 0" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Quảng cáo (%)" name="tapCommissionAds">
                <InputNumber min={0} max={100} placeholder="VD: 0" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        {/* ── Mục tiêu KPI ─────────────────────────────────────────────── */}
        <Section title="Mục tiêu KPI">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Số KOC mục tiêu" name="targetKocCount">
                <InputNumber min={0} placeholder="VD: 6" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tier KOC yêu cầu" name="requiredTier" initialValue="any">
                <Select options={TIER_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        {/* ── Cast & nội dung ──────────────────────────────────────────── */}
        <Section title="Cast & nội dung">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={labelWithHint("Cast", "Chi phí thuê KOC quay/đăng nội dung")}
                name="castMode"
                initialValue="paid_cast"
              >
                <Select options={CAST_MODE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Phí Cast / KOC (đ)" name="castFeePerKoc">
                <InputNumber<number>
                  min={0}
                  step={100000}
                  placeholder="VD: 3,000,000"
                  style={{ width: "100%" }}
                  formatter={(v) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => Number((v ?? "").replace(/,/g, "")) || 0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Số video / KOC" name="videosPerKoc">
                <InputNumber min={0} placeholder="VD: 2" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Deadline nộp nội dung" name="contentDeadline">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Yêu cầu duyệt nội dung" name="contentGuideline">
            <Input.TextArea rows={3} placeholder="Guideline / brief đính kèm cho KOC" />
          </Form.Item>
        </Section>

        {/* ── Phụ trách chiến dịch ─────────────────────────────────────── */}
        <Section title="Phụ trách chiến dịch">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={labelWithHint("PM", "Project Manager phụ trách")}
                name="pmId"
              >
                <Select placeholder="Chọn PM..." options={PM_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={labelWithHint("Account", "Account phụ trách nhãn hàng")}
                name="accountId"
              >
                <Select placeholder="Chọn Account..." options={ACCOUNT_OPTIONS} allowClear />
              </Form.Item>
            </Col>
          </Row>
        </Section>
      </Form>
    </Modal>
  );
}
