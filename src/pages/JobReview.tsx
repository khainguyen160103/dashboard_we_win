import { useState, useMemo } from "react";
import { Card, Flex, Radio, Space, Tag, message } from "antd";
import { UserOutlined, SolutionOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuthStore } from "../hooks/store/useAuthStore";
import { initialMockKOCs } from "../features/koc/koc.data";

import {
  JobPMView,
  JobKOCView,
  PMReviewModal,
  UploadVideoModal,
  KOCInfoModal,
  loadJobs,
  saveJobs,
} from "../features/job";

import type {
  JobRecord,
  PMReviewFormValues,
  KOCUploadFormValues,
  RoleType,
} from "../features/job";

type RBACMode = "AUTO" | "PM" | "KOC";

export default function JobReview() {
  const user = useAuthStore((state) => state.user);

  // Determine user's real role from Zustand / JWT
  const detectedRole = useMemo<RoleType>(() => {
    if (!user) return "PM"; // Default fallback if guest/demo
    const roles = (user.roles || []).map((r) => r.toUpperCase());
    const isKOC = roles.some((r) => r.includes("KOC")) || user.email?.toLowerCase().includes("koc");
    return isKOC ? "KOC" : "PM";
  }, [user]);

  // Find matching KOC ID if logged-in user is a KOC
  const loggedInKocId = useMemo<number>(() => {
    if (!user) return 1; // Default to Linh Barbie for demo
    const found = initialMockKOCs.find(
      (k) => k.email.toLowerCase() === user.email.toLowerCase() || k.name.toLowerCase() === user.fullName?.toLowerCase()
    );
    return found ? found.id : 1;
  }, [user]);

  // RBAC mode: "AUTO" (strictly follows auth), "PM", or "KOC"
  const [rbacMode, setRbacMode] = useState<RBACMode>("AUTO");
  const [activeKocId, setActiveKocId] = useState<number>(loggedInKocId);

  // Effective role based on mode
  const effectiveRole: RoleType = rbacMode === "AUTO" ? detectedRole : rbacMode;

  // Jobs state with persistence
  const [jobsList, setJobsList] = useState<JobRecord[]>(loadJobs);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [kocModalOpen, setKocModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);

  // ── PM Review Handler ──
  const handleOpenReviewModal = (job: JobRecord) => {
    setSelectedJob(job);
    setReviewModalOpen(true);
  };

  const handleSubmitPMReview = (values: PMReviewFormValues) => {
    if (!selectedJob) return;

    const updated = jobsList.map((j) => {
      if (j.id === selectedJob.id) {
        return {
          ...j,
          status: values.status,
          quality: values.quality,
          pmFeedback: values.pmFeedback,
          approvedDate: values.status === "Approved" ? new Date().toISOString().split("T")[0] : j.approvedDate,
        };
      }
      return j;
    });

    setJobsList(updated);
    saveJobs(updated);
    message.success(
      values.status === "Approved"
        ? `Đã phê duyệt Video của ${selectedJob.kocName}!`
        : `Đã phản hồi yêu cầu sửa video cho ${selectedJob.kocName}!`
    );
    setReviewModalOpen(false);
    setSelectedJob(null);
  };

  // ── KOC Upload Handler ──
  const handleOpenUploadModal = (job: JobRecord) => {
    setSelectedJob(job);
    setUploadModalOpen(true);
  };

  const handleSubmitKOCUpload = (values: KOCUploadFormValues) => {
    if (!selectedJob) return;

    const updated = jobsList.map((j) => {
      if (j.id === selectedJob.id) {
        return {
          ...j,
          title: values.title,
          description: values.description,
          videoUrl: values.videoUrl,
          status: "Pending" as const,
          submittedDate: new Date().toISOString().split("T")[0],
        };
      }
      return j;
    });

    setJobsList(updated);
    saveJobs(updated);
    message.success(`Đã gửi Video cho PM duyệt!`);
    setUploadModalOpen(false);
    setSelectedJob(null);
  };

  // ── KOC Info Handler ──
  const handleOpenKocModal = (job: JobRecord) => {
    setSelectedJob(job);
    setKocModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Quản lý Job & Phê duyệt Video (RBAC)"
        description="Trang quản lý Job và duyệt video tự động phân quyền theo Auth Role PM / KOC"
      />
      <PageBreadcrumb pageTitle="Quản lý Job & Phê duyệt Video" />

      {/* RBAC Auth & Control Card */}
      <Card size="small" style={{ marginBottom: 20, background: "#fafafa" }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space size={12}>
            <SafetyCertificateOutlined style={{ fontSize: 20, color: "#1890ff" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                Phân quyền người dùng (RBAC):{" "}
                <Tag color={detectedRole === "PM" ? "blue" : "green"}>
                  {user ? `User: ${user.fullName || user.username} (${user.roles?.join(", ") || detectedRole})` : `Giao diện Demo (${detectedRole})`}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                {effectiveRole === "PM"
                  ? "Quyền PM: Được xem toàn bộ Job, thông tin KOC & thực hiện phê duyệt / chấm điểm video."
                  : "Quyền KOC: Chỉ xem các Job của chiến dịch đã tham gia & nộp video bài đăng."}
              </div>
            </div>
          </Space>

          {/* RBAC Mode Selector (Auto vs Manual Test override) */}
          <Space align="center">
            <span style={{ fontSize: 12, color: "#595959" }}>Chế độ hiển thị:</span>
            <Radio.Group
              value={rbacMode}
              onChange={(e) => setRbacMode(e.target.value as RBACMode)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="AUTO">
                ⚡ Tự động theo Auth ({detectedRole})
              </Radio.Button>
              <Radio.Button value="PM">
                <SolutionOutlined /> Xem giao diện PM
              </Radio.Button>
              <Radio.Button value="KOC">
                <UserOutlined /> Xem giao diện KOC
              </Radio.Button>
            </Radio.Group>
          </Space>
        </Flex>
      </Card>

      {/* RBAC Active View */}
      {effectiveRole === "PM" ? (
        <JobPMView
          jobs={jobsList}
          onOpenReviewModal={handleOpenReviewModal}
          onOpenKocModal={handleOpenKocModal}
        />
      ) : (
        <JobKOCView
          jobs={jobsList}
          activeKocId={activeKocId}
          onChangeActiveKoc={setActiveKocId}
          onOpenUploadModal={handleOpenUploadModal}
        />
      )}

      {/* Modals */}
      <PMReviewModal
        open={reviewModalOpen}
        job={selectedJob}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={handleSubmitPMReview}
      />

      <UploadVideoModal
        open={uploadModalOpen}
        job={selectedJob}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={handleSubmitKOCUpload}
      />

      <KOCInfoModal
        open={kocModalOpen}
        job={selectedJob}
        onClose={() => {
          setKocModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </>
  );
}
