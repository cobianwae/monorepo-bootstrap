import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ApiResponse as ApiResponseShape, Channel } from '@shared/types';
import { ChannelsService } from './channels.service.js';
import { CreateChannelDto, UpdateStyleGuideDto } from './dto/channels.dto.js';

function ok<T>(data: T, message?: string): ApiResponseShape<T> {
  return { success: true, data, message, timestamp: new Date().toISOString() };
}

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post()
  @ApiOperation({ summary: 'Buat channel + style guide' })
  @ApiResponse({ status: 201, description: 'Channel terbuat' })
  async create(@Body() dto: CreateChannelDto): Promise<ApiResponseShape<Channel>> {
    const channel = await this.channelsService.create(dto);
    return ok(channel, 'Channel berhasil dibuat');
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua channel' })
  async findAll(): Promise<ApiResponseShape<Channel[]>> {
    const channels = await this.channelsService.findAll();
    return ok(channels);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail channel' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseShape<Channel>> {
    const channel = await this.channelsService.findOne(id);
    return ok(channel);
  }

  @Patch(':id/style-guide')
  @ApiOperation({ summary: 'Update style guide channel' })
  async updateStyleGuide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStyleGuideDto,
  ): Promise<ApiResponseShape<Channel>> {
    const channel = await this.channelsService.updateStyleGuide(id, dto);
    return ok(channel, 'Style guide diperbarui');
  }
}