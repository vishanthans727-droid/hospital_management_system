# MediCare — Enterprise Hospital Management System

**MediCare** is an enterprise-grade Hospital Management System (HMS) architected for modern healthcare centers, multi-specialty clinics, and regional health systems. Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and backed by **Supabase PostgreSQL** with comprehensive **Row Level Security (RLS)**.

---

## 🏥 Live Highlights & System Architecture

- **Role-Based Access Control (RBAC)**: Enforced interfaces and security policies across 5 core roles:
  1. **Administrator**: Full hospital oversight, clinical staff management, ward allocations, financial ledger, audit trails, and executive reporting.
  2. **Doctor**: Consultation queue, inpatient rounds, diagnosis/vitals entry (EMR), formulary prescription writing, and critical lab review.
  3. **Head Nurse**: Real-time ward bed monitor, bed hygiene and sanitation signoff, vitals schedule, and inpatient care roster.
  4. **Receptionist**: Patient check-in stream, appointment booking with double-booking prevention, bed vacancy counter, and counter fee collections.
  5. **Patient**: Patient health portal, personal medical history, past and upcoming visit schedules, active prescription downloads, and billing invoices.
- **Double-Booking Prevention**: Database constraint and frontend validation preventing overlapping bookings for the same doctor.
- **Inpatient & Ward Bed Safety**: Strict database uniqueness constraint preventing multiple concurrent admissions to the same bed.
- **Clinical Documents (Print Ready)**:
  - Official Outpatient Prescriptions (℞) with physician sign-off.
  - Tax-compliant Patient Invoices with line items, tax, discounts, and payment stamps.
  - Diagnostic Laboratory Pathology Reports with reference intervals and critical flags.
- **Stock Audit & Inventory**: Batch expiry tracking, minimum safety thresholds, and prevention of invalid inventory deductions.
- **HIPAA-Compliant Audit Trail**: Immutable logging of administrative actions, user roles, timestamps, and IP addresses.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with TypeScript & Vite |
| **Styling & UI** | Tailwind CSS with Dark/Light Theme Support |
| **Icons** | Lucide React |
| **Charts & Analytics** | Recharts (Area, Bar, Pie, and Line telemetry) |
| **Database & Auth** | Supabase with PostgreSQL 15 & Row Level Security |
| **Validation & Forms** | Zod & React Hook Form |
| **Alerts & Toast** | React Hot Toast |
| **Deployment Target** | Vercel / GitHub |

---

## 📁 Project Directory Structure

```
hospital_management_system/
├── dist/                              # Production build output
├── public/                            # Static assets
├── src/
│   ├── components/
│   │   ├── common/                    # Reusable UI tokens (Button, Badge, Modal, StatCard, SearchInput)
│   │   ├── layout/                    # AppLayout, Sidebar, TopNav with notification center
│   │   └── print/                     # PrintablePrescription, PrintableInvoice, PrintableLabReport
│   ├── context/
│   │   ├── AuthContext.tsx            # Supabase Auth + Demo Role Switcher + RBAC session
│   │   └── ThemeContext.tsx           # Light/Dark mode provider with persistence
│   ├── lib/
│   │   ├── mockData.ts                # HIPAA-compliant seed data mirroring PostgreSQL tables
│   │   ├── supabase.ts                # Supabase client with graceful fallback mode
│   │   └── utils.ts                   # Currency, dates, CSV export, print handlers, ID generator
│   ├── pages/
│   │   ├── admissions/                # BedManagement (Wards, visual bed cards, admit/discharge)
│   │   ├── appointments/              # AppointmentList (Conflict detection, calendar/list view)
│   │   ├── auth/                      # Login, Register (locked to patient), ForgotPassword
│   │   ├── billing/                   # BillingList (Invoice generation, tax, payment receipts)
│   │   ├── dashboard/                 # Role dashboards (Admin, Doctor, Nurse, Receptionist, Patient)
│   │   ├── doctors/                   # StaffManagement (Physicians, schedules, qualifications)
│   │   ├── emr/                       # EMRList (Clinical notes, vitals, diagnosis, ICD-10)
│   │   ├── laboratory/                # LaboratoryList (Test requisitions, results sign-off)
│   │   ├── patients/                  # PatientList (Registration, 360 profile, archive/restore)
│   │   ├── pharmacy/                  # InventoryList (Stock additions/deductions, low-stock alerts)
│   │   ├── reports/                   # ReportsPage (Financial, census, appointment CSV exports)
│   │   └── settings/                  # ProfileSettings, AuditLogsPage
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces matching database schema
│   ├── App.tsx                        # Main client router with RoleGuard
│   ├── index.css                      # Tailwind base & medical utility classes
│   └── main.tsx                       # React application entrypoint
├── supabase/
│   └── migrations/
│       └── 20261010_initial_schema.sql # Complete PostgreSQL schema, constraints & RLS policies
├── .env.example                       # Environment variables template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quickstart & Local Installation

### 1. Prerequisites
- **Node.js**: v18.x or v20.x or higher
- **npm** or **pnpm** or **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-placeholder
```
*(Note: If you run the application without connecting to Supabase immediately, MediCare operates in **Standalone Simulation Mode** with pre-populated realistic mock clinical data so you can test all features right away.)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Database Setup & Schema Deployment

