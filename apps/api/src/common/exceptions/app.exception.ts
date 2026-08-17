import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorCode =
  | 'RESOURCE_NOT_FOUND'
  | 'INVALID_STAGE'
  | 'GATE_NOT_REQUIRED'
  | 'ARTIFACT_MISSING'
  | 'PROVIDER_FAILED'
  | 'NOT_IMPLEMENTED'
  | 'VALIDATION_FAILED';

export interface AppErrorBody {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  errorCode: ErrorCode;
  details?: string[];
  timestamp: string;
}

export class AppException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY,
    details?: string[],
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        error: errorCode,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      } satisfies AppErrorBody,
      statusCode,
    );
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super(`${resource} dengan id '${id}' tidak ditemukan`, 'RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

export class InvalidStageException extends AppException {
  constructor(message: string) {
    super(message, 'INVALID_STAGE', HttpStatus.CONFLICT);
  }
}

export class ArtifactMissingException extends AppException {
  constructor(message: string) {
    super(message, 'ARTIFACT_MISSING', HttpStatus.CONFLICT);
  }
}

export class ProviderFailedException extends AppException {
  constructor(message: string, details?: string[]) {
    super(message, 'PROVIDER_FAILED', HttpStatus.BAD_GATEWAY, details);
  }
}

export class NotImplementedException extends AppException {
  constructor(message: string) {
    super(message, 'NOT_IMPLEMENTED', HttpStatus.NOT_IMPLEMENTED);
  }
}