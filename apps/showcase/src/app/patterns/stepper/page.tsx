'use client';

import * as React from 'react';
import {
  Stepper,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  EmptyState,
  toast,
} from '@ds/ui';
import {
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function StepperPatternPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [orgName, setOrgName] = React.useState('Acme Innovations');
  const [orgNameError, setOrgNameError] = React.useState<string | null>(null);
  const [domain, setDomain] = React.useState('acme-innovations.io');
  const [selectedPlan, setSelectedPlan] = React.useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [teamMembers, setTeamMembers] = React.useState<Array<{ email: string; role: string }>>([
    { email: 'sarah.connor@acme.io', role: 'admin' },
    { email: 'john.doe@acme.io', role: 'editor' },
  ]);
  const [newEmail, setNewEmail] = React.useState('');
  const [newEmailRole, setNewEmailRole] = React.useState('editor');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [agreed, setAgreed] = React.useState(true);

  const steps = [
    { id: 1, title: 'Organization', description: 'Name & Domain' },
    { id: 2, title: 'Select Plan', description: 'Capacity & Pricing' },
    { id: 3, title: 'Invite Team', description: 'Roles & Access' },
    { id: 4, title: 'Review & Launch', description: 'Confirm Details' },
  ];

  const handleAddMember = () => {
    setEmailError(null);
    if (!newEmail) {
      setEmailError('Please enter an email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Please provide a valid email format (e.g. name@company.com).');
      return;
    }
    if (teamMembers.some((m) => m.email.toLowerCase() === newEmail.toLowerCase())) {
      setEmailError('This member has already been added to the invite list.');
      return;
    }

    setTeamMembers([...teamMembers, { email: newEmail, role: newEmailRole }]);
    setNewEmail('');
    toast({
      variant: 'info',
      title: 'Invite Queued',
      description: `${newEmail} (${newEmailRole}) added to invitation list.`,
    });
  };

  const handleRemoveMember = (idx: number) => {
    const removed = teamMembers[idx];
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
    toast({
      variant: 'default',
      title: 'Invite Removed',
      description: `${removed.email} removed from invitation list.`,
    });
  };

  const handleNext = () => {
    // Step 1 Validation
    if (currentStep === 0) {
      if (!orgName.trim()) {
        setOrgNameError('Organization name cannot be empty.');
        return;
      }
      setOrgNameError(null);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsCompleted(true);
        toast({
          variant: 'success',
          title: 'Organization Launched!',
          description: `Workspace "${orgName}" is live and invitations have been dispatched.`,
        });
      }, 1000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setOrgName('Acme Innovations');
    setDomain('acme-innovations.io');
    setSelectedPlan('pro');
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Stepper / Multi-Step Wizard"
        description="Step-by-step onboarding wizard with persistent state, keyboard-accessible step skipping, field validation, and summary review before final commit."
      />

      {/* Stepper Header Navigation */}
      <div className="mx-auto max-w-4xl px-2">
        <div className="sm:hidden">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepIdx) => setCurrentStep(stepIdx)}
            orientation="vertical"
          />
        </div>
        <div className="hidden sm:block">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepIdx) => setCurrentStep(stepIdx)}
          />
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="mx-auto max-w-2xl">
        {isCompleted ? (
          <Card className="border-border text-center p-8 animate-in zoom-in-95 duration-300">
            <CardContent className="space-y-6 pt-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Workspace Ready!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>{orgName}</strong> has been configured with the <strong>{selectedPlan.toUpperCase()}</strong> tier. {teamMembers.length} invitation emails sent.
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4 text-left text-xs space-y-1 font-mono">
                <div>Domain: https://{domain}</div>
                <div>Admin: sarah.connor@acme.io</div>
                <div>Status: Provisioned (Active)</div>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Restart Demo
                </Button>
                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Enter Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">
                Step {currentStep + 1}: {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Organization Info */}
              {currentStep === 0 && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization / Workspace Name</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      error={!!orgNameError}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        if (e.target.value.trim()) setOrgNameError(null);
                      }}
                      placeholder="e.g. Acme Corp"
                    />
                    {orgNameError && (
                      <p className="text-xs font-medium text-destructive">{orgNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Custom Workspace Subdomain</Label>
                    <div className="flex rounded-md shadow-xs">
                      <Input
                        id="domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="rounded-r-none"
                      />
                      <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                        .workspace.io
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Plan with Accessible Radio Group */}
              {currentStep === 1 && (
                <div
                  role="radiogroup"
                  aria-label="Select pricing plan"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-50"
                >
                  {(
                    [
                      {
                        id: 'starter',
                        name: 'Starter',
                        price: '$29/mo',
                        features: ['Up to 5 members', '10GB Storage', 'Standard Support'],
                      },
                      {
                        id: 'pro',
                        name: 'Professional',
                        price: '$79/mo',
                        badge: 'Recommended',
                        features: ['Up to 25 members', '100GB Storage', 'Priority Support', 'SSO/SAML'],
                      },
                      {
                        id: 'enterprise',
                        name: 'Enterprise',
                        price: '$199/mo',
                        features: ['Unlimited seats', 'Unlimited Storage', '24/7 Dedicated Support', 'Custom Audit Logs'],
                      },
                    ] satisfies Array<{
                      id: 'starter' | 'pro' | 'enterprise';
                      name: string;
                      price: string;
                      badge?: string;
                      features: string[];
                    }>
                  ).map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedPlan === plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer text-left rounded-xl border-2 p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border bg-card hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        {plan.badge && <Badge variant="default">{plan.badge}</Badge>}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-foreground">{plan.price}</div>
                      <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Invite Team */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Invite Colleagues</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        id="invite-email"
                        placeholder="colleague@company.com"
                        value={newEmail}
                        error={!!emailError}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Select value={newEmailRole} onValueChange={setNewEmailRole}>
                          <SelectTrigger className="w-28 flex-1" aria-label="Invite role">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddMember} className="gap-1.5">
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                    {emailError && (
                      <p className="text-xs font-medium text-destructive">{emailError}</p>
                    )}
                  </div>

                  {teamMembers.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No team invites added yet"
                      description="You can invite colleagues now or add them later from workspace settings."
                    />
                  ) : (
                    <div className="rounded-lg border border-border divide-y divide-border">
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                              {member.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm text-foreground">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {member.role}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Remove invitation for ${member.email}`}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveMember(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Workspace Name:</span>
                      <span className="font-semibold text-foreground">{orgName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subdomain:</span>
                      <span className="font-mono text-xs">{domain}.workspace.io</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscription Tier:</span>
                      <Badge variant="default" className="capitalize">
                        {selectedPlan}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Initial Team Size:</span>
                      <span className="font-semibold text-foreground">{teamMembers.length} seats</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                      I agree to the Master Services Agreement, Data Privacy Addendum, and acceptable use terms.
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border p-5">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentStep === 3 && !agreed}
                loading={isSubmitting}
                className="gap-2"
              >
                {currentStep === steps.length - 1 ? 'Launch Workspace' : 'Continue'}
                {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
