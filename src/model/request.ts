export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};


export type ApiResponsePage<T> = {
  success: boolean;
  message: string;
  data: [T];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  timestamp: string;
};
