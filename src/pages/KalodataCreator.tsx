import { useState, useMemo } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Alert,
  Spin,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  TikTokOutlined,
  FireOutlined,
  StarOutlined,
  EyeOutlined,
  ShoppingOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useKalodataCreators } from "../hooks/useKalodata";
import type { KalodataCreator, KalodataRegion, KalodataDateRange } from "../services/kalodata.types";

const { Title, Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatVND(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B ₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₫`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ₫`;
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function formatNumber(value: string | number): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return "—";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString("vi-VN");
}

function getRankBadge(rank: number) {
  if (rank === 1) return { color: "#FFD700", label: "🥇", bg: "#fffbe6" };
  if (rank === 2) return { color: "#C0C0C0", label: "🥈", bg: "#f5f5f5" };
  if (rank === 3) return { color: "#CD7F32", label: "🥉", bg: "#fff7e6" };
  return { color: "#1890ff", label: `#${rank}`, bg: "transparent" };
}

const REGION_OPTIONS: { label: string; value: KalodataRegion; flag: string }[] = [
  { label: "Việt Nam", value: "VN", flag: "🇻🇳" },
  { label: "Hoa Kỳ", value: "US", flag: "🇺🇸" },
  { label: "Thái Lan", value: "TH", flag: "🇹🇭" },
  { label: "Indonesia", value: "ID", flag: "🇮🇩" },
  { label: "Malaysia", value: "MY", flag: "🇲🇾" },
  { label: "Philippines", value: "PH", flag: "🇵🇭" },
  { label: "Singapore", value: "SG", flag: "🇸🇬" },
  { label: "Anh", value: "GB", flag: "🇬🇧" },
];

const DATE_OPTIONS: { label: string; value: KalodataDateRange }[] = [
  { label: "7 ngày qua", value: "last7Day" },
  { label: "30 ngày qua", value: "last30Day" },
  { label: "90 ngày qua", value: "last90Day" },
  { label: "Tháng trước", value: "lastMonth" },
  { label: "3 tháng trước", value: "last3Month" },
];

const REGION_CURRENCY: Record<KalodataRegion, { currency: string; language: string }> = {
  VN: { currency: "VND", language: "vi-VN" },
  US: { currency: "USD", language: "en-US" },
  TH: { currency: "THB", language: "th-TH" },
  ID: { currency: "IDR", language: "id-ID" },
  MY: { currency: "MYR", language: "ms-MY" },
  PH: { currency: "PHP", language: "en-PH" },
  SG: { currency: "SGD", language: "en-SG" },
  GB: { currency: "GBP", language: "en-GB" },
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function KalodataCreator() {
  const [region, setRegion] = useState<KalodataRegion>("VN");
  const [dateRange, setDateRange] = useState<KalodataDateRange>("last7Day");

  const { currency, language } = REGION_CURRENCY[region];

  const { data, isLoading, isFetching, isError, error, refetch } = useKalodataCreators({
    region,
    language,
    currency,
    date_range: dateRange,
  });

  const creators = useMemo(() => data?.data ?? [], [data]);

  // ── Summary stats ──
  const totalRevenue = useMemo(
    () => creators.reduce((s, c) => s + c.revenue, 0),
    [creators]
  );
  const totalSales = useMemo(
    () => creators.reduce((s, c) => s + c.sales_volumn, 0),
    [creators]
  );
  const totalViews = useMemo(
    () => creators.reduce((s, c) => s + parseInt(c.content_views || "0", 10), 0),
    [creators]
  );
  const avgGrowth = useMemo(() => {
    if (!creators.length) return 0;
    return creators.reduce((s, c) => s + c.revenue_growth_rate, 0) / creators.length;
  }, [creators]);

  // ── Columns ──
  const columns: TableColumnsType<KalodataCreator> = [
    {
      title: "Hạng",
      key: "rank",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        const b = getRankBadge(index + 1);
        return (
          <div
            style={{
              background: b.bg,
              borderRadius: 8,
              padding: "4px 8px",
              fontWeight: 700,
              fontSize: 13,
              color: b.color,
            }}
          >
            {b.label}
          </div>
        );
      },
    },
    {
      title: "Creator",
      key: "creator",
      render: (_, record) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={42}
            style={{
              background: `hsl(${(parseInt(record.creator_id.slice(-3), 10) % 360)}, 65%, 55%)`,
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {record.creator_nickname?.charAt(0)?.toUpperCase() || "K"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {record.creator_nickname}
            </div>
            <a
              href={`https://www.tiktok.com/${record.creator_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#1890ff" }}
            >
              {record.creator_handle}
            </a>
          </div>
        </Flex>
      ),
    },
    {
      title: "Followers",
      dataIndex: "creator_followers",
      key: "creator_followers",
      align: "center",
      sorter: (a, b) =>
        parseInt(a.creator_followers, 10) - parseInt(b.creator_followers, 10),
      render: (v: string) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{formatNumber(v)}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            followers
          </Text>
        </div>
      ),
    },
    {
      title: "Tổng Doanh Số",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue: number) => (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: "#52c41a", fontSize: 13 }}>
            {formatVND(revenue)}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            doanh số
          </Text>
        </div>
      ),
    },
    {
      title: "Tăng Trưởng",
      dataIndex: "revenue_growth_rate",
      key: "revenue_growth_rate",
      align: "center",
      sorter: (a, b) => a.revenue_growth_rate - b.revenue_growth_rate,
      render: (rate: number) => {
        const isPositive = rate >= 0;
        return (
          <Tag
            icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            color={isPositive ? "success" : "error"}
            style={{ fontWeight: 600, fontSize: 12 }}
          >
            {Math.abs(rate).toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: "DS Livestream",
      dataIndex: "live_revenue",
      key: "live_revenue",
      align: "right",
      sorter: (a, b) => a.live_revenue - b.live_revenue,
      render: (v: number) => (
        <Tooltip title="Doanh số từ Livestream">
          <span style={{ color: "#fa541c", fontWeight: 600, fontSize: 12 }}>
            🔴 {formatVND(v)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "DS Video",
      dataIndex: "video_revenue",
      key: "video_revenue",
      align: "right",
      sorter: (a, b) => a.video_revenue - b.video_revenue,
      render: (v: number) => (
        <Tooltip title="Doanh số từ Video">
          <span style={{ color: "#1890ff", fontWeight: 600, fontSize: 12 }}>
            🎬 {formatVND(v)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Lượt Xem",
      dataIndex: "content_views",
      key: "content_views",
      align: "center",
      sorter: (a, b) =>
        parseInt(a.content_views, 10) - parseInt(b.content_views, 10),
      render: (v: string) => (
        <Tooltip title={parseInt(v, 10).toLocaleString("vi-VN") + " lượt xem"}>
          <span style={{ fontSize: 12 }}>
            👁 {formatNumber(v)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "sales_volumn",
      key: "sales_volumn",
      align: "center",
      sorter: (a, b) => a.sales_volumn - b.sales_volumn,
      render: (v: number) => (
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          🛒 {v.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Link",
      key: "link",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<TikTokOutlined />}
          href={`https://www.tiktok.com/${record.creator_handle}`}
          target="_blank"
        >
          TikTok
        </Button>
      ),
    },
  ];

  const selectedRegionInfo = REGION_OPTIONS.find((r) => r.value === region);
  const selectedDateInfo = DATE_OPTIONS.find((d) => d.value === dateRange);

  return (
    <>
      <PageMeta
        title="Kalodata Creator Ranking"
        description="Bảng xếp hạng KOC / Creator TikTok Shop theo doanh số từ Kalodata"
      />
      <PageBreadcrumb pageTitle="Kalodata Creator Ranking" />

      {/* ── Header Card ── */}
      <Card
        style={{ marginBottom: 20, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", border: "none" }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Flex align="center" gap={10}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20
              }}>
                📊
              </div>
              <div>
                <Title level={4} style={{ color: "#fff", margin: 0, fontSize: 18 }}>
                  Kalodata Creator Ranking
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {selectedRegionInfo?.flag} {selectedRegionInfo?.label} · {selectedDateInfo?.label} · Powered by Kalodata API
                </Text>
              </div>
            </Flex>
          </div>

          <Flex gap={10} wrap="wrap" align="center">
            <Select
              value={region}
              onChange={(v) => setRegion(v)}
              style={{ width: 150 }}
              options={REGION_OPTIONS.map((r) => ({
                label: `${r.flag} ${r.label}`,
                value: r.value,
              }))}
            />
            <Select
              value={dateRange}
              onChange={(v) => setDateRange(v)}
              style={{ width: 150 }}
              options={DATE_OPTIONS}
            />
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", background: "rgba(255,255,255,0.1)" }}
            >
              Làm mới
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* ── Error state ── */}
      {isError && (
        <Alert
          type="error"
          message="Không thể tải dữ liệu từ Kalodata"
          description={String(error)}
          showIcon
          style={{ marginBottom: 20 }}
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* ── Summary Stats ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "#f6ffed", borderLeft: "4px solid #52c41a" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#52c41a" }}><RiseOutlined /> Tổng Doanh Số (Top 10)</span>}
              value={totalRevenue}
              formatter={(v) => formatVND(Number(v))}
              valueStyle={{ color: "#52c41a", fontSize: 18, fontWeight: 700 }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "#fff7e6", borderLeft: "4px solid #fa8c16" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#fa8c16" }}><ShoppingOutlined /> Tổng Đơn Hàng</span>}
              value={totalSales}
              formatter={(v) => Number(v).toLocaleString("vi-VN")}
              valueStyle={{ color: "#fa8c16", fontSize: 18, fontWeight: 700 }}
              loading={isLoading}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: "#e6f7ff", borderLeft: "4px solid #1890ff" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#1890ff" }}><EyeOutlined /> Tổng Lượt Xem</span>}
              value={formatNumber(totalViews)}
              valueStyle={{ color: "#1890ff", fontSize: 18, fontWeight: 700 }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: avgGrowth >= 0 ? "#f6ffed" : "#fff2f0",
              borderLeft: `4px solid ${avgGrowth >= 0 ? "#52c41a" : "#ff4d4f"}`,
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: 12, color: avgGrowth >= 0 ? "#52c41a" : "#ff4d4f" }}>
                  <FireOutlined /> Tăng Trưởng TB
                </span>
              }
              value={Math.abs(avgGrowth).toFixed(1)}
              suffix="%"
              prefix={avgGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{
                color: avgGrowth >= 0 ? "#52c41a" : "#ff4d4f",
                fontSize: 18,
                fontWeight: 700,
              }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Table ── */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <StarOutlined style={{ color: "#fadb14" }} />
            <span>
              Top Creator{" "}
              {selectedRegionInfo?.flag} {selectedRegionInfo?.label}
            </span>
            <Badge
              count={creators.length}
              style={{ backgroundColor: "#1890ff" }}
            />
            {isFetching && !isLoading && (
              <Spin size="small" style={{ marginLeft: 8 }} />
            )}
          </Flex>
        }
        bordered={false}
        style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}
      >
        <Table<KalodataCreator>
          columns={columns}
          dataSource={creators}
          rowKey="creator_id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
            showTotal: (t) => `Tổng ${t} creator`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
          rowClassName={(_, index) =>
            index < 3 ? "kalodata-top-row" : ""
          }
          locale={{
            emptyText: isError
              ? "⚠️ Lỗi tải dữ liệu — nhấn Làm mới để thử lại"
              : "Không có dữ liệu",
          }}
        />
      </Card>

      {/* ── Custom row highlight ── */}
      <style>{`
        .kalodata-top-row td {
          background: linear-gradient(90deg, rgba(250, 219, 20, 0.04) 0%, transparent 100%) !important;
        }
      `}</style>
    </>
  );
}
