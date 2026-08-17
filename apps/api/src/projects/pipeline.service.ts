import { Injectable, Inject } from '@nestjs/common';
import {
  AutomationLevel,
  PipelineStage as PipelineStageEnum,
  type GateDecision,
  type PipelineStage,
  GateDecision as GateDecisionEnum,
  nextStage,
  SceneMode,
  type StageKey,
  type StyleGuide,
  type TextGenProvider,
  VideoFormat,
  isAutoModeForStage,
  PIPELINE_STAGE_ORDER,
} from '@shared/types';
import { type $Enums, type PrismaClient } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from '../prisma/tokens.js';
import { TEXT_GEN_PROVIDER } from '../providers/tokens.js';
import {
  ArtifactMissingException,
  InvalidStageException,
  ResourceNotFoundException,
} from '../common/exceptions/app.exception.js';
import { asRecord, asStringArray, jsonValue } from '../common/utils/json.js';

const STAGE_KEY: Record<PipelineStage, StageKey> = {
  TOPIC: 'topic',
  SCRIPT: 'script',
  STORYBOARD: 'storyboard',
  ASSETS: 'assets',
  RENDER: 'render',
  PUBLISH: 'publish',
};

const PRISMA_STAGE: Record<PipelineStage, PipelineStage> = {
  TOPIC: PipelineStageEnum.TOPIC,
  SCRIPT: PipelineStageEnum.SCRIPT,
  STORYBOARD: PipelineStageEnum.STORYBOARD,
  ASSETS: PipelineStageEnum.ASSETS,
  RENDER: PipelineStageEnum.RENDER,
  PUBLISH: PipelineStageEnum.PUBLISH,
};

