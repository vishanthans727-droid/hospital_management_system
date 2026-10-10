import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import { AppLayout } from './components/layout/AppLayout';
import { RoleGuard } from './components/common/RoleGuard';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { DashboardIndex } from './pages/dashboard/DashboardIndex';
import { PatientList } from './pages/patients/PatientList';
import { StaffManagement } from './pages/doctors/StaffManagement';
import { AppointmentList } from './pages/appointments/AppointmentList';
import { EMRList } from './pages/emr/EMRList';
import { PrescriptionList } from './pages/prescriptions/PrescriptionList';
import { BedManagement } from './pages/admissions/BedManagement';
import { BillingList } from './pages/billing/BillingList';
import { LaboratoryList } from './pages/laboratory/LaboratoryList';
import { InventoryList } from './pages/pharmacy/InventoryList';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AuditLogsPage } from './pages/settings/AuditLogsPage';
import { ProfileSettings } from './pages/settings/ProfileSettings';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e293b',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '10px',
              },
            }}
          />

          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected App Routes inside AppLayout */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardIndex />} />

              <Route
                path="patients"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse', 'receptionist']}>
                    <PatientList />
                  </RoleGuard>
                }
              />

              <Route
                path="staff"
                element={
                  <RoleGuard allowedRoles={['administrator']}>
                    <StaffManagement />
                  </RoleGuard>
                }
              />

              <Route
                path="appointments"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'receptionist', 'patient']}>
                    <AppointmentList />
                  </RoleGuard>
                }
              />

              <Route
                path="emr"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse', 'patient']}>
                    <EMRList />
                  </RoleGuard>
                }
              />

              <Route
                path="prescriptions"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse', 'patient']}>
                    <PrescriptionList />
                  </RoleGuard>
                }
              />

              <Route
                path="admissions"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse', 'receptionist']}>
                    <BedManagement />
                  </RoleGuard>
                }
              />

              <Route
                path="billing"
                element={
                  <RoleGuard allowedRoles={['administrator', 'receptionist', 'patient']}>
                    <BillingList />
                  </RoleGuard>
                }
              />

              <Route
                path="laboratory"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse']}>
                    <LaboratoryList />
                  </RoleGuard>
                }
              />

              <Route
                path="pharmacy"
                element={
                  <RoleGuard allowedRoles={['administrator', 'doctor', 'nurse']}>
                    <InventoryList />
                  </RoleGuard>
                }
              />

              <Route
                path="reports"
                element={
                  <RoleGuard allowedRoles={['administrator']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="audit-logs"
                element={
                  <RoleGuard allowedRoles={['administrator']}>
                    <AuditLogsPage />
                  </RoleGuard>
                }
              />

              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
