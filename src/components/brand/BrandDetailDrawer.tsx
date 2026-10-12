import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Row,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  EditOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RocketOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import type { Brand } from "./types";
import { useCampaigns } from "../../feature/campaign/hook/useCampaignQuery";
import { INDUSTRY_COLORS, TIER_COLORS, STATUS_COLORS, STATUS_LABELS, formatVND } from "./brand.data";

interface BrandDetailDrawerProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
  onEdit: (brand: Brand) => void;
}

const { Text, Paragraph } = Typography;

export function BrandDetailDrawer({ open, brand, onClose, onEdit }: BrandDetailDrawerProps) {
  // Chiến dịch mà brand được gắn vào (user_campaign.user_id = brand_id)
  const historyQ = useCampaigns(
    { memberUserId: brand ? String(brand.id) : undefined, size: 50 },
    { enabled: open && Boolean(brand) },
  );
  if (!brand) return null;

  const campaignHistory = historyQ.data?.content ?? [];
  const statusColorMap: Record<string, string> = {
    ACTIVATE: "blue",
    ACTIVE: "blue",
    DONE: "green",
    DRAFT: "orange",
    PENDING: "gold",
    WARNING: "red",
  };

  const avatarInitials = brand.name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={48}
            style={{ backgroundColor: TIER_COLORS[brand.tier], fontWeight: 700, fontSize: 16 }}
          >
            {avatarInitials}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{brand.name}</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              <Tag color={INDUSTRY_COLORS[brand.industry]}>{brand.industry}</Tag>
              <Badge status={STATUS_COLORS[brand.status] as "success" | "error" | "warning"} text={STATUS_LABELS[brand.status]} />
            </div>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      width={680}
      extra={
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(brand)}>
          Chỉnh sửa
        </Button>
      }
    >
      {/* ─── Summary Stats ─── */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Tổng Chiến Dịch"
              value={brand.totalCampaigns}
              prefix={<RocketOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: 22, color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Đang Chạy"
              value={brand.activeCampaigns}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ fontSize: 22, color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Tổng Chi Tiêu"
              value={formatVND(brand.totalSpent)}
              suffix="₫"
              prefix={<DollarCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ fontSize: 18, color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Tier Badge ─── */}
      <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <Tag
          style={{
            backgroundColor: TIER_COLORS[brand.tier],
            color: "#fff",
            borderColor: TIER_COLORS[brand.tier],
            fontWeight: 700,
            fontSize: 14,
            padding: "4px 12px",
          }}
        >
          ★ Tier: {brand.tier}
        </Tag>
        <Tag color={STATUS_COLORS[brand.status]}>{STATUS_LABELS[brand.status]}</Tag>
        <Text type="secondary" style={{ fontSize: 12, alignSelf: "center" }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          Hợp tác từ: {new Date(brand.joinDate).toLocaleDateString("vi-VN")}
        </Text>
      </div>

      <Divider>Thông tin liên hệ</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={<><MailOutlined style={{ marginRight: 4 }} />Người liên hệ</>}>
          <strong>{brand.contactName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined style={{ marginRight: 4 }} />Email</>}>
          <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
        </Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 4 }} />Điện thoại</>}>
          {brand.contactPhone}
        </Descriptions.Item>
        {brand.website && (
          <Descriptions.Item label={<><GlobalOutlined style={{ marginRight: 4 }} />Website</>}>
            <a href={brand.website} target="_blank" rel="noopener noreferrer">{brand.website}</a>
          </Descriptions.Item>
        )}
        {brand.address && (
          <Descriptions.Item label={<><EnvironmentOutlined style={{ marginRight: 4 }} />Địa chỉ</>}>
            {brand.address}
          </Descriptions.Item>
        )}
        {brand.taxCode && (
          <Descriptions.Item label={<><BankOutlined style={{ marginRight: 4 }} />Mã số thuế</>}>
            {brand.taxCode}
          </Descriptions.Item>
        )}
      </Descriptions>

      {brand.description && (
        <>
          <Divider>Mô tả</Divider>
          <Paragraph style={{ color: "#595959", lineHeight: 1.7 }}>{brand.description}</Paragraph>
        </>
      )}

      <Divider>Lịch sử chiến dịch</Divider>
      {historyQ.isLoading ? (
        <Text type="secondary">Đang tải…</Text>
      ) : campaignHistory.length === 0 ? (
        <Text type="secondary">Chưa có chiến dịch nào.</Text>
      ) : (
        <Timeline
          items={campaignHistory.map((c) => ({
            color: statusColorMap[c.status] ?? "gray",
            children: (
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  <Tag color={statusColorMap[c.status] ?? "default"} style={{ marginRight: 8 }}>{c.status}</Tag>
                  {c.startTime ? new Date(c.startTime).toLocaleDateString("vi-VN") : "—"}
                  {" – "}
                  {c.endTime ? new Date(c.endTime).toLocaleDateString("vi-VN") : "—"}
                </div>
              </div>
            ),
          }))}
        />
      )}
    </Drawer>
  );
}
