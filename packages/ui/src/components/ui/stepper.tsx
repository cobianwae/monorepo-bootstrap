import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className,
}: StepperProps) {
  return (
    <nav
      aria-label="Progress"
      className={cn(
        orientation === 'horizontal'
          ? 'w-full flex items-center justify-between'
          : 'flex flex-col space-y-4',
        className
      )}
    >
      <ol
        className={cn(
          orientation === 'horizontal'
            ? 'flex items-center w-full'
            : 'flex flex-col space-y-4 w-full'
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isClickable = Boolean(onStepClick && index <= currentStep);

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex items-center',
                orientation === 'horizontal'
                  ? index !== steps.length - 1
                    ? 'flex-1'
                    : ''
                  : ''
              )}
            >
              <div
                className={cn(
                  'group flex items-center gap-3',
                  isClickable && 'cursor-pointer'
                )}
                onClick={() => isClickable && onStepClick?.(index)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
              >
                {/* Circle Icon Indicator */}
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground shadow-xs',
                    isCurrent &&
                      'border-primary bg-background text-primary ring-4 ring-primary/15 shadow-xs',
                    isUpcoming &&
                      'border-border bg-muted/40 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>

                {/* Title and Description */}
                <div className="flex flex-col text-left">
                  <span
                    className={cn(
                      'text-sm font-medium leading-none transition-colors',
                      isCurrent && 'text-primary font-semibold',
                      isCompleted && 'text-foreground',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="mt-1 text-xs text-muted-foreground hidden sm:inline-block">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {orientation === 'horizontal' && index !== steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-colors duration-200',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
