import { useMemo } from "react";
import { Empty, Spin, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { authStore } from "../../store/authStore";
import { useCampaigns } from "../../feature/campaign/hook/useCampaignQuery";
import { useVideosQuery } from "../../feature/campaign/hook/useVideoQuery";
import type { Campaign } from "../../feature/campaign/model/Campaign";
import { PanelCard, StatTile } from "./_shared";
import { CampaignVideoPanel } from "../../feature/campaign/component/CampaignExtraPanels";

const { Title, Text } = Typography;

const isDone = (s?: string) => ["DONE", "COMPLETED", "FINISHED"].includes(String(s ?? "").toUpperCase());
const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString("vi-VN") : "—");

export default function KocPortalDashboard() {
  const user = authStore((s) => s.user);
  const campaignsQ = useCampaigns({ size: 200, mine: true });
  const videosQ = useVideosQuery({ kocUserId: user?.id }, { enabled: Boolean(user?.id) });

  const campaigns = campaignsQ.data?.content ?? [];
  const videos = videosQ.data ?? [];
  const activeCampaigns = campaigns.filter((c) => !isDone(c.status));
  const doneCampaigns = campaigns.filter((c) => isDone(c.status));

  const videoStats = useMemo(() => {
    const by = (s: string) => videos.filter((v) => v.status === s).length;
    return {
      approved: by("APPROVED"),
      revision: by("REVISION"),
      reviewing: by("WEWIN_REVIEW") + by("BRAND_REVIEW"),
    };
  }, [videos]);

  const videosOf = (campaignId: string) => videos.filter((v) => v.campaignId === campaignId);

  const columns: TableColumnsType<Campaign> = [
    { title: "Chiến dịch", dataIndex: "name", key: "name", render: (v) => <span className="font-medium">{v}</span> },
    { title: "Trạng thái", dataIndex: "status", key: "status", width: 130, render: (s: string) => <Tag>{s || "—"}</Tag> },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_, c) => `${fmtDate(c.startTime as string)} – ${fmtDate(c.endTime as string)}`,
    },
    {
      title: "Video",
      key: "video",
      width: 160,
      render: (_, c) => {
        const vs = videosOf(String(c.id));
        if (!vs.length) return "Chưa nộp video";
        return `${vs.filter((v) => v.status === "APPROVED").length}/${vs.length} đã duyệt`;
      },
    },
  ];

  return (
    <Spin spinning={campaignsQ.isLoading}>
      <div className="flex flex-col gap-6">
        <div>
          <Title level={3} className="!mb-0">
            Dashboard Cổng KOC
          </Title>
          <Text type="secondary">
            {user?.fullName ? `Xin chào ${user.fullName} · ` : ""}Theo dõi công việc của bạn
          </Text>
        </div>

        {campaignsQ.isError ? (
          <Empty description="Không tải được dữ liệu chiến dịch" className="py-10" />
        ) : campaigns.length === 0 && !campaignsQ.isLoading ? (
          <Empty description="Bạn chưa tham gia chiến dịch nào" className="py-10" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile label="Chiến dịch đang tham gia" value={activeCampaigns.length} />
              <StatTile label="Chiến dịch đã hoàn thành" value={doneCampaigns.length} />
              <StatTile label="Video đang chờ duyệt" value={videoStats.reviewing} tone="text-amber-500" />
              <StatTile
                label="Video cần sửa"
                value={videoStats.revision}
                tone="text-orange-500"
                sub={`${videoStats.approved} video đã được duyệt`}
              />
            </div>

            <PanelCard title="Chiến dịch của bạn" subtitle={`${campaigns.length} chiến dịch`}>
              <Table<Campaign>
                columns={columns}
                dataSource={campaigns}
                rowKey="id"
                size="middle"
                pagination={{ pageSize: 8 }}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "Chưa có chiến dịch" }}
              />
            </PanelCard>

            <CampaignVideoPanel
              mode="koc"
              kocUserId={user?.id}
              campaignOptions={activeCampaigns.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          </>
        )}
      </div>
    </Spin>
  );
}
