'use client';

import {
  Group as ResizableGroup,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableSeparator,
  type GroupProps as ResizableGroupProps,
  type PanelProps as ResizablePanelProps,
  type SeparatorProps as ResizableSeparatorProps,
} from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ResizablePanelGroupProps extends Omit<ResizableGroupProps, 'orientation'> {
  direction?: 'horizontal' | 'vertical';
  orientation?: 'horizontal' | 'vertical';
}

export const ResizablePanelGroup = ({
  className,
  direction = 'horizontal',
  orientation,
  ...props
}: ResizablePanelGroupProps) => (
  <ResizableGroup
    orientation={orientation || direction}
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col data-[orientation=vertical]:flex-col',
      className
    )}
    {...props}
  />
);

export const ResizablePanel = (props: ResizablePanelProps) => (
  <ResizablePanelPrimitive {...props} />
);

export interface ResizableHandleProps extends ResizableSeparatorProps {
  withHandle?: boolean;
}

export const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) => (
  <ResizableSeparator
    className={cn(
      'relative flex w-px items-center justify-center bg-border transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-2 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 hover:bg-primary/60 data-[separator=active]:bg-primary cursor-col-resize data-[orientation=vertical]:cursor-row-resize',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-docked flex h-5 w-3 items-center justify-center rounded-xs border border-border bg-card shadow-xs pointer-events-none">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    )}
  </ResizableSeparator>
);
