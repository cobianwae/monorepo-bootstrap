import { api } from '../../lib/api-server';
import { StudioHeader } from '../../components/studio-header';
import { CreateProjectDialog } from '../../components/create-project-dialog';
import { ProjectsBoard } from '../../components/projects-board';

export default async function ProjectsPage() {
  const [channels, projects] = await Promise.all([api.channels.list(), api.projects.list()]);

  return (
    <div className="min-h-screen">
      <StudioHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Kanban pipeline — tarik project antar stage, klik untuk detail.
            </p>
          </div>
          <CreateProjectDialog channels={channels} />
        </div>
        <ProjectsBoard projects={projects} />
      </main>
    </div>
  );
}
