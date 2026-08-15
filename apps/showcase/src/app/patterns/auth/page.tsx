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
} from '@ds/ui';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Github,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function AuthPatternPage() {
  const [activeTab, setActiveTab] = React.useState('login');
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [otpCode, setOtpCode] = React.useState(['5', '2', '8', '', '', '']);
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Password strength checklist
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasUppercase, hasSpecial].filter(Boolean).length;

  const handleSimulateSubmit = (msg: string) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(msg);
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length <= 1) {
      const next = [...otpCode];
      next[index] = val;
      setOtpCode(next);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Authentication & Security Flows"
        description="Robust, accessible authentication patterns: Sign In, Registration with interactive password strength scoring, 2FA OTP verification, and password recovery."
      />

      <div className="mx-auto max-w-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="2fa">2FA OTP</TabsTrigger>
            <TabsTrigger value="forgot">Reset</TabsTrigger>
          </TabsList>

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
                {successMsg && (
                  <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMsg}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" defaultValue="alex@acme.io" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pwd">Password</Label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="pwd"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="SecretP@ssw0rd123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-xs cursor-pointer">
                    Remember this device for 30 days
                  </Label>
                </div>

                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => handleSimulateSubmit('Successfully authenticated!')}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Github className="h-4 w-4" />
                  Continue with GitHub SSO
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Register */}
          <TabsContent value="register">
            <Card className="border-border shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>
                  Start your 14-day free trial with full enterprise features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input id="reg-name" placeholder="Alex Rivers" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Work Email</Label>
                  <Input id="reg-email" type="email" placeholder="alex@company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-pwd">Create Password</Label>
                  <Input
                    id="reg-pwd"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password..."
                  />

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="space-y-2 pt-1 animate-in fade-in-50">
                      <div className="flex gap-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
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
                  disabled={isLoading}
                  onClick={() => handleSimulateSubmit('Account created! Please check your email for confirmation.')}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
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
                {/* 6-Digit Code Input Box */}
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="h-12 w-11 rounded-lg border border-input bg-background text-center text-lg font-bold font-mono shadow-xs focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive code?{' '}
                  <button className="text-primary font-medium hover:underline">
                    Resend SMS Code (30s)
                  </button>
                </p>

                <Button
                  className="w-full"
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
