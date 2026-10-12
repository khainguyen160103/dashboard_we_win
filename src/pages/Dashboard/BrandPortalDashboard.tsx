import { useMemo, useState } from "react";
import { Button, Empty, Modal, Select, Spin, Table, Tag, Typography, message } from "antd";
import type { TableColumnsType } from "antd";
import { authStore } from "../../store/authStore";
import { useCampaigns } from "../../feature/campaign/hook/useCampaignQuery";
import {
  useCampaignKocsQuery,
  useUpdateCampaignKocMutation,
} from "../../feature/campaign/hook/useCampaignKocQuery";
import { useVideosQuery } from "../../feature/campaign/hook/useVideoQuery";
import {
  CAMPAIGN_KOC_STATUS_LABEL,
  CAMPAIGN_KOC_STATUS_COLOR,
  type CampaignKocDto,
} from "../../feature/campaign/model/CampaignKoc";
import { fmtNum, fmtVnd, PanelCard, StatTile } from "./_shared";
import { CampaignVideoPanel } from "../../feature/campaign/component/CampaignExtraPanels";

const { Title, Text } = Typography;

const isActive = (s?: string) => ["ACTIVE", "ACTIVATE"].includes(String(s ?? "").toUpperCase());
const isDone = (s?: string) => ["DONE", "COMPLETED"].includes(String(s ?? "").toUpperCase());

type CampaignRow = {
  id: string;
  name: string;
  brandName?: string | null;
  status?: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  targetTotalKoc?: number | null;
};

