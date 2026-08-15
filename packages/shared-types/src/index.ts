export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface MasterDataItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  description?: string;
  updatedAt: string;
  updatedBy: string;
}
