'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ds/ui';
import { Input } from '@ds/ui';
import { Label } from '@ds/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ds/ui';
import { useToast } from '@ds/ui';
import { STYLE_TYPE_LABELS, PACING_LABELS } from '@shared/types';
import { api } from '../lib/api';

const STYLE_TYPES = Object.keys(STYLE_TYPE_LABELS) as Array<keyof typeof STYLE_TYPE_LABELS>;
const PACINGS = Object.keys(PACING_LABELS) as Array<keyof typeof PACING_LABELS>;

export function ChannelForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    niche: '',
    targetAudience: '',
    styleName: '',
    styleType: STYLE_TYPES[0],
    voicePreset: '',
    pacing: PACINGS[0],
    musicVibe: '',
    paletteDescription: '',
  });

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.channels.create({
        name: form.name,
        niche: form.niche,
        targetAudience: form.targetAudience,
        styleGuide: {
          name: form.styleName || form.name,
          styleType: form.styleType,
          voicePreset: form.voicePreset,
          pacing: form.pacing,
          musicVibe: form.musicVibe,
          paletteDescription: form.paletteDescription,
        },
      });
      toast({ title: 'Channel dibuat', description: `${form.name} siap dipakai.` });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Gagal membuat channel',
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
        <Button>Buat Channel</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Channel baru</DialogTitle>
          <DialogDescription>
            Definisikan channel + art direction (style guide) untuk pipeline video.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="c-name">Nama channel</Label>
            <Input id="c-name" value={form.name} onChange={set('name')} placeholder="Contoh: BolaBola Shorts" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-niche">Niche</Label>
            <Input id="c-niche" value={form.niche} onChange={set('niche')} placeholder="Sepak bola Indonesia" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-aud">Target audience</Label>
            <Input id="c-aud" value={form.targetAudience} onChange={set('targetAudience')} placeholder="18-35" />
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">Style guide</p>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="c-sname">Nama art direction</Label>
                <Input id="c-sname" value={form.styleName} onChange={set('styleName')} placeholder="Atletik Stadium" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-stype">Style type</Label>
                <select
                  id="c-stype"
                  value={form.styleType}
                  onChange={set('styleType')}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {STYLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {STYLE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-pacing">Pacing</Label>
                <select
                  id="c-pacing"
                  value={form.pacing}
                  onChange={set('pacing')}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {PACINGS.map((pacing) => (
                    <option key={pacing} value={pacing}>
                      {PACING_LABELS[pacing]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-voice">Voice preset</Label>
                <Input id="c-voice" value={form.voicePreset} onChange={set('voicePreset')} placeholder="deep-male" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-music">Music vibe</Label>
                <Input id="c-music" value={form.musicVibe} onChange={set('musicVibe')} placeholder="electronic" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-palette">Palet warna</Label>
                <Input
                  id="c-palette"
                  value={form.paletteDescription}
                  onChange={set('paletteDescription')}
                  placeholder="hijau rumput, lampu stadion malam"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={loading || !form.name}>
            {loading ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
