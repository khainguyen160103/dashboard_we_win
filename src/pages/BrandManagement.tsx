import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

import { BrandFormModal } from "../components/brand/BrandFormModal";
import { BrandDetailDrawer } from "../components/brand/BrandDetailDrawer";
import {
  formatVndD,
  TIER_COLORS,
  INDUSTRY_VN_COLORS,
} from "../components/brand/brand.data";
import type { Brand, BrandFormValues } from "../components/brand/types";
import { mapBrandToRequest } from "../model/Brand";
import {
  useBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "../hooks/query/useBrandQuery";

/* ── building blocks ─────────────────────────────────────────────────────── */

function StatCard({
  title,
  value,
  description,
  valueClassName = "text-gray-900",
}: {
  title: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card
      size="small"
      className="min-w-[200px] flex-1 rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-5"
    >
      <div className="text-[13px] font-semibold text-gray-500">{title}</div>
      <div className={`mt-1.5 text-[28px] font-bold leading-tight ${valueClassName}`}>
        {value}
      </div>
      {description && (
        <div className="mt-2 text-xs leading-relaxed text-gray-400">{description}</div>
      )}
    </Card>
  );
}

function DonutCard({
  title,
  subtitle,
  labels,
  series,
  colors,
  centerLabel,
}: {
  title: string;
  subtitle: string;
  labels: string[];
  series: number[];
  colors: string[];
  centerLabel: string;
}) {
  const total = series.reduce((s, n) => s + n, 0);
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels,
    colors,
    stroke: { width: 2 },
    legend: {
      position: "right",
      fontSize: "13px",
      markers: { size: 6 },
      itemMargin: { vertical: 4 },
      formatter: (name, opts) => {
        const v = opts.w.globals.series[opts.seriesIndex] as number;
        const pct = total ? Math.round((v / total) * 100) : 0;
        return `${name}   ${v} · ${pct}%`;
      },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: centerLabel,
              fontSize: "12px",
              color: "#9ca3af",
              formatter: () => String(total),
            },
            value: { fontSize: "22px", fontWeight: 700, color: "#111827" },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `${v} brand` } },
    responsive: [
      { breakpoint: 640, options: { legend: { position: "bottom" } } },
    ],
  };

  return (
    <Card
      size="small"
      className="flex-1 rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-5"
    >
      <div className="text-base font-semibold text-gray-800">{title}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
      <div className="mt-2">
        <Chart options={options} series={series} type="donut" height={260} />
      </div>
    </Card>
  );
}

interface AlertPanelProps {
  tone: "danger" | "info";
  icon: React.ReactNode;
  title: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}

function AlertPanel({ tone, icon, title, hint, count, children }: AlertPanelProps) {
  const toneCls =
    tone === "danger"
      ? "border-red-200 bg-red-50/60"
      : "border-cyan-200 bg-cyan-50/60";
  const titleCls = tone === "danger" ? "text-red-600" : "text-cyan-700";
  return (
    <Card
      size="small"
      className={`min-w-[340px] flex-1 rounded-2xl border ${toneCls} [&_.ant-card-body]:p-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-2 font-semibold ${titleCls}`}>
          {icon}
          <span>{title}</span>
          <Tooltip title={hint}>
            <QuestionCircleOutlined className="text-xs text-gray-400" />
          </Tooltip>
        </div>
        <span className="text-sm font-bold text-gray-500">{count}</span>
      </div>
      <div className="mt-3 divide-y divide-black/5">{children}</div>
    </Card>
  );
}

function TierTag({ tier }: { tier: Brand["tier"] }) {
  return (
    <Tag
      style={{
        color: "#fff",
        backgroundColor: TIER_COLORS[tier],
        borderColor: TIER_COLORS[tier],
        fontWeight: 600,
      }}
    >
      {tier}
    </Tag>
  );
}

const daysUntil = (iso?: string): number | null => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
};

const fmtDateVN = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

/* ── page ────────────────────────────────────────────────────────────────── */

