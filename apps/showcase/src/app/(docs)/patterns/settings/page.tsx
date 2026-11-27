'use client';

import * as React from 'react';
import { Button, CodeBlock, PageHeader, cn, toast } from '@ds/ui';
import { ChevronLeft, Settings } from 'lucide-react';
import { SectionHeading } from '../../../../components/section-heading';
import { AppearancePanel } from './_components/appearance-panel';
import { DangerPanel } from './_components/danger-panel';
import { GeneralPanel } from './_components/general-panel';
import { MembersPanel, useInvite } from './_components/members-panel';
import { ProfilePanel, type ProfileErrors } from './_components/profile-panel';
import { SaveBar } from './_components/save-bar';
import { SecurityPanel, useSecurity } from './_components/security-panel';
import { SettingsNav } from './_components/settings-nav';
import { useDraft } from './_components/use-draft';
import { A11Y_NOTES, SETTINGS_RECIPE } from './_lib/recipe';
import {
  EMAIL_REGEX,
  INITIAL_MEMBERS,
  INITIAL_PROFILE_DRAFT,
  PANELS,
  SAVED_PROFILE,
  SAVED_WORKSPACE,
  SAVE_MODES,
  type Member,
  type PanelId,
  type ProfileValues,
  type WorkspaceValues,
} from './_lib/settings-data';

const TITLE_ID = 'settings-panel-title';

