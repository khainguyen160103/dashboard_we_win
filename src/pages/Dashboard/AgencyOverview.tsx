import { useMemo } from "react";
import { Empty, Spin, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { useCampaignOverview } from "../../feature/campaign/hook/useCampaignQuery";
import { useVideosQuery } from "../../feature/campaign/hook/useVideoQuery";
import { useKocPageQuery } from "../../hooks/query/useKocQuery";
import { useBrandsQuery } from "../../hooks/query/useBrandQuery";
import { BarList, fmtNum, fmtVnd, PanelCard, StatTile } from "./_shared";

const { Title, Text } = Typography;

const isActive = (s?: string) => ["ACTIVE", "ACTIVATE"].includes(String(s ?? "").toUpperCase());

type CampaignRow = {
  id: string;
  name: string;
  brandName?: string | null;
  status?: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  targetTotalKoc?: number | null;
};

const progressOf = (c: CampaignRow) => {
  const a = c.startTime ? new Date(c.startTime).getTime() : NaN;
  const b = c.endTime ? new Date(c.endTime).getTime() : NaN;
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - a) / (b - a)) * 100)));
};

export default function AgencyOverview() {
  const campaignsQ = useCampaignOverview();
  const brandsQ = useBrandsQuery({ size: 200 });
  const kocCountQ = useKocPageQuery({ page: 0, size: 1 });
  const topKocQ = useKocPageQuery({ page: 0, size: 5, sortBy: "gmvByProduct", sortDir: "desc" });
  const videosQ = useVideosQuery();

  const campaigns = (campaignsQ.data ?? []) as CampaignRow[];
  const brands = brandsQ.data ?? [];
  const videos = videosQ.data ?? [];
  const kocTotal = kocCountQ.data?.totalElements ?? 0;

  const loading = campaignsQ.isLoading || brandsQ.isLoading || kocCountQ.isLoading;

  const totalGmv = brands.reduce((s, b) => s + (Number(b.gmv) || 0), 0);
  const roiList = brands.map((b) => Number(b.roi) || 0).filter((x) => x > 0);
  const avgRoi = roiList.length ? roiList.reduce((s, x) => s + x, 0) / roiList.length : null;
  const activeCampaigns = campaigns.filter((c) => isActive(c.status)).length;
  const videoPending = videos.filter((v) => v.status === "WEWIN_REVIEW" || v.status === "BRAND_REVIEW").length;
  const videoDone = videos.filter((v) => v.status === "APPROVED").length;

  const brandBars = useMemo(
    () =>
      [...brands]
        .filter((b) => Number(b.gmv) > 0)
        .sort((a, b) => (Number(b.gmv) || 0) - (Number(a.gmv) || 0))
        .slice(0, 5)
        .map((b) => ({ label: b.name, value: Number(b.gmv), display: fmtVnd(Number(b.gmv)) })),
    [brands],
  );

  const kocBars = useMemo(
    () =>
      (topKocQ.data?.content ?? [])
        .filter((k) => k.gmv > 0)
        .map((k) => ({ label: k.name, value: k.gmv, display: fmtVnd(k.gmv) })),
    [topKocQ.data],
  );

  const campaignColumns: TableColumnsType<CampaignRow> = [
    {
      title: "Chiến dịch",
      key: "name",
      render: (_, r) => (
        <div>
          <div className="font-medium text-gray-900">{r.name}</div>
          <div className="text-xs text-gray-400">{r.brandName || "—"}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: string) => <Tag color={isActive(s) ? "green" : "default"}>{s || "—"}</Tag>,
    },
    {
      title: "Tiến độ thời gian",
      key: "progress",
      width: 180,
      render: (_, r) => {
        const p = progressOf(r);
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${p}%` }} />
            </div>
            <span className="w-9 text-right font-mono text-xs text-gray-500">{p}%</span>
          </div>
        );
      },
    },
    {
      title: "KPI KOC",
      dataIndex: "targetTotalKoc",
      key: "kpi",
      width: 110,
      align: "center",
      render: (v: number) => (v ? `mục tiêu ${v}` : "—"),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="flex flex-col gap-6">
        <div>
          <Title level={3} className="!mb-0">
            Tổng quan
          </Title>
          <Text type="secondary">Kết quả kinh doanh &amp; vận hành toàn hệ thống</Text>
        </div>

        {/* Kết quả kinh doanh */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Tổng GMV nhãn hàng" value={fmtVnd(totalGmv)} />
          <StatTile label="ROI trung bình" value={avgRoi == null ? "—" : `${avgRoi.toFixed(1)}x`} />
          <StatTile label="Nhãn hàng" value={fmtNum(brands.length)} />
          <StatTile label="KOC đang quản lý" value={fmtNum(kocTotal)} />
        </div>

        {/* Vận hành */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Chiến dịch đang chạy" value={activeCampaigns} sub={`/${campaigns.length} chiến dịch`} />
          <StatTile label="Video chờ duyệt" value={videoPending} tone="text-amber-500" />
          <StatTile label="Video đã duyệt" value={fmtNum(videoDone)} tone="text-green-600" />
          <StatTile label="Tổng video đã nộp" value={fmtNum(videos.length)} />
        </div>

        <PanelCard title="Chiến dịch" subtitle="Tiến độ thời gian & KPI theo chiến dịch">
          <Table<CampaignRow>
            columns={campaignColumns}
            dataSource={campaigns}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có chiến dịch" }}
          />
        </PanelCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PanelCard title="Top Brand theo GMV" subtitle="Top 5 nhãn hàng">
            {brandBars.length ? <BarList rows={brandBars} /> : <Empty description="Chưa có dữ liệu GMV nhãn hàng" />}
          </PanelCard>
          <PanelCard title="Top KOC theo GMV" subtitle="Top 5 nhà sáng tạo">
            {kocBars.length ? <BarList rows={kocBars} /> : <Empty description="Chưa có dữ liệu GMV KOC" />}
          </PanelCard>
        </div>
      </div>
    </Spin>
  );
}
