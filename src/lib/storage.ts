import {
  UserProfile,
  UserRole,
  Patient,
  Doctor,
  Staff,
  Appointment,
  Prescription,
} from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

export interface RegisteredAccount extends UserProfile {
  passwordHash?: string;
  specialization?: string;
  shift?: 'morning' | 'evening' | 'night';
}

const STORAGE_KEYS = {
  USERS: 'medicare_registered_users',
  CURRENT_USER: 'medicare_current_user',
  PATIENTS: 'medicare_patients',
  DOCTORS: 'medicare_doctors',
  STAFF: 'medicare_staff',
  APPOINTMENTS: 'medicare_appointments',
  PRESCRIPTIONS: 'medicare_prescriptions',
  CLEANED_FLAG: 'medicare_demo_cleaned_v3',
};

// Clear legacy demo mock members on first load so only registered persons exist
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.CLEANED_FLAG)) {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.setItem(STORAGE_KEYS.CLEANED_FLAG, 'true');
  }
}

// In-memory references to synchronize across the app
let mockPatientsRef: Patient[] | null = null;
let mockDoctorsRef: Doctor[] | null = null;
let mockStaffRef: Staff[] | null = null;
let mockAppointmentsRef: Appointment[] | null = null;
let mockPrescriptionsRef: Prescription[] | null = null;

export function registerMockReferences(refs: {
  patients?: Patient[];
  doctors?: Doctor[];
  staff?: Staff[];
  appointments?: Appointment[];
  prescriptions?: Prescription[];
}) {
  if (refs.patients) mockPatientsRef = refs.patients;
  if (refs.doctors) mockDoctorsRef = refs.doctors;
  if (refs.staff) mockStaffRef = refs.staff;
  if (refs.appointments) mockAppointmentsRef = refs.appointments;
  if (refs.prescriptions) mockPrescriptionsRef = refs.prescriptions;
}

// ---------------- USER ACCOUNTS (REGISTRATION & AUTH) ----------------

export function getRegisteredUsers(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading registered users:', err);
  }
  return [];
}

export function saveRegisteredUsers(users: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving registered users:', err);
  }
}

export function addRegisteredAccount(account: RegisteredAccount): RegisteredAccount {
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(
    u => u.email.toLowerCase() === account.email.toLowerCase()
  );
  if (existingIndex >= 0) {
    users[existingIndex] = account;
  } else {
    users.push(account);
  }
  saveRegisteredUsers(users);
  return account;
}

export function findRegisteredUser(email: string): RegisteredAccount | undefined {
  if (!email) return undefined;
  const users = getRegisteredUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  if (!email || !newPassword) return false;
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const index = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (index >= 0) {
    users[index].passwordHash = newPassword;
    users[index].updatedAt = new Date().toISOString();
    saveRegisteredUsers(users);
    return true;
  }
  return false;
}

// ---------------- DOCTORS ----------------

// Baseline Specialist Hospital Physicians (available if no custom doctor accounts created yet)
export const defaultDoctors: Doctor[] = [
  {
    id: 'doc-01',
    userId: 'user-doc-01',
    doctorId: 'DOC-1001',
    fullName: 'Dr. Sarah Jenkins, MD',
    email: 'sarah.jenkins@medicare.hospital',
    phone: '+1 (555) 234-5671',
    departmentId: 'dept-01',
    departmentName: 'Cardiology',
    specialization: 'Interventional Cardiology',
    qualifications: 'MD, FACC, FSCAI - Johns Hopkins',
    licenseNumber: 'MD-883492',
    consultationFee: 150,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    isAvailableToday: true,
  },
  {
    id: 'doc-02',
    userId: 'user-doc-02',
    doctorId: 'DOC-1002',
    fullName: 'Dr. Marcus Vance, MD',
    email: 'marcus.vance@medicare.hospital',
    phone: '+1 (555) 234-5672',
    departmentId: 'dept-03',
    departmentName: 'Neurology',
    specialization: 'Neurological Sciences & Stroke',
    qualifications: 'MD, PhD - Harvard Medical',
    licenseNumber: 'MD-991204',
    consultationFee: 175,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    startTime: '10:00',
    endTime: '18:00',
    isAvailableToday: true,
  },
  {
    id: 'doc-03',
    userId: 'user-doc-03',
    doctorId: 'DOC-1003',
    fullName: 'Dr. Elena Rostova, MD',
    email: 'elena.rostova@medicare.hospital',
    phone: '+1 (555) 234-5673',
    departmentId: 'dept-02',
    departmentName: 'Pediatrics',
    specialization: 'Pediatric Care & Neonatology',
    qualifications: 'MD, FAAP - Stanford University',
    licenseNumber: 'MD-771120',
    consultationFee: 120,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    startTime: '08:30',
    endTime: '16:30',
    isAvailableToday: true,
  },
  {
    id: 'doc-04',
    userId: 'user-doc-04',
    doctorId: 'DOC-1004',
    fullName: 'Dr. David Kim, MD',
    email: 'david.kim@medicare.hospital',
    phone: '+1 (555) 234-5674',
    departmentId: 'dept-04',
    departmentName: 'Orthopedics & Trauma',
    specialization: 'Orthopedic Reconstruction & Sports Medicine',
    qualifications: 'MD, FAAOS - Mayo Clinic',
    licenseNumber: 'MD-662391',
    consultationFee: 160,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    isAvailableToday: true,
  },
];

