// Common interfaces can be added here
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
