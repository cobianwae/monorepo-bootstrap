import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse as ApiResponseShape, PipelineStage, VideoProject } from '@shared/types';
import { ProjectsService } from './projects.service.js';
import { PipelineService } from './pipeline.service.js';
import {
  ApproveGateDto,
  CreateProjectDto,
  GenerateTopicsDto,
  ReviewNotesDto,
  SelectTopicDto,
  UpdateAutomationDto,
  UpdateSceneDto,
  UpdateScriptDto,
} from './dto/projects.dto.js';

function ok<T>(data: T, message?: string): ApiResponseShape<T> {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly pipelineService: PipelineService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Buat project pipeline video' })
  async create(@Body() dto: CreateProjectDto): Promise<ApiResponseShape<VideoProject>> {
    const project = await this.projectsService.create(dto);
    return ok(project, 'Project berhasil dibuat');
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua project' })
  async findAll(): Promise<ApiResponseShape<VideoProject[]>> {
    const projects = await this.projectsService.findAll();
    return ok(projects);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail project' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseShape<VideoProject>> {
    const project = await this.projectsService.findOne(id);
    return ok(project);
  }

  @Patch(':id/automation')
  @ApiOperation({ summary: 'Set mode otomasi (STAGED/HYBRID/AUTO)' })
  async updateAutomation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutomationDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.updateAutomation(id, dto);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Mode otomasi diperbarui');
  }

  @Post(':id/topic/generate')
  @ApiOperation({ summary: 'Generate kandidat topik' })
  async generateTopics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateTopicsDto,
  ): Promise<ApiResponseShape<unknown>> {
    const result = await this.pipelineService.generateTopics(id, dto.seedTopic);
    return ok(result, 'Kandidat topik siap');
  }

  @Post(':id/topic/select')
  @ApiOperation({ summary: 'Pilih kandidat topik + approve gate TOPIC' })
  async selectTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SelectTopicDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.selectTopic(id, dto.candidateIndex, dto.notes);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Topik dipilih');
  }

  @Post(':id/script/generate')
  @ApiOperation({ summary: 'Generate script dari topik terpilih' })
  async generateScript(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseShape<unknown>> {
    const result = await this.pipelineService.generateScript(id);
    return ok(result, 'Script siap');
  }

  @Patch(':id/script')
  @ApiOperation({ summary: 'Edit script (versi baru)' })
  async updateScript(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScriptDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.updateScript(id, dto);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Script diperbarui');
  }

  @Post(':id/script/approve')
  @ApiOperation({ summary: 'Approve script → lanjut ke storyboard' })
  async approveScript(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewNotesDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.approveScript(id, dto.notes);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Script disetujui');
  }

  @Post(':id/storyboard/generate')
  @ApiOperation({ summary: 'Generate storyboard dari script' })
  async generateStoryboard(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseShape<unknown>> {
    const result = await this.pipelineService.generateStoryboard(id);
    return ok(result, 'Storyboard siap');
  }

  @Patch(':id/scenes/:sceneId')
  @ApiOperation({ summary: 'Edit satu scene storyboard' })
  async updateScene(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sceneId', ParseUUIDPipe) sceneId: string,
    @Body() dto: UpdateSceneDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.updateScene(id, sceneId, dto);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Scene diperbarui');
  }

  @Post(':id/storyboard/approve')
  @ApiOperation({ summary: 'Approve storyboard → lanjut ke assets' })
  async approveStoryboard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewNotesDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.approveStoryboard(id, dto.notes);
    const project = await this.projectsService.findOne(id);
    return ok(project, 'Storyboard disetujui');
  }

  @Post(':id/stages/:stage/approve')
  @ApiOperation({ summary: 'Approve gate generik pada stage tertentu' })
  async approveStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stage') stage: string,
    @Body() dto: ApproveGateDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.approveStage(id, stage as PipelineStage, dto.notes);
    const project = await this.projectsService.findOne(id);
    return ok(project, `Stage ${stage} disetujui`);
  }

  @Post(':id/stages/:stage/reject')
  @ApiOperation({ summary: 'Reject stage (catat keputusan, pipeline tetap)' })
  async rejectStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stage') stage: string,
    @Body() dto: ApproveGateDto,
  ): Promise<ApiResponseShape<VideoProject>> {
    await this.pipelineService.rejectStage(id, stage as PipelineStage, dto.notes);
    const project = await this.projectsService.findOne(id);
    return ok(project, `Stage ${stage} ditolak`);
  }
}