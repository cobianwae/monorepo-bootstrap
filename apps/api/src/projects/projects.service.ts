import { Inject, Injectable } from '@nestjs/common';
import type {
  Asset,
  PipelineStage,
  ReviewDecision,
  Scene,
  Script,
  Topic,
  VideoProject,
} from '@shared/types';
import { type Prisma, type PrismaClient } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from '../prisma/tokens.js';
import { ResourceNotFoundException } from '../common/exceptions/app.exception.js';
import { asRecord, asStringArray } from '../common/utils/json.js';
import { type CreateProjectDto } from './dto/projects.dto.js';

type ProjectRow = {
  id: string;
  channelId: string;
  title: string;
  format: string;
  stage: string;
  status: string;
  automationLevel: string;
  perStageConfig: unknown;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  topic: {
    id: string;
    projectId: string;
    title: string;
    hook: string;
    angle: string;
    outline: unknown;
    candidates: unknown;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  scripts: {
    id: string;
    projectId: string;
    version: number;
    hook: string;
    narration: string;
    structure: unknown;
    meta: unknown;
    approvedAt: Date | null;
    createdAt: Date;
  }[];
  scenes: {
    id: string;
    projectId: string;
    orderIndex: number;
    narrationText: string;
    visualPrompt: string;
    onScreenText: string | null;
    durationSec: number;
    effectTag: string | null;
    audioStrategy: string;
    sceneMode: string;
    status: string;
    generationMeta: unknown;
    createdAt: Date;
    updatedAt: Date;
  }[];
  reviewDecisions: {
    id: string;
    projectId: string;
    stage: string;
    decision: string;
    notes: string | null;
    source: string;
    decidedAt: Date;
    createdAt: Date;
  }[];
  assets: Asset[];
};

@Injectable()
export class ProjectsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(dto: CreateProjectDto): Promise<VideoProject> {
    const channel = await this.prisma.channel.findUnique({ where: { id: dto.channelId } });
    if (!channel || channel.deletedAt) {
      throw new ResourceNotFoundException('Channel', dto.channelId);
    }
    const title =
      dto.title ??
      (dto.seedTopic ? `Project: ${dto.seedTopic.slice(0, 80)}` : 'Project baru');
    const project = await this.prisma.videoProject.create({
      data: {
        channelId: dto.channelId,
        title,
        format: dto.format ?? 'SHORTS_9_16',
        automationLevel: dto.automationLevel ?? 'STAGED',
        perStageConfig: dto.perStageConfig ?? {},
      },
    });
    return this.findOne(project.id);
  }

  async findAll(): Promise<VideoProject[]> {
    const projects = await this.prisma.videoProject.findMany({
      where: { deletedAt: null },
      include: this.projectInclude(),
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map((project: unknown) => this.toProject(project as ProjectRow));
  }

  async findOne(id: string): Promise<VideoProject> {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
      include: this.projectInclude(),
    });
    if (!project || project.deletedAt) {
      throw new ResourceNotFoundException('Project', id);
    }
    return this.toProject(project as unknown as ProjectRow);
  }

  private projectInclude(): Prisma.VideoProjectInclude {
    return {
      topic: true,
      scripts: { orderBy: { version: 'desc' } },
      scenes: { orderBy: { orderIndex: 'asc' } },
      reviewDecisions: { orderBy: { decidedAt: 'desc' } },
      assets: true,
    };
  }

  private toProject(project: ProjectRow): VideoProject {
    const perStageConfig = asRecord(project.perStageConfig);
    const safeConfig: VideoProject['perStageConfig'] = {};
    for (const [key, value] of Object.entries(perStageConfig)) {
      if (value === 'auto' || value === 'review') {
        safeConfig[key as keyof VideoProject['perStageConfig']] = value;
      }
    }

    const topic: Topic | null = project.topic
      ? {
          id: project.topic.id,
          projectId: project.topic.projectId,
          title: project.topic.title,
          hook: project.topic.hook,
          angle: project.topic.angle,
          outline: asStringArray(project.topic.outline),
          candidates: Array.isArray(project.topic.candidates)
            ? (project.topic.candidates as unknown[]).map((candidate) => {
                const shape = candidate as { title?: unknown; hook?: unknown; angle?: unknown; outline?: unknown };
                return {
                  title: typeof shape.title === 'string' ? shape.title : '',
                  hook: typeof shape.hook === 'string' ? shape.hook : '',
                  angle: typeof shape.angle === 'string' ? shape.angle : '',
                  outline: asStringArray(shape.outline),
                };
              })
            : [],
          status: project.topic.status as Topic['status'],
          createdAt: project.topic.createdAt.toISOString(),
          updatedAt: project.topic.updatedAt.toISOString(),
        }
      : null;

    const script: Script | null = project.scripts[0]
      ? {
          id: project.scripts[0].id,
          projectId: project.scripts[0].projectId,
          version: project.scripts[0].version,
          hook: project.scripts[0].hook,
          narration: project.scripts[0].narration,
          structure: Array.isArray(project.scripts[0].structure)
            ? (project.scripts[0].structure as unknown[]).map((item) => {
                const shape = item as { section?: unknown; points?: unknown };
                return {
                  section: typeof shape.section === 'string' ? shape.section : 'Bagian',
                  points: asStringArray(shape.points),
                };
              })
            : [],
          meta: asRecord(project.scripts[0].meta),
          approvedAt: project.scripts[0].approvedAt?.toISOString() ?? null,
          createdAt: project.scripts[0].createdAt.toISOString(),
        }
      : null;

    const scenes: Scene[] = project.scenes.map((scene) => ({
      id: scene.id,
      projectId: scene.projectId,
      orderIndex: scene.orderIndex,
      narrationText: scene.narrationText,
      visualPrompt: scene.visualPrompt,
      onScreenText: scene.onScreenText,
      durationSec: scene.durationSec,
      effectTag: scene.effectTag,
      audioStrategy: scene.audioStrategy as Scene['audioStrategy'],
      sceneMode: scene.sceneMode as Scene['sceneMode'],
      status: scene.status as Scene['status'],
      generationMeta: asRecord(scene.generationMeta ?? {}),
      createdAt: scene.createdAt.toISOString(),
      updatedAt: scene.updatedAt.toISOString(),
    }));

    const reviewDecisions: ReviewDecision[] = project.reviewDecisions.map((decision) => ({
      id: decision.id,
      projectId: decision.projectId,
      stage: decision.stage as PipelineStage,
      decision: decision.decision as ReviewDecision['decision'],
      notes: decision.notes,
      source: decision.source as ReviewDecision['source'],
      decidedAt: decision.decidedAt.toISOString(),
    }));

    return {
      id: project.id,
      channelId: project.channelId,
      title: project.title,
      format: project.format as VideoProject['format'],
      stage: project.stage as PipelineStage,
      status: project.status as VideoProject['status'],
      automationLevel: project.automationLevel as VideoProject['automationLevel'],
      perStageConfig: safeConfig,
      topic,
      script,
      scenes,
      reviewDecisions,
      errorMessage: project.errorMessage,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}