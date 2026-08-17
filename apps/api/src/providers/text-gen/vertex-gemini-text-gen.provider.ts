import {
  type GenerateScriptRequest,
  type GenerateScriptResult,
  type GenerateStoryboardRequest,
  type GenerateStoryboardResult,
  type GenerateTopicsRequest,
  type GenerateTopicsResult,
  type TextGenProvider,
} from '@shared/types';
import { AudioStrategy, ProviderName, SceneMode } from '@shared/types';
import { GenerativeModel, VertexAI } from '@google-cloud/vertexai';
import { ProviderFailedException } from '../../common/exceptions/app.exception.js';

const SYSTEM_PROMPT = `Kamu adalah head writer untuk channel konten sepak bola berformat short video (Reels/Shorts).
Kamu menghasilkan output JSON murni tanpa markdown, tanpa teks lain di luar JSON.
Ikuti style bible channel dengan ketat. Bahasa: Indonesia natural, energik, sesuai gaya channel.
Hook harus kuat di 3 detik pertama. Target durasi harus pas.`;

const JSON_TOPICS_SCHEMA_INSTRUCTIONS = `Output JSON dengan bentuk:
{
  "candidates": [
    { "title": string, "hook": string, "angle": string, "outline": string[] }
  ]
}
Buat ${'${count}'} kandidat topik dengan sudut pandang berbeda.`;

interface TopicCandidateShape {
  title?: unknown;
  hook?: unknown;
  angle?: unknown;
  outline?: unknown;
}

interface TopicsShape {
  candidates?: unknown;
}

interface ScriptShape {
  hook?: unknown;
  narration?: unknown;
  structure?: unknown;
}

interface StoryboardShape {
  scenes?: unknown;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function parseJson(content: string): unknown {
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned) as unknown;
}

export class VertexGeminiTextGenProvider implements TextGenProvider {
  readonly name = ProviderName.VERTEX_GEMINI;
  readonly model: string;

  private readonly modelInstance: GenerativeModel;

