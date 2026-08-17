import {
  AutomationLevel,
  type PerStageConfig,
  type GateDecision,
  type ProjectStatus,
  type ReviewSource,
  type StageKey,
} from '../enums/project.enums.js';
import { type PipelineStage } from '../enums/pipeline.enums.js';
import { type AudioStrategy, type SceneMode, type VideoFormat } from '../enums/style.enums.js';
import { type AssetStatus } from '../enums/media.enums.js';

export interface TopicCandidate {
  title: string;
  hook: string;
  angle: string;
  outline: string[];
}

export interface Topic {
  id: string;
  projectId: string;
  title: string;
  hook: string;
  angle: string;
  outline: string[];
  candidates: TopicCandidate[];
  status: Extract<AssetStatus, 'GENERATING' | 'READY' | 'FAILED'>;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptStructure {
  section: string;
  points: string[];
}

export interface Script {
  id: string;
  projectId: string;
  version: number;
  hook: string;
  narration: string;
  structure: ScriptStructure[];
  meta: Record<string, unknown>;
  approvedAt: string | null;
  createdAt: string;
}

export interface Scene {
  id: string;
  projectId: string;
  orderIndex: number;
  narrationText: string;
  visualPrompt: string;
  onScreenText: string | null;
  durationSec: number;
  effectTag: string | null;
  audioStrategy: AudioStrategy;
  sceneMode: SceneMode;
  status: AssetStatus;
  generationMeta: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Storyboard {
  scenes: Scene[];
}

export interface ReviewDecision {
  id: string;
  projectId: string;
  stage: PipelineStage;
  decision: GateDecision;
  notes: string | null;
  source: ReviewSource;
  decidedAt: string;
}

export interface VideoProject {
  id: string;
  channelId: string;
  title: string;
  format: VideoFormat;
  stage: PipelineStage;
  status: ProjectStatus;
  automationLevel: AutomationLevel;
  perStageConfig: PerStageConfig;
  topic: Topic | null;
  script: Script | null;
  scenes: Scene[];
  reviewDecisions: ReviewDecision[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCreateInput = {
  channelId: string;
  title?: string;
  format?: VideoFormat;
  automationLevel?: AutomationLevel;
  perStageConfig?: PerStageConfig;
  seedTopic?: string;
};

export type AutomationUpdateInput = {
  automationLevel: AutomationLevel;
  perStageConfig?: PerStageConfig;
};

export function isAutoModeForStage(
  automationLevel: AutomationLevel,
  perStageConfig: PerStageConfig | undefined,
  stageKey: StageKey,
): boolean {
  if (automationLevel === AutomationLevel.STAGED) return false;
  if (automationLevel === AutomationLevel.AUTO) return stageKey !== 'publish';
  return perStageConfig?.[stageKey] === 'auto';
}