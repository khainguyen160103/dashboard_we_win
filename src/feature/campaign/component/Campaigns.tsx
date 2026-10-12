import { Button, Tabs, TabsProps, message } from "antd";
import CampaignOverview from "./CampaignOverview";

import { useModal } from "../../../hooks/useModal";
import { AddCampaignModal, toCampaignRequest, type CampaignFormValues } from "./AddCampaignModal";
import { CampaignList } from "./CampaignList";
import { useCreateCampaignMutation } from "../hook/useCampaignQuery";
import { authStore } from "../../../store/authStore";

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
    const createMut = useCreateCampaignMutation()
    // BE chỉ cho Admin / PM tạo chiến dịch
    const canCreate = authStore((s) => s.user?.isAdmin || s.user?.admin || s.hasRole(["ADMIN", "PM"]))

    const handleCreate = async (values: CampaignFormValues) => {
        try {
            await createMut.mutateAsync(toCampaignRequest(values))
            message.success("Tạo chiến dịch thành công")
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? "Không tạo được chiến dịch")
            throw err
        }
    }

  return (
    <>
          <div className="bg-white rounded-2xl p-4 shadow-2xl">
              {canCreate && (
                  <Button onClick={openModal} type="primary" className="mb-2" > Tạo chiến dịch </Button>
              )}
              <Tabs items={items} />
          </div>
          <AddCampaignModal
              open={isOpen}
              onClose={closeModal}
              onSubmit={handleCreate}
              submitting={createMut.isPending}
          />
    </>
  )
}
