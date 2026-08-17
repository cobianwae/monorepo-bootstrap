export enum AutomationLevel {
  STAGED = 'STAGED',
  HYBRID = 'HYBRID',
  AUTO = 'AUTO',
}

export const AUTOMATION_LEVEL_LABELS: Record<AutomationLevel, string> = {
  [AutomationLevel.STAGED]: 'Staged — review di tiap stage',
  [AutomationLevel.HYBRID]: 'Hybrid — per-stage',
  [AutomationLevel.AUTO]: 'Auto — full autopilot (publish tetap manual)',
};

export const AUTOMATION_LEVEL_DESCRIPTIONS: Record<AutomationLevel, string> = {
  [AutomationLevel.STAGED]: 'Setiap stage menunggu approval manual.',
  [AutomationLevel.HYBRID]: 'Setiap stage punya mode auto/review sendiri.',
  [AutomationLevel.AUTO]: 'Semua stage auto-approve. Stage PUBLISH selalu manual.',
};

export type StageControlMode = 'auto' | 'review';

export type PerStageConfig = Partial<Record<StageKey, StageControlMode>>;

export type StageKey = 'topic' | 'script' | 'storyboard' | 'assets' | 'render' | 'publish';

export const STAGE_KEYS: readonly StageKey[] = [
  'topic',
  'script',
  'storyboard',
  'assets',
  'render',
  'publish',
];

export enum GateDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export const GATE_DECISION_LABELS: Record<GateDecision, string> = {
  [GateDecision.APPROVE]: 'Approve',
  [GateDecision.REJECT]: 'Reject',
};

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
  ERROR = 'ERROR',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.PAUSED]: 'Paused',
  [ProjectStatus.ARCHIVED]: 'Archived',
  [ProjectStatus.ERROR]: 'Error',
};

export enum ReviewSource {
  HUMAN = 'HUMAN',
  AUTOMATION = 'AUTOMATION',
}

export const REVIEW_SOURCE_LABELS: Record<ReviewSource, string> = {
  [ReviewSource.HUMAN]: 'Manual review',
  [ReviewSource.AUTOMATION]: 'Auto gate',
};