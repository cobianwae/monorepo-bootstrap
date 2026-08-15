import type { ApiResponse } from '@shared/types';

export class AppService {
  getHealth(): ApiResponse<{ status: string; uptime: number }> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
      },
    };
  }
}

export class AppController {
  constructor(private readonly appService: AppService) {}

  getHealth(): ApiResponse<{ status: string; uptime: number }> {
    return this.appService.getHealth();
  }
}

export function bootstrap() {
  const service = new AppService();
  const controller = new AppController(service);
  return controller;
}
