
import { Card, Divider , } from "antd";

import { WarningOutlined } from "@ant-design/icons";



export function CampaignWarning({ campaigns }: { campaigns: any }) {

  return (
    <div className="w-full mb-6 flex space-between gap-4">

      <Card style={{ backgroundColor: 'rgba(208, 59, 59, 0.07)', border: "1px solid #d03b3b4d", flex: 1 }} variant="borderless">

        <div className="flex flex-col items-center justify-between gap-2 mb-3 v">
              <div className="w-full flex items-center justify-between gap-2 font-semibold text-red-600">
            <h1 className="text-red-500 inline font-bold text-[16px] flex-1">Chiến dịch cần chú ý (đang chạy, ít KOC) <WarningOutlined /></h1> 
                <span className="text-sm font-bold text-gray-500 flex-1 text-right">{campaigns.length}</span>
              </div>

          <div className="w-full flex items-center justify-between gap-2 font-semibold ">
            <div>
              <h2 className="font-semibold">Khuyến mãi tháng 8</h2>
              <p>Cocoon Việt Nam</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-500">Roi 2.5 Thấp</span>
            </div>
          </div>
          <Divider />
          <div className="w-full flex items-center justify-between gap-2 font-semibold ">
            <div>
              <h2 className="font-semibold">Khuyến mãi tháng 8</h2>
              <p>Cocoon Việt Nam</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-500">Roi 2.5 Thấp</span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ backgroundColor: '#DCEEEF', border: "1px solid rgba(31,111,120,0.3)", flex: 1 }} variant="borderless">
         <div className="flex flex-col items-center justify-between gap-2 mb-3 v">
              <div className="w-full flex items-center justify-between gap-2 font-semibold text-red-600">
            <h1 className="text-red-500 inline font-bold text-[16px] flex-1">Deadline sắp tới(7-14 ngày)</h1> 
                <span className="text-sm font-bold text-gray-500 flex-1 text-right">{campaigns.length}</span>
              </div>

          <div className="w-full flex items-center justify-between gap-2 font-semibold ">
            <div>
              <h2 className="font-semibold">Comfort - Mùa hè 2026</h2>
              <p>Unilever</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-500">còn 7 ngày</span>
            </div>
          </div>
          <Divider />
          <div className="w-full flex items-center justify-between gap-2 font-semibold ">
            <div>
              <h2 className="font-semibold">Comfort - Mùa hè 2026</h2>
              <p>Unilever</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-500">còn 7 ngày</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}

