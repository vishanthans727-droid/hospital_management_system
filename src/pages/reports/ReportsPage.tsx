import React, { useState } from 'react';
import {
  mockPatients,
  mockAppointments,
  mockAdmissions,
  mockInvoices,
} from '../../lib/mockData';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { exportToCsv, formatCurrency, formatDate, printSection } from '../../lib/utils';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  CreditCard,
  BedDouble,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import toast from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'financial' | 'census' | 'appointments'>('financial');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-10-10');

  // Report 1: Revenue breakdown by category
  const revenueByCategoryData = [
    { category: 'Consultation', amount: 8450 },
    { category: 'Room & ICU', amount: 14200 },
    { category: 'Laboratory', amount: 6890 },
    { category: 'Pharmacy', amount: 9320 },
    { category: 'Surgical/Procedures', amount: 11400 },
  ];

  // Report 2: Appointments trend
  const monthlyAppointmentsData = [
    { month: 'Jun', total: 110, completed: 98, cancelled: 12 },
    { month: 'Jul', total: 135, completed: 121, cancelled: 14 },
    { month: 'Aug', total: 142, completed: 130, cancelled: 12 },
    { month: 'Sep', total: 158, completed: 146, cancelled: 12 },
    { month: 'Oct', total: 172, completed: 161, cancelled: 11 },
  ];

  const handleExportCSV = () => {
    if (reportType === 'financial') {
      const rows = mockInvoices.map(i => ({
        'Invoice Number': i.invoiceNumber,
        Patient: i.patientName,
        'Date Issued': i.dateIssued,
        'Subtotal ($)': i.subtotal,
        'Tax ($)': i.taxAmount,
        'Discount ($)': i.discountAmount,
        'Total ($)': i.totalAmount,
        'Paid ($)': i.paidAmount,
        Status: i.status,
      }));
      exportToCsv(`medicare_financial_report_${endDate}`, rows);
    } else if (reportType === 'census') {
      const rows = mockAdmissions.map(a => ({
        'Admission Code': a.admissionCode,
        Patient: a.patientName,
        Bed: a.bedNumber,
        Ward: a.wardName,
        Doctor: a.admittingDoctorName,
        'Admission Date': a.admissionDate,
        'Discharge Date': a.dischargeDate || 'Active',
        Status: a.status,
      }));
      exportToCsv(`medicare_inpatient_census_${endDate}`, rows);
    } else {
      const rows = mockAppointments.map(apt => ({
        'Appt Code': apt.appointmentCode,
        Patient: apt.patientName,
        Doctor: apt.doctorName,
        Department: apt.departmentName,
        Date: apt.appointmentDate,
        Time: apt.appointmentTime,
        Type: apt.type,
        Fee: apt.consultationFee,
        Status: apt.status,
      }));
      exportToCsv(`medicare_appointments_report_${endDate}`, rows);
    }
    toast.success('Report exported to CSV successfully');
  };

  const handlePrint = () => {
    printSection('reports-printable-area');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-600" />
            Clinical Reports & Executive Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive hospital census, financial revenues, appointment metrics, and CSV exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Date filter & Report Tabs */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setReportType('financial')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              reportType === 'financial'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Financial & Invoicing
          </button>
          <button
            onClick={() => setReportType('census')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              reportType === 'census'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Inpatient Census & Beds
          </button>
          <button
            onClick={() => setReportType('appointments')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              reportType === 'appointments'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Appointments & Visits
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div id="reports-printable-area" className="space-y-6">
        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Revenue Breakdown by Clinical Department
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total Settled Collections Across Services</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCategoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Monthly Outpatient Visit Growth
            </h3>
            <p className="text-xs text-slate-500 mb-4">Completed Consultations vs Cancellations</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAppointmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="completed" name="Completed Visits" stroke="#0284c7" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {reportType === 'financial'
                ? 'Financial Invoicing Ledger'
                : reportType === 'census'
                ? 'Patient Inpatient Census Ledger'
                : 'Appointment Schedule Ledger'}
            </h3>
            <Badge variant="primary" size="sm">
              Official Executive Copy
            </Badge>
          </div>

          <div className="overflow-x-auto">
            {reportType === 'financial' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">Tax (5%)</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockInvoices.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-700">{i.invoiceNumber}</td>
                      <td className="p-3 font-bold">{i.patientName}</td>
                      <td className="p-3 text-slate-500">{formatDate(i.dateIssued)}</td>
                      <td className="p-3 text-right">{formatCurrency(i.subtotal)}</td>
                      <td className="p-3 text-right">{formatCurrency(i.taxAmount)}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(i.totalAmount)}</td>
                      <td className="p-3 text-right text-emerald-600 font-semibold">{formatCurrency(i.paidAmount)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={i.status === 'paid' ? 'success' : 'warning'} size="sm">
                          {i.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'census' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Admission #</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Bed</th>
                    <th className="p-3">Ward</th>
                    <th className="p-3">Admitting Physician</th>
                    <th className="p-3">Date Admitted</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockAdmissions.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-700">{a.admissionCode}</td>
                      <td className="p-3 font-bold">{a.patientName}</td>
                      <td className="p-3 font-semibold">{a.bedNumber}</td>
                      <td className="p-3 text-slate-600">{a.wardName}</td>
                      <td className="p-3">{a.admittingDoctorName}</td>
                      <td className="p-3 text-slate-500">{formatDate(a.admissionDate)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={a.status === 'active' ? 'primary' : 'neutral'} size="sm">
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'appointments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Appt #</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Physician</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3 text-right">Fee</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-700">{apt.appointmentCode}</td>
                      <td className="p-3 font-bold">{apt.patientName}</td>
                      <td className="p-3">{apt.doctorName}</td>
                      <td className="p-3 text-slate-600">{apt.departmentName}</td>
                      <td className="p-3 text-slate-500">{apt.appointmentDate} at {apt.appointmentTime}</td>
                      <td className="p-3 text-right font-semibold">${apt.consultationFee}</td>
                      <td className="p-3 text-center">
                        <Badge variant={apt.status === 'confirmed' ? 'success' : 'neutral'} size="sm">
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
