import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { AudioStrategy, AutomationLevel, GateDecision, SceneMode, VideoFormat } from '@shared/types';

export class CreateProjectDto {
  @IsUUID()
  channelId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(VideoFormat)
  format?: VideoFormat;

  @IsOptional()
  @IsEnum(AutomationLevel)
  automationLevel?: AutomationLevel;

  @IsOptional()
  @IsObject()
  perStageConfig?: Record<string, 'auto' | 'review'>;

  @IsOptional()
  @IsString()
  seedTopic?: string;
}

export class GenerateTopicsDto {
  @IsOptional()
  @IsString()
  seedTopic?: string;
}

export class SelectTopicDto {
  @IsInt()
  @Min(0)
  candidateIndex!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveStageDto {
  @IsEnum(GateDecision)
  decision!: GateDecision;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateScriptDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hook?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  narration?: string;

  @IsOptional()
  structure?: unknown;
}

export class UpdateSceneDto {
  @IsOptional()
  @IsString()
  narrationText?: string;

  @IsOptional()
  @IsString()
  visualPrompt?: string;

  @IsOptional()
  @IsString()
  onScreenText?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  durationSec?: number;

  @IsOptional()
  @IsString()
  effectTag?: string | null;

  @IsOptional()
  @IsEnum(AudioStrategy)
  audioStrategy?: AudioStrategy;

  @IsOptional()
  @IsEnum(SceneMode)
  sceneMode?: SceneMode;
}

export class UpdateAutomationDto {
  @IsEnum(AutomationLevel)
  automationLevel!: AutomationLevel;

  @IsOptional()
  @IsObject()
  perStageConfig?: Record<string, 'auto' | 'review'>;
}

export class ReviewNotesDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveGateDto extends ReviewNotesDto {}

export class ProjectQueryDto {
  @IsOptional()
  @IsString()
  stage?: string;
}