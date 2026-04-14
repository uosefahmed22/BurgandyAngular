export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  data: T[];
}
