import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockPatients,
  mockAppointments,
  mockPrescriptions,
  mockInvoices,
  mockMedicalRecords,
} from '../../lib/mockData';
import { getStoredPatients, getStoredAppointments } from '../../lib/storage';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PrintablePrescription } from '../../components/print/PrintablePrescription';
import { PrintableInvoice } from '../../components/print/PrintableInvoice';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Calendar,
  Pill,
  CreditCard,
  FileText,
  Clock,
  Printer,
  Heart,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { Prescription, Invoice, Patient, Appointment } from '../../types';
import { Link } from 'react-router-dom';

export const PatientPortal: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStoredAppointments(mockAppointments));

  useEffect(() => {
    const handleAppointmentsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<Appointment[]>;
      if (customEvent.detail) setAppointments(customEvent.detail);
      else setAppointments(getStoredAppointments());
    };
    window.addEventListener('medicare_appointments_changed', handleAppointmentsChanged);
    return () => {
      window.removeEventListener('medicare_appointments_changed', handleAppointmentsChanged);
    };
  }, []);

  // Find patient record
  const allPatients = getStoredPatients(mockPatients);
  const currentPatient: Patient =
    allPatients.find(p => p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
    allPatients.find(p => p.fullName.toLowerCase() === (user?.fullName || '').toLowerCase()) ||
    allPatients[0] || {
      id: user?.id || 'pat-user',
      patientId: 'PAT-REG',
      fullName: user?.fullName || 'Registered Patient',
      email: user?.email,
      phone: user?.phone || 'On file',
      dateOfBirth: '1995-01-01',
      gender: 'other',
      bloodGroup: 'O+',
      address: 'On file',
      emergencyContactName: 'Family',
      emergencyContactPhone: user?.phone || 'On file',
      emergencyContactRelation: 'Self',
      isArchived: false,
      admissionStatus: 'outpatient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  const myAppointments = appointments.filter(
    a => a.patientId === currentPatient.id || a.patientName === currentPatient.fullName
  );
  const myPrescriptions = mockPrescriptions.filter(
    r => r.patientId === currentPatient.id || r.patientName === currentPatient.fullName
  );
  const myInvoices = mockInvoices.filter(
    i => i.patientId === currentPatient.id || i.patientName === currentPatient.fullName
  );
  const myRecords = mockMedicalRecords.filter(
    m => m.patientId === currentPatient.id || m.patientName === currentPatient.fullName
  );

  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-teal-200 bg-teal-800/80 px-2.5 py-1 rounded">
            Personal Health Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Hello, {currentPatient.fullName}
          </h1>
          <p className="text-sm text-sky-100 mt-1">
            Patient ID: <span className="font-mono font-bold">{currentPatient.patientId}</span> • Blood Group: <span className="font-bold">{currentPatient.bloodGroup}</span>
          </p>
        </div>

        <Link to="/appointments">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Allergies / Medical Banner */}
      {currentPatient.allergies && currentPatient.allergies.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-amber-800 dark:text-amber-300">Recorded Allergies: </span>
            <span className="text-slate-700 dark:text-slate-300">
              {currentPatient.allergies.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Appointments"
          value={myAppointments.length}
          subtitle="Scheduled & past visits"
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Active Prescriptions"
          value={myPrescriptions.length}
          subtitle="Issued medical prescriptions"
          icon={<Pill className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Clinical Consultations"
          value={myRecords.length}
          subtitle="Verified doctor notes"
          icon={<FileText className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Invoices & Bills"
          value={myInvoices.length}
          subtitle="Hospital accounting statements"
          icon={<CreditCard className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Appointments
            </h3>
            <Link to="/appointments" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {myAppointments.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">No upcoming clinical appointments scheduled.</p>
                <Link to="/appointments">
                  <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Schedule Visit
                  </Button>
                </Link>
              </div>
            ) : (
              myAppointments.map(apt => (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {apt.doctorName}
                    </span>
                    <Badge
                      variant={
                        apt.status === 'confirmed'
                          ? 'success'
                          : apt.status === 'scheduled'
                          ? 'primary'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 mt-1">{apt.doctorSpecialization} • {apt.departmentName}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">{apt.reason}</p>
                  <p className="text-slate-400 text-[11px] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(apt.appointmentDate)} at {apt.appointmentTime}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">${apt.consultationFee}</span>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Prescriptions (Rx)
            </h3>
            <Badge variant="teal" size="sm">Pharmacy Authorized</Badge>
          </div>

          <div className="space-y-3">
            {myPrescriptions.map(rx => (
              <div
                key={rx.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Rx: {rx.prescriptionCode}
                    </span>
                    <Badge variant="success" size="sm">{rx.status}</Badge>
                  </div>
                  <p className="text-slate-500 mt-0.5">By {rx.doctorName} on {rx.date}</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">Diagnosis: {rx.diagnosis}</p>
                  <div className="mt-2 space-y-1">
                    {rx.items.map(item => (
                      <span
                        key={item.id}
                        className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-sky-700 dark:text-sky-300"
                      >
                        {item.medicineName} ({item.frequency})
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRx(rx)}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Rx
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices & Billing Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Billing Statements & Payments
            </h3>
            <p className="text-xs text-slate-500">Transparent hospital accounting</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-500">{formatDate(inv.dateIssued)}</td>
                  <td className="p-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(inv.totalAmount)}</td>
                  <td className="p-3 text-right text-emerald-600 font-semibold">{formatCurrency(inv.paidAmount)}</td>
                  <td className="p-3 text-center">
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
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(inv)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      View Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Print Modal */}
      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Prescription — ${selectedRx.prescriptionCode}`}
          maxWidth="2xl"
        >
          <PrintablePrescription prescription={selectedRx} />
        </Modal>
      )}

      {/* Invoice Print Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice — ${selectedInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <PrintableInvoice invoice={selectedInvoice} />
        </Modal>
      )}
    </div>
  );
};