export default function BrandPortalDashboard() {
  const user = authStore((s) => s.user);
  // Chỉ các chiến dịch mà nhãn hàng (user đang đăng nhập) được gắn vào
  const campaignsQ = useCampaigns({ size: 200, mine: true });
  const campaigns: CampaignRow[] = campaignsQ.data?.content ?? [];

  const activeCampaigns = campaigns.filter((c) => isActive(c.status));
  const doneCampaigns = campaigns.filter((c) => isDone(c.status));

  const [campaignId, setCampaignId] = useState<string>();
  const selectedId = campaignId ?? (activeCampaigns[0]?.id ?? campaigns[0]?.id);

  const kocsQ = useCampaignKocsQuery(selectedId, { enabled: Boolean(selectedId) });
  const kocs = useMemo<CampaignKocDto[]>(() => kocsQ.data ?? [], [kocsQ.data]);
  const videosQ = useVideosQuery({ campaignId: selectedId }, { enabled: Boolean(selectedId) });
  const updateMut = useUpdateCampaignKocMutation(selectedId ?? "");

  const pendingReview = kocs.filter((k) => k.status === "BRAND_REVIEW");
  const videoPendingBrand = (videosQ.data ?? []).filter((v) => v.status === "BRAND_REVIEW").length;

  const decide = (r: CampaignKocDto, action: "approve" | "reject" | "hold") => {
    if (action === "reject") {
      let reason = "";
      Modal.confirm({
        title: `Loại ${r.kocName ?? "KOC"} khỏi casting?`,
        content: (
          <input
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="Lý do loại (bắt buộc)"
            onChange={(e) => (reason = e.target.value)}
          />
        ),
        okText: "Loại",
        okButtonProps: { danger: true },
        cancelText: "Huỷ",
        onOk: async () => {
          await updateMut.mutateAsync({
            kocUserId: r.kocUserId,
            payload: { status: "REJECTED", rejectReason: reason || "Không đạt yêu cầu casting" },
          });
          message.success("Đã loại KOC");
        },
      });
      return;
    }
    updateMut
      .mutateAsync({
        kocUserId: r.kocUserId,
        payload: { status: action === "approve" ? "APPROVED" : "BRAND_REVIEW" },
      })
      .then(() =>
        message.success(action === "approve" ? "Đã duyệt casting" : "Đã đánh dấu cân nhắc"),
      );
  };

  const campaignColumns: TableColumnsType<CampaignRow> = [
    { title: "Chiến dịch", dataIndex: "name", key: "name" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: string) => <Tag color={isActive(s) ? "green" : "default"}>{s || "—"}</Tag>,
    },
    {
      title: "KPI KOC",
      dataIndex: "targetTotalKoc",
      key: "kpi",
      width: 120,
      align: "center",
      render: (v: number) => (v ? `mục tiêu ${v}` : "—"),
    },
  ];

  const kocColumns: TableColumnsType<CampaignKocDto> = [
    { title: "KOC", key: "koc", render: (_, r) => r.kocName ?? r.kocUserId },
    { title: "Tier", key: "tier", width: 100, render: (_, r) => r.kocTier || "—" },
    {
      title: "Follower",
      key: "fl",
      width: 120,
      align: "right",
      render: (_, r) => fmtNum(r.kocFollowers ?? 0),
    },
    {
      title: "GMV",
      key: "gmv",
      width: 130,
      align: "right",
      render: (_, r) => fmtVnd(r.kocGmv ?? 0),
    },
    {
      title: "Trạng thái",
      key: "st",
      width: 160,
      render: (_, r) => (
        <Tag color={CAMPAIGN_KOC_STATUS_COLOR[r.status]}>{CAMPAIGN_KOC_STATUS_LABEL[r.status]}</Tag>
      ),
    },
  ];

  return (
    <Spin spinning={campaignsQ.isLoading}>
      <div className="flex flex-col gap-6">
        <div>
          <Title level={3} className="!mb-0">
            Dashboard Cổng Brand
          </Title>
          <Text type="secondary">
            {user?.fullName ? `Xin chào ${user.fullName} · ` : ""}Theo dõi chiến dịch &amp; duyệt KOC
          </Text>
        </div>


        {/* Tier 1 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Chiến dịch đang triển khai" value={activeCampaigns.length} tone="text-green-600" />
          <StatTile label="Chiến dịch đã hoàn thành" value={doneCampaigns.length} />
          <StatTile
            label="KOC chờ duyệt"
            value={pendingReview.length}
            tone="text-amber-500"
            sub="WeWin đã gửi lên, chờ Brand xác nhận"
          />
          <StatTile
            label="Video chờ Brand duyệt"
            value={videoPendingBrand}
            tone="text-amber-500"
            sub="Chiến dịch đang chọn · đã qua WeWin duyệt sơ bộ"
          />
        </div>

        {/* Tier 2 */}
        <PanelCard
          title="Danh sách KOC chờ duyệt"
          subtitle="KOC đã được WeWin sơ duyệt, đang chờ bạn xác nhận casting"
          extra={
            <Select
              style={{ minWidth: 260 }}
              placeholder="Chọn chiến dịch"
              value={selectedId}
              onChange={setCampaignId}
              showSearch
              optionFilterProp="label"
              options={campaigns.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          }
        >
          {!selectedId ? (
            <Empty description="Chọn một chiến dịch để xem" />
          ) : (
            <Spin spinning={kocsQ.isLoading}>
              <Table<CampaignKocDto>
                columns={kocColumns}
                dataSource={pendingReview}
                rowKey="id"
                size="middle"
                pagination={false}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Không có KOC nào đang chờ bạn duyệt" }}
              />
            </Spin>
          )}
        </PanelCard>

        {/* Tier 3 */}
        <PanelCard title="Chiến dịch đang triển khai" subtitle={`${activeCampaigns.length} chiến dịch`}>
          <Table<CampaignRow>
            columns={campaignColumns}
            dataSource={activeCampaigns}
            rowKey="id"
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Không có chiến dịch đang chạy" }}
          />
        </PanelCard>

        {/* Tier 4 · Xử lý chi tiết theo chiến dịch */}
        <PanelCard
          title="Xử lý chi tiết"
          subtitle="Duyệt casting, theo dõi hàng mẫu & duyệt video theo từng KOC"
        >
          {!selectedId ? (
            <Empty description="Chọn một chiến dịch" />
          ) : (
            <Spin spinning={kocsQ.isLoading}>
              <div className="flex flex-col gap-3">
                {kocs.length === 0 && <Empty description="Chưa có KOC trong chiến dịch" />}
                {kocs.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3.5"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{r.kocName ?? r.kocUserId}</div>
                      <div className="text-xs text-gray-400">
                        {[r.kocTier, r.kocFollowers ? `${fmtNum(r.kocFollowers)} follower` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={CAMPAIGN_KOC_STATUS_COLOR[r.status]}>
                        {CAMPAIGN_KOC_STATUS_LABEL[r.status]}
                      </Tag>
                      {r.status === "BRAND_REVIEW" && (
                        <>
                          <Button
                            size="small"
                            type="primary"
                            loading={updateMut.isPending}
                            onClick={() => decide(r, "approve")}
                          >
                            Duyệt casting
                          </Button>
                          <Button size="small" onClick={() => decide(r, "hold")}>
                            Cân nhắc
                          </Button>
                          <Button size="small" danger onClick={() => decide(r, "reject")}>
                            Loại
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Spin>
          )}
        </PanelCard>

        {/* Duyệt video KOC — cùng luồng hiển thị với "Job & Duyệt Video" ở Vận hành chiến dịch,
            giới hạn theo các chiến dịch nhãn hàng của bạn tham gia. */}
        <CampaignVideoPanel mode="brand" campaignId={selectedId} />

        {/* Tier 5 · Lịch sử */}
        <PanelCard title="Lịch sử chiến dịch đã triển khai" subtitle={`${doneCampaigns.length} chiến dịch`}>
          <Table<CampaignRow>
            columns={campaignColumns}
            dataSource={doneCampaigns}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 8 }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có chiến dịch hoàn thành" }}
          />
        </PanelCard>
      </div>
    </Spin>
  );
}
