import { Flex, Spin } from 'antd'
import { useCampaigns } from '../../hooks/query/useCampaignQuery'
import { CardCampaign } from './CardCampaign'
import { CampaignWarning } from './CampaignWarning'
import { CampaignTable } from './CampaignTable'

export default function CampaignOverview() {
    const { data, isLoading } = useCampaigns()
    const campaigns = data?.content ?? [];
    const totalCampaignsActive = campaigns.filter((c) => c.status === 'ACTIVE').length;

  return (
    <Spin spinning={isLoading}>
          <Flex gap={16} wrap="wrap" style={{ marginBottom: 24 }}>
              <CardCampaign
                  title="Tổng chiến dịch"
                  value={data?.totalElements || 0}
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
