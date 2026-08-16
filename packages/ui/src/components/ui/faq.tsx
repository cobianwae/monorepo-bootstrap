'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

export interface FaqItem {
  id?: string;
  question: string;
  answer: React.ReactNode;
}

export interface FaqSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FaqItem[];
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

export const FaqSection = React.forwardRef<HTMLDivElement, FaqSectionProps>(
  ({ className, items, collapsible = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full max-w-3xl mx-auto', className)} {...props}>
        <Accordion type="single" collapsible={collapsible} className="w-full space-y-3">
          {items.map((item, index) => {
            const id = item.id || `faq-${index}`;
            return (
              <AccordionItem
                key={id}
                value={id}
                className="border border-border rounded-xl px-5 py-1 bg-card shadow-xs"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground text-base py-4 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pt-1">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    );
  }
);
FaqSection.displayName = 'FaqSection';
