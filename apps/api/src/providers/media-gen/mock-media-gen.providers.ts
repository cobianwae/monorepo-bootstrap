import {
  type GenerateImageRequest,
  type GenerateVideoRequest,
  type GenerateTtsRequest,
  type ImageGenProvider,
  type VideoGenProvider,
  type TtsProvider,
  type ImageGenResult,
  type VideoGenResult,
  type TtsGenResult,
} from '@shared/types';
import { ProviderName } from '@shared/types';
import { NotImplementedException } from '../../common/exceptions/app.exception.js';

export class MockImageGenProvider implements ImageGenProvider {
  readonly name = ProviderName.MOCK;
  readonly model = 'mock-image-1';

  async generateImage(request: GenerateImageRequest): Promise<ImageGenResult> {
    void request;
    throw new NotImplementedException('Image generation hadir di Phase 2 (asset generation)');
  }
}

export class MockVideoGenProvider implements VideoGenProvider {
  readonly name = ProviderName.MOCK;
  readonly model = 'mock-video-1';

  async generateVideo(request: GenerateVideoRequest): Promise<VideoGenResult> {
    void request;
    throw new NotImplementedException('Video generation hadir di Phase 2 (asset generation)');
  }
}

export class MockTtsProvider implements TtsProvider {
  readonly name = ProviderName.MOCK;
  readonly model = 'mock-tts-1';

  async generateSpeech(request: GenerateTtsRequest): Promise<TtsGenResult> {
    void request;
    throw new NotImplementedException('TTS generation hadir di Phase 2 (asset generation)');
  }
}