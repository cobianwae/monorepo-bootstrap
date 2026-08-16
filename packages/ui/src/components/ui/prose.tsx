import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const proseVariants = cva(
  'max-w-none text-foreground leading-relaxed transition-colors ' +
    '[&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:font-display [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4 ' +
    '[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:font-display [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border/50 [&_h2]:pb-2 ' +
    '[&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:font-display [&_h3]:mt-6 [&_h3]:mb-2 ' +
    '[&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_p]:text-muted-foreground ' +
    '[&_a]:text-highlight [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80 ' +
    '[&_strong]:text-foreground [&_strong]:font-semibold ' +
    '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ul]:text-muted-foreground ' +
    '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1 [&_ol]:text-muted-foreground ' +
    '[&_blockquote]:border-l-4 [&_blockquote]:border-highlight [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground ' +
    '[&_code]:rounded-md [&_code]:border [&_code]:border-border [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground ' +
    '[&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6 ' +
    '[&_hr]:my-8 [&_hr]:border-border/60',
  {
    variants: {
      size: {
        sm: 'text-sm [&_p]:text-sm [&_p]:leading-6',
        default: 'text-base',
        lg: 'text-lg [&_p]:text-lg [&_p]:leading-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface ProseProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof proseVariants> {
  as?: React.ElementType;
}

export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(
  ({ className, size, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(proseVariants({ size, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Prose.displayName = 'Prose';
