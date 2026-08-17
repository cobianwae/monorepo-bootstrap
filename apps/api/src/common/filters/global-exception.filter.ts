import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { type ApiResponse } from '@shared/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiResponse<never> = {
      success: false,
      statusCode: status,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'object' && payload !== null) {
        body = {
          ...(payload as ApiResponse<never>),
          success: false,
          statusCode: status,
          timestamp: new Date().toISOString(),
        };
      } else {
        body = {
          success: false,
          statusCode: status,
          message: exception.message,
          error: exception.name,
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json(body);
  }
}