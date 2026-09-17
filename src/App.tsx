import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import UserManagement from "./pages/UserManagement";
import CampaignManagement from "./pages/CampaignManagement";
import CampaignListManagement from "./pages/CampaignListManagement";
import JobReview from "./pages/JobReview";
import RoleDashboard from "./pages/Dashboard/RoleDashboard";
import KOCManagement from "./pages/KOCManagement";
import BrandManagement from "./pages/BrandManagement";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { CampaignDetail } from "./pages/CampaignDetail";
import { PermissionManagement } from "./pages/PermissionManagement";
import { RoleManagement } from "./pages/RoleManagement";

export default function App() {
  return (
    <>
      <Router>
        {/* <ScrollToTop /> */}
        <Routes>
          {/* Dashboard Layout (Protected) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Navigate to="/dashboard" replace />} />

            <Route index path="/dashboard" element={<RoleDashboard />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/koc" element={<KOCManagement />} />
            <Route path="/brand" element={<BrandManagement />} />
            <Route path="/campaigns" element={<CampaignManagement />} />
            <Route path="/campaigns/list" element={<CampaignListManagement />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/job-review" element={<JobReview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/permissions" element={<PermissionManagement />} />
            <Route path="/roles" element={<RoleManagement />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
