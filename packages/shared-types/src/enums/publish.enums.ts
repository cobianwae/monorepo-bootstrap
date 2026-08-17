export enum SocialPlatform {
  YOUTUBE_SHORTS = 'YOUTUBE_SHORTS',
  INSTAGRAM_REELS = 'INSTAGRAM_REELS',
  TIKTOK = 'TIKTOK',
}

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  [SocialPlatform.YOUTUBE_SHORTS]: 'YouTube Shorts',
  [SocialPlatform.INSTAGRAM_REELS]: 'Instagram Reels',
  [SocialPlatform.TIKTOK]: 'TikTok',
};

export enum SocialAccountStatus {
  CONNECTED = 'CONNECTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export const SOCIAL_ACCOUNT_STATUS_LABELS: Record<SocialAccountStatus, string> = {
  [SocialAccountStatus.CONNECTED]: 'Terhubung',
  [SocialAccountStatus.EXPIRED]: 'Token expired',
  [SocialAccountStatus.REVOKED]: 'Dicabut',
};

export enum PublicationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  [PublicationStatus.DRAFT]: 'Draft',
  [PublicationStatus.SCHEDULED]: 'Terjadwal',
  [PublicationStatus.PUBLISHING]: 'Mengupload',
  [PublicationStatus.PUBLISHED]: 'Tayang',
  [PublicationStatus.FAILED]: 'Gagal',
};

export enum RenderJobStatus {
  QUEUED = 'QUEUED',
  RENDERING = 'RENDERING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export const RENDER_JOB_STATUS_LABELS: Record<RenderJobStatus, string> = {
  [RenderJobStatus.QUEUED]: 'Antre',
  [RenderJobStatus.RENDERING]: 'Render',
  [RenderJobStatus.DONE]: 'Selesai',
  [RenderJobStatus.FAILED]: 'Gagal',
};