type ProjectWithRelations = {
  id: string;
  stage: string;
  status: string;
  automationLevel: string;
  perStageConfig: unknown;
  channel: {
    id: string;
    name: string;
    niche: string;
    targetAudience: string;
    styleGuide: {
      id: string;
      channelId: string;
      name: string;
      styleType: string;
      voicePreset: string;
      pacing: string;
      musicVibe: string;
      paletteDescription: string;
      lockedPromptSuffix: string;
      referenceImageUrls: unknown;
      meta: unknown;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  };
};

@Injectable()
export class PipelineService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    @Inject(TEXT_GEN_PROVIDER) private readonly textGenProvider: TextGenProvider,
  ) {}

  async generateTopics(projectId: string, seedTopic?: string) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.TOPIC);
    const styleGuide = this.requireStyleGuide(project);

    const result = await this.textGenProvider.generateTopics({
      context: this.buildContext(project, styleGuide),
      seedTopic,
      count: 3,
    });

    const candidates = result.candidates;
    await this.prisma.topic.upsert({
      where: { projectId },
      create: {
        projectId,
        title: candidates[0]?.title ?? '',
        hook: candidates[0]?.hook ?? '',
        angle: candidates[0]?.angle ?? '',
        outline: jsonValue(candidates[0]?.outline ?? []),
        candidates: jsonValue({ candidates }),
        status: 'READY',
      },
      update: {
        title: candidates[0]?.title ?? '',
        hook: candidates[0]?.hook ?? '',
        angle: candidates[0]?.angle ?? '',
        outline: jsonValue(candidates[0]?.outline ?? []),
        candidates: jsonValue({ candidates }),
        status: 'READY',
      },
    });

    if (this.isAutoMode(project, PRISMA_STAGE.TOPIC)) {
      await this.selectTopic(projectId, 0, undefined, true);
    }

    return { candidates, provider: result.provider, model: result.model };
  }

  async selectTopic(projectId: string, candidateIndex: number, notes?: string, automated = false) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.TOPIC);
    const topic = await this.prisma.topic.findUnique({ where: { projectId } });
    if (!topic) {
      throw new ArtifactMissingException('Generate topik dulu sebelum memilih kandidat');
    }
    const candidates = asRecord(topic.candidates);
    const rawList = Array.isArray(candidates.candidates) ? candidates.candidates : [];
    const candidate = rawList[candidateIndex];
    if (!candidate || typeof candidate !== 'object') {
      throw new ArtifactMissingException(`Kandidat topik index ${candidateIndex} tidak ditemukan`);
    }
    const shape = candidate as { title?: unknown; hook?: unknown; angle?: unknown; outline?: unknown };
    if (typeof shape.title !== 'string' || typeof shape.hook !== 'string' || typeof shape.angle !== 'string') {
      throw new ArtifactMissingException('Kandidat topik tidak valid');
    }

    await this.prisma.topic.update({
      where: { projectId },
      data: {
        title: shape.title,
        hook: shape.hook,
        angle: shape.angle,
        outline: jsonValue(asStringArray(shape.outline)),
        status: 'READY',
      },
    });

    await this.recordAndAdvance(projectId, PRISMA_STAGE.TOPIC, GateDecisionEnum.APPROVE, notes, automated);
  }

  async generateScript(projectId: string) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.SCRIPT);
    const styleGuide = this.requireStyleGuide(project);
    const topic = await this.prisma.topic.findUnique({ where: { projectId } });
    if (!topic || !topic.title) {
      throw new ArtifactMissingException('Topik harus dipilih dan disetujui sebelum generate script');
    }

    const targetSeconds = 45;
    const result = await this.textGenProvider.generateScript({
      context: this.buildContext(project, styleGuide),
      topic: {
        title: topic.title,
        hook: topic.hook,
        angle: topic.angle,
        outline: asStringArray(topic.outline),
      },
      format: VideoFormat.SHORTS_9_16,
      targetSeconds,
    });

    const latest = await this.prisma.script.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    await this.prisma.script.create({
      data: {
        projectId,
        version: nextVersion,
        hook: result.hook,
        narration: result.narration,
        structure: jsonValue(result.structure),
        meta: jsonValue({ provider: result.provider, model: result.model, targetSeconds }),
      },
    });

    if (this.isAutoMode(project, PRISMA_STAGE.SCRIPT)) {
      await this.approveScript(projectId, undefined, true);
    }

    return { script: { hook: result.hook, narration: result.narration, structure: result.structure, version: nextVersion }, provider: result.provider, model: result.model };
  }

  async updateScript(projectId: string, dto: { hook?: string; narration?: string; structure?: unknown }) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.SCRIPT);
    const latest = await this.prisma.script.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    if (!latest) {
      throw new ArtifactMissingException('Generate script dulu sebelum mengedit');
    }

    const currentStructure = Array.isArray(latest.structure) ? latest.structure : [];
    const updated = await this.prisma.script.create({
      data: {
        projectId,
        version: latest.version + 1,
        hook: dto.hook ?? latest.hook,
        narration: dto.narration ?? latest.narration,
        structure: dto.structure !== undefined ? jsonValue(dto.structure) : jsonValue(currentStructure),
        meta: jsonValue(latest.meta),
      },
    });
    return updated;
  }

  async approveScript(projectId: string, notes?: string, automated = false) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.SCRIPT);
    const latest = await this.prisma.script.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });
    if (!latest) {
      throw new ArtifactMissingException('Script belum di-generate');
    }
    await this.prisma.script.update({ where: { id: latest.id }, data: { approvedAt: new Date() } });
    await this.recordAndAdvance(projectId, PRISMA_STAGE.SCRIPT, GateDecisionEnum.APPROVE, notes, automated);
  }

  async generateStoryboard(projectId: string) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.STORYBOARD);
    const styleGuide = this.requireStyleGuide(project);
    const script = await this.prisma.script.findFirst({
      where: { projectId, approvedAt: { not: null } },
      orderBy: { version: 'desc' },
    });
    if (!script) {
      throw new ArtifactMissingException('Script harus di-approve sebelum generate storyboard');
    }

    const targetSeconds = 45;
    const result = await this.textGenProvider.generateStoryboard({
      context: this.buildContext(project, styleGuide),
      script: {
        hook: script.hook,
        narration: script.narration,
        structure: Array.isArray(script.structure)
          ? (script.structure as unknown[]).map((item) => {
              const shape = item as { section?: unknown; points?: unknown };
              return {
                section: typeof shape.section === 'string' ? shape.section : 'Bagian',
                points: asStringArray(shape.points),
              };
            })
          : [],
      },
      format: VideoFormat.SHORTS_9_16,
      sceneMode: SceneMode.MULTI_CUT,
      targetSeconds,
    });

    await this.prisma.$transaction([
      this.prisma.scene.deleteMany({ where: { projectId } }),
      this.prisma.scene.createMany({
        data: result.scenes.map((scene, index) => ({
          projectId,
          orderIndex: index,
          narrationText: scene.narrationText,
          visualPrompt: scene.visualPrompt,
          onScreenText: scene.onScreenText,
          durationSec: scene.durationSec,
          effectTag: scene.effectTag,
          audioStrategy: scene.audioStrategy,
          sceneMode: scene.sceneMode,
          status: 'PENDING',
          generationMeta: jsonValue({ provider: result.provider, model: result.model }),
        })),
      }),
    ]);

    if (this.isAutoMode(project, PRISMA_STAGE.STORYBOARD)) {
      await this.approveStoryboard(projectId, undefined, true);
    }

    return { sceneCount: result.scenes.length, provider: result.provider, model: result.model };
  }

  async updateScene(projectId: string, sceneId: string, dto: {
    narrationText?: string;
    visualPrompt?: string;
    onScreenText?: string | null;
    durationSec?: number;
    effectTag?: string | null;
    audioStrategy?: string;
    sceneMode?: string;
  }) {
    const scene = await this.prisma.scene.findFirst({ where: { id: sceneId, projectId } });
    if (!scene) {
      throw new ResourceNotFoundException('Scene', sceneId);
    }
    return this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(dto.narrationText !== undefined ? { narrationText: dto.narrationText } : {}),
        ...(dto.visualPrompt !== undefined ? { visualPrompt: dto.visualPrompt } : {}),
        ...(dto.onScreenText !== undefined ? { onScreenText: dto.onScreenText } : {}),
        ...(dto.durationSec !== undefined ? { durationSec: dto.durationSec } : {}),
        ...(dto.effectTag !== undefined ? { effectTag: dto.effectTag } : {}),
        ...(dto.audioStrategy !== undefined ? { audioStrategy: dto.audioStrategy as unknown as 'NATIVE_AS_SFX' | 'NATIVE_ONLY' | 'SILENT' } : {}),
        ...(dto.sceneMode !== undefined ? { sceneMode: dto.sceneMode as unknown as 'MULTI_CUT' | 'LONG_TAKE' } : {}),
      },
    });
  }

  async approveStoryboard(projectId: string, notes?: string, automated = false) {
    const project = await this.getProject(projectId);
    this.assertStage(project, PRISMA_STAGE.STORYBOARD);
    const sceneCount = await this.prisma.scene.count({ where: { projectId } });
    if (sceneCount === 0) {
      throw new ArtifactMissingException('Storyboard belum di-generate');
    }
    await this.recordAndAdvance(projectId, PRISMA_STAGE.STORYBOARD, GateDecisionEnum.APPROVE, notes, automated);
  }

  async approveStage(projectId: string, stage: PipelineStage, notes?: string) {
    const project = await this.getProject(projectId);
    this.assertStage(project, stage);
    await this.assertArtifacts(projectId, stage);
    await this.recordAndAdvance(projectId, stage, GateDecisionEnum.APPROVE, notes, false);
  }

  async rejectStage(projectId: string, stage: PipelineStage, notes?: string) {
    const project = await this.getProject(projectId);
    this.assertStage(project, stage);
    await this.prisma.reviewDecision.create({
      data: {
        projectId,
        stage: stage as unknown as $Enums.PipelineStage,
        decision: GateDecisionEnum.REJECT as unknown as $Enums.GateDecision,
        notes: notes ?? null,
        source: 'HUMAN',
      },
    });
  }

  async updateAutomation(projectId: string, dto: { automationLevel: AutomationLevel; perStageConfig?: Record<string, 'auto' | 'review'> }) {
    const project = await this.prisma.videoProject.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new ResourceNotFoundException('Project', projectId);
    }
    return this.prisma.videoProject.update({
      where: { id: projectId },
      data: {
        automationLevel: dto.automationLevel as unknown as $Enums.AutomationLevel,
        perStageConfig: jsonValue(dto.perStageConfig ?? {}),
      },
    });
  }

  private async recordAndAdvance(
    projectId: string,
    stage: PipelineStage,
    decision: GateDecision,
    notes?: string,
    automated = false,
  ) {
    await this.prisma.reviewDecision.create({
      data: {
        projectId,
        stage: stage as unknown as $Enums.PipelineStage,
        decision: decision as unknown as $Enums.GateDecision,
        notes: notes ?? null,
        source: automated ? 'AUTOMATION' : 'HUMAN',
      },
    });
    if (decision === GateDecisionEnum.APPROVE) {
      const project = await this.getProject(projectId);
      const next = nextStage(project.stage as PipelineStage);
      if (next) {
        await this.prisma.videoProject.update({ where: { id: projectId }, data: { stage: next } });
      }
    }
  }

  private async assertArtifacts(projectId: string, stage: string) {
    if (stage === PRISMA_STAGE.TOPIC) {
      const topic = await this.prisma.topic.findUnique({ where: { projectId } });
      if (!topic || !topic.title) {
        throw new ArtifactMissingException('Topik belum dipilih');
      }
    }
    if (stage === PRISMA_STAGE.SCRIPT) {
      const script = await this.prisma.script.findFirst({ where: { projectId, approvedAt: { not: null } } });
      if (!script) {
        throw new ArtifactMissingException('Script belum di-approve');
      }
    }
    if (stage === PRISMA_STAGE.STORYBOARD) {
      const count = await this.prisma.scene.count({ where: { projectId } });
      if (count === 0) {
        throw new ArtifactMissingException('Storyboard belum di-generate');
      }
    }
  }

  private async getProject(projectId: string): Promise<ProjectWithRelations> {
    const project = await this.prisma.videoProject.findUnique({
      where: { id: projectId },
      include: { channel: { include: { styleGuide: true } } },
    });
    if (!project) {
      throw new ResourceNotFoundException('Project', projectId);
    }
    return project as unknown as ProjectWithRelations;
  }

  private assertStage(project: ProjectWithRelations, stage: string) {
    if (project.stage !== stage) {
      throw new InvalidStageException(
        `Project berada di stage ${project.stage}, operasi ini membutuhkan stage ${stage}`,
      );
    }
  }

  private requireStyleGuide(project: ProjectWithRelations): StyleGuide {
    const guide = project.channel.styleGuide;
    if (!guide) {
      throw new ArtifactMissingException('Channel belum punya style guide — buat art direction dulu');
    }
    return {
      id: guide.id,
      channelId: guide.channelId,
      name: guide.name,
      styleType: guide.styleType as StyleGuide['styleType'],
      voicePreset: guide.voicePreset,
      pacing: guide.pacing as StyleGuide['pacing'],
      musicVibe: guide.musicVibe,
      paletteDescription: guide.paletteDescription,
      lockedPromptSuffix: guide.lockedPromptSuffix,
      referenceImageUrls: asStringArray(guide.referenceImageUrls),
      meta: asRecord(guide.meta),
      createdAt: guide.createdAt.toISOString(),
      updatedAt: guide.updatedAt.toISOString(),
    };
  }

  private buildContext(project: ProjectWithRelations, styleGuide: StyleGuide) {
    return {
      niche: project.channel.niche,
      targetAudience: project.channel.targetAudience,
      styleGuide,
    };
  }

  private isAutoMode(project: ProjectWithRelations, stage: PipelineStage | string): boolean {
    const level = project.automationLevel as AutomationLevel;
    return isAutoModeForStage(level, asRecord(project.perStageConfig) as Record<string, 'auto' | 'review'>, STAGE_KEY[stage as PipelineStage]);
  }
}

export { STAGE_KEY, PRISMA_STAGE, PIPELINE_STAGE_ORDER };