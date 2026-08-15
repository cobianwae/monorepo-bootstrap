---
name: error-handling
description: Pola error handling konsisten untuk backend NestJS dan frontend Next.js
tags: [error, exception, validation, http]
compatibility: [nest, next, opencode, claude, cursor]
---

# Error Handling

## Kapan Pakai
Saat menambahkan error handling, validation, exception filter, atau error boundary baru. Juga saat perlu memperbaiki error response yang tidak konsisten.

## Arsitektur

### Backend (NestJS)

#### Custom Exception Classes
```typescript
// apps/api/src/common/exceptions/
export class NotFoundException extends HttpException {
  constructor(resource: string, id: string) {
    super({
      statusCode: 404,
      message: `${resource} with id '${id}' not found`,
      error: 'Not Found',
    }, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super({ statusCode: 409, message, error: 'Conflict' }, 409);
  }
}

export class BusinessException extends HttpException {
  constructor(message: string, statusCode = 422) {
    super({ statusCode, message, error: 'Business Rule Violation' }, statusCode);
  }
}
```

#### Global Exception Filter
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      if (typeof exResponse === 'object' && exResponse !== null) {
        const r = exResponse as Record<string, unknown>;
        message = (r.message as string) || exception.message;
        error = (r.error as string) || 'Error';
      }
    }

    // Log error details (but not to response)
    if (status >= 500) {
      console.error('[ExceptionFilter]', exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Validation Error Formatting
```typescript
// apps/api/src/common/pipes/validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype) return value;
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const messages = errors.flatMap(e =>
        Object.values(e.constraints || {}),
      );
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        details: messages,
      });
    }
    return object;
  }
}
```

### Frontend (Next.js)

#### API Error Handler
```typescript
// apps/web/lib/api-client.ts
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string[],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiClientError(
      res.status,
      body.message || `Request failed with status ${res.status}`,
      body.details,
    );
  }
  return res.json();
}
```

#### Error Boundary Component
```tsx
// apps/web/src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode }

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError
      ? this.props.fallback || <p>Something went wrong.</p>
      : this.props.children;
  }
}
```

## Checklist
1. [ ] Error response format konsisten: `{ success, statusCode, message, error, details? }`
2. [ ] Custom exception class untuk domain error (bukan generic HttpException)
3. [ ] Global filter menangani semua exception (HttpException + unexpected)
4. [ ] Validation errors include field-level details
5. [ ] Frontend punya typed error class yang parse API error response
6. [ ] 5xx errors tidak expose stack trace ke client

## Yang TIDAK BOLEH
- Tidak boleh `new Error('generic')` di service/controller NestJS
- Tidak boleh expose `exception.stack` di production response
- Tidak boleh `try/catch` yang hanya re-throw tanpa menambah context
- Tidak boleh `console.error` di production tanpa structured logging
