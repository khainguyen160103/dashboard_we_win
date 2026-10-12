import { Alert, Flex, Spin } from 'antd'
import { CardCampaign } from './CardCampaign'
import { CampaignWarning } from './CampaignWarning'
import { CampaignTable } from './CampaignTable'
import { useCampaignOverview } from '../hook/useCampaignQuery'

export default function CampaignOverview() {
    const { data, isLoading, isError, error } = useCampaignOverview()
    const campaigns = data ?? [];
    const totalCampaignsActive = campaigns?.filter((c) => c.status === 'ACTIVE').length;

  return (
    <Spin spinning={isLoading}>
          {isError && (
              <Alert type="error" showIcon className="mb-4" title="Không tải được tổng quan chiến dịch" description={error?.message} />
          )}
          <Flex gap={16} wrap="wrap" style={{ marginBottom: 24 }}>
              <CardCampaign
                  title="Tổng chiến dịch"
                  value={campaigns.length}
                  description='Toàn bộ chiến dịch trong hệ thống demo — bấm "Xem thêm" cuối bảng để xem hết'
              />
              <CardCampaign
                  title="Đang hoạt động"
                  value={totalCampaignsActive}
                  valueClassName="text-green-600"
                  description="khớp với Dashboard Tổng quan"
              />
              <CardCampaign
                  title="Tổng GMV / Ngân sách"
                  value={10000}
                  description={`Ngân sách đã dùng Bđ / Bđ (}%)`}
              />
              <CardCampaign
                  title="Tỷ lệ lấp đầy KOC TB"
                  value={`${10}%`}
                  description={`KOC xác nhận / mục tiêu, TB ${totalCampaignsActive} chiến dịch`}
              />
          </Flex>


          <CampaignWarning campaigns={campaigns} />

           <CampaignTable
            campaigns={campaigns}
          />
    </Spin>
  )
}
