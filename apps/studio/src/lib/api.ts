import type { ApiResponse, Channel, VideoProject } from '@shared/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly errorCode?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok) {
    throw new ApiError(
      body && 'message' in body ? String(body.message) : `Request gagal (${response.status})`,
      response.status,
      'errorCode' in (body ?? {}) ? (body as { errorCode?: string }).errorCode : undefined,
    );
  }
  if (!body || !body.success) {
    throw new ApiError('Respon tidak valid dari API', response.status);
  }
  return body.data as T;
}

export const api = {
  channels: {
    list: () => request<Channel[]>('/channels'),
    create: (dto: unknown) =>
      request<Channel>('/channels', { method: 'POST', body: JSON.stringify(dto) }),
  },
  projects: {
    list: () => request<VideoProject[]>('/projects'),
    get: (id: string) => request<VideoProject>(`/projects/${id}`),
    create: (dto: unknown) =>
      request<VideoProject>('/projects', { method: 'POST', body: JSON.stringify(dto) }),
    generateTopics: (id: string, seedTopic?: string) =>
      request<unknown>(`/projects/${id}/topic/generate`, {
        method: 'POST',
        body: JSON.stringify({ seedTopic: seedTopic ?? undefined }),
      }),
    selectTopic: (id: string, candidateIndex: number) =>
      request<VideoProject>(`/projects/${id}/topic/select`, {
        method: 'POST',
        body: JSON.stringify({ candidateIndex }),
      }),
    generateScript: (id: string) =>
      request<unknown>(`/projects/${id}/script/generate`, { method: 'POST' }),
    approveScript: (id: string) =>
      request<VideoProject>(`/projects/${id}/script/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    generateStoryboard: (id: string) =>
      request<unknown>(`/projects/${id}/storyboard/generate`, { method: 'POST' }),
    approveStoryboard: (id: string) =>
      request<VideoProject>(`/projects/${id}/storyboard/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    updateAutomation: (id: string, dto: unknown) =>
      request<VideoProject>(`/projects/${id}/automation`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
  },
};
