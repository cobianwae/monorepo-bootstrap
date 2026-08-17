import { notFound } from 'next/navigation';
import { api } from '../../../lib/api-server';
import { StudioHeader } from '../../../components/studio-header';
import { ProjectDetail } from '../../../components/project-detail';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project;
  try {
    project = await api.projects.get(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <StudioHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <ProjectDetail project={project} />
      </main>
    </div>
  );
}
