import {
  type SocialAccountStatus,
  type SocialPlatform,
  type PublicationStatus,
} from '../enums/publish.enums.js';

export interface SocialAccount {
  id: string;
  channelId: string;
  platform: SocialPlatform;
  displayName: string;
  externalId: string | null;
  status: SocialAccountStatus;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  projectId: string;
  socialAccountId: string | null;
  platform: SocialPlatform;
  status: PublicationStatus;
  title: string;
  description: string;
  tags: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  remoteId: string | null;
  permalink: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}