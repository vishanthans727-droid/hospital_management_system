import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockPatients,
  mockDoctors,
  mockStaff,
  mockAppointments,
  mockAdmissions,
  mockBeds,
  mockInvoices,
  mockAuditLogs,
} from '../../lib/mockData';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Users,
  UserCheck,
  Calendar,
  BedDouble,
  DollarSign,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Real calculated metrics from state/mock
  const totalPatients = mockPatients.filter(p => !p.isArchived).length;
  const totalDoctorsAndStaff = mockDoctors.length + mockStaff.length;
  const todayAppointments = mockAppointments.filter(
    a => a.appointmentDate === '2026-10-10' || a.status === 'confirmed'
  ).length;
  const currentAdmissions = mockAdmissions.filter(a => a.status === 'active').length;
  const totalBeds = mockBeds.length;
  const availableBeds = mockBeds.filter(b => b.status === 'available').length;

  const collectedPayments = mockInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingBills = mockInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  // Chart 1: Admissions and discharge trend
  const admissionTrendData = [
    { month: 'May', admissions: 34, discharges: 28 },
    { month: 'Jun', admissions: 42, discharges: 36 },
    { month: 'Jul', admissions: 51, discharges: 44 },
    { month: 'Aug', admissions: 48, discharges: 46 },
    { month: 'Sep', admissions: 58, discharges: 52 },
    { month: 'Oct', admissions: 64, discharges: 59 },
  ];

  // Chart 2: Appointments by Department
  const deptAppointmentsData = [
    { department: 'Cardiology', count: 28 },
    { department: 'Pediatrics', count: 22 },
    { department: 'Neurology', count: 18 },
    { department: 'Orthopedics', count: 19 },
    { department: 'Emergency', count: 35 },
  ];

  // Chart 3: Bed occupancy
  const bedStatusData = [
    { name: 'Available', value: availableBeds, color: '#10b981' },
    { name: 'Occupied', value: mockBeds.filter(b => b.status === 'occupied').length, color: '#0284c7' },
    { name: 'Cleaning', value: mockBeds.filter(b => b.status === 'cleaning').length, color: '#f59e0b' },
    { name: 'Maintenance', value: mockBeds.filter(b => b.status === 'maintenance').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-sky-900 via-sky-800 to-teal-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-200 bg-sky-800/80 px-2.5 py-1 rounded">
            Hospital Administration Command
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-sm text-sky-100/90 mt-1">
            Real-time operations, clinical patient census, bed allocation, and financial analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/patients">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Patient
            </Button>
          </Link>
          <Link to="/appointments">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Registered active profiles"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 12.5, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Doctors & Staff"
          value={totalDoctorsAndStaff}
          subtitle={`${mockDoctors.length} doctors, ${mockStaff.length} clinical staff`}
          icon={<UserCheck className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Today's Visits"
          value={todayAppointments}
          subtitle="Outpatient appointments"
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: 8.2, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Active Admissions"
          value={currentAdmissions}
          subtitle="Inpatient bed occupancy"
          icon={<Activity className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Bed Capacity"
          value={`${availableBeds} / ${totalBeds}`}
          subtitle={`${Math.round((availableBeds / totalBeds) * 100)}% available`}
          icon={<BedDouble className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(collectedPayments)}
          subtitle={`Pending: ${formatCurrency(pendingBills)}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 15.4, isPositive: true }}
          color="rose"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Admissions and discharges */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Patient Admission & Discharge Trends
              </h3>
              <p className="text-xs text-slate-500">6-Month Inpatient Census Statistics</p>
            </div>
            <Badge variant="primary" size="sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              +14% Inpatient Flow
            </Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={admissionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="dischargeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="admissions" name="New Admissions" stroke="#0284c7" strokeWidth={2.5} fill="url(#admissionGradient)" />
                <Area type="monotone" dataKey="discharges" name="Discharges" stroke="#0d9488" strokeWidth={2.5} fill="url(#dischargeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bed Occupancy Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Real-Time Bed Status
              </h3>
              <Link to="/admissions" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center">
                Manage Beds <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">Ward Bed Utilization Ratio</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bedStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {bedStatusData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Appointments by Department & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments by Department */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Appointments by Department
            </h3>
            <Link to="/appointments" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              View Calendar
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAppointmentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#94a3b8" />
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
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Admissions Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Current Inpatients
            </h3>
            <Badge variant="primary" size="sm">
              {currentAdmissions} Active
            </Badge>
          </div>

          <div className="space-y-3">
            {mockAdmissions.filter(a => a.status === 'active').slice(0, 4).map(adm => (
              <div
                key={adm.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{adm.patientName}</p>
                  <p className="text-slate-500">Bed: <span className="font-semibold text-sky-600">{adm.bedNumber}</span> • {adm.wardName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Doctor: {adm.admittingDoctorName}</p>
                </div>
                <Badge variant="success" size="sm">Admitted</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Clinical Activities
            </h3>
            <Link to="/audit-logs" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              Full Audit Trail
            </Link>
          </div>

          <div className="space-y-3">
            {mockAuditLogs.map(log => (
              <div key={log.id} className="flex gap-3 text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-none">
                <div className="mt-0.5 p-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{log.userName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded mt-1 inline-block">
                    {log.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
