import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/layout/AppLayout";
import RoleDashboard from "@/pages/Dashboard/RoleDashboard";
import UserProfiles from "@/pages/UserProfiles";
import Blank from "@/pages/Blank";
import BrandManagement from "@/pages/BrandManagement";
import CampaignManagement from "@/feature/campaign/view/CampaignManagement";
import CampaignListManagement from "@/feature/campaign/view/CampaignListManagement";
import { CampaignDetail } from "@/feature/campaign/view/CampaignDetail";
import PublicInviteForm from "@/feature/campaign/view/PublicInviteForm";
import JobReview from "@/pages/JobReview";
import { PermissionManagement } from "@/pages/PermissionManagement";
import SignIn from "@/pages/AuthPages/SignIn";
import NotFound from "@/pages/OtherPage/NotFound";
import KocPage from "@/pages/KocPage";

export const Routers = () => {
  return (
    <>
      <Router>
        {/* <ScrollToTop /> */}
        <Routes>
          { }
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ ProtectedRoute>
            }
          >
            <Route index path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RoleDashboard />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/koc" element={<KocPage />} />
            <Route path="/brand" element={<BrandManagement />} />
            <Route path="/campaign" element={<CampaignManagement />} />
            <Route path="/campaign/list" element={<CampaignListManagement />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/job-review" element={<JobReview />} />
            <Route path="/permission" element={<PermissionManagement />} />


          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Public: KOC điền form mời (không cần đăng nhập) */}
          <Route path="/:campaignId/form-invite" element={<PublicInviteForm />} />


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  )
}

export default Routers