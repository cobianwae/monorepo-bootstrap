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
} from '@ds/ui';
import {
  CheckCircle2,
  Building,
  CreditCard,
  Users,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function StepperPatternPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Form State
  const [orgName, setOrgName] = React.useState('Acme Innovations');
  const [subdomain, setSubdomain] = React.useState('acme');
  const [industry, setIndustry] = React.useState('software');
  const [selectedPlan, setSelectedPlan] = React.useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [teamMembers, setTeamMembers] = React.useState([
    { email: 'alex@acme.io', role: 'admin' },
    { email: 'sarah@acme.io', role: 'editor' },
  ]);
  const [newEmail, setNewEmail] = React.useState('');
  const [agreed, setAgreed] = React.useState(true);

  const steps = [
    { id: 1, title: 'Organization', description: 'Name & Domain' },
    { id: 2, title: 'Select Plan', description: 'Capacity & Pricing' },
    { id: 3, title: 'Invite Team', description: 'Roles & Access' },
    { id: 4, title: 'Review & Launch', description: 'Confirm Details' },
  ];

  const handleAddMember = () => {
    if (newEmail && newEmail.includes('@')) {
      setTeamMembers([...teamMembers, { email: newEmail, role: 'editor' }]);
      setNewEmail('');
    }
  };

  const handleRemoveMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
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
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Stepper / Multi-Step Wizard"
        description="Step-by-step onboarding wizard with persistent state, interactive step skipping, field validation, and summary review before final commit."
      />

      {/* Stepper Header Navigation */}
      <Card className="border-border p-6 shadow-xs">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => !isCompleted && setCurrentStep(step)}
        />
      </Card>

      {/* Wizard Step Content Box */}
      {isCompleted ? (
        <Card className="border-success/40 bg-success/5 text-center p-8 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-md">
            <Rocket className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Workspace Successfully Deployed!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your organization <strong>{orgName}</strong> is ready at <strong>https://{subdomain}.app.com</strong> with {teamMembers.length} team members invited.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Button onClick={handleReset} variant="outline">
              Restart Wizard Demo
            </Button>
            <Button>Go to Workspace</Button>
          </div>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {currentStep === 0 && <Building className="h-5 w-5 text-primary" />}
              {currentStep === 1 && <CreditCard className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <Users className="h-5 w-5 text-primary" />}
              {currentStep === 3 && <Rocket className="h-5 w-5 text-primary" />}
              Step {currentStep + 1}: {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Organization Details */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization / Company Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Custom Workspace Subdomain</Label>
                  <div className="flex items-center rounded-md border border-input bg-background px-3 shadow-xs focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-xs text-muted-foreground">https://</span>
                    <input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="w-full bg-transparent px-1 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">.workspace.io</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry Vertical</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software & SaaS</SelectItem>
                      <SelectItem value="fintech">Fintech & Banking</SelectItem>
                      <SelectItem value="healthcare">Healthcare & MedTech</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce & Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Plan Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-50">
                {(
                  [
                    {
                      id: 'starter',
                      name: 'Starter',
                      price: '$29/mo',
                      features: ['Up to 5 users', '10GB Storage', 'Standard Support'],
                    },
                    {
                      id: 'pro',
                      name: 'Pro',
                      price: '$79/mo',
                      badge: 'Popular',
                      features: ['Up to 25 users', '100GB Storage', 'Priority 24/7 Support', 'Custom Domains'],
                    },
                    {
                      id: 'enterprise',
                      name: 'Enterprise',
                      price: '$249/mo',
                      features: ['Unlimited users', 'Dedicated cluster', 'SAML SSO & Audit Logs', 'SLA 99.99%'],
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
                <div className="flex gap-2">
                  <Input
                    placeholder="colleague@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                  <Button onClick={handleAddMember} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Invite
                  </Button>
                </div>

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
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleRemoveMember(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review & Launch */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Summary of Setup</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Workspace:</span>
                      <strong className="text-foreground">{orgName} ({subdomain}.workspace.io)</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Plan:</span>
                      <strong className="text-foreground uppercase">{selectedPlan}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Industry:</span>
                      <strong className="text-foreground capitalize">{industry}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Invited Members:</span>
                      <strong className="text-foreground">{teamMembers.length} users</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(val) => setAgreed(Boolean(val))}
                  />
                  <Label htmlFor="agree" className="text-xs cursor-pointer">
                    I agree to the terms of service, SLA guidelines, and automated billing terms.
                  </Label>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentStep === 3 && !agreed}
              className="gap-1.5"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Launch Workspace
                  <Rocket className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
