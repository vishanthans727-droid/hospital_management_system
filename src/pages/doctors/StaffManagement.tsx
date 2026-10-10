import React, { useState } from 'react';
import { mockDoctors, mockStaff, mockDepartments, mockAppointments } from '../../lib/mockData';
import { Doctor, Staff } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { generateCustomId, formatCurrency } from '../../lib/utils';
import {
  UserCheck,
  UserPlus,
  Stethoscope,
  Clock,
  Phone,
  Mail,
  Award,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StaffManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'staff'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [selectedDoctorAppointments, setSelectedDoctorAppointments] = useState<Doctor | null>(null);

  // Add doctor form state
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docDeptId, setDocDeptId] = useState(mockDepartments[0].id);
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docQualifications, setDocQualifications] = useState('');
  const [docLicense, setDocLicense] = useState('');
  const [docFee, setDocFee] = useState(150);

  // Add staff form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'nurse' | 'receptionist'>('nurse');
  const [staffShift, setStaffShift] = useState<'morning' | 'evening' | 'night'>('morning');

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docEmail) return;

    const dept = mockDepartments.find(d => d.id === docDeptId) || mockDepartments[0];
    const newDocId = generateCustomId('DOC');

    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      doctorId: newDocId,
      fullName: docName,
      email: docEmail,
      phone: docPhone,
      departmentId: dept.id,
      departmentName: dept.name,
      specialization: docSpecialty,
      qualifications: docQualifications,
      licenseNumber: docLicense || `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
      consultationFee: docFee,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      isAvailableToday: true,
      activeAppointmentsCount: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    };

    setDoctors([newDoctor, ...doctors]);
    setIsAddDoctorOpen(false);
    toast.success(`Doctor profile for ${docName} created with ID ${newDocId}`);
    // Reset form
    setDocName('');
    setDocEmail('');
    setDocPhone('');
    setDocSpecialty('');
    setDocQualifications('');
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    const newStaffId = generateCustomId('STF');
    const newStaffMember: Staff = {
      id: `stf-${Date.now()}`,
      userId: `usr-stf-${Date.now()}`,
      staffId: newStaffId,
      fullName: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: staffRole,
      departmentId: mockDepartments[0].id,
      departmentName: mockDepartments[0].name,
      shift: staffShift,
      joinDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    };

    setStaff([newStaffMember, ...staff]);
    setIsAddStaffOpen(false);
    toast.success(`Staff member ${staffName} added with ID ${newStaffId}`);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
  };

  const toggleDoctorAvailability = (docId: string) => {
    setDoctors(prev =>
      prev.map(d =>
        d.id === docId ? { ...d, isAvailableToday: !d.isAvailableToday } : d
      )
    );
    toast.success('Doctor availability status toggled');
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doctorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || doc.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredStaff = staff.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-600" />
            Medical Staff & Practitioners Roster
          </h1>
          <p className="text-xs text-slate-500">
            Physicians, clinical specialists, nurses, and administrative officers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'doctors' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddDoctorOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Doctor Profile
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddStaffOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Staff Member
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'doctors'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors & Specialists ({doctors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Nursing & Administrative Staff ({staff.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, specialization, or ID..."
          />
        </div>

        {activeTab === 'doctors' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Clinical Departments</option>
              {mockDepartments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {activeTab === 'doctors' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-500/20"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {doctor.fullName}
                      </h3>
                      <p className="text-xs text-sky-600 font-medium">
                        {doctor.specialization}
                      </p>
                      <span className="font-mono text-[10px] text-slate-400">
                        {doctor.doctorId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDoctorAvailability(doctor.id)}
                    title="Click to toggle availability"
                  >
                    <Badge
                      variant={doctor.isAvailableToday ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {doctor.isAvailableToday ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-0.5" /> Off Duty
                        </>
                      )}
                    </Badge>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.departmentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doctor.qualifications}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {doctor.startTime} - {doctor.endTime} ({doctor.availableDays.slice(0, 3).join(', ')})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Consultation Fee</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(doctor.consultationFee)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoctorAppointments(doctor)}
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                >
                  Schedule ({doctor.activeAppointmentsCount || 0})
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Staff Table */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Staff ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Shift</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                      {member.staffId}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {member.fullName}
                    </td>
                    <td className="p-3.5 capitalize text-slate-700 dark:text-slate-300">
                      <Badge variant="teal" size="sm">
                        {member.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {member.departmentName}
                    </td>
                    <td className="p-3.5 uppercase text-[11px] font-semibold text-slate-500">
                      {member.shift} shift
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {member.phone}
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge variant={member.isActive ? 'success' : 'neutral'} size="sm">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        title="Add Attending Physician Profile"
        subtitle="Registers physician with credentials, department assignment, and fee schedule"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddDoctor} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Doctor Full Name *</label>
              <input
                type="text"
                required
                value={docName}
                onChange={e => setDocName(e.target.value)}
                placeholder="Dr. Michael Vance, MD"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Professional Email *</label>
              <input
                type="email"
                required
                value={docEmail}
                onChange={e => setDocEmail(e.target.value)}
                placeholder="doctor@medicare.health"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Contact Phone</label>
              <input
                type="tel"
                value={docPhone}
                onChange={e => setDocPhone(e.target.value)}
                placeholder="+1 (555) 019-8877"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={docDeptId}
                onChange={e => setDocDeptId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {mockDepartments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Specialization</label>
              <input
                type="text"
                value={docSpecialty}
                onChange={e => setDocSpecialty(e.target.value)}
                placeholder="Interventional Cardiology"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Qualifications</label>
              <input
                type="text"
                value={docQualifications}
                onChange={e => setDocQualifications(e.target.value)}
                placeholder="MD, FACC, Harvard Medical School"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Medical License Number</label>
              <input
                type="text"
                value={docLicense}
                onChange={e => setDocLicense(e.target.value)}
                placeholder="MD-CARD-99218"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Consultation Fee ($ USD)</label>
              <input
                type="number"
                value={docFee}
                onChange={e => setDocFee(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddDoctorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Physician Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add Staff Member"
        subtitle="Registers nursing and front desk operational personnel"
        maxWidth="lg"
      >
        <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              placeholder="e.g. Rachel Adams, RN"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
              placeholder="rachel.a@medicare.health"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Role</label>
              <select
                value={staffRole}
                onChange={e => setStaffRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Shift</label>
              <select
                value={staffShift}
                onChange={e => setStaffShift(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={staffPhone}
              onChange={e => setStaffPhone(e.target.value)}
              placeholder="+1 (555) 012-3344"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit">
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Doctor Upcoming Appointments Modal */}
      {selectedDoctorAppointments && (
        <Modal
          isOpen={!!selectedDoctorAppointments}
          onClose={() => setSelectedDoctorAppointments(null)}
          title={`Upcoming Schedule — ${selectedDoctorAppointments.fullName}`}
          maxWidth="lg"
        >
          <div className="space-y-3 text-xs">
            {mockAppointments
              .filter(a => a.doctorId === selectedDoctorAppointments.id || a.doctorName === selectedDoctorAppointments.fullName)
              .map(apt => (
                <div key={apt.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{apt.patientName}</span>
                    <span className="text-sky-600">{apt.appointmentDate} at {apt.appointmentTime}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{apt.reason}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'neutral'} size="sm">
                      {apt.status}
                    </Badge>
                    <span className="text-[11px] text-slate-400">ID: {apt.appointmentCode}</span>
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
