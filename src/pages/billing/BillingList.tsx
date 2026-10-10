import React, { useState } from 'react';
import {
  mockInvoices,
  mockPayments,
  mockPatients,
} from '../../lib/mockData';
import { Invoice, InvoiceItem, Payment, InvoiceStatus } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PrintableInvoice } from '../../components/print/PrintableInvoice';
import { generateCustomId, formatDate, formatCurrency } from '../../lib/utils';
import {
  CreditCard,
  PlusCircle,
  Printer,
  DollarSign,
  CheckCircle2,
  Trash2,
  Receipt,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BillingList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedPrintInvoice, setSelectedPrintInvoice] = useState<Invoice | null>(null);
  const [isGenerateInvoiceOpen, setIsGenerateInvoiceOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // New Invoice Form
  const [patientId, setPatientId] = useState(mockPatients[0].id);
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Specialist Clinical Consultation',
      category: 'consultation',
      unitPrice: 150,
      quantity: 1,
      total: 150,
    },
  ]);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('card');
  const [txnRef, setTxnRef] = useState('');

  const calculateSubtotal = () =>
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        category: 'procedure',
        unitPrice: 50,
        quantity: 1,
        total: 50,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(
      items.map(i => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: val };
        if (field === 'unitPrice' || field === 'quantity') {
          updated.total = Number(updated.unitPrice) * Number(updated.quantity);
        }
        return updated;
      })
    );
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = mockPatients.find(p => p.id === patientId) || mockPatients[0];
    const subtotal = calculateSubtotal();
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = Math.max(0, subtotal + tax - discountAmount);
    const newInvNum = generateCustomId('INV');

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvNum,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      dateIssued: new Date().toISOString().slice(0, 10),
      dueDate,
      items,
      subtotal,
      taxAmount: tax,
      discountAmount,
      totalAmount: total,
      paidAmount: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setIsGenerateInvoiceOpen(false);
    toast.success(`Invoice ${newInvNum} generated for ${patient.fullName}`);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.totalAmount - inv.paidAmount);
    setTxnRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    const newPaidAmount = payingInvoice.paidAmount + paymentAmount;
    let newStatus: InvoiceStatus = 'partially_paid';
    if (newPaidAmount >= payingInvoice.totalAmount) {
      newStatus = 'paid';
    }

    const receiptNum = generateCustomId('RCT');
    const newPayment: Payment = {
      id: `pmt-${Date.now()}`,
      receiptNumber: receiptNum,
      invoiceId: payingInvoice.id,
      invoiceNumber: payingInvoice.invoiceNumber,
      patientId: payingInvoice.patientId,
      patientName: payingInvoice.patientName,
      amount: paymentAmount,
      paymentMethod,
      transactionReference: txnRef,
      paymentDate: new Date().toISOString(),
      receivedBy: 'Hospital Cashier Desk',
    };

    setPayments([newPayment, ...payments]);
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === payingInvoice.id
          ? { ...inv, paidAmount: newPaidAmount, status: newStatus }
          : inv
      )
    );

    toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded! (Receipt: ${receiptNum})`);
    setPayingInvoice(null);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalPending = invoices.reduce((s, i) => s + Math.max(0, i.totalAmount - i.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-600" />
            Patient Billing, Invoices & Collections
          </h1>
          <p className="text-xs text-slate-500">
            Compliant financial ledger, categorized charging, tax calculation, and receipt issuance
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsGenerateInvoiceOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Generate Patient Invoice
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-emerald-600">Total Collected Payments</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-rose-600">Outstanding Receivables</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-sky-600">Invoices Billed</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{invoices.length} statements</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by invoice number or patient..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid in Full</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="pending">Pending Settlement</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Issued Date</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-right">Paid Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{inv.patientName}</div>
                    <div className="text-[10px] text-slate-400">{inv.patientId}</div>
                  </td>
                  <td className="p-3.5 text-slate-500">{formatDate(inv.dateIssued)}</td>
                  <td className="p-3.5 text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="p-3.5 text-right text-emerald-600 font-semibold">
                    {formatCurrency(inv.paidAmount)}
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'success'
                          : inv.status === 'partially_paid'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {inv.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" /> Collect
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPrintInvoice(inv)}
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                      >
                        Print Invoice
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isGenerateInvoiceOpen}
        onClose={() => setIsGenerateInvoiceOpen(false)}
        title="Generate Hospital Invoice"
        subtitle="Multi-category medical charges with tax and discount calculation"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Billed Patient *</label>
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {mockPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">Service Line Items</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Charge Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Description (e.g. ICU Bed Charges)"
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={item.category}
                    onChange={e => handleItemChange(item.id, 'category', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white capitalize"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="room">Room / Bed</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="procedure">Procedure</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-right flex-1 pr-2">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax (5%):</span>
                <span>{formatCurrency(Math.round(calculateSubtotal() * 0.05))}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                  className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded text-right bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Final Total:</span>
                <span>{formatCurrency(Math.max(0, calculateSubtotal() * 1.05 - discountAmount))}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsGenerateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Issue Official Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title={`Collect Payment — ${payingInvoice.invoiceNumber}`}
          subtitle={`Patient: ${payingInvoice.patientName} • Remaining Due: ${formatCurrency(payingInvoice.totalAmount - payingInvoice.paidAmount)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1">Payment Amount ($ USD) *</label>
              <input
                type="number"
                required
                min="1"
                max={payingInvoice.totalAmount - payingInvoice.paidAmount}
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white capitalize"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Counter</option>
                <option value="insurance">Insurance Pre-Authorization</option>
                <option value="bank_transfer">Wire / Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Transaction Reference / Receipt Auth Code</label>
              <input
                type="text"
                required
                value={txnRef}
                onChange={e => setTxnRef(e.target.value)}
                placeholder="TXN-VISA-992182"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setPayingInvoice(null)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Confirm & Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Invoice Modal */}
      {selectedPrintInvoice && (
        <Modal
          isOpen={!!selectedPrintInvoice}
          onClose={() => setSelectedPrintInvoice(null)}
          title={`Official Invoice Document — ${selectedPrintInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <PrintableInvoice invoice={selectedPrintInvoice} />
        </Modal>
      )}
    </div>
  );
};
