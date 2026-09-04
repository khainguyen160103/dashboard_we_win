import type { JobStatus, QualityRating } from "./types";

export const getJobStatusColor = (status: JobStatus): string => {
  switch (status) {
    case "Approved":     return "success";
    case "Pending":      return "warning";
    case "Rejected":     return "error";
    case "NotSubmitted": return "default";
    default:             return "default";
  }
};

export const getJobStatusLabel = (status: JobStatus): string => {
  switch (status) {
    case "Approved":     return "Đã phê duyệt";
    case "Pending":      return "Chờ PM duyệt";
    case "Rejected":     return "Cần sửa lại";
    case "NotSubmitted": return "Chưa nộp video";
    default:             return status;
  }
};

export const getQualityColor = (quality?: QualityRating): string => {
  switch (quality) {
    case "Excellent": return "green";
    case "Good":      return "blue";
    case "Average":   return "orange";
    case "Poor":      return "red";
    default:          return "default";
  }
};

export const getQualityLabel = (quality?: QualityRating): string => {
  switch (quality) {
    case "Excellent": return "Xuất sắc (A+)";
    case "Good":      return "Tốt (A)";
    case "Average":   return "Đạt (B)";
    case "Poor":      return "Cần sửa lại (C)";
    default:          return "Chưa đánh giá";
  }
};
