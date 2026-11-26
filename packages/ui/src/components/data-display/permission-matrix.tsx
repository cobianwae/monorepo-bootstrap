'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Checkbox } from '../base/checkbox';
import { Badge } from '../base/badge';
import { Button } from '../base/button';
import { Skeleton } from '../base/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../feedback/alert';
import { EmptyState } from '../feedback/empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../base/tooltip';
import type {
  PermissionDiff,
  PermissionMatrixProps,
  PermissionValue,
  ResourceId,
  RoleId,
} from './permission-matrix-types';

export const permissionMatrixVariants = cva('w-full min-w-max border-collapse text-sm', {
  variants: {
    density: {
      default: '[&_td]:p-2 [&_th]:p-2',
      compact: '[&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1',
    },
  },
  defaultVariants: { density: 'default' },
});

export const permissionCellVariants = cva(
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none',
  {
    variants: {
      cell: {
        on: 'text-primary',
        off: 'text-muted-foreground',
        locked: 'cursor-not-allowed text-muted-foreground',
      },
    },
    defaultVariants: { cell: 'off' },
  }
);

export const permissionHeaderVariants = cva('font-medium text-foreground', {
  variants: {
    headerState: { checked: '', unchecked: '', mixed: '' },
  },
  defaultVariants: { headerState: 'unchecked' },
});

export type PermissionMatrixComponentProps = PermissionMatrixProps;

type HeaderState = 'checked' | 'unchecked' | 'mixed';
type FocusTarget = { kind: 'all' } | { kind: 'column'; role: RoleId } |
  { kind: 'row'; resource: ResourceId } | { kind: 'cell'; role: RoleId; resource: ResourceId };

function getLocked(
  locked: PermissionMatrixProps['locked'],
  role: RoleId,
  resource: ResourceId
): string | null {
  return locked?.(role, resource) ?? null;
}

function stateOf(values: boolean[]): HeaderState {
  const on = values.filter(Boolean).length;
  if (on === 0) return 'unchecked';
  return on === values.length ? 'checked' : 'mixed';
}

function diffValues(from: PermissionValue, to: PermissionValue, roles: RoleId[], resources: ResourceId[]): PermissionDiff[] {
  const diff: PermissionDiff[] = [];
  for (const role of roles) for (const resource of resources) {
    const previous = from[role]?.[resource] ?? false;
    const next = to[role]?.[resource] ?? false;
    if (previous !== next) diff.push({ role, resource, from: previous, to: next });
  }
  return diff;
}

function cloneValue(value: PermissionValue, roles: RoleId[], resources: ResourceId[]): PermissionValue {
  return Object.fromEntries(roles.map((role) => [
    role,
    Object.fromEntries(resources.map((resource) => [resource, value[role]?.[resource] ?? false])),
  ]));
}

