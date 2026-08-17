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
  Textarea,
  Separator,
  Skeleton,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Progress,
  SegmentedControl,
  SegmentedControlItem,
  EmptyState,
  PricingCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  cn,
  toast,
} from '@ds/ui';
import {
  CreditCard,
  Zap,
  ReceiptText,
  Building2,
  Download,
  Plus,
  CheckCircle2,
  Trash2,
  Activity,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

interface Invoice {
  id: string;
  number: string;
  date: string;
  description: string;
  amount: string;
  status: InvoiceStatus;
}

type InvoiceFilter = 'all' | InvoiceStatus;

type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
};

const STATUS_META: Record<InvoiceStatus, { label: string; variant: 'success' | 'outline' | 'destructive' }> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'outline' },
  overdue: { label: 'Overdue', variant: 'destructive' },
};

const USAGE_ROWS = [
  { label: 'API calls', used: '842K', limit: '1M', percent: 84, near: true },
  { label: 'Storage', used: '412 GB', limit: '1 TB', percent: 40, near: false },
  { label: 'Seats', used: '21', limit: '25', percent: 84, near: true },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1', number: 'INV-2024-0081', date: 'Aug 01, 2026', description: 'Pro plan — monthly', amount: '$49.00', status: 'paid' },
  { id: 'inv-2', number: 'INV-2024-0080', date: 'Jul 01, 2026', description: 'Pro plan — monthly', amount: '$49.00', status: 'paid' },
  { id: 'inv-3', number: 'INV-2024-0079', date: 'Jun 01, 2026', description: 'Pro plan — monthly + overage', amount: '$73.50', status: 'paid' },
  { id: 'inv-4', number: 'INV-2024-0078', date: 'May 01, 2026', description: 'Pro plan — monthly', amount: '$49.00', status: 'overdue' },
  { id: 'inv-5', number: 'INV-2024-0077', date: 'Apr 01, 2026', description: 'Pro plan — monthly', amount: '$49.00', status: 'pending' },
  { id: 'inv-6', number: 'INV-2024-0076', date: 'Mar 01, 2026', description: 'Storage add-on 500 GB', amount: '$12.00', status: 'pending' },
];

const INITIAL_CARDS: PaymentCard[] = [
  { id: 'card-1', brand: 'Visa', last4: '4242', expMonth: '12', expYear: '28', isDefault: true },
  { id: 'card-2', brand: 'Mastercard', last4: '8851', expMonth: '01', expYear: '27', isDefault: false },
];

function detectBrand(digits: string): string {
  if (digits.startsWith('4')) return 'Visa';
  if (digits.startsWith('5')) return 'Mastercard';
  if (digits.startsWith('3')) return 'Amex';
  return 'Card';
}

