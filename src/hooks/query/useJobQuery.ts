import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import jobService from "../../services/job.service";
import type { RespondJobPayload, SubmitVideoPayload, ReviewVideoPayload } from "../../services/job.service";
import { queryKeys } from "./queryKeys";

type JobListParams = { videoStatus?: string; invitationStatus?: string; page?: number; limit?: number };

export const useJobsQuery = (params?: JobListParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobService.list(params),
    staleTime: 1000 * 60 * 2, // 2 mins
    enabled: options?.enabled,
  });

export const useMyJobsQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.jobs.myJobs(),
    queryFn: () => jobService.myJobs(),
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled,
  });

export const useJobQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobService.get(id),
    enabled: Boolean(id) && enabled,
  });

export const useRespondJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: RespondJobPayload }) =>
      jobService.respond(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

export const useSubmitVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: SubmitVideoPayload }) =>
      jobService.submitVideo(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

export const useReviewVideoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: ReviewVideoPayload }) =>
      jobService.reviewVideo(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};
