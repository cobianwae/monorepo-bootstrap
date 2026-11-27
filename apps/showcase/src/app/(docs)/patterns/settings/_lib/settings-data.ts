import { AlertTriangle, Building2, Palette, Shield, User, Users, type LucideIcon } from 'lucide-react';

export type PanelId = 'profile' | 'security' | 'appearance' | 'general' | 'members' | 'danger';

export interface NavItem {
  id: PanelId;
  label: string;
  icon: LucideIcon;
}

export const PANELS: Record<PanelId, NavItem> = {
  profile: { id: 'profile', label: 'Profile', icon: User },
  security: { id: 'security', label: 'Security', icon: Shield },
  appearance: { id: 'appearance', label: 'Appearance', icon: Palette },
  general: { id: 'general', label: 'General', icon: Building2 },
  members: { id: 'members', label: 'Members', icon: Users },
  danger: { id: 'danger', label: 'Danger zone', icon: AlertTriangle },
};

export const NAV_GROUPS: { label: string; items: PanelId[] }[] = [
  { label: 'Account', items: ['profile', 'security', 'appearance'] },
  { label: 'Workspace', items: ['general', 'members'] },
];

export const SAVE_MODES: Partial<Record<PanelId, string>> = {
  profile: 'Saved on Save',
  appearance: 'Applies instantly',
  general: 'Saved on Save',
  members: 'Applies instantly',
  danger: 'Asks for confirmation',
};

export interface SearchEntry {
  panel: PanelId;
  name: string;
  description: string;
  keywords: string;
  /** id elemen yang difokuskan setelah panel dibuka. */
  controlId: string;
}

export const SEARCH_INDEX: SearchEntry[] = [
  { panel: 'profile', name: 'Photo', description: 'JPG, PNG or GIF, up to 2 MB', keywords: 'avatar picture image upload', controlId: 'profile-avatar' },
  { panel: 'profile', name: 'Full name', description: 'Shown to the rest of the workspace', keywords: 'display name', controlId: 'profile-name' },
  { panel: 'profile', name: 'Email', description: 'Used to sign in and for notifications', keywords: 'address mail login', controlId: 'profile-email' },
  { panel: 'profile', name: 'Job title', description: 'Your role in the team', keywords: 'position', controlId: 'profile-title' },
  { panel: 'security', name: 'Password', description: 'At least 8 characters', keywords: 'change credentials', controlId: 'current-password' },
  { panel: 'security', name: 'Two-factor authentication', description: 'Require a one-time code when signing in', keywords: '2fa otp authenticator code', controlId: 'two-factor' },
  { panel: 'security', name: 'Require re-login every 7 days', description: 'Sign in again once a week', keywords: 'weekly session', controlId: 'weekly-relogin' },
  { panel: 'security', name: 'Session timeout', description: 'End idle sessions after 30 minutes', keywords: 'idle sign out', controlId: 'session-timeout' },
  { panel: 'appearance', name: 'Color scheme', description: 'Light, dark or system', keywords: 'theme mode', controlId: 'color-scheme' },
  { panel: 'appearance', name: 'Art direction', description: 'Fonts, motifs and tones', keywords: 'atelier aurora blueprint style', controlId: 'art-direction' },
  { panel: 'general', name: 'Workspace name', description: 'The name your team sees', keywords: 'rename organisation', controlId: 'workspace-name' },
  { panel: 'general', name: 'Workspace URL', description: 'Built from the workspace name', keywords: 'address domain slug link', controlId: 'workspace-url' },
  { panel: 'general', name: 'Timezone', description: 'Used for dates across the workspace', keywords: 'region time', controlId: 'workspace-timezone' },
  { panel: 'general', name: 'Default language', description: 'Language for new members', keywords: 'locale', controlId: 'workspace-language' },
  { panel: 'members', name: 'Invite member', description: 'Add someone by email', keywords: 'add people team', controlId: 'new-member-email' },
  { panel: 'members', name: 'Member roles', description: 'Change or remove access', keywords: 'admin editor viewer permissions remove', controlId: 'member-list' },
  { panel: 'danger', name: 'Transfer ownership', description: 'Hand the workspace to another admin', keywords: 'owner', controlId: 'transfer-ownership' },
  { panel: 'danger', name: 'Delete workspace', description: 'Permanently remove everything', keywords: 'remove erase close', controlId: 'delete-workspace' },
];

export function searchSettings(query: string): SearchEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return SEARCH_INDEX.filter((entry) =>
    `${entry.name} ${entry.description} ${entry.keywords}`.toLowerCase().includes(needle)
  );
}

export type ProfileValues = {
  avatar: string | null;
  name: string;
  email: string;
  title: string;
};

export const SAVED_PROFILE: ProfileValues = {
  avatar: null,
  name: 'Ava Laurent',
  email: 'ava@acme.io',
  title: 'Product Designer',
};

/** Demo dibuka dengan satu perubahan belum disimpan agar state intinya langsung terlihat. */
export const INITIAL_PROFILE_DRAFT: ProfileValues = { ...SAVED_PROFILE, title: 'Design Lead' };

export type WorkspaceValues = {
  name: string;
  timezone: string;
  language: string;
};

export const SAVED_WORKSPACE: WorkspaceValues = {
  name: 'Acme Innovations',
  timezone: 'Asia/Jakarta',
  language: 'en',
};

export const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'ja', label: '日本語' },
  { value: 'de', label: 'Deutsch' },
];

export type MemberRole = 'admin' | 'editor' | 'viewer';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

export const ROLES: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Sarah Chen', email: 'sarah@acme.io', role: 'admin' },
  { id: 'm2', name: 'Marcus Reed', email: 'marcus@acme.io', role: 'editor' },
  { id: 'm3', name: 'Priya Patel', email: 'priya@acme.io', role: 'viewer' },
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function validateAvatar(file: { type: string; size: number }): string | undefined {
  if (!AVATAR_TYPES.includes(file.type)) return 'Choose a JPG, PNG or GIF file.';
  if (file.size > AVATAR_MAX_BYTES) return 'Choose an image of 2 MB or less.';
  return undefined;
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
