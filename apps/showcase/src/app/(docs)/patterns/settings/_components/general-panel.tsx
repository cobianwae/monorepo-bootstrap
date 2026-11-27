import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ds/ui';
import { LANGUAGES, TIMEZONES, makeSlug, type WorkspaceValues } from '../_lib/settings-data';
import { SettingRow } from './setting-row';
import type { useDraft } from './use-draft';

export interface GeneralPanelProps {
  form: ReturnType<typeof useDraft<WorkspaceValues>>;
  nameError?: string;
  onNameErrorClear: () => void;
}

export function GeneralPanel({ form, nameError, onNameErrorClear }: GeneralPanelProps) {
  const { draft, saved, changed, set } = form;
  const slug = makeSlug(draft.name) || makeSlug(saved.name);

  const wasOption = (key: 'timezone' | 'language', options: { value: string; label: string }[]) =>
    changed.includes(key) ? `was “${options.find((option) => option.value === saved[key])?.label}”` : undefined;

  const selects = [
    { id: 'workspace-timezone', key: 'timezone', label: 'Timezone', hint: 'Used for dates across the workspace', options: TIMEZONES },
    { id: 'workspace-language', key: 'language', label: 'Default language', hint: 'Language for new members', options: LANGUAGES },
  ] as const;

  return (
    <>
      <SettingRow
        id="workspace-name"
        label="Workspace name"
        description="The name your team sees"
        changed={changed.includes('name') ? `was “${saved.name}”` : undefined}
        error={nameError}
      >
        {(describedBy) => (
          <Input
            id="workspace-name"
            value={draft.name}
            error={Boolean(nameError)}
            aria-describedby={describedBy}
            onChange={(event) => {
              set('name', event.target.value);
              if (nameError) onNameErrorClear();
            }}
          />
        )}
      </SettingRow>

      <SettingRow id="workspace-url" label="Workspace URL" description="Built from the workspace name" labelled={false}>
        {() => (
          <p
            id="workspace-url"
            tabIndex={-1}
            className="break-all rounded-sm py-2 font-mono text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            https://{slug}.acme.io
          </p>
        )}
      </SettingRow>

      {selects.map((select) => (
        <SettingRow
          key={select.id}
          id={select.id}
          label={select.label}
          description={select.hint}
          changed={wasOption(select.key, select.options)}
        >
          {(describedBy) => (
            <Select value={draft[select.key]} onValueChange={(value) => set(select.key, value)}>
              <SelectTrigger id={select.id} aria-describedby={describedBy}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {select.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SettingRow>
      ))}
    </>
  );
}
