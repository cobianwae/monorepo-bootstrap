export enum ProviderName {
  MOCK = 'MOCK',
  VERTEX_GEMINI = 'VERTEX_GEMINI',
  VERTEX_IMAGEN = 'VERTEX_IMAGEN',
  VERTEX_TTS = 'VERTEX_TTS',
  FAL_SEEDANCE = 'FAL_SEEDANCE',
}

export const PROVIDER_NAME_LABELS: Record<ProviderName, string> = {
  [ProviderName.MOCK]: 'Mock (dev/test)',
  [ProviderName.VERTEX_GEMINI]: 'Vertex AI — Gemini',
  [ProviderName.VERTEX_IMAGEN]: 'Vertex AI — Imagen',
  [ProviderName.VERTEX_TTS]: 'Vertex AI — TTS',
  [ProviderName.FAL_SEEDANCE]: 'fal.ai — Seedance',
};

export enum AssetKind {
  IMAGE = 'IMAGE',
  VIDEO_CLIP = 'VIDEO_CLIP',
  AUDIO_TTS = 'AUDIO_TTS',
  AUDIO_SFX = 'AUDIO_SFX',
  MUSIC = 'MUSIC',
}

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  [AssetKind.IMAGE]: 'Image keyframe',
  [AssetKind.VIDEO_CLIP]: 'Video clip',
  [AssetKind.AUDIO_TTS]: 'Narasi (TTS)',
  [AssetKind.AUDIO_SFX]: 'Sound effect',
  [AssetKind.MUSIC]: 'Music bed',
};

export enum AssetStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.PENDING]: 'Antre',
  [AssetStatus.GENERATING]: 'Generate',
  [AssetStatus.READY]: 'Siap',
  [AssetStatus.FAILED]: 'Gagal',
};