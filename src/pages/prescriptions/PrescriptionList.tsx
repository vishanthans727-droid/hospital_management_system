import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockPrescriptions,
  mockPatients,
  mockDoctors,
} from '../../lib/mockData';
import { Prescription, PrescriptionItem } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PrintablePrescription } from '../../components/print/PrintablePrescription';
import { generateCustomId, formatDate } from '../../lib/utils';
import {
  Pill,
  PlusCircle,
  Printer,
  Trash2,
  Stethoscope,
  User,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PrescriptionList: React.FC = () => {
  const { user, role } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrintRx, setSelectedPrintRx] = useState<Prescription | null>(null);

  // New Prescription modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [patientId, setPatientId] = useState(mockPatients[0].id);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicineName: '',
      dosage: '',
      form: 'tablet',
      frequency: 'Once daily (1-0-0)',
      duration: '7 days',
      instructions: 'Take after meals with water',
    },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        medicineName: '',
        dosage: '',
        form: 'tablet',
        frequency: 'Twice daily (1-0-1)',
        duration: '5 days',
        instructions: 'After meals',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('Prescription must have at least one medication');
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof PrescriptionItem, val: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) {
      toast.error('Diagnosis is required');
      return;
    }
    if (items.some(i => !i.medicineName || !i.dosage)) {
      toast.error('Please specify medicine name and dosage for all prescribed items');
      return;
    }

    const patient = mockPatients.find(p => p.id === patientId) || mockPatients[0];
    const newRxCode = generateCustomId('RX');

    const newPrescription: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionCode: newRxCode,
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge: 42,
      patientGender: patient.gender,
      doctorId: user?.id || 'doc-01',
      doctorName: user?.fullName || 'Dr. Marcus Chen',
      doctorSpecialization: user?.departmentName || 'Cardiology',
      doctorLicense: 'MD-CARD-99218',
      date: new Date().toISOString().slice(0, 10),
      diagnosis,
      notes,
      items,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setPrescriptions([newPrescription, ...prescriptions]);
    setIsCreateOpen(false);
    setDiagnosis('');
    setNotes('');
    setItems([
      {
        id: 'item-1',
        medicineName: '',
        dosage: '',
        form: 'tablet',
        frequency: 'Once daily (1-0-0)',
        duration: '7 days',
        instructions: 'Take after meals',
      },
    ]);
    toast.success(`Prescription ${newRxCode} issued successfully for ${patient.fullName}`);
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    if (role === 'patient') {
      return rx.patientName.toLowerCase() === user?.fullName.toLowerCase() || rx.patientId === 'pat-01';
    }
    return (
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.prescriptionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-sky-600" />
            Prescriptions & Clinical Dispensary
          </h1>
          <p className="text-xs text-slate-500">
            Formulary issuance, pharmacy instructions, and printable medical Rx documentation
          </p>
        </div>

        {role !== 'patient' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Prescription (Rx)
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, Rx code, doctor..."
          />
        </div>
        <span className="text-xs text-slate-500">
          Total Issued: <span className="font-bold text-slate-800 dark:text-slate-200">{prescriptions.length}</span>
        </span>
      </div>

      {/* Prescriptions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Rx Code</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Prescribing Physician</th>
                <th className="p-3.5">Diagnosis</th>
                <th className="p-3.5">Medication Items</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPrescriptions.map(rx => (
                <tr key={rx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {rx.prescriptionCode}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {formatDate(rx.date)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {rx.patientName}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {rx.doctorName}
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-slate-600 dark:text-slate-400">
                    {rx.diagnosis}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      {rx.items.length} drug{rx.items.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge variant={rx.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {rx.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrintRx(rx)}
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                    >
                      Print Rx
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Prescription Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Clinical Prescription"
        subtitle="Associate medications, dosage frequencies, and duration with patient encounter"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block font-semibold mb-1">Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension & Hyperlipidemia"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Medicines builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Prescribed Drug Items ({items.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Another Medicine
              </Button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative"
              >
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                  <span>Medicine #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Medicine Name (e.g. Telmisartan)"
                      value={item.medicineName}
                      onChange={e => handleItemChange(item.id, 'medicineName', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Dosage (e.g. 40mg)"
                      value={item.dosage}
                      onChange={e => handleItemChange(item.id, 'dosage', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={item.form}
                      onChange={e => handleItemChange(item.id, 'form', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white capitalize"
                    >
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="syrup">Syrup</option>
                      <option value="injection">Injection</option>
                      <option value="drops">Drops / Inhaler</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 1-0-1 after food)"
                      value={item.frequency}
                      onChange={e => handleItemChange(item.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 14 days)"
                      value={item.duration}
                      onChange={e => handleItemChange(item.id, 'duration', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Special Instructions"
                      value={item.instructions}
                      onChange={e => handleItemChange(item.id, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold mb-1">Doctor Advice / Dietary Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Avoid excessive sodium intake. Report any rash or dizziness immediately."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Authorize & Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Preview Modal */}
      {selectedPrintRx && (
        <Modal
          isOpen={!!selectedPrintRx}
          onClose={() => setSelectedPrintRx(null)}
          title={`Prescription Document — ${selectedPrintRx.prescriptionCode}`}
          maxWidth="2xl"
        >
          <PrintablePrescription prescription={selectedPrintRx} />
        </Modal>
      )}
    </div>
  );
};
