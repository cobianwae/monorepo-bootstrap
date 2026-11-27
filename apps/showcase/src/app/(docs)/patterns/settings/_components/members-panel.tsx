import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  Button,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@ds/ui';
import { Trash2, Users } from 'lucide-react';
import { EMAIL_REGEX, ROLES, initialsOf, type Member, type MemberRole } from '../_lib/settings-data';

/** Isian undangan hidup di halaman agar tidak hilang saat panel berpindah. */
export function useInvite() {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<MemberRole>('viewer');
  const [error, setError] = React.useState<string>();
  return { email, setEmail, role, setRole, error, setError };
}

export interface MembersPanelProps {
  invite: ReturnType<typeof useInvite>;
  members: Member[];
  onMembersChange: React.Dispatch<React.SetStateAction<Member[]>>;
}

function RoleOptions() {
  return (
    <SelectContent>
      {ROLES.map((role) => (
        <SelectItem key={role.value} value={role.value}>
          {role.label}
        </SelectItem>
      ))}
    </SelectContent>
  );
}

export function MembersPanel({ invite, members, onMembersChange }: MembersPanelProps) {
  const { email, setEmail, role, setRole, error, setError } = invite;
  const emailRef = React.useRef<HTMLInputElement>(null);

  const fail = (message: string) => {
    setError(message);
    emailRef.current?.focus();
  };

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return fail('Enter an email address to invite.');
    if (!EMAIL_REGEX.test(address)) return fail('Enter a valid email address, e.g. name@company.com.');
    if (members.some((member) => member.email.toLowerCase() === address.toLowerCase())) {
      return fail('That member is already in the workspace.');
    }
    setError(undefined);
    onMembersChange((previous) => [
      ...previous,
      { id: `m${Date.now()}`, name: address.split('@')[0], email: address, role },
    ]);
    setEmail('');
    toast({ variant: 'success', title: 'Member invited', description: `${address} added as ${role}.` });
  };

  const handleRemove = (removed: Member) => {
    onMembersChange((previous) => previous.filter((member) => member.id !== removed.id));
    toast({ variant: 'info', title: 'Member removed', description: `${removed.email} removed from the workspace.` });
  };

  return (
    <>
      <form noValidate onSubmit={handleInvite} className="space-y-2 border-b border-l-2 border-b-border border-l-transparent px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 @xl:flex-row">
          <Input
            ref={emailRef}
            id="new-member-email"
            type="email"
            aria-label="New member email"
            aria-describedby={error ? 'new-member-email-error' : undefined}
            error={Boolean(error)}
            value={email}
            placeholder="colleague@company.com"
            onChange={(event) => {
              setEmail(event.target.value);
              setError(undefined);
            }}
          />
          <div className="flex gap-2">
            <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
              <SelectTrigger className="w-32" aria-label="New member role">
                <SelectValue />
              </SelectTrigger>
              <RoleOptions />
            </Select>
            <Button type="submit" variant="outline" className="shrink-0 pointer-coarse:min-h-11">
              Invite
            </Button>
          </div>
        </div>
        {error && (
          <p id="new-member-email-error" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </form>

      <div id="member-list" tabIndex={-1} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        {members.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              icon={Users}
              title="No members in this workspace"
              description="Invite your teammates above to start collaborating."
            />
          </div>
        ) : (
          <ul aria-label="Members" className="divide-y divide-border">
            {members.map((member) => (
              <li key={member.id} className="flex flex-col gap-3 border-l-2 border-l-transparent px-4 py-3 @md:flex-row @md:items-center @md:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initialsOf(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      onMembersChange((previous) =>
                        previous.map((item) => (item.id === member.id ? { ...item, role: value as MemberRole } : item))
                      )
                    }
                  >
                    <SelectTrigger className="w-28" aria-label={`Role for ${member.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <RoleOptions />
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${member.email}`}
                    className="text-destructive hover:text-destructive pointer-coarse:h-11 pointer-coarse:w-11"
                    onClick={() => handleRemove(member)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
