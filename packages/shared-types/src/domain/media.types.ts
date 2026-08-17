import { type AssetKind, type AssetStatus, type ProviderName } from '../enums/media.enums.js';
import { type RenderJobStatus } from '../enums/publish.enums.js';

export interface Asset {
  id: string;
  projectId: string;
  sceneId: string | null;
  kind: AssetKind;
  provider: ProviderName;
  providerJobId: string | null;
  url: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: AssetStatus;
  meta: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderJobStatus;
  format: string;
  outputUrl: string | null;
  durationSec: number | null;
  errorMessage: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}