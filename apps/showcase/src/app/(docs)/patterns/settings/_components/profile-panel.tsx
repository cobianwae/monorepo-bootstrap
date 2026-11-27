import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage, Button, Input, toast } from '@ds/ui';
import { AVATAR_TYPES, initialsOf, validateAvatar, type ProfileValues } from '../_lib/settings-data';
import { SettingRow } from './setting-row';
import type { useDraft } from './use-draft';

export type ProfileErrors = { avatar?: string; name?: string; email?: string };

export interface ProfilePanelProps {
  form: ReturnType<typeof useDraft<ProfileValues>>;
  errors: ProfileErrors;
  onErrorsChange: React.Dispatch<React.SetStateAction<ProfileErrors>>;
}

export function ProfilePanel({ form, errors, onErrorsChange }: ProfilePanelProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { draft, saved, changed, set } = form;

  const was = (key: 'name' | 'email' | 'title') =>
    changed.includes(key) ? (saved[key] ? `was “${saved[key]}”` : 'was empty') : undefined;

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const error = validateAvatar(file);
    onErrorsChange((previous) => ({ ...previous, avatar: error }));
    if (error) return;
    set('avatar', URL.createObjectURL(file));
    toast({
      variant: 'success',
      title: 'Avatar selected',
      description: `"${file.name}" will be applied when you save your profile.`,
    });
  };

  const field = (key: 'name' | 'email' | 'title', value: string) => {
    set(key, value);
    if (key !== 'title' && errors[key]) onErrorsChange((previous) => ({ ...previous, [key]: undefined }));
  };

  return (
    <>
      <SettingRow
        id="profile-avatar"
        label="Photo"
        description="JPG, PNG or GIF, up to 2 MB"
        labelled={false}
        changed={changed.includes('avatar') ? 'New photo selected' : undefined}
        error={errors.avatar}
      >
        {(describedBy) => (
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="xl">
              {draft.avatar ? (
                <AvatarImage src={draft.avatar} alt="Profile photo preview" />
              ) : (
                <AvatarFallback>{initialsOf(draft.name || saved.name)}</AvatarFallback>
              )}
            </Avatar>
            <Button
              type="button"
              id="profile-avatar"
              variant="outline"
              size="sm"
              aria-describedby={describedBy}
              onClick={() => fileRef.current?.click()}
              className="pointer-coarse:min-h-11"
            >
              Change avatar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept={AVATAR_TYPES.join(',')}
              aria-label="Upload avatar"
              tabIndex={-1}
              className="sr-only"
              onChange={handlePick}
            />
          </div>
        )}
      </SettingRow>

      <SettingRow
        id="profile-name"
        label="Full name"
        description="Shown to the rest of the workspace"
        changed={was('name')}
        error={errors.name}
      >
        {(describedBy) => (
          <Input
            id="profile-name"
            autoComplete="name"
            value={draft.name}
            error={Boolean(errors.name)}
            aria-describedby={describedBy}
            onChange={(event) => field('name', event.target.value)}
          />
        )}
      </SettingRow>

      <SettingRow
        id="profile-email"
        label="Email"
        description="Used to sign in and for notifications"
        changed={was('email')}
        error={errors.email}
      >
        {(describedBy) => (
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            value={draft.email}
            error={Boolean(errors.email)}
            aria-describedby={describedBy}
            onChange={(event) => field('email', event.target.value)}
          />
        )}
      </SettingRow>

      <SettingRow id="profile-title" label="Job title" description="Your role in the team" changed={was('title')}>
        {(describedBy) => (
          <Input
            id="profile-title"
            autoComplete="organization-title"
            value={draft.title}
            aria-describedby={describedBy}
            onChange={(event) => field('title', event.target.value)}
          />
        )}
      </SettingRow>
    </>
  );
}
