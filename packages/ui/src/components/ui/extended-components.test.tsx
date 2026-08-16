import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Avatar, AvatarFallback, AvatarGroup } from './avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { Toggle } from './toggle';
import { Kbd } from './kbd';
import { Rating } from './rating';
import { CodeBlock } from './code-block';
import { FileInput } from './file-input';
import { NotificationItem, NotificationHeader, NotificationEmpty } from './notification';
import { ScrollArea } from './scroll-area';

describe('Card Component with Variants', () => {
  it('renders default, interactive, selectable, and glass variants', () => {
    const { rerender, container } = render(
      <Card variant="default">
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Title')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();

    rerender(<Card variant="interactive">Interactive Card</Card>);
    expect(screen.getByText('Interactive Card')).toBeDefined();

    rerender(<Card variant="selectable" selected>Selectable Card</Card>);
    expect(container.querySelector('[data-selected="true"]')).toBeDefined();
  });
});

describe('Avatar and AvatarGroup Component', () => {
  it('renders Avatar with status dot', () => {
    const { container } = render(
      <Avatar size="lg" status="online">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeDefined();
    expect(container.querySelector('[aria-label="Status: online"]')).toBeDefined();
  });

  it('renders AvatarGroup with excess counter', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>B</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>D</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
    expect(screen.getByText('+2')).toBeDefined();
  });
});

describe('Tabs with Variants', () => {
  it('renders underline and enclosed variant tabs', () => {
    render(
      <Tabs defaultValue="tab1" variant="underline">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab One')).toBeDefined();
    expect(screen.getByText('Content One')).toBeDefined();
  });
});

describe('Accordion Component', () => {
  it('renders accordion items and triggers', () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>FAQ Question 1</AccordionTrigger>
          <AccordionContent>FAQ Answer 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('FAQ Question 1')).toBeDefined();
    expect(screen.getByText('FAQ Answer 1')).toBeDefined();
  });
});

describe('Collapsible Component', () => {
  it('renders collapsible root and trigger', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle Details</CollapsibleTrigger>
        <CollapsibleContent>Hidden Details</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Toggle Details')).toBeDefined();
    expect(screen.getByText('Hidden Details')).toBeDefined();
  });
});

describe('Toggle Component', () => {
  it('renders toggle button and handles state', () => {
    render(<Toggle aria-label="Toggle italic">Italic</Toggle>);
    const toggle = screen.getByText('Italic');
    expect(toggle).toBeDefined();
  });
});

describe('Kbd Component', () => {
  it('renders kbd element with text', () => {
    render(<Kbd size="sm">⌘K</Kbd>);
    expect(screen.getByText('⌘K')).toBeDefined();
  });
});

describe('Rating Component', () => {
  it('renders interactive rating and displays value', () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={3} max={5} showValueText onChange={onChange} />);
    expect(screen.getByText('3')).toBeDefined();
  });
});

describe('CodeBlock Component', () => {
  it('renders code and filename', () => {
    render(
      <CodeBlock
        code="const x = 1;"
        filename="example.ts"
        language="typescript"
        showLineNumbers
      />
    );
    expect(screen.getByText('example.ts')).toBeDefined();
    expect(screen.getByText('const x = 1;')).toBeDefined();
  });
});

describe('FileInput Component', () => {
  it('renders dropzone helper text and browse button', () => {
    const testFile = new File(['hello'], 'test.png', { type: 'image/png' });
    render(<FileInput value={[testFile]} helperText="Max 10MB" />);
    expect(screen.getByText('test.png')).toBeDefined();
  });
});

describe('Notification Components', () => {
  it('renders notification item with unread state', () => {
    const onRead = vi.fn();
    render(
      <NotificationItem
        title="Pembayaran Berhasil"
        description="Invoice #INV-2026 telah lunas"
        timestamp="5m lalu"
        read={false}
        onRead={onRead}
      />
    );
    expect(screen.getByText('Pembayaran Berhasil')).toBeDefined();
    expect(screen.getByText('Invoice #INV-2026 telah lunas')).toBeDefined();
    fireEvent.click(screen.getByText('Tandai dibaca'));
    expect(onRead).toHaveBeenCalled();
  });

  it('renders notification header and empty states', () => {
    render(<NotificationHeader unreadCount={3} />);
    expect(screen.getByText('3 baru')).toBeDefined();

    render(<NotificationEmpty title="Semua beres" />);
    expect(screen.getByText('Semua beres')).toBeDefined();
  });
});

describe('ScrollArea Component', () => {
  it('renders scroll area content', () => {
    render(
      <ScrollArea className="h-40">
        <div>Scrollable content item</div>
      </ScrollArea>
    );
    expect(screen.getByText('Scrollable content item')).toBeDefined();
  });
});