export function getStoredDoctors(fallback: Doctor[] = defaultDoctors): Doctor[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading doctors from localStorage:', err);
  }
  return fallback;
}

export function saveStoredDoctors(doctors: Doctor[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  } catch (err) {
    console.error('Error saving doctors to localStorage:', err);
  }
  if (mockDoctorsRef) {
    mockDoctorsRef.length = 0;
    mockDoctorsRef.push(...doctors);
  }
  window.dispatchEvent(new CustomEvent('medicare_doctors_changed', { detail: doctors }));
}

export function addStoredDoctor(doctor: Doctor): Doctor {
  const current = getStoredDoctors();
  const exists = current.some(d => d.id === doctor.id || d.email === doctor.email);
  const updated = exists ? current.map(d => (d.id === doctor.id ? doctor : d)) : [doctor, ...current];
  saveStoredDoctors(updated);
  return doctor;
}

// ---------------- STAFF (NURSES & RECEPTIONISTS) ----------------

export function getStoredStaff(fallback: Staff[] = []): Staff[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading staff from localStorage:', err);
  }
  return fallback;
}

export function saveStoredStaff(staff: Staff[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (err) {
    console.error('Error saving staff to localStorage:', err);
  }
  if (mockStaffRef) {
    mockStaffRef.length = 0;
    mockStaffRef.push(...staff);
  }
  window.dispatchEvent(new CustomEvent('medicare_staff_changed', { detail: staff }));
}

export function addStoredStaff(staffMember: Staff): Staff {
  const current = getStoredStaff();
  const exists = current.some(s => s.id === staffMember.id || s.email === staffMember.email);
  const updated = exists ? current.map(s => (s.id === staffMember.id ? staffMember : s)) : [staffMember, ...current];
  saveStoredStaff(updated);
  return staffMember;
}

// ---------------- PATIENTS ----------------

export function getStoredPatients(fallback: Patient[] = []): Patient[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading patients from localStorage:', err);
  }
  return fallback;
}

