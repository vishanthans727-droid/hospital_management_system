import React, { useState } from 'react';
import {
  mockWards,
  mockBeds,
  mockAdmissions,
  mockPatients,
  mockDoctors,
} from '../../lib/mockData';
import { Ward, Bed, Admission, BedStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { generateCustomId, formatDate, formatCurrency } from '../../lib/utils';
import {
  BedDouble,
  UserPlus,
  LogOut,
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Building,
  Activity,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BedManagement: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [admissions, setAdmissions] = useState<Admission[]>(mockAdmissions);
  const [selectedWardId, setSelectedWardId] = useState<string>('all');

  // Admit Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitPatientId, setAdmitPatientId] = useState(mockPatients[0].id);
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState(mockDoctors[0].id);
  const [admissionReason, setAdmissionReason] = useState('');

  // Discharge Modal State
  const [dischargingAdmission, setDischargingAdmission] = useState<Admission | null>(null);
  const [dischargeSummary, setDischargeSummary] = useState('');

  // Filter beds by selected ward
  const filteredBeds = beds.filter(
    b => selectedWardId === 'all' || b.wardId === selectedWardId
  );

  const availableBedsCount = beds.filter(b => b.status === 'available').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'occupied').length;
  const cleaningBedsCount = beds.filter(b => b.status === 'cleaning').length;

  const handleOpenAdmitModal = (specificBedId?: string) => {
    if (specificBedId) {
      setAdmitBedId(specificBedId);
    } else {
      const firstAvailable = beds.find(b => b.status === 'available');
      if (firstAvailable) setAdmitBedId(firstAvailable.id);
    }
    setIsAdmitModalOpen(true);
  };

  const handleAdmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBed = beds.find(b => b.id === admitBedId);
    if (!targetBed) {
      toast.error('Please select a valid bed');
      return;
    }

    // Constraint: Prevent assigning the same bed to multiple active admissions!
    if (targetBed.status !== 'available') {
      toast.error(`Bed ${targetBed.bedNumber} is not available (Status: ${targetBed.status})`);
      return;
    }

    const patient = mockPatients.find(p => p.id === admitPatientId) || mockPatients[0];
    const doctor = mockDoctors.find(d => d.id === admitDoctorId) || mockDoctors[0];
    const newAdmCode = generateCustomId('ADM');

    const newAdmission: Admission = {
      id: `adm-${Date.now()}`,
      admissionCode: newAdmCode,
      patientId: patient.id,
      patientName: patient.fullName,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      wardId: targetBed.wardId,
      wardName: targetBed.wardName,
      admittingDoctorId: doctor.id,
      admittingDoctorName: doctor.fullName,
      admissionDate: new Date().toISOString(),
      status: 'active',
      reasonForAdmission: admissionReason || 'Inpatient clinical admission',
      createdAt: new Date().toISOString(),
    };

    // Update Bed status to Occupied
    setBeds(prev =>
      prev.map(b =>
        b.id === targetBed.id
          ? {
              ...b,
              status: 'occupied',
              currentPatientId: patient.id,
              currentPatientName: patient.fullName,
              admissionId: newAdmission.id,
            }
          : b
      )
    );

    setAdmissions([newAdmission, ...admissions]);
    setIsAdmitModalOpen(false);
    setAdmissionReason('');
    toast.success(`Patient ${patient.fullName} admitted to Bed ${targetBed.bedNumber} (Code: ${newAdmCode})`);
  };

  const handleDischargePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargingAdmission) return;

    // Update admission to discharged
    setAdmissions(prev =>
      prev.map(a =>
        a.id === dischargingAdmission.id
          ? {
              ...a,
              status: 'discharged',
              dischargeDate: new Date().toISOString(),
              dischargeSummary: dischargeSummary || 'Patient stable for outpatient recovery',
            }
          : a
      )
    );

    // Free the bed and set to cleaning
    setBeds(prev =>
      prev.map(b =>
        b.id === dischargingAdmission.bedId
          ? {
              ...b,
              status: 'cleaning',
              currentPatientId: undefined,
              currentPatientName: undefined,
              admissionId: undefined,
            }
          : b
      )
    );

    toast.success(`Patient ${dischargingAdmission.patientName} discharged. Bed ${dischargingAdmission.bedNumber} queued for sanitation.`);
    setDischargingAdmission(null);
    setDischargeSummary('');
  };

  const handleSetBedStatus = (bedId: string, status: BedStatus) => {
    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              status,
              ...(status === 'available' ? { currentPatientId: undefined, currentPatientName: undefined } : {}),
            }
          : b
      )
    );
    toast.success(`Bed status changed to ${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-sky-600" />
            Ward Occupancy & Inpatient Bed Allocation
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry of clinical wards, active admissions, room rates, and bed hygiene
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenAdmitModal()}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Admit Patient
        </Button>
      </div>

      {/* Ward Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Ward Beds</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{beds.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-emerald-600">Available Beds</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{availableBedsCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-sky-600">Occupied (Admitted)</span>
          <p className="text-2xl font-bold text-sky-600 mt-1">{occupiedBedsCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold uppercase text-amber-600">In Sanitation</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{cleaningBedsCount}</p>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedWardId('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
            selectedWardId === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Wards ({beds.length})
        </button>
        {mockWards.map(ward => (
          <button
            key={ward.id}
            onClick={() => setSelectedWardId(ward.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
              selectedWardId === ward.id
                ? 'bg-sky-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {ward.name} ({ward.dailyRate}/day)
          </button>
        ))}
      </div>

      {/* Visual Beds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map(bed => {
          const activeAdm = admissions.find(
            a => a.bedId === bed.id && a.status === 'active'
          );

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                bed.status === 'occupied'
                  ? 'bg-sky-50/70 border-sky-300 dark:bg-sky-950/30 dark:border-sky-800'
                  : bed.status === 'available'
                  ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-300'
                  : bed.status === 'cleaning'
                  ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
                  : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl text-white ${
                        bed.status === 'occupied'
                          ? 'bg-sky-600'
                          : bed.status === 'available'
                          ? 'bg-emerald-600'
                          : bed.status === 'cleaning'
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {bed.bedNumber}
                      </h3>
                      <p className="text-[11px] text-slate-500">{bed.wardName}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      bed.status === 'available'
                        ? 'success'
                        : bed.status === 'occupied'
                        ? 'primary'
                        : bed.status === 'cleaning'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {bed.status}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                  {bed.status === 'occupied' ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Admitted Patient</span>
                      <p className="font-bold text-slate-900 dark:text-white">{bed.currentPatientName}</p>
                      {activeAdm && (
                        <p className="text-[10px] text-slate-500">
                          Since: {formatDate(activeAdm.admissionDate)} • Dr. {activeAdm.admittingDoctorName}
                        </p>
                      )}
                    </div>
                  ) : bed.status === 'available' ? (
                    <div className="space-y-1 text-slate-500">
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">Ready for Admission</p>
                      <p className="text-[11px]">Rate: ${bed.dailyRate} / day</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500">
                      <p className="font-medium capitalize text-slate-700 dark:text-slate-300">
                        Sanitation in Progress
                      </p>
                      <p className="text-[11px]">Sanitize before patient check-in</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons on card */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                {bed.status === 'available' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenAdmitModal(bed.id)}
                  >
                    Admit to {bed.bedNumber}
                  </Button>
                )}

                {bed.status === 'occupied' && activeAdm && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => setDischargingAdmission(activeAdm)}
                    leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  >
                    Discharge Patient
                  </Button>
                )}

                {bed.status === 'cleaning' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSetBedStatus(bed.id, 'available')}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Mark Sanitized & Ready
                  </Button>
                )}

                {bed.status === 'maintenance' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSetBedStatus(bed.id, 'cleaning')}
                  >
                    Complete Maintenance
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admission History Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-sky-600" />
          Recent Inpatient Admission & Discharge Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3">Adm Code</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Bed & Ward</th>
                <th className="p-3">Admitting Physician</th>
                <th className="p-3">Admission Date</th>
                <th className="p-3">Discharge Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admissions.map(adm => (
                <tr key={adm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {adm.admissionCode}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {adm.patientName}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{adm.bedNumber}</span> ({adm.wardName})
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {adm.admittingDoctorName}
                  </td>
                  <td className="p-3 text-slate-500">
                    {formatDate(adm.admissionDate)}
                  </td>
                  <td className="p-3 text-slate-500">
                    {adm.dischargeDate ? formatDate(adm.dischargeDate) : 'Currently Inpatient'}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={adm.status === 'active' ? 'primary' : 'neutral'} size="sm">
                      {adm.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Patient Modal */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Admit Patient to Bed"
        subtitle="Verifies vacant bed availability and issues admission code"
        maxWidth="lg"
      >
        <form onSubmit={handleAdmitPatient} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Patient *</label>
            <select
              value={admitPatientId}
              onChange={e => setAdmitPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              {mockPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) - Blood: {p.bloodGroup}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Assign Available Bed *</label>
            <select
              value={admitBedId}
              onChange={e => setAdmitBedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              {beds
                .filter(b => b.status === 'available')
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} — {b.wardName} (${b.dailyRate}/day)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Admitting Physician *</label>
            <select
              value={admitDoctorId}
              onChange={e => setAdmitDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              {mockDoctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Clinical Admission Reason / Protocol</label>
            <textarea
              rows={2}
              value={admissionReason}
              onChange={e => setAdmissionReason(e.target.value)}
              placeholder="e.g. Acute coronary syndrome monitoring, telemetry protocol initiation"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAdmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Inpatient Admission
            </Button>
          </div>
        </form>
      </Modal>

      {/* Discharge Patient Modal */}
      {dischargingAdmission && (
        <Modal
          isOpen={!!dischargingAdmission}
          onClose={() => setDischargingAdmission(null)}
          title={`Discharge Patient — ${dischargingAdmission.patientName}`}
          subtitle={`Bed: ${dischargingAdmission.bedNumber} • Admitted: ${formatDate(dischargingAdmission.admissionDate)}`}
          maxWidth="lg"
        >
          <form onSubmit={handleDischargePatient} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1">Discharge Summary & Outpatient Instructions *</label>
              <textarea
                rows={4}
                required
                value={dischargeSummary}
                onChange={e => setDischargeSummary(e.target.value)}
                placeholder="Patient hemodynamically stable. Vitals within normal limits. Prescribed oral recovery therapy. Follow-up scheduled in 10 days."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px]">
              Upon discharge, Bed {dischargingAdmission.bedNumber} will automatically be placed into Sanitation status before another patient can be assigned.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setDischargingAdmission(null)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Execute Discharge & Free Bed
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