export default function BillingPage() {
  const [pageLoading, setPageLoading] = React.useState(true);
  const [invoicesLoading, setInvoicesLoading] = React.useState(true);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const [invoices, setInvoices] = React.useState<Invoice[]>(INITIAL_INVOICES);
  const [invoiceFilter, setInvoiceFilter] = React.useState<InvoiceFilter>('all');
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [cards, setCards] = React.useState<PaymentCard[]>(INITIAL_CARDS);
  const [addCardOpen, setAddCardOpen] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvc, setCardCvc] = React.useState('');
  const [cardErrors, setCardErrors] = React.useState<{
    number?: string;
    expiry?: string;
    cvc?: string;
  }>({});
  const [addingCard, setAddingCard] = React.useState(false);
  const [removeCardId, setRemoveCardId] = React.useState<string | null>(null);
  const [companyName, setCompanyName] = React.useState('Acme Innovations Inc.');
  const [taxId, setTaxId] = React.useState('US-12-3456789');
  const [billingEmail, setBillingEmail] = React.useState('billing@acme.io');
  const [address, setAddress] = React.useState(
    '100 Market Street, Suite 400\nSan Francisco, CA 94103'
  );
  const [detailsSaving, setDetailsSaving] = React.useState(false);
  const [detailsErrors, setDetailsErrors] = React.useState<{
    company?: string;
    email?: string;
  }>({});

  React.useEffect(() => {
    const pageTimer = setTimeout(() => setPageLoading(false), 600);
    const invoiceTimer = setTimeout(() => setInvoicesLoading(false), 1000);
    return () => {
      clearTimeout(pageTimer);
      clearTimeout(invoiceTimer);
    };
  }, []);

  const annual = billingCycle === 'annual';

  const filteredInvoices = React.useMemo(() => {
    if (invoiceFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === invoiceFilter);
  }, [invoices, invoiceFilter]);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      toast({
        variant: 'success',
        title: 'Download started',
        description: 'Your invoice PDF is being prepared.',
      });
    }, 900);
  };

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: 'paid' } : inv))
    );
    toast({
      variant: 'success',
      title: 'Invoice marked as paid',
      description: 'The invoice has been updated and will be reflected on the next statement.',
    });
  };

  const handleMakeDefault = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({ ...card, isDefault: card.id === id }))
    );
    toast({
      variant: 'success',
      title: 'Default payment method updated',
      description: 'New subscriptions and renewals will use this card.',
    });
  };

  const handleRemoveCard = (id: string) => {
    setCards((prev) => {
      const removed = prev.find((card) => card.id === id);
      const next = prev.filter((card) => card.id !== id);
      if (removed?.isDefault && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setRemoveCardId(null);
    toast({
      variant: 'success',
      title: 'Card removed',
      description: 'The payment method was removed from your account.',
    });
  };

  const handleAddCard = () => {
    const digits = cardNumber.replace(/\D/g, '');
    const expiryDigits = cardExpiry.replace(/\D/g, '');
    const nextErrors: { number?: string; expiry?: string; cvc?: string } = {};

    if (!/^\d{16}$/.test(digits)) {
      nextErrors.number = 'Enter a valid 16-digit card number.';
    }
    if (!/^(0[1-9]|1[0-2])\d{2}$/.test(expiryDigits)) {
      nextErrors.expiry = 'Use MM/YY with a valid month.';
    }
    if (!/^\d{3,4}$/.test(cardCvc)) {
      nextErrors.cvc = 'CVC must be 3 or 4 digits.';
    }

    setCardErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setAddingCard(true);
    setTimeout(() => {
      const newCard: PaymentCard = {
        id: `card-${Date.now()}`,
        brand: detectBrand(digits),
        last4: digits.slice(-4),
        expMonth: expiryDigits.slice(0, 2),
        expYear: expiryDigits.slice(2),
        isDefault: cards.length === 0,
      };
      setCards((prev) => [...prev, newCard]);
      setAddingCard(false);
      setAddCardOpen(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      toast({
        variant: 'success',
        title: 'Payment method added',
        description: `${newCard.brand} ending in ${newCard.last4} is now on file.`,
      });
    }, 800);
  };

  const handleSaveDetails = () => {
    const nextErrors: { company?: string; email?: string } = {};
    if (!companyName.trim()) {
      nextErrors.company = 'Legal company name is required.';
    }
    if (!billingEmail.trim()) {
      nextErrors.email = 'Billing email is required.';
    } else if (!EMAIL_REGEX.test(billingEmail)) {
      nextErrors.email = 'Enter a valid email address, e.g. billing@company.com.';
    }
    setDetailsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setDetailsSaving(true);
    setTimeout(() => {
      setDetailsSaving(false);
      toast({
        variant: 'success',
        title: 'Billing details saved',
        description: 'Your billing information has been updated.',
      });
    }, 800);
  };

  if (pageLoading) {
    return (
      <div className="space-y-10 animate-in fade-in-50 duration-200">
        <PageHeader
          eyebrow="UX Recipe Scenario"
          eyebrowIcon={CreditCard}
          title="Billing, Invoices & Usage"
          description="An interactive billing dashboard: current plan with usage meters, invoice history with status filters, payment methods, and billing details."
        />
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className="h-96 w-full rounded-2xl lg:col-span-3" />
            <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={CreditCard}
        title="Billing, Invoices & Usage"
        description="An interactive billing dashboard: current plan with usage meters, invoice history with status filters, payment methods, and billing details."
      />

      <section id="current-plan" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Zap className="h-6 w-6 text-highlight" />
            <span>Current Plan</span>
          </h2>
          <SegmentedControl
            type="single"
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}
            className="self-start sm:self-auto"
          >
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="annual">Annual · Save 20%</SegmentedControlItem>
          </SegmentedControl>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PricingCard
              name="Pro"
              description="For growing teams that need more capacity, priority support, and SSO."
              price={annual ? '$39' : '$49'}
              period={annual ? '/month · billed annually' : '/month'}
              badge={annual ? 'Save 20%' : 'Most Popular'}
              popular
              ctaText={annual ? 'Manage plan' : 'Upgrade to annual'}
              onCtaClick={() => {
                if (billingCycle === 'monthly') {
                  setBillingCycle('annual');
                  toast({
                    variant: 'success',
                    title: 'Annual billing enabled',
                    description: 'You save 20% and pay $470 once per year.',
                  });
                } else {
                  toast({
                    variant: 'success',
                    title: 'Plan updated',
                    description: 'Your Pro plan billing preferences were saved.',
                  });
                }
              }}
              features={[
                { text: 'Up to 25 team seats' },
                { text: '1M API calls per month' },
                { text: '1 TB encrypted storage' },
                { text: 'Priority email support', note: '4h response' },
                { text: 'SSO / SAML', included: false },
              ]}
            />
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-highlight" />
                Usage summary
              </CardTitle>
              <CardDescription>
                Your usage resets at the start of each billing period.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {USAGE_ROWS.map((row) => (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      {row.near && (
                        <Badge variant="highlight-outline" size="sm">
                          Near limit
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'font-mono text-xs',
                          row.near ? 'font-semibold text-highlight' : 'text-muted-foreground'
                        )}
                      >
                        {row.used} / {row.limit}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={row.percent}
                      className={row.near ? '[&>div]:bg-highlight' : undefined}
                    />
                    <span
                      className={cn(
                        'w-9 shrink-0 text-right font-mono text-xs font-medium',
                        row.near ? 'text-highlight' : 'text-muted-foreground'
                      )}
                    >
                      {row.percent}%
                    </span>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next invoice</span>
                <span className="font-medium text-foreground">Sep 01, 2026</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Billing method</span>
                <span className="font-medium text-foreground">
                  {cards.find((card) => card.isDefault)?.brand ?? '—'} ••••{' '}
                  {cards.find((card) => card.isDefault)?.last4 ?? '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="invoices" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-highlight" />
            <span>Invoices</span>
          </h2>
          <SegmentedControl
            type="single"
            value={invoiceFilter}
            onValueChange={(v) => setInvoiceFilter(v as InvoiceFilter)}
            className="self-start sm:self-auto"
          >
            <SegmentedControlItem value="all">All</SegmentedControlItem>
            <SegmentedControlItem value="paid">Paid</SegmentedControlItem>
            <SegmentedControlItem value="pending">Pending</SegmentedControlItem>
            <SegmentedControlItem value="overdue">Overdue</SegmentedControlItem>
          </SegmentedControl>
        </div>

        <p className="text-sm text-muted-foreground">
          Filter by status. Overdue invoices can be marked as paid to keep your ledger current.
        </p>

        <Card>
          <CardContent className="p-0 sm:p-0">
            {invoicesLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title={invoiceFilter === 'all' ? 'No invoices yet' : `No ${invoiceFilter} invoices`}
                description="There are no invoices matching this filter. Try a different status or check back later."
                actionLabel="Show all invoices"
                onAction={() => setInvoiceFilter('all')}
              />
            ) : (
              <Table variant="default" size="sm">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const status = STATUS_META[invoice.status];
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-xs">{invoice.number}</TableCell>
                        <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {invoice.description}
                        </TableCell>
                        <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} size="sm">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {invoice.status !== 'paid' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Mark ${invoice.number} as paid`}
                                className="h-8 w-8 text-success hover:text-success"
                                onClick={() => handleMarkPaid(invoice.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label={`Download ${invoice.number}`}
                              className="h-8 w-8"
                              loading={downloadingId === invoice.id}
                              onClick={() => handleDownload(invoice.id)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="payment-method" className="space-y-4 scroll-mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-highlight" />
            <span>Payment Method</span>
          </h2>
          <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
                <Plus className="h-3.5 w-3.5" />
                Add payment method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add payment method</DialogTitle>
                <DialogDescription>
                  Add a credit or debit card. Your default card is used for renewals.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input
                    id="card-number"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
                      if (cardErrors.number) {
                        setCardErrors((prev) => ({ ...prev, number: undefined }));
                      }
                    }}
                    error={Boolean(cardErrors.number)}
                    placeholder="4242 4242 4242 4242"
                  />
                  {cardErrors.number && (
                    <p className="text-xs font-medium text-destructive">{cardErrors.number}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                    <Input
                      id="card-expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4));
                        if (cardErrors.expiry) {
                          setCardErrors((prev) => ({ ...prev, expiry: undefined }));
                        }
                      }}
                      error={Boolean(cardErrors.expiry)}
                      placeholder="12/28"
                    />
                    {cardErrors.expiry && (
                      <p className="text-xs font-medium text-destructive">{cardErrors.expiry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={cardCvc}
                      onChange={(e) => {
                        setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                        if (cardErrors.cvc) {
                          setCardErrors((prev) => ({ ...prev, cvc: undefined }));
                        }
                      }}
                      error={Boolean(cardErrors.cvc)}
                      placeholder="123"
                    />
                    {cardErrors.cvc && (
                      <p className="text-xs font-medium text-destructive">{cardErrors.cvc}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCardOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCard} loading={addingCard} className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Add card
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {cards.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment methods"
            description="Add a payment method to keep your subscription and invoices up to date."
            actionLabel="Add payment method"
            onAction={() => setAddCardOpen(true)}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cards.map((card) => (
              <Card key={card.id} className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 to-highlight/10" />
                <CardContent className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-highlight text-primary-foreground shadow-sm">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {card.brand} •••• {card.last4}
                        </p>
                        {card.isDefault && <Badge variant="highlight">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires {card.expMonth}/{card.expYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {!card.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMakeDefault(card.id)}
                      >
                        Make default
                      </Button>
                    )}
                    <AlertDialog
                      open={removeCardId === card.id}
                      onOpenChange={(open) => {
                        if (!open) setRemoveCardId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove ${card.brand} ending in ${card.last4}`}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setRemoveCardId(card.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this payment method?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {card.brand} ending in {card.last4} will be removed from your account.
                            {card.isDefault
                              ? ' You will need to set a new default card for renewals.'
                              : ''}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleRemoveCard(card.id)}
                          >
                            Remove card
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="billing-details" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
          <Building2 className="h-6 w-6 text-highlight" />
          <span>Billing Details</span>
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Company information</CardTitle>
            <CardDescription>
              Used on all future invoices and receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Legal company name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (detailsErrors.company) {
                      setDetailsErrors((prev) => ({ ...prev, company: undefined }));
                    }
                  }}
                  error={Boolean(detailsErrors.company)}
                />
                {detailsErrors.company && (
                  <p className="text-xs font-medium text-destructive">
                    {detailsErrors.company}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID / VAT</Label>
                <Input
                  id="tax-id"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. US-12-3456789"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Billing email</Label>
              <Input
                id="billing-email"
                type="email"
                value={billingEmail}
                onChange={(e) => {
                  setBillingEmail(e.target.value);
                  if (detailsErrors.email) {
                    setDetailsErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                error={Boolean(detailsErrors.email)}
              />
              {detailsErrors.email && (
                <p className="text-xs font-medium text-destructive">{detailsErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-address">Billing address</Label>
              <Textarea
                id="billing-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end border-t border-border">
            <Button onClick={handleSaveDetails} loading={detailsSaving}>
              Save billing details
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
