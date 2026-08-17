import Link from 'next/link';
import { api } from '../../lib/api-server';
import { StudioHeader } from '../../components/studio-header';
import { ChannelForm } from '../../components/channel-form';
import { EmptyState } from '@ds/ui';
import { Badge } from '@ds/ui';

export default async function ChannelsPage() {
  const channels = await api.channels.list();

  return (
    <div className="min-h-screen">
      <StudioHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Channels</h1>
            <p className="text-sm text-muted-foreground">
              Channel YouTube + art direction yang dipakai pipeline.
            </p>
          </div>
          <ChannelForm />
        </div>

        {channels.length === 0 ? (
          <EmptyState
            title="Belum ada channel"
            description="Buat channel pertama dengan mengklik tombol di atas."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Link
                key={channel.id}
                href="/projects"
                className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-medium">{channel.name}</h2>
                  <Badge variant="secondary">{channel.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{channel.niche}</p>
                {channel.styleGuide ? (
                  <div className="mt-4 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                    <p>
                      Art direction: <span className="text-foreground">{channel.styleGuide.name}</span>
                    </p>
                    <p>
                      Style: <span className="text-foreground">{channel.styleGuide.styleType}</span> · Pacing:{' '}
                      <span className="text-foreground">{channel.styleGuide.pacing}</span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Belum ada style guide</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
