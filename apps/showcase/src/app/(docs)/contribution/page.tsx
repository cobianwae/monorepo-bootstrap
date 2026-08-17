import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Banner } from '@ds/ui';
import { GitPullRequest, Code2, TestTube, Palette } from 'lucide-react';
import { PageHeader } from '@ds/ui';
import Link from 'next/link';

const GUIDELINES = [
  {
    icon: Code2,
    title: 'Component conventions',
    text: 'Radix primitives for a11y, cva for variants, cn() for merging, forwardRef + displayName, and barrel exports via index.ts.',
    href: '/components/actions-inputs',
  },
  {
    icon: Palette,
    title: 'Design tokens',
    text: 'OKLCH color space with audited WCAG AA/AAA contrast and light/dark parity. New tokens must pass the contrast validator.',
    href: '/foundations/colors',
  },
  {
    icon: TestTube,
    title: 'Testing',
    text: 'Unit tests with Vitest + Testing Library for every new component or utility in packages/ui and packages/tokens.',
    href: '/guidelines',
  },
  {
    icon: GitPullRequest,
    title: 'Workflow',
    text: 'Conventional commits (feat/fix/refactor/chore). One concern per commit; verify with lint, types, and tests before opening a PR.',
    href: '/getting-started',
  },
];

export default function ContributionPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Design Principles"
        eyebrowIcon={GitPullRequest}
        title="Contribution Guide"
        description="How to add components, tokens, and pattern recipes to this design system the right way."
      />

      <Banner variant="highlight">
        <strong>Golden rule:</strong> every new file must follow the existing patterns in its directory. No <code className="font-mono text-xs">any</code>, no hardcoded colors, no invented z-indexes.
      </Banner>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDELINES.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="group">
              <Card className="h-full border-border hover:border-highlight/50 transition-colors">
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-highlight group-hover:text-highlight-foreground transition-all shadow-xs mb-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-display">{item.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{item.text}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-display">Before you contribute</CardTitle>
          <CardDescription className="text-xs">Quick checklist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          {[
            'Run the matching skill first (design-tokens, ui-component, ux-patterns, accessibility).',
            'Confirm the component is not already showcased elsewhere — we merged the catalog to remove duplicates.',
            'Wire the demo into its category page and add the nav entry.',
            'Run pnpm lint, pnpm build:types, and pnpm test.',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 font-mono text-[10px] mt-0.5">
                {i + 1}
              </Badge>
              <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}