'use client';

import * as React from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Package,
  Printer,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@ds/ui';
import { PageHeader } from '@ds/ui';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import type { PaymentMethod, Transaction } from '@/scenarios/clinic/types';

export default function PosPage() {
  const {
    products,
    patients,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processCheckout,
  } = useClinic();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>('PAT-1001');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('qris');
  const [discountAmount, setDiscountAmount] = React.useState<string>('0');
  const [completedTrx, setCompletedTrx] = React.useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);

  const activePatient = React.useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCat === 'all' || p.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCat]);

  // Cart calculations
  const subtotal = React.useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discount = Math.min(subtotal, Math.max(0, parseFloat(discountAmount) || 0));
  const tax = Math.round((subtotal - discount) * 0.11);
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const patientName = activePatient ? activePatient.name : 'Walk-in Guest';

    processCheckout({
      patientId: activePatient?.id,
      patientName,
      paymentMethod,
      cashierName: 'Front Desk Cashier',
      discountAmount: discount,
    });

    // Capture latest transaction for receipt preview
    const newTrx: Transaction = {
      id: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: activePatient?.id,
      patientName,
      items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal,
      discountAmount: discount,
      tax,
      total: grandTotal,
      paymentMethod,
      status: 'completed',
      cashierName: 'Front Desk Cashier',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setCompletedTrx(newTrx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical Commerce & Retail Register"
        eyebrowIcon={ShoppingBag}
        title="Point of Sale (POS) & Billing Checkout"
        description="Dispense retail supplements, peptide pen supplies, metabolic test devices, and process patient billing receipts."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Cashier: Front Desk #1
            </Badge>
          </div>
        }
      />

      {/* POS Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Product Catalog Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Catalog Filter Strip */}
          <Card className="p-3 bg-card/90 backdrop-blur-xs border-border/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'supplement', label: 'Supplements' },
                { id: 'meal-replacement', label: 'Meal Shakes' },
                { id: 'device', label: 'Smart Scales' },
                { id: 'injection-pen', label: 'Pen Needles' },
                { id: 'treatment-voucher', label: 'Vouchers' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCat === cat.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredProducts.map((prod) => (
              <Card
                key={prod.id}
                className="p-4 bg-card/90 backdrop-blur-xs border-border/80 hover:border-highlight/50 hover:shadow-sm transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">{prod.sku}</span>
                    <Badge variant="outline" size="sm" className="text-[10px] h-4">
                      Stock: {prod.stock}
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-xs text-foreground leading-tight">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="font-display font-bold text-sm text-foreground">
                    Rp {prod.price.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="highlight"
                    onClick={() => addToCart(prod, 1)}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Shopping Cart & Checkout Register */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-card/90 backdrop-blur-xs border-border/80 shadow-xs space-y-5 sticky top-20">
            {/* Cart Header & Patient Assignment */}
            <div className="space-y-3 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-bold text-base text-foreground">
                    Current Register Invoice
                  </h3>
                </div>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bill to Patient (EMR Linked)</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Package className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs font-mono">Invoice is empty.</p>
                <p className="text-[11px]">Click items on catalog to add to invoice.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[170px]">
                      <p className="font-semibold text-foreground truncate font-display">
                        {item.name}
                      </p>
                      <span className="font-mono text-[11px] text-muted-foreground block">
                        Rp {item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono font-bold px-1.5 text-xs text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label className="text-xs font-mono uppercase text-muted-foreground">
                Payment Tender Method
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'credit-card', label: 'Card', icon: CreditCard },
                  { id: 'cash', label: 'Cash', icon: Banknote },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-border/40 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Discount (IDR)</span>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="h-7 w-28 text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Govt Tax (PB1 11%)</span>
                <span>Rp {tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-display font-bold text-base text-foreground pt-2 border-t border-border/40">
                <span>Grand Total</span>
                <span className="text-primary font-mono text-lg">Rp {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Button
              size="default"
              variant="highlight"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full font-bold gap-2 text-sm shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete & Print Receipt (Rp {grandTotal.toLocaleString()})
            </Button>
          </Card>
        </div>
      </div>

      {/* Printable Receipt Modal Dialog */}
      {completedTrx && (
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-base text-center">
                Aura Metabolic Clinic — Tax Invoice
              </DialogTitle>
              <DialogDescription className="text-xs text-center">
                Transaction ID: {completedTrx.id} • {completedTrx.timestamp}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Billed To:</span>
                <strong className="text-foreground">{completedTrx.patientName}</strong>
              </div>

              <div className="space-y-1.5 py-1">
                {completedTrx.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span>Rp {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-2 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {completedTrx.subtotal.toLocaleString()}</span>
                </div>
                {completedTrx.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-Rp {completedTrx.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (11%)</span>
                  <span>Rp {completedTrx.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-sm pt-1 border-t border-border/30">
                  <span>Total Paid</span>
                  <span>Rp {completedTrx.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>Method</span>
                  <span>{completedTrx.paymentMethod.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReceiptOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                variant="highlight"
                onClick={() => {
                  window.print();
                }}
                className="gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
