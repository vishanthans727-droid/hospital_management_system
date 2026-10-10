export type UserRole = 'administrator' | 'doctor' | 'receptionist' | 'nurse' | 'patient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headDoctorId?: string;
  headDoctorName?: string;
  totalDoctors: number;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. PAT-2026-001
  fullName: string;
  email?: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies?: string[];
  chronicConditions?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  isArchived: boolean;
  admissionStatus: 'outpatient' | 'admitted' | 'discharged';
  currentBedId?: string;
  currentWard?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  doctorId: string; // DOC-2026-001
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  consultationFee: number;
  availableDays: string[]; // ['Monday', 'Tuesday', ...]
  startTime: string; // '09:00'
  endTime: string; // '17:00'
  isAvailableToday: boolean;
  activeAppointmentsCount?: number;
  avatarUrl?: string;
}

export interface Staff {
  id: string;
  userId: string;
  staffId: string; // STF-2026-001
  fullName: string;
  email: string;
  phone: string;
  role: 'nurse' | 'receptionist' | 'administrator';
  departmentId: string;
  departmentName: string;
  shift: 'morning' | 'evening' | 'night';
  joinDate: string;
  isActive: boolean;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  appointmentCode: string; // APT-2026-001
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  type: 'general' | 'follow_up' | 'emergency' | 'routine';
  notes?: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number; // Celsius
  respiratoryRate?: number;
  oxygenSaturation?: number; // %
  weightKg?: number;
  heightCm?: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  recordDate: string;
  chiefComplaint: string;
  vitals: Vitals;
  clinicalNotes: string;
  diagnosis: string;
  icdCode?: string;
  treatmentPlan: string;
  followUpDate?: string;
  allergiesObserved?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'ointment';
  frequency: string; // e.g. "Twice a day (1-0-1)"
  duration: string; // e.g. "5 days"
  instructions: string; // e.g. "After meals with water"
}

export interface Prescription {
  id: string;
  prescriptionCode: string; // RX-2026-001
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorLicense: string;
  appointmentId?: string;
  date: string;
  diagnosis: string;
  notes?: string;
  items: PrescriptionItem[];
  status: 'active' | 'dispensed' | 'expired';
  createdAt: string;
}

export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';
export type WardType = 'general' | 'icu' | 'emergency' | 'pediatric' | 'maternity' | 'surgical';

export interface Ward {
  id: string;
  name: string;
  type: WardType;
  floor: number;
  totalBeds: number;
  dailyRate: number;
}

export interface Bed {
  id: string;
  wardId: string;
  wardName: string;
  bedNumber: string; // e.g. "ICU-01", "GEN-104"
  category: WardType;
  dailyRate: number;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  admissionId?: string;
}

export interface Admission {
  id: string;
  admissionCode: string; // ADM-2026-001
  patientId: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  admittingDoctorId: string;
  admittingDoctorName: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'active' | 'discharged' | 'transferred';
  reasonForAdmission: string;
  dischargeSummary?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'consultation' | 'room' | 'laboratory' | 'pharmacy' | 'procedure' | 'other';
  unitPrice: number;
  quantity: number;
  total: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'partially_paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-001
  patientId: string;
  patientName: string;
  patientPhone?: string;
  dateIssued: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number; // e.g. 5%
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // RCT-2026-001
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'insurance' | 'online';
  transactionReference?: string;
  paymentDate: string;
  receivedBy: string;
}

export type LabStatus = 'pending' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';

export interface LabOrderItem {
  testName: string;
  category: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  status: 'pending' | 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string; // LAB-2026-001
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  orderDate: string;
  tests: LabOrderItem[];
  status: LabStatus;
  urgency: 'routine' | 'urgent' | 'emergency';
  technicianName?: string;
  completedDate?: string;
  clinicalImpression?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string; // MED-001
  name: string;
  genericName?: string;
  category: 'antibiotic' | 'analgesic' | 'cardiovascular' | 'surgical' | 'ppe' | 'vaccine' | 'other';
  currentStock: number;
  unit: string; // 'tablets', 'vials', 'boxes'
  reorderLevel: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  supplier: string;
  location: string; // 'Shelf A3'
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'addition' | 'dispensed' | 'adjustment' | 'disposed';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  date: string;
}

export interface HospitalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  targetRole?: UserRole | 'all';
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}
