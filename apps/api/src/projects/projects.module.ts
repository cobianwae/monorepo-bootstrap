import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { PipelineService } from './pipeline.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PipelineService],
  exports: [ProjectsService, PipelineService],
})
export class ProjectsModule {}