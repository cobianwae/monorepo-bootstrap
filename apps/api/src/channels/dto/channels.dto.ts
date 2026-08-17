import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Pacing, StyleType } from '@shared/types';

export class StyleGuideDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEnum(StyleType)
  styleType!: StyleType;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  voicePreset!: string;

  @IsEnum(Pacing)
  pacing!: Pacing;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  musicVibe!: string;

  @IsString()
  @MinLength(1)
  paletteDescription!: string;
}

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  niche!: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  styleGuide?: StyleGuideDto;
}

export class UpdateStyleGuideDto extends StyleGuideDto {}

export class ChannelQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}