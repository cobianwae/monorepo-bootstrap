'use client';

import type * as React from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  type SortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SortableItem {
  id: string;
}

export interface SortableListProps<TItem extends SortableItem> {
  items: TItem[];
  onReorder: (items: TItem[]) => void;
  renderItem: (item: TItem, isDragging: boolean) => React.ReactNode;
  getId?: (item: TItem) => string;
  orientation?: 'vertical' | 'horizontal';
  handle?: boolean;
  className?: string;
}

export function SortableList<TItem extends SortableItem>({
  items,
  onReorder,
  renderItem,
  getId = (item) => item.id,
  orientation = 'vertical',
  handle = true,
  className,
}: SortableListProps<TItem>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const strategy: SortingStrategy =
    orientation === 'vertical' ? verticalListSortingStrategy : horizontalListSortingStrategy;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getId(item) === active.id);
    const newIndex = items.findIndex((item) => getId(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={undefined}
      onDragEnd={handleDragEnd}
      onDragCancel={undefined}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={strategy}
      >
        <div
          className={cn(
            'flex gap-2',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
            className
          )}
        >
          {items.map((item) => (
            <SortableRow
              key={getId(item)}
              id={getId(item)}
              handle={handle}
              renderItem={renderItem}
              item={item}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableRowProps<TItem extends SortableItem> {
  id: string;
  handle: boolean;
  item: TItem;
  renderItem: (item: TItem, isDragging: boolean) => React.ReactNode;
}

function SortableRow<TItem extends SortableItem>({ id, handle, item, renderItem }: SortableRowProps<TItem>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative', isDragging && 'z-50 opacity-60')}
    >
      {renderItem(item, isDragging)}
      {handle && (
        <button
          type="button"
          className={cn(
            'absolute right-2 top-2 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity',
            'focus-visible:opacity-100 group-hover:opacity-100 hover:bg-accent hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isDragging && 'opacity-100'
          )}
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}