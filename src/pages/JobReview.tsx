import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

export default function JobReview() {
  const jobs = [
    {
      id: 1,
      title: "Create Social Media Content",
      campaign: "Summer Sale 2024",
      submittedBy: "Nguyen Van A",
      status: "Approved",
      submittedDate: "2024-06-15",
      approvedDate: "2024-06-16",
      quality: "Excellent",
    },
    {
      id: 2,
      title: "Product Review Video",
      campaign: "New Product Launch",
      submittedBy: "Tran Thi B",
      status: "Pending",
      submittedDate: "2024-07-10",
      approvedDate: null,
      quality: "Good",
    },
    {
      id: 3,
      title: "Unboxing Video",
      campaign: "Back to School",
      submittedBy: "Le Van C",
      status: "Rejected",
      submittedDate: "2024-07-08",
      approvedDate: "2024-07-09",
      quality: "Poor",
    },
    {
      id: 4,
      title: "Tutorial Video",
      campaign: "Holiday Special",
      submittedBy: "Pham Thi D",
      status: "Pending",
      submittedDate: "2024-07-12",
      approvedDate: null,
      quality: "Excellent",
    },
    {
      id: 5,
      title: "Customer Testimonial",
      campaign: "Summer Sale 2024",
      submittedBy: "Hoang Van E",
      status: "Approved",
      submittedDate: "2024-07-05",
      approvedDate: "2024-07-06",
      quality: "Excellent",
    },
    {
      id: 6,
      title: "Behind The Scenes",
      campaign: "New Product Launch",
      submittedBy: "Vu Thi F",
      status: "Pending",
      submittedDate: "2024-07-11",
      approvedDate: null,
      quality: "Good",
    },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return "text-green-600 dark:text-green-400";
      case "Good":
        return "text-blue-600 dark:text-blue-400";
      case "Poor":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý Job & Duyệt Video"
        description="Trang quản lý job và duyệt video bằng mock data"
      />
      <PageBreadcrumb pageTitle="Quản lý Job & Duyệt Video" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-sky-50 p-4 dark:border-gray-800 dark:bg-sky-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chưa Duyệt
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            24
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-green-50 p-4 dark:border-gray-800 dark:bg-green-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã Duyệt
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            156
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-red-50 p-4 dark:border-gray-800 dark:bg-red-900/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bị Từ Chối
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            8
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm job..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <select className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option>Tất Cả Trạng Thái</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <ComponentCard
        title="Danh Sách Video"
        desc="Duyệt video theo chiến dịch, người gửi và chất lượng nội dung"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tên Video
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Chiến Dịch
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Người Gửi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Chất Lượng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ngày Gửi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {job.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {job.campaign}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {job.submittedBy}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className={`px-4 py-4 text-sm font-medium ${getQualityColor(job.quality)}`}>
                    {job.quality}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(job.submittedDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      {job.status === "Pending" && (
                        <>
                          <button className="text-green-600 hover:text-green-700 dark:text-green-400">
                            Duyệt
                          </button>
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400">
                            Từ Chối
                          </button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Xem
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
