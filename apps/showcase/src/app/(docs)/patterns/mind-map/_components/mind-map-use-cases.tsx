import { Lightbulb } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@ds/ui';

const USE_CASES: Array<{ title: string; description: string }> = [
  { title: 'Brainstorming', description: 'Kumpulkan ide tim lalu kelompokkan dalam satu peta.' },
  { title: 'Struktur konten', description: 'Rancang hierarki halaman atau dokumen sebelum menulis.' },
  { title: 'Rencana proyek', description: 'Pecah tujuan besar menjadi cabang yang bisa dikerjakan.' },
];

export function MindMapUseCases() {
  return (
    <section aria-labelledby="mind-usecases" className="space-y-4">
      <div className="space-y-1">
        <h2 id="mind-usecases" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <Lightbulb aria-hidden="true" className="h-6 w-6 text-highlight" />
          <span>Kapan dipakai</span>
        </h2>
        <p className="text-sm text-muted-foreground">Tiga situasi umum ketika peta ide membantu.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {USE_CASES.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
