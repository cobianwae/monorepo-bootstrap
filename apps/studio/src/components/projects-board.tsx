'use client';

import Link from 'next/link';
import { EmptyState, Badge, Skeleton } from '@ds/ui';
import { PIPELINE_STAGE_ORDER, PIPELINE_STAGE_LABELS } from '@shared/types';
import type { VideoProject } from '@shared/types';

const COLUMN_CLASSES: Record<string, string> = {
  TOPIC: 'border-highlight/40',
  SCRIPT: 'border-primary/40',
  STORYBOARD: 'border-chart-3/40',
  ASSETS: 'border-chart-2/40',
  RENDER: 'border-chart-1/40',
  PUBLISH: 'border-success/40',
};

export function ProjectsBoard({ projects }: { projects: VideoProject[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="Belum ada project"
        description="Buat project pertama untuk mulai pipeline video."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {PIPELINE_STAGE_ORDER.map((stage) => {
        const items = projects.filter((project) => project.stage === stage);
        return (
          <section
            key={stage}
            className={`flex min-h-[16rem] flex-col rounded-xl border bg-muted/40 ${COLUMN_CLASSES[stage] ?? ''}`}
          >
            <header className="flex items-center justify-between px-4 py-3">
              <h2 className="text-sm font-semibold">{PIPELINE_STAGE_LABELS[stage]}</h2>
              <Badge variant="secondary">{items.length}</Badge>
            </header>
            <div className="flex flex-1 flex-col gap-3 p-3">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ProjectCard({ project }: { project: VideoProject }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <p className="line-clamp-2 text-sm font-medium leading-snug">{project.title}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <Badge variant={project.automationLevel === 'AUTO' ? 'default' : 'outline'}>
          {project.automationLevel}
        </Badge>
        <span>{new Date(project.updatedAt).toLocaleDateString('id-ID')}</span>
      </div>
    </Link>
  );
}

export function ProjectsBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {PIPELINE_STAGE_ORDER.map((stage) => (
        <div key={stage} className="rounded-xl border bg-muted/40 p-3">
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}