export function PermissionMatrix({
  roles,
  resources,
  value,
  onValueChange,
  locked,
  renderCell,
  density = 'default',
  className,
  initialValue,
  onSave,
  onCancel,
  onLoadExample,
  loading = false,
  error = null,
  emptyActionLabel = 'Load 5×8 example',
  onEmptyAction,
}: PermissionMatrixComponentProps) {
  const roleIds = roles.map(({ id }) => id);
  const resourceIds = resources.map(({ id }) => id);
  const [snapshot, setSnapshot] = React.useState<PermissionValue | null>(null);
  if (snapshot === null && !loading && !error && roles.length && resources.length) {
    setSnapshot(cloneValue(value, roleIds, resourceIds));
  }
  const baseline = initialValue ?? snapshot ?? value;
  const changes = diffValues(baseline, value, roleIds, resourceIds);
  const [listOpen, setListOpen] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const [focusTarget, setFocusTarget] = React.useState<FocusTarget>({ kind: 'all' });
  const gridRef = React.useRef<HTMLDivElement>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  const mountedRef = React.useRef(false);

  const duplicateId = (items: Array<{ id: string }>): string | null => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) return item.id;
      seen.add(item.id);
    }
    return null;
  };
  const invalidId = duplicateId(roles) ?? duplicateId(resources);
  React.useEffect(() => {
    if (!loading && (error || invalidId)) alertRef.current?.focus();
  }, [error, invalidId, loading]);

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const element = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('[data-target]') ?? [])
      .find((item) => item.dataset.target === JSON.stringify(focusTarget));
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [focusTarget]);

  const isOn = (role: RoleId, resource: ResourceId): boolean => value[role]?.[resource] ?? false;
  const labelOf = (role: RoleId, resource: ResourceId): string => {
    const roleLabel = roles.find((item) => item.id === role)?.label ?? role;
    const resourceLabel = resources.find((item) => item.id === resource)?.label ?? resource;
    return `${roleLabel} × ${resourceLabel}`;
  };
  const emit = (next: PermissionValue, diff: PermissionDiff[]): void => {
    if (!diff.length) return;
    onValueChange?.(next, diff);
    const dirty = diffValues(baseline, next, roleIds, resourceIds).length;
    const dirtySuffix = dirty > 0 ? `; ${dirty} unsaved changes` : '; no changes';
    if (diff.length === 1) {
      setAnnouncement(`${labelOf(diff[0].role, diff[0].resource)} ${diff[0].to ? 'on' : 'off'}${dirtySuffix}`);
      return;
    }
    const on = diff.filter((item) => item.to).length;
    const off = diff.length - on;
    const action = on > 0 && off === 0 ? `${on} selected` : off > 0 && on === 0 ? `${off} turned off` : `${on} selected, ${off} turned off`;
    setAnnouncement(`${action}${dirtySuffix}`);
  };
  const toggleCell = (role: RoleId, resource: ResourceId): void => {
    const reason = getLocked(locked, role, resource);
    if (reason) {
      setAnnouncement(`Unchanged. Locked: ${reason}`);
      return;
    }
    const from = isOn(role, resource);
    const next = { ...value, [role]: { ...value[role], [resource]: !from } };
    emit(next, [{ role, resource, from, to: !from }]);
  };
  const togglePairs = (pairs: Array<{ role: RoleId; resource: ResourceId }>): void => {
    const unlocked = pairs.filter(({ role, resource }) => !getLocked(locked, role, resource));
    if (!unlocked.length) {
      setAnnouncement('Unchanged. All cells are locked by policy.');
      return;
    }
    const to = !unlocked.every(({ role, resource }) => isOn(role, resource));
    const next = cloneValue(value, roleIds, resourceIds);
    const diff: PermissionDiff[] = [];
    for (const pair of unlocked) {
      const from = isOn(pair.role, pair.resource);
      if (from === to) continue;
      next[pair.role][pair.resource] = to;
      diff.push({ ...pair, from, to });
    }
    emit(next, diff);
  };
  const toggleRow = (resource: ResourceId): void =>
    togglePairs(roleIds.map((role) => ({ role, resource })));
  const toggleColumn = (role: RoleId): void =>
    togglePairs(resourceIds.map((resource) => ({ role, resource })));
  const toggleAll = (): void =>
    togglePairs(roleIds.flatMap((role) => resourceIds.map((resource) => ({ role, resource }))));

  const columnState = (role: RoleId): { state: HeaderState; unlocked: number; lockedCount: number } => {
    const unlockedVals: boolean[] = [];
    let lockedCount = 0;
    for (const res of resources) {
      if (getLocked(locked, role, res.id)) lockedCount += 1;
      else unlockedVals.push(isOn(role, res.id));
    }
    return { state: unlockedVals.length ? stateOf(unlockedVals) : 'unchecked', unlocked: unlockedVals.length, lockedCount };
  };
  const rowState = (resource: ResourceId): { state: HeaderState; unlocked: number; lockedCount: number } => {
    const unlockedVals: boolean[] = [];
    let lockedCount = 0;
    for (const role of roles) {
      if (getLocked(locked, role.id, resource)) lockedCount += 1;
      else unlockedVals.push(isOn(role.id, resource));
    }
    return { state: unlockedVals.length ? stateOf(unlockedVals) : 'unchecked', unlocked: unlockedVals.length, lockedCount };
  };
  const allPairs = roleIds.flatMap((role) => resourceIds.map((resource) => ({ role, resource })));
  const unlockedPairs = allPairs.filter(({ role, resource }) => !getLocked(locked, role, resource));
  const allState = unlockedPairs.length
    ? stateOf(unlockedPairs.map(({ role, resource }) => isOn(role, resource)))
    : 'unchecked';
  const headerLabel = (base: string, state: HeaderState, lockedCount: number): string =>
    `${base}${state === 'mixed' ? ', partially selected' : ''}${lockedCount ? `, ${lockedCount} locked` : ''}`;
  const isTarget = (target: FocusTarget): boolean => {
    if (focusTarget.kind !== target.kind) return false;
    if (target.kind === 'all') return true;
    if (target.kind === 'column' && focusTarget.kind === 'column') return target.role === focusTarget.role;
    if (target.kind === 'row' && focusTarget.kind === 'row') return target.resource === focusTarget.resource;
    return target.kind === 'cell' && focusTarget.kind === 'cell' &&
      target.role === focusTarget.role && target.resource === focusTarget.resource;
  };
  const itemProps = (target: FocusTarget) => ({
    'data-target': JSON.stringify(target),
    className: "relative after:absolute after:-inset-3.5 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    tabIndex: isTarget(target) ? 0 : -1,
    onFocus: () => setFocusTarget(target),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (target.kind === 'all') toggleAll();
        else if (target.kind === 'column') toggleColumn(target.role);
        else if (target.kind === 'row') toggleRow(target.resource);
        else toggleCell(target.role, target.resource);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const items: FocusTarget[] = [
        { kind: 'all' },
        ...roleIds.map((role): FocusTarget => ({ kind: 'column', role })),
        ...resourceIds.flatMap((resource) => [
          { kind: 'row', resource } as FocusTarget,
          ...roleIds.map((role): FocusTarget => ({ kind: 'cell', role, resource })),
        ]),
      ];
      const indexOf = (candidate: FocusTarget): number => items.findIndex((item) =>
        item.kind === candidate.kind &&
        (item.kind === 'all' || (item.kind === 'column' && candidate.kind === 'column' && item.role === candidate.role) ||
          (item.kind === 'row' && candidate.kind === 'row' && item.resource === candidate.resource) ||
          (item.kind === 'cell' && candidate.kind === 'cell' && item.role === candidate.role && item.resource === candidate.resource)));
      let nextIndex = indexOf(target);
      // Baris header (all + kolom): 0..roles.length. Baris resource i:
      // header di 1 + R + i * (R + 1), sel-sel setelahnya.
      const rowIndex = target.kind === 'cell' || target.kind === 'row'
        ? resourceIds.indexOf(target.resource)
        : -1;
      const rowStart = rowIndex < 0 ? 0 : 1 + roles.length + rowIndex * (roles.length + 1);
      const rowEnd = rowIndex < 0 ? roles.length : Math.min(items.length - 1, rowStart + roles.length);
      if (event.ctrlKey && event.key === 'Home') nextIndex = 0;
      else if (event.ctrlKey && event.key === 'End') nextIndex = items.length - 1;
      else if (event.key === 'Home') nextIndex = rowStart;
      else if (event.key === 'End') nextIndex = rowEnd;
      else if (event.key === 'ArrowRight') nextIndex = Math.min(rowEnd, nextIndex + 1);
      else if (event.key === 'ArrowLeft') nextIndex = Math.max(rowStart, nextIndex - 1);
      else if (event.key === 'ArrowDown' && rowIndex < resources.length - 1) nextIndex += roles.length + 1;
      else if (event.key === 'ArrowUp' && rowIndex >= 0) nextIndex -= roles.length + 1;
      setFocusTarget(items[nextIndex]);
    },
  });
  const handleReset = (): void => {
    const next = cloneValue(baseline, roleIds, resourceIds);
    const diff = diffValues(value, next, roleIds, resourceIds);
    if (!diff.length) return;
    emit(next, diff);
    setListOpen(false);
    setAnnouncement('Change reverted');
    setFocusTarget({ kind: 'all' });
  };

  if (loading) {
    return (
      <div role="grid" aria-label="Loading permissions" aria-busy="true" className={cn('space-y-2 rounded-md border border-border p-3', className)}>
        <span className="sr-only">Loading permissions…</span>
        {Array.from({ length: 5 }, (_, row) => (
          <div key={row} className="flex gap-2">
            {Array.from({ length: 8 }, (_, col) => <Skeleton key={col} className="h-9 flex-1 motion-reduce:animate-none" />)}
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Alert ref={alertRef} tabIndex={-1} role="alert" variant="destructive" className={className}>
        <AlertTitle>Invalid permission data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button className="mt-3" size="sm" onClick={onLoadExample}>Load example</Button>
      </Alert>
    );
  }
  if (invalidId) {
    return (
      <Alert ref={alertRef} tabIndex={-1} role="alert" variant="destructive" className={className}>
        <AlertTitle>Invalid permission data</AlertTitle>
        <AlertDescription>Duplicate role or resource ID: {invalidId}</AlertDescription>
        <Button className="mt-3" size="sm" onClick={onLoadExample}>Load example</Button>
      </Alert>
    );
  }
  if (!roles.length || !resources.length) {
    return (
      <EmptyState
        role="status"
        className={className}
        title="No roles or resources yet"
        description="Add data or load an example matrix to get started."
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction ?? onLoadExample}
      />
    );
  }

  const dirtyBanner = changes.length > 0 && (
    <section role="status" aria-label="Unsaved changes" className="order-first rounded-md border border-warning bg-warning/10 p-3 text-foreground motion-reduce:transition-none">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Badge variant="warning">{changes.length}</Badge>
        <span>{changes.length} unsaved changes</span>
        <Button variant="ghost" size="sm" aria-expanded={listOpen} onClick={() => setListOpen((open) => !open)}>
          {listOpen ? 'Hide list' : 'Show list'}
        </Button>
        <div className="flex flex-wrap gap-2 md:ml-auto">
          <Button variant="ghost" onClick={handleReset}>Reset</Button>
          {onCancel && <Button variant="ghost" onClick={() => { onCancel(); setFocusTarget({ kind: 'all' }); }}>Cancel</Button>}
          <Button variant="highlight" disabled={!onSave} onClick={() => { onSave?.(); setFocusTarget({ kind: 'all' }); }}>Save</Button>
        </div>
      </div>
      {listOpen && (
        <ul className="mt-3 space-y-2 border-t border-warning/40 pt-3">
          {changes.map((change) => (
            <li key={JSON.stringify([change.role, change.resource])} className="flex flex-wrap items-center gap-2">
              <span>{labelOf(change.role, change.resource)}: {change.from ? 'on' : 'off'} → {change.to ? 'on' : 'off'}</span>
              <Button size="sm" variant="outline" onClick={() => {
                const next = cloneValue(value, roleIds, resourceIds);
                next[change.role][change.resource] = baseline[change.role]?.[change.resource] ?? false;
                emit(next, diffValues(value, next, roleIds, resourceIds));
                setAnnouncement(`${labelOf(change.role, change.resource)} reverted`);
                setFocusTarget({ kind: 'all' });
              }}>Reset this row</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div ref={gridRef} className={cn('max-h-96 w-full overflow-auto rounded-md border border-border bg-card', className)}>
          {unlockedPairs.length === 0 && (
            <p className="border-b border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              All cells are locked by policy.
            </p>
          )}
          <table role="grid" aria-label="Role and resource permission matrix" className={cn(permissionMatrixVariants({ density }))}>
            <thead>
              <tr role="row">
                <th role="columnheader" scope="col" className="sticky left-0 top-0 z-20 bg-muted/40 p-2 text-left">
                  <span className="inline-flex min-h-11 items-center gap-2">
                    <Checkbox {...itemProps({ kind: 'all' })} checked={allState === 'checked' ? true : allState === 'mixed' ? 'indeterminate' : false} onCheckedChange={toggleAll} aria-disabled={!unlockedPairs.length} aria-label={headerLabel('Select all permissions', allState, allPairs.length - unlockedPairs.length)} />
                    <span className="text-xs font-medium text-muted-foreground">all</span>
                    {allState === 'mixed' && <span aria-hidden="true" className="text-xs text-primary">◐</span>}
                  </span>
                </th>
                {roles.map((role) => {
                  const { state, unlocked, lockedCount } = columnState(role.id);
                  const target: FocusTarget = { kind: 'column', role: role.id };
                  return (
                    <th key={role.id} role="columnheader" scope="col" className="sticky top-0 z-10 bg-muted/40 p-2 text-center">
                      <span className="inline-flex min-h-11 items-center justify-center gap-2">
                        <Checkbox {...itemProps(target)} checked={state === 'checked' ? true : state === 'mixed' ? 'indeterminate' : false} onCheckedChange={() => toggleColumn(role.id)} aria-disabled={!unlocked} aria-label={headerLabel(`Toggle ${role.label} column`, state, lockedCount)} />
                        <span className={cn(permissionHeaderVariants({ headerState: state }))}>{role.label}</span>
                        {state === 'mixed' && <span aria-hidden="true" className="text-xs text-primary">◐</span>}
                        {state === 'mixed' && <span className="sr-only">sebagian</span>}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => {
                const { state, unlocked, lockedCount } = rowState(resource.id);
                const rowTarget: FocusTarget = { kind: 'row', resource: resource.id };
                return (
                  <tr key={resource.id} role="row">
                    <th role="rowheader" scope="row" className="sticky left-0 z-10 bg-muted/40 p-2 text-left">
                      <span className="inline-flex min-h-11 items-center gap-2">
                        <Checkbox {...itemProps(rowTarget)} checked={state === 'checked' ? true : state === 'mixed' ? 'indeterminate' : false} onCheckedChange={() => toggleRow(resource.id)} aria-disabled={!unlocked} aria-label={headerLabel(`Toggle all ${resource.label} permissions`, state, lockedCount)} />
                        <span className={cn(permissionHeaderVariants({ headerState: state }))}>{resource.label}</span>
                        {state === 'mixed' && <span aria-hidden="true" className="text-xs text-primary">◐</span>}
                        {state === 'mixed' && <span className="sr-only">sebagian</span>}
                      </span>
                    </th>
                    {roles.map((role) => {
                      const checked = isOn(role.id, resource.id);
                      const reason = getLocked(locked, role.id, resource.id);
                      const target: FocusTarget = { kind: 'cell', role: role.id, resource: resource.id };
                      const label = `${role.label} × ${resource.label}, ${reason ? `locked: ${reason}` : checked ? 'on' : 'off'}`;
                       const cellProps = itemProps(target);
                      const checkbox = renderCell
                        ? <button type="button" {...cellProps} onClick={() => toggleCell(role.id, resource.id)} role="checkbox" aria-checked={checked} aria-label={label} aria-disabled={reason !== null}>{renderCell({ role: role.id, resource: resource.id, checked, lockedReason: reason })}</button>
                        : <Checkbox {...cellProps} checked={checked} onCheckedChange={() => toggleCell(role.id, resource.id)} aria-label={label} aria-disabled={reason !== null} />;
                      return (
                        <td key={role.id} role="gridcell" className="p-0 text-center">
                          {reason ? (
                            <Tooltip>
                              <span className={cn(permissionCellVariants({ cell: 'locked' }), 'p-2')}><TooltipTrigger asChild>{checkbox}</TooltipTrigger><Lock aria-hidden="true" className="ml-1 size-3.5 text-muted-foreground" /></span>
                              <TooltipContent className="motion-reduce:animate-none"><p>{reason}</p></TooltipContent>
                            </Tooltip>
                          ) : <span className={cn(permissionCellVariants({ cell: checked ? 'on' : 'off' }), 'p-2')}>{checkbox}</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>{allPairs.length} sel · {allPairs.length - unlockedPairs.length} locked</span>
            <Badge variant="muted" size="sm">◐ = sebagian</Badge>
            <Badge variant="muted" size="sm"><Lock aria-hidden="true" className="size-3" /> = locked by policy</Badge>
          </div>
        </div>
        {dirtyBanner}
        <div className="sr-only" aria-live="polite">{announcement}</div>
        <p className="sr-only">Navigasi grid: gunakan panah, Home, End, Ctrl+Home, atau Ctrl+End. Space memilih sel; Enter atau Space memilih header.</p>
      </div>
    </TooltipProvider>
  );
}
