import * as React from 'react';
import {
  EmptyState,
  SearchInput,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@ds/ui';
import { SearchX } from 'lucide-react';
import { NAV_GROUPS, PANELS, searchSettings, type PanelId, type SearchEntry } from '../_lib/settings-data';

export interface SettingsNavProps {
  active: PanelId;
  dirty: Partial<Record<PanelId, boolean>>;
  memberCount: number;
  onSelect: (panel: PanelId, originId: string) => void;
  onSelectResult: (entry: SearchEntry, originId: string) => void;
}

export function SettingsNav({ active, dirty, memberCount, onSelect, onSelectResult }: SettingsNavProps) {
  const [query, setQuery] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);
  const searching = query.trim().length > 0;
  const results = searchSettings(query);

  const clear = () => {
    setQuery('');
    searchRef.current?.focus();
  };

  const renderItem = (id: PanelId) => {
    const { label, icon: Icon } = PANELS[id];
    return (
      <SidebarMenuItem key={id}>
        <SidebarMenuButton
          type="button"
          id={`nav-${id}`}
          isActive={active === id}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onSelect(id, `nav-${id}`)}
          className="pointer-coarse:h-11"
        >
          <Icon aria-hidden="true" />
          <span className="flex-1 truncate">{label}</span>
          {dirty[id] && (
            <>
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-highlight" />
              <span className="sr-only">, unsaved changes</span>
            </>
          )}
          {id === 'members' && (
            <>
              <span aria-hidden="true" className="text-xs tabular-nums text-muted-foreground">
                {memberCount}
              </span>
              <span className="sr-only">{`, ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}</span>
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <div className="space-y-3 p-3">
      <SearchInput
        ref={searchRef}
        value={query}
        shortcut=""
        aria-label="Find a setting"
        placeholder="Find a setting"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
        onClear={clear}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && query) {
            event.preventDefault();
            clear();
          }
        }}
      />

      <p role="status" className={searching ? 'px-3 text-xs text-muted-foreground' : 'sr-only'}>
        {searching ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : ''}
      </p>

      {!searching && (
        <nav aria-label="Settings sections" className="space-y-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <SidebarGroupLabel id={`nav-group-${group.label}`} className="text-xs">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu aria-labelledby={`nav-group-${group.label}`}>{group.items.map(renderItem)}</SidebarMenu>
            </div>
          ))}
          <div className="border-t border-border pt-3">
            <SidebarMenu>{renderItem('danger')}</SidebarMenu>
          </div>
        </nav>
      )}

      {searching && results.length > 0 && (
        <ul
          aria-label="Matching settings"
          className="space-y-1"
          onKeyDown={(event) => {
            if (event.key === 'Escape') clear();
          }}
        >
          {results.map((entry) => {
            const originId = `result-${entry.controlId}`;
            return (
              <li key={entry.controlId}>
                <button
                  type="button"
                  id={originId}
                  onClick={() => onSelectResult(entry, originId)}
                  className="w-full rounded-lg px-3 py-2 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-sm font-medium text-foreground">{entry.name}</span>
                  <span className="block text-xs text-muted-foreground">{PANELS[entry.panel].label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {searching && results.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No settings match"
          description="Try another word, such as password or theme."
          secondaryActionLabel="Show all settings"
          onSecondaryAction={clear}
          className="p-4"
        />
      )}
    </div>
  );
}
