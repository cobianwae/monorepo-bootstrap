'use client';

import { cva } from 'class-variance-authority';
import { Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Checkbox } from '../base/checkbox';
import { Badge } from '../base/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../base/tooltip';
import type {
  PermissionDiff,
  PermissionMatrixProps,
  PermissionValue,
  ResourceId,
  RoleId,
} from './permission-matrix-types';

export const permissionMatrixVariants = cva('w-full border-collapse text-sm', {
  variants: {
    density: {
      default: '[&_td]:p-2 [&_th]:p-2',
      compact: '[&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1',
    },
  },
  defaultVariants: { density: 'default' },
});

export const permissionCellVariants = cva(
  'inline-flex items-center justify-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      cell: {
        on: 'text-primary',
        off: 'text-muted-foreground',
        locked: 'cursor-not-allowed text-muted-foreground opacity-70',
      },
    },
    defaultVariants: { cell: 'off' },
  }
);

export const permissionHeaderVariants = cva('font-medium text-foreground', {
  variants: {
    headerState: {
      checked: '',
      unchecked: '',
      mixed: '',
    },
  },
  defaultVariants: { headerState: 'unchecked' },
});

export type PermissionMatrixComponentProps = PermissionMatrixProps;

type HeaderState = 'checked' | 'unchecked' | 'mixed';

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
  if (on === values.length) return 'checked';
  return 'mixed';
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
}: PermissionMatrixComponentProps) {
  const isOn = (role: RoleId, resource: ResourceId): boolean =>
    value[role]?.[resource] ?? false;

  const emit = (next: PermissionValue, diff: PermissionDiff[]): void => {
    if (diff.length === 0) return;
    onValueChange?.(next, diff);
  };

  const toggleCell = (role: RoleId, resource: ResourceId): void => {
    if (getLocked(locked, role, resource)) return;
    const from = isOn(role, resource);
    const next: PermissionValue = {
      ...value,
      [role]: { ...value[role], [resource]: !from },
    };
    emit(next, [{ role, resource, from, to: !from }]);
  };

  const toggleRow = (resource: ResourceId): void => {
    const targets = roles.filter((r) => !getLocked(locked, r.id, resource));
    if (targets.length === 0) return;
    const allOn = targets.every((r) => isOn(r.id, resource));
    const to = !allOn;
    const next: PermissionValue = { ...value };
    const diff: PermissionDiff[] = [];
    for (const r of targets) {
      const from = isOn(r.id, resource);
      if (from === to) continue;
      next[r.id] = { ...next[r.id], [resource]: to };
      diff.push({ role: r.id, resource, from, to });
    }
    emit(next, diff);
  };

  const toggleColumn = (role: RoleId): void => {
    const targets = resources.filter((res) => !getLocked(locked, role, res.id));
    if (targets.length === 0) return;
    const allOn = targets.every((res) => isOn(role, res.id));
    const to = !allOn;
    const next: PermissionValue = { ...value, [role]: { ...value[role] } };
    const diff: PermissionDiff[] = [];
    for (const res of targets) {
      const from = isOn(role, res.id);
      if (from === to) continue;
      next[role] = { ...next[role], [res.id]: to };
      diff.push({ role, resource: res.id, from, to });
    }
    emit(next, diff);
  };

  const toggleAll = (): void => {
    const pairs: Array<{ role: RoleId; resource: ResourceId }> = [];
    for (const r of roles)
      for (const res of resources)
        if (!getLocked(locked, r.id, res.id)) pairs.push({ role: r.id, resource: res.id });
    if (pairs.length === 0) return;
    const allOn = pairs.every((p) => isOn(p.role, p.resource));
    const to = !allOn;
    const next: PermissionValue = { ...value };
    const diff: PermissionDiff[] = [];
    for (const p of pairs) {
      const from = isOn(p.role, p.resource);
      if (from === to) continue;
      next[p.role] = { ...next[p.role], [p.resource]: to };
      diff.push({ role: p.role, resource: p.resource, from: from, to });
    }
    emit(next, diff);
  };

  const columnState = (role: RoleId): { state: HeaderState; unlocked: number; lockedCount: number } => {
    const unlockedVals: boolean[] = [];
    let lockedCount = 0;
    for (const res of resources) {
      if (getLocked(locked, role, res.id)) lockedCount += 1;
      else unlockedVals.push(isOn(role, res.id));
    }
    return {
      state: unlockedVals.length === 0 ? 'unchecked' : stateOf(unlockedVals),
      unlocked: unlockedVals.length,
      lockedCount,
    };
  };

  const rowState = (resource: ResourceId): { state: HeaderState; unlocked: number; lockedCount: number } => {
    const unlockedVals: boolean[] = [];
    let lockedCount = 0;
    for (const r of roles) {
      if (getLocked(locked, r.id, resource)) lockedCount += 1;
      else unlockedVals.push(isOn(r.id, resource));
    }
    return {
      state: unlockedVals.length === 0 ? 'unchecked' : stateOf(unlockedVals),
      unlocked: unlockedVals.length,
      lockedCount,
    };
  };

  const allUnlockedVals: boolean[] = [];
  let lockedTotal = 0;
  for (const r of roles)
    for (const res of resources) {
      if (getLocked(locked, r.id, res.id)) lockedTotal += 1;
      else allUnlockedVals.push(isOn(r.id, res.id));
    }
  const allState: HeaderState =
    allUnlockedVals.length === 0 ? 'unchecked' : stateOf(allUnlockedVals);
  const totalCells = roles.length * resources.length;

  const headerAriaLabel = (
    base: string,
    state: HeaderState,
    lockedCount: number
  ): string =>
    `${base}${state === 'mixed' ? ', sebagian dipilih' : ''}${lockedCount > 0 ? `, ${lockedCount} terkunci` : ''}`;

  return (
    <TooltipProvider>
      <div className={cn('w-full overflow-x-auto rounded-md border border-border bg-card', className)}>
        <table role="grid" aria-label="Matriks izin role dan resource" className={cn(permissionMatrixVariants({ density }))}>
          <thead>
            <tr role="row">
              <th role="columnheader" scope="col" className="sticky left-0 top-0 z-10 bg-muted/40 p-2 text-left">
                <span className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={allState === 'checked' ? true : allState === 'mixed' ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    disabled={allUnlockedVals.length === 0}
                    aria-label={headerAriaLabel('Pilih semua izin', allState, lockedTotal)}
                  />
                  <span className="sr-only">{allState === 'mixed' ? 'sebagian' : allState}</span>
                  <span className="text-xs font-medium text-muted-foreground">semua</span>
                </span>
              </th>
              {roles.map((role) => {
                const { state, unlocked, lockedCount } = columnState(role.id);
                return (
                  <th
                    key={role.id}
                    role="columnheader"
                    scope="col"
                    className="sticky top-0 z-10 bg-muted/40 p-2 text-center"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Checkbox
                        checked={state === 'checked' ? true : state === 'mixed' ? 'indeterminate' : false}
                        onCheckedChange={() => toggleColumn(role.id)}
                        disabled={unlocked === 0}
                        aria-label={headerAriaLabel(`Toggle kolom ${role.label}`, state, lockedCount)}
                      />
                      <span className={cn(permissionHeaderVariants({ headerState: state }))}>
                        {role.label}
                      </span>
                      {state === 'mixed' && (
                        <span aria-hidden="true" className="text-xs text-primary">
                          ◐
                        </span>
                      )}
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
              return (
                <tr key={resource.id} role="row">
                  <th role="rowheader" scope="row" className="sticky left-0 z-10 bg-muted/40 p-2 text-left">
                    <span className="inline-flex items-center gap-2">
                      <Checkbox
                        checked={state === 'checked' ? true : state === 'mixed' ? 'indeterminate' : false}
                        onCheckedChange={() => toggleRow(resource.id)}
                        disabled={unlocked === 0}
                        aria-label={headerAriaLabel(`Toggle semua izin ${resource.label}`, state, lockedCount)}
                      />
                      <span className={cn(permissionHeaderVariants({ headerState: state }))}>
                        {resource.label}
                      </span>
                      {state === 'mixed' && (
                        <span aria-hidden="true" className="text-xs text-primary">
                          ◐
                        </span>
                      )}
                      {state === 'mixed' && <span className="sr-only">sebagian</span>}
                    </span>
                  </th>
                  {roles.map((role) => {
                    const checked = isOn(role.id, resource.id);
                    const reason = getLocked(locked, role.id, resource.id);
                    const cellState = reason ? 'locked' : checked ? 'on' : 'off';
                    const label = `${role.label} × ${resource.label}, ${reason ? `terkunci: ${reason}` : checked ? 'menyala' : 'mati'}`;
                    const box = (
                      <span className={cn(permissionCellVariants({ cell: cellState }), 'p-2')}>
                        {renderCell ? (
                          renderCell({ role: role.id, resource: resource.id, checked, lockedReason: reason })
                        ) : (
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCell(role.id, resource.id)}
                            disabled={reason !== null}
                            aria-label={label}
                            aria-disabled={reason !== null}
                          />
                        )}
                        {reason && (
                          <Lock aria-hidden="true" className="ml-1 size-3.5 text-muted-foreground" />
                        )}
                      </span>
                    );
                    return (
                      <td key={role.id} role="gridcell" className="p-0 text-center">
                        {reason ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block">{box}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          box
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>
            {totalCells} sel · {lockedTotal} terkunci
          </span>
          <Badge variant="muted" size="sm">
            ◐ = sebagian
          </Badge>
          <Badge variant="muted" size="sm">
            <Lock aria-hidden="true" className="size-3" /> = terkunci kebijakan
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}
