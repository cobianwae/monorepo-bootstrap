'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CodeBlock,
  PageHeader,
  Badge,
} from '@ds/ui';
import {
  Rocket,
  Boxes,
  Palette,
  Puzzle,
  TestTube2,
  ShieldCheck,
  TerminalSquare,
  BookOpen,
} from 'lucide-react';

const PACKAGE_TABLE = `packages/
├── tokens/        # OKLCH design tokens, CSS variables & WCAG contrast validator
├── ui/            # Radix + cva components (Tailwind v4), barrel-exported
├── shared-types/  # Shared TypeScript types & DTOs
└── config/        # Shared ESLint (flat) & TSConfig presets

apps/
├── showcase/      # Living documentation & UX scenario recipes (Next.js)
├── web/           # Consumer frontend (Next.js, server components first)
└── api/           # NestJS backend (class-validator DTOs, typed responses)`;

const INSTALL_CODE = `// pnpm workspace monorepo — install once at the root
pnpm install

# Dependencies (add to your workspace package.json)
pnpm add @ds/ui @ds/tokens @shared/types`;

const SETUP_CODE = `// 1. Import the token layer + component styles once (global CSS)
import '@ds/ui/styles.css';
import '@ds/tokens/styles.css'; // your design tokens as CSS @theme directives

// 2. Wrap your app with the theme provider
import { ThemeProvider } from '@ds/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}`;

const USAGE_CODE = `import { Button, Card, CardHeader, CardTitle } from '@ds/ui';
import type { ThemeId } from '@ds/tokens';

export function ExampleCard() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-display">Server-components friendly</CardTitle>
      </CardHeader>
      <Button variant="default" size="sm">
        Compose primitives
      </Button>
    </Card>
  );
}`;

const TEST_CODE = `// Unit test — plain matchers, no jest-dom required
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@ds/ui';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save</Button>);
    expect(screen.getByText('Save')).toBeDefined();
  });
});`;

export default function GettingStartedPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Getting Started"
        eyebrowIcon={Rocket}
        title="Quick Start Guide"
        description="Bootstrapping a workspace against the design system — packages, theming, imports, and the development workflow."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">1. Monorepo Layout</CardTitle>
            </div>
            <CardDescription className="text-xs">
              One install, six workspaces, single source of truth for UI and tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={PACKAGE_TABLE} language="tree" filename="structure.txt" maxHeight="240px" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">2. Install &amp; Theme Setup</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Import the token layer and component styles, then wrap the app with ThemeProvider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock code={INSTALL_CODE} language="bash" filename="terminal" maxHeight="160px" />
            <CodeBlock code={SETUP_CODE} language="tsx" filename="app/layout.tsx" maxHeight="240px" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">3. Import Patterns</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Barrel exports keep imports clean. Use the workspace aliases everywhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={USAGE_CODE} language="tsx" filename="components/example-card.tsx" maxHeight="240px" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">4. Testing Conventions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Vitest + Testing Library with plain matchers — unit tests for utils, services &amp; tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={TEST_CODE} language="tsx" filename="button.test.tsx" maxHeight="240px" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Development Workflow</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Everything is run from the monorepo root with pnpm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CodeBlock
            code={`pnpm dev          # run the showcase app (living docs) on :3000
pnpm test         # run all unit & integration tests (-r)
pnpm lint         # ESLint flat config, all workspaces
pnpm build:types  # typecheck every package (tsc --noEmit)`}
            language="bash"
            filename="terminal"
            maxHeight="200px"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              Tailwind v4
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              Radix primitives
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              cva + cn()
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              OKLCH tokens
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-4">
        <ShieldCheck className="h-5 w-5 text-highlight shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">Accessibility is built in, not bolted on.</p>
          <p>
            Every token is audited against WCAG 2.1 AA ({'>'} 4.5:1 for body text), every component is
            keyboard-navigable and screen-reader friendly, and light &amp; dark modes share the same
            contrast guarantees. Check the{' '}
            <BookOpen className="inline h-3.5 w-3.5 align-text-bottom" /> Guidelines and Foundations
            pages for the full spec.
          </p>
        </div>
      </div>
    </div>
  );
}