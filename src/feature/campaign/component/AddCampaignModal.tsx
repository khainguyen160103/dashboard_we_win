import { Checkbox, DatePicker, Input, InputNumber, Modal, Select, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import type { UploadFile } from 'antd'
import type { ReactNode } from 'react'
import { Controller, useForm, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CampaignRequest } from '../model/Campaign'
import { useProductCategoriesQuery } from '../hook/useProductCategoryQuery'
import { useBrandsQuery } from '../../../hooks/query/useBrandQuery'
import { useStaffOptions } from '../hook/useOpsStaffQuery'

const { TextArea } = Input

const dateSchema = z.custom<Dayjs>((v) => dayjs.isDayjs(v))
const percentSchema = z.number().min(0, { error: 'Tối thiểu 0%' }).max(100, { error: 'Tối đa 100%' }).optional()

const campaignSchema = z
  .object({
    name: z.string().trim().min(1, { error: 'Vui lòng nhập tên chiến dịch' }).max(200),
    type: z.string({ error: 'Chọn loại chiến dịch' }),
    brandId: z.string({ error: 'Chọn nhãn hàng' }),
    productCategoryId: z.string({ error: 'Chọn ngành hàng' }),
    status: z.string(),
    description: z.string().trim().max(1000).optional(),
    startDate: dateSchema.nullable().refine((v) => v !== null, { error: 'Chọn ngày bắt đầu' }),
    endDate: dateSchema.nullable().refine((v) => v !== null, { error: 'Chọn ngày kết thúc' }),
    kocOrganicCommission: percentSchema,
    kocAdsCommission: percentSchema,
    tapOrganicCommission: percentSchema,
    tapAdsCommission: percentSchema,
    targetKocCount: z.number().int().min(0).optional(),
    kocTier: z.string(),
    castType: z.enum(['PAID', 'FREE']),
    castFeePerKoc: z.number().min(0).optional(),
    videosPerKoc: z.number().int().min(0).optional(),
    contentDeadline: dateSchema.nullable().optional(),
    requireContentApproval: z.boolean(),
    guidelineFiles: z.array(z.custom<UploadFile>()),
    pmId: z.string().optional(),
    accountId: z.string().optional(),
    operatorIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate.isBefore(data.startDate, 'day')) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Ngày kết thúc phải sau ngày bắt đầu' })
    }
    if (data.castType === 'PAID' && data.castFeePerKoc === undefined) {
      ctx.addIssue({ code: 'custom', path: ['castFeePerKoc'], message: 'Nhập phí Cast' })
    }
  })

type CampaignFormInput = z.input<typeof campaignSchema>
export type CampaignFormValues = z.output<typeof campaignSchema>

/** Form -> body `POST /api/campaigns` (file brief chưa có API upload nên chưa gửi). */
export const toCampaignRequest = (v: CampaignFormValues): CampaignRequest => ({
  name: v.name.trim(),
  type: v.type,
  status: v.status,
  description: v.description || undefined,
  productCategoryId: v.productCategoryId,
  brandId: v.brandId,
  startTime: v.startDate?.startOf('day').toISOString(),
  endTime: v.endDate?.endOf('day').toISOString(),
  targetTotalKoc: v.targetKocCount,
  tierKocRequire: v.kocTier && v.kocTier !== 'any' ? v.kocTier : undefined,
  pmId: v.pmId,
  acId: v.accountId,
  commission: [
    { typeCommission: 'KOC' as const, fromNormal: v.kocOrganicCommission, fromAdv: v.kocAdsCommission },
    { typeCommission: 'TAP' as const, fromNormal: v.tapOrganicCommission, fromAdv: v.tapAdsCommission },
  ].filter((c) => c.fromNormal !== undefined || c.fromAdv !== undefined),
  castMemberRequest: {
    typeCast: v.castType === 'PAID' ? 'CAST' : 'NONE',
    totalCast: v.castType === 'PAID' ? v.castFeePerKoc : undefined,
    totalVideo: v.videosPerKoc,
    deadlineTime: v.contentDeadline?.endOf('day').toISOString(),
  },
  requireContentApproval: v.requireContentApproval,
  operatorIds: v.operatorIds,
})