export default function SettingsPage() {
  const [panel, setPanel] = React.useState<PanelId>('profile');
  // Hanya berpengaruh di bawah `lg`: false = daftar section, true = panel.
  const [drilledIn, setDrilledIn] = React.useState(false);
  const [focusRequest, setFocusRequest] = React.useState<{ id: string } | null>(null);
  const originRef = React.useRef('nav-profile');
  const saveBarRef = React.useRef<HTMLDivElement>(null);

  const profile = useDraft<ProfileValues>(SAVED_PROFILE, INITIAL_PROFILE_DRAFT);
  const workspace = useDraft<WorkspaceValues>(SAVED_WORKSPACE);
  const [profileErrors, setProfileErrors] = React.useState<ProfileErrors>({});
  const [workspaceError, setWorkspaceError] = React.useState<string>();
  const [saving, setSaving] = React.useState({ profile: false, general: false });
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const invite = useInvite();
  const security = useSecurity();

  React.useEffect(() => {
    if (!focusRequest) return;
    const element = document.getElementById(focusRequest.id);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView?.({ block: focusRequest.id === TITLE_ID ? 'nearest' : 'center' });
  }, [focusRequest]);

  const requestFocus = (id: string) => setFocusRequest({ id });

  const openPanel = (next: PanelId, originId: string, controlId?: string) => {
    originRef.current = originId;
    setPanel(next);
    setDrilledIn(true);
    // Di desktop fokus tetap di nav; di layar kecil nav tersembunyi, jadi pindah ke judul.
    const isDesktop = window.matchMedia?.('(min-width: 1024px)').matches ?? false;
    if (controlId) requestFocus(controlId);
    else if (!isDesktop) requestFocus(TITLE_ID);
  };

  const closePanel = () => {
    setDrilledIn(false);
    requestFocus(originRef.current);
  };

  /** Save bar hilang setelah simpan/discard; jangan biarkan fokus jatuh ke body. */
  const keepFocus = () => {
    const active = document.activeElement;
    if (!active || active === document.body || saveBarRef.current?.contains(active)) requestFocus(TITLE_ID);
  };

  const saveProfile = () => {
    const { draft } = profile;
    const errors: ProfileErrors = {};
    if (!draft.name.trim()) errors.name = 'Name is required.';
    if (!draft.email.trim()) errors.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(draft.email)) errors.email = 'Enter a valid email address, e.g. name@company.com.';
    setProfileErrors(errors);
    if (errors.name || errors.email) {
      requestFocus(errors.name ? 'profile-name' : 'profile-email');
      return;
    }

    setSaving((previous) => ({ ...previous, profile: true }));
    window.setTimeout(() => {
      keepFocus();
      setSaving((previous) => ({ ...previous, profile: false }));
      profile.commit(draft);
      toast({ variant: 'success', title: 'Profile saved', description: 'Your profile information has been updated.' });
    }, 800);
  };

  const saveWorkspace = () => {
    const { draft } = workspace;
    if (!draft.name.trim()) {
      setWorkspaceError('Workspace name is required.');
      requestFocus('workspace-name');
      return;
    }

    setSaving((previous) => ({ ...previous, general: true }));
    window.setTimeout(() => {
      keepFocus();
      setSaving((previous) => ({ ...previous, general: false }));
      workspace.commit(draft);
      toast({
        variant: 'success',
        title: 'Workspace settings saved',
        description: `Workspace "${draft.name}" updated successfully.`,
      });
    }, 800);
  };

  /** Field yang terfokus tidak boleh tertutup save bar yang menempel di bawah. */
  const revealFromSaveBar = (event: React.FocusEvent<HTMLElement>) => {
    const target = event.target;
    if (saveBarRef.current?.contains(target)) return;
    window.requestAnimationFrame(() => {
      const bar = saveBarRef.current?.getBoundingClientRect();
      const field = target.getBoundingClientRect();
      if (bar && field.bottom > bar.top && field.top < bar.bottom) target.scrollIntoView({ block: 'center' });
    });
  };

  const discard = () => {
    keepFocus();
    if (panel === 'profile') {
      profile.discard();
      setProfileErrors({});
    } else {
      workspace.discard();
      setWorkspaceError(undefined);
    }
    toast({ variant: 'info', title: 'Changes discarded', description: 'Back to the last saved values.' });
  };

  const dirty = { profile: profile.changed.length > 0, general: workspace.changed.length > 0 };
  // Save bar hanya untuk panel yang sedang dibuka; draft panel lain ditandai di nav.
  const changeCount =
    panel === 'profile' ? profile.changed.length : panel === 'general' ? workspace.changed.length : 0;
  const { label } = PANELS[panel];
  const saveMode = SAVE_MODES[panel];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Settings}
        title="Settings & Preferences"
        description="Find a setting, change it, and see what still needs saving. Account and workspace settings are kept apart."
      />

      <div className="rounded-xl border border-border bg-card shadow-xs lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className={cn('lg:block lg:border-r lg:border-border', drilledIn && 'hidden')}>
          <div className="lg:sticky lg:top-20">
            <SettingsNav
              active={panel}
              dirty={dirty}
              memberCount={members.length}
              onSelect={openPanel}
              onSelectResult={(entry, originId) => openPanel(entry.panel, originId, entry.controlId)}
            />
          </div>
        </div>

        <section
          aria-labelledby={TITLE_ID}
          onFocus={revealFromSaveBar}
          className={cn('@container min-w-0 flex-col lg:flex lg:min-h-[36rem]', drilledIn ? 'flex' : 'hidden')}
        >
          <div className="border-b border-l-2 border-b-border border-l-transparent px-4 py-4 sm:px-5">
            <Button variant="ghost" size="sm" onClick={closePanel} className="-ml-3 mb-2 pointer-coarse:min-h-11 lg:hidden">
              <ChevronLeft aria-hidden="true" />
              All settings
            </Button>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id={TITLE_ID}
                tabIndex={-1}
                className="scroll-mt-24 rounded-sm text-xl font-bold text-foreground font-display outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </h2>
              {saveMode && <p className="text-xs text-muted-foreground">{saveMode}</p>}
            </div>
          </div>

          <p role="status" className="sr-only">
            {changeCount > 0 ? `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'} in ${label}` : ''}
          </p>

          {panel === 'profile' && <ProfilePanel form={profile} errors={profileErrors} onErrorsChange={setProfileErrors} />}
          {panel === 'security' && <SecurityPanel security={security} />}
          {panel === 'appearance' && <AppearancePanel />}
          {panel === 'general' && (
            <GeneralPanel form={workspace} nameError={workspaceError} onNameErrorClear={() => setWorkspaceError(undefined)} />
          )}
          {panel === 'members' && <MembersPanel invite={invite} members={members} onMembersChange={setMembers} />}
          {panel === 'danger' && <DangerPanel workspaceName={workspace.saved.name} />}

          {changeCount > 0 && (
            <SaveBar
              ref={saveBarRef}
              count={changeCount}
              saving={panel === 'profile' ? saving.profile : saving.general}
              onDiscard={discard}
              onSave={panel === 'profile' ? saveProfile : saveWorkspace}
            />
          )}
        </section>
      </div>

      <section id="tracking" aria-labelledby="tracking-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="tracking-heading"
          title="Track what changed"
          description="Keep the saved values beside the draft; everything about unsaved state follows from comparing them."
        />
        <CodeBlock filename="ProfileSettings.tsx" language="tsx" code={SETTINGS_RECIPE} />
      </section>

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="accessibility-heading" title="Keyboard & screen readers" />
        <dl>
          {A11Y_NOTES.map((note) => (
            <div key={note.term} className="grid gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-foreground">{note.term}</dt>
              <dd className="text-sm text-muted-foreground">{note.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
