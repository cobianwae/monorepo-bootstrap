import { Lightbulb } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@ds/ui';

const USE_CASES: Array<{ title: string; description: string }> = [
  { title: 'Brainstorming', description: 'Collect team ideas and group them on one map.' },
  { title: 'Content structure', description: 'Plan a page or document hierarchy before writing.' },
  { title: 'Project planning', description: 'Break a large goal into branches you can work on.' },
];

export function MindMapUseCases() {
  return (
    <section aria-labelledby="mind-usecases" className="space-y-4">
      <div className="space-y-1">
        <h2 id="mind-usecases" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <Lightbulb aria-hidden="true" className="h-6 w-6 text-highlight" />
          <span>When to use it</span>
        </h2>
        <p className="text-sm text-muted-foreground">Three common situations where an idea map helps.</p>
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