type Props = {
  open: boolean
  onClose: () => void
  /** Trả Promise: modal chỉ đóng khi tạo thành công. */
  onSubmit?: (values: CampaignFormValues) => Promise<unknown> | void
  submitting?: boolean
}

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'OPTIMIZE', label: 'Tối ưu TAP' },
  { value: 'BOOKING', label: 'Booking KOC' },
  { value: 'OPERATION', label: 'Vận hành cho nhãn hàng'}
]
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING', label: 'Sắp diễn ra' },
  { value: 'ACTIVATE', label: 'Đang chạy' },
  { value: 'WARNING', label: 'Tạm dừng' },
  { value: 'DONE', label: 'Đã kết thúc' },
]

const KOC_TIER_OPTIONS = [
  { value: 'any', label: 'Không giới hạn' },
  { value: 'NANO', label: 'Nano' },
  { value: 'MICRO', label: 'Micro' },
  { value: 'MACRO', label: 'Macro' },
  { value: 'MEGA', label: 'Mega' },
]

const CAST_OPTIONS = [
  { value: 'PAID', label: 'Trả phí Cast' },
  { value: 'FREE', label: 'Không trả phí Cast' },
]

const DEFAULT_VALUES: DefaultValues<CampaignFormInput> = {
  name: '',
  type: 'OPTIMIZE',
  status: 'DRAFT',
  description: '',
  startDate: null,
  endDate: null,
  kocTier: 'any',
  castType: 'PAID',
  contentDeadline: null,
  requireContentApproval: false,
  guidelineFiles: [],
  operatorIds: [],
}

const DATE_FORMAT = 'DD/MM/YYYY'
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
const fullWidth = { width: '100%' }

