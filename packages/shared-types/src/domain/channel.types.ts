import { type StyleType, type Pacing } from '../enums/style.enums.js';

export interface StyleGuide {
  id: string;
  channelId: string;
  name: string;
  styleType: StyleType;
  voicePreset: string;
  pacing: Pacing;
  musicVibe: string;
  paletteDescription: string;
  lockedPromptSuffix: string;
  referenceImageUrls: string[];
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type StyleGuideInput = Omit<
  StyleGuide,
  'id' | 'channelId' | 'lockedPromptSuffix' | 'createdAt' | 'updatedAt'
>;

export interface Channel {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  styleGuide: StyleGuide | null;
  createdAt: string;
  updatedAt: string;
}

export type ChannelCreateInput = {
  name: string;
  niche: string;
  targetAudience?: string;
  styleGuide?: StyleGuideInput;
};