export default function BrandManagement() {
  const [searchText, setSearchText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // ── Data từ REST API (GET /brands) ─────────────────────────────────────
  const { data: brands = [], isLoading, isFetching, isError, error, refetch } =
    useBrandsQuery();
  const createMut = useCreateBrandMutation();
  const updateMut = useUpdateBrandMutation();
  const deleteMut = useDeleteBrandMutation();
  const mutating = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  // KPIs
  const kpis = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.status === "Active").length;
    const gmv = brands.reduce((s, b) => s + (b.gmv ?? 0), 0);
    const agency = brands.reduce((s, b) => s + b.totalSpent, 0);
    const roiValues = brands.map((b) => b.roi ?? 0).filter((r) => r > 0);
    const roi = roiValues.length
      ? roiValues.reduce((s, r) => s + r, 0) / roiValues.length
      : 0;
    return { total, active, gmv, agency, roi };
  }, [brands]);

  const tierDist = useMemo(() => {
    const order: Brand["tier"][] = ["Gold", "Silver", "Bronze", "New"];
    return order
      .map((t) => ({ label: t, value: brands.filter((b) => b.tier === t).length }))
      .filter((x) => x.value > 0);
  }, [brands]);

  const industryDist = useMemo(() => {
    const map = new Map<string, number>();
    brands.forEach((b) => {
      const key = b.industryVN || b.industry;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [brands]);

  // Cảnh báo & cơ hội
  const churnRisk = useMemo(() => brands.filter((b) => b.churnRisk), [brands]);
  const expiringSoon = useMemo(
    () =>
      brands
        .map((b) => ({ b, days: daysUntil(b.contractEndDate) }))
        .filter((x): x is { b: Brand; days: number } => x.days != null && x.days > 0 && x.days <= 60)
        .sort((a, b) => a.days - b.days),
    [brands],
  );

  // Danh sách brand
  const filtered = useMemo(() => {
    if (!searchText.trim()) return brands;
    const q = searchText.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.industryVN || b.industry).toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q),
    );
  }, [brands, searchText]);

  const VISIBLE = 10;
  const tableData = searchText.trim() || showAll ? filtered : filtered.slice(0, VISIBLE);

  const columns: TableColumnsType<Brand> = [
    {
      title: "Nhãn hàng",
      key: "name",
      fixed: "left",
      width: 200,
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer text-left font-semibold text-gray-900 hover:text-[#1890ff]"
            onClick={() => {
              setSelectedBrand(r);
              setDetailDrawerOpen(true);
            }}
          >
            {r.name}
          </button>
          {r.churnRisk && (
            <Tag color="error" style={{ margin: 0, fontSize: 11 }}>
              🚩 Cần chú ý
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Ngành hàng",
      key: "industry",
      width: 220,
      render: (_, r) => r.industryVN || r.industry,
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      width: 90,
      render: (t: Brand["tier"]) => <TierTag tier={t} />,
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 240,
      render: (_, r) => (
        <div>
          <div className="text-sm text-gray-800">{r.contactName}</div>
          {r.contactRole && (
            <div className="text-xs text-gray-400">{r.contactRole}</div>
          )}
        </div>
      ),
    },
    {
      title: "Chiến dịch",
      dataIndex: "activeCampaigns",
      key: "campaigns",
      width: 110,
      align: "center",
      sorter: (a, b) => a.activeCampaigns - b.activeCampaigns,
    },
    {
      title: "Doanh thu agency",
      dataIndex: "totalSpent",
      key: "agency",
      width: 150,
      align: "right",
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (v: number) => formatVndD(v),
    },
    {
      title: "GMV brand",
      dataIndex: "gmv",
      key: "gmv",
      width: 130,
      align: "right",
      sorter: (a, b) => (a.gmv ?? 0) - (b.gmv ?? 0),
      render: (v?: number) => (v ? <strong className="text-emerald-600">{formatVndD(v)}</strong> : "—"),
    },
    {
      title: "",
      key: "action",
      width: 90,
      fixed: "right",
      render: (_, r) => (
        <div className="flex gap-1">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingBrand(r);
              setFormModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa nhãn hàng?"
            description={`Xóa "${r.name}" khỏi hệ thống?`}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            onConfirm={() => handleDelete(r)}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} loading={deleteMut.isPending} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ── CRUD handlers (REST API) ───────────────────────────────────────────
  const handleSubmitForm = async (values: BrandFormValues) => {
    const payload = mapBrandToRequest(values);
    try {
      if (editingBrand) {
        await updateMut.mutateAsync({ id: editingBrand.id, payload });
        message.success(`Đã cập nhật nhãn hàng "${values.name}"!`);
      } else {
        await createMut.mutateAsync(payload);
        message.success(`Đã thêm nhãn hàng "${values.name}"!`);
      }
      setFormModalOpen(false);
      setEditingBrand(null);
    } catch {
      message.error("Có lỗi khi lưu nhãn hàng. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (brand: Brand) => {
    try {
      await deleteMut.mutateAsync(brand.id);
      message.success(`Đã xóa nhãn hàng "${brand.name}"!`);
    } catch {
      message.error("Có lỗi khi xóa nhãn hàng.");
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý Brand — Sức khỏe & hiệu quả nhãn hàng"
        description="Dashboard sức khỏe và hiệu quả từng nhãn hàng: KPI, phân bổ tier/ngành hàng, cảnh báo churn & hợp đồng."
      />
      <PageBreadcrumb pageTitle="Quản lý Brand" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý Brand</h1>
          <div className="mt-1 text-sm text-gray-400">
            Sức khỏe &amp; hiệu quả từng nhãn hàng
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500">
            <CalendarOutlined />
            01/08/2026 – 24/08/2026 · so với tháng 7
          </div>
        </div>
      </div>

      {isError && (
        <Alert
          className="mt-4"
          type="error"
          showIcon
          message="Không tải được danh sách brand từ máy chủ"
          description={String((error as Error)?.message ?? error ?? "")}
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Spin spinning={isLoading || mutating} tip="Đang tải dữ liệu brand...">

      <div className="flex flex-wrap gap-4">
        <StatCard title="Tổng Nhãn Hàng" value={kpis.total} />
        <StatCard
          title="Đang Hợp Tác"
          value={kpis.active}
          valueClassName="text-emerald-600"
          description="trạng thái Đang hoạt động"
        />
        <StatCard title="GMV tạo ra (tất cả brand)" value={formatVndD(kpis.gmv)} />
        <StatCard title="ROI trung bình" value={`${kpis.roi.toFixed(1)}x`} />
        <StatCard title="Tổng Doanh thu Agency" value={formatVndD(kpis.agency)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <DonutCard
          title="Phân bổ theo Tier"
          subtitle={`${brands.length} nhãn hàng`}
          labels={tierDist.map((x) => x.label)}
          series={tierDist.map((x) => x.value)}
          colors={tierDist.map((x) => TIER_COLORS[x.label])}
          centerLabel="brand"
        />
        <DonutCard
          title="Phân bổ theo Ngành hàng"
          subtitle="Theo số lượng brand"
          labels={industryDist.map((x) => x.label)}
          series={industryDist.map((x) => x.value)}
          colors={industryDist.map(
            (x, i) =>
              INDUSTRY_VN_COLORS[x.label] ??
              ["#3b82f6", "#f97316", "#22c55e", "#eab308", "#ec4899", "#14b8a6", "#8b5cf6"][i % 7],
          )}
          centerLabel="brand"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <AlertPanel
          tone="danger"
          icon={<WarningOutlined />}
          title="Brand cần chú ý (churn risk)"
          hint="Brand đang hợp tác nhưng không có chiến dịch chạy, hoặc ROI dưới ngưỡng kỳ vọng."
          count={churnRisk.length}
        >
          {churnRisk.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có brand rủi ro" className="!my-2" />
          )}
          {churnRisk.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBrand(b);
                setDetailDrawerOpen(true);
              }}
              className="flex w-full items-start justify-between gap-3 py-2 text-left hover:bg-black/[0.03]"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-800">{b.name}</div>
                <div className="mt-0.5">
                  <TierTag tier={b.tier} />
                </div>
              </div>
              <div className="max-w-[55%] whitespace-normal text-right text-xs font-medium text-red-500">
                {b.churnReason}
              </div>
            </button>
          ))}
        </AlertPanel>

        <AlertPanel
          tone="info"
          icon={<ClockCircleOutlined />}
          title="Hợp đồng sắp hết hạn (30–60 ngày)"
          hint="Brand có ngày hết hạn hợp đồng trong vòng 60 ngày tới."
          count={expiringSoon.length}
        >
          {expiringSoon.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có hợp đồng sắp hết hạn" className="!my-2" />
          )}
          {expiringSoon.map(({ b, days }) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBrand(b);
                setDetailDrawerOpen(true);
              }}
              className="flex w-full items-start justify-between gap-3 py-2 text-left hover:bg-black/[0.03]"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-800">{b.name}</div>
                <div className="mt-0.5">
                  <TierTag tier={b.tier} />
                </div>
              </div>
              <div className="whitespace-nowrap text-right text-xs">
                <div className="font-semibold text-cyan-700">còn {days} ngày</div>
                <div className="text-gray-400">{fmtDateVN(b.contractEndDate!)}</div>
              </div>
            </button>
          ))}
        </AlertPanel>
      </div>

      <Card
        size="small"
        className="rounded-2xl border border-gray-100 shadow-sm [&_.ant-card-body]:p-5"
      >
        <div className="mb-1 text-base font-semibold text-gray-800">Danh sách Brand</div>
        <div className="mb-4 text-xs text-gray-400">
          Ngành hàng, đầu mối liên hệ và số chiến dịch đang chạy
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Tìm theo tên, ngành hàng, người liên hệ..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            style={{ width: 340 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBrand(null);
              setFormModalOpen(true);
            }}
          >
            Thêm Nhãn Hàng
          </Button>
        </div>

        <Table<Brand>
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: isError
              ? "Lỗi tải dữ liệu — nhấn Làm mới để thử lại"
              : "Chưa có nhãn hàng nào",
          }}
        />

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Hiển thị {tableData.length}/{brands.length} Brand — tổng hệ thống {brands.length} Brand
          </span>
          {!searchText.trim() && brands.length > VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="cursor-pointer font-medium text-[#1890ff] hover:underline"
            >
              {showAll ? "Thu gọn" : "Xem thêm — toàn bộ hệ thống"} ›
            </button>
          )}
        </div>
      </Card>
      </Spin>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <BrandFormModal
        open={formModalOpen}
        editingBrand={editingBrand}
        onClose={() => {
          setFormModalOpen(false);
          setEditingBrand(null);
        }}
        onSubmit={handleSubmitForm}
      />
      <BrandDetailDrawer
        open={detailDrawerOpen}
        brand={selectedBrand}
        onClose={() => setDetailDrawerOpen(false)}
        onEdit={(brand) => {
          setDetailDrawerOpen(false);
          setEditingBrand(brand);
          setFormModalOpen(true);
        }}
      />
    </>
  );
}
