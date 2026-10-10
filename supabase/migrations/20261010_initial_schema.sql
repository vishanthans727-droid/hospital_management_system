-- ====================================================================
-- MediCare — Hospital Management System
-- Comprehensive PostgreSQL Schema Migration with Row Level Security (RLS)
-- Version: 2026-10-10_01
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role_type AS ENUM (
  'administrator',
  'doctor',
  'nurse',
  'receptionist',
  'patient'
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role_type NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  phone TEXT,
  department_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  head_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
  specialization TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  available_days TEXT[] NOT NULL DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. STAFF (Nurses, Receptionists)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  shift TEXT NOT NULL DEFAULT 'morning',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  address TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relation TEXT NOT NULL,
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  admission_status TEXT NOT NULL DEFAULT 'outpatient' CHECK (admission_status IN ('outpatient', 'admitted', 'discharged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WARDS & BEDS
CREATE TABLE IF NOT EXISTS public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  ward_type TEXT NOT NULL CHECK (ward_type IN ('icu', 'general', 'emergency', 'pediatric', 'maternity', 'surgical')),
  floor INTEGER NOT NULL DEFAULT 1,
  total_beds INTEGER NOT NULL DEFAULT 6,
  daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE CASCADE,
  bed_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
  current_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ADMISSIONS
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_code TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE RESTRICT,
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE RESTRICT,
  admitting_doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
  reason_for_admission TEXT NOT NULL,
  discharge_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Database Constraint: Prevent assigning the same bed to multiple ACTIVE admissions!
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_bed_admission
ON public.admissions (bed_id)
WHERE (status = 'active');

-- 8. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_code TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'follow_up', 'emergency', 'routine')),
  notes TEXT,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Database Constraint: Prevent double booking for the same doctor at the same date and time!
CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_slot_double_booking
ON public.appointments (doctor_id, appointment_date, appointment_time)
WHERE (status NOT IN ('cancelled'));

-- 9. ELECTRONIC MEDICAL RECORDS (EMR)
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT NOT NULL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC(4, 1),
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  weight_kg NUMERIC(5, 2),
  clinical_notes TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  icd_code TEXT,
  treatment_plan TEXT NOT NULL,
  follow_up_date DATE,
  allergies_observed TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_code TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT NOT NULL,
  doctor_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dispensed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  form TEXT NOT NULL DEFAULT 'tablet',
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT
);

-- 11. INVOICES & PAYMENTS
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'partially_paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('consultation', 'room', 'laboratory', 'pharmacy', 'procedure', 'other')),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'insurance', 'online')),
  transaction_reference TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_by TEXT NOT NULL
);

-- 12. LABORATORY ORDERS & RESULTS
CREATE TABLE IF NOT EXISTS public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sample_collected', 'in_progress', 'completed', 'cancelled')),
  technician_name TEXT,
  completed_date TIMESTAMPTZ,
  clinical_impression TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  category TEXT NOT NULL,
  result_value TEXT,
  normal_range TEXT,
  unit TEXT,
  flag TEXT NOT NULL DEFAULT 'pending' CHECK (flag IN ('pending', 'normal', 'abnormal', 'critical')),
  notes TEXT
);

-- 13. PHARMACY & INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  unit TEXT NOT NULL DEFAULT 'tablets',
  reorder_level INTEGER NOT NULL DEFAULT 20 CHECK (reorder_level >= 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  supplier TEXT NOT NULL,
  storage_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'expired')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('addition', 'dispensed', 'adjustment', 'disposed')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
  reason TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can read all profiles; users can update their own
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Patients: Clinicians and staff can view all; Patients can only view their own
CREATE POLICY "Staff can view all patients"
ON public.patients FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'doctor', 'nurse', 'receptionist')
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Staff can insert patients"
ON public.patients FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'receptionist', 'doctor')
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Staff can update patients"
ON public.patients FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'receptionist', 'doctor', 'nurse')
  )
);

-- Appointments: Users see appointments relevant to them; staff manage all
CREATE POLICY "Appointments access policy"
ON public.appointments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'doctor', 'nurse', 'receptionist')
  )
  OR EXISTS (
    SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Appointments insert policy"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Appointments update policy"
ON public.appointments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'doctor', 'receptionist')
  )
);

-- Medical Records & Prescriptions: Strictly restricted to clinicians & patient themselves
CREATE POLICY "Clinical records read policy"
ON public.medical_records FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'doctor', 'nurse')
  )
  OR EXISTS (
    SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Clinical records insert policy"
ON public.medical_records FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'doctor')
  )
);

-- Invoices & Payments: Staff can read/write; Patients can read their own
CREATE POLICY "Invoices read policy"
ON public.invoices FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('administrator', 'receptionist')
  )
  OR EXISTS (
    SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid()
  )
);

-- Audit logs: Administrator only
CREATE POLICY "Audit logs admin access only"
ON public.audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'administrator'
  )
);

CREATE POLICY "Audit logs system insert"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);
