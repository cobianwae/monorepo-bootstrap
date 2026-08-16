'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  Wand2,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Label,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormErrorSummary,
  RadioGroup,
  RadioGroupItem,
  TableOfContents,
  Banner,
} from '@ds/ui';

interface FormSchema {
  fullName: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise';
  organization: string;
  notes: string;
}

export default function FormsCoreDocsPage() {
  const [submittedData, setSubmittedData] = React.useState<FormSchema | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState('pro');

  const form = useForm<FormSchema>({
    defaultValues: {
      fullName: '',
      email: '',
      plan: 'pro',
      organization: '',
      notes: '',
    },
  });

  const onSubmit = (data: FormSchema) => {
    setSubmittedData(data);
  };

  const tocHeadings = [
    { id: 'form-primitives', text: 'Form & Validation Primitives', level: 2 },
    { id: 'radio-group', text: 'Radio Group & Selectors', level: 2 },
    { id: 'form-sections', text: 'Form Sections & Error Summary', level: 2 },
    { id: 'api-reference', text: 'Anatomy & API Reference', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="View Form Demo" actionHref="#form-primitives">
        <strong>Form Core Primitives:</strong> Accessible form context, field descriptors, error messaging, and radio groups built on Radix and React Hook Form.
      </Banner>

      <PageHeader
        eyebrow="Forms & Inputs"
        eyebrowIcon={Wand2}
        title="Form & Radio Primitives"
        description="Type-safe accessible form primitives coordinating field labels, input controls, error message announcements, description IDs, and custom radio selections."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              React Hook Form
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WAI-ARIA aria-describedby
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: FORM PRIMITIVES */}
          <section id="form-primitives" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Form Field System</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Automatic coordination of `id`, `aria-describedby`, and `aria-invalid` between labels, inputs, descriptions, and validation messages.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Interactive Registration Form</CardTitle>
                <CardDescription>
                  Try submitting with empty fields to trigger accessible validation errors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={{ required: 'Full name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Alex Morgan" {...field} />
                            </FormControl>
                            <FormDescription>Your official name or handle.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: 'Email address is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address format',
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="alex@company.com" {...field} />
                            </FormControl>
                            <FormDescription>We will send account confirmation here.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="organization"
                      rules={{ required: 'Organization name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Global Inc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your team size and use case..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Max 500 characters.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" variant="highlight" className="gap-2">
                      <Send className="h-4 w-4" />
                      <span>Submit Application</span>
                    </Button>
                  </form>
                </Form>

                {submittedData && (
                  <div className="p-4 rounded-xl border border-success/40 bg-success/10 space-y-2">
                    <div className="flex items-center gap-2 text-success font-semibold text-xs font-mono">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Form Submitted Successfully</span>
                    </div>
                    <pre className="p-3 rounded-lg bg-card border border-border text-xs font-mono overflow-x-auto text-foreground">
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: RADIO GROUP */}
          <section id="radio-group" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Layers className="h-6 w-6 text-highlight" />
                <span>RadioGroup Primitives</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Accessible single-choice selectors supporting card tiles, descriptions, and keyboard arrow selection.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Card-Style Plan Selector</CardTitle>
                <CardDescription>
                  Custom visual container with accessible Radix RadioGroupItem beneath.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={selectedPlan}
                  onValueChange={setSelectedPlan}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {[
                    {
                      id: 'starter',
                      title: 'Starter',
                      price: '$29/mo',
                      desc: 'Up to 5 team members with standard OKLCH tokens.',
                    },
                    {
                      id: 'pro',
                      title: 'Professional',
                      price: '$79/mo',
                      desc: 'Unlimited seats, custom themes, and AI copilot.',
                    },
                    {
                      id: 'enterprise',
                      title: 'Enterprise',
                      price: 'Custom',
                      desc: 'Dedicated SCIM SSO, SLA guarantees, and multi-tenant DB.',
                    },
                  ].map((plan) => {
                    const isChecked = selectedPlan === plan.id;
                    return (
                      <label
                        key={plan.id}
                        htmlFor={`plan-${plan.id}`}
                        className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
                          isChecked
                            ? 'border-highlight bg-highlight/5 ring-2 ring-highlight/20'
                            : 'border-border bg-card hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="font-bold text-sm text-foreground font-display">
                              {plan.title}
                            </span>
                            <p className="text-xs text-muted-foreground">{plan.desc}</p>
                          </div>
                          <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/50 text-xs font-bold font-mono text-highlight">
                          {plan.price}
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
                  Selected plan: <span className="text-highlight font-bold uppercase">{selectedPlan}</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: FORM SECTIONS & ERROR SUMMARY */}
          <section id="form-sections" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-highlight" />
                <span>Form Sections & Error Summary</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                High-level layout wrappers for grouping related form fields and announcing multiple errors at the top of long forms.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <FormErrorSummary
                  title="3 issues prevented saving your settings"
                  errors={[
                    'First name is required before continuing',
                    'Work email domain must match enterprise SSO whitelist',
                    'You must select at least one workspace role',
                  ]}
                />

                <FormSection
                  title="Security & Single Sign-On"
                  description="Configure enterprise SAML 2.0 endpoints and identity providers."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IdP Metadata URL</Label>
                      <Input placeholder="https://auth.okta.com/app/sso" defaultValue="https://idp.acme.corp/saml" />
                    </div>
                    <div className="space-y-2">
                      <Label>Entity ID</Label>
                      <Input placeholder="urn:acme:sso" defaultValue="urn:apex:sp" />
                    </div>
                  </div>
                </FormSection>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Form Primitives" />
          </Card>
        </div>
      </div>
    </div>
  );
}
