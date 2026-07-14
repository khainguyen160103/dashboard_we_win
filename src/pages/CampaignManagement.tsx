import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

export default function CampaignManagement() {
  const campaigns = [
    {
      id: 1,
      name: "Summer Sale 2024",
      status: "Active",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      budget: 25000,
      spent: 18500,
      videos: 120,
      approved: 115,
    },
    {
      id: 2,
      name: "Back to School",
      status: "Active",
      startDate: "2024-07-15",
      endDate: "2024-09-15",
      budget: 30000,
      spent: 22000,
      videos: 150,
      approved: 142,
    },
    {
      id: 3,
      name: "Holiday Special",
      status: "Scheduled",
      startDate: "2024-11-01",
      endDate: "2024-12-25",
      budget: 50000,
      spent: 0,
      videos: 0,
      approved: 0,
    },
    {
      id: 4,
      name: "Flash Deal Week",
      status: "Completed",
      startDate: "2024-05-01",
      endDate: "2024-05-07",
      budget: 15000,
      spent: 15000,
      videos: 85,
      approved: 85,
    },
    {
      id: 5,
      name: "New Product Launch",
      status: "Active",
      startDate: "2024-06-20",
      endDate: "2024-10-20",
      budget: 40000,
      spent: 28000,
      videos: 200,
      approved: 190,
    },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý chiến dịch"
        description="Trang quản lý chiến dịch với mock data demo"
      />
      <PageBreadcrumb pageTitle="Quản lý chiến dịch" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { title: "Tổng chiến dịch", value: "48", tone: "bg-sky-50 dark:bg-sky-900/20" },
          { title: "Đang chạy", value: "15", tone: "bg-teal-50 dark:bg-teal-900/20" },
          { title: "Sắp khởi động", value: "7", tone: "bg-amber-50 dark:bg-amber-900/20" },
          { title: "Đã hoàn thành", value: "26", tone: "bg-slate-50 dark:bg-slate-800/60" },
        ].map((metric) => (
          <div
            key={metric.title}
            className={`rounded-2xl border border-gray-200 p-5 ${metric.tone} dark:border-gray-800`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm chiến dịch..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <button className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          + Tạo Chiến Dịch
        </button>
      </div>

      <ComponentCard
        title="Danh Sách Chiến Dịch"
        desc="Theo dõi ngân sách, thời gian và tiến độ của từng campaign"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tên Chiến Dịch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Thời Gian
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Budget
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Video
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiến độ
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {campaign.name}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="text-xs">
                      {new Date(campaign.startDate).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      -{" "}
                      {new Date(campaign.endDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      ${campaign.spent.toLocaleString()} /{" "}
                      ${campaign.budget.toLocaleString()}
                    </div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-brand-500"
                        style={{
                          width: `${(campaign.spent / campaign.budget) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      {campaign.approved}/{campaign.videos}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {campaign.videos > 0
                        ? (
                            ((campaign.approved / campaign.videos) * 100).toFixed(
                              0
                            ) + "%"
                          )
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {Math.round((campaign.spent / campaign.budget) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Chi Tiết
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                        Sửa
                      </button>
                    </div>
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
