import { Inject, Injectable } from '@nestjs/common';
import type { Channel, StyleGuide } from '@shared/types';
import { Pacing, StyleType, STYLE_TYPE_LABELS, PACING_LABELS } from '@shared/types';
import { type PrismaClient } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from '../prisma/tokens.js';
import { ResourceNotFoundException } from '../common/exceptions/app.exception.js';
import { asRecord, asStringArray } from '../common/utils/json.js';
import { type CreateChannelDto, type UpdateStyleGuideDto } from './dto/channels.dto.js';

interface StyleGuideRow {
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
}

interface ChannelRow {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  styleGuide: StyleGuideRow | null;
}

function buildLockedPromptSuffix(dto: {
  styleType: keyof typeof STYLE_TYPE_LABELS;
  pacing: Pacing;
  voicePreset: string;
  musicVibe: string;
  paletteDescription: string;
}): string {
  return [
    `Art direction: ${STYLE_TYPE_LABELS[dto.styleType]}.`,
    `Pacing: ${PACING_LABELS[dto.pacing]}.`,
    `Palet warna konsisten: ${dto.paletteDescription}.`,
    `Voice narator: ${dto.voicePreset}.`,
    `Music vibe: ${dto.musicVibe}.`,
    'Konsisten secara visual di seluruh scene.',
  ].join(' ');
}

function toStyleGuide(guide: StyleGuideRow): StyleGuide {
  return {
    id: guide.id,
    channelId: guide.channelId,
    name: guide.name,
    styleType: guide.styleType as StyleType,
    voicePreset: guide.voicePreset,
    pacing: guide.pacing as Pacing,
    musicVibe: guide.musicVibe,
    paletteDescription: guide.paletteDescription,
    lockedPromptSuffix: guide.lockedPromptSuffix,
    referenceImageUrls: asStringArray(guide.referenceImageUrls),
    meta: asRecord(guide.meta),
    createdAt: guide.createdAt.toISOString(),
    updatedAt: guide.updatedAt.toISOString(),
  };
}

function toChannel(channel: ChannelRow): Channel {
  return {
    id: channel.id,
    name: channel.name,
    niche: channel.niche,
    targetAudience: channel.targetAudience,
    status: channel.status as Channel['status'],
    styleGuide: channel.styleGuide ? toStyleGuide(channel.styleGuide) : null,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  };
}

@Injectable()
export class ChannelsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(dto: CreateChannelDto): Promise<Channel> {
    const channel = await this.prisma.channel.create({
      data: {
        name: dto.name,
        niche: dto.niche,
        targetAudience: dto.targetAudience ?? '',
        status: 'ACTIVE',
        ...(dto.styleGuide
          ? {
              styleGuide: {
                create: {
                  name: dto.styleGuide.name,
                  styleType: dto.styleGuide.styleType,
                  voicePreset: dto.styleGuide.voicePreset,
                  pacing: dto.styleGuide.pacing,
                  musicVibe: dto.styleGuide.musicVibe,
                  paletteDescription: dto.styleGuide.paletteDescription,
                  lockedPromptSuffix: buildLockedPromptSuffix(dto.styleGuide),
                },
              },
            }
          : {}),
      },
      include: { styleGuide: true },
    });
    return toChannel(channel as unknown as ChannelRow);
  }

  async findAll(): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: { deletedAt: null },
      include: { styleGuide: true },
      orderBy: { createdAt: 'asc' },
    });
    return (channels as unknown as ChannelRow[]).map((channel) => toChannel(channel));
  }

  async findOne(id: string): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: { styleGuide: true },
    });
    if (!channel || channel.deletedAt) {
      throw new ResourceNotFoundException('Channel', id);
    }
    return toChannel(channel as unknown as ChannelRow);
  }

  async updateStyleGuide(channelId: string, dto: UpdateStyleGuideDto): Promise<Channel> {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.deletedAt) {
      throw new ResourceNotFoundException('Channel', channelId);
    }
    const updated = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        styleGuide: {
          upsert: {
            create: {
              name: dto.name,
              styleType: dto.styleType,
              voicePreset: dto.voicePreset,
              pacing: dto.pacing,
              musicVibe: dto.musicVibe,
              paletteDescription: dto.paletteDescription,
              lockedPromptSuffix: buildLockedPromptSuffix(dto),
            },
            update: {
              name: dto.name,
              styleType: dto.styleType,
              voicePreset: dto.voicePreset,
              pacing: dto.pacing,
              musicVibe: dto.musicVibe,
              paletteDescription: dto.paletteDescription,
              lockedPromptSuffix: buildLockedPromptSuffix(dto),
            },
          },
        },
      },
      include: { styleGuide: true },
    });
    return toChannel(updated as unknown as ChannelRow);
  }
}