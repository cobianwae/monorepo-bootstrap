import type { Channel, VideoProject } from '@shared/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API request gagal: ${response.status} ${path}`);
  }
  const body = (await response.json()) as { success: boolean; data: T };
  if (!body.success) {
    throw new Error('Respon tidak valid dari API');
  }
  return body.data;
}

export const api = {
  channels: {
    list: () => request<Channel[]>('/channels'),
  },
  projects: {
    list: () => request<VideoProject[]>('/projects'),
    get: (id: string) => request<VideoProject>(`/projects/${id}`),
  },
};
