import {
  UserProfile,
  Department,
  Patient,
  Doctor,
  Staff,
  Appointment,
  MedicalRecord,
  Prescription,
  Ward,
  Bed,
  Admission,
  Invoice,
  Payment,
  LabOrder,
  InventoryItem,
  HospitalNotification,
  AuditLog,
} from '../types';
import {
  getStoredPatients,
  getStoredDoctors,
  getStoredStaff,
  getStoredAppointments,
  getStoredPrescriptions,
  registerMockReferences,
  defaultDoctors,
} from './storage';

// Hospital Departments Infrastructure
export const mockDepartments: Department[] = [
  {
    id: 'dept-01',
    name: 'Cardiology',
    code: 'CARD',
    description: 'Comprehensive adult & pediatric cardiovascular diagnostics, interventions, and surgery',
    totalDoctors: 0,
  },
  {
    id: 'dept-02',
    name: 'Pediatrics',
    code: 'PED',
    description: 'Neonatology, adolescent health, pediatric pulmonary, and acute pediatric care',
    totalDoctors: 0,
  },
  {
    id: 'dept-03',
    name: 'Neurology',
    code: 'NEUR',
    description: 'Stroke care, neurophysiology, epilepsy center, and acute neurological stabilization',
    totalDoctors: 0,
  },
  {
    id: 'dept-04',
    name: 'Orthopedics & Trauma',
    code: 'ORTH',
    description: 'Joint replacement, orthopedic surgery, sports medicine, and emergency trauma triage',
    totalDoctors: 0,
  },
  {
    id: 'dept-05',
    name: 'Emergency Medicine',
    code: 'EMER',
    description: 'Level 1 emergency trauma care, acute resuscitations, and rapid triage bay',
    totalDoctors: 0,
  },
  {
    id: 'dept-06',
    name: 'Oncology',
    code: 'ONCO',
    description: 'Hematology-oncology infusions, targeted therapies, and patient palliative care',
    totalDoctors: 0,
  },
];

// Registered users and active medical roster
export const mockUsers: UserProfile[] = [];
export const mockDoctors: Doctor[] = getStoredDoctors(defaultDoctors);
export const mockStaff: Staff[] = getStoredStaff([]);
export const mockPatients: Patient[] = getStoredPatients([]);
export const mockAppointments: Appointment[] = getStoredAppointments([]);
export const mockPrescriptions: Prescription[] = getStoredPrescriptions([]);
export const mockMedicalRecords: MedicalRecord[] = [];
export const mockAdmissions: Admission[] = [];
export const mockInvoices: Invoice[] = [];
export const mockPayments: Payment[] = [];
export const mockLabOrders: LabOrder[] = [];
export const mockNotifications: HospitalNotification[] = [];
export const mockAuditLogs: AuditLog[] = [];

// Hospital Infrastructure Wards
export const mockWards: Ward[] = [
  { id: 'ward-01', name: 'Intensive Care Unit (ICU)', type: 'icu', floor: 3, totalBeds: 4, dailyRate: 650 },
  { id: 'ward-02', name: 'General Ward A', type: 'general', floor: 2, totalBeds: 6, dailyRate: 200 },
  { id: 'ward-03', name: 'General Ward B', type: 'general', floor: 2, totalBeds: 6, dailyRate: 200 },
  { id: 'ward-04', name: 'Pediatric Care Ward', type: 'pediatric', floor: 4, totalBeds: 4, dailyRate: 250 },
  { id: 'ward-05', name: 'Emergency Observation', type: 'emergency', floor: 1, totalBeds: 4, dailyRate: 350 },
];

