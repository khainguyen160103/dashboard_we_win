import type { Platform } from "../koc/types";

export type RoleType = "PM" | "KOC";

export type JobStatus = "NotSubmitted" | "Pending" | "Approved" | "Rejected";

export type QualityRating = "Excellent" | "Good" | "Average" | "Poor";

export type JobRecord = {
  id: string;
  campaignId: number;
  campaignName: string;
  brandName?: string;
  kocId: number;
  kocName: string;
  kocEmail: string;
  kocPhone?: string;
  kocPlatform: Platform;
  kocTier: string;
  kocFollowers: number;
  kocEngagementRate?: number;
  title: string;
  description?: string;
  videoUrl?: string;
  videoFileName?: string;
  status: JobStatus;
  invitationStatus?: "INVITED" | "ACCEPTED" | "REJECTED";
  quality?: QualityRating;
  submittedDate?: string;
  approvedDate?: string;
  pmFeedback?: string;
  deadline?: string;
};

export type PMReviewFormValues = {
  status: "Approved" | "Rejected";
  quality: QualityRating;
  pmFeedback?: string;
};

export type KOCUploadFormValues = {
  title: string;
  description?: string;
  videoUrl?: string;
};
