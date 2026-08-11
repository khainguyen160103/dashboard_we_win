import { useState, useMemo } from "react";
import { Card, Flex, Space, Spin, Tag, message } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuthStore } from "../hooks/store/useAuthStore";
import { getActiveUserRole, getRoleDisplayName } from "../utils/rbac";

import {
  JobPMView,
  JobKOCView,
  PMReviewModal,
  UploadVideoModal,
  KOCInfoModal,
} from "../features/job";

import type {
  JobRecord,
  PMReviewFormValues,
  KOCUploadFormValues,
} from "../features/job";

import {
  useJobsQuery,
  useMyJobsQuery,
  useSubmitVideoMutation,
  useReviewVideoMutation,
} from "../hooks/query/useJobQuery";

export default function JobReview() {
  const user = useAuthStore((state) => state.user);

  // Tự động kiểm tra Role người dùng đăng nhập từ Auth Store / JWT
  const activeRole = useMemo(() => getActiveUserRole(user), [user]);
  const roleDisplayName = useMemo(() => getRoleDisplayName(activeRole), [activeRole]);

  // REST API hooks for Job Review
  const isKocUser = activeRole === "KOC";
  const { data: apiJobs, isLoading: isLoadingAllJobs, isFetching: isFetchingAllJobs } = useJobsQuery(undefined, { enabled: !isKocUser });
  const { data: apiMyJobs, isLoading: isLoadingMyJobs } = useMyJobsQuery({ enabled: isKocUser });


  const submitVideoMutation = useSubmitVideoMutation();
  const reviewVideoMutation = useReviewVideoMutation();

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [kocModalOpen, setKocModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);

  // Format API Jobs to JobRecord
  const jobsList: JobRecord[] = useMemo(() => {
    const rawList = isKocUser ? (apiMyJobs || apiJobs) : apiJobs;
    let list: any[] = [];
    if (Array.isArray(rawList)) {
      list = rawList;
    } else if (rawList && typeof rawList === "object") {
      const resObj = rawList as any;
      if (Array.isArray(resObj.content)) list = resObj.content;
      else if (Array.isArray(resObj.data)) list = resObj.data;
    }

    if (list.length > 0) {
      return list.map((j) => {
        let status: JobRecord["status"] = "NotSubmitted";
        const vStatus = (j.videoStatus || j.status || "").toUpperCase();
        if (vStatus === "CHO_PM_DUYET" || vStatus === "PENDING") status = "Pending";
        else if (vStatus === "DA_PHE_DUYET" || vStatus === "APPROVED") status = "Approved";
        else if (vStatus === "TU_CHOI" || vStatus === "REJECTED") status = "Rejected";

        let quality: JobRecord["quality"] = undefined;
        const qRating = (j.qualityRating || j.quality || "").toUpperCase();
        if (qRating === "XUAT_SAC" || qRating === "EXCELLENT") quality = "Excellent";
        else if (qRating === "TOT" || qRating === "GOOD") quality = "Good";
        else if (qRating === "DAT" || qRating === "AVERAGE") quality = "Average";
        else if (qRating === "KEM" || qRating === "POOR") quality = "Poor";

        return {
          id: String(j.id),
          campaignId: j.campaignId || 1,
          campaignName: j.campaignName || j.campaign?.name || "Chiến dịch",
          kocId: j.kocId || j.userId || 1,
          kocName: j.kocName || j.user?.fullName || user?.fullName || "KOC User",
          kocEmail: j.kocEmail || j.user?.email || "",
          kocPlatform: j.kocPlatform || j.platform || "TikTok",
          kocTier: j.kocTier || j.tier || "Nano",
          kocFollowers: j.kocFollowers || j.followers || 0,
          kocEngagementRate: j.kocEngagementRate,
          title: j.videoTitle || j.title || "Video Review Sản phẩm",
          description: j.description || "",
          videoUrl: j.videoUrl || undefined,
          status,
          quality,
          pmFeedback: j.pmFeedback || "",
          submittedDate: j.submittedAt ? new Date(j.submittedAt).toISOString().split("T")[0] : undefined,
          approvedDate: j.approvedAt ? new Date(j.approvedAt).toISOString().split("T")[0] : undefined,
        };
      });
    }

    return [];
  }, [apiJobs, apiMyJobs, isKocUser, user]);

  // ── PM Review Handler (PUT /jobs/{jobId}/review-video) ──
  const handleOpenReviewModal = (job: JobRecord) => {
    setSelectedJob(job);
    setReviewModalOpen(true);
  };

  const handleSubmitPMReview = async (values: PMReviewFormValues) => {
    if (!selectedJob) return;

    const videoStatusMap: Record<string, string> = {
      Approved: "DA_PHE_DUYET",
      Rejected: "TU_CHOI",
      Pending: "CHO_PM_DUYET",
    };

    const ratingMap: Record<string, string> = {
      "Xuất sắc": "XUAT_SAC",
      "Tốt": "TOT",
      "Đạt": "DAT",
      "Cần sửa": "KEM",
    };

    try {
      await reviewVideoMutation.mutateAsync({
        jobId: String(selectedJob.id),
        payload: {
          videoStatus: videoStatusMap[values.status] || "DA_PHE_DUYET",
          qualityRating: ratingMap[values.quality] || "XUAT_SAC",
          pmFeedback: values.pmFeedback || "",
        },
      });
      message.success(
        values.status === "Approved"
          ? `Đã phê duyệt Video của ${selectedJob.kocName} qua REST API!`
          : `Đã phản hồi yêu cầu sửa video cho ${selectedJob.kocName} qua REST API!`
      );
      setReviewModalOpen(false);
      setSelectedJob(null);
    } catch {
      message.error("Có lỗi xảy ra khi cập nhật đánh giá trên REST API server!");
    }
  };

  // ── KOC Upload Handler (POST /jobs/{jobId}/submit-video) ──
  const handleOpenUploadModal = (job: JobRecord) => {
    setSelectedJob(job);
    setUploadModalOpen(true);
  };

  const handleSubmitKOCUpload = async (values: KOCUploadFormValues) => {
    if (!selectedJob) return;

    try {
      await submitVideoMutation.mutateAsync({
        jobId: String(selectedJob.id),
        payload: {
          videoTitle: values.title,
          videoUrl: values.videoUrl ?? "",
        },
      });
      message.success(`Đã nộp Video cho PM duyệt qua REST API!`);
      setUploadModalOpen(false);
      setSelectedJob(null);
    } catch {
      message.error("Có lỗi xảy ra khi nộp video lên REST API server!");
    }
  };

  // ── KOC Info Handler ──
  const handleOpenKocModal = (job: JobRecord) => {
    setSelectedJob(job);
    setKocModalOpen(true);
  };

  const isLoading = isLoadingAllJobs || isLoadingMyJobs || isFetchingAllJobs;

  return (
    <>
      <PageMeta
        title="Quản lý Job & Phê duyệt Video"
        description="Trang quản lý Job và duyệt video tự động phân quyền theo REST API"
      />
      <PageBreadcrumb pageTitle="Quản lý Job & Phê duyệt Video" />


      <Spin spinning={isLoading} tip="Đang tải dữ liệu Job từ REST API server...">
        {/* RBAC Active View based on logged-in user role */}
        {activeRole === "KOC" ? (
          <JobKOCView
            jobs={jobsList}
            activeKocId={1}
            onChangeActiveKoc={() => { }}
            onOpenUploadModal={handleOpenUploadModal}
          />
        ) : (
          <JobPMView
            jobs={jobsList}
            onOpenReviewModal={handleOpenReviewModal}
            onOpenKocModal={handleOpenKocModal}
          />
        )}
      </Spin>

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