// Hospital Hospital Bed Registry (all available for newly admitted registered patients)
export const mockBeds: Bed[] = [
  { id: 'bed-01', wardId: 'ward-01', wardName: 'ICU', bedNumber: 'ICU-01', category: 'icu', dailyRate: 650, status: 'available' },
  { id: 'bed-02', wardId: 'ward-01', wardName: 'ICU', bedNumber: 'ICU-02', category: 'icu', dailyRate: 650, status: 'available' },
  { id: 'bed-03', wardId: 'ward-01', wardName: 'ICU', bedNumber: 'ICU-03', category: 'icu', dailyRate: 650, status: 'available' },
  { id: 'bed-04', wardId: 'ward-01', wardName: 'ICU', bedNumber: 'ICU-04', category: 'icu', dailyRate: 650, status: 'available' },
  { id: 'bed-05', wardId: 'ward-02', wardName: 'General Ward A', bedNumber: 'GWA-101', category: 'general', dailyRate: 200, status: 'available' },
  { id: 'bed-06', wardId: 'ward-02', wardName: 'General Ward A', bedNumber: 'GWA-102', category: 'general', dailyRate: 200, status: 'available' },
  { id: 'bed-07', wardId: 'ward-03', wardName: 'General Ward B', bedNumber: 'GWB-201', category: 'general', dailyRate: 200, status: 'available' },
  { id: 'bed-08', wardId: 'ward-03', wardName: 'General Ward B', bedNumber: 'GWB-202', category: 'general', dailyRate: 200, status: 'available' },
  { id: 'bed-09', wardId: 'ward-04', wardName: 'Pediatric Care Ward', bedNumber: 'PED-301', category: 'pediatric', dailyRate: 250, status: 'available' },
  { id: 'bed-10', wardId: 'ward-04', wardName: 'Pediatric Care Ward', bedNumber: 'PED-302', category: 'pediatric', dailyRate: 250, status: 'available' },
  { id: 'bed-11', wardId: 'ward-05', wardName: 'Emergency Observation', bedNumber: 'EMR-01', category: 'emergency', dailyRate: 350, status: 'available' },
  { id: 'bed-12', wardId: 'ward-05', wardName: 'Emergency Observation', bedNumber: 'EMR-02', category: 'emergency', dailyRate: 350, status: 'available' },
];

// Pharmacy Catalog
export const mockInventory: InventoryItem[] = [
  {
    id: 'med-01',
    itemCode: 'MED-1001',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'antibiotic',
    currentStock: 420,
    reorderLevel: 100,
    unitPrice: 0.85,
    unit: 'capsule',
    expiryDate: '2027-11-30',
    batchNumber: 'AMX-2026-90',
    location: 'Aisle 2, Bin 14',
    supplier: 'PharmaCore Labs',
    status: 'in_stock',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-02',
    itemCode: 'MED-1002',
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'cardiovascular',
    currentStock: 650,
    reorderLevel: 150,
    unitPrice: 1.1,
    unit: 'tablet',
    expiryDate: '2028-02-15',
    batchNumber: 'ATV-2026-12',
    location: 'Aisle 1, Bin 04',
    supplier: 'CardioPharm Global',
    status: 'in_stock',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-03',
    itemCode: 'MED-1003',
    name: 'Paracetamol 500mg (Acetaminophen)',
    genericName: 'Paracetamol',
    category: 'analgesic',
    currentStock: 1200,
    reorderLevel: 250,
    unitPrice: 0.15,
    unit: 'tablet',
    expiryDate: '2028-05-10',
    batchNumber: 'PCM-2026-44',
    location: 'Aisle 1, Bin 01',
    supplier: 'Apex Pharmaceuticals',
    status: 'in_stock',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-04',
    itemCode: 'MED-1004',
    name: 'Surgical Gauze Pads 4x4',
    genericName: 'Sterile Gauze',
    category: 'surgical',
    currentStock: 85,
    reorderLevel: 60,
    unitPrice: 4.5,
    unit: 'box',
    expiryDate: '2027-08-20',
    batchNumber: 'SG-2026-03',
    location: 'Aisle 3, Bin 08',
    supplier: 'SurgiTech Supplies',
    status: 'in_stock',
    updatedAt: new Date().toISOString(),
  },
];

registerMockReferences({
  patients: mockPatients,
  doctors: mockDoctors,
  staff: mockStaff,
  appointments: mockAppointments,
  prescriptions: mockPrescriptions,
});
