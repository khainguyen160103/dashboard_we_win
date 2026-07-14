import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

export default function KPIDashboard() {
  const kpiMetrics = [
    {
      title: "Campaign đang chạy",
      value: "15",
      change: "+2",
      color: "text-sky-700",
      bgColor: "bg-sky-100 dark:bg-sky-900/20",
    },
    {
      title: "Hồ sơ KOC chờ duyệt",
      value: "38",
      change: "+6",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      title: "Video chờ duyệt",
      value: "62",
      change: "+14",
      color: "text-teal-700",
      bgColor: "bg-teal-100 dark:bg-teal-900/20",
    },
    {
      title: "Job đã hoàn thành",
      value: "452",
      change: "+38",
      color: "text-slate-800",
      bgColor: "bg-slate-100 dark:bg-slate-800/60",
    },
  ];

  const campaignRows = [
    {
      name: "Comfort - Mùa hè 2026",
      brand: "Unilever",
      progress: 80,
      status: "Đang chạy",
    },
    {
      name: "Sữa rửa mặt X",
      brand: "Nhãn hàng A",
      progress: 45,
      status: "Đang chạy",
    },
    {
      name: "Ra mắt sản phẩm Y",
      brand: "Nhãn hàng B",
      progress: 95,
      status: "Sắp xong",
    },
    {
      name: "Khuyến mãi tháng 7",
      brand: "Nhãn hàng C",
      progress: 15,
      status: "Mới bắt đầu",
    },
  ];

  return (
    <>
      <PageMeta
        title="Dashboard tổng quan"
        description="Trang tổng quan mock data cho hệ thống quản lý chiến dịch"
      />
      <PageBreadcrumb pageTitle="Dashboard tổng quan" />

      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Đây là bản phác thảo (wireframe) để hình dung bố cục, không phải giao diện thiết kế cuối cùng
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <div
            key={index}
            className={`rounded-2xl border border-gray-200 ${metric.bgColor} p-6 dark:border-gray-800`}
          >
            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {metric.title}
            </h3>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ComponentCard
        title="Danh sách chiến dịch"
        desc="Theo dõi tiến độ, trạng thái và brand trong cùng một bảng"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Chiến dịch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nhãn hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiến độ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {campaignRows.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.brand}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-full max-w-72 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="min-w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                        {row.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </>
  );
}
