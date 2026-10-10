import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockMedicalRecords,
  mockPatients,
  mockDoctors,
} from '../../lib/mockData';
import { MedicalRecord } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../lib/utils';
import {
  FileText,
  PlusCircle,
  Activity,
  Heart,
  Thermometer,
  Shield,
  Clock,
  Eye,
  AlertTriangle,
  User,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EMRList: React.FC = () => {
  const { user, role } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>(mockMedicalRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // New EMR record modal
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [patientId, setPatientId] = useState(mockPatients[0].id);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-11-10');

  // Vitals
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [temp, setTemp] = useState<number>(36.6);
  const [spo2, setSpo2] = useState<number>(99);
  const [respRate, setRespRate] = useState<number>(16);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint || !diagnosis) {
      toast.error('Chief complaint and diagnosis are required');
      return;
    }

    const patient = mockPatients.find(p => p.id === patientId) || mockPatients[0];
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: user?.id || 'usr-doc-01',
      doctorName: user?.fullName || 'Dr. Marcus Chen',
      recordDate: new Date().toISOString().slice(0, 10),
      chiefComplaint,
      vitals: {
        bloodPressureSystolic: Number(systolic),
        bloodPressureDiastolic: Number(diastolic),
        heartRate: Number(heartRate),
        temperature: Number(temp),
        respiratoryRate: Number(respRate),
        oxygenSaturation: Number(spo2),
      },
      clinicalNotes,
      diagnosis,
      icdCode: icdCode || 'R69 (Unspecified illness)',
      treatmentPlan,
      followUpDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords([newRecord, ...records]);
    setIsNewRecordOpen(false);
    // Reset form
    setChiefComplaint('');
    setClinicalNotes('');
    setDiagnosis('');
    setTreatmentPlan('');
    toast.success(`Clinical consultation notes saved for ${patient.fullName}`);
  };

  const filteredRecords = records.filter(rec => {
    if (role === 'patient') {
      return rec.patientName.toLowerCase() === user?.fullName.toLowerCase() || rec.patientId === 'pat-01';
    }
    return (
      rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Electronic Medical Records (EMR)
          </h1>
          <p className="text-xs text-slate-500">
            Confidential clinical notes, vital signs telemetry, diagnosis, and treatment pathways
          </p>
        </div>

        {role !== 'patient' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewRecordOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Record Clinical Consultation
          </Button>
        )}
      </div>

      {/* Filter / Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, diagnosis, doctor..."
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Audit Logging Active</span>
        </div>
      </div>

      {/* EMR Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Record Date</th>
                <th className="p-3.5">Patient Profile</th>
                <th className="p-3.5">Attending Physician</th>
                <th className="p-3.5">Clinical Diagnosis</th>
                <th className="p-3.5">Key Vitals</th>
                <th className="p-3.5">ICD-10 Code</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-500 font-medium">
                    {formatDate(rec.recordDate)}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {rec.patientName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {rec.patientId}
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {rec.doctorName}
                  </td>
                  <td className="p-3.5 max-w-xs font-semibold text-sky-800 dark:text-sky-300">
                    {rec.diagnosis}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      <span>BP {rec.vitals.bloodPressureSystolic}/{rec.vitals.bloodPressureDiastolic}</span>
                      <span>•</span>
                      <span>HR {rec.vitals.heartRate}</span>
                      <span>•</span>
                      <span>SpO2 {rec.vitals.oxygenSaturation}%</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {rec.icdCode || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRecord(rec)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Notes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Medical Record Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Clinical Encounter Note — ${selectedRecord.patientName}`}
          subtitle={`Date: ${formatDate(selectedRecord.recordDate)} • Documented by ${selectedRecord.doctorName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            {/* Vitals Grid */}
            <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
              <h4 className="font-bold text-sky-900 dark:text-sky-200 mb-2 flex items-center gap-1">
                <Activity className="w-4 h-4 text-sky-600" /> Recorded Vital Signs
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Blood Pressure</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.bloodPressureSystolic}/{selectedRecord.vitals.bloodPressureDiastolic}
                  </p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Heart Rate</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.heartRate} bpm
                  </p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Temperature</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.temperature} °C
                  </p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">SpO2 Oxygen</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.oxygenSaturation}%
                  </p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Resp. Rate</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.respiratoryRate}/min
                  </p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Weight</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.vitals.weightKg || 78} kg
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 dark:text-white">Chief Complaint:</span>
              <p className="mt-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                {selectedRecord.chiefComplaint}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 dark:text-white">Physician Clinical Findings:</span>
              <p className="mt-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 leading-relaxed">
                {selectedRecord.clinicalNotes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Diagnosis & Classification:</span>
                <p className="mt-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-semibold text-sky-800 dark:text-sky-300">
                  {selectedRecord.diagnosis} ({selectedRecord.icdCode})
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Recommended Follow-Up:</span>
                <p className="mt-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  {selectedRecord.followUpDate ? formatDate(selectedRecord.followUpDate) : 'PRN (As needed)'}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 dark:text-white">Treatment Plan & Orders:</span>
              <p className="mt-1 p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 leading-relaxed">
                {selectedRecord.treatmentPlan}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
              <span>Author: {selectedRecord.doctorName} • Last updated: {new Date(selectedRecord.updatedAt).toLocaleString()}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Consultation Modal */}
      <Modal
        isOpen={isNewRecordOpen}
        onClose={() => setIsNewRecordOpen(false)}
        title="Record Clinical Consultation & Vitals"
        subtitle="Document encounter notes, ICD-10 diagnosis, and therapeutic regimen"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Patient *</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            >
              {mockPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          {/* Vitals Input Row */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Encounter Vital Signs</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Systolic BP</label>
                <input
                  type="number"
                  value={systolic}
                  onChange={e => setSystolic(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Diastolic BP</label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={e => setDiastolic(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={e => setHeartRate(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={e => setTemp(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={e => setSpo2(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Resp Rate</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={e => setRespRate(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Chief Complaint *</label>
            <input
              type="text"
              required
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              placeholder="e.g. Mild shortness of breath upon exertion and morning dizziness"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Primary Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential primary hypertension"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">ICD-10 Code</label>
              <input
                type="text"
                value={icdCode}
                onChange={e => setIcdCode(e.target.value)}
                placeholder="I10"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Clinical Observation Notes</label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={e => setClinicalNotes(e.target.value)}
              placeholder="Detailed physical examination, auscultation, telemetry observations..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Treatment Plan & Clinical Directives</label>
            <textarea
              rows={2}
              value={treatmentPlan}
              onChange={e => setTreatmentPlan(e.target.value)}
              placeholder="Medication adjustments, dietary guidelines, scheduled labs..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsNewRecordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Medical Encounter Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
