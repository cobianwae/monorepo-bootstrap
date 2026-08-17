'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
  Alert,
  AlertTitle,
  AlertDescription,
  toast,
} from '@ds/ui';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

export default function AuthPage() {
  const [activeTab, setActiveTab] = React.useState('login');
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [otpCode, setOtpCode] = React.useState<string[]>(['5', '2', '8', '', '', '']);
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(30);

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Password strength checklist
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasUppercase, hasSpecial].filter(Boolean).length;

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSimulateSubmit = (msg: string) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(msg);
      toast({
        variant: 'success',
        title: 'Authentication Successful',
        description: msg,
      });
    }, 900);
  };

  const handleSimulateError = () => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setTimeout(() => {
      setIsLoading(false);
      setErrorMsg('Invalid credentials provided. 2 attempts remaining before lock.');
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Invalid credentials or expired 2FA session token.',
      });
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '');
    const next = [...otpCode];

    if (cleaned.length === 0) {
      next[index] = '';
      setOtpCode(next);
      return;
    }

    // Handle single digit
    next[index] = cleaned[cleaned.length - 1];
    setOtpCode(next);

    // Auto-advance focus
    if (index < 5 && cleaned.length > 0) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const next = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      next[i] = pastedData[i];
    }
    setOtpCode(next);

    const nextFocusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Authentication & Security Flows"
        description="Robust, accessible authentication patterns: Sign In, Registration with interactive password strength scoring, 2FA OTP verification, and password recovery."
      />

      <div className="mx-auto max-w-lg space-y-4">
        {/* Simulated Alerts */}
        {errorMsg && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setErrorMsg(null); setSuccessMsg(null); }} className="w-full">
          <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <TabsList className="grid w-full min-w-[420px] grid-cols-4 sm:min-w-0">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="2fa">2FA OTP</TabsTrigger>
            <TabsTrigger value="forgot">Reset</TabsTrigger>
          </TabsList>
          </div>

          {/* Tab 1: Sign In */}
          <TabsContent value="login">
            <Card className="border-border shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>
                  Enter your enterprise credentials to access your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Work Email</Label>
                  <Input id="login-email" type="email" defaultValue="alex@acme.io" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-pwd">Password</Label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-pwd"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="SecretP@ssw0rd123"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" defaultChecked />
                    <Label htmlFor="remember" className="text-xs cursor-pointer">
                      Remember device for 30 days
                    </Label>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full"
                    loading={isLoading}
                    onClick={() => handleSimulateSubmit('Signed in successfully!')}
                  >
                    Sign In
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-destructive"
                    onClick={handleSimulateError}
                  >
                    Simulate Auth Error Failure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Register */}
          <TabsContent value="register">
            <Card className="border-border shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>
                  Start your 14-day enterprise pilot trial. No credit card required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Work Email</Label>
                  <Input id="reg-email" type="email" placeholder="name@company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-pwd">Create Password</Label>
                  <Input
                    id="reg-pwd"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* Dynamic Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Strength</span>
                        <span className="font-medium text-foreground">
                          {strengthScore <= 1
                            ? 'Weak'
                            : strengthScore <= 3
                            ? 'Moderate'
                            : 'Strong'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            strengthScore <= 1
                              ? 'bg-destructive w-1/4'
                              : strengthScore === 2
                              ? 'bg-warning w-2/4'
                              : strengthScore === 3
                              ? 'bg-info w-3/4'
                              : 'bg-success w-full'
                          }`}
                        />
                      </div>

                      <ul className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground pt-1">
                        <li className={`flex items-center gap-1 ${hasMinLength ? 'text-success font-medium' : ''}`}>
                          <CheckCircle2 className="h-3 w-3" /> 8+ Characters
                        </li>
                        <li className={`flex items-center gap-1 ${hasNumber ? 'text-success font-medium' : ''}`}>
                          <CheckCircle2 className="h-3 w-3" /> Includes Number
                        </li>
                        <li className={`flex items-center gap-1 ${hasUppercase ? 'text-success font-medium' : ''}`}>
                          <CheckCircle2 className="h-3 w-3" /> Uppercase Letter
                        </li>
                        <li className={`flex items-center gap-1 ${hasSpecial ? 'text-success font-medium' : ''}`}>
                          <CheckCircle2 className="h-3 w-3" /> Special Character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  loading={isLoading}
                  onClick={() => handleSimulateSubmit('Account created! Please check your email for confirmation.')}
                >
                  Create Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: 2FA OTP */}
          <TabsContent value="2fa">
            <Card className="border-border shadow-md text-center">
              <CardHeader className="space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Enter the 6-digit verification code generated by your authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 6-Digit Code Input Box with Auto-Advance, Paste & A11y */}
                <div className="flex justify-center gap-2" role="group" aria-label="Two-factor 6-digit verification code">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      aria-label={`Verification code digit ${idx + 1} of 6`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-9 rounded-lg border border-input bg-background text-center text-lg font-bold font-mono shadow-xs focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none sm:w-11"
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive code?{' '}
                  <button
                    disabled={resendCooldown > 0}
                    onClick={() => {
                      setResendCooldown(30);
                      toast({
                        variant: 'info',
                        title: 'SMS Code Resent',
                        description: 'A new 6-digit verification SMS was dispatched.',
                      });
                    }}
                    className="text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Resend SMS Code {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                  </button>
                </p>

                <Button
                  className="w-full"
                  loading={isLoading}
                  onClick={() => handleSimulateSubmit('2FA Verification successful!')}
                >
                  Verify & Continue
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Reset */}
          <TabsContent value="forgot">
            <Card className="border-border shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Reset password</CardTitle>
                <CardDescription>
                  Enter your email address and we will send a password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Work Email</Label>
                  <Input id="reset-email" type="email" placeholder="name@company.com" />
                </div>

                <Button
                  className="w-full"
                  loading={isLoading}
                  onClick={() => handleSimulateSubmit('Password reset link sent to your inbox!')}
                >
                  Send Reset Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
