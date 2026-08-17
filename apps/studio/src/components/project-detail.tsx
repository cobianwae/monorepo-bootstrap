'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Stepper,
  Switch,
  useToast,
  EmptyState,
} from '@ds/ui';
import { PIPELINE_STAGE_ORDER, PIPELINE_STAGE_LABELS, isAutoModeForStage } from '@shared/types';
import { AutomationLevel } from '@shared/types';
import type { PipelineStage, StageKey, VideoProject } from '@shared/types';
import { api } from '../lib/api';

const STAGE_KEY: Record<PipelineStage, string> = {
  TOPIC: 'topic',
  SCRIPT: 'script',
  STORYBOARD: 'storyboard',
  ASSETS: 'assets',
  RENDER: 'render',
  PUBLISH: 'publish',
};

export function ProjectDetail({ project: initial }: { project: VideoProject }) {
  const { toast } = useToast();
  const [project, setProject] = React.useState<VideoProject>(initial);
  const [loading, setLoading] = React.useState(false);
  const [autoToggles, setAutoToggles] = React.useState<Record<string, boolean>>(() => ({
    topic: initial.perStageConfig?.topic === 'auto',
    script: initial.perStageConfig?.script === 'auto',
    storyboard: initial.perStageConfig?.storyboard === 'auto',
    assets: initial.perStageConfig?.assets === 'auto',
    render: initial.perStageConfig?.render === 'auto',
    publish: initial.perStageConfig?.publish === 'auto',
  }));

  const stageIndex = PIPELINE_STAGE_ORDER.indexOf(project.stage);

  const reload = async () => {
    const fresh = await api.projects.get(project.id);
    setProject(fresh);
  };

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    setLoading(true);
    try {
      await action();
      await reload();
      toast({ title: successMessage });
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setAutomationLevel = (level: AutomationLevel) =>
    run(() => api.projects.updateAutomation(project.id, { automationLevel: level }), `Mode ${level} diterapkan`);

  const toggleAutoStage = (stageKey: string, enabled: boolean) => {
    setAutoToggles((prev) => ({ ...prev, [stageKey]: enabled }));
    void run(
      () =>
        api.projects.updateAutomation(project.id, {
          automationLevel: AutomationLevel.HYBRID,
          perStageConfig: {
            topic: autoToggles.topic ? 'auto' : 'review',
            script: autoToggles.script ? 'auto' : 'review',
            storyboard: autoToggles.storyboard ? 'auto' : 'review',
            assets: autoToggles.assets ? 'auto' : 'review',
            render: autoToggles.render ? 'auto' : 'review',
            publish: autoToggles.publish ? 'auto' : 'review',
            [stageKey]: enabled ? 'auto' : 'review',
          },
        }),
      enabled ? `Stage ${stageKey} otomatis` : `Stage ${stageKey} manual review`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground">
            ← Projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{project.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{project.format}</Badge>
            <Badge variant={project.automationLevel === 'AUTO' ? 'default' : 'outline'}>
              {project.automationLevel}
            </Badge>
            <span>Diperbarui {new Date(project.updatedAt).toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAutomationLevel(AutomationLevel.STAGED)}>
            STAGED
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAutomationLevel(AutomationLevel.HYBRID)}>
            HYBRID
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAutomationLevel(AutomationLevel.AUTO)}>
            AUTO
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
          <CardDescription>Klik stage untuk navigasi. Stage berjalan via generate + approve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper
            steps={PIPELINE_STAGE_ORDER.map((stage) => ({
              id: stage,
              title: PIPELINE_STAGE_LABELS[stage],
            }))}
            currentStep={stageIndex}
          />
        </CardContent>
      </Card>

      {project.automationLevel === 'HYBRID' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Konfigurasi otomasi per stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PIPELINE_STAGE_ORDER.map((stage) => {
              const stageKey = STAGE_KEY[stage];
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{PIPELINE_STAGE_LABELS[stage]}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAutoModeForStage(AutomationLevel.HYBRID, project.perStageConfig, stageKey as StageKey)
                        ? 'Otomatis (tanpa review)'
                        : 'Manual (review dulu)'}
                    </p>
                  </div>
                  <Switch
                    checked={autoToggles[stageKey] ?? false}
                    onCheckedChange={(checked) => toggleAutoStage(stageKey, checked)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <StagePanel project={project} loading={loading} run={run} />

      {project.errorMessage && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{project.errorMessage}</CardContent>
        </Card>
      )}
    </div>
  );
}

function StagePanel({
  project,
  loading,
  run,
}: {
  project: VideoProject;
  loading: boolean;
  run: (action: () => Promise<unknown>, successMessage: string) => Promise<void>;
}) {
  switch (project.stage) {
    case 'TOPIC':
      return <TopicPanel project={project} loading={loading} run={run} />;
    case 'SCRIPT':
      return <ScriptPanel project={project} loading={loading} run={run} />;
    case 'STORYBOARD':
      return <StoryboardPanel project={project} loading={loading} run={run} />;
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stage {PIPELINE_STAGE_LABELS[project.stage]}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title={`Stage ${PIPELINE_STAGE_LABELS[project.stage]} belum tersedia`}
              description="Implementasi assets, render, dan publish menyusul di fase berikutnya."
            />
          </CardContent>
        </Card>
      );
  }
}

function TopicPanel({
  project,
  loading,
  run,
}: {
  project: VideoProject;
  loading: boolean;
  run: (action: () => Promise<unknown>, successMessage: string) => Promise<void>;
}) {
  const [candidates, setCandidates] = React.useState<Array<{ title: string; hook: string }>>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">1. Topik</CardTitle>
        <CardDescription>Generate kandidat topik, lalu pilih satu untuk dijadikan video.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          disabled={loading}
          onClick={() =>
            run(async () => {
              const result = (await api.projects.generateTopics(project.id)) as {
                candidates: Array<{ title: string; hook: string }>;
              };
              setCandidates(result.candidates);
            }, 'Kandidat topik siap')
          }
        >
          {loading ? 'Generating…' : 'Generate Topik'}
        </Button>
        {candidates.length > 0 && (
          <div className="space-y-2">
            <Separator />
            {candidates.map((candidate, index) => (
              <div key={candidate.title} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{candidate.title}</p>
                  <p className="text-xs text-muted-foreground">{candidate.hook}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => run(() => api.projects.selectTopic(project.id, index), 'Topik dipilih')}>
                  Pilih
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScriptPanel({
  project,
  loading,
  run,
}: {
  project: VideoProject;
  loading: boolean;
  run: (action: () => Promise<unknown>, successMessage: string) => Promise<void>;
}) {
  const script = project.script;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">2. Script</CardTitle>
        <CardDescription>Hook + narasi untuk video {script ? `(versi ${script.version})` : ''}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          disabled={loading}
          onClick={() => run(() => api.projects.generateScript(project.id), 'Script siap')}
        >
          {loading ? 'Generating…' : 'Generate Script'}
        </Button>
        {script && (
          <>
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Hook</p>
                <p className="text-sm">{script.hook}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Narasi</p>
                <p className="text-sm leading-relaxed">{script.narration}</p>
              </div>
            </div>
            <Button onClick={() => run(() => api.projects.approveScript(project.id), 'Script disetujui')}>
              Approve Script
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StoryboardPanel({
  project,
  loading,
  run,
}: {
  project: VideoProject;
  loading: boolean;
  run: (action: () => Promise<unknown>, successMessage: string) => Promise<void>;
}) {
  const scenes = project.scenes;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">3. Storyboard</CardTitle>
        <CardDescription>Scene-scene visual hasil split narasi ({scenes.length} scene).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          disabled={loading}
          onClick={() => run(() => api.projects.generateStoryboard(project.id), 'Storyboard siap')}
        >
          {loading ? 'Generating…' : 'Generate Storyboard'}
        </Button>
        {scenes.length > 0 && (
          <>
            <div className="space-y-3">
              {scenes.map((scene, index) => (
                <div key={scene.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Scene {index + 1} · {scene.durationSec}s
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{scene.sceneMode}</Badge>
                      <Badge variant="outline">{scene.audioStrategy}</Badge>
                    </div>
                  </div>
                  <p className="text-sm">{scene.narrationText}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{scene.visualPrompt}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => run(() => api.projects.approveStoryboard(project.id), 'Storyboard disetujui')}>
              Approve Storyboard
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
