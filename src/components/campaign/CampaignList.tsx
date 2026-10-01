import { Input, Select } from "antd"
import { TableListCampaign } from "./TableListCampaign"


export const CampaignList = () => {
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
  return (
    <div>
        <div className="flex justify-between gap-5 mb-4">
              <Input.Search 
              placeholder="Tìm kiếm theo tên chiến dich hoặc nhãn hàng"
                  classNames={{
                     root:"max-w-xs"
                  }}
                  styles={{
                    
                  }}
              />
              <Select
                 placeholder="Lọc theo trạng thái"
                  onChange={handleChange}
                  options={[
                      { value: 'jack', label: 'Jack' },
                      { value: 'lucy', label: 'Lucy' },
                      { value: 'Yiminghe', label: 'yiminghe' },
                      { value: 'disabled', label: 'Disabled', disabled: true },
                  ]}
              />
        </div>
      
        <TableListCampaign />
    </div>
  )
}
