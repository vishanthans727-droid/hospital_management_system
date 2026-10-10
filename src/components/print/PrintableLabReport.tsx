import React from 'react';
import { LabOrder } from '../../types';
import { Button } from '../common/Button';
import { formatDate, printSection } from '../../lib/utils';
import { Printer, HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrintableLabReportProps {
  order: LabOrder;
}

export const PrintableLabReport: React.FC<PrintableLabReportProps> = ({ order }) => {
  const printId = `lab-print-${order.id}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <Button
          variant="primary"
          size="sm"
          onClick={() => printSection(printId)}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Diagnostic Report
        </Button>
      </div>

      <div
        id={printId}
        className="bg-white text-slate-800 p-8 rounded-xl border border-slate-200 shadow-sm font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-teal-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-teal-900 tracking-tight">MediCare Diagnostic Pathology Laboratories</h1>
              <p className="text-xs text-slate-500">CAP & CLIA Certified Clinical Laboratory Division</p>
              <p className="text-[11px] text-slate-400">Accreditation # 992-LAB-2026 • lab@medicare.health</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Laboratory Report
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-2">Order: {order.orderNumber}</p>
            <p className="text-xs text-slate-500">Date: {formatDate(order.orderDate)}</p>
          </div>
        </div>

        {/* Patient & Doctor Banner */}
        <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Patient Profile</p>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{order.patientName}</p>
            <p className="text-slate-600">Patient ID: {order.patientId}</p>
            <p className="text-slate-500 text-[11px]">Urgency: {order.urgency.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Referring Physician</p>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{order.doctorName}</p>
            <p className="text-slate-600">Technician: {order.technicianName || 'Clinical Staff'}</p>
            <p className="text-slate-500 text-[11px]">Report Status: {order.status.toUpperCase()}</p>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-2.5 border-b border-slate-200">Investigation</th>
                <th className="p-2.5 border-b border-slate-200">Category</th>
                <th className="p-2.5 border-b border-slate-200 text-center">Result</th>
                <th className="p-2.5 border-b border-slate-200 text-center">Reference Range</th>
                <th className="p-2.5 border-b border-slate-200 text-center">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.tests.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-900">{t.testName}</td>
                  <td className="p-2.5 text-slate-500">{t.category}</td>
                  <td className="p-2.5 text-center font-bold text-slate-900">
                    {t.resultValue ? `${t.resultValue} ${t.unit || ''}` : 'Pending'}
                  </td>
                  <td className="p-2.5 text-center text-slate-600">{t.normalRange || 'N/A'}</td>
                  <td className="p-2.5 text-center">
                    {t.status === 'normal' && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                        NORMAL
                      </span>
                    )}
                    {t.status === 'abnormal' && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                        ABNORMAL
                      </span>
                    )}
                    {t.status === 'critical' && (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-extrabold text-[10px] animate-pulse">
                        CRITICAL
                      </span>
                    )}
                    {t.status === 'pending' && (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium text-[10px]">
                        IN ANALYSIS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.clinicalImpression && (
          <div className="p-4 bg-teal-50/60 rounded border border-teal-100 text-xs mb-8">
            <p className="font-semibold text-teal-900">Pathologist Impression & Clinical Commentary:</p>
            <p className="text-slate-700 mt-1 leading-relaxed">{order.clinicalImpression}</p>
          </div>
        )}

        {/* Footer Signature */}
        <div className="mt-12 pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
          <div className="text-[11px] text-slate-400 max-w-sm">
            <p>• Results verified through automated bidirectional analyzer and internal QC controls.</p>
            <p>• Clinical correlation is strongly advised.</p>
          </div>
          <div className="text-center w-56">
            <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800 italic">
              Dr. Kimberly Adams, MD, FCAP
            </div>
            <p className="font-semibold text-slate-800">Chief Clinical Pathologist</p>
            <p className="text-[11px] text-slate-500">Board Certified Laboratory Director</p>
          </div>
        </div>
      </div>
    </div>
  );
};