const moneyFormatter = (v: number | string | undefined) =>
  `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const moneyParser = (v: string | undefined) => Number((v ?? '').replace(/,/g, ''))
const toOptionalNumber = (v: number | string | null) => (v === null || v === '' ? undefined : Number(v))

type FieldProps = {
  label: string
  required?: boolean
  tooltip?: string
  error?: string
  children: ReactNode
}

const Field = ({ label, required, tooltip, error, children }: FieldProps) => (
  <div className="mb-4 flex flex-col gap-1">
    <label className="flex items-center gap-1 text-sm text-gray-700">
      {required && <span className="text-red-500">*</span>}
      {label}
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined className="text-gray-400" />
        </Tooltip>
      )}
    </label>
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
)

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-4">
    <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold uppercase text-gray-600">
      {title}
    </h3>
    {children}
  </div>
)

export const AddCampaignModal = ({ open, onClose, onSubmit, submitting }: Props) => {
  const brandsQ = useBrandsQuery({ size: 200 })
  const categoriesQ = useProductCategoriesQuery()
  // Nhân sự thật theo role (GET /api/users)
  const pmStaff = useStaffOptions('PM')
  const accountStaff = useStaffOptions('SA')
  const opsStaff = useStaffOptions('OP')
  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<CampaignFormInput, unknown, CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: DEFAULT_VALUES,
  })
  const castType = watch('castType')

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    onClose()
  }

  const onSubmitForm = async (data: CampaignFormValues) => {
    try {
      await onSubmit?.(data)
      handleClose()
    } catch {
      // lỗi đã được báo ở nơi gọi — giữ modal mở để sửa
    }
  }

  return (
    <Modal
      title="Tạo chiến dịch mới"
      open={open}
      onOk={handleSubmit(onSubmitForm)}
      onCancel={handleClose}
      okText="Tạo chiến dịch"
      confirmLoading={submitting}
      cancelText="Hủy"
      width={760}
    >
      <form className="mt-4" onSubmit={handleSubmit(onSubmitForm)}>
        <Section title="Thông tin cơ bản">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field label="Tên chiến dịch" required error={fieldState.error?.message}>
                <Input {...field} status={fieldState.error && 'error'} placeholder="VD: Comfort - Mùa hè 2026" />
              </Field>
            )}
          />

          <div style={grid2}>
            <Controller
              name="type"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  error={fieldState.error?.message}
                  label="Loại chiến dịch"
                  tooltip="Hình thức triển khai chính của chiến dịch"
                  required
                >
                  <Select {...field} status={fieldState.error && 'error'} options={CAMPAIGN_TYPE_OPTIONS} />
                </Field>
              )}
            />
            <Controller
              name="brandId"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Nhãn hàng" required error={fieldState.error?.message}>
                  <Select
                    {...field} status={fieldState.error && 'error'}
                    showSearch={{ optionFilterProp: 'label' }}
                    placeholder="Chọn nhãn hàng…"
                    loading={brandsQ.isLoading}
                    options={(brandsQ.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))}
                  />
                </Field>
              )}
            />
          </div>

          <div style={grid2}>
            <Controller
              name="productCategoryId"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Chủ đề / Ngành hàng" required error={fieldState.error?.message}>
                  <Select
                    {...field} status={fieldState.error && 'error'}
                    placeholder="Chọn ngành hàng…"
                    showSearch={{ optionFilterProp: 'label' }}
                    loading={categoriesQ.isLoading}
                    options={(categoriesQ.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
                  />
                </Field>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Trạng thái" error={fieldState.error?.message}>
                  <Select {...field} status={fieldState.error && 'error'} options={STATUS_OPTIONS} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field label="Mô tả chiến dịch" error={fieldState.error?.message}>
                <TextArea {...field} status={fieldState.error && 'error'} rows={3} placeholder="VD: Tăng nhận diện dòng sản phẩm mới, mục tiêu GMV 4.5B₫" />
              </Field>
            )}
          />
        </Section>

        <Section title="Thời gian">
          <div style={grid2}>
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Ngày bắt đầu" required error={fieldState.error?.message}>
                  <DatePicker {...field} status={fieldState.error && 'error'} format={DATE_FORMAT} placeholder="dd/mm/yyyy" style={fullWidth} />
                </Field>
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Ngày kết thúc" required error={fieldState.error?.message}>
                  <DatePicker {...field} status={fieldState.error && 'error'} format={DATE_FORMAT} placeholder="dd/mm/yyyy" style={fullWidth} />
                </Field>
              )}
            />
          </div>
        </Section>

        <Section title="Hoa hồng Affiliate">
          <p className="mb-2 text-sm font-medium text-gray-700">Hoa hồng KOC</p>
          <div style={grid2}>
            <Controller
              name="kocOrganicCommission"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Tự nhiên (%)" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    placeholder="VD: 10"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
            <Controller
              name="kocAdsCommission"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Quảng cáo (%)" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    placeholder="VD: 5"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700">Hoa hồng TAP</p>
          <div style={grid2}>
            <Controller
              name="tapOrganicCommission"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Tự nhiên (%)" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    placeholder="VD: 0"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
            <Controller
              name="tapAdsCommission"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Quảng cáo (%)" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    placeholder="VD: 0"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
          </div>
        </Section>

        <Section title="Mục tiêu KPI">
          <div style={grid2}>
            <Controller
              name="targetKocCount"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Số KOC mục tiêu" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    min={0}
                    precision={0}
                    placeholder="VD: 6"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
            <Controller
              name="kocTier"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Tier KOC yêu cầu" error={fieldState.error?.message}>
                  <Select {...field} status={fieldState.error && 'error'} options={KOC_TIER_OPTIONS} />
                </Field>
              )}
            />
          </div>
        </Section>

        <Section title="Cast & nội dung">
          <div style={grid2}>
            <Controller
              name="castType"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  error={fieldState.error?.message}
                  label="Cast"
                  tooltip="Chiến dịch có trả phí cố định cho KOC hay không"
                >
                  <Select {...field} status={fieldState.error && 'error'} options={CAST_OPTIONS} />
                </Field>
              )}
            />
            <Controller
              name="castFeePerKoc"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  error={fieldState.error?.message}
                  label="Phí Cast / KOC (₫)"
                  required={castType === 'PAID'}
                >
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    min={0}
                    disabled={castType !== 'PAID'}
                    placeholder="VD: 3,000,000"
                    formatter={moneyFormatter}
                    parser={moneyParser}
                    style={fullWidth}
                  />
                </Field>
              )}
            />
          </div>

          <div style={grid2}>
            <Controller
              name="videosPerKoc"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Số video / KOC" error={fieldState.error?.message}>
                  <InputNumber
                    {...field} status={fieldState.error && 'error'}
                    onChange={(v) => field.onChange(toOptionalNumber(v))}
                    min={0}
                    precision={0}
                    placeholder="VD: 2"
                    style={fullWidth}
                  />
                </Field>
              )}
            />
            <Controller
              name="contentDeadline"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Deadline nộp nội dung" error={fieldState.error?.message}>
                  <DatePicker {...field} status={fieldState.error && 'error'} format={DATE_FORMAT} placeholder="dd/mm/yyyy" style={fullWidth} />
                </Field>
              )}
            />
          </div>

          {/* <Controller
            name="requireContentApproval"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Field label="Yêu cầu duyệt nội dung">
                <Switch {...rest} checked={value} onChange={onChange} />
              </Field>
            )}
          /> */}

          {/* <Controller
            name="guidelineFiles"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Field label="Guideline / brief đính kèm cho KOC">
                <Upload
                  multiple
                  fileList={value}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => onChange(fileList)}
                >
                  <Button icon={<UploadOutlined />}>Tải file lên</Button>
                </Upload>
              </Field>
            )}
          /> */}
        </Section>

        <Section title="Phụ trách chiến dịch">
          <div style={grid2}>
            <Controller
              name="pmId"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="PM" tooltip="Project Manager chịu trách nhiệm chính" error={fieldState.error?.message}>
                  <Select {...field} status={fieldState.error && 'error'} placeholder="Chọn PM…" loading={pmStaff.isLoading} options={pmStaff.options} notFoundContent="Chưa có tài khoản role PM" />
                </Field>
              )}
            />
            <Controller
              name="accountId"
              control={control}
              render={({ field, fieldState }) => (
                <Field label="Account" tooltip="Người làm việc trực tiếp với nhãn hàng" error={fieldState.error?.message}>
                  <Select {...field} status={fieldState.error && 'error'} placeholder="Chọn Account…" loading={accountStaff.isLoading} options={accountStaff.options} notFoundContent="Chưa có tài khoản role SaleAccount" />
                </Field>
              )}
            />
          </div>
          <Controller
            name="operatorIds"
            control={control}
            render={({ field, fieldState }) => (
              <Field label="Nhân viên Vận hành" tooltip="Nhân sự vận hành, có thể chọn nhiều" error={fieldState.error?.message}>
                <Select
                  {...field}
                  status={fieldState.error && 'error'}
                  mode="multiple"
                  placeholder="Chọn nhân viên vận hành…"
                  loading={opsStaff.isLoading}
                  options={opsStaff.options}
                  notFoundContent="Chưa có tài khoản role Operation"
                  menuItemSelectedIcon={null}
                  optionRender={(option) => (
                    <Checkbox className="pointer-events-none" checked={field.value?.includes(option.value as string)}>{option.label}</Checkbox>
                  )}
                />
              </Field>
            )}
          />
        </Section>
      </form>
    </Modal>
  )
}