export function saveStoredPatients(patients: Patient[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (err) {
    console.error('Error saving patients to localStorage:', err);
  }

  if (mockPatientsRef) {
    mockPatientsRef.length = 0;
    mockPatientsRef.push(...patients);
  }

  window.dispatchEvent(new CustomEvent('medicare_patients_changed', { detail: patients }));
}

export function addStoredPatient(newPatient: Patient): Patient {
  const current = getStoredPatients();
  const exists = current.some(p => p.id === newPatient.id || p.patientId === newPatient.patientId);
  const updated = exists ? current.map(p => (p.id === newPatient.id ? newPatient : p)) : [newPatient, ...current];

  saveStoredPatients(updated);

  if (isSupabaseConfigured) {
    (async () => {
      try {
        const { error } = await supabase.from('patients').upsert({
          patient_code: newPatient.patientId,
          full_name: newPatient.fullName,
          email: newPatient.email || null,
          phone: newPatient.phone,
          date_of_birth: newPatient.dateOfBirth,
          gender: newPatient.gender,
          blood_group: newPatient.bloodGroup,
          address: newPatient.address,
          emergency_contact_name: newPatient.emergencyContactName,
          emergency_contact_phone: newPatient.emergencyContactPhone,
          emergency_contact_relation: newPatient.emergencyContactRelation,
          allergies: newPatient.allergies || [],
          insurance_provider: newPatient.insuranceProvider || null,
          insurance_policy_number: newPatient.insurancePolicyNumber || null,
          is_archived: newPatient.isArchived,
          admission_status: newPatient.admissionStatus,
          created_at: newPatient.createdAt,
          updated_at: newPatient.updatedAt,
        });
        if (error) console.warn('Supabase patient sync notice:', error.message);
      } catch (err: unknown) {
        console.warn('Supabase patient sync network error:', err);
      }
    })();
  }

  return newPatient;
}

export function updateStoredPatient(updatedPatient: Patient): void {
  const current = getStoredPatients();
  const updated = current.map(p => (p.id === updatedPatient.id ? updatedPatient : p));
  saveStoredPatients(updated);

  if (isSupabaseConfigured) {
    (async () => {
      try {
        const { error } = await supabase
          .from('patients')
          .update({
            full_name: updatedPatient.fullName,
            email: updatedPatient.email || null,
            phone: updatedPatient.phone,
            date_of_birth: updatedPatient.dateOfBirth,
            gender: updatedPatient.gender,
            blood_group: updatedPatient.bloodGroup,
            address: updatedPatient.address,
            emergency_contact_name: updatedPatient.emergencyContactName,
            emergency_contact_phone: updatedPatient.emergencyContactPhone,
            emergency_contact_relation: updatedPatient.emergencyContactRelation,
            allergies: updatedPatient.allergies || [],
            insurance_provider: updatedPatient.insuranceProvider || null,
            insurance_policy_number: updatedPatient.insurancePolicyNumber || null,
            is_archived: updatedPatient.isArchived,
            admission_status: updatedPatient.admissionStatus,
            updated_at: updatedPatient.updatedAt,
          })
          .eq('patient_code', updatedPatient.patientId);
        if (error) console.warn('Supabase patient update notice:', error.message);
      } catch (err: unknown) {
        console.warn('Supabase patient update network error:', err);
      }
    })();
  }
}

export function getStoredPatientById(id: string): Patient | undefined {
  const patients = getStoredPatients();
  return patients.find(p => p.id === id || p.patientId === id);
}

export function getStoredPatientByEmail(email: string): Patient | undefined {
  if (!email) return undefined;
  const patients = getStoredPatients();
  return patients.find(p => p.email?.toLowerCase() === email.toLowerCase());
}

// ---------------- APPOINTMENTS ----------------

export function getStoredAppointments(fallback: Appointment[] = []): Appointment[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading appointments from localStorage:', err);
  }
  return fallback;
}

export function saveStoredAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  } catch (err) {
    console.error('Error saving appointments to localStorage:', err);
  }

  if (mockAppointmentsRef) {
    mockAppointmentsRef.length = 0;
    mockAppointmentsRef.push(...appointments);
  }

  window.dispatchEvent(new CustomEvent('medicare_appointments_changed', { detail: appointments }));
}

export function addStoredAppointment(newAppointment: Appointment): Appointment {
  const current = getStoredAppointments();
  const updated = [newAppointment, ...current];
  saveStoredAppointments(updated);
  return newAppointment;
}

export function updateStoredAppointment(updatedAppointment: Appointment): void {
  const current = getStoredAppointments();
  const updated = current.map(a => (a.id === updatedAppointment.id ? updatedAppointment : a));
  saveStoredAppointments(updated);
}

// ---------------- PRESCRIPTIONS ----------------

export function getStoredPrescriptions(fallback: Prescription[] = []): Prescription[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading prescriptions from localStorage:', err);
  }
  return fallback;
}

export function saveStoredPrescriptions(prescriptions: Prescription[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  } catch (err) {
    console.error('Error saving prescriptions to localStorage:', err);
  }

  if (mockPrescriptionsRef) {
    mockPrescriptionsRef.length = 0;
    mockPrescriptionsRef.push(...prescriptions);
  }

  window.dispatchEvent(new CustomEvent('medicare_prescriptions_changed', { detail: prescriptions }));
}

export function addStoredPrescription(newPrescription: Prescription): Prescription {
  const current = getStoredPrescriptions();
  const updated = [newPrescription, ...current];
  saveStoredPrescriptions(updated);
  return newPrescription;
}
