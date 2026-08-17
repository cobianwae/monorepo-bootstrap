import { type ProviderName } from '../enums/media.enums.js';
import { type StyleGuide } from '../domain/channel.types.js';
import { type TopicCandidate } from '../domain/project.types.js';
import { type AudioStrategy, type SceneMode, type VideoFormat } from '../enums/style.enums.js';

export interface StyleBibleContext {
  niche: string;
  targetAudience: string;
  styleGuide: StyleGuide;
}

export interface GenerateTopicsRequest {
  context: StyleBibleContext;
  seedTopic?: string;
  count?: number;
}

export interface GenerateScriptRequest {
  context: StyleBibleContext;
  topic: { title: string; hook: string; angle: string; outline: string[] };
  format: VideoFormat;
  targetSeconds: number;
}

export interface GenerateStoryboardRequest {
  context: StyleBibleContext;
  script: { hook: string; narration: string; structure: { section: string; points: string[] }[] };
  format: VideoFormat;
  sceneMode: SceneMode;
  targetSeconds: number;
}

export interface StoryboardSceneDraft {
  narrationText: string;
  visualPrompt: string;
  onScreenText: string | null;
  durationSec: number;
  effectTag: string | null;
  audioStrategy: AudioStrategy;
  sceneMode: SceneMode;
}

export interface GenerateTopicsResult {
  candidates: TopicCandidate[];
  provider: ProviderName;
  model: string;
}

export interface GenerateScriptResult {
  hook: string;
  narration: string;
  structure: { section: string; points: string[] }[];
  provider: ProviderName;
  model: string;
}

export interface GenerateStoryboardResult {
  scenes: StoryboardSceneDraft[];
  provider: ProviderName;
  model: string;
}

export interface TextGenProvider {
  readonly name: ProviderName;
  readonly model: string;
  generateTopics(request: GenerateTopicsRequest): Promise<GenerateTopicsResult>;
  generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResult>;
  generateStoryboard(request: GenerateStoryboardRequest): Promise<GenerateStoryboardResult>;
}

export interface GenerateImageRequest {
  prompt: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  referenceImageUrls?: string[];
  seed?: number;
}

export interface ImageGenResult {
  url: string;
  provider: ProviderName;
  model: string;
  seed: number | null;
  mimeType: string | null;
}

export interface ImageGenProvider {
  readonly name: ProviderName;
  readonly model: string;
  generateImage(request: GenerateImageRequest): Promise<ImageGenResult>;
}

export interface GenerateVideoRequest {
  imageUrl: string;
  prompt: string;
  durationSec: number;
  audioEnabled: boolean;
  seed?: number;
}

export interface VideoGenResult {
  videoUrl: string;
  provider: ProviderName;
  model: string;
  hasNativeAudio: boolean;
  durationSec: number;
  seed: number | null;
}

export interface VideoGenProvider {
  readonly name: ProviderName;
  readonly model: string;
  generateVideo(request: GenerateVideoRequest): Promise<VideoGenResult>;
}

export interface GenerateTtsRequest {
  text: string;
  voice: string;
  languageCode?: string;
}

export interface TtsGenResult {
  audioUrl: string;
  provider: ProviderName;
  model: string;
  durationSec: number;
  mimeType: string | null;
}

export interface TtsProvider {
  readonly name: ProviderName;
  readonly model: string;
  generateSpeech(request: GenerateTtsRequest): Promise<TtsGenResult>;
}