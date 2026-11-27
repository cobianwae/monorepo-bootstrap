import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  InputOTP,
  Switch,
  toast,
} from '@ds/ui';
import { SettingRow } from './setting-row';

type PasswordKey = 'current' | 'next' | 'confirm';
type PasswordValues = Record<PasswordKey, string>;
type PasswordErrors = Partial<PasswordValues>;

const EMPTY_PASSWORD: PasswordValues = { current: '', next: '', confirm: '' };

const PASSWORD_FIELDS: { key: PasswordKey; id: string; label: string; description?: string; autoComplete: string }[] = [
  { key: 'current', id: 'current-password', label: 'Current password', autoComplete: 'current-password' },
  { key: 'next', id: 'new-password', label: 'New password', description: 'At least 8 characters', autoComplete: 'new-password' },
  { key: 'confirm', id: 'confirm-password', label: 'Confirm new password', autoComplete: 'new-password' },
];

/** State Security hidup di sini agar tidak hilang saat panel berpindah. */
export function useSecurity() {
  const [password, setPassword] = React.useState(EMPTY_PASSWORD);
  const [errors, setErrors] = React.useState<PasswordErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [relogin, setRelogin] = React.useState(true);
  const [timeout, setSessionTimeout] = React.useState(false);

  return {
    password, setPassword,
    errors, setErrors,
    saving, setSaving,
    twoFactor, setTwoFactor,
    relogin, setRelogin,
    timeout, setSessionTimeout,
  };
}

function GroupHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-l-2 border-b-border border-l-transparent bg-muted/40 px-4 py-2 sm:px-5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export function SecurityPanel({ security }: { security: ReturnType<typeof useSecurity> }) {
  const { password, setPassword, errors, setErrors, saving, setSaving, twoFactor, setTwoFactor } = security;
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  // 0 = tanpa error; naik tiap percobaan gagal agar fokus dipindah lagi.
  const [otpAttempt, setOtpAttempt] = React.useState(0);
  const otpRef = React.useRef<HTMLDivElement>(null);

  // InputOTP tidak meneruskan aria-describedby, jadi atributnya dipasang langsung ke tiap input.
  React.useEffect(() => {
    const inputs = Array.from(otpRef.current?.querySelectorAll('input') ?? []);
    for (const input of inputs) {
      if (otpAttempt > 0) {
        input.setAttribute('aria-describedby', 'otp-error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-describedby');
        input.removeAttribute('aria-invalid');
      }
    }
    if (otpAttempt > 0) (inputs.find((input) => !input.value) ?? inputs[0])?.focus();
  }, [otpAttempt]);

  const closeOtp = () => {
    setOtpOpen(false);
    setOtp('');
    setOtpAttempt(0);
  };

  const handleUpdatePassword = () => {
    const next: PasswordErrors = {};
    if (!password.current) next.current = 'Enter your current password.';
    if (password.next.length < 8) next.next = 'New password must be at least 8 characters.';
    if (password.confirm !== password.next) next.confirm = 'New password and confirmation do not match.';
    setErrors(next);
    const firstInvalid = PASSWORD_FIELDS.find((field) => next[field.key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid.id)?.focus();
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setPassword(EMPTY_PASSWORD);
      toast({ variant: 'success', title: 'Password updated', description: 'Your password has been changed successfully.' });
    }, 800);
  };

  const handleTwoFactor = (checked: boolean) => {
    if (checked) {
      setOtpOpen(true);
      return;
    }
    setTwoFactor(false);
    toast({
      variant: 'info',
      title: 'Two-factor authentication disabled',
      description: 'You can re-enable it anytime from Security settings.',
    });
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setOtpAttempt((attempt) => attempt + 1);
      return;
    }
    setTwoFactor(true);
    closeOtp();
    toast({
      variant: 'success',
      title: 'Two-factor authentication enabled',
      description: 'Your account now requires a 6-digit code at sign-in.',
    });
  };

  const toggles = [
    {
      id: 'weekly-relogin',
      label: 'Require re-login every 7 days',
      description: 'Sign in again once a week.',
      checked: security.relogin,
      onChange: security.setRelogin,
      toastName: 'Weekly re-login',
    },
    {
      id: 'session-timeout',
      label: 'Session timeout',
      description: 'End idle sessions automatically after 30 minutes.',
      checked: security.timeout,
      onChange: security.setSessionTimeout,
      toastName: 'Session timeout',
    },
  ];

  return (
    <>
      <GroupHeading title="Password" note="Changes when you choose Update password" />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleUpdatePassword();
        }}
        className="border-b border-border"
      >
        {PASSWORD_FIELDS.map((field) => (
          <SettingRow
            key={field.key}
            id={field.id}
            label={field.label}
            description={field.description}
            error={errors[field.key]}
          >
            {(describedBy) => (
              <Input
                id={field.id}
                type="password"
                autoComplete={field.autoComplete}
                value={password[field.key]}
                error={Boolean(errors[field.key])}
                aria-describedby={describedBy}
                onChange={(event) => {
                  const { value } = event.target;
                  setPassword((previous) => ({ ...previous, [field.key]: value }));
                  if (errors[field.key]) setErrors((previous) => ({ ...previous, [field.key]: undefined }));
                }}
              />
            )}
          </SettingRow>
        ))}
        <div className="flex justify-end px-4 py-3 sm:px-5">
          <Button type="submit" variant="outline" loading={saving} className="pointer-coarse:min-h-11">
            Update password
          </Button>
        </div>
      </form>

      <GroupHeading title="Sign-in protection" note="Applies instantly; two-factor asks for a code" />
      <SettingRow id="two-factor" label="Two-factor authentication" description="Require a one-time code when signing in." inline>
        {(describedBy) => (
          <Switch id="two-factor" aria-describedby={describedBy} checked={twoFactor} onCheckedChange={handleTwoFactor} />
        )}
      </SettingRow>
      {toggles.map((toggle) => (
        <SettingRow key={toggle.id} id={toggle.id} label={toggle.label} description={toggle.description} inline>
          {(describedBy) => (
            <Switch
              id={toggle.id}
              aria-describedby={describedBy}
              checked={toggle.checked}
              onCheckedChange={(checked) => {
                toggle.onChange(checked);
                toast({
                  variant: 'success',
                  title: `${toggle.toastName} ${checked ? 'enabled' : 'disabled'}`,
                  description: 'Your preference has been saved.',
                });
              }}
            />
          )}
        </SettingRow>
      ))}

      <Dialog open={otpOpen} onOpenChange={(open) => (open ? setOtpOpen(true) : closeOtp())}>
        <DialogContent
          // Dialog dibuka oleh switch, bukan DialogTrigger, jadi fokus dikembalikan sendiri.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById('two-factor')?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Enable two-factor authentication</DialogTitle>
            <DialogDescription>Enter the 6-digit code shown by your authenticator app to confirm.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <InputOTP
              ref={otpRef}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setOtpAttempt(0);
              }}
              length={6}
              error={otpAttempt > 0}
              label="Verification code"
            />
            {otpAttempt > 0 && (
              <p id="otp-error" className="text-xs font-medium text-destructive">
                Enter all 6 digits to continue.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeOtp}>
              Cancel
            </Button>
            <Button onClick={handleVerify}>Verify &amp; enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
