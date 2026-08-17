import { Badge, Card, CardHeader, CardTitle, CardContent, Banner } from '@ds/ui';
import { Sparkles, Boxes, LayoutDashboard, GitBranch } from 'lucide-react';
import { PageHeader } from '@ds/ui';

const RELEASES = [
  {
    version: 'v0.2.0',
    date: 'Aug 2026',
    badge: 'Latest',
    badgeVariant: 'highlight' as const,
    summary: 'Documentation restructure — coherent menu grouping, dedicated category pages, and a new Playground section right after Overview.',
    items: [
      { icon: Boxes, title: 'Component catalog reorganized', text: '9 categories with dedicated pages: Actions & Inputs, Forms, Layout & Navigation, Overlays & Menus, Data Display, States & Feedback, Charts, and Marketing.' },
      { icon: GitBranch, title: 'Merged overlapping pages', text: 'Forms (core + advanced), layout (sidebar + nav), data display (collections + carousel), and saved views merged into single pages. Old URLs redirect permanently.' },
      { icon: LayoutDashboard, title: 'New foundations', text: 'Motion & Animation, Iconography, and Breakpoints & Responsive pages now split out of Spacing.' },
      { icon: Sparkles, title: 'Playground moved up', text: 'Interactive scenarios (Landing demo, CRM, Clinic) now sit directly after Overview so buyers see working samples immediately.' },
    ],
  },
];

export default function WhatsNewPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Overview"
        eyebrowIcon={Sparkles}
        title="What's New"
        description="Changelog for the showcase documentation — structural changes, new pages, and UX pattern additions."
      />

      <Banner variant="highlight" actionText="Explore Components" actionHref="/components">
        <strong>IA refresh shipped:</strong> the docs now follow a clean Overview → Playground → Foundations → Components → Patterns → Principles hierarchy.
      </Banner>

      <div className="space-y-6">
        {RELEASES.map((release) => (
          <Card key={release.version} className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant={release.badgeVariant} className="font-mono text-xs">
                  {release.version}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">{release.date}</span>
                <Badge variant="outline" className="font-mono text-xs ml-auto">
                  {release.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-display">{release.summary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {release.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                    <Icon className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/10 p-5 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Recently shipped (v0.2):</p>
        Calendar &amp; Event Scheduling · Activity Feed &amp; Audit Log · Settings &amp; Preferences · Billing &amp; Invoices · Media Gallery &amp; Lightbox · Threaded Comments · Rich Text Editor (Tiptap) · Virtualized List (10k rows) · Product Tour &amp; Coach Marks.
      </div>
    </div>
  );
}