import { Campaigns } from "../component/Campaigns";
import BrandPortalDashboard from "../../../pages/Dashboard/BrandPortalDashboard";
import { authStore } from "../../../store/authStore";
import { getActiveUserRole } from "../../../utils/rbac";

export default function CampaignManagement() {
  const user = authStore((s) => s.user);
  // Brand chỉ xem chiến dịch của mình (Cổng Brand) — không xem toàn bộ chiến dịch hệ thống
  if (getActiveUserRole(user) === "BRAND") return <BrandPortalDashboard />;
  return (
    <Campaigns />
  );
}
