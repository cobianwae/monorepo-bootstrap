'use client';

import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  Label,
  Separator,
  Skeleton,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SegmentedControl,
  SegmentedControlItem,
  EmptyState,
  Banner,
  toast,
  useTheme,
  InputOTP,
} from '@ds/ui';
import type { ArtDirectionId } from '@ds/tokens';
import {
  Settings,
  User,
  Building2,
  Palette,
  Shield,
  AlertTriangle,
  Camera,
  Save,
  Plus,
  Trash2,
  Globe,
  Sun,
  Moon,
  Monitor,
  Lock,
  Users,
  Smartphone,
  KeyRound,
  Clock,
  RotateCcw,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type MemberRole = 'admin' | 'editor' | 'viewer';

interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'danger-zone', label: 'Danger Zone', icon: AlertTriangle },
] as const;

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Sarah Chen', email: 'sarah@acme.io', role: 'admin' },
  { id: 'm2', name: 'Marcus Reed', email: 'marcus@acme.io', role: 'editor' },
  { id: 'm3', name: 'Priya Patel', email: 'priya@acme.io', role: 'viewer' },
];

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme, artDirection, setArtDirection } = useTheme();

  const [pageLoading, setPageLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('profile');

  React.useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ----- Profile -----
  const [name, setName] = React.useState('Ava Laurent');
  const [email, setEmail] = React.useState('ava@acme.io');
  const [title, setTitle] = React.useState('Product Designer');
  const [savedName, setSavedName] = React.useState('Ava Laurent');
  const [savedEmail, setSavedEmail] = React.useState('ava@acme.io');
  const [savedTitle, setSavedTitle] = React.useState('Product Designer');
  const [profileErrors, setProfileErrors] = React.useState<{
    name?: string;
    email?: string;
  }>({});
  const [savingProfile, setSavingProfile] = React.useState(false);
  const avatarFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [savedAvatarPreview, setSavedAvatarPreview] = React.useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = React.useState(false);

  const profileDirty =
    name !== savedName ||
    email !== savedEmail ||
    title !== savedTitle ||
    avatarChanged;

  const handleAvatarPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setAvatarChanged(true);
    toast({
      variant: 'success',
      title: 'Avatar selected',
      description: `"${file.name}" will be applied when you save your profile.`,
    });
    event.target.value = '';
  };

  const handleSaveProfile = () => {
    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Enter a valid email address, e.g. name@company.com.';
    }
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      setSavedName(name);
      setSavedEmail(email);
      setSavedTitle(title);
      setSavedAvatarPreview(avatarPreview);
      setAvatarChanged(false);
      toast({
        variant: 'success',
        title: 'Profile saved',
        description: 'Your profile information has been updated.',
      });
    }, 800);
  };

  const handleRevertProfile = () => {
    setName(savedName);
    setEmail(savedEmail);
    setTitle(savedTitle);
    setAvatarPreview(savedAvatarPreview);
    setAvatarChanged(false);
    setProfileErrors({});
    toast({
      variant: 'info',
      title: 'Changes reverted',
      description: 'Your profile is back to the last saved state.',
    });
  };

  // ----- Workspace -----
  const [workspaceName, setWorkspaceName] = React.useState('Acme Innovations');
  const [timezone, setTimezone] = React.useState('Asia/Jakarta');
  const [language, setLanguage] = React.useState('en');
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState<MemberRole>('viewer');
  const [memberError, setMemberError] = React.useState<string | null>(null);

  const workspaceSlug = makeSlug(workspaceName) || 'acme-innovations';

  const handleAddMember = () => {
    setMemberError(null);
    if (!newMemberEmail.trim()) {
      setMemberError('Enter an email address to invite.');
      return;
    }
    if (!EMAIL_REGEX.test(newMemberEmail)) {
      setMemberError('Enter a valid email address, e.g. name@company.com.');
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      setMemberError('That member is already in the workspace.');
      return;
    }
    const id = `m${Date.now()}`;
    const email = newMemberEmail.trim();
    setMembers((prev) => [...prev, { id, name: email.split('@')[0], email, role: newMemberRole }]);
    setNewMemberEmail('');
    toast({
      variant: 'success',
      title: 'Member invited',
      description: `${email} added as ${newMemberRole}.`,
    });
  };

  const handleRemoveMember = (id: string) => {
    const removed = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (removed) {
      toast({
        variant: 'info',
        title: 'Member removed',
        description: `${removed.email} removed from the workspace.`,
      });
    }
  };

  const handleSaveWorkspace = () => {
    toast({
      variant: 'success',
      title: 'Workspace settings saved',
      description: `Workspace "${workspaceName}" updated successfully.`,
    });
  };

  // ----- Security -----
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [nextPassword, setNextPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordErrors, setPasswordErrors] = React.useState<PasswordErrors>({});
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [otpError, setOtpError] = React.useState(false);
  const [reloginEnabled, setReloginEnabled] = React.useState(true);
  const [timeoutEnabled, setTimeoutEnabled] = React.useState(false);

  const handleUpdatePassword = () => {
    const nextErrors: PasswordErrors = {};
    if (!currentPassword) {
      nextErrors.current = 'Enter your current password.';
    }
    if (nextPassword.length < 8) {
      nextErrors.next = 'New password must be at least 8 characters.';
    }
    if (confirmPassword !== nextPassword) {
      nextErrors.confirm = 'New password and confirmation do not match.';
    }
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      toast({
        variant: 'success',
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
    }, 800);
  };

  const handleTwoFaToggle = (checked: boolean) => {
    if (checked) {
      setOtpOpen(true);
      return;
    }
    setTwoFaEnabled(false);
    toast({
      variant: 'info',
      title: 'Two-factor authentication disabled',
      description: 'You can re-enable it anytime from Security settings.',
    });
  };

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      setOtpError(true);
      return;
    }
    setTwoFaEnabled(true);
    setOtpOpen(false);
    setOtpValue('');
    setOtpError(false);
    toast({
      variant: 'success',
      title: 'Two-factor authentication enabled',
      description: 'Your account now requires a 6-digit code at sign-in.',
    });
  };

  // ----- Danger Zone -----
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTyped, setDeleteTyped] = React.useState('');
  const [transferOpen, setTransferOpen] = React.useState(false);

  const confirmDelete = () => {
    setDeleteOpen(false);
    setDeleteTyped('');
    toast({
      variant: 'destructive',
      title: 'Workspace deleted',
      description: 'Acme Innovations and all of its data were permanently removed.',
    });
  };

  const confirmTransfer = () => {
    setTransferOpen(false);
    toast({
      variant: 'success',
      title: 'Ownership transferred',
      description: 'Ownership was transferred to sarah@acme.io. They will be notified.',
    });
  };

  if (pageLoading) {
    return (
      <div className="space-y-10 animate-in fade-in-50 duration-200">
        <PageHeader
          eyebrow="UX Recipe Scenario"
          eyebrowIcon={Settings}
          title="Settings & Preferences"
          description="A polished, multi-tab settings panel with inline validation, dirty-state tracking, theme controls, security toggles, and a guarded danger zone."
        />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <Skeleton className="h-64 w-full lg:w-60" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Settings}
        title="Settings & Preferences"
        description="A polished, multi-tab settings panel with inline validation, dirty-state tracking, theme controls, security toggles, and a guarded danger zone."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:sticky lg:top-24 lg:w-60 lg:shrink-0">
            <div className="mb-4 lg:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full" aria-label="Settings section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {SETTINGS_TABS.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsList className="hidden h-auto w-full flex-col items-stretch gap-1 rounded-xl border border-border bg-card p-2 lg:flex">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isDirty = tab.id === 'profile' && profileDirty;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="justify-start gap-2.5 rounded-lg px-3 py-2.5 text-sm data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isDirty && (
                      <span
                        aria-label="Unsaved changes"
                        className="h-2 w-2 shrink-0 rounded-full bg-highlight"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
            <TabsContent value="profile">
              <section id="profile" className="space-y-4 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <User className="h-6 w-6 text-highlight" />
                  <span>Profile</span>
                </h2>

                {profileDirty && (
                  <Banner
                    variant="warning"
                    dismissible={false}
                    icon={AlertTriangle}
                  >
                    You have unsaved changes to your profile. Save or revert before leaving.
                  </Banner>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Profile information</CardTitle>
                    <CardDescription>
                      How you appear to the rest of the workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Avatar size="xl" className="h-20 w-20">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Profile avatar preview" />
                        ) : (
                          <AvatarFallback>{initialsOf(name || 'Ava Laurent')}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => document.getElementById('avatar-file-input')?.click()}
                        >
                          <Camera className="h-3.5 w-3.5" />
                          Change avatar
                        </Button>
                        <input
                          id="avatar-file-input"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          ref={avatarFileInputRef}
                          onChange={handleAvatarPick}
                        />
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max 2MB.
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full name</Label>
                        <Input
                          id="profile-name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (profileErrors.name) {
                              setProfileErrors((prev) => ({ ...prev, name: undefined }));
                            }
                          }}
                          error={Boolean(profileErrors.name)}
                          placeholder="e.g. Ava Laurent"
                        />
                        {profileErrors.name && (
                          <p className="text-xs font-medium text-destructive">
                            {profileErrors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Email address</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (profileErrors.email) {
                              setProfileErrors((prev) => ({ ...prev, email: undefined }));
                            }
                          }}
                          error={Boolean(profileErrors.email)}
                          placeholder="name@company.com"
                        />
                        {profileErrors.email && (
                          <p className="text-xs font-medium text-destructive">
                            {profileErrors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="profile-title">Job title</Label>
                        <Input
                          id="profile-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Product Designer"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleRevertProfile}
                      disabled={!profileDirty || savingProfile}
                      className="gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Revert
                    </Button>
                    <Button onClick={handleSaveProfile} loading={savingProfile} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="workspace">
              <section id="workspace" className="space-y-4 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-highlight" />
                  <span>Workspace</span>
                </h2>

                <Card>
                  <CardHeader>
                    <CardTitle>Workspace identity</CardTitle>
                    <CardDescription>
                      Naming, region and language defaults for your team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="workspace-name">Workspace name</Label>
                      <Input
                        id="workspace-name"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Workspace URL</Label>
                      <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-highlight" />
                        <span className="truncate">https://{workspaceSlug}.acme.io</span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="workspace-timezone">Timezone</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger id="workspace-timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Jakarta">Jakarta (GMT+7)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workspace-language">Default language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger id="workspace-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end border-t border-border">
                    <Button onClick={handleSaveWorkspace} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Save workspace
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>
                      Manage roles and access for people in this workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={newMemberEmail}
                        onChange={(e) => {
                          setNewMemberEmail(e.target.value);
                          if (memberError) setMemberError(null);
                        }}
                        error={Boolean(memberError)}
                        placeholder="colleague@company.com"
                        className="sm:max-w-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                      />
                      <div className="flex gap-2">
                        <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as MemberRole)}>
                          <SelectTrigger className="w-32" aria-label="New member role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddMember} className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                    {memberError && (
                      <p className="text-xs font-medium text-destructive">{memberError}</p>
                    )}

                    {members.length === 0 ? (
                      <EmptyState
                        icon={Users}
                        title="No members in this workspace"
                        description="Invite your teammates above to start collaborating."
                      />
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-border">
                        <div className="divide-y divide-border">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar size="sm">
                                  <AvatarFallback>{initialsOf(member.name)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {member.name}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:shrink-0">
                                <Select
                                  value={member.role}
                                  onValueChange={(v) =>
                                    setMembers((prev) =>
                                      prev.map((m) =>
                                        m.id === member.id ? { ...m, role: v as MemberRole } : m
                                      )
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-28" aria-label={`Role for ${member.name}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Remove ${member.email}`}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="appearance">
              <section id="appearance" className="space-y-4 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <Palette className="h-6 w-6 text-highlight" />
                  <span>Appearance</span>
                </h2>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme &amp; direction</CardTitle>
                      <CardDescription>
                        Choose a color scheme and art direction for this workspace.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <Label>Color scheme</Label>
                        <SegmentedControl
                          type="single"
                          value={theme}
                          onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                          className="w-full"
                        >
                          <SegmentedControlItem value="light" className="flex-1">
                            <Sun className="h-3.5 w-3.5" />
                            Light
                          </SegmentedControlItem>
                          <SegmentedControlItem value="dark" className="flex-1">
                            <Moon className="h-3.5 w-3.5" />
                            Dark
                          </SegmentedControlItem>
                          <SegmentedControlItem value="system" className="flex-1">
                            <Monitor className="h-3.5 w-3.5" />
                            System
                          </SegmentedControlItem>
                        </SegmentedControl>
                        <p className="text-xs text-muted-foreground">
                          Resolved mode: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="art-direction">Art direction</Label>
                        <Select
                          value={artDirection}
                          onValueChange={(v) => setArtDirection(v as ArtDirectionId)}
                        >
                          <SelectTrigger id="art-direction">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="atelier">Atelier</SelectItem>
                            <SelectItem value="aurora">Aurora</SelectItem>
                            <SelectItem value="blueprint">Blueprint</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Changes the accent tones used across the interface.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Live preview</CardTitle>
                      <CardDescription>
                        Updates instantly with your current theme and palette.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-xs">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight text-sm font-bold text-highlight-foreground">
                              A
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                Acme Workspace
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'} · {artDirection}
                              </p>
                            </div>
                          </div>
                          <Badge variant="highlight-outline" className="shrink-0 capitalize">
                            {theme}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          {[
                            { swatch: 'bg-primary', label: 'Primary' },
                            { swatch: 'bg-highlight', label: 'Highlight' },
                            { swatch: 'bg-success', label: 'Success' },
                            { swatch: 'bg-warning', label: 'Warning' },
                            { swatch: 'bg-destructive', label: 'Destructive' },
                          ].map((color) => (
                            <div
                              key={color.label}
                              aria-label={`${color.label} swatch`}
                              className={`h-8 w-8 rounded-lg ${color.swatch}`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-2/3 rounded-full bg-highlight" />
                          </div>
                          <span className="text-xs text-muted-foreground">Sample progress</span>
                        </div>

                        <Button size="sm" variant="highlight" className="pointer-events-none">
                          Sample button
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="security">
              <section id="security" className="space-y-4 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <Shield className="h-6 w-6 text-highlight" />
                  <span>Security</span>
                </h2>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-highlight" />
                      Change password
                    </CardTitle>
                    <CardDescription>
                      Use at least 8 characters. Avoid reusing passwords from other sites.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (passwordErrors.current) {
                            setPasswordErrors((prev) => ({ ...prev, current: undefined }));
                          }
                        }}
                        error={Boolean(passwordErrors.current)}
                      />
                      {passwordErrors.current && (
                        <p className="text-xs font-medium text-destructive">
                          {passwordErrors.current}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={nextPassword}
                          onChange={(e) => {
                            setNextPassword(e.target.value);
                            if (passwordErrors.next) {
                              setPasswordErrors((prev) => ({ ...prev, next: undefined }));
                            }
                          }}
                          error={Boolean(passwordErrors.next)}
                        />
                        {passwordErrors.next && (
                          <p className="text-xs font-medium text-destructive">
                            {passwordErrors.next}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passwordErrors.confirm) {
                              setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
                            }
                          }}
                          error={Boolean(passwordErrors.confirm)}
                        />
                        {passwordErrors.confirm && (
                          <p className="text-xs font-medium text-destructive">
                            {passwordErrors.confirm}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end border-t border-border">
                    <Button onClick={handleUpdatePassword} loading={savingPassword} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Update password
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sign-in protection</CardTitle>
                    <CardDescription>
                      Extra steps and controls that keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight/10 text-highlight">
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Two-factor authentication
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Require a one-time code when signing in.
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={twoFaEnabled}
                        onCheckedChange={handleTwoFaToggle}
                        aria-label="Toggle two-factor authentication"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight/10 text-highlight">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Require re-login every 7 days
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Members must re-authenticate on a weekly cadence.
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={reloginEnabled}
                        onCheckedChange={(checked) => {
                          setReloginEnabled(checked);
                          toast({
                            variant: 'success',
                            title: checked
                              ? 'Weekly re-login enabled'
                              : 'Weekly re-login disabled',
                            description: 'Your preference has been saved.',
                          });
                        }}
                        aria-label="Toggle weekly re-login"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight/10 text-highlight">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Session timeout</p>
                          <p className="text-xs text-muted-foreground">
                            End idle sessions automatically after 30 minutes.
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={timeoutEnabled}
                        onCheckedChange={(checked) => {
                          setTimeoutEnabled(checked);
                          toast({
                            variant: 'success',
                            title: checked ? 'Session timeout enabled' : 'Session timeout disabled',
                            description: 'Your preference has been saved.',
                          });
                        }}
                        aria-label="Toggle session timeout"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Dialog
                  open={otpOpen}
                  onOpenChange={(open) => {
                    setOtpOpen(open);
                    if (!open) {
                      setOtpValue('');
                      setOtpError(false);
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enable two-factor authentication</DialogTitle>
                      <DialogDescription>
                        Enter the 6-digit code shown by your authenticator app to confirm.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-2">
                      <InputOTP
                        value={otpValue}
                        onChange={setOtpValue}
                        length={6}
                        error={otpError}
                        label="Verification code"
                      />
                      {otpError && (
                        <p className="text-xs font-medium text-destructive">
                          Enter all 6 digits to continue.
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOtpOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleVerifyOtp} disabled={otpValue.length !== 6}>
                        Verify &amp; enable
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </section>
            </TabsContent>

            <TabsContent value="danger-zone">
              <section id="danger-zone" className="space-y-4 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-highlight" />
                  <span>Danger Zone</span>
                </h2>

                <Card className="border-destructive/40">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible actions for this workspace. Proceed with care.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">Delete workspace</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove the workspace, its members, and all data. This
                          cannot be undone.
                        </p>
                      </div>
                      <AlertDialog
                        open={deleteOpen}
                        onOpenChange={(open) => {
                          setDeleteOpen(open);
                          if (!open) setDeleteTyped('');
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                          >
                            Delete workspace
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently erase Acme Innovations, including members,
                              projects, and billing history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="delete-confirm" className="text-sm">
                              Type{' '}
                              <span className="font-mono font-bold text-destructive">DELETE</span>{' '}
                              to confirm
                            </Label>
                            <Input
                              id="delete-confirm"
                              value={deleteTyped}
                              onChange={(e) => setDeleteTyped(e.target.value)}
                              placeholder="DELETE"
                              className="font-mono"
                              error={deleteTyped !== '' && deleteTyped !== 'DELETE'}
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={deleteTyped !== 'DELETE'}
                              onClick={confirmDelete}
                            >
                              Delete workspace
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">Transfer ownership</p>
                        <p className="text-sm text-muted-foreground">
                          Hand over the workspace to another admin. You will lose admin rights.
                        </p>
                      </div>
                      <AlertDialog open={transferOpen} onOpenChange={setTransferOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 text-destructive hover:text-destructive"
                          >
                            Transfer ownership
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ownership will move to sarah@acme.io. You will become a regular
                              member and cannot undo this yourself.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={confirmTransfer}>
                              Transfer ownership
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
