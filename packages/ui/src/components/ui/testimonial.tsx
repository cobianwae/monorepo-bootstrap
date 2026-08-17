import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Quote } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Rating } from './rating';

export const testimonialCardVariants = cva(
  'relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border shadow-xs',
        subtle: 'bg-muted/30 text-foreground border-border/60',
        featured:
          'bg-gradient-to-br from-card via-card to-highlight/10 border-highlight/40 shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TestimonialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testimonialCardVariants> {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  authorCompany?: string;
  rating?: number;
}

export const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  (
    {
      className,
      variant,
      quote,
      authorName,
      authorRole,
      authorAvatar,
      authorCompany,
      rating = 5,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(testimonialCardVariants({ variant, className }))}
        {...props}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {rating > 0 && <Rating value={rating} readOnly size="sm" />}
            <Quote className="h-6 w-6 text-muted-foreground/20 shrink-0" />
          </div>

          <blockquote className="text-base sm:text-lg text-foreground font-medium leading-relaxed">
            &ldquo;{quote}&rdquo;
          </blockquote>

          {children}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
            <AvatarFallback className="font-mono text-xs font-bold">
              {authorName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">{authorName}</p>
            {(authorRole || authorCompany) && (
              <p className="text-xs text-muted-foreground truncate">
                {authorRole} {authorRole && authorCompany && '•'} {authorCompany}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
TestimonialCard.displayName = 'TestimonialCard';

export const TestimonialGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 }
>(({ className, columns = 3, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid gap-6 sm:gap-8',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TestimonialGrid.displayName = 'TestimonialGrid';
