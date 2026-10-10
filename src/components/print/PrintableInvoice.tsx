import React from 'react';
import { Invoice } from '../../types';
import { Button } from '../common/Button';
import { formatCurrency, formatDate, printSection } from '../../lib/utils';
import { Printer, HeartPulse, CheckCircle2, Clock } from 'lucide-react';

interface PrintableInvoiceProps {
  invoice: Invoice;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice }) => {
  const printId = `invoice-print-${invoice.id}`;
  const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <Button
          variant="primary"
          size="sm"
          onClick={() => printSection(printId)}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Official Invoice
        </Button>
      </div>

      <div
        id={printId}
        className="bg-white text-slate-800 p-8 rounded-xl border border-slate-200 shadow-sm font-sans relative"
      >
        {/* Status Stamp */}
        <div className="absolute right-12 top-28 transform rotate-12 opacity-80 pointer-events-none select-none">
          {invoice.status === 'paid' && (
            <div className="border-4 border-emerald-600 text-emerald-600 font-extrabold text-2xl uppercase px-4 py-1.5 rounded tracking-widest">
              PAID IN FULL
            </div>
          )}
          {invoice.status === 'partially_paid' && (
            <div className="border-4 border-amber-500 text-amber-500 font-extrabold text-2xl uppercase px-4 py-1.5 rounded tracking-widest">
              PARTIAL PAID
            </div>
          )}
          {invoice.status === 'pending' && (
            <div className="border-4 border-rose-500 text-rose-500 font-extrabold text-2xl uppercase px-4 py-1.5 rounded tracking-widest">
              PAYMENT DUE
            </div>
          )}
        </div>

        {/* Hospital Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediCare Health Systems</h1>
              <p className="text-xs text-slate-500">Official Patient Billing & Accounts Receivable</p>
              <p className="text-[11px] text-slate-400">Tax ID: 94-882190-MED • billing@medicare.health</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">TAX INVOICE</h2>
            <p className="text-sm font-semibold text-sky-800">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">Issued: {formatDate(invoice.dateIssued)}</p>
            <p className="text-xs text-slate-500">Due: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Billed To */}
        <div className="my-6 grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Billed Patient</p>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{invoice.patientName}</p>
            <p className="text-slate-600">Patient ID: {invoice.patientId}</p>
            {invoice.patientPhone && <p className="text-slate-500">Phone: {invoice.patientPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Billing Status</p>
            <p className="font-bold text-sm uppercase mt-0.5 text-slate-800">{invoice.status.replace('_', ' ')}</p>
            <p className="text-slate-600">Amount Paid: {formatCurrency(invoice.paidAmount)}</p>
            <p className="font-semibold text-rose-600">Balance: {formatCurrency(balanceDue)}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-2.5 border-b border-slate-200">#</th>
                <th className="p-2.5 border-b border-slate-200">Item Description</th>
                <th className="p-2.5 border-b border-slate-200">Category</th>
                <th className="p-2.5 border-b border-slate-200 text-right">Unit Price</th>
                <th className="p-2.5 border-b border-slate-200 text-center">Qty</th>
                <th className="p-2.5 border-b border-slate-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{item.description}</td>
                  <td className="p-2.5 capitalize text-slate-500">{item.category}</td>
                  <td className="p-2.5 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-2.5 text-center text-slate-700">{item.quantity}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex justify-end text-xs mb-8">
          <div className="w-64 space-y-2 border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax / Surcharge (5%):</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount / Concession:</span>
                <span>-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Invoice:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Amount Paid:</span>
              <span>{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-rose-600 pt-1 border-t-2 border-dashed border-slate-300">
              <span>Balance Due:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="text-[11px] text-slate-400 max-w-sm">
            <p>• Make all checks or bank drafts payable to MediCare Health Systems.</p>
            <p>• Insurance co-payments are due at time of service.</p>
          </div>
          <div className="text-center w-52">
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-700">
              Accounts Desk
            </div>
            <p className="text-[11px] text-slate-500">Authorized Financial Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
