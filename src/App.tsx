import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import UserManagement from "./pages/UserManagement";
import CampaignManagement from "./pages/CampaignManagement";
import JobReview from "./pages/JobReview";
import KPIDashboard from "./pages/KPIDashboard";
import KOCManagement from "./pages/KOCManagement";
import BrandManagement from "./pages/BrandManagement";
import PermissionManagement from "./pages/PermissionManagement";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminPage from "./pages/Admin/AdminPage";
import KalodataCreator from "./pages/KalodataCreator";

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
            <Route index path="/" element={<KPIDashboard />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/user" element={<UserManagement />} />
            <Route path="/koc" element={<KOCManagement />} />
            <Route path="/brand" element={<BrandManagement />} />
            <Route path="/campaign" element={<CampaignManagement />} />
            <Route path="/job-review" element={<JobReview />} />
            <Route path="/permission" element={<PermissionManagement />} />
            <Route path="/kalodata" element={<KalodataCreator />} />





            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
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
