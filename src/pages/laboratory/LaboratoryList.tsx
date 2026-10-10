import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  mockLabOrders,
  mockPatients,
  mockDoctors,
} from '../../lib/mockData';
import { LabOrder, LabOrderItem, LabStatus } from '../../types';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PrintableLabReport } from '../../components/print/PrintableLabReport';
import { generateCustomId, formatDate } from '../../lib/utils';
import {
  FlaskConical,
  PlusCircle,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LaboratoryList: React.FC = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<LabOrder[]>(mockLabOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedPrintReport, setSelectedPrintReport] = useState<LabOrder | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);

  // New Order Form
  const [patientId, setPatientId] = useState(mockPatients[0].id);
  const [doctorId, setDoctorId] = useState(mockDoctors[0].id);
  const [urgency, setUrgency] = useState<LabOrder['urgency']>('routine');
  const [testItems, setTestItems] = useState<LabOrderItem[]>([
    {
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      normalRange: 'Reference Range Verified',
      unit: '',
      status: 'pending',
    },
  ]);

  // Enter results form
  const [resultsList, setResultsList] = useState<LabOrderItem[]>([]);
  const [clinicalImpression, setClinicalImpression] = useState('');

  const handleAddTestItem = () => {
    setTestItems([
      ...testItems,
      {
        testName: '',
        category: 'Biochemistry',
        normalRange: '',
        unit: '',
        status: 'pending',
      },
    ]);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (testItems.some(t => !t.testName)) {
      toast.error('Please specify test names for all investigation items');
      return;
    }

    const patient = mockPatients.find(p => p.id === patientId) || mockPatients[0];
    const doctor = mockDoctors.find(d => d.id === doctorId) || mockDoctors[0];
    const newOrderNum = generateCustomId('LAB');

    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: newOrderNum,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      orderDate: new Date().toISOString().slice(0, 10),
      tests: testItems,
      status: 'pending',
      urgency,
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setIsNewOrderOpen(false);
    toast.success(`Lab order ${newOrderNum} created for ${patient.fullName}`);
  };

  const handleOpenResults = (order: LabOrder) => {
    setEditingOrder(order);
    setResultsList(order.tests.map(t => ({ ...t })));
    setClinicalImpression(order.clinicalImpression || '');
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setOrders(prev =>
      prev.map(o =>
        o.id === editingOrder.id
          ? {
              ...o,
              tests: resultsList,
              clinicalImpression,
              status: 'completed',
              completedDate: new Date().toISOString(),
              technicianName: user?.fullName || 'Certified Medical Technologist',
            }
          : o
      )
    );

    toast.success(`Diagnostic results recorded and verified for Order ${editingOrder.orderNumber}`);
    setEditingOrder(null);
  };

  const updateOrderStatus = (orderId: string, status: LabStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    toast.success(`Lab order status updated to ${status}`);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-sky-600" />
            Clinical Pathology & Diagnostic Laboratory
          </h1>
          <p className="text-xs text-slate-500">
            Automated test requisition, result verification, reference intervals, and printable reports
          </p>
        </div>

        {role !== 'patient' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewOrderOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Lab Order
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by patient, order #, doctor..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sample_collected">Sample Collected</option>
          <option value="in_progress">In Analysis</option>
          <option value="completed">Completed / Signed Off</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Referring Physician</th>
                <th className="p-3.5">Ordered Tests</th>
                <th className="p-3.5 text-center">Urgency</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {order.orderNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {order.patientName}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {order.doctorName}
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {order.tests.map(t => t.testName).join(', ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        order.urgency === 'emergency'
                          ? 'danger'
                          : order.urgency === 'urgent'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {order.urgency}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        order.status === 'completed'
                          ? 'success'
                          : order.status === 'in_progress'
                          ? 'primary'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {order.status !== 'completed' && role !== 'patient' && (
                        <button
                          onClick={() => handleOpenResults(order)}
                          className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold"
                        >
                          Enter Results
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPrintReport(order)}
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                      >
                        Report
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lab Order Modal */}
      <Modal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        title="Requisition Laboratory Investigation"
        subtitle="Specify required diagnostic test panels and priority"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
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
              <label className="block font-semibold mb-1">Ordering Physician *</label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                {mockDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Requisition Urgency</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white capitalize"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent Priority</option>
              <option value="emergency">STAT / Emergency Resuscitation</option>
            </select>
          </div>

          {/* Test items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">Investigation Tests</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTestItem}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Another Test
              </Button>
            </div>

            {testItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Test Name (e.g. High-Sensitivity Troponin I)"
                    value={item.testName}
                    onChange={e => {
                      const updated = [...testItems];
                      updated[idx].testName = e.target.value;
                      setTestItems(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={item.category}
                    onChange={e => {
                      const updated = [...testItems];
                      updated[idx].category = e.target.value;
                      setTestItems(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Cardiology Marker">Cardiology Marker</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Renal">Renal Panel</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsNewOrderOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Test Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Results Modal */}
      {editingOrder && (
        <Modal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title={`Enter Diagnostic Results — ${editingOrder.orderNumber}`}
          subtitle={`Patient: ${editingOrder.patientName} • Ordered by ${editingOrder.doctorName}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
            <div className="space-y-3">
              {resultsList.map((test, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                    <span>{test.testName} ({test.category})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Observed Value</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 0.082"
                        value={test.resultValue || ''}
                        onChange={e => {
                          const updated = [...resultsList];
                          updated[idx].resultValue = e.target.value;
                          setResultsList(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Unit</label>
                      <input
                        type="text"
                        placeholder="ng/mL, mg/dL"
                        value={test.unit || ''}
                        onChange={e => {
                          const updated = [...resultsList];
                          updated[idx].unit = e.target.value;
                          setResultsList(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Normal Range</label>
                      <input
                        type="text"
                        placeholder="< 0.034"
                        value={test.normalRange || ''}
                        onChange={e => {
                          const updated = [...resultsList];
                          updated[idx].normalRange = e.target.value;
                          setResultsList(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Clinical Flag</label>
                      <select
                        value={test.status}
                        onChange={e => {
                          const updated = [...resultsList];
                          updated[idx].status = e.target.value as any;
                          setResultsList(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-semibold capitalize"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-semibold mb-1">Pathologist Impression & Diagnostic Commentary</label>
              <textarea
                rows={2}
                value={clinicalImpression}
                onChange={e => setClinicalImpression(e.target.value)}
                placeholder="Findings verified with automated analyzer QC. Correlate with clinical state."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setEditingOrder(null)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Validate & Sign Off Results
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Report Modal */}
      {selectedPrintReport && (
        <Modal
          isOpen={!!selectedPrintReport}
          onClose={() => setSelectedPrintReport(null)}
          title={`Diagnostic Lab Report — ${selectedPrintReport.orderNumber}`}
          maxWidth="2xl"
        >
          <PrintableLabReport order={selectedPrintReport} />
        </Modal>
      )}
    </div>
  );
};
