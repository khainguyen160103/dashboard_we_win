import { Descriptions, Modal, Skeleton, Tag, Typography } from "antd";
import { useKocQuery } from "../../../hooks/query/useKocQuery";
import { formatVND } from "../utils/campaign.utils";

interface KocInfoModalProps {
  open: boolean;
  /** koc.koc_id (cũng là user id của KOC). */
  kocUserId?: string | null;
  /** Tên hiển thị sẵn có (dùng làm tiêu đề trong lúc chờ tải). */
  fallbackName?: string;
  onClose: () => void;
}

const num = (v?: number | null) => (typeof v === "number" ? v.toLocaleString("vi-VN") : "—");
const money = (v?: number | null) => (typeof v === "number" ? formatVND(v) : "—");
const text = (v?: string | null) => (v && v.trim() ? v : "—");

export function KocInfoModal({ open, kocUserId, fallbackName, onClose }: KocInfoModalProps) {
  const { data: koc, isLoading, isError } = useKocQuery(kocUserId ?? "", open && Boolean(kocUserId));

  return (
    <Modal
      title={koc?.name || fallbackName || "Thông tin KOC"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      destroyOnClose
    >
      {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}

      {isError && (
        <Typography.Text type="danger">Không tải được thông tin KOC.</Typography.Text>
      )}

      {!isLoading && !isError && koc && (
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          styles={{ label: { width: 160, fontWeight: 600 } }}
        >
          <Descriptions.Item label="Tên nhà sáng tạo">{text(koc.name)}</Descriptions.Item>
          <Descriptions.Item label="Tier / Loại KOC">
            {koc.tier ? <Tag color="blue">{koc.tier}</Tag> : "—"} {text(koc.kocType)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái hợp tác">{text(koc.status)}</Descriptions.Item>
          <Descriptions.Item label="Ngành hàng">{text(koc.productCategory)}</Descriptions.Item>

          <Descriptions.Item label="ID TikTok">{text(koc.idTiktok)}</Descriptions.Item>
          <Descriptions.Item label="Link TikTok">
            {koc.linkTiktok ? (
              <a href={koc.linkTiktok} target="_blank" rel="noreferrer">
                {koc.linkTiktok}
              </a>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Facebook">{text(koc.facebook)}</Descriptions.Item>
          <Descriptions.Item label="Zalo / SĐT">{text(koc.zalo)}</Descriptions.Item>

          <Descriptions.Item label="Followers">{num(koc.followers)}</Descriptions.Item>
          <Descriptions.Item label="Lượt xem">{num(koc.viewer)}</Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ tương tác">
            {typeof koc.engagementRate === "number" ? `${koc.engagementRate}%` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Giá bán trung bình">{money(koc.averageSellingPrice)}</Descriptions.Item>

          <Descriptions.Item label="GMV (theo sản phẩm)">{money(koc.gmv)}</Descriptions.Item>
          <Descriptions.Item label="Doanh thu">{money(koc.revenue)}</Descriptions.Item>
          <Descriptions.Item label="Doanh số Livestream">{money(koc.livestreamTotalAmount)}</Descriptions.Item>
          <Descriptions.Item label="Doanh số Video">{money(koc.videoTotalAmount)}</Descriptions.Item>

          <Descriptions.Item label="Follower Nữ / Nam">
            {num(koc.followerFemale)}% / {num(koc.followerMale)}%
          </Descriptions.Item>
          <Descriptions.Item label="Độ tuổi Follower">{num(koc.followerAge)}</Descriptions.Item>
          <Descriptions.Item label="Khu vực hàng đầu">{text(koc.topLocation)}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ nhận hàng">{text(koc.address)}</Descriptions.Item>

          <Descriptions.Item label="Ngân hàng">{text(koc.typeBank)}</Descriptions.Item>
          <Descriptions.Item label="Số tài khoản">{text(koc.bankAccount)}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}

export default KocInfoModal;
