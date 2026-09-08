import { Card } from "antd"

type Props = {kocs?: any[]}

export default function KocHeaderMetrics({ kocs }: Props) {
   
    console.log("kocs", kocs)
    const gvm = kocs?.reduce((acc, koc) => acc + (koc.gmv || 0), 0) || 0
    const activeKocs = kocs?.filter(koc => koc.status === "ACTIVE").length || 0
    const totalKocs = kocs?.length || 0
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-5">
                <Card variant="borderless" style={{ borderRadius: 8 }}
                >
                        <h3 className="font-bold">Tổng số KOC</h3>
                        <h1>{totalKocs}</h1>
               
                </Card>
                <Card variant="borderless"   style={{ borderRadius: 8 }}
                >
                    <h3 className="font-bold">Tổng GMV toàn bộ KOC</h3>
                    <h1>{gvm.toLocaleString()}₫</h1>
                </Card>
                <Card variant="borderless" style={{ borderRadius: 8 }}
                >
                    <h3 className="font-bold">KOC đang hoạt động</h3>
                    <h1>{activeKocs}</h1>
                </Card>
            </div>
        </>
    )
}