import React, { useState } from 'react';
import { mockPatients } from '../../lib/mockData';
import { Patient } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  generateCustomId,
  calculateAge,
  formatDate,
  exportToCsv,
} from '../../lib/utils';
import {
  UserPlus,
  Users,
  Download,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDob, setFormDob] = useState('1990-01-01');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formBloodGroup, setFormBloodGroup] = useState<Patient['bloodGroup']>('O+');
  const [formAddress, setFormAddress] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formEmergencyRel, setFormEmergencyRel] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formInsurance, setFormInsurance] = useState('');
  const [formPolicy, setFormPolicy] = useState('');

  const filteredPatients = patients.filter(p => {
    if (!showArchived && p.isArchived) return false;
    if (showArchived && !p.isArchived) return false;

    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || p.admissionStatus === statusFilter;
    const matchesBlood =
      bloodFilter === 'all' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      toast.error('Please provide at least full name and phone number');
      return;
    }

    const newId = generateCustomId('PAT');
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      patientId: newId,
      fullName: formName,
      email: formEmail,
      phone: formPhone,
      dateOfBirth: formDob,
      gender: formGender,
      bloodGroup: formBloodGroup,
      address: formAddress || 'Address on file',
      emergencyContactName: formEmergencyName || 'Family Contact',
      emergencyContactPhone: formEmergencyPhone || formPhone,
      emergencyContactRelation: formEmergencyRel || 'Relative',
      allergies: formAllergies ? formAllergies.split(',').map(s => s.trim()) : [],
      insuranceProvider: formInsurance,
      insurancePolicyNumber: formPolicy,
      isArchived: false,
      admissionStatus: 'outpatient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPatients([newPatient, ...patients]);
    setIsRegisterOpen(false);
    resetForm();
    toast.success(`Patient registered successfully with ID ${newId}`);
  };

  const handleEditPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    setPatients(prev =>
      prev.map(p =>
        p.id === editingPatient.id
          ? {
              ...p,
              fullName: formName,
              email: formEmail,
              phone: formPhone,
              address: formAddress,
              emergencyContactName: formEmergencyName,
              emergencyContactPhone: formEmergencyPhone,
              allergies: formAllergies ? formAllergies.split(',').map(s => s.trim()) : [],
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setEditingPatient(null);
    resetForm();
    toast.success('Patient details updated successfully');
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFormName(p.fullName);
    setFormEmail(p.email || '');
    setFormPhone(p.phone);
    setFormAddress(p.address);
    setFormEmergencyName(p.emergencyContactName);
    setFormEmergencyPhone(p.emergencyContactPhone);
    setFormAllergies(p.allergies?.join(', ') || '');
  };

  const toggleArchive = (p: Patient) => {
    setPatients(prev =>
      prev.map(item =>
        item.id === p.id ? { ...item, isArchived: !item.isArchived } : item
      )
    );
    toast.success(
      p.isArchived ? `Restored record for ${p.fullName}` : `Archived medical record for ${p.fullName}`
    );
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormEmergencyName('');
    setFormEmergencyPhone('');
    setFormEmergencyRel('');
    setFormAllergies('');
    setFormInsurance('');
    setFormPolicy('');
  };

  const handleExport = () => {
    const exportData = filteredPatients.map(p => ({
      'Patient ID': p.patientId,
      'Full Name': p.fullName,
      'Date of Birth': p.dateOfBirth,
      Gender: p.gender,
      'Blood Group': p.bloodGroup,
      Phone: p.phone,
      Email: p.email || '',
      Status: p.admissionStatus,
      Allergies: p.allergies?.join('; ') || 'None',
      'Insurance Provider': p.insuranceProvider || 'N/A',
    }));
    exportToCsv(`medicare_patients_${new Date().toISOString().slice(0, 10)}`, exportData);
    toast.success('Patient registry exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Patient Directory & Clinical Census
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive hospital registry, admission histories, and emergency contacts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setIsRegisterOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, patient ID, phone..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="outpatient">Outpatient</option>
            <option value="admitted">Admitted (Inpatient)</option>
            <option value="discharged">Discharged</option>
          </select>

          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-lg font-medium transition ${
              showArchived
                ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        {filteredPatients.length === 0 ? (
          <EmptyState
            title="No Patient Records Found"
            description="No patients match your current filter criteria. You can register a new patient or adjust search filters."
            actionLabel="Register New Patient"
            onAction={() => setIsRegisterOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Patient ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Age / Gender</th>
                  <th className="p-3.5">Blood Group</th>
                  <th className="p-3.5">Contact Phone</th>
                  <th className="p-3.5">Admission Status</th>
                  <th className="p-3.5">Emergency Contact</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                      {patient.patientId}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {patient.fullName}
                      </div>
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          ⚠ Allergies: {patient.allergies.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {calculateAge(patient.dateOfBirth)} yrs • <span className="capitalize">{patient.gender}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono">
                      {patient.phone}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          patient.admissionStatus === 'admitted'
                            ? 'danger'
                            : patient.admissionStatus === 'outpatient'
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {patient.admissionStatus === 'admitted' ? `Admitted (${patient.currentWard || 'Ward'})` : patient.admissionStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div>{patient.emergencyContactName} ({patient.emergencyContactRelation})</div>
                      <div className="text-[10px] font-mono">{patient.emergencyContactPhone}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-600"
                          title="View 360 Patient Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(patient)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleArchive(patient)}
                          className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                            patient.isArchived ? 'text-emerald-600' : 'text-slate-400 hover:text-rose-600'
                          }`}
                          title={patient.isArchived ? 'Restore Patient Record' : 'Archive Patient Record'}
                        >
                          {patient.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Patient Profile"
        subtitle="Generates unique hospital ID and creates electronic patient master file"
        maxWidth="2xl"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Arthur Pendelton"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+1 (555) 011-8899"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formDob}
                onChange={e => setFormDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={formGender}
                onChange={e => setFormGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Blood Group *
              </label>
              <select
                value={formBloodGroup}
                onChange={e => setFormBloodGroup(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="patient@medicare.health"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
                placeholder="Street address, City, State"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Emergency Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Contact Name"
                value={formEmergencyName}
                onChange={e => setFormEmergencyName(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={formEmergencyPhone}
                onChange={e => setFormEmergencyPhone(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={formEmergencyRel}
                onChange={e => setFormEmergencyRel(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Allergies & Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Known Drug Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={formAllergies}
                onChange={e => setFormAllergies(e.target.value)}
                placeholder="Penicillin, Sulfa"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                value={formInsurance}
                onChange={e => setFormInsurance(e.target.value)}
                placeholder="Blue Cross Shield"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Policy / Member ID
              </label>
              <input
                type="text"
                value={formPolicy}
                onChange={e => setFormPolicy(e.target.value)}
                placeholder="BCS-991204"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Complete Patient Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Modal
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          title={`Edit Patient Details — ${editingPatient.patientId}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditPatient} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Known Allergies (comma separated)</label>
              <input
                type="text"
                value={formAllergies}
                onChange={e => setFormAllergies(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setEditingPatient(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 360 Patient Profile Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Record — ${selectedPatient.fullName}`}
          subtitle={`Master Hospital ID: ${selectedPatient.patientId}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {/* Demographic Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Date of Birth</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedPatient.dateOfBirth}</p>
                <p className="text-[11px] text-slate-500">({calculateAge(selectedPatient.dateOfBirth)} years)</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Gender</span>
                <p className="font-bold capitalize text-slate-900 dark:text-white mt-0.5">{selectedPatient.gender}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Blood Group</span>
                <p className="font-extrabold text-sky-600 mt-0.5">{selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Admission Status</span>
                <p className="font-bold capitalize text-slate-900 dark:text-white mt-0.5">{selectedPatient.admissionStatus}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-sky-600" /> Contact & Residence
              </h4>
              <p className="text-slate-600 dark:text-slate-400">Phone: <span className="font-semibold">{selectedPatient.phone}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Email: <span className="font-semibold">{selectedPatient.email || 'None on file'}</span></p>
              <p className="text-slate-600 dark:text-slate-400">Address: <span className="font-semibold">{selectedPatient.address}</span></p>
            </div>

            {/* Emergency Contact */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white">Emergency Contact Contact Details</h4>
              <p className="mt-1">
                {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactRelation}) • Phone:{' '}
                <span className="font-mono font-bold text-sky-600">{selectedPatient.emergencyContactPhone}</span>
              </p>
            </div>

            {/* Allergies & Insurance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <span className="font-bold text-rose-700 dark:text-rose-300">Known Clinical Allergies</span>
                <p className="mt-1 text-slate-800 dark:text-slate-200">
                  {selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'None documented'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
                <span className="font-bold text-teal-800 dark:text-teal-300">Insurance & Coverage</span>
                <p className="mt-1 text-slate-800 dark:text-slate-200">
                  {selectedPatient.insuranceProvider || 'Self-pay'} • Policy: {selectedPatient.insurancePolicyNumber || 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Registered on: {formatDate(selectedPatient.createdAt)}</span>
              <Button variant="primary" size="sm" onClick={() => setSelectedPatient(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
