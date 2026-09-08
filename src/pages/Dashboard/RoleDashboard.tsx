import { authStore } from "../../store/authStore";
import AgencyOverview from "./AgencyOverview";
import KocPortalDashboard from "./KocPortalDashboard";
import BrandPortalDashboard from "./BrandPortalDashboard";

export default function RoleDashboard() {
  const user = authStore((s) => s.user);
  console.log("RoleDashboard: user", user, "roles", user?.roles);
  if (user?.roles?.includes("KOC")) return <KocPortalDashboard />;
  if (user?.roles?.includes("BRAND")) return <BrandPortalDashboard />;
  return <AgencyOverview />;
}
