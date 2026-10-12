import { Button, Tabs, TabsProps } from "antd";
import CampaignOverview from "./CampaignOverview";

import { useModal } from "../../hooks/useModal";
import { AddCampaignModal } from "./AddCampaignModal";
import { CampaignList } from "./CampaignList";

const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'Tổng quan',
        children: <CampaignOverview />,
    },
    {
        key: '2',
        label: 'Tất cả chiến dịch',
        children:<CampaignList />,
    },
];

export const Campaigns = () => {
    const {isOpen , closeModal , openModal} = useModal()
  return (
    <>
          <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <Button onClick={openModal} type="primary" className="mb-2" > Tạo chiến dịch </Button>
              <Tabs items={items} />
          </div>
          <AddCampaignModal open={isOpen} onClose={closeModal}/>
    </>
  )
}
