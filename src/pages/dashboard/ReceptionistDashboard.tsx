import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockAppointments, mockPatients, mockBeds, mockInvoices } from '../../lib/mockData';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import {
  Calendar,
  Users,
  CheckCircle,
  CreditCard,
  UserPlus,
  BedDouble,
  Clock,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchQuery, setSearchQuery] = useState('');

  const checkInPatient = (aptId: string) => {
    setAppointments(prev =>
      prev.map(a => (a.id === aptId ? { ...a, status: 'confirmed' } : a))
    );
    toast.success('Patient checked in and marked confirmed for consultation.');
  };

  const filteredAppointments = appointments.filter(
    a =>
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.appointmentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableBeds = mockBeds.filter(b => b.status === 'available').length;
  const pendingInvoices = mockInvoices.filter(i => i.status !== 'paid');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-200 bg-sky-800/80 px-2.5 py-1 rounded">
            Reception & Front Desk Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {user?.fullName}
          </h1>
          <p className="text-sm text-sky-100 mt-1">
            Patient Admission, Appointment Scheduling, and Front Counter Services
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/patients">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Register Patient
            </Button>
          </Link>
          <Link to="/appointments">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Schedule Visit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={appointments.length}
          subtitle="Total schedule bookings"
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Registered Patients"
          value={mockPatients.length}
          subtitle="Hospital database census"
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Available Beds"
          value={availableBeds}
          subtitle="Vacant for emergency / inpatient"
          icon={<BedDouble className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          subtitle="Awaiting cashier settlement"
          icon={<CreditCard className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Main Check-In Queue */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Patient Check-In & Arrival Queue
            </h3>
            <p className="text-xs text-slate-500">Live reception desk check-in stream</p>
          </div>
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by patient or doctor..."
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAppointments.map(apt => (
            <div
              key={apt.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold text-xs text-center shrink-0">
                  <Clock className="w-4 h-4 mx-auto mb-0.5" />
                  <span>{apt.appointmentTime}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {apt.patientName}
                    </span>
                    <Badge
                      variant={
                        apt.status === 'confirmed'
                          ? 'success'
                          : apt.status === 'scheduled'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Consulting: <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.doctorName}</span> ({apt.departmentName})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>ID: {apt.appointmentCode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {apt.patientPhone}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {apt.status === 'scheduled' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => checkInPatient(apt.id)}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Check In
                  </Button>
                ) : (
                  <Badge variant="success" size="md">
                    Checked In
                  </Badge>
                )}
                <Link to="/billing">
                  <Button variant="outline" size="sm">
                    Fee: ${apt.consultationFee}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
