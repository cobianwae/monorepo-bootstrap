import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type TextGenProvider } from '@shared/types';
import { ProviderName } from '@shared/types';
import { MockTextGenProvider } from './text-gen/mock-text-gen.provider.js';
import { VertexGeminiTextGenProvider } from './text-gen/vertex-gemini-text-gen.provider.js';
import { MockImageGenProvider, MockVideoGenProvider, MockTtsProvider } from './media-gen/mock-media-gen.providers.js';
import { IMAGE_GEN_PROVIDER, TEXT_GEN_PROVIDER, TTS_PROVIDER, VIDEO_GEN_PROVIDER } from './tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: TEXT_GEN_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): TextGenProvider => {
        const mode = config.get<string>('AI_PROVIDER', 'mock');
        if (mode === 'vertex') {
          return new VertexGeminiTextGenProvider();
        }
        return new MockTextGenProvider();
      },
    },
    {
      provide: IMAGE_GEN_PROVIDER,
      useFactory: () => new MockImageGenProvider(),
    },
    {
      provide: VIDEO_GEN_PROVIDER,
      useFactory: () => new MockVideoGenProvider(),
    },
    {
      provide: TTS_PROVIDER,
      useFactory: () => new MockTtsProvider(),
    },
  ],
  exports: [TEXT_GEN_PROVIDER, IMAGE_GEN_PROVIDER, VIDEO_GEN_PROVIDER, TTS_PROVIDER],
})
export class ProvidersModule {}

export { TEXT_GEN_PROVIDER, IMAGE_GEN_PROVIDER, VIDEO_GEN_PROVIDER, TTS_PROVIDER } from './tokens.js';
export type { TextGenProvider } from '@shared/types';
export const PROVIDER_NAMES = ProviderName;