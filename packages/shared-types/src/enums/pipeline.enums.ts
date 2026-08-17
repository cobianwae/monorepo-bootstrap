export enum PipelineStage {
  TOPIC = 'TOPIC',
  SCRIPT = 'SCRIPT',
  STORYBOARD = 'STORYBOARD',
  ASSETS = 'ASSETS',
  RENDER = 'RENDER',
  PUBLISH = 'PUBLISH',
}

export const PIPELINE_STAGE_ORDER: readonly PipelineStage[] = [
  PipelineStage.TOPIC,
  PipelineStage.SCRIPT,
  PipelineStage.STORYBOARD,
  PipelineStage.ASSETS,
  PipelineStage.RENDER,
  PipelineStage.PUBLISH,
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.TOPIC]: 'Topik',
  [PipelineStage.SCRIPT]: 'Script',
  [PipelineStage.STORYBOARD]: 'Storyboard',
  [PipelineStage.ASSETS]: 'Assets',
  [PipelineStage.RENDER]: 'Render',
  [PipelineStage.PUBLISH]: 'Publish',
};

export const PIPELINE_STAGE_DESCRIPTIONS: Record<PipelineStage, string> = {
  [PipelineStage.TOPIC]: 'Ide topik, hook, dan angle',
  [PipelineStage.SCRIPT]: 'Narasi lengkap per target durasi',
  [PipelineStage.STORYBOARD]: 'Pemecahan scene: visual, teks, audio',
  [PipelineStage.ASSETS]: 'Generate image, video, dan narasi',
  [PipelineStage.RENDER]: 'Composite, efek, subtitle, music',
  [PipelineStage.PUBLISH]: 'Upload atau jadwalkan ke sosmed',
};

export function isPipelineStage(value: unknown): value is PipelineStage {
  return typeof value === 'string' && PIPELINE_STAGE_ORDER.includes(value as PipelineStage);
}

export function nextStage(stage: PipelineStage): PipelineStage | null {
  const index = PIPELINE_STAGE_ORDER.indexOf(stage);
  return index >= 0 && index < PIPELINE_STAGE_ORDER.length - 1
    ? PIPELINE_STAGE_ORDER[index + 1]
    : null;
}

export function previousStage(stage: PipelineStage): PipelineStage | null {
  const index = PIPELINE_STAGE_ORDER.indexOf(stage);
  return index > 0 ? PIPELINE_STAGE_ORDER[index - 1] : null;
}