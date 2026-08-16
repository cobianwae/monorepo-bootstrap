'use client';

import * as React from 'react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  Sliders,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Target,
  Clock,
  Wand2,
  Cpu,
  Zap,
} from 'lucide-react';
import {
  Button,
  Badge,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  StatCard,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Slider,
  Progress,
  EmptyState,
  SectionNumber,
  toast,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import { streamAiDraftReply } from '@/scenarios/crm/lib/mock-api';

const PROMPT_TEMPLATES = [
  {
    title: 'Enterprise SLA & Security Rebuttal',
    prompt: 'Draft an executive confirmation email for enterprise prospects asking about Okta SAML 2.0 SCIM integration and 99.99% uptime guarantee.',
  },
  {
    title: 'Cold Outreach: Monorepo Design System',
    prompt: 'Write a compelling 3-sentence outreach email to a VP of Engineering about OKLCH design tokens and WCAG AAA accessibility.',
  },
  {
    title: 'Proposal Follow-up with ROI Incentive',
    prompt: 'Compose an urgent follow-up for a stalled proposal emphasizing 19.3x WhatsApp campaign ROI and end-of-month pricing lock.',
  },
];

export default function AiStudioPage() {
  const { openAiDrawer } = useCrm();

  // Prompt Sandbox state
  const [selectedPrompt, setSelectedPrompt] = React.useState(PROMPT_TEMPLATES[0].prompt);
  const [generatedOutput, setGeneratedOutput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [hasCopied, setHasCopied] = React.useState(false);

  // Model Simulator Sliders
  const [simDealValue, setSimDealValue] = React.useState(75000);
  const [simEngagementScore, setSimEngagementScore] = React.useState(85);
  const [simTechFit, setSimTechFit] = React.useState(90);
  const [simDecisionUrgency, setSimDecisionUrgency] = React.useState(70);

  // Calculate dynamic simulated AI score
  const calculatedScore = React.useMemo(() => {
    const vScore = Math.min(30, (simDealValue / 150000) * 30);
    const eScore = (simEngagementScore / 100) * 30;
    const tScore = (simTechFit / 100) * 25;
    const uScore = (simDecisionUrgency / 100) * 15;
    return Math.min(100, Math.round(vScore + eScore + tScore + uScore));
  }, [simDealValue, simEngagementScore, simTechFit, simDecisionUrgency]);

  const handleRunGeneration = async () => {
    if (!selectedPrompt.trim() || isStreaming) return;
    setGeneratedOutput('');
    setIsStreaming(true);

    let acc = '';
    await streamAiDraftReply(
      selectedPrompt,
      (chunk) => {
        acc += chunk;
        setGeneratedOutput(acc);
      },
      () => {
        setIsStreaming(false);
        toast({
          variant: 'success',
          title: 'Draft Generated',
          description: 'Streaming token synthesis completed.',
        });
      }
    );
  };

  const handleCopyOutput = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedOutput);
    }
    setHasCopied(true);
    toast({
      variant: 'default',
      title: 'Copied to clipboard',
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="AI Intelligence Suite"
        eyebrowIcon={Sparkles}
        title="AI Intelligence & Copilot Studio"
        description="Explore predictive lead scoring models, test generative sales drafts with streaming token synthesis, and monitor autonomous pipeline triage."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="gap-1.5 px-3 py-1.5 text-xs font-mono">
              <Cpu className="h-3.5 w-3.5" />
              Active Model: Omni-CRM-v4.2
            </Badge>
          </div>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="AI Qualified Pipeline"
          value="$648,000"
          delta={{
            value: '76.6%',
            trend: 'up',
            label: 'of total pipeline',
          }}
          icon={Target}
        />

        <StatCard
          title="Triage Accuracy"
          value="94.8%"
          delta={{
            value: '+3.1% precision',
            trend: 'up',
          }}
          icon={CheckCircle2}
        />

        <StatCard
          title="AI Generated Drafts"
          value="142"
          delta={{
            value: '88% accepted',
            trend: 'up',
          }}
          icon={Wand2}
        />

        <StatCard
          title="Rep Hours Saved"
          value="34.5 hrs"
          delta={{
            value: 'per rep / month',
            trend: 'up',
          }}
          icon={Clock}
        />
      </div>

      {/* Main Studio Tabs */}
      <Tabs defaultValue="scoring" className="space-y-6">
        <div className="border-b border-border pb-2">
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-xl h-10">
            <TabsTrigger value="scoring" className="text-sm gap-2">
              <Sliders className="h-4 w-4" />
              Interactive Scoring
            </TabsTrigger>
            <TabsTrigger value="sandbox" className="text-sm gap-2">
              <Bot className="h-4 w-4" />
              Draft Sandbox
            </TabsTrigger>
            <TabsTrigger value="triage" className="text-sm gap-2">
              <Zap className="h-4 w-4" />
              Autonomous Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: INTERACTIVE LEAD SCORING */}
        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Scoring Parameters Simulator */}
            <Card className="lg:col-span-7 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SectionNumber number="01" />
                    <CardTitle className="text-base font-bold text-foreground font-display">
                      Predictive Scoring Parameter Sandbox
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Adjust parameter weights to simulate how the real-time AI scoring engine calculates opportunity intent.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Deal Value Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Deal Value Size ($)</span>
                    <span className="font-mono text-primary font-semibold">${simDealValue.toLocaleString()}</span>
                  </div>
                  <Slider
                    min={10000}
                    max={200000}
                    step={5000}
                    value={[simDealValue]}
                    onValueChange={(val) => setSimDealValue(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$10k (Small)</span>
                    <span>$100k (Mid-Market)</span>
                    <span>$200k+ (Enterprise)</span>
                  </div>
                </div>

                {/* Engagement Activity Velocity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Engagement Velocity (Touches / Week)</span>
                    <span className="font-mono text-primary font-semibold">{simEngagementScore}%</span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[simEngagementScore]}
                    onValueChange={(val) => setSimEngagementScore(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cold (1 touch)</span>
                    <span>Moderate (3 touches)</span>
                    <span>Hot (&gt;6 touches)</span>
                  </div>
                </div>

                {/* Technical Stack Fit */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Technical Stack & Architecture Fit</span>
                    <span className="font-mono text-primary font-semibold">{simTechFit}%</span>
                  </div>
                  <Slider
                    min={20}
                    max={100}
                    step={5}
                    value={[simTechFit]}
                    onValueChange={(val) => setSimTechFit(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Legacy Frameworks</span>
                    <span>Partial Fit</span>
                    <span>Full Next.js / Monorepo Parity</span>
                  </div>
                </div>

                {/* Decision Urgency */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Executive Decision Urgency</span>
                    <span className="font-mono text-primary font-semibold">{simDecisionUrgency}%</span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[simDecisionUrgency]}
                    onValueChange={(val) => setSimDecisionUrgency(val[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Evaluating (FY26)</span>
                    <span>In RFP</span>
                    <span>Immediate End-of-Quarter Lock</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Calculated AI Assessment Card */}
            <Card className="lg:col-span-5 shadow-xs border-highlight/40 bg-gradient-to-br from-highlight/10 to-transparent flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SectionNumber number="02" />
                    <CardTitle className="text-base font-bold text-foreground font-display">
                      Calculated AI Score
                    </CardTitle>
                  </div>
                  <Badge variant={calculatedScore >= 80 ? 'highlight' : 'secondary'} className="text-xs font-mono">
                    {calculatedScore >= 80 ? 'High Intent' : 'Standard Pipeline'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Real-time Bayesian inference output
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4 flex-1 flex flex-col justify-center">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-2 text-4xl font-bold text-foreground font-mono">
                    <Flame className="h-7 w-7 text-highlight" />
                    {calculatedScore}
                    <span className="text-lg text-muted-foreground font-normal">/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Predicted win probability: <strong className="font-mono text-foreground">{Math.round(calculatedScore * 0.85)}%</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-mono">Confidence Interval:</span>
                    <span className="font-mono font-bold text-foreground">96.4%</span>
                  </div>
                  <Progress value={calculatedScore} className="h-2.5" />
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card/80 text-xs space-y-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 font-mono">
                    <Bot className="h-4 w-4 text-highlight shrink-0" />
                    <span>AI Recommendation Engine:</span>
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {calculatedScore >= 85
                      ? 'Fast-track executive procurement call. Offer personalized OKLCH design token proof-of-concept.'
                      : calculatedScore >= 70
                        ? 'Schedule architecture demo and share HIPAA/SOC2 compliance whitepaper.'
                        : 'Enroll contact into automated 4-week educational design system drip campaign.'}
                  </p>
                </div>

                <Button
                  className="w-full text-xs gap-2"
                  onClick={() => openAiDrawer({ type: 'general', initialTab: 'chat' })}
                >
                  <Sparkles className="h-4 w-4" />
                  Ask AI Copilot to Draft Closing Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: GENERATIVE DRAFT SANDBOX */}
        <TabsContent value="sandbox" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Prompt Configuration */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="shadow-xs">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    Preset Prompt Library
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-3">
                  {PROMPT_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPrompt(tpl.prompt)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                        selectedPrompt === tpl.prompt
                          ? 'border-highlight bg-highlight/10 text-foreground font-semibold'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <p className="font-bold text-foreground mb-1">{tpl.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tpl.prompt}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                  Custom Prompt Directive
                </label>
                <Textarea
                  value={selectedPrompt}
                  onChange={(e) => setSelectedPrompt(e.target.value)}
                  rows={4}
                  className="text-sm"
                  placeholder="Enter custom prompt instructions for the AI copilot..."
                />
                <Button
                  onClick={handleRunGeneration}
                  disabled={isStreaming || !selectedPrompt.trim()}
                  className="w-full text-xs gap-2"
                >
                  <Sparkles className="h-4 w-4 text-highlight" />
                  {isStreaming ? 'Synthesizing Tokens...' : 'Execute Generative Stream'}
                </Button>
              </div>
            </div>

            {/* Right: Real-time Streaming Output Box */}
            <Card className="lg:col-span-7 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-highlight" />
                    Simulated Token Stream Output
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live character synthesis with low latency streaming
                  </CardDescription>
                </div>
                {generatedOutput && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyOutput}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {hasCopied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {hasCopied ? 'Copied' : 'Copy Text'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-center">
                {generatedOutput ? (
                  <div className="rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {generatedOutput}
                    {isStreaming && (
                      <span className="inline-block h-4 w-1.5 bg-primary ml-1" />
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title="No generation running"
                    description="Select a preset prompt above or enter your own custom directive, then click Execute Generative Stream."
                    actionLabel="Run Selected Prompt"
                    onAction={handleRunGeneration}
                    className="border-none bg-transparent p-6"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: AUTONOMOUS INSIGHTS */}
        <TabsContent value="triage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-highlight/30 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-highlight" />
                <h3 className="font-bold text-base text-foreground font-display">
                  High Buying Surge: FinTech
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                4 inbound FinTech leads with average deal value &gt;$85k logged in the past 72h. Recommend dedicating a specialized sales pod.
              </p>
              <Badge variant="highlight" className="text-xs font-mono">
                Opportunity +$340k
              </Badge>
            </Card>

            <Card className="border-warning/30 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <h3 className="font-bold text-base text-foreground font-display">
                  Proposal Stall Detected
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apex Health Systems proposal pending for 5 days. AI suggests dispatching updated HIPAA business associate agreement.
              </p>
              <Badge variant="warning" className="text-xs font-mono">
                At-Risk $125k
              </Badge>
            </Card>

            <Card className="border-success/30 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <h3 className="font-bold text-base text-foreground font-display">
                  Channel Efficiency Surge
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                WhatsApp response rates outperforming email broadcasts by 3.8x. Shifting 15% budget will yield an estimated +$45k ARR.
              </p>
              <Badge variant="success" className="text-xs font-mono">
                +19.3x ROI Multiplier
              </Badge>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