1. Create a new project in [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project.
3. Open `supabase/migrations/20261010_initial_schema.sql` from this repository.
4. Copy and paste the entire script into the SQL editor and click **Run**.
5. The migration executes:
   - Creates custom `user_role_type` enum (`administrator`, `doctor`, `nurse`, `receptionist`, `patient`).
   - Creates all tables (`profiles`, `departments`, `doctors`, `staff`, `patients`, `wards`, `beds`, `admissions`, `appointments`, `medical_records`, `prescriptions`, `prescription_items`, `invoices`, `invoice_items`, `payments`, `lab_orders`, `lab_results`, `inventory_items`, `inventory_transactions`, `audit_logs`).
   - Enforces unique constraints:
     - `uq_doctor_slot_double_booking`: Prevents duplicate appointment bookings for the same doctor at the same slot.
     - `uq_active_bed_admission`: Prevents assigning an occupied bed to multiple active admissions.
     - `CHECK (current_stock >= 0)`: Prevents negative medicine inventory.
   - Enables Row Level Security (RLS) on all tables with granular role-based policies.
6. Copy your **Project URL** and **Anon Public Key** from **Project Settings > API** into your `.env` file.

---

## 🧪 Testing Role-Based Features

You can test every role instantly using the **Quick Role Selector** on the Login page or in the Sidebar:

### 1. Administrator (`Dr. Eleanor Vance`)
- Navigate to the **Admin Dashboard**: View total registered patients, bed allocations, financial summaries, and Recharts graphs.
- Go to **Doctors & Staff**: Add new doctor profiles, assign specialties and consultation fees.
- Go to **Audit Trail**: Inspect system logs with timestamps and IP records.
- Go to **Reports**: Filter by date range and click **Export CSV**.

### 2. Doctor (`Dr. Marcus Chen`)
- Navigate to **Doctor Dashboard**: View scheduled appointments and hospitalized inpatient rounds.
- Go to **Medical Records**: Document patient consultation notes with vital signs telemetry and ICD-10 diagnosis.
- Go to **Prescriptions**: Prescribe multiple drugs with dosages, duration, and instructions; click **Print Rx**.
- Go to **Laboratory**: Review critical pathology markers and enter lab findings.

### 3. Head Nurse (`Emily Rodriguez, RN`)
- Navigate to **Nurse Dashboard**: Inspect ward beds (ICU, General Ward A, General Ward B).
- Click **Sanitize** or **Mark Ready** on beds to toggle hygiene states.
- View upcoming inpatient vitals administration roster.

### 4. Receptionist (`James Wilson`)
- Navigate to **Receptionist Dashboard**: View live arrival stream.
- Click **Check In** to verify patient arrival.
- Go to **Appointments**: Book an appointment. Verify that selecting an already-booked slot displays the conflict warning.
- Go to **Billing**: Click **Collect** on pending invoices to record cash/card payment and generate a receipt.

### 5. Patient (`Arthur Pendelton`)
- Navigate to **Patient Portal**: Review personal health records, blood group, recorded allergies.
- View and print issued prescriptions and invoices.
- Notice that entering admin or staff URLs directly redirects with the **Access Restricted** security screen.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete MediCare Hospital Management System"
   git branch -M main
   git remote add origin https://github.com/your-username/medicare.git
   git push -u origin main
   ```
2. In [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** and select your repository.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
3. Click **Deploy**.

---

## ✅ Feature Implementation Checklist

- [x] **Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + Supabase
- [x] **Role-Based Access Control**: 5 distinct roles with strict permission guards and direct URL block
- [x] **Admin Dashboard**: Real calculated stats, revenue, bed occupancy pie chart, admission trends
- [x] **Patient Management**: Register, unique ID generation (PAT-2026-XXXX), 360 profile, archive/restore, CSV export
- [x] **Doctor & Staff Management**: Profile creation, departments, schedules, fee structure, availability toggle
- [x] **Appointment Management**: Double-booking prevention, calendar/list view, rescheduling, status tracking
- [x] **Electronic Medical Records**: Vitals recording (BP, HR, SpO2, Temp), diagnosis, ICD-10, treatment plan
- [x] **Prescription Management**: Multi-item drug builder, dosage, frequency, printable Rx document
- [x] **Admission & Bed Management**: Ward allocation grid, double-bed assignment prevention, discharge workflow
- [x] **Billing & Collections**: Line items, 5% tax, discounts, payment collection, printable invoices & receipts
- [x] **Laboratory Management**: Test requisitions, reference intervals, critical alerts, printable pathology report
- [x] **Pharmacy & Inventory**: Medicine stock tracking, batch numbers, expiry dates, invalid deduction prevention
- [x] **Reports & Exports**: Date-range filtering, CSV export, printable reports, analytics charts
- [x] **Database & Security**: 20261010 migration SQL with RLS policies, PostgreSQL constraints, and `.env.example`
