import { useState } from "react";

import { Spin } from "antd";

import KocTable from "../components/tables/KocTable";
import { TemplateManagerModal } from "../components/koc/TemplateManagerModal";
import { KOCHistoryModal } from "../components/koc/KOCHistoryModal";

import type { KOCRecord } from "../components/koc/types";


import CardChartByFollower from "../components/koc/CardChartByFollower";
import CardByProductCategory from "../components/koc/CardByProductCategory";
import CardTopKocByProduct from "../components/koc/CardTopKocByProduct";
import CardKocJoinByPruductCategory from "../components/koc/CardKocJoinByPruductCategory";
import CardKocNotJoin from "../components/koc/CardKocNotJoin";
import KocHeaderMetrics from "../components/koc/KocHeaderMetrics";
import { useKoc } from "../hooks/query";


export default function KOCManagement() {


  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryKOC, setSelectedHistoryKOC] = useState<KOCRecord | null>(null);

  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const { data: kocs, isLoading, isError } = useKoc()
  return (
    <>
      {isLoading ? <Spin size="large" className="flex justify-center items-center" />
        : isError ? <div>Error loading KOCs</div>
          : <>

            <KocHeaderMetrics kocs={kocs} />


            {/* Phân bổ koc */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <CardByProductCategory kocs={kocs} />
              <CardChartByFollower />
            </div>


            {/* Cơ hội*/}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <CardTopKocByProduct kocs={kocs} />
              <CardKocJoinByPruductCategory kocs={kocs} />
            </div>

            <div className="mb-5">
              <CardKocNotJoin kocs={kocs} />
            </div>


            {/* KOC Table */}
            <KocTable />

            {/* Modals */}

            <KOCHistoryModal
              open={historyModalOpen}
              koc={selectedHistoryKOC}
              onClose={() => { setHistoryModalOpen(false); setSelectedHistoryKOC(null); }}
            />

            <TemplateManagerModal open={templateManagerOpen} onClose={() => setTemplateManagerOpen(false)} />
          </>}
    </>
  );
}
