import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockAppointments,
  mockAdmissions,
  mockLabOrders,
  mockPatients,
} from '../../lib/mockData';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Calendar,
  Clock,
  User,
  Activity,
  FlaskConical,
  FilePlus,
  CheckCircle,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Find doctor's appointments
  const myAppointments = mockAppointments.filter(
    a => a.doctorName.includes(user?.fullName || '') || a.doctorId === 'doc-01'
  );

  const pendingConsultations = myAppointments.filter(
    a => a.status === 'confirmed' || a.status === 'scheduled'
  );

  const completedToday = myAppointments.filter(a => a.status === 'completed');

  const myInpatients = mockAdmissions.filter(
    a => a.admittingDoctorName.includes(user?.fullName || '') || a.admittingDoctorId === 'doc-01'
  );

  const criticalLabs = mockLabOrders.filter(
    order => order.tests.some(t => t.status === 'critical' || t.status === 'abnormal')
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-sky-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-200 bg-teal-900/80 px-2.5 py-1 rounded">
              Physician Consultation Suite
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded">
              Duty Roster: Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {user?.fullName}
          </h1>
          <p className="text-sm text-sky-100 mt-1">
            Department: {user?.departmentName || 'Cardiology'} • License: MD-CARD-99218
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/emr">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={<FilePlus className="w-4 h-4" />}
            >
              Add Consultation Note
            </Button>
          </Link>
          <Link to="/prescriptions">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Stethoscope className="w-4 h-4" />}
            >
              Write Prescription
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={myAppointments.length}
          subtitle={`${pendingConsultations.length} pending consultation`}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Inpatients Under Care"
          value={myInpatients.length}
          subtitle="Hospitalized ward patients"
          icon={<Activity className="w-5 h-5" />}
          color="teal"
        />
        <StatCard
          title="Completed Today"
          value={completedToday.length}
          subtitle="Seen & documented"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Critical Lab Alerts"
          value={criticalLabs.length}
          subtitle="Requires clinical action"
          icon={<FlaskConical className="w-5 h-5" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Queue */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Patient Schedule
              </h3>
              <p className="text-xs text-slate-500">Upcoming Consultations</p>
            </div>
            <Link to="/appointments" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {myAppointments.map(apt => (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs text-center min-w-[56px]">
                    <Clock className="w-3.5 h-3.5 mx-auto mb-0.5" />
                    <span>{apt.appointmentTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {apt.patientName}
                      </h4>
                      <Badge
                        variant={
                          apt.status === 'confirmed'
                            ? 'primary'
                            : apt.status === 'completed'
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{apt.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Code: {apt.appointmentCode} • Contact: {apt.patientPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/emr`}>
                    <Button variant="outline" size="sm">
                      Clinical Notes
                    </Button>
                  </Link>
                  <Link to={`/prescriptions`}>
                    <Button variant="primary" size="sm">
                      Prescribe
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Inpatient rounds & Lab alerts */}
        <div className="space-y-6">
          {/* Inpatients */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inpatient Rounds
              </h3>
              <Badge variant="teal" size="sm">
                {myInpatients.length} Patients
              </Badge>
            </div>

            <div className="space-y-3">
              {myInpatients.map(adm => (
                <div key={adm.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-white">{adm.patientName}</span>
                    <span className="font-semibold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                      {adm.bedNumber}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">{adm.wardName}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1.5 line-clamp-2">
                    {adm.reasonForAdmission}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Lab Alerts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Lab Diagnostic Alerts
              </h3>
              <Link to="/laboratory" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {criticalLabs.map(order => (
                <div key={order.id} className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{order.patientName}</span>
                    <Badge variant="danger" size="sm">CRITICAL</Badge>
                  </div>
                  <p className="text-rose-700 dark:text-rose-400 font-semibold mt-1">
                    {order.tests.find(t => t.status === 'critical')?.testName || order.tests[0].testName}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{order.clinicalImpression}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
