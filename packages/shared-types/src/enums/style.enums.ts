export enum StyleType {
  INFOGRAPHIC = 'INFOGRAPHIC',
  JOURNALISM = 'JOURNALISM',
  ANIMATION = 'ANIMATION',
  CINEMATIC = 'CINEMATIC',
}

export const STYLE_TYPE_LABELS: Record<StyleType, string> = {
  [StyleType.INFOGRAPHIC]: 'Infografis',
  [StyleType.JOURNALISM]: 'Jurnalistik',
  [StyleType.ANIMATION]: 'Animasi',
  [StyleType.CINEMATIC]: 'Sinematik',
};

export const STYLE_TYPE_DESCRIPTIONS: Record<StyleType, string> = {
  [StyleType.INFOGRAPHIC]: 'Data, grafik, dan statistik visual yang jelas',
  [StyleType.JOURNALISM]: 'Reportase tegas, minim hiasan, fokus fakta',
  [StyleType.ANIMATION]: 'Motion graphics, karakter, dan gaya ilustrasi',
  [StyleType.CINEMATIC]: 'Sinematik, dramatic lighting, deep colors',
};

export enum Pacing {
  FAST = 'FAST',
  BALANCED = 'BALANCED',
  SLOW = 'SLOW',
}

export const PACING_LABELS: Record<Pacing, string> = {
  [Pacing.FAST]: 'Cepat & energik',
  [Pacing.BALANCED]: 'Seimbang',
  [Pacing.SLOW]: 'Tenang & berwibawa',
};

export enum AudioStrategy {
  NATIVE_AS_SFX = 'NATIVE_AS_SFX',
  NATIVE_ONLY = 'NATIVE_ONLY',
  SILENT = 'SILENT',
}

export const AUDIO_STRATEGY_LABELS: Record<AudioStrategy, string> = {
  [AudioStrategy.NATIVE_AS_SFX]: 'Audio native sebagai SFX (di-duck di bawah narasi)',
  [AudioStrategy.NATIVE_ONLY]: 'Audio native saja (scene tanpa narasi)',
  [AudioStrategy.SILENT]: 'Sunyi — cukup music bed',
};

export enum SceneMode {
  MULTI_CUT = 'MULTI_CUT',
  LONG_TAKE = 'LONG_TAKE',
}

export const SCENE_MODE_LABELS: Record<SceneMode, string> = {
  [SceneMode.MULTI_CUT]: 'Multi-cut (3-6 detik per scene)',
  [SceneMode.LONG_TAKE]: 'Long-take (hingga 30 detik native)',
};

export enum VideoFormat {
  SHORTS_9_16 = 'SHORTS_9_16',
  YOUTUBE_16_9 = 'YOUTUBE_16_9',
}

export const VIDEO_FORMAT_LABELS: Record<VideoFormat, string> = {
  [VideoFormat.SHORTS_9_16]: 'Shorts/Reels 9:16',
  [VideoFormat.YOUTUBE_16_9]: 'YouTube 16:9',
};

export const VIDEO_FORMAT_DIMENSIONS: Record<VideoFormat, { width: number; height: number }> = {
  [VideoFormat.SHORTS_9_16]: { width: 1080, height: 1920 },
  [VideoFormat.YOUTUBE_16_9]: { width: 1920, height: 1080 },
};