import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function AdminPage() {
  return (
    <>
      <PageMeta title="Admin Page" description="Admin-only page for authorized users" />
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
          Admin dashboard
        </h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          This page is only visible to users with the admin role.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Back to dashboard
        </Link>
      </div>
    </>
  );
}
