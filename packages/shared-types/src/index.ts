export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  editor: 'Content Editor',
  viewer: 'Read-only Viewer',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending Approval',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  status: UserStatus;
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

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
  details?: string[] | ApiErrorDetail[];
  errors?: Record<string, string[]>;
  timestamp?: string;
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

// Navigation & Layout Types
export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  badge?: string;
  badgeVariant?: 'default' | 'highlight' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  disabled?: boolean;
  external?: boolean;
  description?: string;
  items?: NavItem[];
}

export interface MegaMenuFeaturedItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
}

export interface MegaMenuSection {
  title?: string;
  items: NavItem[];
}

export interface MegaMenuColumn {
  title: string;
  sections?: MegaMenuSection[];
  items?: NavItem[];
  featured?: MegaMenuFeaturedItem;
}

export interface FooterLinkItem {
  title: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface SocialLinkItem {
  platform: 'github' | 'twitter' | 'discord' | 'linkedin' | 'youtube' | 'instagram';
  href: string;
  label?: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}


// Type Guards
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    'role' in obj
  );
}

export function isApiResponse<T = unknown>(obj: unknown): obj is ApiResponse<T> {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
}
