import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockAppointments,
  mockDoctors,
  mockPatients,
  mockDepartments,
} from '../../lib/mockData';
import {
  getStoredAppointments,
  addStoredAppointment,
  updateStoredAppointment,
  getStoredPatients,
  getStoredDoctors,
} from '../../lib/storage';
import { Appointment, AppointmentStatus, Patient, Doctor } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { generateCustomId, formatDate } from '../../lib/utils';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  User,
  Stethoscope,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AppointmentList: React.FC = () => {
  const { user, role } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStoredAppointments(mockAppointments));
  const [availablePatients, setAvailablePatients] = useState<Patient[]>(() => getStoredPatients(mockPatients));
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(() => getStoredDoctors(mockDoctors));
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  // Detect current logged-in patient if applicable
  const currentPatient: Patient | null = role === 'patient'
    ? (availablePatients.find(p => p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
       availablePatients.find(p => p.fullName.toLowerCase() === (user?.fullName || '').toLowerCase()) ||
       availablePatients.find(p => p.id === user?.id) || {
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
       })
    : null;

  useEffect(() => {
    const handleAppointmentsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<Appointment[]>;
      if (customEvent.detail) setAppointments(customEvent.detail);
      else setAppointments(getStoredAppointments());
    };
    const handlePatientsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<Patient[]>;
      if (customEvent.detail) setAvailablePatients(customEvent.detail);
      else setAvailablePatients(getStoredPatients());
    };
    const handleDoctorsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<Doctor[]>;
      if (customEvent.detail) setAvailableDoctors(customEvent.detail);
      else setAvailableDoctors(getStoredDoctors());
    };
    window.addEventListener('medicare_appointments_changed', handleAppointmentsChanged);
    window.addEventListener('medicare_patients_changed', handlePatientsChanged);
    window.addEventListener('medicare_doctors_changed', handleDoctorsChanged);
    return () => {
      window.removeEventListener('medicare_appointments_changed', handleAppointmentsChanged);
      window.removeEventListener('medicare_patients_changed', handlePatientsChanged);
      window.removeEventListener('medicare_doctors_changed', handleDoctorsChanged);
    };
  }, []);

  // Book modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [patientId, setPatientId] = useState<string>(() => currentPatient?.id || availablePatients[0]?.id || '');
  const [doctorId, setDoctorId] = useState<string>(() => availableDoctors[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<Appointment['type']>('general');

  // When book modal opens, ensure sensible defaults
  useEffect(() => {
    if (isBookModalOpen) {
      if (currentPatient) {
        setPatientId(currentPatient.id);
      } else if (!patientId && availablePatients.length > 0) {
        setPatientId(availablePatients[0].id);
      }
      if (!doctorId && availableDoctors.length > 0) {
        setDoctorId(availableDoctors[0].id);
      }
    }
  }, [isBookModalOpen, currentPatient, availablePatients, availableDoctors]);

  // Reschedule modal
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Available time slots generator
  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDoctor = availableDoctors.find(d => d.id === doctorId) || availableDoctors[0];
    const selectedPatient = (role === 'patient' && currentPatient)
      ? currentPatient
      : (availablePatients.find(p => p.id === patientId) || availablePatients[0]);

    if (!selectedDoctor || !selectedPatient) {
      toast.error('Unable to schedule consultation: Please select a valid doctor and patient.');
      return;
    }

    // Double-booking prevention check!
    const conflict = appointments.find(
      a =>
        a.doctorId === selectedDoctor.id &&
        a.appointmentDate === date &&
        a.appointmentTime === time &&
        a.status !== 'cancelled'
    );

    if (conflict) {
      toast.error(
        `Conflict detected: Dr. ${selectedDoctor.fullName} is already booked on ${date} at ${time}. Please select another slot.`
      );
      return;
    }

    const newAptCode = generateCustomId('APT');
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      appointmentCode: newAptCode,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientPhone: selectedPatient.phone,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.fullName,
      doctorSpecialization: selectedDoctor.specialization,
      departmentId: selectedDoctor.departmentId,
      departmentName: selectedDoctor.departmentName,
      appointmentDate: date,
      appointmentTime: time,
      durationMinutes: 30,
      reason: reason || 'General clinical consultation',
      status: 'scheduled',
      type,
      consultationFee: selectedDoctor.consultationFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addStoredAppointment(newApt);
    setAppointments(getStoredAppointments());
    setIsBookModalOpen(false);
    setReason('');
    toast.success(`Appointment confirmed for ${selectedPatient.fullName} with ${selectedDoctor.fullName} (Code: ${newAptCode})`);
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt) return;

    // Double-booking check for reschedule
    const conflict = appointments.find(
      a =>
        a.id !== reschedulingApt.id &&
        a.doctorId === reschedulingApt.doctorId &&
        a.appointmentDate === rescheduleDate &&
        a.appointmentTime === rescheduleTime &&
        a.status !== 'cancelled'
    );

    if (conflict) {
      toast.error(
        `Slot unavailable: ${reschedulingApt.doctorName} is already booked on ${rescheduleDate} at ${rescheduleTime}.`
      );
      return;
    }

    const updatedApt: Appointment = {
      ...reschedulingApt,
      appointmentDate: rescheduleDate,
      appointmentTime: rescheduleTime,
      status: 'scheduled',
      updatedAt: new Date().toISOString(),
    };
    updateStoredAppointment(updatedApt);
    setAppointments(getStoredAppointments());
    setReschedulingApt(null);
    toast.success('Appointment rescheduled successfully');
  };

  const updateStatus = (aptId: string, newStatus: AppointmentStatus) => {
    const existing = appointments.find(a => a.id === aptId);
    if (existing) {
      const updated = { ...existing, status: newStatus, updatedAt: new Date().toISOString() };
      updateStoredAppointment(updated);
      setAppointments(getStoredAppointments());
    }
    toast.success(`Appointment status updated to ${newStatus}`);
  };

  const filteredAppointments = appointments.filter(apt => {
    // If logged in as patient, only show this patient's appointments
    if (role === 'patient') {
      const isMyApt =
        (currentPatient && apt.patientId === currentPatient.id) ||
        (currentPatient && (apt.patientName || '').toLowerCase() === currentPatient.fullName.toLowerCase()) ||
        (user?.fullName && (apt.patientName || '').toLowerCase() === user.fullName.toLowerCase());
      if (!isMyApt) return false;
    }

    const patientName = apt.patientName || '';
    const doctorName = apt.doctorName || '';
    const code = apt.appointmentCode || '';

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || apt.status === statusFilter;
    const matchesDoctor =
      doctorFilter === 'all' || apt.doctorId === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-sky-600" />
            Appointment Scheduling & Consultations
          </h1>
          <p className="text-xs text-slate-500">
            {role === 'patient'
              ? 'View your booked doctor appointments, schedule new clinical visits, or reschedule slots'
              : 'Real-time doctor calendar, slot booking with conflict detection, and status management'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5 inline mr-1" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 inline mr-1" /> Calendar
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBookModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, doctor, or code..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-Show</option>
          </select>

          <select
            value={doctorFilter}
            onChange={e => setDoctorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Doctors</option>
            {availableDoctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={role === 'patient' ? 'No Appointments Scheduled' : 'No Appointments Found'}
                description={
                  role === 'patient'
                    ? 'You do not have any appointments matching this view. Click "Book Appointment" to schedule a consultation with our hospital physicians.'
                    : 'No appointments match your search and filter criteria.'
                }
                actionLabel="Book Appointment"
                onAction={() => setIsBookModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Appt Code</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Physician & Dept</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Reason / Notes</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                        {apt.appointmentCode}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {apt.patientName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {apt.patientPhone}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {apt.doctorName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {apt.departmentName}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          {apt.appointmentTime}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(apt.appointmentDate)}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {apt.reason}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant={
                            apt.status === 'confirmed'
                              ? 'success'
                              : apt.status === 'completed'
                              ? 'primary'
                              : apt.status === 'scheduled'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {apt.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'scheduled' && role !== 'patient' && (
                            <button
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                              title="Confirm Patient"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === 'confirmed' && role !== 'patient' && (
                            <button
                              onClick={() => updateStatus(apt.id, 'completed')}
                              className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold"
                              title="Mark Consultation Completed"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReschedulingApt(apt);
                              setRescheduleDate(apt.appointmentDate);
                              setRescheduleTime(apt.appointmentTime);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            Reschedule
                          </button>
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              className="p-1 rounded text-slate-400 hover:text-rose-600"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Calendar Overview View */
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
            Weekly Appointment Timeline Grid
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12'].map(dateStr => {
              const dayApts = filteredAppointments.filter(a => a.appointmentDate === dateStr);
              return (
                <div
                  key={dateStr}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-3">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(dateStr)}
                    </span>
                    <Badge variant="primary" size="sm">
                      {dayApts.length} Visits
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {dayApts.map(a => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs"
                      >
                        <div className="flex justify-between items-start font-bold">
                          <span className="text-slate-900 dark:text-white">{a.appointmentTime}</span>
                          <span className="text-[10px] uppercase font-semibold text-sky-600">{a.status}</span>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{a.patientName}</p>
                        <p className="text-[11px] text-slate-500">{a.doctorName}</p>
                      </div>
                    ))}
                    {dayApts.length === 0 && (
                      <p className="text-slate-400 text-center py-4 italic">No visits scheduled</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Patient Consultation"
        subtitle="Backend double-booking verification ensures doctor slot availability"
        maxWidth="lg"
      >
        <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">
              {role === 'patient' ? 'Patient Profile' : 'Select Registered Patient *'}
            </label>
            {role === 'patient' && currentPatient ? (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-sky-900 dark:text-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold">{currentPatient.fullName}</p>
                  <p className="text-[11px] text-slate-500">ID: {currentPatient.patientId} • Phone: {currentPatient.phone}</p>
                </div>
                <span className="text-[10px] uppercase font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded">
                  Logged In
                </span>
              </div>
            ) : (
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {availablePatients.filter(p => !p.isArchived).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.patientId} - {p.phone})
                  </option>
                ))}
                {availablePatients.length === 0 && (
                  <option value="">No registered patients found</option>
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Select Physician *</label>
            <select
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              {availableDoctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName} — {d.specialization} (${d.consultationFee})
                </option>
              ))}
              {availableDoctors.length === 0 && (
                <option value="">No physicians available</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Time Slot *</label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Consultation Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              <option value="general">General Outpatient Consultation</option>
              <option value="follow_up">Follow-up Visit</option>
              <option value="routine">Routine Checkup</option>
              <option value="emergency">Urgent Clinical Assessment</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Reason for Visit / Chief Complaint</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Follow-up blood pressure review and prescription renewal"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <Modal
          isOpen={!!reschedulingApt}
          onClose={() => setReschedulingApt(null)}
          title={`Reschedule Appointment — ${reschedulingApt.appointmentCode}`}
          maxWidth="md"
        >
          <form onSubmit={handleReschedule} className="space-y-3.5 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Patient: <span className="font-bold text-slate-900 dark:text-white">{reschedulingApt.patientName}</span> with <span className="font-bold">{reschedulingApt.doctorName}</span>
            </p>

            <div>
              <label className="block font-semibold mb-1">New Date</label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">New Time Slot</label>
              <select
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {availableSlots.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setReschedulingApt(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save New Time
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
