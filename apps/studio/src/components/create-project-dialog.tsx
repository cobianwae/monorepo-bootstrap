'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ds/ui';
import { Button, Input, Label, useToast } from '@ds/ui';
import { api } from '../lib/api';
import type { Channel } from '@shared/types';

export function CreateProjectDialog({ channels }: { channels: Channel[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [channelId, setChannelId] = React.useState(channels[0]?.id ?? '');
  const [title, setTitle] = React.useState('');
  const [seedTopic, setSeedTopic] = React.useState('');

  const submit = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const project = await api.projects.create({ channelId, title: title || undefined, seedTopic: seedTopic || undefined });
      toast({ title: 'Project dibuat', description: project.title });
      setOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: 'Gagal membuat project',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={channels.length === 0}>Buat Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project video baru</DialogTitle>
          <DialogDescription>
            Project masuk pipeline: TOPIC → SCRIPT → STORYBOARD → ASSETS → RENDER → PUBLISH.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="p-channel">Channel</Label>
            <select
              id="p-channel"
              value={channelId}
              onChange={(event) => setChannelId(event.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-title">Judul (opsional)</Label>
            <Input id="p-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Dibuat otomatis bila kosong" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-seed">Seed topik (opsional)</Label>
            <Input id="p-seed" value={seedTopic} onChange={(event) => setSeedTopic(event.target.value)} placeholder="Contoh: gol spektakuler timnas" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={loading || !channelId}>
            {loading ? 'Membuat…' : 'Buat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
