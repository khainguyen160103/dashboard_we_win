import { useState } from "react";

import { Card } from "antd";

import KocTable from "../components/tables/KocTable";
import { TemplateManagerModal } from "../components/koc/TemplateManagerModal";
import { KOCHistoryModal } from "../components/koc/KOCHistoryModal";

import type { KOCRecord } from "../components/koc/types";


import CardChartByFollower from "../components/koc/CardChartByFollower";
import CardByProductCategory from "../components/koc/CardByProductCategory";
import CardTopKocByProduct from "../components/koc/CardTopKocByProduct";
import CardKocJoinByPruductCategory from "../components/koc/CardKocJoinByPruductCategory";
import CardKocNotJoin from "../components/koc/CardKocNotJoin";


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KOCManagement() {

  // ── History Modal ──
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryKOC, setSelectedHistoryKOC] = useState<KOCRecord | null>(null);

  // ── Template Manager ──
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);

  return (
    <>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card style={{ borderRadius: 8 }}
        >
          <h3 className="font-bold">Tổng số KOC</h3>
          <h1>245</h1>
          <p>▲ +12 trong kỳ</p>
        </Card>
        <Card style={{ borderRadius: 8 }}
        >
          <h3 className="font-bold">Tổng GMV toàn bộ KOC</h3>
          <h1>34.8B₫</h1>
        </Card>
        <Card style={{ borderRadius: 8 }}
        >
          <h3 className="font-bold">KOC đang hoạt động</h3>
          <h1>189/245</h1>
        </Card>
      </div>


      {/* Phân bổ koc */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <CardByProductCategory />
        <CardChartByFollower />
      </div>


      {/* Cơ hội*/}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <CardTopKocByProduct />
        <CardKocJoinByPruductCategory />
      </div>

      <div className="mb-5">
        <CardKocNotJoin />
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
    </>
  );
}