  constructor() {
    const project = process.env.GCLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION ?? 'asia-southeast1';
    this.model = process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';
    if (!project) {
      throw new ProviderFailedException(
        'GCLOUD_PROJECT belum diset — isi apps/api/.env untuk memakai Vertex AI (atau biarkan AI_PROVIDER=mock)',
      );
    }
    const vertexAI = new VertexAI({ project, location });
    this.modelInstance = vertexAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });
  }

  async generateTopics(request: GenerateTopicsRequest): Promise<GenerateTopicsResult> {
    const count = request.count ?? 3;
    const prompt = [
      SYSTEM_PROMPT,
      this.styleBibleSection(request),
      `Buat ${count} kandidat topik konten sepak bola${request.seedTopic ? ` berdasarkan seed: "${request.seedTopic}"` : ' (boleh topik umum yang lagi hangat)'}.`,
      JSON_TOPICS_SCHEMA_INSTRUCTIONS,
    ].join('\n\n');

    const content = await this.callModel(prompt);
    const parsed = parseJson(content) as TopicsShape;
    const rawCandidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    const candidates: Array<{ title: string; hook: string; angle: string; outline: string[] }> = [];
    for (const item of rawCandidates) {
      const shape = item as TopicCandidateShape;
      if (!isString(shape.title) || !isString(shape.hook) || !isString(shape.angle)) continue;
      candidates.push({
        title: shape.title,
        hook: shape.hook,
        angle: shape.angle,
        outline: asStringArray(shape.outline),
      });
    }

    if (candidates.length === 0) {
      throw new ProviderFailedException('Provider mengembalikan kandidat topik kosong atau tidak valid');
    }
    return { candidates, provider: this.name, model: this.model };
  }

  async generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResult> {
    const prompt = [
      SYSTEM_PROMPT,
      this.styleBibleSection(request),
      `Topik: "${request.topic.title}"
Hook: "${request.topic.hook}"
Angle: "${request.topic.angle}"
Outline: ${JSON.stringify(request.topic.outline)}
Format: ${request.format} — target durasi ${request.targetSeconds} detik.`,
      `Output JSON:
{
  "hook": string,
  "narration": string (narasi lengkap untuk dibacakan narator, ${request.targetSeconds} detik berbicara),
  "structure": [ { "section": string, "points": string[] } ]
}`,
    ].join('\n\n');

    const content = await this.callModel(prompt);
    const parsed = parseJson(content) as ScriptShape;
    if (!isString(parsed.hook) || !isString(parsed.narration)) {
      throw new ProviderFailedException('Provider mengembalikan script tidak valid');
    }
    return {
      hook: parsed.hook,
      narration: parsed.narration,
      structure: Array.isArray(parsed.structure)
        ? (parsed.structure as unknown[]).map((item) => {
            const section = (item as { section?: unknown }).section;
            const points = asStringArray((item as { points?: unknown }).points);
            return { section: isString(section) ? section : 'Bagian', points };
          })
        : [],
      provider: this.name,
      model: this.model,
    };
  }

  async generateStoryboard(request: GenerateStoryboardRequest): Promise<GenerateStoryboardResult> {
    const prompt = [
      SYSTEM_PROMPT,
      this.styleBibleSection(request),
      `Script:
Hook: "${request.script.hook}"
Narasi: "${request.script.narration}"
Format: ${request.format} — durasi total target ${request.targetSeconds} detik.
Mode scene: ${request.sceneMode} (MULTI_CUT = scene 3-6 detik, LONG_TAKE = satu take hingga 30 detik).`,
      `Output JSON:
{
  "scenes": [
    {
      "narrationText": string (bagian narasi untuk scene ini, boleh kosong jika scene visual-only),
      "visualPrompt": string (deskripsi visual detail untuk image generation, ikuti style bible),
      "onScreenText": string|null (teks overlay pendek, maksimal 8 kata),
      "durationSec": number,
      "effectTag": string|null (contoh: "zoom-in", "slide-up", "ken-burns", "fade", "glitch"),
      "audioStrategy": "NATIVE_AS_SFX" | "NATIVE_ONLY" | "SILENT",
      "sceneMode": "MULTI_CUT" | "LONG_TAKE"
    }
  ]
}
Total durasi semua scene harus mendekati ${request.targetSeconds} detik. Scene pembuka dan penutup boleh tanpa narasi.`,
    ].join('\n\n');

    const content = await this.callModel(prompt);
    const parsed = parseJson(content) as StoryboardShape;
    const rawScenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    const scenes: Array<{
      narrationText: string;
      visualPrompt: string;
      onScreenText: string | null;
      durationSec: number;
      effectTag: string | null;
      audioStrategy: AudioStrategy;
      sceneMode: SceneMode;
    }> = [];
    for (const scene of rawScenes) {
      const shape = scene as {
        narrationText?: unknown;
        visualPrompt?: unknown;
        onScreenText?: unknown;
        durationSec?: unknown;
        effectTag?: unknown;
        audioStrategy?: unknown;
        sceneMode?: unknown;
      };
      if (!isString(shape.narrationText) || !isString(shape.visualPrompt)) continue;
      const duration = typeof shape.durationSec === 'number' && shape.durationSec > 0 ? shape.durationSec : 5;
      scenes.push({
        narrationText: shape.narrationText,
        visualPrompt: shape.visualPrompt,
        onScreenText: isString(shape.onScreenText) ? shape.onScreenText : null,
        durationSec: duration,
        effectTag: isString(shape.effectTag) ? shape.effectTag : null,
        audioStrategy: this.normalizeAudioStrategy(shape.audioStrategy),
        sceneMode: this.normalizeSceneMode(shape.sceneMode),
      });
    }

    if (scenes.length === 0) {
      throw new ProviderFailedException('Provider mengembalikan storyboard kosong atau tidak valid');
    }
    return { scenes, provider: this.name, model: this.model };
  }

  private normalizeAudioStrategy(value: unknown): AudioStrategy {
    if (value === AudioStrategy.NATIVE_ONLY) return AudioStrategy.NATIVE_ONLY;
    if (value === AudioStrategy.SILENT) return AudioStrategy.SILENT;
    return AudioStrategy.NATIVE_AS_SFX;
  }

  private normalizeSceneMode(value: unknown): SceneMode {
    return value === SceneMode.LONG_TAKE ? SceneMode.LONG_TAKE : SceneMode.MULTI_CUT;
  }

  private styleBibleSection(request: { context: { niche: string; targetAudience: string; styleGuide: { name: string; styleType: string; voicePreset: string; pacing: string; musicVibe: string; paletteDescription: string; lockedPromptSuffix: string } } }): string {
    const { niche, targetAudience, styleGuide } = request.context;
    return `STYLE BIBLE CHANNEL "${styleGuide.name}":
- Niche: ${niche}
- Target audience: ${targetAudience}
- Art direction: ${styleGuide.styleType}
- Voice narator: ${styleGuide.voicePreset}
- Pacing: ${styleGuide.pacing}
- Music vibe: ${styleGuide.musicVibe}
- Palet warna: ${styleGuide.paletteDescription}
- Prompt suffix terkunci (wajib untuk visual): ${styleGuide.lockedPromptSuffix}`;
  }

  private async callModel(prompt: string): Promise<string> {
    try {
      const response = await this.modelInstance.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new ProviderFailedException('Provider mengembalikan respons kosong');
      }
      return text;
    } catch (error) {
      if (error instanceof ProviderFailedException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new ProviderFailedException(`Panggilan ke Vertex AI gagal: ${message}`);
    }
  }
}